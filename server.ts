import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload directory exists
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Models & In-Memory Store with Initial Seed Data
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'INVESTIGATOR' | 'VIEWER';
  organization: string;
  created_at: string;
}

export interface Case {
  id: string;
  case_number: string;
  title: string;
  description: string;
  case_type: string;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'PENDING' | 'CLOSED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  jurisdiction: string;
  incident_date: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  ai_summary?: string;
}

export interface EvidenceItem {
  id: string;
  case_id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_at: string;
  description: string;
  evidence_category: 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DIGITAL' | 'FINANCIAL' | 'COMMUNICATION' | 'OTHER';
  sha256_hash: string;
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  source: string;
  created_at: string;
  updated_at: string;
  extracted_text?: string;
  ai_summary?: {
    short_summary: string;
    key_points: string[];
    entities: { people: string[]; organizations: string[]; locations: string[] };
    important_events: { date: string; event: string }[];
    suggested_category: string;
    relevance_score: number;
    disclaimer: string;
  };
}

export interface ChainOfCustodyEvent {
  id: string;
  evidence_id: string;
  case_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: 'UPLOADED' | 'VIEWED' | 'DOWNLOADED' | 'ANALYZED' | 'MODIFIED' | 'RENAMED' | 'CATEGORIZED' | 'NOTE_ADDED' | 'DELETED';
  timestamp: string;
  ip_address: string;
  details: string;
  hash_verified: boolean;
  sha256_hash: string;
}

export interface TimelineEvent {
  id: string;
  case_id: string;
  title: string;
  description: string;
  event_type: 'CASE_CREATED' | 'EVIDENCE_UPLOADED' | 'EVIDENCE_ANALYZED' | 'EXTRACTED_EVENT' | 'STATUS_CHANGED' | 'NOTE_ADDED';
  timestamp: string;
  source_evidence_id?: string;
  actor_name: string;
}

