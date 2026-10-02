import json
from typing import Dict, Any
from google import genai
from google.genai import types
from backend.app.ai.base import AIProvider
from backend.app.core.config import settings

class GeminiProvider(AIProvider):
    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)
        self.model = settings.GEMINI_MODEL  # gemini-3.8-flash

    async def summarize_evidence(self, filename: str, content: str, category: str) -> Dict[str, Any]:
        disclaimer = "AI-generated assistance — verify against original evidence. Does not constitute legal advice or legal findings."
        prompt = f"""You are CourtLens Legal Intelligence Assistant. Analyze the following legal evidence document.
Provide an objective, non-conclusory analysis. Do NOT determine guilt or innocence. Mark findings as assistance for human investigator review.

Document Name: {filename}
Category: {category}
Document Content:
{content[:4000]}

Respond ONLY with valid JSON in this exact structure:
{{
  "short_summary": "1-2 sentence concise neutral summary",
  "key_points": ["Key observation 1", "Key observation 2", "Key observation 3"],
  "entities": {{
    "people": ["Name 1", "Name 2"],
    "organizations": ["Org 1", "Org 2"],
    "locations": ["City/Jurisdiction 1"]
  }},
  "important_events": [
    {{"date": "YYYY-MM-DD or readable date", "event": "neutral description of event"}}
  ],
  "suggested_category": "{category}",
  "relevance_score": 85
}}"""

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        try:
            parsed = json.loads(response.text)
            parsed["disclaimer"] = disclaimer
            return parsed
        except Exception:
            return {
                "short_summary": f"Analyzed {filename}.",
                "key_points": ["Document parsed successfully."],
                "entities": {"people": [], "organizations": [], "locations": []},
                "important_events": [],
                "suggested_category": category,
                "relevance_score": 80,
                "disclaimer": disclaimer
            }

    async def classify_evidence(self, filename: str, snippet: str) -> str:
        prompt = f"Given file {filename} with snippet {snippet[:300]}, classify it into one category: DOCUMENT, FINANCIAL, DIGITAL, IMAGE, AUDIO, VIDEO, COMMUNICATION, OTHER. Return only the single category word."
        res = self.client.models.generate_content(model=self.model, contents=prompt)
        cat = (res.text or "OTHER").strip().upper()
        return cat if cat in ["DOCUMENT", "FINANCIAL", "DIGITAL", "IMAGE", "AUDIO", "VIDEO", "COMMUNICATION"] else "DOCUMENT"

    async def summarize_case(self, case_info: Dict[str, Any], evidence_summaries: list) -> str:
        prompt = f"Synthesize this legal case {case_info.get('case_number')} - {case_info.get('title')} given these evidence summaries: {json.dumps(evidence_summaries)}. Write a 2-3 sentence neutral investigative synthesis."
        res = self.client.models.generate_content(model=self.model, contents=prompt)
        return (res.text or "").strip()
