"""Tests for B6 — Groq LLM reasoning (no API key needed, tests fallback)."""
import pytest
from app.llm.groq_reasoner import _fallback_explanation, reason_about_diff


SAMPLE_CONTRADICTIONS = [
    {
        "decision": "Never write direct SQL — use repository layer",
        "decision_type": "ARCH_RULE",
        "pr_number": 312,
        "relevance_score": 0.93,
    },
    {
        "decision": "All auth must go through AuthService",
        "decision_type": "ARCH_RULE",
        "pr_number": 200,
        "relevance_score": 0.81,
    },
]


def test_fallback_no_contradictions():
    result = _fallback_explanation([])
    assert result["has_contradiction"] is False
    assert result["risk_level"] == "LOW"
    assert "explanation" in result


def test_fallback_with_contradictions():
    result = _fallback_explanation(SAMPLE_CONTRADICTIONS)
    assert result["has_contradiction"] is True
    assert result["risk_level"] == "HIGH"
    assert "PR #312" in result["explanation"]
    assert len(result["violated_rules"]) == 2


def test_fallback_single_contradiction():
    result = _fallback_explanation([SAMPLE_CONTRADICTIONS[0]])
    assert result["risk_level"] == "MEDIUM"


@pytest.mark.asyncio
async def test_reason_no_key_returns_string(monkeypatch):
    """Without GROQ_API_KEY, reason_about_diff returns a non-empty string."""
    monkeypatch.setattr("app.llm.groq_reasoner.settings.groq_api_key", "")
    explanation = await reason_about_diff(
        diff_text="cursor.execute('SELECT * FROM users')",
        contradictions=SAMPLE_CONTRADICTIONS,
    )
    assert isinstance(explanation, str)
    assert len(explanation) > 10


@pytest.mark.asyncio
async def test_reason_groq_error_falls_back(monkeypatch):
    """Even if Groq call raises, we still get a valid explanation."""
    monkeypatch.setattr("app.llm.groq_reasoner.settings.groq_api_key", "fake_key")

    import httpx

    async def mock_post(*a, **kw):
        raise httpx.ConnectError("timeout")

    monkeypatch.setattr("httpx.AsyncClient.post", mock_post)
    explanation = await reason_about_diff("some diff", SAMPLE_CONTRADICTIONS)
    assert isinstance(explanation, str)
    assert len(explanation) > 0
