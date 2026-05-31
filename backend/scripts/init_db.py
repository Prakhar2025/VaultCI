"""
init_db.py — Run once to create PostgreSQL tables and Qdrant collections.
Usage: python scripts/init_db.py
"""
import asyncio
import sys
import os

# Allow running from /backend root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import engine, Base
from app.models import Repository, PRTrustReport, DependencyGraphSnapshot  # noqa: F401 — registers models


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("PostgreSQL tables created.")


def create_qdrant_collections():
    try:
        from qdrant_client import QdrantClient
        from qdrant_client.models import Distance, VectorParams
        from app.config import settings

        client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)
        existing = {c.name for c in client.get_collections().collections}

        collections = [
            ("architectural_decisions", 384, Distance.COSINE),
            ("rejected_patterns", 384, Distance.COSINE),
            ("code_snippets", 384, Distance.COSINE),
        ]
        for name, size, dist in collections:
            if name not in existing:
                client.create_collection(
                    collection_name=name,
                    vectors_config=VectorParams(size=size, distance=dist),
                )
                print(f"Qdrant collection created: {name}")
            else:
                print(f"Qdrant collection already exists: {name}")
    except Exception as e:
        print(f"Qdrant not reachable (skip for now): {e}")


if __name__ == "__main__":
    asyncio.run(create_tables())
    create_qdrant_collections()
    print("\nVaultCI DB init complete.")
