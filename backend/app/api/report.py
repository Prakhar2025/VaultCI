"""GET /report/{repo_owner}/{repo_name}/{pr_number}"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import PRTrustReport

router = APIRouter(prefix="/report", tags=["report"])


@router.get("/{repo_owner}/{repo_name}/{pr_number}")
async def get_report(
    repo_owner: str,
    repo_name: str,
    pr_number: int,
    db: AsyncSession = Depends(get_db),
):
    repo_id = f"{repo_owner}/{repo_name}"
    result = await db.execute(
        select(PRTrustReport)
        .where(PRTrustReport.repo_id == repo_id)
        .where(PRTrustReport.pr_number == pr_number)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "pr_number": report.pr_number,
        "repo_id": report.repo_id,
        "is_ai_generated": report.is_ai_generated,
        "trust_score": report.trust_score,
        "gate_decision": report.gate_decision,
        "security_score": report.security_score,
        "arch_score": report.arch_score,
        "blast_score": report.blast_score,
        "rejected_score": report.rejected_score,
        "report_json": report.report_json,
        "created_at": report.created_at.isoformat() if report.created_at else None,
    }
