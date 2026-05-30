"""
Tests for B4 — Qdrant memory engine (mocked — no live Qdrant needed).
"""
import pytest
from unittest.mock import MagicMock, patch, AsyncMock


# ── Mock Qdrant client before any import ─────────────────────────────────────

@pytest.fixture(autouse=True)
def mock_qdrant(monkeypatch):
    """Replace get_qdrant with a MagicMock for all B4 tests."""
    mock_client = MagicMock()
    mock_client.get_collections.return_value = MagicMock(collections=[])
    mock_client.upsert.return_value = None

    # Simulate a search result
    hit = MagicMock()
    hit.score = 0.92
    hit.payload = {
        "decision_text": "Never write direct SQL — use repository layer",
        "decision_type": "ARCH_RULE",
        "pr_number": 312,
        "author": "alice",
        "tags": ["database"],
    }
    mock_client.search.return_value = [hit]

    monkeypatch.setattr("app.memory.qdrant_client.get_qdrant", lambda: mock_client)
    monkeypatch.setattr("app.memory.memory_engine._get_client", lambda: mock_client)
    return mock_client


@pytest.fixture(autouse=True)
def mock_embedder(monkeypatch):
    """Return a fixed zero-vector so sentence-transformers isn't loaded."""
    monkeypatch.setattr("app.memory.memory_engine.embed", lambda text: [0.0] * 384)


# ── store_decision ────────────────────────────────────────────────────────────

def test_store_decision_calls_upsert(mock_qdrant):
    from app.memory.memory_engine import store_decision
    pid = store_decision(
        repo_id="owner/repo",
        pr_number=10,
        decision_text="Use async DB calls everywhere",
        decision_type="ARCH_RULE",
        author="bob",
        tags=["async", "db"],
    )
    assert pid  # UUID returned
    mock_qdrant.upsert.assert_called_once()
    call_kwargs = mock_qdrant.upsert.call_args.kwargs
    assert call_kwargs["collection_name"] == "architectural_decisions"


# ── store_rejected_pattern ────────────────────────────────────────────────────

def test_store_rejected_pattern_calls_upsert(mock_qdrant):
    from app.memory.memory_engine import store_rejected_pattern
    pid = store_rejected_pattern(
        repo_id="owner/repo",
        pattern_name="Direct SQL Query",
        rejection_reason="SQL injection risk",
        rejected_in_pr=312,
        rejected_by="alice",
    )
    assert pid
    mock_qdrant.upsert.assert_called_once()
    call_kwargs = mock_qdrant.upsert.call_args.kwargs
    assert call_kwargs["collection_name"] == "rejected_patterns"


# ── query_contradictions ──────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_query_contradictions_returns_results(mock_qdrant):
    from app.memory.memory_engine import query_contradictions
    results = await query_contradictions("owner/repo", "SELECT * FROM users")
    assert len(results) == 1
    assert results[0]["pr_number"] == 312
    assert results[0]["relevance_score"] == 0.92


@pytest.mark.asyncio
async def test_query_contradictions_graceful_on_error(monkeypatch):
    """Returns [] when Qdrant is unavailable — no exception raised."""
    monkeypatch.setattr(
        "app.memory.memory_engine._get_client",
        lambda: (_ for _ in ()).throw(ConnectionRefusedError("qdrant down")),
    )
    from app.memory.memory_engine import query_contradictions
    result = await query_contradictions("owner/repo", "some code")
    assert result == []
