"""
security.py — Security pattern matcher.

Scans added lines from AST parser results for known vulnerability patterns.
Returns per-file risk levels and an aggregate security score.
"""
import re
from typing import Any

# ── Pattern registry ─────────────────────────────────────────────────────────
# Each entry: (name, compiled_regex, severity, score_penalty)
_PATTERNS: list[tuple[str, re.Pattern, str, float]] = [
    # Hardcoded secrets
    ("hardcoded_secret",
     re.compile(r'(password|secret|api_key|token)\s*=\s*["\'][^"\']{4,}["\']', re.I),
     "CRITICAL", 0.6),

    # SQL injection via string formatting
    ("sql_injection",
     re.compile(r'(execute|cursor\.execute)\s*\(\s*[f"\'].*(%s|\{)', re.I),
     "CRITICAL", 0.6),

    # Direct SQL (raw query strings)
    ("direct_sql",
     re.compile(r'\b(SELECT|INSERT|UPDATE|DELETE)\b.+\bFROM\b', re.I),
     "HIGH", 0.3),

    # Auth bypass patterns
    ("auth_bypass",
     re.compile(r'(skip_auth|bypass_auth|auth\s*=\s*False|verify\s*=\s*False)', re.I),
     "CRITICAL", 0.6),

    # Unsafe eval / exec
    ("eval_usage",
     re.compile(r'\beval\s*\(|\bexec\s*\(', re.I),
     "HIGH", 0.35),

    # Insecure random
    ("insecure_random",
     re.compile(r'\brandom\.(random|randint|choice)\b', re.I),
     "MEDIUM", 0.15),

    # Pickle deserialization
    ("unsafe_deserialize",
     re.compile(r'\bpickle\.loads?\b|\byaml\.load\s*\((?!.*Loader)', re.I),
     "HIGH", 0.35),

    # Subprocess with shell=True
    ("shell_injection",
     re.compile(r'subprocess\.(run|call|Popen).*shell\s*=\s*True', re.I),
     "HIGH", 0.35),

    # Debug/print of sensitive data
    ("debug_sensitive",
     re.compile(r'print\s*\(.*?(password|token|secret|key)', re.I),
     "MEDIUM", 0.1),
]

_SEVERITY_ORDER = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}
_RISK_LABELS = {4: "CRITICAL", 3: "HIGH", 2: "MEDIUM", 1: "LOW"}


def _score_lines(lines: list[str]) -> tuple[str, float, list[dict]]:
    """
    Scan a list of code lines.
    Returns (risk_label, risk_score 0-1, flags).
    risk_score: 1.0 = perfectly clean, 0.0 = extremely risky.
    """
    flags = []
    max_severity = 1
    total_penalty = 0.0

    joined = "\n".join(lines)
    for name, pattern, severity, penalty in _PATTERNS:
        matches = pattern.findall(joined)
        if matches:
            flags.append({
                "pattern": name,
                "severity": severity,
                "matches": len(matches),
            })
            total_penalty += penalty
            max_severity = max(max_severity, _SEVERITY_ORDER[severity])

    risk_score = max(0.0, round(1.0 - total_penalty, 3))
    risk_label = _RISK_LABELS.get(max_severity, "LOW")
    return risk_label, risk_score, flags


def score_security(
    ast_results: list[dict[str, Any]],
) -> tuple[float, list[dict]]:
    """
    Returns:
        (aggregate_security_score, all_flags_list)
    aggregate_security_score: weighted average of per-file scores (0.0–1.0).
    """
    all_flags: list[dict] = []
    file_scores: list[float] = []

    for result in ast_results:
        lines = result.get("added_lines", [])
        if not lines:
            result["risk"] = "LOW"
            result["risk_score"] = 1.0
            result["flags"] = []
            file_scores.append(1.0)
            continue

        risk_label, risk_score, flags = _score_lines(lines)
        result["risk"] = risk_label
        result["risk_score"] = risk_score
        result["flags"] = flags
        file_scores.append(risk_score)

        for flag in flags:
            all_flags.append({"file": result["filename"], **flag})

    if not file_scores:
        return 1.0, []

    # Weight files with more added lines higher
    aggregate = round(sum(file_scores) / len(file_scores), 4)
    return aggregate, all_flags
