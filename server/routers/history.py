from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from schemas import DocumentResponse, HistoryResponse, UserResponse
from routers.auth import get_current_user
from crud import (
    get_documents, 
    get_documents_count, 
    get_document,
    get_recent_documents,
    get_documents_by_label,
    delete_document
)
from utils.helpers import pagination_helpers
from typing import Optional, List
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

@router.get("/history", response_model=List[DocumentResponse])
async def get_user_document_history(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's document classification history"""
    try:
        # Get all documents for the current user
        user_id_str = str(current_user.id)  # Convert UUID to string
        
        documents = get_documents(
            db, 
            skip=0, 
            limit=1000,  # Get all documents for now
            user_id=user_id_str
        )
        
        # Convert to response format
        document_responses = [DocumentResponse.model_validate(doc) for doc in documents]
        
        return document_responses
        
    except Exception as e:
        logger.error(f"Error getting user document history: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve document history: {str(e)}"
        )

@router.get("/history/recent", response_model=List[DocumentResponse])
async def get_recent_classifications(
    current_user: UserResponse = Depends(get_current_user),
    limit: int = Query(10, ge=1, le=50, description="Number of recent items"),
    db: Session = Depends(get_db)
):
    """Get recent classification results for current user"""
    try:
        # Convert user ID to string
        user_id_str = str(current_user.id)
        
        documents = get_recent_documents(db, limit=limit, user_id=user_id_str)
        return [DocumentResponse.model_validate(doc) for doc in documents]
        
    except Exception as e:
        logger.error(f"Error getting recent classifications: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve recent classifications: {str(e)}"
        )

@router.get("/history/by-label/{label}", response_model=List[DocumentResponse])
async def get_classifications_by_label(
    label: str,
    current_user: UserResponse = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    db: Session = Depends(get_db)
):
    """Get classifications filtered by document label for current user"""
    try:
        # Convert user ID to string
        user_id_str = str(current_user.id)
        
        documents = get_documents_by_label(
            db, 
            label=label, 
            limit=limit, 
            user_id=user_id_str
        )
        return [DocumentResponse.model_validate(doc) for doc in documents]
        
    except Exception as e:
        logger.error(f"Error getting classifications by label {label}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve classifications for label '{label}': {str(e)}"
        )

@router.get("/history/{document_id}", response_model=DocumentResponse)
async def get_classification_by_id(
    document_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific classification by document ID"""
    try:
        # Validate UUID format
        doc_uuid = uuid.UUID(document_id)
        
        document = get_document(db, doc_uuid)
        if not document:
            raise HTTPException(
                status_code=404,
                detail=f"Document with ID {document_id} not found"
            )
        
        return DocumentResponse.model_validate(document)
        
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid document ID format"
        )
    except Exception as e:
        logger.error(f"Error getting document {document_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve document: {str(e)}"
        )

@router.delete("/history/{document_id}")
async def delete_classification(
    document_id: str,
    db: Session = Depends(get_db)
):
    """Delete a classification record"""
    try:
        # Validate UUID format
        doc_uuid = uuid.UUID(document_id)
        
        success = delete_document(db, doc_uuid)
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Document with ID {document_id} not found"
            )
        
        return {"message": f"Document {document_id} deleted successfully"}
        
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid document ID format"
        )
    except Exception as e:
        logger.error(f"Error deleting document {document_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete document: {str(e)}"
        )

@router.get("/stats")
async def get_classification_stats(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    db: Session = Depends(get_db)
):
    """Get classification statistics"""
    try:
        from sqlalchemy import func
        from models import Document
        
        query = db.query(Document)
        if user_id:
            query = query.filter(Document.user_id == user_id)
        
        # Total count
        total_documents = query.count()
        
        # Count by label
        label_stats = (
            query
            .with_entities(Document.label, func.count(Document.id).label('count'))
            .group_by(Document.label)
            .all()
        )
        
        # Count by confidence range
        confidence_ranges = [
            ('Very High (≥90%)', 0.9, 1.0),
            ('High (75-89%)', 0.75, 0.89),
            ('Medium (60-74%)', 0.6, 0.74),
            ('Low (<60%)', 0.0, 0.59)
        ]
        
        confidence_stats = []
        for range_name, min_conf, max_conf in confidence_ranges:
            count = (
                query
                .filter(Document.confidence >= min_conf)
                .filter(Document.confidence <= max_conf)
                .count()
            )
            confidence_stats.append({
                'range': range_name,
                'count': count
            })
        
        # Override statistics
        override_stats = (
            query
            .with_entities(
                Document.override_reason, 
                func.count(Document.id).label('count')
            )
            .group_by(Document.override_reason)
            .all()
        )
        
        # Disagreement count
        disagreement_count = query.filter(Document.disagreement == True).count()
        
        return {
            'total_documents': total_documents,
            'label_distribution': [
                {'label': label, 'count': count} for label, count in label_stats
            ],
            'confidence_distribution': confidence_stats,
            'override_methods': [
                {'method': method, 'count': count} for method, count in override_stats
            ],
            'disagreement_count': disagreement_count,
            'agreement_rate': (
                (total_documents - disagreement_count) / total_documents * 100
                if total_documents > 0 else 0
            )
        }
        
    except Exception as e:
        logger.error(f"Error getting classification stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve statistics: {str(e)}"
        )
