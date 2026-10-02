-- CourtLens Database Initialization Script
-- PostgreSQL 15+ compatible

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'INVESTIGATOR',
    organization VARCHAR(255) DEFAULT 'Department of Justice',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: cases
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    case_type VARCHAR(128) DEFAULT 'General Legal Investigation',
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    jurisdiction VARCHAR(255) DEFAULT 'Federal District Court',
    incident_date TIMESTAMP WITH TIME ZONE,
    assigned_to VARCHAR(255),
    ai_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);

-- Table: evidence
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(32) NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path VARCHAR(512) NOT NULL,
    uploaded_by VARCHAR(64) NOT NULL,
    uploaded_by_name VARCHAR(255),
    description TEXT,
    evidence_category VARCHAR(64) NOT NULL DEFAULT 'DOCUMENT',
    sha256_hash CHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PROCESSING',
    source VARCHAR(255) DEFAULT 'Digital Evidence Intake',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evidence_sha256 ON evidence(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_category ON evidence(evidence_category);

-- Table: evidence_content
CREATE TABLE IF NOT EXISTS evidence_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID UNIQUE NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    extracted_text TEXT,
    ai_summary_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: evidence_audit_events (Chain of Custody)
CREATE TABLE IF NOT EXISTS evidence_audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(32) NOT NULL,
    action VARCHAR(32) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    details TEXT,
    sha256_hash CHAR(64) NOT NULL,
    hash_verified BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_audit_evidence_id ON evidence_audit_events(evidence_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON evidence_audit_events(timestamp DESC);

-- Table: case_timeline_events
CREATE TABLE IF NOT EXISTS case_timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(64) NOT NULL DEFAULT 'EXTRACTED_EVENT',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_evidence_id VARCHAR(64),
    actor_name VARCHAR(255) DEFAULT 'System'
);

CREATE INDEX IF NOT EXISTS idx_timeline_case_id ON case_timeline_events(case_id);
CREATE INDEX IF NOT EXISTS idx_timeline_timestamp ON case_timeline_events(timestamp DESC);

-- Table: case_notes
CREATE TABLE IF NOT EXISTS case_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Safe Fictional Demo Cases
INSERT INTO cases (id, case_number, title, description, case_type, status, priority, jurisdiction, incident_date, assigned_to, ai_summary)
VALUES 
(
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'CASE-2026-001',
    'Apex Financial vs. Zenith Capital Asset Transfer Fraud',
    'Investigation into unauthorized wire transfers and falsified ledger statements across offshore shell entities during Q1 2026.',
    'Financial Fraud & Embezzlement',
    'UNDER_INVESTIGATION',
    'CRITICAL',
    'US Federal District Court - Southern District of NY',
    '2026-01-14 00:00:00+00',
    'Detective Marcus Vance',
    'Comprehensive analysis indicates deliberate discrepancy between audited internal balance sheets and correspondent bank wire transfers totaling $14.2M.'
),
(
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'CASE-2026-002',
    'State of California v. Thorne - Cryptographic Key Exfiltration',
    'Corporate espionage and proprietary source code exfiltration involving stolen hardware security modules (HSM) and private certificate keys.',
    'Cybercrime & IP Theft',
    'OPEN',
    'HIGH',
    'Superior Court of California, County of Santa Clara',
    '2026-02-04 22:15:00+00',
    'Lead Counsel Sarah Connor',
    'Forensic artifacts point to off-hours VPN connections originating from suspect terminal at 02:40 UTC.'
)
ON CONFLICT (case_number) DO NOTHING;
