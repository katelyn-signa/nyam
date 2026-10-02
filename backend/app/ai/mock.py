import re
from datetime import datetime
from typing import Dict, Any
from backend.app.ai.base import AIProvider

class MockAIProvider(AIProvider):
    async def summarize_evidence(self, filename: str, content: str, category: str) -> Dict[str, Any]:
        disclaimer = "AI-generated assistance — verify against original evidence. Does not constitute legal advice or legal findings."
        
        # Heuristic date extraction
        date_pattern = r'\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b'
        dates = list(set(re.findall(date_pattern, content, re.IGNORECASE)))[:3]
        
        # Heuristic capitalized person tokens
        names = list(set(re.findall(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', content)))[:3]
        
        lines = [l.strip() for l in content.split('\n') if l.strip()]

        return {
            "short_summary": f"Heuristic legal intelligence analysis of {filename}. Ingested record with {len(lines)} lines parsed.",
            "key_points": [
                f"Cryptographic SHA-256 integrity seal preserved for chain of custody.",
                f"Primary record heading: \"{lines[0][:80] if lines else 'Forensic structure confirmed'}\"",
                f"Classified under forensic scope: {category}."
            ],
            "entities": {
                "people": names if names else ["Identified Signatory", "Lead Auditor"],
                "organizations": ["CourtLens Evidence Vault", "Apex Financial Internal Review"],
                "locations": ["Federal Registry", "Primary Network Egress"]
            },
            "important_events": [
                {"date": d, "event": f"Milestone extracted from source document record"} for d in dates
            ] if dates else [{"date": datetime.utcnow().strftime("%Y-%m-%d"), "event": "Evidence ingestion and cryptographic timestamp registration"}],
            "suggested_category": category,
            "relevance_score": 90,
            "disclaimer": disclaimer
        }

    async def classify_evidence(self, filename: str, snippet: str) -> str:
        ext = filename.split(".")[-1].lower()
        if ext in ["csv", "xlsx"]: return "FINANCIAL"
        if ext in ["json", "log", "pcap"]: return "DIGITAL"
        if ext in ["jpg", "png", "webp"]: return "IMAGE"
        if ext in ["mp4", "mkv"]: return "VIDEO"
        if ext in ["mp3", "wav"]: return "AUDIO"
        return "DOCUMENT"

    async def summarize_case(self, case_info: Dict[str, Any], evidence_summaries: list) -> str:
        return f"Comprehensive investigation dossier for {case_info.get('title')}. Evidentiary trail corroborates transaction records and digital access logs."
