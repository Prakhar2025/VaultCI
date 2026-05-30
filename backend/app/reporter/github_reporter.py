"""
github_reporter.py — Posts structured trust report as a GitHub PR comment
and sets the commit status check (pass/fail).
"""
from __future__ import annotations

import httpx

from app.config import settings

_GATE_EMOJI = {
    "TRUSTED": "✅",
    "REVIEW":  "🟡",
    "CAUTION": "🟠",
    "BLOCK":   "🔴",
}

_GH_API = "https://api.github.com"


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.github_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def _build_comment(report: dict) -> str:
    gate   = report.get("gate", "REVIEW")
    score  = report.get("trust_score", 0.0)
    emoji  = _GATE_EMOJI.get(gate, "⚪")
    layers = report.get("weights", {})
    flags  = report.get("file_map", [])
    contradictions = report.get("contradictions", [])
    explanation = report.get("explanation", "")

    # Per-file risk table
    file_rows = "\n".join(
        f"| `{f['file']}` | {f.get('risk','LOW')} |"
        for f in flags[:10]
    )
    file_table = (
        f"| File | Risk |\n|------|------|\n{file_rows}"
        if file_rows else "_No files analyzed._"
    )

    # Contradiction list
    contra_lines = "\n".join(
        f"- **PR #{c.get('pr_number','?')}** — {c.get('decision','')} "
        f"(similarity: {c.get('relevance_score',0):.2f})"
        for c in contradictions[:3]
    ) or "_None detected._"

    return f"""## {emoji} VaultCI Trust Report

**Trust Score:** `{score:.2f}` &nbsp;|&nbsp; **Gate:** `{gate}`

{explanation}

### 📊 Layer Breakdown
| Layer | Score |
|-------|-------|
| Security | `{layers.get('security', 0):.3f}` |
| Architectural Consistency | `{layers.get('arch', 0):.3f}` |
| Blast Radius | `{layers.get('blast', 0):.3f}` |
| Rejected Patterns | `{layers.get('rejected', 0):.3f}` |
| AI Origin Penalty | `{layers.get('ai_origin', 0):.3f}` |

### 🗂️ File Risk Map
{file_table}

### 🧠 Architectural Memory — Contradictions
{contra_lines}

---
_Powered by [VaultCI](https://github.com/Prakhar2025/vaultci) · Qdrant "Think Outside the Bot" Hackathon 2026_
"""


async def post_pr_comment(
    owner: str, repo: str, pr_number: int, report: dict
) -> bool:
    """Post comment to PR. Returns True on success."""
    if not settings.github_token:
        print(f"[reporter] No GITHUB_TOKEN — skipping comment for PR#{pr_number}")
        return False

    url = f"{_GH_API}/repos/{owner}/{repo}/issues/{pr_number}/comments"
    body = {"body": _build_comment(report)}

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(url, json=body, headers=_headers())
            resp.raise_for_status()
        await _set_commit_status(owner, repo, report)
        return True
    except Exception as exc:
        print(f"[reporter] Failed to post comment: {exc}")
        return False


async def _set_commit_status(owner: str, repo: str, report: dict) -> None:
    """Set GitHub commit status check (requires sha — skipped if not available)."""
    sha = report.get("head_sha")
    if not sha:
        return

    gate = report.get("gate", "REVIEW")
    state = "success" if gate == "TRUSTED" else "failure"
    score = report.get("trust_score", 0.0)

    url = f"{_GH_API}/repos/{owner}/{repo}/statuses/{sha}"
    payload = {
        "state": state,
        "description": f"VaultCI: {gate} (score {score:.2f})",
        "context": "vaultci/trust-score",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(url, json=payload, headers=_headers())
    except Exception as exc:
        print(f"[reporter] Status check failed: {exc}")
