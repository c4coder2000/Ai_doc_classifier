#!/usr/bin/env python3
"""
Simple test script to verify authentication endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1/auth"

def test_signup():
    """Test user signup"""
    print("🔄 Testing user signup...")
    
    signup_data = {
        "email": "debug@test.com",
        "username": "debuguser", 
        "full_name": "Debug User",
        "password": "debugpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/signup", json=signup_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Signup successful!")
            return response.json()
        else:
            print("❌ Signup failed!")
            return None
            
    except Exception as e:
        print(f"❌ Error during signup: {e}")
        return None

def test_login():
    """Test user login"""
    print("\n🔄 Testing user login...")
    
    login_data = {
        "username": "debuguser",
        "password": "debugpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            return response.json()
        else:
            print("❌ Login failed!")
            return None
            
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return None

def test_health():
    """Test API health"""
    print("🔄 Testing API health...")
    
    try:
        response = requests.get("http://localhost:8000/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ API is healthy!")
        else:
            print("❌ API health check failed!")
            
    except Exception as e:
        print(f"❌ Error during health check: {e}")

if __name__ == "__main__":
    print("🚀 Starting Authentication Debug Test\n")
    
    # Test API health first
    test_health()
    
    # Test signup
    signup_result = test_signup()
    
    # Test login
    login_result = test_login()
    
    print("\n🏁 Debug test completed!")