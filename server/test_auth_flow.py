#!/usr/bin/env python3
"""
Authentication Flow Debug Script
Tests the complete authentication flow to identify exactly where it's failing
"""

import sys
import traceback
from database import SessionLocal
from models import User
from routers.auth import get_user_by_username, verify_password, create_access_token
from sqlalchemy import text
import bcrypt

def test_database_connection():
    """Test basic database connectivity"""
    print("=" * 50)
    print("🔍 TESTING DATABASE CONNECTION")
    print("=" * 50)
    
    try:
        db = SessionLocal()
        result = db.execute(text("SELECT 1"))
        print("✅ Database connection successful")
        db.close()
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        traceback.print_exc()
        return False

def test_user_table():
    """Test if app_users table exists and has data"""
    print("\n" + "=" * 50)
    print("🔍 TESTING USER TABLE")
    print("=" * 50)
    
    db = SessionLocal()
    try:
        # Check table structure
        result = db.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'app_users'"))
        columns = result.fetchall()
        print(f"✅ Table structure:")
        for col in columns:
            print(f"   - {col[0]}: {col[1]}")
        
        # Check data
        result = db.execute(text("SELECT username, email FROM app_users"))
        users = result.fetchall()
        print(f"✅ Found {len(users)} users:")
        for user in users:
            print(f"   - {user[0]} ({user[1]})")
        
        return len(users) > 0
    except Exception as e:
        print(f"❌ User table test failed: {e}")
        traceback.print_exc()
        return False
    finally:
        db.close()

def test_sqlalchemy_model():
    """Test SQLAlchemy User model"""
    print("\n" + "=" * 50)
    print("🔍 TESTING SQLALCHEMY MODEL")
    print("=" * 50)
    
    db = SessionLocal()
    try:
        # Test querying through SQLAlchemy
        users = db.query(User).all()
        print(f"✅ SQLAlchemy found {len(users)} users:")
        for user in users:
            print(f"   - {user.username} ({user.email})")
        
        # Test specific user
        test_user = db.query(User).filter(User.username == "iblees").first()
        if test_user:
            print(f"✅ Found test user: {test_user.username}")
            return test_user
        else:
            print("❌ Test user 'iblees' not found")
            return None
    except Exception as e:
        print(f"❌ SQLAlchemy model test failed: {e}")
        traceback.print_exc()
        return None
    finally:
        db.close()

def test_auth_functions(test_user):
    """Test authentication functions"""
    print("\n" + "=" * 50)
    print("🔍 TESTING AUTH FUNCTIONS")
    print("=" * 50)
    
    db = SessionLocal()
    try:
        # Test get_user_by_username function
        print("Testing get_user_by_username...")
        user = get_user_by_username(db, "iblees")
        if user:
            print(f"✅ get_user_by_username works: {user.username}")
        else:
            print("❌ get_user_by_username failed")
            return False
        
        # Test password verification
        print("Testing password verification...")
        test_password = "Hassnain2000@"
        if verify_password(test_password, user.hashed_password):
            print("✅ Password verification works")
        else:
            print("❌ Password verification failed")
            # Debug password hash
            print(f"Stored hash: {user.hashed_password}")
            print(f"Test password: {test_password}")
            
        # Test token creation
        print("Testing token creation...")
        token = create_access_token(data={"sub": user.username})
        if token:
            print(f"✅ Token creation works: {token[:50]}...")
        else:
            print("❌ Token creation failed")
        
        return True
    except Exception as e:
        print(f"❌ Auth functions test failed: {e}")
        traceback.print_exc()
        return False
    finally:
        db.close()

def test_manual_password_check():
    """Manually test password verification"""
    print("\n" + "=" * 50)
    print("🔍 MANUAL PASSWORD CHECK")
    print("=" * 50)
    
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT username, hashed_password FROM app_users WHERE username = 'iblees'"))
        user_data = result.fetchone()
        
        if user_data:
            username, stored_hash = user_data
            test_password = "Hassnain2000@"
            
            print(f"Username: {username}")
            print(f"Stored hash: {stored_hash}")
            print(f"Test password: {test_password}")
            
            # Try bcrypt verification
            if bcrypt.checkpw(test_password.encode('utf-8'), stored_hash.encode('utf-8')):
                print("✅ Manual bcrypt verification SUCCESS")
            else:
                print("❌ Manual bcrypt verification FAILED")
                
        return True
    except Exception as e:
        print(f"❌ Manual password check failed: {e}")
        traceback.print_exc()
        return False
    finally:
        db.close()

def main():
    """Run all tests"""
    print("🚀 STARTING AUTHENTICATION FLOW DEBUG")
    print("Testing user: iblees")
    print("Testing password: Hassnain2000@")
    
    # Run tests in sequence
    if not test_database_connection():
        return
    
    if not test_user_table():
        return
    
    test_user = test_sqlalchemy_model()
    if not test_user:
        return
    
    test_manual_password_check()
    test_auth_functions(test_user)
    
    print("\n" + "=" * 50)
    print("🏁 DEBUG COMPLETE")
    print("=" * 50)

if __name__ == "__main__":
    main()