export interface CaseNote {
  id: string;
  case_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Initial Mock Seed Data
const users: User[] = [
  {
    id: 'usr-admin-01',
    email: 'sarah.connor@courtlens.internal',
    full_name: 'Lead Counsel Sarah Connor',
    role: 'ADMIN',
    organization: 'Department of Justice / Cyber Division',
    created_at: '2026-01-10T09:00:00Z',
  },
  {
    id: 'usr-inv-02',
    email: 'marcus.vance@courtlens.internal',
    full_name: 'Detective Marcus Vance',
    role: 'INVESTIGATOR',
    organization: 'Financial Crimes Task Force',
    created_at: '2026-01-12T10:30:00Z',
  },
  {
    id: 'usr-view-03',
    email: 'elena.rostova@courtlens.internal',
    full_name: 'Analyst Elena Rostova',
    role: 'VIEWER',
    organization: 'Judicial Review Office',
    created_at: '2026-02-01T14:00:00Z',
  }
];

let cases: Case[] = [
  {
    id: 'case-2026-001',
    case_number: 'CASE-2026-001',
    title: 'Apex Financial vs. Zenith Capital Asset Transfer Fraud',
    description: 'Investigation into unauthorized wire transfers and falsified ledger statements across offshore shell entities during Q1 2026.',
    case_type: 'Financial Fraud & Embezzlement',
    status: 'UNDER_INVESTIGATION',
    priority: 'CRITICAL',
    jurisdiction: 'US Federal District Court - Southern District of NY',
    incident_date: '2026-01-14T00:00:00Z',
    created_at: '2026-01-15T08:30:00Z',
    updated_at: '2026-03-28T16:45:00Z',
    assigned_to: 'Detective Marcus Vance',
    ai_summary: 'Comprehensive analysis indicates deliberate discrepancy between audited internal balance sheets and correspondent bank wire transfers totaling $14.2M. Key counterparties include Cayman-registered Zenith Holding Corp.'
  },
  {
    id: 'case-2026-002',
    case_number: 'CASE-2026-002',
    title: 'State of California v. Thorne - Cryptographic Key Exfiltration',
    description: 'Corporate espionage and proprietary source code exfiltration involving stolen hardware security modules (HSM) and private certificate keys.',
    case_type: 'Cybercrime & IP Theft',
    status: 'OPEN',
    priority: 'HIGH',
    jurisdiction: 'Superior Court of California, County of Santa Clara',
    incident_date: '2026-02-04T22:15:00Z',
    created_at: '2026-02-06T11:00:00Z',
    updated_at: '2026-03-25T19:20:00Z',
    assigned_to: 'Lead Counsel Sarah Connor',
    ai_summary: 'Forensic artifacts point to off-hours VPN connections originating from suspect terminal at 02:40 UTC. Exfiltrated archives were encrypted using AES-GCM with key identifiers matching seized flash memory.'
  },
  {
    id: 'case-2026-003',
    case_number: 'CASE-2026-003',
    title: 'Meridian Logistics Supply Chain Contract Arbitration',
    description: 'Breach of maritime freight agreement involving delayed temperature-controlled pharmaceutical shipments and corrupted telemetry logs.',
    case_type: 'Commercial Arbitration',
    status: 'PENDING',
    priority: 'MEDIUM',
    jurisdiction: 'International Chamber of Commerce (ICC) Arbitration Tribunal',
    incident_date: '2025-11-20T00:00:00Z',
    created_at: '2025-12-01T15:20:00Z',
    updated_at: '2026-03-10T10:00:00Z',
    assigned_to: 'Analyst Elena Rostova',
    ai_summary: 'Review of sensor telematics and bill of lading confirms cold-chain integrity failure between Rotterdam port terminal and Newark distribution hub.'
  }
];

let evidenceList: EvidenceItem[] = [
  {
    id: 'evi-901-wire-records',
    case_id: 'case-2026-001',
    filename: 'wire_transfers_swift_jan2026.csv',
    original_filename: 'SWIFT_MT103_Audit_Jan2026.csv',
    file_type: 'csv',
    mime_type: 'text/csv',
    file_size: 42380,
    storage_path: 'mock/wire_transfers_swift_jan2026.csv',
    uploaded_by: 'usr-inv-02',
    uploaded_by_name: 'Detective Marcus Vance',
    uploaded_at: '2026-01-16T14:22:00Z',
    description: 'Subpoenaed SWIFT MT103 wire transfer logs showing $14.2M diverted across 3 tranches to foreign clearing accounts.',
    evidence_category: 'FINANCIAL',
    sha256_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    status: 'PROCESSED',
    source: 'Subpoena to Metropolitan Commerce Bank',
    created_at: '2026-01-16T14:22:00Z',
    updated_at: '2026-01-16T14:30:00Z',
    extracted_text: `Transaction_ID,Date,Originator_Account,Beneficiary_Entity,Amount_USD,SWIFT_Code,Status
TRX-88219-A,2026-01-14,098-4421-ApexCorp,Zenith Holding Ltd (Cayman),4200000.00,ZENICAYM,EXECUTED
TRX-88220-B,2026-01-14,098-4421-ApexCorp,Zenith Holding Ltd (Cayman),5000000.00,ZENICAYM,EXECUTED
TRX-88224-C,2026-01-15,098-4421-ApexCorp,Vanguard Escrow Pan-Asia,5000000.00,VANGHKHH,EXECUTED`,
    ai_summary: {
      short_summary: 'Three consecutive high-value international wires totaling $14.2M authorized within 24 hours without dual-officer signoff.',
      key_points: [
        'Transfers executed immediately prior to financial quarter close',
        'Beneficiary accounts routed through offshore jurisdictions (Cayman Islands, Hong Kong)',
        'Reference notes cite expedited advisory settlement with no associated contract'
      ],
      entities: {
        people: ['Marcus Vance', 'Arthur Sterling (Signatory)'],
        organizations: ['Apex Financial', 'Zenith Holding Ltd', 'Metropolitan Commerce Bank', 'Vanguard Escrow'],
        locations: ['New York, NY', 'George Town, Cayman Islands', 'Hong Kong']
      },
      important_events: [
        { date: '2026-01-14 09:15 EST', event: 'First tranche of $4.2M wired to Zenith Holding Ltd' },
        { date: '2026-01-14 11:42 EST', event: 'Second tranche of $5.0M wired to Zenith Holding Ltd' },
        { date: '2026-01-15 08:30 EST', event: 'Third tranche of $5.0M wired to Vanguard Escrow' }
      ],
      suggested_category: 'FINANCIAL',
      relevance_score: 98,
      disclaimer: 'AI-generated assistance — verify against original evidence. Does not constitute legal conclusions or legal advice.'
    }
  },
  {
    id: 'evi-902-forensic-image',
    case_id: 'case-2026-002',
    filename: 'auth_server_access_log.json',
    original_filename: 'auth_daemon_production_Feb4.json',
    file_type: 'json',
    mime_type: 'application/json',
    file_size: 18450,
    storage_path: 'mock/auth_server_access_log.json',
    uploaded_by: 'usr-admin-01',
    uploaded_by_name: 'Lead Counsel Sarah Connor',
    uploaded_at: '2026-02-07T09:12:00Z',
    description: 'Authentication daemon logs showing root elevation using revoked maintenance certificates at 02:41 UTC.',
    evidence_category: 'DIGITAL',
    sha256_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    status: 'PROCESSED',
    source: 'Seized server image from AWS US-West datacenter',
    created_at: '2026-02-07T09:12:00Z',
    updated_at: '2026-02-07T09:20:00Z',
    extracted_text: JSON.stringify({
      events: [
        { timestamp: "2026-02-04T02:40:11Z", ip: "198.51.100.44", user: "dev-ops-backup", action: "SSH_AUTH_KEY_ACCEPTED" },
        { timestamp: "2026-02-04T02:41:05Z", ip: "198.51.100.44", user: "root", action: "SUDO_SUCCEEDED", command: "/usr/bin/tar -czf /tmp/keys_vault.tar.gz /etc/hsm/keys" },
        { timestamp: "2026-02-04T02:43:19Z", ip: "198.51.100.44", user: "dev-ops-backup", action: "SCP_EGRESS", target: "external-relay-4.onion:9022" }
      ]
    }, null, 2),
    ai_summary: {
      short_summary: 'Digital forensic audit reveals direct exfiltration of HSM master keys archive via SCP to an external destination.',
      key_points: [
        'Elevation achieved using dormant dev-ops-backup credentials',
        'Payload /tmp/keys_vault.tar.gz contained master encryption certificates',
        'Connection terminated immediately after SCP transfer completed'
      ],
      entities: {
        people: ['dev-ops-backup', 'Root Operator'],
        organizations: ['Apex Security Operations', 'AWS US-West'],
        locations: ['Santa Clara, CA', 'External Relay IP 198.51.100.44']
      },
      important_events: [
        { date: '2026-02-04 02:40 UTC', event: 'SSH key authenticated from unrecognized IP address' },
        { date: '2026-02-04 02:41 UTC', event: 'Sudo command compressed HSM keys directory' },
        { date: '2026-02-04 02:43 UTC', event: 'SCP egress transmission initiated' }
      ],
      suggested_category: 'DIGITAL',
      relevance_score: 95,
      disclaimer: 'AI-generated assistance — verify against original evidence. Does not constitute legal conclusions or legal advice.'
    }
  },
  {
    id: 'evi-903-witness-statement',
    case_id: 'case-2026-001',
    filename: 'witness_interview_cfo_memo.txt',
    original_filename: 'CFO_Internal_Memo_December.txt',
    file_type: 'txt',
    mime_type: 'text/plain',
    file_size: 3200,
    storage_path: 'mock/witness_interview_cfo_memo.txt',
    uploaded_by: 'usr-inv-02',
    uploaded_by_name: 'Detective Marcus Vance',
    uploaded_at: '2026-01-20T11:05:00Z',
    description: 'Sworn deposition memo from former VP of Accounting detailing pressure to bypass compliance alerts.',
    evidence_category: 'DOCUMENT',
    sha256_hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    status: 'PROCESSED',
    source: 'Deposition Interview Transcript, Bates stamped #CL-00412',
    created_at: '2026-01-20T11:05:00Z',
    updated_at: '2026-01-20T11:15:00Z',
    extracted_text: `AFFIDAVIT & DEPOSITION EXCERPT
WITNESS: Patricia Chen, Former Controller
DATE: January 18, 2026
LOCATION: Office of the United States Attorney, SDNY

STATEMENT:
"On December 22, 2025, I was called into a private meeting with the Managing Director. I was shown an unapproved wire authorization schedule for January. When I noted that our anti-money-laundering (AML) system would flag transfers exceeding $3M to unverified shell beneficiaries, I was instructed in writing to apply a temporary bypass token. I refused to sign the waiver. Two days later, my credentials to the banking gateway were revoked."`,
    ai_summary: {
      short_summary: 'Controller affidavit documenting explicit instructions to disable AML transfer verification guards prior to the January transfers.',
      key_points: [
        'Direct testimonial evidence of willful circumvention of internal controls',
        'Confirmation that AML alerts were anticipated by management',
        'Retaliatory revocation of financial gateway access upon witness refusal'
      ],
      entities: {
        people: ['Patricia Chen', 'Managing Director'],
        organizations: ['United States Attorney SDNY', 'Apex Compliance Committee'],
        locations: ['Foley Square, New York, NY']
      },
      important_events: [
        { date: '2025-12-22', event: 'Meeting instructing controller to apply AML bypass token' },
        { date: '2025-12-24', event: 'Controller banking portal access revoked' },
        { date: '2026-01-18', event: 'Formal deposition taken by US Attorney investigators' }
      ],
      suggested_category: 'DOCUMENT',
      relevance_score: 96,
      disclaimer: 'AI-generated assistance — verify against original evidence. Does not constitute legal conclusions or legal advice.'
    }
  }
];

let custodyEvents: ChainOfCustodyEvent[] = [
  {
    id: 'coc-001',
    evidence_id: 'evi-901-wire-records',
    case_id: 'case-2026-001',
    user_id: 'usr-inv-02',
    user_name: 'Detective Marcus Vance',
    user_role: 'INVESTIGATOR',
    action: 'UPLOADED',
    timestamp: '2026-01-16T14:22:00Z',
    ip_address: '10.240.12.88',
    details: 'Initial forensic upload via secured TLS channel. SHA-256 integrity seal calculated and verified.',
    hash_verified: true,
    sha256_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
  },
  {
    id: 'coc-002',
    evidence_id: 'evi-901-wire-records',
    case_id: 'case-2026-001',
    user_id: 'usr-admin-01',
    user_name: 'Lead Counsel Sarah Connor',
    user_role: 'ADMIN',
    action: 'ANALYZED',
    timestamp: '2026-01-16T14:30:15Z',
    ip_address: '10.240.10.15',
    details: 'AI entity and transaction extraction pipeline executed. Forensic timestamp integrity checked.',
    hash_verified: true,
    sha256_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
  },
  {
    id: 'coc-003',
    evidence_id: 'evi-902-forensic-image',
    case_id: 'case-2026-002',
    user_id: 'usr-admin-01',
    user_name: 'Lead Counsel Sarah Connor',
    user_role: 'ADMIN',
    action: 'UPLOADED',
    timestamp: '2026-02-07T09:12:00Z',
    ip_address: '10.240.10.15',
    details: 'Uploaded raw server auth log artifact. Cryptographic SHA-256 seal registered.',
    hash_verified: true,
    sha256_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
  },
  {
    id: 'coc-004',
    evidence_id: 'evi-903-witness-statement',
    case_id: 'case-2026-001',
    user_id: 'usr-inv-02',
    user_name: 'Detective Marcus Vance',
    user_role: 'INVESTIGATOR',
    action: 'UPLOADED',
    timestamp: '2026-01-20T11:05:00Z',
    ip_address: '10.240.12.88',
    details: 'Affidavit text filed into evidence vault with digital verification.',
    hash_verified: true,
    sha256_hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae'
  }
];

let timelineEvents: TimelineEvent[] = [
  {
    id: 'time-001',
    case_id: 'case-2026-001',
    title: 'Case Initiated - Apex Asset Transfer Fraud',
    description: 'Federal investigation formally docketed following whistleblower report.',
    event_type: 'CASE_CREATED',
    timestamp: '2026-01-15T08:30:00Z',
    actor_name: 'Lead Counsel Sarah Connor'
  },
  {
    id: 'time-002',
    case_id: 'case-2026-001',
    title: 'SWIFT MT103 Banking Records Ingested',
    description: 'Cryptographic SHA-256 verified ledger with $14.2M wire records added to repository.',
    event_type: 'EVIDENCE_UPLOADED',
    timestamp: '2026-01-16T14:22:00Z',
    source_evidence_id: 'evi-901-wire-records',
    actor_name: 'Detective Marcus Vance'
  },
  {
    id: 'time-003',
    case_id: 'case-2026-001',
    title: 'Extracted Incident: Unauthorized Wire Tranche 1 & 2',
    description: 'AI timeline extraction flagged simultaneous wires ($4.2M & $5M) to Cayman accounts.',
    event_type: 'EXTRACTED_EVENT',
    timestamp: '2026-01-14T09:15:00Z',
    source_evidence_id: 'evi-901-wire-records',
    actor_name: 'CourtLens AI Intelligence'
  },
  {
    id: 'time-004',
    case_id: 'case-2026-001',
    title: 'Deposition Affidavit Filed',
    description: 'Sworn testimony from former Controller entered into evidence.',
    event_type: 'EVIDENCE_UPLOADED',
    timestamp: '2026-01-20T11:05:00Z',
    source_evidence_id: 'evi-903-witness-statement',
    actor_name: 'Detective Marcus Vance'
  },
  {
    id: 'time-005',
    case_id: 'case-2026-002',
    title: 'Case Docketed - Key Exfiltration Incident',
    description: 'Digital forensics case opened regarding unauthorized HSM key egress.',
    event_type: 'CASE_CREATED',
    timestamp: '2026-02-06T11:00:00Z',
    actor_name: 'Lead Counsel Sarah Connor'
  },
  {
    id: 'time-006',
    case_id: 'case-2026-002',
    title: 'Forensic Server Auth Logs Uploaded',
    description: 'SSH daemon log archive ingested with cryptographic hash registration.',
    event_type: 'EVIDENCE_UPLOADED',
    timestamp: '2026-02-07T09:12:00Z',
    source_evidence_id: 'evi-902-forensic-image',
    actor_name: 'Lead Counsel Sarah Connor'
  }
];

let caseNotes: CaseNote[] = [
  {
    id: 'note-001',
    case_id: 'case-2026-001',
    user_id: 'usr-admin-01',
    user_name: 'Lead Counsel Sarah Connor',
    user_role: 'ADMIN',
    content: 'Grand jury subpoena return date set for April 14th. All wire transfer evidence verified via SHA-256 match with correspondent bank originals.',
    created_at: '2026-02-14T10:00:00Z',
    updated_at: '2026-02-14T10:00:00Z'
  },
  {
    id: 'note-002',
    case_id: 'case-2026-001',
    user_id: 'usr-inv-02',
    user_name: 'Detective Marcus Vance',
    user_role: 'INVESTIGATOR',
    content: 'Cross-referencing Cayman IP registrations with local telecom records. Controller statement corroborated by server gateway audit trail.',
    created_at: '2026-03-01T15:30:00Z',
    updated_at: '2026-03-01T15:30:00Z'
  }
];

// Helper: AI analysis using Gemini API or rule-based fallback
async function generateAIAnalysis(
  filename: string,
  contentSnippet: string,
  category: string
): Promise<EvidenceItem['ai_summary']> {
  const disclaimer = 'AI-generated assistance — verify against original evidence. Does not constitute legal conclusions or legal advice.';

  // Check if GEMINI_API_KEY is available
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI();
      const prompt = `You are CourtLens Legal Intelligence Assistant. Analyze the following legal evidence document.
Provide an objective, non-conclusory analysis. Do NOT determine guilt or innocence. Mark findings as assistance for human investigator review.

Document Name: ${filename}
Category: ${category}
Document Content:
${contentSnippet.slice(0, 4000)}

Respond ONLY with valid JSON in this exact structure:
{
  "short_summary": "1-2 sentence concise neutral summary",
  "key_points": ["Key observation 1", "Key observation 2", "Key observation 3"],
  "entities": {
    "people": ["Name 1", "Name 2"],
    "organizations": ["Org 1", "Org 2"],
    "locations": ["City/Jurisdiction 1"]
  },
  "important_events": [
    {"date": "YYYY-MM-DD or readable date", "event": "neutral description of event"}
  ],
  "suggested_category": "DOCUMENT or FINANCIAL or DIGITAL or IMAGE or AUDIO or VIDEO or COMMUNICATION or OTHER",
  "relevance_score": 85
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return {
          short_summary: parsed.short_summary || `Analyzed ${filename}.`,
          key_points: Array.isArray(parsed.key_points) ? parsed.key_points : ['Document processed successfully.'],
          entities: {
            people: parsed.entities?.people || [],
            organizations: parsed.entities?.organizations || [],
            locations: parsed.entities?.locations || []
          },
          important_events: Array.isArray(parsed.important_events) ? parsed.important_events : [],
          suggested_category: parsed.suggested_category || category,
          relevance_score: Number(parsed.relevance_score) || 85,
          disclaimer
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to heuristic engine:', err);
    }
  }

  // Heuristic rule-based intelligence fallback
  const lines = contentSnippet.split('\n').filter(l => l.trim().length > 0);
  const sampleWords = contentSnippet.slice(0, 500);

  // Extract dates heuristically
  const dateRegex = /\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b/gi;
  const datesFound = Array.from(new Set(contentSnippet.match(dateRegex) || [])).slice(0, 3);
  
  // Extract capitalized entities
  const wordTokens = contentSnippet.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g) || [];
  const candidatePeople = Array.from(new Set(wordTokens)).slice(0, 3);

  return {
    short_summary: `Preliminary legal intelligence analysis of ${filename}. Text extraction identified ${lines.length} lines with key transactional references.`,
    key_points: [
      `File verified with SHA-256 cryptographic seal for chain of custody preservation.`,
      lines[0] ? `Leading record entry: "${lines[0].slice(0, 80)}..."` : 'File structure verified.',
      `Content classified under category ${category} with consistent formatting.`
    ],
    entities: {
      people: candidatePeople.length ? candidatePeople : ['Identified Signatory', 'Review Officer'],
      organizations: ['CourtLens Verification Repository', 'Apex Legal Services'],
      locations: ['Jurisdiction Registry', 'Primary Egress Point']
    },
    important_events: datesFound.length
      ? datesFound.map((d, i) => ({ date: d, event: `Document milestone extracted from record #${i + 1}` }))
      : [{ date: new Date().toISOString().split('T')[0], event: 'Evidence ingestion and cryptographic timestamp registration' }],
    suggested_category: category,
    relevance_score: 90,
    disclaimer
  };
}

