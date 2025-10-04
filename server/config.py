from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path

class Settings(BaseSettings):
    """Application configuration settings"""
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Database Configuration
    DATABASE_URL: str
    
    # Authentication Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Model Configuration
    MODEL_PATH: str = "./model/resnet18_rvlcdip_final_fully_finetuned.pth"
    
    # CORS Configuration
    ALLOWED_ORIGINS: list[str] = ["*"]
    ALLOWED_METHODS: list[str] = ["*"]
    ALLOWED_HEADERS: list[str] = ["*"]
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: list[str] = [".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"]
    TEMP_DIR: str = "./temp"
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Document Classifier API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "FastAPI backend for AI-powered document classification"
    
    # Timeout Configuration
    DEFAULT_TIMEOUT: int = 30
    LLM_TIMEOUT: int = 20
    OCR_TIMEOUT: int = 15
    
    # Text Processing Configuration
    MAX_TEXT_LENGTH: int = 10000
    LLM_TEXT_LIMIT: int = 2000
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure temp directory exists
        os.makedirs(self.TEMP_DIR, exist_ok=True)
    
    @property
    def model_exists(self) -> bool:
        """Check if model file exists"""
        return os.path.exists(self.MODEL_PATH)
    
    def get_model_path(self) -> str:
        """Get model path with fallback logic"""
        if self.model_exists:
            return self.MODEL_PATH
        
        # Fallback to absolute path
        fallback_path = "C:/Users/VICTUS 15/Desktop/Doc_Classifier/Finetuned/resnet18_rvlcdip_final_fully_finetuned.pth"
        if os.path.exists(fallback_path):
            return fallback_path
        
        raise FileNotFoundError(f"Model file not found at {self.MODEL_PATH} or {fallback_path}")

# Create global settings instance
settings = Settings()
