from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.v1.router import api_router
from core.exceptions import register_exception_handlers
from db.session import engine
from models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Dev convenience: create tables on startup. In production this is replaced
    # by Alembic migrations.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="University Course & Grade Management API",
    version="1.0.0",
    lifespan=lifespan,
)

register_exception_handlers(app)
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}
