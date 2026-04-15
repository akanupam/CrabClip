from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal


class PasteRequest(BaseModel):
    content: str = Field(..., max_length=5242880)  # 5 MB
    ttl_minutes: int = Field(5, ge=1, le=1440)  # 1 min to 24 hours, default 5 min
    content_type: str = Field("text/plain")  # mime type: text/plain, image/png, etc.
    filename: Optional[str] = None


class PasteResponse(BaseModel):
    otp: str
    expires_at: int  # Unix timestamp in milliseconds


class RetrieveResponse(BaseModel):
    content: str
    content_type: str = "text/plain"
    encoding: str = "utf-8"  # utf-8 for text, base64 for binary
    filename: Optional[str] = None


class ErrorResponse(BaseModel):
    detail: str


class HealthResponse(BaseModel):
    status: str
    database: str
