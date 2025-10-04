#!/usr/bin/env python3
"""
Debug authentication issues step by step
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'server'))

from database import SessionLocal
from models import User
from auth import verify_password, get_password_hash, create_access_token
from routers.auth import get_user_by_username
from sqlalchemy import text

def test_direct_auth():
    """Test authentication components directly"""
    db = SessionLocal()
    
    try:
        print("🧪 Testing Direct Authentication Components\n")
        
        # Test 1: Check if user exists in app_users
        print("1. Checking user in app_users table...")
        result = db.execute(text("SELECT id, username, email, hashed_password FROM app_users WHERE username = 'iblees'"))
        user_data = result.fetchone()
        
        if user_data:
            print(f"✅ User found: {user_data[1]} ({user_data[2]})")
            user_id, username, email, hashed_password = user_data
        else:
            print("❌ User not found in app_users table")
            return
        
        # Test 2: Test password verification
        print("\n2. Testing password verification...")
        test_password = "Hassnain2000@"
        is_valid = verify_password(test_password, hashed_password)
        print(f"Password '{test_password}' valid: {is_valid}")
        
        if not is_valid:
            print("❌ Password verification failed")
            return
        
        # Test 3: Test SQLAlchemy User model query
        print("\n3. Testing SQLAlchemy User model...")
        try:
            sqlalchemy_user = db.query(User).filter(User.username == username).first()
            if sqlalchemy_user:
                print(f"✅ SQLAlchemy User found: {sqlalchemy_user.username}")
                print(f"   ID: {sqlalchemy_user.id}")
                print(f"   Email: {sqlalchemy_user.email}")
                print(f"   Active: {sqlalchemy_user.is_active}")
            else:
                print("❌ SQLAlchemy User query failed")
                return
        except Exception as e:
            print(f"❌ SQLAlchemy User query error: {e}")
            return
        
        # Test 4: Test auth router function
        print("\n4. Testing auth router function...")
        try:
            router_user = get_user_by_username(db, username)
            if router_user:
                print(f"✅ Auth router found user: {router_user.username}")
            else:
                print("❌ Auth router get_user_by_username failed")
                return
        except Exception as e:
            print(f"❌ Auth router error: {e}")
            return
        
        # Test 5: Test JWT token creation
        print("\n5. Testing JWT token creation...")
        try:
            token = create_access_token(
                data={"sub": username, "user_id": str(user_id)}
            )
            print(f"✅ JWT token created: {token[:50]}...")
        except Exception as e:
            print(f"❌ JWT token creation error: {e}")
            return
        
        print("\n🎉 All authentication components working!")
        print(f"   Username: {username}")
        print(f"   Password: {test_password}")
        print("   Try logging in with these credentials.")
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

def test_full_auth_flow():
    """Test the complete authentication flow"""
    print("\n" + "="*50)
    print("🔄 Testing Complete Auth Flow")
    
    try:
        from routers.auth import router
        from fastapi.testclient import TestClient
        from main import app
        
        client = TestClient(app)
        
        # Test login
        login_data = {
            "username": "iblees",
            "password": "Hassnain2000@"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        print(f"Login response status: {response.status_code}")
        print(f"Login response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login API working!")
        else:
            print("❌ Login API failed")
            
    except Exception as e:
        print(f"❌ Full auth flow test error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_direct_auth()
    test_full_auth_flow()