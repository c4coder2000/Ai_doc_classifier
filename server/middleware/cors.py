from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
import logging

logger = logging.getLogger(__name__)

def setup_cors(app: FastAPI) -> None:
    """Configure CORS middleware for the FastAPI application"""
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=settings.ALLOWED_METHODS,
        allow_headers=settings.ALLOWED_HEADERS,
        expose_headers=["*"],
        max_age=600  # Cache preflight requests for 10 minutes
    )
    
    logger.info(f"CORS configured with origins: {settings.ALLOWED_ORIGINS}")

def setup_security_headers(app: FastAPI) -> None:
    """Add security headers middleware"""
    
    @app.middleware("http")
    async def add_security_headers(request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # API-specific headers
        response.headers["X-API-Version"] = settings.VERSION
        response.headers["X-Powered-By"] = "FastAPI + Slate Intelligence"
        
        return response
    
    logger.info("Security headers middleware configured")

def setup_request_logging(app: FastAPI) -> None:
    """Add request logging middleware"""
    
    @app.middleware("http")
    async def log_requests(request, call_next):
        import time
        
        start_time = time.time()
        
        # Log request
        logger.info(
            f"Incoming request: {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'}"
        )
        
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"Request completed: {request.method} {request.url.path} "
            f"-> {response.status_code} in {process_time:.3f}s"
        )
        
        # Add timing header
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
    
    logger.info("Request logging middleware configured")

def setup_middleware(app: FastAPI) -> None:
    """Setup all middleware for the application"""
    setup_cors(app)
    setup_security_headers(app)
    
    if settings.DEBUG:
        setup_request_logging(app)
    
    logger.info("All middleware configured successfully")
