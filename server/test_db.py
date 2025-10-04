#!/usr/bin/env python3
"""
Test Supabase database connection and table status
"""
import os
from database import engine
from sqlalchemy import text
import traceback

def test_database():
    """Test database connection and tables"""
    try:
        with engine.connect() as conn:
            print('🔍 Checking Supabase database...')
            
            # Check tables
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"))
            tables = [row[0] for row in result.fetchall()]
            print(f'📋 Tables found: {tables}')
            
            # Check users table
            if 'users' in tables:
                print('✅ Users table exists')
                result = conn.execute(text('SELECT COUNT(*) FROM users;'))
                count = result.fetchone()[0]
                print(f'👥 User count: {count}')
                
                # Check users table structure
                result = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';"))
                columns = [(row[0], row[1]) for row in result.fetchall()]
                print(f'📝 Users table columns: {columns}')
            else:
                print('❌ Users table missing!')
                
            # Check documents table
            if 'documents' in tables:
                print('✅ Documents table exists')
                result = conn.execute(text('SELECT COUNT(*) FROM documents;'))
                count = result.fetchone()[0]
                print(f'📄 Document count: {count}')
            else:
                print('❌ Documents table missing!')
                
    except Exception as e:
        print(f'❌ Database error: {e}')
        traceback.print_exc()

def test_user_creation():
    """Test creating a user directly"""
    try:
        from models import User
        from database import SessionLocal
        from auth import get_password_hash
        import uuid
        
        db = SessionLocal()
        
        # Try to create a test user
        test_user = User(
            email="dbtest@test.com",
            username="dbtest",
            full_name="DB Test User",
            hashed_password=get_password_hash("testpass123"),
            is_active=True,
            is_verified=False
        )
        
        # Check if user already exists
        existing = db.query(User).filter(User.email == test_user.email).first()
        if existing:
            print(f'👤 Test user already exists: {existing.username}')
            db.close()
            return
            
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print(f'✅ Successfully created test user: {test_user.username} (ID: {test_user.id})')
        db.close()
        
    except Exception as e:
        print(f'❌ User creation error: {e}')
        traceback.print_exc()
        if 'db' in locals():
            db.rollback()
            db.close()

if __name__ == "__main__":
    print("🚀 Testing Supabase Database Connection\n")
    test_database()
    print("\n" + "="*50 + "\n")
    test_user_creation()
    print("\n🏁 Database test completed!")