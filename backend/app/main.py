from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware import Middleware
from app.routes import paste, health
from app.database import close_mongo_client
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# CORS middleware - configurable via environment variable
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
cors_origins = [origin.strip() for origin in cors_origins]  # Strip whitespace

middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
]

app = FastAPI(
    title="OnlineClip API",
    description="Anonymous clipboard with OTP sharing",
    version="1.0.0",
    middleware=middleware
)

# Include routers
app.include_router(health.router)
app.include_router(paste.router)


@app.on_event("startup")
async def startup_event():
    logger.info("FastAPI app starting up...")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("FastAPI app shutting down...")
    close_mongo_client()


@app.get("/")
async def root():
    return {"message": "CrabClip API", "version": "1.0.0"}
