"""POST /memory/query and POST /memory/decision"""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from app.memory.memory_engine import query_contradictions, store_decision

router = APIRouter(prefix="/memory", tags=["memory"])


class QueryRequest(BaseModel):
    repo_id: str
    query: str
    limit: int = 5


class DecisionRequest(BaseModel):
    repo_id: str
    pr_number: int = 0
    decision_text: str
    decision_type: str = "ARCH_RULE"
    author: str = "manual"
    tags: Optional[List[str]] = None
    code_context: str = ""


@router.post("/query")
async def query_memory(req: QueryRequest):
    results = await query_contradictions(req.repo_id, req.query, limit=req.limit)
    return {"results": results, "count": len(results)}


@router.post("/decision", status_code=201)
async def add_decision(req: DecisionRequest):
    point_id = store_decision(
        repo_id=req.repo_id,
        pr_number=req.pr_number,
        decision_text=req.decision_text,
        decision_type=req.decision_type,
        author=req.author,
        tags=req.tags,
        code_context=req.code_context,
    )
    return {"id": point_id, "status": "stored"}
