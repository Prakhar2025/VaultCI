"""
dependency.py — Dependency graph + blast radius using NetworkX.

Maintains a per-repo directed graph of Python import relationships.
Computes betweenness centrality and blast radius for changed files.
"""
from __future__ import annotations

import re
from typing import Dict, List, Tuple

import networkx as nx

# In-memory graph store: repo_id → DiGraph
# In production this would be persisted to PostgreSQL dependency_graph_snapshots.
_graphs: Dict[str, nx.DiGraph] = {}

_IMPORT_RE = re.compile(
    r"^\s*(?:from\s+([\w.]+)\s+import|import\s+([\w.,\s]+))",
    re.MULTILINE,
)


def _ensure_graph(repo_id: str) -> nx.DiGraph:
    if repo_id not in _graphs:
        _graphs[repo_id] = nx.DiGraph()
    return _graphs[repo_id]


def _extract_imports(code: str) -> List[str]:
    """Return module names imported in a code string."""
    modules = []
    for match in _IMPORT_RE.finditer(code):
        if match.group(1):
            modules.append(match.group(1).split(".")[0])
        elif match.group(2):
            for part in match.group(2).split(","):
                modules.append(part.strip().split(".")[0])
    return [m for m in modules if m]


def update_graph(repo_id: str, filename: str, added_lines: List[str]) -> None:
    """Add edges from filename → each imported module."""
    G = _ensure_graph(repo_id)
    G.add_node(filename)
    imports = _extract_imports("\n".join(added_lines))
    for dep in imports:
        if dep != filename:
            G.add_edge(filename, dep)


def compute_blast_radius(
    repo_id: str,
    changed_files: List[str],
    blast_threshold: int = 20,
) -> Tuple[float, int]:
    """
    Returns:
        (blast_score, affected_count)
        blast_score: 1.0 = low impact, 0.0 = high impact (many dependents)
    """
    G = _ensure_graph(repo_id)

    if G.number_of_nodes() == 0:
        return 1.0, 0

    # Count nodes that depend on (are reachable FROM) the changed files
    affected: set = set()
    for f in changed_files:
        if f in G:
            # Reverse graph to find who imports the changed file
            G_rev = G.reverse()
            reachable = nx.descendants(G_rev, f)
            affected.update(reachable)

    count = len(affected)

    # Normalize: 0 affected = 1.0, blast_threshold or more = 0.0
    score = max(0.0, round(1.0 - (count / max(blast_threshold, 1)), 3))
    return score, count


def get_centrality(repo_id: str) -> Dict[str, float]:
    """Return betweenness centrality map for all nodes in the graph."""
    G = _ensure_graph(repo_id)
    if G.number_of_nodes() < 2:
        return {}
    return nx.betweenness_centrality(G)


def serialize_graph(repo_id: str) -> Dict:
    """Return JSON-serializable graph for PostgreSQL snapshot storage."""
    G = _ensure_graph(repo_id)
    return {
        "nodes": list(G.nodes()),
        "edges": list(G.edges()),
    }