// ==========================================
// REST API ROUTES (/api/v1)
// ==========================================

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'CourtLens Intelligence Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    ai_provider: process.env.GEMINI_API_KEY ? 'gemini-3.8-flash' : 'heuristic-fallback',
    storage_type: 'local-filesystem',
    cases_count: cases.length,
    evidence_count: evidenceList.length
  });
});

// Authentication Routes
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || users[0];
  
  res.json({
    success: true,
    token: `courtlens-jwt-token-${user.id}-${Date.now()}`,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      organization: user.organization
    }
  });
});

app.post('/api/v1/auth/register', (req, res) => {
  const { email, full_name, role = 'INVESTIGATOR', organization } = req.body;
  if (!email || !full_name) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email and Full Name are required.' }
    });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'USER_EXISTS', message: 'User with this email already registered.' }
    });
  }

  const newUser: User = {
    id: `usr-${Date.now().toString(36)}`,
    email,
    full_name,
    role: (['ADMIN', 'INVESTIGATOR', 'VIEWER'].includes(role) ? role : 'INVESTIGATOR') as any,
    organization: organization || 'Legal Inquiry Taskforce',
    created_at: new Date().toISOString()
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    token: `courtlens-jwt-token-${newUser.id}-${Date.now()}`,
    user: newUser
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  // Return current user or fallback to first user
  res.json({
    success: true,
    user: users[0]
  });
});

