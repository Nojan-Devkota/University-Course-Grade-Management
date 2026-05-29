from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.config import settings

# The engine owns the connection pool. Create it once and reuse it everywhere.
engine = create_async_engine(settings.database_url, echo=settings.sql_echo)

# Factory that hands out fresh AsyncSession objects. expire_on_commit=False keeps
# attributes accessible after commit, which avoids a common async pitfall.
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a database session per request.

    The ``async with`` block guarantees the session is closed even if the
    request handler raises.
    """
    async with SessionLocal() as session:
        yield session
