from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime
import uuid

# User Schemas
class UserBase(BaseModel):
    """Base schema for User"""
    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=100, description="Unique username")
    full_name: str = Field(..., min_length=1, max_length=255, description="Full name")

class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8, max_length=100, description="User password")

class UserLogin(BaseModel):
    """Schema for user login"""
    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="User password")

class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    password: Optional[str] = Field(None, min_length=8, max_length=100)

class UserResponse(UserBase):
    """Schema for user response (public data only)"""
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    is_active: bool
    is_verified: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

class UserInDB(UserResponse):
    """Schema for user in database (includes sensitive data)"""
    hashed_password: str

# Authentication Schemas
class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class TokenData(BaseModel):
    """Token payload data"""
    username: Optional[str] = None
    user_id: Optional[str] = None

class DocumentBase(BaseModel):
    """Base schema for Document"""
    filename: str = Field(..., min_length=1, max_length=255)
    label: str = Field(..., min_length=1, max_length=100)
    confidence: float = Field(..., ge=0.0, le=1.0)
    override_reason: Optional[str] = Field(None, max_length=255)
    disagreement: bool = Field(default=False)
    summary: Optional[str] = None
    raw_text: Optional[str] = None
    user_id: Optional[str] = None  # Store UUID as string

class DocumentCreate(DocumentBase):
    """Schema for creating a Document"""
    pass

class DocumentUpdate(BaseModel):
    """Schema for updating a Document"""
    filename: Optional[str] = Field(None, min_length=1, max_length=255)
    label: Optional[str] = Field(None, min_length=1, max_length=100)
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    override_reason: Optional[str] = Field(None, max_length=255)
    disagreement: Optional[bool] = None
    summary: Optional[str] = None
    raw_text: Optional[str] = None
    user_id: Optional[str] = Field(None, max_length=100)

class DocumentResponse(DocumentBase):
    """Schema for Document response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ClassificationResult(BaseModel):
    """Schema for classification endpoint response"""
    label: str
    confidence: str  # Formatted as string for frontend
    text: str
    summary: str
    override_reason: str
    disagreement: bool
    document_id: Optional[str] = None  # UUID of saved document

class HistoryResponse(BaseModel):
    """Schema for history endpoint response"""
    documents: list[DocumentResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