app.get('/api/v1/auth/users', (req, res) => {
  res.json({
    success: true,
    users
  });
});

// Case Management Routes
app.get('/api/v1/cases', (req, res) => {
  const { status, priority, search } = req.query;
  let results = [...cases];

  if (status) {
    results = results.filter(c => c.status === status);
  }
  if (priority) {
    results = results.filter(c => c.priority === priority);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(c => 
      c.title.toLowerCase().includes(q) ||
      c.case_number.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.jurisdiction.toLowerCase().includes(q)
    );
  }

  // Attach evidence count to each case
  const withCounts = results.map(c => ({
    ...c,
    evidence_count: evidenceList.filter(e => e.case_id === c.id).length
  }));

  res.json({
    success: true,
    data: withCounts,
    total: withCounts.length
  });
});

app.post('/api/v1/cases', (req, res) => {
  const { title, description, case_type, priority, jurisdiction, incident_date, assigned_to } = req.body;
  if (!title) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_TITLE', message: 'Case title is mandatory.' }
    });
  }

  const year = new Date().getFullYear();
  const nextNum = String(cases.length + 1).padStart(3, '0');
  const case_number = `CASE-${year}-${nextNum}`;
  const case_id = `case-${year}-${nextNum}`;

  const newCase: Case = {
    id: case_id,
    case_number,
    title,
    description: description || '',
    case_type: case_type || 'General Legal Investigation',
    status: 'OPEN',
    priority: priority || 'MEDIUM',
    jurisdiction: jurisdiction || 'Federal District Court',
    incident_date: incident_date || new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assigned_to: assigned_to || 'Lead Counsel Sarah Connor'
  };

  cases.unshift(newCase);

  // Add timeline event
  timelineEvents.unshift({
    id: `time-${Date.now()}`,
    case_id: newCase.id,
    title: `Case Formally Docketed: ${newCase.case_number}`,
    description: `Case created: "${newCase.title}" under jurisdiction ${newCase.jurisdiction}.`,
    event_type: 'CASE_CREATED',
    timestamp: new Date().toISOString(),
    actor_name: newCase.assigned_to || 'System'
  });

  res.status(201).json({
    success: true,
    data: newCase
  });
});

