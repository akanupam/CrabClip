from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)

_client = None


def get_mongo_client():
    global _client
    if _client is None:
        settings = get_settings()
        try:
            _client = MongoClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=5000,
                retryWrites=True,
                connectTimeoutMS=10000,
            )
            # Test connection
            _client.admin.command("ping")
            logger.info("MongoDB connected successfully")
        except ServerSelectionTimeoutError as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise e
    return _client


def get_database():
    settings = get_settings()
    client = get_mongo_client()
    db = client[settings.DATABASE_NAME]
    
    # Create TTL index to auto-delete expired pastes
    # expireAfterSeconds=0 means delete when expires_at <= current time
    try:
        db.pastes.create_index("expires_at", expireAfterSeconds=0)
        logger.info("TTL index created/verified for pastes collection")
    except Exception as e:
        logger.warning(f"TTL index creation warning: {e}")
    
    # Create index on otp_hash for faster retrieval lookups
    try:
        db.pastes.create_index("otp_hash", unique=True)
        logger.info("Unique index created/verified for otp_hash")
    except Exception as e:
        logger.warning(f"otp_hash index creation warning: {e}")
    
    return db


def close_mongo_client():
    global _client
    if _client is not None:
        _client.close()
        _client = None
        logger.info("MongoDB connection closed")
