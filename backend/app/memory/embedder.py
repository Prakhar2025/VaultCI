"""
embedder.py — Wraps sentence-transformers for text-to-vector encoding.

Uses all-MiniLM-L6-v2 (384-dim, free, runs locally, no API key).
Model is downloaded on first use and cached by sentence-transformers.
"""
from functools import lru_cache


@lru_cache(maxsize=1)
def _get_model():
    """Load model once, cache in memory for the process lifetime."""
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def embed(text: str) -> list[float]:
    """Encode a single string → 384-dim float list."""
    model = _get_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Encode multiple strings at once (faster than one-by-one)."""
    model = _get_model()
    vectors = model.encode(texts, normalize_embeddings=True)
    return vectors.tolist()
