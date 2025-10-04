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
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = get_user_by_id(db, uuid.UUID(token_data["user_id"]))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user

@router.post("/signup", response_model=Token)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Check if user already exists
        if get_user_by_email(db, user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        if get_user_by_username(db, user_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            is_active=True,
            is_verified=False
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create access token
        access_token = create_access_token(
            data={"sub": db_user.username, "user_id": str(db_user.id)}
        )
        
        logger.info(f"New user registered: {db_user.username} ({db_user.email})")
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=get_token_expire_time(),
            user=UserResponse.model_validate(db_user)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return access token"""
    try:
        user = authenticate_user(db, login_data.username, login_data.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        # Update last login
        user.last_login = datetime.now(timezone.utc)
        db.commit()
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user.username, "user_id": str(user.id)}
        )
        
        logger.info(f"User logged in: {user.username}")
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=get_token_expire_time(),
            user=UserResponse.model_validate(user)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse.model_validate(current_user)

@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    try:
        # Update fields if provided
        if user_update.email is not None:
            # Check if email is already taken by another user
            existing_user = get_user_by_email(db, user_update.email)
            if existing_user and existing_user.id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            current_user.email = user_update.email
        
        if user_update.full_name is not None:
            current_user.full_name = user_update.full_name
        
        if user_update.password is not None:
            current_user.hashed_password = get_password_hash(user_update.password)
        
        current_user.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(current_user)
        
        logger.info(f"User profile updated: {current_user.username}")
        
        return UserResponse.model_validate(current_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed"
        )

@router.post("/verify-token")
async def verify_user_token(current_user: User = Depends(get_current_user)):
    """Verify if token is valid and return user info"""
    return {
        "valid": True,
        "user": UserResponse.model_validate(current_user)
    }

@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user account and all associated data"""
    try:
        username = current_user.username
        db.delete(current_user)
        db.commit()
        
        logger.info(f"User account deleted: {username}")
        
        return {"message": "Account deleted successfully"}
        
    except Exception as e:
        logger.error(f"Account deletion error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Account deletion failed"
        )