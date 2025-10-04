#!/usr/bin/env python3
"""
Startup script for the Document Classifier API
This script handles database initialization and server startup
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

# Add the server directory to Python path
server_dir = Path(__file__).parent
sys.path.insert(0, str(server_dir))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_requirements():
    """Check if required packages are installed"""
    try:
        import fastapi
        import sqlalchemy
        import psycopg2
        import torch
        logger.info("✅ All required packages are available")
        return True
    except ImportError as e:
        logger.error(f"❌ Missing required package: {e}")
        logger.info("Please install requirements with: pip install -r requirements.txt")
        return False

def setup_database():
    """Initialize database if needed"""
    try:
        from database import engine
        from sqlalchemy import text
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        logger.info("✅ Database connection successful")
        
        # Initialize tables
        from init_db import create_tables
        create_tables()
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Database setup failed: {e}")
        logger.info("\nPlease check:")
        logger.info("1. Your DATABASE_URL in .env file is correct")
        logger.info("2. Your Supabase database is accessible")
        logger.info("3. Your database credentials are valid")
        return False

def start_server():
    """Start the FastAPI server"""
    try:
        import uvicorn
        from config import settings
        
        logger.info(f"🚀 Starting server on {settings.HOST}:{settings.PORT}")
        logger.info(f"📚 API docs will be available at http://{settings.HOST}:{settings.PORT}/docs")
        
        uvicorn.run(
            "main:app",
            host=settings.HOST,
            port=settings.PORT,
            reload=settings.DEBUG,
            log_level="info" if settings.DEBUG else "warning"
        )
        
    except Exception as e:
        logger.error(f"❌ Server startup failed: {e}")
        return False

def main():
    """Main startup function"""
    logger.info("🎯 Starting Document Classifier API...")
    
    # Check requirements
    if not check_requirements():
        sys.exit(1)
    
    # Setup database
    if not setup_database():
        sys.exit(1)
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()