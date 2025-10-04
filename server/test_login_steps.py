#!/usr/bin/env python3
"""
Test the login endpoint step by step to find the exact error
"""

import sys
import traceback
from database import SessionLocal
from models import User
from routers.auth import authenticate_user
from schemas import UserLogin
from auth import create_access_token, get_token_expire_time
from datetime import datetime, timezone

def test_login_step_by_step():
    """Test each step of the login process"""
    print("🚀 TESTING LOGIN STEP BY STEP")
    print("=" * 50)
    
    # Step 1: Create login data
    print("Step 1: Creating login data...")
    login_data = UserLogin(username="iblees", password="Hassnain2000@")
    print(f"✅ Login data created: {login_data.username}")
    
    # Step 2: Get database session
    print("\nStep 2: Getting database session...")
    db = SessionLocal()
    try:
        print("✅ Database session created")
        
        # Step 3: Authenticate user
        print("\nStep 3: Authenticating user...")
        user = authenticate_user(db, login_data.username, login_data.password)
        if user:
            print(f"✅ User authenticated: {user.username}")
        else:
            print("❌ User authentication failed")
            return False
        
        # Step 4: Check if user is active
        print("\nStep 4: Checking if user is active...")
        if user.is_active:
            print(f"✅ User is active: {user.is_active}")
        else:
            print(f"❌ User is not active: {user.is_active}")
            return False
        
        # Step 5: Update last login
        print("\nStep 5: Updating last login...")
        user.last_login = datetime.now(timezone.utc)
        db.commit()
        print("✅ Last login updated")
        
        # Step 6: Create access token
        print("\nStep 6: Creating access token...")
        token_data = {"sub": user.username, "user_id": str(user.id)}
        print(f"Token data: {token_data}")
        access_token = create_access_token(data=token_data)
        print(f"✅ Access token created: {access_token[:50]}...")
        
        # Step 7: Get token expire time
        print("\nStep 7: Getting token expire time...")
        expires_in = get_token_expire_time()
        print(f"✅ Token expires in: {expires_in} seconds")
        
        # Step 8: Test UserResponse model validation
        print("\nStep 8: Testing UserResponse model validation...")
        from schemas import UserResponse
        user_response = UserResponse.model_validate(user)
        print(f"✅ UserResponse validation successful: {user_response.username}")
        
        # Step 9: Create Token response
        print("\nStep 9: Creating Token response...")
        from schemas import Token
        token_response = Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=expires_in,
            user=user_response
        )
        print(f"✅ Token response created: {token_response.token_type}")
        
        print(f"\n🎉 ALL STEPS SUCCESSFUL!")
        print(f"Final token: {token_response.access_token[:50]}...")
        return True
        
    except Exception as e:
        print(f"❌ Error at step: {e}")
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    test_login_step_by_step()