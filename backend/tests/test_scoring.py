"""Tests for B7 — Trust Score aggregator."""
import pytest
from app.scoring.aggregator import compute_trust_score, _gate


# ── Gate threshold tests ──────────────────────────────────────────────────────

def test_gate_trusted():
    assert _gate(0.90) == "TRUSTED"
    assert _gate(0.85) == "TRUSTED"

def test_gate_review():
    assert _gate(0.75) == "REVIEW"
    assert _gate(0.65) == "REVIEW"

def test_gate_caution():
    assert _gate(0.55) == "CAUTION"
    assert _gate(0.40) == "CAUTION"

def test_gate_block():
    assert _gate(0.39) == "BLOCK"
    assert _gate(0.0)  == "BLOCK"


# ── Score formula tests ───────────────────────────────────────────────────────

def test_perfect_score():
    result = compute_trust_score(
        security_score=1.0,
        arch_score=1.0,
        blast_score=1.0,
        rejected_score=1.0,
        is_ai=False,
    )
    assert result["trust_score"] == 1.0
    assert result["gate"] == "TRUSTED"
    assert result["override_applied"] is None


def test_ai_penalty_applied():
    human = compute_trust_score(1.0, 1.0, 1.0, 1.0, is_ai=False)
    ai    = compute_trust_score(1.0, 1.0, 1.0, 1.0, is_ai=True)
    assert ai["trust_score"] < human["trust_score"]


def test_critical_flag_forces_block():
    result = compute_trust_score(
        security_score=0.9,
        arch_score=1.0,
        blast_score=1.0,
        rejected_score=1.0,
        is_ai=False,
        security_flags=[{"pattern": "hardcoded_secret", "severity": "CRITICAL"}],
    )
    assert result["gate"] == "BLOCK"
    assert result["trust_score"] <= 0.39
    assert result["override_applied"] == "CRITICAL_SECURITY_FLAG"


def test_high_blast_radius_caps_trusted():
    result = compute_trust_score(
        security_score=1.0,
        arch_score=1.0,
        blast_score=1.0,
        rejected_score=1.0,
        is_ai=False,
        blast_count=25,    # above threshold of 20
    )
    assert result["gate"] != "TRUSTED"
    assert result["override_applied"] == "HIGH_BLAST_RADIUS"


def test_low_scores_produce_block():
    result = compute_trust_score(
        security_score=0.2,
        arch_score=0.1,
        blast_score=0.3,
        rejected_score=0.1,
        is_ai=True,
    )
    assert result["gate"] == "BLOCK"


def test_weights_present_in_output():
    result = compute_trust_score(0.8, 0.7, 0.9, 0.9, is_ai=False)
    weights = result["weights"]
    assert set(weights.keys()) == {"security", "arch", "blast", "rejected", "ai_origin"}
    # Weights should roughly sum to trust_score
    assert abs(sum(weights.values()) - result["trust_score"]) < 0.01
