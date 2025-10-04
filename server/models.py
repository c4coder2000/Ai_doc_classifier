from sqlalchemy import Column, String, Float, Boolean, Text, DateTime, UUID, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

class User(Base):
    """User model for authentication and profile management"""
    __tablename__ = "app_users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Documents are referenced by user_id string - no direct relationship
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"
    
    def to_dict(self):
        """Convert model to dictionary (excluding sensitive data)"""
        return {
            "id": str(self.id),
            "email": self.email,
            "username": self.username,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None
        }

class Document(Base):
    """Document model for storing classification results"""
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    filename = Column(String(255), nullable=False, index=True)
    label = Column(String(100), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    override_reason = Column(String(255), nullable=True)
    disagreement = Column(Boolean, default=False)
    summary = Column(Text, nullable=True)
    raw_text = Column(Text, nullable=True)
    user_id = Column(String(36), nullable=True, index=True)  # Store UUID as string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # No direct relationship - using user_id as string reference
    
    def __repr__(self):
        return f"<Document(id={self.id}, filename={self.filename}, label={self.label})>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": str(self.id),
            "filename": self.filename,
            "label": self.label,
            "confidence": self.confidence,
            "override_reason": self.override_reason,
            "disagreement": self.disagreement,
            "summary": self.summary,
            "raw_text": self.raw_text,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
