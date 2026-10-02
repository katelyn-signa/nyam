from abc import ABC, abstractmethod
from typing import Dict, Any

class AIProvider(ABC):
    @abstractmethod
    async def summarize_evidence(self, filename: str, content: str, category: str) -> Dict[str, Any]:
        """Summarize evidence content and extract entities/dates."""
        pass

    @abstractmethod
    async def classify_evidence(self, filename: str, snippet: str) -> str:
        """Suggest forensic category for evidence."""
        pass

    @abstractmethod
    async def summarize_case(self, case_info: Dict[str, Any], evidence_summaries: list) -> str:
        """Synthesize overall case dossier."""
        pass
