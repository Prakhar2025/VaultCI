"""Tests for B5 — NetworkX dependency graph + blast radius."""
import pytest
from app.graph.dependency import (
    update_graph,
    compute_blast_radius,
    get_centrality,
    serialize_graph,
    _graphs,
)


@pytest.fixture(autouse=True)
def clear_graphs():
    """Reset in-memory graph store between tests."""
    _graphs.clear()
    yield
    _graphs.clear()


def test_blast_radius_no_graph():
    """Empty graph returns perfect score and zero count."""
    score, count = compute_blast_radius("owner/repo", ["auth.py"])
    assert score == 1.0
    assert count == 0


def test_update_graph_adds_edges():
    update_graph("owner/repo", "auth.py", ["from database import db", "import os"])
    G = _graphs["owner/repo"]
    assert "auth.py" in G.nodes()
    assert G.has_edge("auth.py", "database")
    assert G.has_edge("auth.py", "os")


def test_blast_radius_high_centrality():
    """
    utils.py is imported by 3 files → blast radius = 3 when utils.py changes.
    """
    repo = "owner/repo"
    for f in ["service_a.py", "service_b.py", "service_c.py"]:
        update_graph(repo, f, [f"from utils import helper"])
    # Now change utils.py — 3 services depend on it
    score, count = compute_blast_radius(repo, ["utils"], blast_threshold=5)
    assert count == 3
    assert score < 1.0


def test_blast_radius_below_threshold():
    """Only 1 dependent → score close to 1."""
    repo = "owner/repo"
    update_graph(repo, "api.py", ["from utils import thing"])
    score, count = compute_blast_radius(repo, ["utils"], blast_threshold=20)
    assert count == 1
    assert score >= 0.9


def test_serialize_graph():
    update_graph("owner/repo", "a.py", ["import b"])
    result = serialize_graph("owner/repo")
    assert "nodes" in result
    assert "edges" in result
    assert "a.py" in result["nodes"]


def test_centrality_empty_graph():
    result = get_centrality("owner/repo")
    assert result == {}
