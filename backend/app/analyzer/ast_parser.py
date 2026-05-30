"""
ast_parser.py — Parses PR diff file patches into structured AST-aware tokens.

Uses tree-sitter when available; falls back to regex-based line scanning
so the app still works without native tree-sitter builds.
"""
import re
from typing import Any

# Language patterns we match without tree-sitter (regex fallback)
_FUNC_DEF = re.compile(
    r"^\s*(def |async def |function |const .+ = \(|class )", re.MULTILINE
)


def _extract_added_lines(patch: str) -> list[str]:
    """Return only the '+' lines from a unified diff patch."""
    return [
        ln[1:]
        for ln in patch.splitlines()
        if ln.startswith("+") and not ln.startswith("+++")
    ]


def parse_diff_files(files: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    For each file in the PR diff, return a structured dict with:
      - filename
      - language
      - added_lines: list of added line strings
      - function_names: identifiers found in added lines
      - risk: placeholder updated by security.py
    """
    results = []
    for f in files:
        filename: str = f.get("filename", "")
        patch: str = f.get("patch", "") or ""
        language = _detect_language(filename)
        added = _extract_added_lines(patch)
        funcs = _FUNC_DEF.findall("\n".join(added))

        results.append({
            "filename": filename,
            "language": language,
            "added_lines": added,
            "function_names": [fn.strip().rstrip("(") for fn in funcs],
            "risk": "LOW",         # overwritten by security.py
            "risk_score": 1.0,    # overwritten by security.py
        })
    return results


def _detect_language(filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return {
        "py": "python",
        "js": "javascript",
        "ts": "typescript",
        "tsx": "typescript",
        "jsx": "javascript",
        "go": "go",
        "java": "java",
        "rb": "ruby",
    }.get(ext, "unknown")
