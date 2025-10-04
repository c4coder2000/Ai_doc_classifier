from fastapi import FastAPI, File, UploadFile, Depends
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from typing import Optional
import logging
import uvicorn

# Import configuration and database
from config import settings
from database import init_db, get_db
from middleware import setup_middleware
from routers import classify_router, history_router
from routers.auth import router as auth_router, get_current_user

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("🚀 Starting Document Classifier API...")
    
    try:
        # Initialize database
        init_db()
        logger.info("✅ Database initialized")
        
        # Cleanup old temp files on startup
        from utils.file_ops import file_ops
        cleaned = file_ops.cleanup_temp_dir(max_age_hours=1)
        if cleaned > 0:
            logger.info(f"🧹 Cleaned up {cleaned} old temporary files")
        
        logger.info(f"🎯 API server ready at http://{settings.HOST}:{settings.PORT}")
        logger.info(f"📚 API docs available at http://{settings.HOST}:{settings.PORT}/docs")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Document Classifier API...")
    
    # Final cleanup
    try:
        from utils.file_ops import file_ops
        cleaned = file_ops.cleanup_temp_dir()
        logger.info(f"🧹 Final cleanup: removed {cleaned} temporary files")
    except Exception as e:
        logger.warning(f"Cleanup warning: {e}")

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Setup middleware
setup_middleware(app)

# Include routers
app.include_router(auth_router)
app.include_router(classify_router)
app.include_router(history_router)

# Root endpoint
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "🎯 Slate Intelligence Document Classifier API",
        "version": settings.VERSION,
        "docs": "/docs",
        "auth": "/api/v1/auth",
        "health": "/api/v1/health",
        "classify": "/api/v1/classify",
        "history": "/api/v1/history"
    }

# Legacy classify endpoint (for backward compatibility)
@app.post("/classify")
async def legacy_classify_endpoint(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    save_to_db: bool = True,
    db: Session = Depends(get_db)
):
    """Legacy endpoint - forwards to new classify endpoint"""
    from routers.classify import classify_document
    
    # Forward to the new classify endpoint
    return await classify_document(file, current_user, save_to_db, db)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info" if settings.DEBUG else "warning"
    )
