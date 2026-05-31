"""
repos.py — Repository registration API.
POST /repos  → register a repo with VaultCI (saves to PostgreSQL)
GET  /repos  → list registered repos
"""
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import Repository

router = APIRouter(prefix="/repos", tags=["repos"])


class RepoRegisterRequest(BaseModel):
    repo_id: str
    github_token: str | None = None
    webhook_secret: str
    security_threshold: float = 0.70
    arch_threshold: float = 0.65
    blast_threshold: int = 20


class RepoResponse(BaseModel):
    repo_id: str
    security_threshold: float
    arch_threshold: float
    blast_threshold: int
    created_at: str | None


@router.post("", status_code=201)
async def register_repo(
    body: RepoRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    # Upsert: update if already exists
    result = await db.execute(
        select(Repository).where(Repository.repo_id == body.repo_id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.github_token = body.github_token
        existing.webhook_secret = body.webhook_secret
        existing.security_threshold = body.security_threshold
        existing.arch_threshold = body.arch_threshold
        existing.blast_threshold = body.blast_threshold
        await db.commit()
        return {"message": f"Repository {body.repo_id} updated successfully.", "repo_id": body.repo_id}

    repo = Repository(
        id=uuid.uuid4(),
        repo_id=body.repo_id,
        github_token=body.github_token,
        webhook_secret=body.webhook_secret,
        security_threshold=body.security_threshold,
        arch_threshold=body.arch_threshold,
        blast_threshold=body.blast_threshold,
        created_at=datetime.utcnow(),
    )
    db.add(repo)
    await db.commit()
    return {"message": f"Repository {body.repo_id} registered successfully.", "repo_id": body.repo_id}


@router.get("", response_model=list[RepoResponse])
async def list_repos(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Repository))
    repos = result.scalars().all()
    return [
        RepoResponse(
            repo_id=r.repo_id,
            security_threshold=r.security_threshold or 0.70,
            arch_threshold=r.arch_threshold or 0.65,
            blast_threshold=r.blast_threshold or 20,
            created_at=r.created_at.isoformat() if r.created_at else None,
        )
        for r in repos
    ]
