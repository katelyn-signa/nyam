# CourtLens Database Schema Documentation

## Entity Relationship Overview
The database uses normalized relational structures with UUID primary keys and foreign key constraints in PostgreSQL.

### Tables
1. **users:** User identity, bcrypt-hashed passwords, roles (`ADMIN`, `INVESTIGATOR`, `VIEWER`), and organization affiliation.
2. **cases:** Legal matter records containing `case_number` (unique), `title`, `status`, `priority`, `jurisdiction`, and `incident_date`.
3. **evidence:** Primary file registry storing `sha256_hash`, `file_size`, `mime_type`, `storage_path`, and `evidence_category`.
4. **evidence_content:** Text extracted from documents (PDF, CSV, JSON, TXT) and structured AI analysis payloads.
5. **evidence_audit_events:** Immutable Chain of Custody logging all actions (`UPLOADED`, `VIEWED`, `DOWNLOADED`, `ANALYZED`, `MODIFIED`) with IP and hash seal.
6. **case_timeline_events:** Chronological case milestones, status changes, and AI-extracted events.
7. **case_notes:** Investigator notes attached to cases with timestamp and author attribution.
