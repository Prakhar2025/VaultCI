"""Tests for B3 — AST parser + security pattern matcher."""
import pytest
from app.analyzer.ast_parser import parse_diff_files, _detect_language
from app.analyzer.security import score_security


# ── AST parser tests ─────────────────────────────────────────────────────────

def test_parse_extracts_added_lines():
    files = [{"filename": "auth.py", "patch": "+password = 'hello'\n-old = 'x'\n context"}]
    results = parse_diff_files(files)
    assert results[0]["added_lines"] == ["password = 'hello'"]


def test_language_detection():
    assert _detect_language("app.py") == "python"
    assert _detect_language("index.ts") == "typescript"
    assert _detect_language("main.go") == "go"
    assert _detect_language("unknown") == "unknown"


def test_empty_patch():
    files = [{"filename": "readme.md", "patch": ""}]
    results = parse_diff_files(files)
    assert results[0]["added_lines"] == []


# ── Security scanner tests ────────────────────────────────────────────────────

def _make_ast(lines: list[str], filename="test.py") -> list[dict]:
    return [{"filename": filename, "added_lines": lines, "language": "python"}]


def test_hardcoded_secret_flagged():
    ast = _make_ast(['api_key = "sk-super-secret-1234"'])
    score, flags = score_security(ast)
    assert score < 1.0
    assert any(f["pattern"] == "hardcoded_secret" for f in flags)


def test_sql_injection_flagged():
    ast = _make_ast(['cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")'])
    score, flags = score_security(ast)
    assert any(f["pattern"] == "sql_injection" for f in flags)


def test_auth_bypass_flagged():
    ast = _make_ast(["verify = False  # skip ssl"])
    score, flags = score_security(ast)
    assert any(f["pattern"] == "auth_bypass" for f in flags)


def test_eval_usage_flagged():
    ast = _make_ast(["result = eval(user_input)"])
    score, flags = score_security(ast)
    assert any(f["pattern"] == "eval_usage" for f in flags)


def test_clean_code_perfect_score():
    ast = _make_ast([
        "def add(a, b):",
        "    return a + b",
        "result = add(1, 2)",
    ])
    score, flags = score_security(ast)
    assert score == 1.0
    assert flags == []


def test_critical_flag_severity():
    ast = _make_ast(['password = "hunter2"'])
    score, flags = score_security(ast)
    severities = [f["severity"] for f in flags]
    assert "CRITICAL" in severities
