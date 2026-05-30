"""
POST /webhook/github — receives GitHub pull_request events.
Validates signature, detects AI origin, enqueues async analysis job.
"""
import json
import uuid
from typing import Any

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Request

from app.config import settings
from app.webhook.ai_detector import detect_ai_origin
from app.webhook.signature import verify_signature

router = APIRouter(prefix="/webhook", tags=["webhook"])


async def _fetch_pr_files(owner: str, repo: str, pr_number: int) -> list[dict]:
    """Fetch PR file diffs from GitHub REST API."""
    if not settings.github_token:
        return []
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/files"
    headers = {
        "Authorization": f"Bearer {settings.github_token}",
        "Accept": "application/vnd.github+json",
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, headers=headers)
        if resp.status_code == 200:
            return resp.json()
    return []


async def _run_analysis(job_id: str, payload: dict[str, Any]) -> None:
    """
    Background task — full 5-layer verification pipeline.
    Imports are done inside to avoid circular deps during B1 startup.
    """
    pr = payload.get("pull_request", {})
    repo_full = payload.get("repository", {}).get("full_name", "unknown/repo")
    pr_number = pr.get("number", 0)
    ai_result = payload.get("_ai_result", {})

    try:
        # B3 — AST + security
        from app.analyzer.ast_parser import parse_diff_files
        from app.analyzer.security import score_security

        files = payload.get("_diff_files", [])
        ast_results = parse_diff_files(files)
        security_score, security_flags = score_security(ast_results)

        # B4 — Qdrant memory (contradiction + rejected patterns)
        from app.memory.memory_engine import query_contradictions, query_rejected_patterns

        diff_text = " ".join(
            f.get("patch", "") or "" for f in files[:5]
        )
        contradictions = await query_contradictions(repo_full, diff_text)
        rejected = await query_rejected_patterns(repo_full, diff_text)
        arch_score = 1.0 - min(len(contradictions) * 0.2, 0.8)
        rejected_score = 1.0 - min(len(rejected) * 0.25, 0.75)

        # B5 — Blast radius
        from app.graph.dependency import compute_blast_radius

        file_paths = [f.get("filename", "") for f in files]
        blast_score, blast_count = compute_blast_radius(repo_full, file_paths)

        # B6 — Groq reasoning
        from app.llm.groq_reasoner import reason_about_diff

        explanation = await reason_about_diff(diff_text, contradictions)

        # B7 — Trust Score
        from app.scoring.aggregator import compute_trust_score

        result = compute_trust_score(
            security_score=security_score,
            arch_score=arch_score,
            blast_score=blast_score,
            rejected_score=rejected_score,
            is_ai=ai_result.get("is_ai", False),
            security_flags=security_flags,
            blast_count=blast_count,
        )
        result["explanation"] = explanation
        result["contradictions"] = contradictions
        result["rejected_patterns"] = rejected
        result["file_map"] = [
            {"file": f.get("filename"), "risk": r.get("risk", "LOW")}
            for f, r in zip(files, ast_results)
        ]

        # B8 — GitHub reporter
        from app.reporter.github_reporter import post_pr_comment

        owner, repo_name = repo_full.split("/", 1)
        await post_pr_comment(owner, repo_name, pr_number, result)

        # Persist to PostgreSQL
        from app.database import AsyncSessionLocal
        from app.models import PRTrustReport

        async with AsyncSessionLocal() as db:
            report = PRTrustReport(
                repo_id=repo_full,
                pr_number=pr_number,
                is_ai_generated=ai_result.get("is_ai", False),
                trust_score=result["trust_score"],
                gate_decision=result["gate"],
                security_score=security_score,
                arch_score=arch_score,
                blast_score=blast_score,
                rejected_score=rejected_score,
                ai_penalty=0.85 if ai_result.get("is_ai") else 1.0,
                report_json=result,
            )
            db.add(report)
            await db.commit()

        print(f"[job:{job_id}] Done — PR#{pr_number} gate={result['gate']} score={result['trust_score']}")

    except Exception as exc:
        print(f"[job:{job_id}] Analysis failed: {exc}")


@router.post("/github")
async def github_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_github_event: str = Header(default=""),
):
    # Validate signature
    body = await verify_signature(request)
    payload: dict = json.loads(body)

    # Only process pull_request events
    if x_github_event != "pull_request":
        return {"status": "ignored", "event": x_github_event}

    action = payload.get("action", "")
    if action not in ("opened", "synchronize", "reopened"):
        return {"status": "ignored", "action": action}

    pr = payload.get("pull_request", {})
    repo_full = payload.get("repository", {}).get("full_name", "")
    pr_number = pr.get("number", 0)

    # Fetch file diffs (async, before background task)
    owner, repo_name = (repo_full.split("/", 1) + [""])[:2]
    diff_files = await _fetch_pr_files(owner, repo_name, pr_number)
    payload["_diff_files"] = diff_files

    # Detect AI origin
    ai_result = detect_ai_origin(payload)
    payload["_ai_result"] = ai_result

    job_id = str(uuid.uuid4())
    background_tasks.add_task(_run_analysis, job_id, payload)

    return {
        "job_id": job_id,
        "status": "queued",
        "pr_number": pr_number,
        "repo": repo_full,
        "is_ai_generated": ai_result["is_ai"],
        "ai_confidence": ai_result["confidence"],
    }
