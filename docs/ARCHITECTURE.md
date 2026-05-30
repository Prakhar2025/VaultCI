# VaultCI — Architecture Document

> AI Trust Layer for Agentic Coding Pipelines  
> Qdrant "Think Outside the Bot" Hackathon | June 2026

---

## 1. System Overview

VaultCI is a verification middleware that intercepts AI-generated pull requests before they merge. It builds a persistent architectural memory using Qdrant vector collections — storing every architectural decision, rejected pattern, and code snippet as a searchable vector embedding. On each new PR, VaultCI performs 5-layer verification and emits a Trust Score (0.0–1.0) with a gate decision.

---

## 2. Component Architecture

### Component 1 — GitHub Webhook Receiver

**File:** `backend/app/webhook/router.py`  
**Responsibilities:**
- Listen for `pull_request` events (`opened`, `synchronize`)
- Validate `X-Hub-Signature-256` HMAC header
- Extract PR diff, file list, commit messages, author metadata
- Detect AI origin: check for Codex commit signatures, `co-authored-by` tags, statistical fingerprinting (entropy analysis, comment density)
- Enqueue async analysis job via `asyncio` background tasks
- Return `{ job_id, status: "queued" }` immediately (non-blocking)

### Component 2 — AST Parser & Security Analyzer

**File:** `backend/app/analyzer/ast_parser.py`, `backend/app/analyzer/security.py`  
**Responsibilities:**
- Parse every changed file into AST nodes using `tree-sitter`
- Run security pattern matcher for: SQL injection, auth bypass, hardcoded secrets, insecure `random`, `eval` usage, unsafe deserialization
- Compute file-level risk score `R(f)` ∈ [0, 1]
- Query OSV API for CVEs introduced by new dependencies in the diff
- Return per-file risk map and aggregate security score

### Component 3 — Qdrant Memory Engine

**File:** `backend/app/memory/qdrant_client.py`, `backend/app/memory/memory_engine.py`  
**Responsibilities:**
- Maintain 3 Qdrant collections: `architectural_decisions`, `rejected_patterns`, `code_snippets`
- On new PR: embed relevant code context with `sentence-transformers/all-MiniLM-L6-v2`
- Query `architectural_decisions` for top-5 semantically similar past decisions (contradiction detection)
- Query `rejected_patterns` for top-5 matches against changed code
- After review completes: upsert new decision vectors to memory
- Filter all queries by `repo_id` payload field for isolation between repositories

### Component 4 — Dependency Graph Engine

**File:** `backend/app/graph/dependency.py`  
**Responsibilities:**
- Maintain a `NetworkX` directed graph of module/import dependencies per repo
- On each PR: parse changed files for import statements; update graph
- Calculate betweenness centrality for all changed files
- Compute blast radius: total count of downstream modules affected
- Output `D(f)` — Dependency Impact score per file (normalized)

### Component 5 — Groq LLM Reasoning Layer

**File:** `backend/app/llm/groq_reasoner.py`  
**Responsibilities:**
- Send PR diff + architectural context + contradiction candidates to Groq (`llama-3.3-70b-versatile`)
- Prompt: "Does this code contradict these architectural rules? Return structured JSON."
- Parse Groq response into structured contradiction report
- Generate human-readable explanation of each flag for the PR comment
- Fallback: if Groq unavailable, use deterministic-only scores (graceful degradation)

### Component 6 — Trust Score Aggregator

**File:** `backend/app/scoring/aggregator.py`  
**Responsibilities:**
- Combine outputs from all 5 layers into composite Trust Score
- Apply configurable per-repository threshold overrides
- Return structured JSON report with per-layer breakdown and gate decision

### Component 7 — GitHub PR Comment Reporter

**File:** `backend/app/reporter/github_reporter.py`  
**Responsibilities:**
- Post structured Markdown comment to the PR with: Trust Score, gate badge, per-file risk map, contradiction details, Groq explanation
- Set GitHub commit status check (`success` / `failure`) for CI gate integration
- Optionally request reviewers based on who authored the contradicted past decisions (via GitHub API)

### Component 8 — Next.js Dashboard

