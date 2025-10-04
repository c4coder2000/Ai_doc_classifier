#!/usr/bin/env python3
"""
Minimal FastAPI server for testing authentication only
"""

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth_debug import router as auth_router
import uvicorn

# Create minimal FastAPI app
app = FastAPI(
    title="Auth Test Server",
    description="Minimal server for testing authentication",
    version="1.0.0"
)

# Include only the auth router
app.include_router(auth_router)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Auth test server", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "auth_test_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )