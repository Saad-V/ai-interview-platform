from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    database_url: str
    gemini_api_key: str
    gemini_api_key_2: str
    deepgram_stt_key: str | None = None
    gemini_model: str = "gemini-3.6-flash"
    gemini_fallback_models: list[str] = Field(default_factory=lambda: ["gemini-3.5-flash", "gemini-3.1-flash-lite"])

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()