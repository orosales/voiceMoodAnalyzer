from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from pathlib import Path
import os


# Find .env file - check current dir, parent dir, and project root
def find_env_file():
    """Locate .env file from various possible locations."""
    possible_paths = [
        Path(".env"),                                    # Current directory
        Path("../.env"),                                 # Parent directory
        Path(__file__).parent.parent.parent / ".env",   # Project root
    ]

    for env_path in possible_paths:
        if env_path.exists():
            return str(env_path.resolve())

    return ".env"  # Default fallback


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "mito_books"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "changeme123"

    # Application
    BACKEND_PORT: int = 8000
    FRONTEND_PORT: int = 80  # Frontend port (used in .env but not by backend)
    ENVIRONMENT: str = "production"

    # Upload settings
    MAX_UPLOAD_SIZE: int = 25 * 1024 * 1024  # 25MB
    ALLOWED_AUDIO_FORMATS: list = [".wav", ".mp3", ".m4a", ".ogg", ".flac", ".webm"]

    @property
    def database_url(self) -> str:
        """Generate PostgreSQL connection URL."""
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(
        env_file=find_env_file(),
        case_sensitive=True,
        env_file_encoding='utf-8',
        extra='ignore'  # Ignore extra fields from .env file
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
