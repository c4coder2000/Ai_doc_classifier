"""
Database initialization and migration script
Run this to set up the database tables
"""

import asyncio
import logging
from database import init_db, engine
from models import Document
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    """Create all database tables"""
    try:
        logger.info("Creating database tables...")
        init_db()
        logger.info("✅ Database tables created successfully!")
        
        # Test connection
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            logger.info("✅ Database connection test successful!")
            
    except Exception as e:
        logger.error(f"❌ Database setup failed: {e}")
        raise

def drop_tables():
    """Drop all database tables (use with caution!)"""
    try:
        logger.warning("⚠️  Dropping all database tables...")
        from database import Base
        Base.metadata.drop_all(bind=engine)
        logger.info("✅ All tables dropped!")
        
    except Exception as e:
        logger.error(f"❌ Failed to drop tables: {e}")
        raise

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--drop":
        drop_tables()
    
    create_tables()
    
    print("\n🎯 Database setup complete!")
    print(f"Database URL: {settings.DATABASE_URL}")
    print("\nYou can now start the API server with:")
    print("python main.py")