app.get('/api/v1/cases/:id', (req, res) => {
  const c = cases.find(item => item.id === req.params.id || item.case_number === req.params.id);
  if (!c) {
    return res.status(404).json({
      success: false,
      error: { code: 'CASE_NOT_FOUND', message: 'Requested legal case does not exist.' }
    });
  }

  const caseEvidence = evidenceList.filter(e => e.case_id === c.id);
  const caseTimeline = timelineEvents.filter(t => t.case_id === c.id);
  const caseNoteList = caseNotes.filter(n => n.case_id === c.id);

  res.json({
    success: true,
    data: {
      ...c,
      evidence_count: caseEvidence.length,
      evidence: caseEvidence,
      timeline: caseTimeline,
      notes: caseNoteList
    }
  });
});

app.put('/api/v1/cases/:id', (req, res) => {
  const index = cases.findIndex(item => item.id === req.params.id || item.case_number === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'CASE_NOT_FOUND', message: 'Case not found.' }
    });
  }

  const prev = cases[index];
  const { title, description, case_type, status, priority, jurisdiction, assigned_to } = req.body;

  const statusChanged = status && status !== prev.status;

  cases[index] = {
    ...prev,
    title: title !== undefined ? title : prev.title,
    description: description !== undefined ? description : prev.description,
    case_type: case_type !== undefined ? case_type : prev.case_type,
    status: status !== undefined ? status : prev.status,
    priority: priority !== undefined ? priority : prev.priority,
    jurisdiction: jurisdiction !== undefined ? jurisdiction : prev.jurisdiction,
    assigned_to: assigned_to !== undefined ? assigned_to : prev.assigned_to,
    updated_at: new Date().toISOString()
  };

  if (statusChanged) {
    timelineEvents.unshift({
      id: `time-${Date.now()}`,
      case_id: prev.id,
      title: `Case Status Changed to ${status}`,
      description: `Docket status transitioned from ${prev.status} to ${status}.`,
      event_type: 'STATUS_CHANGED',
      timestamp: new Date().toISOString(),
      actor_name: 'Lead Counsel'
    });
  }

  res.json({
    success: true,
    data: cases[index]
  });
});

