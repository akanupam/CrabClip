from fastapi import APIRouter, HTTPException, Request
from app.database import get_database
from app.models import PasteRequest, PasteResponse, RetrieveResponse
from app.config import get_settings
from datetime import datetime, timedelta, timezone
import secrets
import hashlib
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["paste"])

# In-memory rate limiting (IP -> (attempts, reset_time))
rate_limit_store = {}


def hash_otp(otp: str) -> str:
    """Hash OTP using SHA-256"""
    return hashlib.sha256(otp.encode()).hexdigest()


def verify_otp(otp: str, hashed: str) -> bool:
    """Verify OTP against hash"""
    return hash_otp(otp) == hashed


def generate_otp(length: int = 6) -> str:
    """Generate random numeric OTP"""
    return "".join(str(secrets.randbelow(10)) for _ in range(length))


def check_rate_limit(client_ip: str) -> bool:
    """Check and update rate limit for client IP"""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    
    if client_ip not in rate_limit_store:
        rate_limit_store[client_ip] = {"attempts": 0, "reset_time": now + timedelta(seconds=settings.RATE_LIMIT_WINDOW_SECONDS)}
        return True
    
    entry = rate_limit_store[client_ip]
    
    # Reset if window has passed
    if now >= entry["reset_time"]:
        entry["attempts"] = 0
        entry["reset_time"] = now + timedelta(seconds=settings.RATE_LIMIT_WINDOW_SECONDS)
        return True
    
    # Check if limit exceeded
    if entry["attempts"] >= settings.RATE_LIMIT_REQUESTS:
        return False
    
    entry["attempts"] += 1
    return True


@router.post("/paste", response_model=PasteResponse)
async def create_paste(request: PasteRequest, req: Request):
    """Create a new paste with OTP and custom TTL"""
    settings = get_settings()
    
    if len(request.content) > settings.MAX_PASTE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Payload too large. Max 10MB allowed.")
    
    # Validate content type
    if request.content_type not in settings.SUPPORTED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported content type: {request.content_type}")
    
    # Validate TTL
    if request.ttl_minutes not in settings.TTL_PRESETS_SECONDS:
        raise HTTPException(status_code=400, detail="Invalid TTL. Must be 5, 20, or 60 minutes")
    
    try:
        db = get_database()
        
        # Generate OTP and hash it
        otp = generate_otp(settings.OTP_LENGTH)
        hashed_otp = hash_otp(otp)
        
        # Create expiration time based on ttl_minutes (timezone-aware UTC)
        ttl_seconds = settings.TTL_PRESETS_SECONDS[request.ttl_minutes]
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds)
        
        # Determine encoding based on content type
        encoding = "base64" if request.content_type.startswith("image/") or request.content_type == "application/pdf" else "utf-8"
        
        # Store in database
        paste_doc = {
            "otp_hash": hashed_otp,
            "content": request.content,
            "content_type": request.content_type,
            "encoding": encoding,
            "filename": request.filename,
            "ttl_minutes": request.ttl_minutes,
            "created_at": datetime.now(timezone.utc),
            "expires_at": expires_at
        }
        
        result = db.pastes.insert_one(paste_doc)
        
        logger.info(f"Paste created with ID: {result.inserted_id}, TTL: {request.ttl_minutes} min")
        
        # Convert expires_at to Unix timestamp in milliseconds for unambiguous client-side parsing
        expires_at_ms = int(expires_at.timestamp() * 1000)
        
        return PasteResponse(otp=otp, expires_at=expires_at_ms)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating paste: {e}")
        raise HTTPException(status_code=500, detail="Failed to create paste")


@router.get("/retrieve/{otp}", response_model=RetrieveResponse)
async def retrieve_paste(otp: str, req: Request):
    """Retrieve paste by OTP and delete it (one-time access)"""
    client_ip = req.client.host
    
    # Check rate limit
    if not check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Too many attempts. Try again later.")
    
    try:
        db = get_database()
        
        # Direct lookup using SHA-256 hash
        hashed_otp = hash_otp(otp)
        paste = db.pastes.find_one({
            "otp_hash": hashed_otp,
            "expires_at": {"$gt": datetime.now(timezone.utc)}
        })
        
        if not paste:
            raise HTTPException(status_code=404, detail="OTP invalid or expired")
        
        # Extract content metadata
        content_type = paste.get("content_type", "text/plain")
        encoding = paste.get("encoding", "utf-8")
        filename = paste.get("filename")
        
        # Content is no longer deleted after retrieval. It remains until expires_at.
        logger.info(f"Paste retrieved from IP: {client_ip}")
        
        return RetrieveResponse(content=paste["content"], content_type=content_type, encoding=encoding, filename=filename)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving paste: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve paste")
