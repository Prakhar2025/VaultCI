"""
aggregator.py — Trust Score weighted formula + gate decision.

Formula:
  TS = 0.35·Security + 0.30·ArchConsistency + 0.20·BlastRadius
       + 0.10·RejectedPatterns + 0.05·AIOriginPenalty

Override rules:
  - Any CRITICAL security flag → TS capped at 0.39 (BLOCK)
  - Blast count > threshold    → gate floored at REVIEW (≥ 0.65)

Gate:
  TRUSTED  0.85–1.0
  REVIEW   0.65–0.84
  CAUTION  0.40–0.64
  BLOCK    0.00–0.39
"""
from __future__ import annotations

from typing import Any, Dict, List

# Weights must sum to 1.0
_W_SECURITY  = 0.35
_W_ARCH      = 0.30
_W_BLAST     = 0.20
_W_REJECTED  = 0.10
_W_AI        = 0.05

_AI_PENALTY   = 0.85   # applied when is_ai=True (scales AI component)
_BLAST_FLOOR  = 20     # affected modules above this → mandatory REVIEW floor


def _gate(score: float) -> str:
    if score >= 0.85:
        return "TRUSTED"
    if score >= 0.65:
        return "REVIEW"
    if score >= 0.40:
        return "CAUTION"
    return "BLOCK"


def compute_trust_score(
    security_score: float,
    arch_score: float,
    blast_score: float,
    rejected_score: float,
    is_ai: bool,
    security_flags: List[Dict[str, Any]] | None = None,
    blast_count: int = 0,
) -> Dict[str, Any]:
    """
    Returns a full trust report dict:
    {
        trust_score: float,
        gate: str,
        weights: dict,
        override_applied: str | None,
    }
    """
    security_flags = security_flags or []
    ai_component = _AI_PENALTY if is_ai else 1.0

    raw = (
        _W_SECURITY * security_score
        + _W_ARCH    * arch_score
        + _W_BLAST   * blast_score
        + _W_REJECTED * rejected_score
        + _W_AI      * ai_component
    )
    raw = round(min(max(raw, 0.0), 1.0), 4)

    override = None

    # Override 1: any CRITICAL flag → BLOCK
    has_critical = any(
        f.get("severity") == "CRITICAL" for f in security_flags
    )
    if has_critical:
        raw = min(raw, 0.39)
        override = "CRITICAL_SECURITY_FLAG"

    # Override 2: high blast radius → floor at REVIEW
    if blast_count > _BLAST_FLOOR and raw >= 0.85:
        raw = min(raw, 0.84)
        override = override or "HIGH_BLAST_RADIUS"

    gate = _gate(raw)

    return {
        "trust_score": raw,
        "gate": gate,
        "weights": {
            "security": round(_W_SECURITY * security_score, 4),
            "arch": round(_W_ARCH * arch_score, 4),
            "blast": round(_W_BLAST * blast_score, 4),
            "rejected": round(_W_REJECTED * rejected_score, 4),
            "ai_origin": round(_W_AI * ai_component, 4),
        },
        "override_applied": override,
    }
