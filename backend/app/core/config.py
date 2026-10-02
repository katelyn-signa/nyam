import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CourtLens Legal Case & Evidence Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://courtlens_user:courtlens_secret@localhost:5432/courtlens_db"
    )
    
    # Security & JWT
    SECRET_KEY: str = os.getenv("JWT_SECRET", "courtlens-super-secret-cryptographic-signing-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Storage
    STORAGE_TYPE: str = os.getenv("STORAGE_TYPE", "local")  # "local" or "s3"
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))
    
    # AI Engine
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")  # "gemini" or "mock"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-3.8-flash"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