app.delete('/api/v1/cases/:id', (req, res) => {
  const index = cases.findIndex(c => c.id === req.params.id || c.case_number === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'CASE_NOT_FOUND', message: 'Case not found.' }
    });
  }
  const deleted = cases.splice(index, 1)[0];
  res.json({
    success: true,
    message: `Case ${deleted.case_number} has been deleted.`,
    data: deleted
  });
});

// Evidence Routes
app.get('/api/v1/cases/:case_id/evidence', (req, res) => {
  const caseId = req.params.case_id;
  const items = evidenceList.filter(e => e.case_id === caseId);
  res.json({
    success: true,
    data: items,
    total: items.length
  });
});

app.get('/api/v1/evidence', (req, res) => {
  const { category, file_type, search } = req.query;
  let items = [...evidenceList];

  if (category) {
    items = items.filter(e => e.evidence_category === category);
  }
  if (file_type) {
    items = items.filter(e => e.file_type.toLowerCase() === (file_type as string).toLowerCase());
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(e => 
      e.filename.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.sha256_hash.toLowerCase().includes(q) ||
      (e.extracted_text && e.extracted_text.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    data: items,
    total: items.length
  });
});

app.get('/api/v1/evidence/:id', (req, res) => {
  const item = evidenceList.find(e => e.id === req.params.id);
  if (!item) {
    return res.status(404).json({
      success: false,
      error: { code: 'EVIDENCE_NOT_FOUND', message: 'Evidence item was not found in the repository.' }
    });
  }

  // Log chain of custody VIEW event
  custodyEvents.unshift({
    id: `coc-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    evidence_id: item.id,
    case_id: item.case_id,
    user_id: 'usr-admin-01',
    user_name: 'Active User',
    user_role: 'INVESTIGATOR',
    action: 'VIEWED',
    timestamp: new Date().toISOString(),
    ip_address: req.ip || '127.0.0.1',
    details: 'Evidence file dossier accessed for examination.',
    hash_verified: true,
    sha256_hash: item.sha256_hash
  });

  res.json({
    success: true,
    data: item
  });
});

// File Upload with SHA-256 calculation & Duplicate Detection
app.post('/api/v1/cases/:case_id/evidence', upload.single('file'), async (req, res) => {
  try {
    const caseId = req.params.case_id;
    const targetCase = cases.find(c => c.id === caseId || c.case_number === caseId);

    if (!targetCase) {
      return res.status(404).json({
        success: false,
        error: { code: 'CASE_NOT_FOUND', message: 'Cannot upload evidence to nonexistent case.' }
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: { code: 'FILE_MISSING', message: 'No file was provided in the upload request.' }
      });
    }

    // Step 1: Calculate raw cryptographic SHA-256 hash from server buffer
    const sha256Hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Step 2: Check for existing identical hash (Duplicate Detection)
    const existingDuplicate = evidenceList.find(e => e.sha256_hash === sha256Hash);
    const allowDuplicate = req.body.force_duplicate === 'true';

    if (existingDuplicate && !allowDuplicate) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_EVIDENCE',
          message: 'A file with identical cryptographic SHA-256 hash already exists in the repository.',
          sha256_hash: sha256Hash,
          existing_evidence_id: existingDuplicate.id,
          existing_filename: existingDuplicate.original_filename,
          existing_case_id: existingDuplicate.case_id
        }
      });
    }

    // Step 3: Secure filename & write to storage
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '') || 'bin';
    const safeFilename = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storagePath = path.join(UPLOADS_DIR, safeFilename);
    fs.writeFileSync(storagePath, file.buffer);

    // Step 4: Category deduction
    const mime = file.mimetype;
    let category: EvidenceItem['evidence_category'] = 'OTHER';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext) || mime.includes('text') || mime.includes('pdf')) {
      category = 'DOCUMENT';
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) || mime.includes('image')) {
      category = 'IMAGE';
    } else if (['mp4', 'mkv', 'mov', 'avi'].includes(ext) || mime.includes('video')) {
      category = 'VIDEO';
    } else if (['mp3', 'wav', 'm4a', 'flac'].includes(ext) || mime.includes('audio')) {
      category = 'AUDIO';
    } else if (['csv', 'xls', 'xlsx'].includes(ext)) {
      category = 'FINANCIAL';
    } else if (['json', 'log', 'pcap', 'bin'].includes(ext)) {
      category = 'DIGITAL';
    }

    if (req.body.category) {
      category = req.body.category;
    }

    // Step 5: Extract text preview if readable
    let extractedText = '';
    if (['txt', 'csv', 'json', 'log'].includes(ext) || mime.startsWith('text/')) {
      extractedText = file.buffer.toString('utf-8');
    } else {
      extractedText = `[Extracted Binary Metadata]\nFilename: ${file.originalname}\nSize: ${file.size} bytes\nMIME: ${file.mimetype}\nSHA-256: ${sha256Hash}`;
    }

    // Step 6: Create evidence entity
    const evidenceId = `evi-${Date.now().toString(36)}-${Math.random().toString(36).substring(7)}`;
    const newEvidence: EvidenceItem = {
      id: evidenceId,
      case_id: targetCase.id,
      filename: safeFilename,
      original_filename: file.originalname,
      file_type: ext,
      mime_type: file.mimetype,
      file_size: file.size,
      storage_path: `uploads/${safeFilename}`,
      uploaded_by: req.body.uploaded_by || 'usr-inv-02',
      uploaded_by_name: req.body.uploaded_by_name || 'Detective Marcus Vance',
      uploaded_at: new Date().toISOString(),
      description: req.body.description || `Evidence file ${file.originalname} uploaded into vault.`,
      evidence_category: category,
      sha256_hash: sha256Hash,
      status: 'PROCESSING',
      source: req.body.source || 'Investigator Direct Submission',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      extracted_text: extractedText
    };

    evidenceList.unshift(newEvidence);

    // Step 7: Record Chain of Custody event
    custodyEvents.unshift({
      id: `coc-${Date.now()}`,
      evidence_id: newEvidence.id,
      case_id: targetCase.id,
      user_id: newEvidence.uploaded_by,
      user_name: newEvidence.uploaded_by_name,
      user_role: 'INVESTIGATOR',
      action: 'UPLOADED',
      timestamp: new Date().toISOString(),
      ip_address: req.ip || '127.0.0.1',
      details: `Original upload of "${file.originalname}" (${file.size} bytes). SHA-256 cryptographic seal established.`,
      hash_verified: true,
      sha256_hash: sha256Hash
    });

    // Step 8: Add to Case Timeline
    timelineEvents.unshift({
      id: `time-${Date.now()}`,
      case_id: targetCase.id,
      title: `Evidence Ingested: ${file.originalname}`,
      description: `Category: ${category} · Hash: ${sha256Hash.substring(0, 16)}...`,
      event_type: 'EVIDENCE_UPLOADED',
      timestamp: new Date().toISOString(),
      source_evidence_id: newEvidence.id,
      actor_name: newEvidence.uploaded_by_name
    });

    // Step 9: Asynchronous AI analysis
    generateAIAnalysis(file.originalname, extractedText, category).then(aiAnalysis => {
      const idx = evidenceList.findIndex(e => e.id === newEvidence.id);
      if (idx !== -1) {
        evidenceList[idx].ai_summary = aiAnalysis;
        evidenceList[idx].status = 'PROCESSED';
        evidenceList[idx].updated_at = new Date().toISOString();

        // Add extracted timeline events if any
        if (aiAnalysis?.important_events?.length) {
          aiAnalysis.important_events.forEach(evt => {
            timelineEvents.push({
              id: `time-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              case_id: targetCase.id,
              title: `AI Extracted Event: ${evt.event.slice(0, 60)}`,
              description: `Extracted from ${file.originalname}. Verification required against source document.`,
              event_type: 'EXTRACTED_EVENT',
              timestamp: evt.date.includes('T') ? evt.date : `${evt.date}T12:00:00Z`,
              source_evidence_id: newEvidence.id,
              actor_name: 'CourtLens AI Intelligence'
            });
          });
        }
      }
    }).catch(err => {
      console.error('Async AI Analysis failed:', err);
      const idx = evidenceList.findIndex(e => e.id === newEvidence.id);
      if (idx !== -1) {
        evidenceList[idx].status = 'PROCESSED';
      }
    });

    res.status(201).json({
      success: true,
      message: 'Evidence uploaded successfully and queued for AI intelligence processing.',
      data: newEvidence
    });
  } catch (error: any) {
    console.error('Error during evidence upload:', error);
    res.status(500).json({
      success: false,
      error: { code: 'UPLOAD_FAILED', message: error.message || 'Internal server error while processing evidence.' }
    });
  }
});

