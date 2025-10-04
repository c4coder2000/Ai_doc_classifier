#!/usr/bin/env python3
"""
Debug version of auth router that shows actual errors
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, UserResponse, Token, UserUpdate
from auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    verify_token,
    get_token_expire_time
)
from datetime import datetime, timezone
import logging
from typing import Optional
import uuid
import traceback

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])
security = HTTPBearer()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username or email"""
    return db.query(User).filter(
        (User.username == username) | (User.email == username)
    ).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Authenticate user with username/email and password"""
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from token"""
    token = credentials.credentials
    token_data = verify_token(token)
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = get_user_by_username(db, token_data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

@router.post("/login", response_model=Token)
async def login_debug(login_data: UserLogin, db: Session = Depends(get_db)):
    """DEBUG VERSION: Authenticate user and return access token with detailed errors"""
    try:
        print(f"🔍 DEBUG LOGIN: Starting login for {login_data.username}")
        
        # Step 1: Authenticate user
        print("🔍 DEBUG LOGIN: Step 1 - Authenticating user...")
        user = authenticate_user(db, login_data.username, login_data.password)
        
        if not user:
            print("🔍 DEBUG LOGIN: Authentication failed - user not found or wrong password")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f"🔍 DEBUG LOGIN: User authenticated: {user.username}")
        
        # Step 2: Check if user is active
        print("🔍 DEBUG LOGIN: Step 2 - Checking if user is active...")
        if not user.is_active:
            print(f"🔍 DEBUG LOGIN: User is not active: {user.is_active}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        print(f"🔍 DEBUG LOGIN: User is active: {user.is_active}")
        
        # Step 3: Update last login
        print("🔍 DEBUG LOGIN: Step 3 - Updating last login...")
        user.last_login = datetime.now(timezone.utc)
        db.commit()
        print("🔍 DEBUG LOGIN: Last login updated")

        # Step 4: Create access token
        print("🔍 DEBUG LOGIN: Step 4 - Creating access token...")
        access_token = create_access_token(
            data={"sub": user.username, "user_id": str(user.id)}
        )
        print(f"🔍 DEBUG LOGIN: Access token created: {access_token[:50]}...")

        # Step 5: Get token expire time
        print("🔍 DEBUG LOGIN: Step 5 - Getting token expire time...")
        expires_in = get_token_expire_time()
        print(f"🔍 DEBUG LOGIN: Token expires in: {expires_in} seconds")
        
        # Step 6: Create user response
        print("🔍 DEBUG LOGIN: Step 6 - Creating user response...")
        user_response = UserResponse.model_validate(user)
        print(f"🔍 DEBUG LOGIN: User response created: {user_response.username}")
        
        # Step 7: Create token response
        print("🔍 DEBUG LOGIN: Step 7 - Creating token response...")
        token_response = Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=expires_in,
            user=user_response
        )
        print("🔍 DEBUG LOGIN: Token response created successfully")
        
        logger.info(f"User logged in: {user.username}")
        
        return token_response
        
    except HTTPException as e:
        print(f"🔍 DEBUG LOGIN: HTTPException: {e.detail}")
        raise
    except Exception as e:
        print(f"🔍 DEBUG LOGIN: Unexpected error: {e}")
        print(f"🔍 DEBUG LOGIN: Error type: {type(e)}")
        traceback.print_exc()
        
        # Return the actual error instead of generic message
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

# Test endpoint to verify the router is working
@router.get("/debug-test")
async def debug_test():
    """Simple test endpoint"""
    return {"message": "Debug auth router is working", "status": "ok"}