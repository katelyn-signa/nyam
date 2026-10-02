from datetime import datetime
from fastapi import APIRouter
from backend.app.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat(),
        "ai_provider": settings.AI_PROVIDER,
        "storage_type": settings.STORAGE_TYPE
    }
