"""
qdrant_client.py — Qdrant client init + collection creation.

Runs against local Docker qdrant service (no API key, free).
Collections: architectural_decisions, rejected_patterns, code_snippets
All use sentence-transformers/all-MiniLM-L6-v2 → 384 dimensions.
"""
from functools import lru_cache

from app.config import settings

VECTOR_SIZE = 384
COLLECTIONS = [
    "architectural_decisions",
    "rejected_patterns",
    "code_snippets",
]


@lru_cache(maxsize=1)
def get_qdrant():
    """Return a cached Qdrant client instance (local or cloud)."""
    from qdrant_client import QdrantClient
    # If api_key is set → Qdrant Cloud (https), otherwise local Docker
    if settings.qdrant_api_key:
        return QdrantClient(
            host=settings.qdrant_host,
            port=settings.qdrant_port,
            api_key=settings.qdrant_api_key,
            https=True,
        )
    return QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)


def init_collections() -> None:
    """Create all 3 collections if they don't already exist."""
    from qdrant_client.models import Distance, VectorParams

    client = get_qdrant()
    existing = {c.name for c in client.get_collections().collections}

    for name in COLLECTIONS:
        if name not in existing:
            client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
            )
