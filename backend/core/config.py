from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration, loaded from environment variables or a .env file.

    Centralizing config means switching to PostgreSQL later is a one-line change
    (set DATABASE_URL to a ``postgresql+asyncpg://...`` value); no code changes.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite+aiosqlite:///./app.db"
    sql_echo: bool = True


settings = Settings()
