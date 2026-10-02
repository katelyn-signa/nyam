# CourtLens System Architecture

## 1. Executive Summary
**CourtLens** is an AI-powered legal case management and evidence intelligence platform engineered for judicial inquiries, law firms, regulatory bodies, and digital forensic investigators. It provides end-to-end evidence ingestion, immutable chain-of-custody logging, cryptographic SHA-256 integrity verification, and generative AI extraction.

## 2. Architectural Principles
1. **Separation of Concerns:** Business logic (evidence ingestion, duplicate hashing) is isolated from persistence mechanisms and external AI foundation models.
2. **Authoritative Server-Side Cryptography:** All file hashing (SHA-256) is executed strictly on the server buffer. Frontend-provided hashes are never trusted.
3. **Immutability of Custody:** Access events (views, downloads, edits, analyses) generate immutable append-only audit records.
4. **Judicial Neutrality & Legal Disclaimer:** AI models do not evaluate guilt, fault, or offer legal counsel. All outputs are explicitly marked as investigative assistance tools requiring human verification.

## 3. Component Architecture
```
[React SPA Frontend (Vite + Tailwind CSS)]
               │  (REST / JSON)
               ▼
[CourtLens Full-Stack Gateway / FastAPI Engine]
 ├── Core Security (JWT, RBAC: Admin, Investigator, Viewer)
 ├── Evidence Pipeline (SHA-256 Hashing, Duplicate Detection)
 ├── Storage Provider Abstraction (Local Vault / AWS S3)
 └── AI Provider Abstraction (Gemini 3.8 Flash / Heuristic Engine)
               │
               ▼
   [PostgreSQL Database (Relational Schemas & Indexes)]
```