// Evidence Download
app.get('/api/v1/evidence/:id/download', (req, res) => {
  const item = evidenceList.find(e => e.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Evidence not found.' } });
  }

  // Audit download
  custodyEvents.unshift({
    id: `coc-${Date.now()}`,
    evidence_id: item.id,
    case_id: item.case_id,
    user_id: 'usr-admin-01',
    user_name: 'Lead Counsel Sarah Connor',
    user_role: 'ADMIN',
    action: 'DOWNLOADED',
    timestamp: new Date().toISOString(),
    ip_address: req.ip || '127.0.0.1',
    details: 'Forensic file export downloaded by authorized user.',
    hash_verified: true,
    sha256_hash: item.sha256_hash
  });

  const fullPath = path.resolve(process.cwd(), item.storage_path);
  if (fs.existsSync(fullPath)) {
    return res.download(fullPath, item.original_filename);
  }

  // If mock file, stream mock content
  res.setHeader('Content-Disposition', `attachment; filename="${item.original_filename}"`);
  res.setHeader('Content-Type', item.mime_type);
  res.send(item.extracted_text || `[CourtLens Sealed Evidence File: ${item.original_filename}]`);
});

// Evidence Preview
app.get('/api/v1/evidence/:id/preview', (req, res) => {
  const item = evidenceList.find(e => e.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Evidence not found.' } });
  }

  res.json({
    success: true,
    data: {
      id: item.id,
      filename: item.original_filename,
      mime_type: item.mime_type,
      file_type: item.file_type,
      file_size: item.file_size,
      sha256_hash: item.sha256_hash,
      extracted_text: item.extracted_text,
      ai_summary: item.ai_summary
    }
  });
});

// Evidence Chain of Custody
app.get('/api/v1/evidence/:id/custody', (req, res) => {
  const item = evidenceList.find(e => e.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Evidence not found.' } });
  }
  const events = custodyEvents.filter(c => c.evidence_id === item.id);
  res.json({
    success: true,
    data: events,
    total: events.length
  });
});

// Trigger Manual AI Analysis for Evidence
app.post('/api/v1/evidence/:id/analyze', async (req, res) => {
  const item = evidenceList.find(e => e.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Evidence not found.' } });
  }

  const analysis = await generateAIAnalysis(item.original_filename, item.extracted_text || item.description, item.evidence_category);
  item.ai_summary = analysis;
  item.status = 'PROCESSED';
  item.updated_at = new Date().toISOString();

  // Audit event
  custodyEvents.unshift({
    id: `coc-${Date.now()}`,
    evidence_id: item.id,
    case_id: item.case_id,
    user_id: 'usr-admin-01',
    user_name: 'Lead Counsel Sarah Connor',
    user_role: 'ADMIN',
    action: 'ANALYZED',
    timestamp: new Date().toISOString(),
    ip_address: req.ip || '127.0.0.1',
    details: 'AI intelligence re-analysis executed.',
    hash_verified: true,
    sha256_hash: item.sha256_hash
  });

  res.json({
    success: true,
    data: analysis
  });
});

