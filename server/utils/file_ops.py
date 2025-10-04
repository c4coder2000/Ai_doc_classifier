import os
import uuid
import shutil
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
import logging
from config import settings

logger = logging.getLogger(__name__)

class FileOperations:
    """Handle file operations for uploaded documents"""
    
    @staticmethod
    def is_allowed_file(filename: str) -> bool:
        """Check if file extension is allowed"""
        if not filename:
            return False
        
        file_ext = Path(filename).suffix.lower()
        return file_ext in settings.ALLOWED_EXTENSIONS
    
    @staticmethod
    def get_file_size(file_path: str) -> int:
        """Get file size in bytes"""
        try:
            return os.path.getsize(file_path)
        except OSError:
            return 0
    
    @staticmethod
    def generate_temp_filename(original_filename: str) -> str:
        """Generate unique temporary filename"""
        file_ext = Path(original_filename).suffix
        unique_id = str(uuid.uuid4())[:8]
        return f"temp_{unique_id}_{original_filename}{file_ext}"
    
    @staticmethod
    async def save_upload_file(file: UploadFile, temp_dir: Optional[str] = None) -> str:
        """Save uploaded file to temporary location"""
        if temp_dir is None:
            temp_dir = settings.TEMP_DIR
        
        # Ensure temp directory exists
        os.makedirs(temp_dir, exist_ok=True)
        
        # Validate file
        if not FileOperations.is_allowed_file(file.filename):
            raise ValueError(f"File type not allowed: {file.filename}")
        
        # Generate temp filename
        temp_filename = FileOperations.generate_temp_filename(file.filename)
        temp_path = os.path.join(temp_dir, temp_filename)
        
        try:
            # Save file
            with open(temp_path, "wb") as f:
                content = await file.read()
                
                # Check file size
                if len(content) > settings.MAX_FILE_SIZE:
                    raise ValueError(f"File too large. Max size: {settings.MAX_FILE_SIZE} bytes")
                
                f.write(content)
            
            logger.info(f"Saved uploaded file: {temp_path}")
            return temp_path
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(temp_path):
                os.remove(temp_path)
            logger.error(f"Error saving file {file.filename}: {e}")
            raise
    
    @staticmethod
    def cleanup_temp_file(file_path: str) -> bool:
        """Remove temporary file"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Cleaned up temp file: {file_path}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error cleaning up file {file_path}: {e}")
            return False
    
    @staticmethod
    def cleanup_temp_dir(temp_dir: Optional[str] = None, max_age_hours: int = 24) -> int:
        """Clean up old temporary files"""
        if temp_dir is None:
            temp_dir = settings.TEMP_DIR
        
        if not os.path.exists(temp_dir):
            return 0
        
        import time
        current_time = time.time()
        max_age_seconds = max_age_hours * 3600
        cleaned_count = 0
        
        try:
            for filename in os.listdir(temp_dir):
                if filename.startswith("temp_"):
                    file_path = os.path.join(temp_dir, filename)
                    file_age = current_time - os.path.getmtime(file_path)
                    
                    if file_age > max_age_seconds:
                        os.remove(file_path)
                        cleaned_count += 1
                        logger.info(f"Cleaned up old temp file: {file_path}")
            
            return cleaned_count
            
        except Exception as e:
            logger.error(f"Error during temp directory cleanup: {e}")
            return 0
    
    @staticmethod
    def get_file_info(file_path: str) -> dict:
        """Get file information"""
        try:
            stat = os.stat(file_path)
            return {
                "path": file_path,
                "name": os.path.basename(file_path),
                "size": stat.st_size,
                "created": stat.st_ctime,
                "modified": stat.st_mtime,
                "exists": True
            }
        except OSError:
            return {
                "path": file_path,
                "name": os.path.basename(file_path),
                "exists": False
            }

# Create global instance
file_ops = FileOperations()
