from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# asyncpg doesn't support ?sslmode=require — strip it and pass ssl via connect_args
def _build_engine():
    url = settings.database_url
    connect_args = {}
    if "sslmode=require" in url:
        url = url.replace("?sslmode=require", "").replace("&sslmode=require", "")
        connect_args = {"ssl": "require"}
    elif "ssl=true" in url.lower():
        url = url.lower().replace("?ssl=true", "").replace("&ssl=true", "")
        connect_args = {"ssl": "require"}
    return create_async_engine(url, echo=settings.debug, connect_args=connect_args)

engine = _build_engine()
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    """FastAPI dependency — yields an async DB session."""
    async with AsyncSessionLocal() as session:
        yield session
