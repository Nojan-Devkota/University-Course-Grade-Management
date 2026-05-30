from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve .env from the project root so it loads whether uvicorn is started
# from the repo root or from backend/.
PROJECT_ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = PROJECT_ROOT / ".env"


class Settings(BaseSettings):
    """Application configuration, loaded from environment variables or a .env file."""

    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")

    database_url: str = "sqlite+aiosqlite:///./app.db"
    sql_echo: bool = True
    testing: bool = False

    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    staff_username: str = "admin"
    staff_password: str = "adminpass123"

    @field_validator("staff_username", "staff_password", "jwt_secret_key", mode="before")
    @classmethod
    def strip_env_strings(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value


settings = Settings()
