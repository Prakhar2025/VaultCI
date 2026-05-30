"""
memory_engine.py — High-level interface for Qdrant vector operations.

Provides:
  - store_decision()        → upsert to architectural_decisions
  - store_rejected_pattern() → upsert to rejected_patterns
  - store_snippet()         → upsert to code_snippets
  - query_contradictions()  → semantic search, top-5 similar decisions
  - query_rejected_patterns() → semantic search, top-5 rejected patterns
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, List, Optional

from app.memory.embedder import embed


def _get_client():
    """Late import to allow tests to mock before Qdrant is available."""
    from app.memory.qdrant_client import get_qdrant
    return get_qdrant()


def _make_filter(repo_id: str) -> dict:
    return {"must": [{"key": "repo_id", "match": {"value": repo_id}}]}


# ── Write operations ─────────────────────────────────────────────────────────

def store_decision(
    repo_id: str,
    pr_number: int,
    decision_text: str,
    decision_type: str,         # PATTERN_ADOPTED | PATTERN_REJECTED | ARCH_RULE
    author: str = "unknown",
    tags: Optional[List[str]] = None,
    code_context: str = "",
) -> str:
    from qdrant_client.models import PointStruct

    point_id = str(uuid.uuid4())
    vector = embed(decision_text)
    _get_client().upsert(
        collection_name="architectural_decisions",
        points=[PointStruct(
            id=point_id,
            vector=vector,
            payload={
                "repo_id": repo_id,
                "pr_number": pr_number,
                "decision_text": decision_text,
                "decision_type": decision_type,
                "author": author,
                "created_at": datetime.utcnow().isoformat(),
                "tags": tags or [],
                "code_context": code_context,
            },
        )],
    )
    return point_id


def store_rejected_pattern(
    repo_id: str,
    pattern_name: str,
    rejection_reason: str,
    rejected_in_pr: int,
    rejected_by: str = "unknown",
) -> str:
    from qdrant_client.models import PointStruct

    point_id = str(uuid.uuid4())
    text = f"{pattern_name}: {rejection_reason}"
    vector = embed(text)
    _get_client().upsert(
        collection_name="rejected_patterns",
        points=[PointStruct(
            id=point_id,
            vector=vector,
            payload={
                "repo_id": repo_id,
                "pattern_name": pattern_name,
                "rejection_reason": rejection_reason,
                "rejected_in_pr": rejected_in_pr,
                "rejected_by": rejected_by,
                "created_at": datetime.utcnow().isoformat(),
            },
        )],
    )
    return point_id


def store_snippet(
    repo_id: str,
    file_path: str,
    function_name: str,
    snippet: str,
    language: str = "python",
) -> str:
    from qdrant_client.models import PointStruct

    point_id = str(uuid.uuid4())
    vector = embed(snippet)
    _get_client().upsert(
        collection_name="code_snippets",
        points=[PointStruct(
            id=point_id,
            vector=vector,
            payload={
                "repo_id": repo_id,
                "file_path": file_path,
                "function_name": function_name,
                "snippet": snippet,
                "language": language,
                "created_at": datetime.utcnow().isoformat(),
            },
        )],
    )
    return point_id


# ── Read operations ──────────────────────────────────────────────────────────

async def query_contradictions(
    repo_id: str,
    query_text: str,
    limit: int = 5,
    score_threshold: float = 0.70,
) -> list[dict[str, Any]]:
    """
    Find past architectural decisions semantically similar to query_text.
    High similarity = possible contradiction with new code.
    """
    try:
        vector = embed(query_text)
        results = _get_client().search(
            collection_name="architectural_decisions",
            query_vector=vector,
            limit=limit,
            query_filter=_make_filter(repo_id),
            with_payload=True,
            score_threshold=score_threshold,
        )
        return [
            {
                "decision": r.payload.get("decision_text", ""),
                "decision_type": r.payload.get("decision_type", ""),
                "pr_number": r.payload.get("pr_number"),
                "author": r.payload.get("author", ""),
                "relevance_score": round(r.score, 4),
                "tags": r.payload.get("tags", []),
            }
            for r in results
        ]
    except Exception:
        # Qdrant unavailable — return empty (graceful degradation)
        return []


async def query_rejected_patterns(
    repo_id: str,
    code_text: str,
    limit: int = 5,
    score_threshold: float = 0.75,
) -> list[dict[str, Any]]:
    """Find rejected patterns that match the new code semantically."""
    try:
        vector = embed(code_text)
        results = _get_client().search(
            collection_name="rejected_patterns",
            query_vector=vector,
            limit=limit,
            query_filter=_make_filter(repo_id),
            with_payload=True,
            score_threshold=score_threshold,
        )
        return [
            {
                "pattern_name": r.payload.get("pattern_name", ""),
                "rejection_reason": r.payload.get("rejection_reason", ""),
                "rejected_in_pr": r.payload.get("rejected_in_pr"),
                "rejected_by": r.payload.get("rejected_by", ""),
                "relevance_score": round(r.score, 4),
            }
            for r in results
        ]
    except Exception:
        return []
