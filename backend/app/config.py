from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os


class Settings(BaseSettings):
    # MongoDB Configuration (Loaded from .env)
    MONGODB_URL: str
    DATABASE_NAME: str = "onlineclip"
    
    # Internal Config
    OTP_EXPIRATION_SECONDS: int = 300
    MAX_PASTE_SIZE_BYTES: int = 5242880
    OTP_LENGTH: int = 4
    RATE_LIMIT_REQUESTS: int = 10
    RATE_LIMIT_WINDOW_SECONDS: int = 300
    
    # TTL presets
    TTL_PRESETS_SECONDS: dict = {5: 300, 60: 3600, 1440: 86400}
    
    # Supported content types
    SUPPORTED_CONTENT_TYPES: list = [
        "text/plain", "text/html", "text/css", "text/javascript",
        "application/json", "application/xml", "application/pdf",
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "image/svg+xml"
    ]

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        env_file_encoding='utf-8',
        extra='ignore'
    )


@lru_cache()
def get_settings():
    return Settings()
