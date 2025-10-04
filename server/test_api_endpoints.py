#!/usr/bin/env python3
"""
Test the actual login API endpoint
"""

import requests
import json

def test_login_endpoint():
    """Test the /auth/login endpoint directly"""
    print("🔍 Testing /auth/login endpoint...")
    
    # Login data
    login_data = {
        "username": "iblees",
        "password": "Hassnain2000@"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/auth/login",
            json=login_data,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Content: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login endpoint SUCCESS")
            return True
        else:
            print("❌ Login endpoint FAILED")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server - is it running on http://localhost:8000?")
        return False
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

def test_signup_endpoint():
    """Test the /auth/signup endpoint"""
    print("\n🔍 Testing /auth/signup endpoint...")
    
    # Signup data for a test user
    signup_data = {
        "username": "testuser123",
        "email": "test@example.com",
        "password": "TestPassword123!",
        "full_name": "Test User"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/auth/signup",
            json=signup_data,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Content: {response.text}")
        
        if response.status_code == 200:
            print("✅ Signup endpoint SUCCESS")
            return True
        else:
            print("❌ Signup endpoint FAILED")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server")
        return False
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 TESTING API ENDPOINTS")
    print("=" * 50)
    
    test_login_endpoint()
    test_signup_endpoint()