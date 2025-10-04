from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from models import Document, User
from schemas import DocumentCreate, DocumentUpdate, UserCreate
from typing import List, Optional
import uuid
import logging

logger = logging.getLogger(__name__)

def create_document(db: Session, document: DocumentCreate) -> Document:
    """Create a new document record"""
    try:
        db_document = Document(**document.model_dump())
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        logger.info(f"Created document: {db_document.id}")
        return db_document
    except Exception as e:
        logger.error(f"Error creating document: {e}")
        db.rollback()
        raise

def get_document(db: Session, document_id: uuid.UUID) -> Optional[Document]:
    """Get a document by ID"""
    try:
        return db.query(Document).filter(Document.id == document_id).first()
    except Exception as e:
        logger.error(f"Error getting document {document_id}: {e}")
        raise

def get_documents(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    user_id: Optional[str] = None,
    label_filter: Optional[str] = None
) -> List[Document]:
    """Get documents with pagination and optional filters"""
    try:
        query = db.query(Document)
        
        if user_id:
            query = query.filter(Document.user_id == user_id)
        
        if label_filter:
            query = query.filter(Document.label == label_filter)
        
        return (
            query
            .order_by(desc(Document.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )
    except Exception as e:
        logger.error(f"Error getting documents for user {user_id}: {e}")
        raise

def get_documents_count(
    db: Session,
    user_id: Optional[str] = None,
    label_filter: Optional[str] = None
) -> int:
    """Get total count of documents with optional filters"""
    try:
        query = db.query(func.count(Document.id))
        
        if user_id:
            query = query.filter(Document.user_id == user_id)
        
        if label_filter:
            query = query.filter(Document.label == label_filter)
        
        return query.scalar()
    except Exception as e:
        logger.error(f"Error getting documents count for user {user_id}: {e}")
        raise

def update_document(
    db: Session, 
    document_id: uuid.UUID, 
    document_update: DocumentUpdate
) -> Optional[Document]:
    """Update a document record"""
    try:
        db_document = get_document(db, document_id)
        if not db_document:
            return None
        
        update_data = document_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_document, field, value)
        
        db.commit()
        db.refresh(db_document)
        logger.info(f"Updated document: {document_id}")
        return db_document
    except Exception as e:
        logger.error(f"Error updating document {document_id}: {e}")
        db.rollback()
        raise

def delete_document(db: Session, document_id: uuid.UUID) -> bool:
    """Delete a document record"""
    try:
        db_document = get_document(db, document_id)
        if not db_document:
            return False
        
        db.delete(db_document)
        db.commit()
        logger.info(f"Deleted document: {document_id}")
        return True
    except Exception as e:
        logger.error(f"Error deleting document {document_id}: {e}")
        db.rollback()
        raise

def get_recent_documents(
    db: Session, 
    limit: int = 10,
    user_id: Optional[str] = None
) -> List[Document]:
    """Get most recent documents"""
    try:
        query = db.query(Document)
        
        if user_id:
            query = query.filter(Document.user_id == user_id)
        
        return (
            query
            .order_by(desc(Document.created_at))
            .limit(limit)
            .all()
        )
    except Exception as e:
        logger.error(f"Error getting recent documents for user {user_id}: {e}")
        raise

def get_documents_by_label(
    db: Session, 
    label: str,
    limit: int = 50,
    user_id: Optional[str] = None
) -> List[Document]:
    """Get documents by label"""
    try:
        query = db.query(Document).filter(Document.label == label)
        
        if user_id:
            query = query.filter(Document.user_id == user_id)
        
        return (
            query
            .order_by(desc(Document.created_at))
            .limit(limit)
            .all()
        )
    except Exception as e:
        logger.error(f"Error getting documents by label {label}: {e}")
        raise
