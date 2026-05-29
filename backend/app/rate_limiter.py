from fastapi import Request, HTTPException
from datetime import datetime, timedelta, timezone
from app.database import get_database
from app.config import get_settings

def check_rate_limit(request: Request, limit_type: str, max_requests: int):
    """
    Check rate limit for a given IP and limit type.
    Raises HTTPException 429 if the limit is exceeded.
    """
    settings = get_settings()
    client_ip = request.client.host if request.client else "unknown"
    db = get_database()
    
    now = datetime.now(timezone.utc)
    # The document ID combines IP and the type of limit (e.g. paste vs retrieve)
    doc_id = f"{client_ip}:{limit_type}"
    
    # We use find_one_and_update to atomically increment the count
    # If the document doesn't exist, upsert=True creates it
    # We set expires_at only on insert so the TTL index can clean it up after the window
    result = db.rate_limits.find_one_and_update(
        {"_id": doc_id},
        {
            "$inc": {"count": 1},
            "$setOnInsert": {
                "expires_at": now + timedelta(seconds=settings.RATE_LIMIT_WINDOW_SECONDS)
            }
        },
        upsert=True,
        return_document=True # Returns the updated document
    )
    
    if result["count"] > max_requests:
        raise HTTPException(status_code=429, detail="Too many attempts. Try again later.")
    
    return True
