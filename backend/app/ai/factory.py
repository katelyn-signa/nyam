import os
from backend.app.ai.base import AIProvider
from backend.app.ai.gemini import GeminiProvider
from backend.app.ai.mock import MockAIProvider
from backend.app.core.config import settings

def get_ai_provider() -> AIProvider:
    provider_type = settings.AI_PROVIDER.lower()
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")

    if provider_type == "gemini" and api_key:
        return GeminiProvider(api_key=api_key)
    
    # Fallback to Mock / Heuristic provider
    return MockAIProvider()
