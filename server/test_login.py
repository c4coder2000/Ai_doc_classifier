#!/usr/bin/env python3
"""
Test existing user login and create new test user
"""
import requests
import json
from database import SessionLocal
from sqlalchemy import text
from auth import get_password_hash, verify_password

def check_existing_user():
    """Check existing user details"""
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT id, email, username, hashed_password FROM app_users LIMIT 1"))
        user = result.fetchone()
        if user:
            print(f"👤 Found user: {user[2]} ({user[1]})")
            print(f"🔑 Password hash: {user[3][:50]}...")
            
            # Test password verification
            test_passwords = ["password", "hassnain123", "admin", "123456", "Hassnain2000@"]
            for pwd in test_passwords:
                if verify_password(pwd, user[3]):
                    print(f"✅ Password found: {pwd}")
                    return user[2], pwd
                    
            print("❌ None of the test passwords matched")
        else:
            print("❌ No users found")
    finally:
        db.close()
    return None, None

def create_simple_test_user():
    """Create a simple test user directly"""
    db = SessionLocal()
    try:
        # Create test user with known password
        test_password = "test123"
        hashed_password = get_password_hash(test_password)
        
        db.execute(text("""
            INSERT INTO app_users (email, username, full_name, hashed_password, is_active, is_verified)
            VALUES (:email, :username, :full_name, :hashed_password, :is_active, :is_verified)
            ON CONFLICT (email) DO NOTHING
        """), {
            'email': 'test@simple.com',
            'username': 'testsimple',
            'full_name': 'Test Simple User',
            'hashed_password': hashed_password,
            'is_active': True,
            'is_verified': False
        })
        db.commit()
        print(f"✅ Created test user: testsimple / test123")
        return 'testsimple', 'test123'
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        db.rollback()
    finally:
        db.close()
    return None, None

def test_login_api(username, password):
    """Test login API"""
    try:
        login_data = {
            "username": username,
            "password": password
        }
        
        response = requests.post("http://localhost:8000/api/v1/auth/login", json=login_data)
        print(f"🔄 Login test for {username}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            return True
        else:
            print("❌ Login failed!")
            return False
            
    except Exception as e:
        print(f"❌ API error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Existing User Authentication\n")
    
    # Check existing user
    username, password = check_existing_user()
    
    if not username:
        print("\n🆕 Creating simple test user...")
        username, password = create_simple_test_user()
    
    if username and password:
        print(f"\n🧪 Testing login with: {username} / {password}")
        test_login_api(username, password)
    else:
        print("\n❌ No valid user credentials available")
    
    print("\n🏁 Authentication test completed!")