import os
import sys
from collections.abc import AsyncGenerator
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

os.environ.setdefault("TESTING", "true")
os.environ.setdefault("SQL_ECHO", "false")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-pytest-min-32-chars")
os.environ.setdefault("STAFF_USERNAME", "admin")
os.environ.setdefault("STAFF_PASSWORD", "adminpass123")


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    from models import Base

    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    from db.session import get_session
    from main import app

    async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_session] = override_get_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def student_payload() -> dict:
    return {
        "first_name": "John",
        "last_name": "Doe",
        "student_number": "AO1234567",
        "email": "john.doe@example.com",
        "password": "securepass",
    }


@pytest.fixture
def course_payload() -> dict:
    return {
        "code": "CS3303",
        "title": "Intro CS",
        "credits": 3,
        "department": "CS",
        "semester": "Fall",
        "year": 2026,
    }


@pytest.fixture
async def registered_student(client: AsyncClient, student_payload: dict) -> dict:
    response = await client.post("/api/v1/students", json=student_payload)
    assert response.status_code == 201
    return response.json()


@pytest.fixture
async def student_token(
    client: AsyncClient, registered_student: dict, student_payload: dict
) -> str:
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": student_payload["email"],
            "password": student_payload["password"],
        },
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture
async def staff_token(client: AsyncClient) -> str:
    response = await client.post(
        "/api/v1/auth/staff/login",
        json={"username": "admin", "password": "adminpass123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]
