# CourtLens AI Service Layer & Ethical Protocol

## Overview
CourtLens abstracts AI model interactions behind the `AIProvider` interface. This enables seamless switching between foundation models (Google Gemini API using `gemini-3.8-flash`) and offline heuristic extractors without modifying application business logic.

## Ethical AI & Judicial Admissibility
To ensure that all outputs maintain evidentiary admissibility under the Federal Rules of Evidence:
1. **No Legal Conclusions:** The system never assesses criminal guilt, civil liability, or provides legal advice.
2. **Neutral Summarization:** The AI prompt mandates objective, non-prejudicial summarization.
3. **Mandatory Corroboration Disclaimer:** Every generated summary includes the notice:
   *"AI-generated assistance — verify against original evidence. Does not constitute legal conclusions or legal advice."*

## Model Configuration
- **Model Name:** `gemini-3.8-flash`
- **Output Format:** Strict JSON schema with entities (people, organizations, locations), chronological events, key points, and relevance score.
- **Provider Switcher:** Controlled via `AI_PROVIDER=gemini` or `AI_PROVIDER=mock`.
