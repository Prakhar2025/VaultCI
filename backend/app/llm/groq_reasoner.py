"""
groq_reasoner.py — Groq LLM reasoning layer.

Sends PR diff + architectural contradictions to Groq llama-3.3-70b-versatile.
Returns structured JSON with contradiction analysis and human-readable explanation.
Gracefully falls back to a deterministic summary if Groq is unavailable or key missing.
"""
from __future__ import annotations

import json
import re
from typing import Any, Dict, List

from app.config import settings

_SYSTEM_PROMPT = """You are VaultCI, an AI code reviewer specializing in architectural consistency.
You analyze pull request diffs against a repository's architectural decisions and rules.
Always respond with valid JSON only — no markdown, no explanation outside the JSON.
"""

_USER_TEMPLATE = """
Analyze this PR diff against the architectural decisions below.

## PR Diff (first 3000 chars)
{diff}

## Past Architectural Decisions (from memory)
{decisions}

Respond with this exact JSON structure:
{{
  "has_contradiction": true/false,
  "contradiction_summary": "one sentence summary or empty string",
  "violated_rules": ["rule 1", "rule 2"],
  "risk_level": "CRITICAL|HIGH|MEDIUM|LOW",
  "explanation": "2-3 sentence human-readable explanation for the PR author",
  "recommendation": "what the author should do to fix this"
}}
"""


def _build_decisions_text(contradictions: List[Dict[str, Any]]) -> str:
    if not contradictions:
        return "No past decisions found for this repository."
    lines = []
    for c in contradictions[:5]:
        lines.append(
            f"- [{c.get('decision_type', 'RULE')}] {c.get('decision', '')} "
            f"(PR #{c.get('pr_number', '?')}, similarity={c.get('relevance_score', 0):.2f})"
        )
    return "\n".join(lines)


def _fallback_explanation(contradictions: List[Dict]) -> Dict[str, Any]:
    """Used when Groq is unavailable or GROQ_API_KEY is not set."""
    if not contradictions:
        return {
            "has_contradiction": False,
            "contradiction_summary": "",
            "violated_rules": [],
            "risk_level": "LOW",
            "explanation": "No architectural contradictions detected by memory search.",
            "recommendation": "Proceed with standard code review.",
        }
    top = contradictions[0]
    return {
        "has_contradiction": True,
        "contradiction_summary": f"Possible contradiction with: {top.get('decision', '')}",
        "violated_rules": [c.get("decision", "") for c in contradictions[:3]],
        "risk_level": "HIGH" if len(contradictions) >= 2 else "MEDIUM",
        "explanation": (
            f"This PR may contradict {len(contradictions)} past architectural decision(s). "
            f"The closest match (similarity {top.get('relevance_score', 0):.2f}) is from PR #{top.get('pr_number', '?')}."
        ),
        "recommendation": "Review the flagged decisions and confirm this change is intentional.",
    }


async def reason_about_diff(
    diff_text: str,
    contradictions: List[Dict[str, Any]],
) -> str:
    """
    Main entry point — returns a human-readable explanation string.
    If Groq is available: uses LLM. Otherwise: returns deterministic fallback.
    """
    structured = await _call_groq(diff_text, contradictions)
    return structured.get("explanation", "Analysis complete.")


async def _call_groq(
    diff_text: str,
    contradictions: List[Dict[str, Any]],
) -> Dict[str, Any]:
    if not settings.groq_api_key:
        return _fallback_explanation(contradictions)

    try:
        import httpx

        decisions_text = _build_decisions_text(contradictions)
        user_msg = _USER_TEMPLATE.format(
            diff=diff_text[:3000],
            decisions=decisions_text,
        )

        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
            "temperature": 0.1,
            "max_tokens": 512,
            "response_format": {"type": "json_object"},
        }

        headers = {
            "Authorization": f"Bearer {settings.groq_api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            return json.loads(content)

    except Exception as exc:
        print(f"[groq] Fallback triggered: {exc}")
        return _fallback_explanation(contradictions)