**Directory:** `frontend/`  
**Responsibilities:**
- Real-time PR feed with Trust Score badges and animated score rings
- Memory Explorer: semantic search UI (`"Why did we stop using direct SQL?"`)
- Per-repo analytics: AI vs human PR trends, trust score distribution
- PR Detail page: per-layer breakdown, file risk heatmap, contradiction timeline
- Setup/Onboarding: connect GitHub repo, configure thresholds

---

## 3. Qdrant Collections Schema

### 3.1 `architectural_decisions`

```
Collection: architectural_decisions
Vector size: 384
Distance: Cosine
Embedding model: sentence-transformers/all-MiniLM-L6-v2

Payload fields:
  repo_id       : str   — "owner/repo" GitHub identifier
  pr_number     : int   — PR where decision was extracted
  decision_text : str   — Full text of the architectural decision
  decision_type : str   — PATTERN_ADOPTED | PATTERN_REJECTED | ARCH_RULE
  author        : str   — GitHub username who made the decision
  created_at    : str   — ISO 8601 timestamp
  tags          : list  — ["security", "performance", "architecture", ...]
  code_context  : str   — Relevant code snippet (optional)
```

### 3.2 `rejected_patterns`

```
Collection: rejected_patterns
Vector size: 384
Distance: Cosine
Embedding model: sentence-transformers/all-MiniLM-L6-v2

Payload fields:
  repo_id          : str  — "owner/repo" GitHub identifier
  pattern_name     : str  — Human-readable name ("Direct SQL Query")
  rejection_reason : str  — Why it was rejected
  rejected_in_pr   : int  — PR number where rejection occurred
  rejected_by      : str  — GitHub username who rejected it
  created_at       : str  — ISO 8601 timestamp
```

### 3.3 `code_snippets`

```
Collection: code_snippets
Vector size: 384
Distance: Cosine
Embedding model: sentence-transformers/all-MiniLM-L6-v2

Payload fields:
  repo_id       : str  — "owner/repo" GitHub identifier
  file_path     : str  — Relative path in the repo
  function_name : str  — Function or class name
  snippet       : str  — The code snippet text
  language      : str  — "python" | "typescript" | "javascript" | ...
  created_at    : str  — ISO 8601 timestamp
```

---

## 4. PostgreSQL Database Schema

PostgreSQL stores structured, relational data. Qdrant handles all vector/semantic operations.

### Table: `pr_trust_reports`

```sql
CREATE TABLE pr_trust_reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id         VARCHAR(255) NOT NULL,
    pr_number       INTEGER NOT NULL,
    is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    trust_score     FLOAT NOT NULL,
    gate_decision   VARCHAR(20) NOT NULL,  -- TRUSTED | REVIEW | CAUTION | BLOCK
    security_score  FLOAT,
    arch_score      FLOAT,
    blast_score     FLOAT,
    rejected_score  FLOAT,
    ai_penalty      FLOAT,
    report_json     JSONB,  -- Full detailed per-layer report
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(repo_id, pr_number)
);
```

### Table: `repositories`

```sql
CREATE TABLE repositories (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id             VARCHAR(255) UNIQUE NOT NULL,  -- "owner/repo"
    github_token        TEXT,
    webhook_secret      TEXT,
    security_threshold  FLOAT DEFAULT 0.85,
    arch_threshold      FLOAT DEFAULT 0.65,
    blast_threshold     INTEGER DEFAULT 20,
    created_at          TIMESTAMP DEFAULT NOW()
);
```

### Table: `dependency_graph_snapshots`

