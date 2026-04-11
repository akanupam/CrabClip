from fastapi import APIRouter, HTTPException
from app.database import get_database
from app.models import HealthResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check if backend and database are healthy"""
    try:
        db = get_database()
        db.command("ping")
        return HealthResponse(status="ok", database="connected")
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Database connection failed")