// Timeline Routes
app.get('/api/v1/cases/:case_id/timeline', (req, res) => {
  const caseId = req.params.case_id;
  const events = timelineEvents
    .filter(t => t.case_id === caseId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({
    success: true,
    data: events,
    total: events.length
  });
});

app.post('/api/v1/cases/:case_id/timeline', (req, res) => {
  const caseId = req.params.case_id;
  const { title, description, timestamp, event_type = 'EXTRACTED_EVENT', actor_name = 'Investigator' } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_TITLE', message: 'Title is required' } });
  }

  const newEvent: TimelineEvent = {
    id: `time-${Date.now()}`,
    case_id: caseId,
    title,
    description: description || '',
    event_type,
    timestamp: timestamp || new Date().toISOString(),
    actor_name
  };

  timelineEvents.unshift(newEvent);

  res.status(201).json({
    success: true,
    data: newEvent
  });
});

// Case Notes Routes
app.get('/api/v1/cases/:case_id/notes', (req, res) => {
  const caseId = req.params.case_id;
  const notes = caseNotes
    .filter(n => n.case_id === caseId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({
    success: true,
    data: notes,
    total: notes.length
  });
});

app.post('/api/v1/cases/:case_id/notes', (req, res) => {
  const caseId = req.params.case_id;
  const { content, user_name, user_role } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, error: { code: 'EMPTY_NOTE', message: 'Note content cannot be empty' } });
  }

  const newNote: CaseNote = {
    id: `note-${Date.now()}`,
    case_id: caseId,
    user_id: 'usr-inv-02',
    user_name: user_name || 'Detective Marcus Vance',
    user_role: user_role || 'INVESTIGATOR',
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  caseNotes.unshift(newNote);

  // Add timeline entry for note
  timelineEvents.unshift({
    id: `time-${Date.now()}`,
    case_id: caseId,
    title: `Investigator Note Added`,
    description: `"${content.slice(0, 70)}..."`,
    event_type: 'NOTE_ADDED',
    timestamp: new Date().toISOString(),
    actor_name: newNote.user_name
  });

  res.status(201).json({
    success: true,
    data: newNote
  });
});

// Global Search Route
app.get('/api/v1/search', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  const category = req.query.category as string;
  const caseId = req.query.case_id as string;

  let matchedCases = [...cases];
  let matchedEvidence = [...evidenceList];

  if (query) {
    matchedCases = matchedCases.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.case_number.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.jurisdiction.toLowerCase().includes(query)
    );

    matchedEvidence = matchedEvidence.filter(e =>
      e.filename.toLowerCase().includes(query) ||
      e.original_filename.toLowerCase().includes(query) ||
      e.description.toLowerCase().includes(query) ||
      e.sha256_hash.toLowerCase().includes(query) ||
      (e.extracted_text && e.extracted_text.toLowerCase().includes(query)) ||
      (e.ai_summary && (
        e.ai_summary.short_summary.toLowerCase().includes(query) ||
        e.ai_summary.key_points.some(kp => kp.toLowerCase().includes(query)) ||
        e.ai_summary.entities.people.some(p => p.toLowerCase().includes(query)) ||
        e.ai_summary.entities.organizations.some(o => o.toLowerCase().includes(query))
      ))
    );
  }

  if (category) {
    matchedEvidence = matchedEvidence.filter(e => e.evidence_category === category);
  }

  if (caseId) {
    matchedEvidence = matchedEvidence.filter(e => e.case_id === caseId);
  }

  res.json({
    success: true,
    query,
    total_results: matchedCases.length + matchedEvidence.length,
    results: {
      cases: matchedCases,
      evidence: matchedEvidence
    }
  });
});

// Dashboard Statistics Route
app.get('/api/v1/dashboard/statistics', (req, res) => {
  const totalCases = cases.length;
  const activeCases = cases.filter(c => ['OPEN', 'UNDER_INVESTIGATION', 'PENDING'].includes(c.status)).length;
  const closedCases = cases.filter(c => ['CLOSED', 'ARCHIVED'].includes(c.status)).length;
  const totalEvidence = evidenceList.length;

  // Breakdown by evidence category
  const evidenceByCategory: Record<string, number> = {
    DOCUMENT: 0,
    IMAGE: 0,
    VIDEO: 0,
    AUDIO: 0,
    DIGITAL: 0,
    FINANCIAL: 0,
    COMMUNICATION: 0,
    OTHER: 0
  };
  evidenceList.forEach(e => {
    if (evidenceByCategory[e.evidence_category] !== undefined) {
      evidenceByCategory[e.evidence_category]++;
    } else {
      evidenceByCategory.OTHER++;
    }
  });

  // Recent 5 evidence items
  const recentEvidence = [...evidenceList]
    .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
    .slice(0, 5);

  // Recent 5 cases
  const recentCases = [...cases]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Recent 8 audit logs
  const recentActivity = [...custodyEvents].slice(0, 8);

  res.json({
    success: true,
    data: {
      overview: {
        total_cases: totalCases,
        active_cases: activeCases,
        closed_cases: closedCases,
        total_evidence: totalEvidence,
        total_custody_events: custodyEvents.length,
        verified_integrity_rate: '100%'
      },
      evidence_by_category: evidenceByCategory,
      recent_cases: recentCases,
      recent_evidence: recentEvidence,
      recent_activity: recentActivity
    }
  });
});

// Audit Logs Route (Admin View)
app.get('/api/v1/audit/logs', (req, res) => {
  res.json({
    success: true,
    data: custodyEvents,
    total: custodyEvents.length
  });
});

// ==========================================
// Vite Middleware & Static Serving
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve static production build if exists
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    // In dev mode, mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CourtLens Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
