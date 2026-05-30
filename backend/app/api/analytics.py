"""GET /analytics/{repo_owner}/{repo_name}"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import PRTrustReport

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/{repo_owner}/{repo_name}")
async def get_analytics(
    repo_owner: str,
    repo_name: str,
    db: AsyncSession = Depends(get_db),
):
    repo_id = f"{repo_owner}/{repo_name}"

    # All reports for this repo
    result = await db.execute(
        select(PRTrustReport).where(PRTrustReport.repo_id == repo_id)
    )
    reports = result.scalars().all()

    if not reports:
        return {
            "repo_id": repo_id,
            "total_prs_analyzed": 0,
            "ai_generated_prs": 0,
            "average_trust_score": None,
            "blocked_prs": 0,
            "gate_breakdown": {},
            "top_risk_files": [],
        }

    total = len(reports)
    ai_count = sum(1 for r in reports if r.is_ai_generated)
    avg_score = round(sum(r.trust_score for r in reports) / total, 4)
    blocked = sum(1 for r in reports if r.gate_decision == "BLOCK")

    # Gate distribution
    gate_breakdown: dict = {}
    for r in reports:
        gate_breakdown[r.gate_decision] = gate_breakdown.get(r.gate_decision, 0) + 1

    # Top risk files from report_json payloads
    file_risk: dict = {}
    for r in reports:
        if r.report_json and "file_map" in r.report_json:
            for f in r.report_json["file_map"]:
                path = f.get("file", "")
                risk = f.get("risk", "LOW")
                if risk in ("CRITICAL", "HIGH"):
                    file_risk[path] = file_risk.get(path, 0) + 1

    top_risk = sorted(file_risk, key=file_risk.get, reverse=True)[:5]

    # Score trend (last 30 reports)
    trend = [
        {"created_at": r.created_at.isoformat(), "trust_score": r.trust_score}
        for r in sorted(reports, key=lambda x: x.created_at)[-30:]
        if r.created_at
    ]

    return {
        "repo_id": repo_id,
        "total_prs_analyzed": total,
        "ai_generated_prs": ai_count,
        "average_trust_score": avg_score,
        "blocked_prs": blocked,
        "gate_breakdown": gate_breakdown,
        "top_risk_files": top_risk,
        "trust_score_trend": trend,
    }
