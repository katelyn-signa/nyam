# CourtLens

> **"AI-Powered Legal Case & Evidence Intelligence Platform"**

CourtLens is an enterprise-grade legal case intelligence and evidence management platform designed to organize complex legal matters and digital evidence in one secure, cryptographically verified repository.

---

## 🌟 Key Capabilities

1. **Case & Docket Management:** Create, classify, prioritize, and track legal cases across federal, state, and arbitration jurisdictions.
2. **Cryptographic SHA-256 File Hashing:** Authoritative server-side hash calculation on every uploaded byte stream for file integrity and verification.
3. **Duplicate Collision Prevention:** Real-time duplicate detection warning modal preventing accidental re-ingestion of identical evidence files.
4. **Immutable Chain of Custody:** Automatic audit event creation for every file action (`UPLOADED`, `VIEWED`, `DOWNLOADED`, `ANALYZED`, `MODIFIED`).
5. **Universal Evidence Viewer:** In-browser previews for CSV tables, formatted JSON, images, documents, and plain text.
6. **AI-Assisted Intelligence Dossiers:** Powered by Google's `gemini-3.8-flash` with automatic extraction of key observations, entities (people, organizations, locations), and chronological milestones.
7. **Ethical AI & Legal Neutrality:** All AI outputs are labeled with an evidentiary disclaimer and never claim to provide legal advice or determine legal guilt/innocence.
8. **Chronological Case Timelines:** Interactive milestone views combining case docket milestones, extracted evidence dates, and investigator notes.
9. **Global Vault Search:** Instant search across case titles, extracted document text, evidence descriptions, categories, and cryptographic hashes.
10. **Role-Based Access Control (RBAC):** `ADMIN`, `INVESTIGATOR`, and `VIEWER` roles enforced on the backend.

---

## 🏗️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Python FastAPI, Pydantic 2, SQLAlchemy 2.0, Alembic
- **Full-Stack Dev Server:** Node.js Express server mounting Vite middlewares on port 3000
- **Database:** PostgreSQL 15+ with UUID primary keys and btree indices
- **Storage Abstraction:** Pluggable `StorageProvider` (Local Filesystem `/uploads` and AWS S3)
- **AI Abstraction:** Pluggable `AIProvider` (Google Gemini `@google/genai` / `gemini-3.8-flash` and local heuristic fallback)
- **Containerization:** Docker & Docker Compose

---

## 📁 Repository Structure

```
courtlens/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # REST endpoints (auth, cases, evidence, search, timeline)
│   │   ├── core/                # Config, security, JWT, RBAC
│   │   ├── models/              # SQLAlchemy 2.0 relational models
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── services/            # Business logic (case, evidence, custody, hashing)
│   │   ├── ai/                  # AI provider abstraction (Gemini + Heuristic engine)
│   │   ├── storage/             # Storage abstraction (Local + S3)
│   │   └── main.py              # FastAPI application entrypoint
│   ├── requirements.txt
│   └── Dockerfile
├── src/                         # React TypeScript Frontend
│   ├── components/              # Layout, Evidence, Timeline, AI, Modals
│   ├── pages/                   # Dashboard, Cases, Detail, Vault, Search, Audit, Docs, Settings
│   ├── context/                 # AuthContext with dynamic role switcher
│   ├── lib/                     # Typed API client
│   └── types/                   # TypeScript interfaces
├── database/
│   └── init.sql                 # PostgreSQL DDL and safe fictional seed cases
├── docs/                        # Full technical architecture & API manuals
├── uploads/                     # Evidence file vault
├── server.ts                    # Full-Stack unified server with REST API
├── docker-compose.yml           # Multi-container orchestration
└── README.md
```

---

## 🚀 Quick Start

### Option 1: Live Interactive Applet
The platform is immediately runnable:
```bash
npm run dev
# Opens on http://localhost:3000
```

### Option 2: Docker Compose (PostgreSQL + FastAPI + Frontend)
```bash
docker-compose up -d --build
```

---

## ⚖️ Legal & Ethical AI Disclaimer
CourtLens is an investigative intelligence assistant. It does not provide legal advice, draw legal conclusions, or assess guilt or liability. All extracted summaries, dates, and entities must be corroborated by human counsel against original source documents.
