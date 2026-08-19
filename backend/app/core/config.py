"""Runtime configuration loaded from environment variables or ``.env``."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with safe local-development defaults."""

    project_name: str = "Bal Vote API"
    secret_key: str = "development-only-secret-change-before-production"
    database_url: str = "sqlite:///./bal_vote.db"
    backend_cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
    ]
    access_token_expire_minutes: int = 60
    first_superuser: str = "admin"
    first_superuser_password: str | None = None
    cloudinary_url: str | None = None
    media_root: Path = Path("media")
    max_photo_size_bytes: int = 10 * 1024 * 1024

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
