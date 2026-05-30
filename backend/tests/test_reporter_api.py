"""Tests for B8 (reporter format) and B9 (memory + analytics endpoints)."""
import json
import pytest
from app.reporter.github_reporter import _build_comment


# ── B8: comment formatter (no GitHub API call needed) ────────────────────────

def test_build_comment_trusted():
    report = {
        "trust_score": 0.92,
        "gate": "TRUSTED",
        "explanation": "No issues found.",
        "weights": {"security": 0.35, "arch": 0.30, "blast": 0.20, "rejected": 0.10, "ai_origin": 0.05},
        "file_map": [{"file": "auth.py", "risk": "LOW"}],
        "contradictions": [],
    }
    comment = _build_comment(report)
    assert "✅" in comment
    assert "TRUSTED" in comment
    assert "0.92" in comment
    assert "auth.py" in comment


def test_build_comment_block_with_contradiction():
    report = {
        "trust_score": 0.21,
        "gate": "BLOCK",
        "explanation": "Critical SQL injection found.",
        "weights": {"security": 0.0, "arch": 0.05, "blast": 0.12, "rejected": 0.04, "ai_origin": 0.0},
        "file_map": [{"file": "db.py", "risk": "CRITICAL"}],
        "contradictions": [
            {"decision": "No direct SQL", "pr_number": 312, "relevance_score": 0.94}
        ],
    }
    comment = _build_comment(report)
    assert "🔴" in comment
    assert "BLOCK" in comment
    assert "PR #312" in comment


# ── B9: /memory/query endpoint ────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_memory_query_endpoint(client, monkeypatch):
    async def mock_query(*args, **kwargs):
        return [{"decision": "Use repo layer", "pr_number": 1, "relevance_score": 0.9}]

    monkeypatch.setattr("app.api.memory.query_contradictions", mock_query)

    payload = {"repo_id": "owner/repo", "query": "SQL queries", "limit": 5}
    resp = await client.post("/memory/query", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] == 1
    assert data["results"][0]["pr_number"] == 1


# ── B9: /memory/decision endpoint ─────────────────────────────────────────────

@pytest.mark.asyncio
async def test_memory_decision_endpoint(client, monkeypatch):
    monkeypatch.setattr(
        "app.api.memory.store_decision",
        lambda *args, **kwargs: "fake-uuid-1234",
    )
    payload = {
        "repo_id": "owner/repo",
        "decision_text": "All DB via repo layer",
        "decision_type": "ARCH_RULE",
    }
    resp = await client.post("/memory/decision", json=payload)
    assert resp.status_code == 201
    assert resp.json()["status"] == "stored"