```sql
CREATE TABLE dependency_graph_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id         VARCHAR(255) NOT NULL,
    snapshot_date   DATE NOT NULL,
    graph_json      JSONB NOT NULL,   -- NetworkX serialized graph
    centrality_map  JSONB NOT NULL,   -- file_path -> betweenness_centrality
    created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## 5. API Contracts

### `POST /webhook/github`

**Headers:**
```
X-GitHub-Event: pull_request
X-Hub-Signature-256: sha256=<hmac>
```

**Response 200:**
```json
{ "job_id": "uuid", "status": "queued" }
```

---

### `GET /report/{repo_owner}/{repo_name}/{pr_number}`

**Response 200:**
```json
{
  "pr_number": 47,
  "is_ai_generated": true,
  "trust_score": 0.42,
  "gate_decision": "CAUTION",
  "layers": {
    "security": { "score": 0.61, "flags": [{"file": "auth/middleware.py", "issue": "auth_bypass", "severity": "HIGH"}] },
    "architectural": { "score": 0.28, "contradictions": [{"decision": "No direct SQL", "pr": 312, "similarity": 0.94}] },
    "blast_radius": { "score": 0.55, "affected_count": 14, "high_centrality_files": ["utils/db.py"] },
    "rejected_patterns": { "score": 0.80, "matches": [] },
    "ai_origin": { "is_ai": true, "confidence": 0.92, "signals": ["codex-commit-sig"] }
  },
  "file_map": [{"file": "auth/middleware.py", "risk": "HIGH"}],
  "explanation": "This PR introduces a direct database query pattern that contradicts the repository rule established in PR #312...",
  "created_at": "2026-05-28T14:22:00Z"
}
```

---

### `POST /memory/query`

**Request:**
```json
{ "repo_id": "owner/repo", "query": "why did we stop using direct SQL queries", "limit": 5 }
```

**Response 200:**
```json
{
  "results": [
    { "decision": "Direct SQL queries banned after PR #312 SQL injection incident", "pr_number": 312, "date": "2025-11-14", "relevance_score": 0.94, "author": "alice" }
  ]
}
```

---

### `POST /memory/decision`

**Request:**
```json
{
  "repo_id": "owner/repo",
  "decision_text": "All DB access must go through repository layer",
  "decision_type": "ARCH_RULE",
  "code_context": "# example of correct pattern",
  "tags": ["database", "architecture"]
}
```

**Response 201:**
```json
{ "id": "uuid", "status": "stored" }
```

---

### `GET /analytics/{repo_owner}/{repo_name}`

**Response 200:**
```json
{
  "total_prs_analyzed": 142,
  "ai_generated_prs": 89,
  "average_trust_score": 0.71,
  "blocked_prs": 12,
  "top_risk_files": ["auth/middleware.py"],
  "decision_memory_size": 347,
  "trust_score_trend": [{"date": "2026-05-01", "avg_score": 0.68}]
}
```

---

## 6. Trust Score Formula

```
TS = w1·S + w2·A + w3·B + w4·R + w5·P

Where:
  S  = Security score         (AST security analysis)        w1 = 0.35
  A  = Architectural score    (Qdrant contradiction check)   w2 = 0.30
  B  = Blast Radius score     (NetworkX centrality)          w3 = 0.20
  R  = Rejected Pattern score (Qdrant rejected_patterns)     w4 = 0.10
  P  = AI Origin penalty      (1.0 if human, 0.85 if AI)     w5 = 0.05

All component scores are normalized to [0.0, 1.0].
Higher score = more trustworthy.

Gate Thresholds:
  TRUSTED  → TS ≥ 0.85
  REVIEW   → 0.65 ≤ TS < 0.85
  CAUTION  → 0.40 ≤ TS < 0.65
  BLOCK    → TS < 0.40
```

**Override rules:**
- Any `CRITICAL` security flag automatically caps TS at 0.39 (BLOCK)
- Any file with blast radius > 20 downstream modules triggers mandatory `REVIEW` floor

---

## 7. Data Flow Narrative

1. **Webhook arrives** → FastAPI validates HMAC, extracts PR metadata, detects AI origin signals
2. **Background job** → Python `asyncio` task spawned; 200 returned immediately to GitHub
3. **Parallel analysis** → AST parser + Qdrant queries run concurrently via `asyncio.gather`
4. **AST parsing** → tree-sitter parses all changed files; security patterns matched
5. **Qdrant queries** → Changed file content embedded with `all-MiniLM-L6-v2`; top-5 similar architectural decisions + rejected patterns retrieved
6. **Blast radius** → NetworkX traverses import graph; betweenness centrality computed for changed files
7. **Groq reasoning** → Diff + contradictions sent to `llama-3.3-70b-versatile`; structured JSON response parsed
8. **Aggregation** → Weighted formula combines all 5 layer scores into Trust Score
9. **Memory update** → New architectural decisions extracted and upserted to Qdrant `architectural_decisions`
10. **Reporting** → Formatted Markdown comment posted to PR; GitHub commit status set
11. **Dashboard** → PostgreSQL `pr_trust_reports` row written; Next.js dashboard picks up via polling/SSE

---

*VaultCI Architecture Document — Qdrant "Think Outside the Bot" Hackathon 2026*
