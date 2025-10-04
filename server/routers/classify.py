from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Document
from schemas import DocumentCreate, ClassificationResult, UserResponse
from routers.auth import get_current_user
from crud import create_document
from utils.file_ops import file_ops
from utils.timeout import safe_run_with_timeout
from utils.helpers import text_helpers, confidence_helpers
from config import settings
import logging
from typing import Optional

# Import ML model functions
from model.classifier import (
    load_model,
    predict_image,
    extract_text,
    summarize_text,
    classify_with_llm,
    heuristic_detect,
    classify_with_mistral
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["classification"])

# Load model once when module is imported
try:
    model_path = settings.get_model_path()
    model = load_model(model_path)
    logger.info(f"Model loaded successfully from: {model_path}")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    model = None

@router.post("/classify", response_model=ClassificationResult)
async def classify_document(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user),
    save_to_db: bool = True,
    db: Session = Depends(get_db)
):
    """Classify an uploaded document using ML model and save results"""
    
    if model is None:
        raise HTTPException(
            status_code=500, 
            detail="ML model not loaded. Please check server configuration."
        )
    
    temp_path = None
    try:
        # Save uploaded file
        temp_path = await file_ops.save_upload_file(file)
        logger.info(f"Processing file: {file.filename}")
        
        # Phase 1: CNN prediction
        cnn_label, cnn_confidence = predict_image(model, temp_path)
        logger.info(f"CNN prediction: {cnn_label} ({cnn_confidence:.2f})")
        
        # Phase 2: OCR extraction with timeout
        text = safe_run_with_timeout(
            extract_text, 
            temp_path, 
            timeout=settings.OCR_TIMEOUT
        )
        
        if text is None:
            text = "Text extraction failed or timed out."
            logger.warning("OCR extraction failed")
        
        # Clean and truncate text
        text = text_helpers.clean_text(text)
        text_for_llm = text_helpers.truncate_for_llm(text)
        
        # Phase 3: Summarization with timeout
        summary = safe_run_with_timeout(
            summarize_text, 
            text, 
            timeout=settings.LLM_TIMEOUT
        )
        
        if summary is None:
            summary = "Summarization failed or timed out."
            logger.warning("Text summarization failed")
        
        # Initialize final results
        label = cnn_label
        confidence = cnn_confidence
        override_reason = "CNN prediction"
        disagreement = False
        
        # Phase 4: Override logic for better accuracy
        sensitive_labels = ["Resume", "Specification", "Memo", "Letter"]
        
        if len(text) > 50:  # Only apply overrides if we have sufficient text
            # Heuristic detection
            heuristic_result = safe_run_with_timeout(
                heuristic_detect,
                text,
                timeout=10
            )
            
            if heuristic_result:
                heuristic_label, heuristic_conf = heuristic_result
                
                # Apply heuristic override if conditions are met
                if (heuristic_label and 
                    heuristic_label != cnn_label and 
                    (cnn_label in sensitive_labels or cnn_confidence < 0.85)):
                    
                    label = heuristic_label
                    confidence = heuristic_conf
                    override_reason = "Heuristic override"
                    disagreement = True
                    logger.info(f"Heuristic override: {heuristic_label}")
            
            # Mistral LLM override for sensitive labels
            elif cnn_label in sensitive_labels:
                mistral_result = safe_run_with_timeout(
                    classify_with_mistral,
                    text_for_llm,
                    timeout=settings.LLM_TIMEOUT
                )
                
                if mistral_result:
                    mistral_label = mistral_result.get("document_type")
                    mistral_conf = mistral_result.get("confidence", 0.90)
                    
                    if mistral_label and mistral_label != cnn_label:
                        label = mistral_label
                        confidence = mistral_conf
                        override_reason = "Mistral LLM override"
                        disagreement = True
                        logger.info(f"Mistral override: {mistral_label}")
            
            # Fallback resume detection
            if (label == cnn_label and 
                "work experience" in text.lower() and 
                "education" in text.lower()):
                
                label = "Resume"
                confidence = 0.95
                override_reason = "Fallback resume detection"
                disagreement = (label != cnn_label)
                logger.info("Applied fallback resume detection")
        
        # Save to database if requested
        document_id = None
        if save_to_db:
            try:
                document_data = DocumentCreate(
                    filename=file.filename,
                    label=label,
                    confidence=confidence,
                    override_reason=override_reason,
                    disagreement=disagreement,
                    summary=summary,
                    raw_text=text,
                    user_id=str(current_user.id)
                )
                
                db_document = create_document(db, document_data)
                document_id = str(db_document.id)
                logger.info(f"Saved document to database: {document_id}")
                
            except Exception as e:
                logger.error(f"Failed to save document to database: {e}")
                # Continue without saving to DB
        
        # Format response
        response = ClassificationResult(
            label=label,
            confidence=confidence_helpers.format_confidence(confidence),
            text=text,
            summary=summary,
            override_reason=override_reason,
            disagreement=disagreement,
            document_id=document_id
        )
        
        logger.info(f"Classification completed: {label} ({confidence:.2f})")
        return response
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        logger.error(f"Classification error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Classification failed: {str(e)}"
        )
    
    finally:
        # Clean up temp file
        if temp_path:
            file_ops.cleanup_temp_file(temp_path)

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_path": settings.get_model_path() if model else None,
        "version": settings.VERSION
    }

@router.post("/cleanup")
async def cleanup_temp_files():
    """Clean up old temporary files"""
    try:
        cleaned_count = file_ops.cleanup_temp_dir()
        return {
            "message": f"Cleaned up {cleaned_count} temporary files",
            "count": cleaned_count
        }
    except Exception as e:
        logger.error(f"Cleanup error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Cleanup failed: {str(e)}"
        )
