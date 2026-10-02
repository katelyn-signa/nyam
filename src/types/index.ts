export type UserRole = 'ADMIN' | 'INVESTIGATOR' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization: string;
  created_at: string;
}

export type CaseStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'PENDING' | 'CLOSED' | 'ARCHIVED';
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Case {
  id: string;
  case_number: string;
  title: string;
  description: string;
  case_type: string;
  status: CaseStatus;
  priority: CasePriority;
  jurisdiction: string;
  incident_date: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  ai_summary?: string;
  evidence_count?: number;
}

export type EvidenceCategory =
  | 'DOCUMENT'
  | 'IMAGE'
  | 'VIDEO'
  | 'AUDIO'
  | 'DIGITAL'
  | 'FINANCIAL'
  | 'COMMUNICATION'
  | 'OTHER';

export type EvidenceStatus = 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

export interface AIAnalysisSummary {
  short_summary: string;
  key_points: string[];
  entities: {
    people: string[];
    organizations: string[];
    locations: string[];
  };
  important_events: {
    date: string;
    event: string;
  }[];
  suggested_category: string;
  relevance_score: number;
  disclaimer: string;
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
  evidence_category: EvidenceCategory;
  sha256_hash: string;
  status: EvidenceStatus;
  source: string;
  created_at: string;
  updated_at: string;
  extracted_text?: string;
  ai_summary?: AIAnalysisSummary;
}

export type CustodyAction =
  | 'UPLOADED'
  | 'VIEWED'
  | 'DOWNLOADED'
  | 'ANALYZED'
  | 'MODIFIED'
  | 'RENAMED'
  | 'CATEGORIZED'
  | 'NOTE_ADDED'
  | 'DELETED';

export interface ChainOfCustodyEvent {
  id: string;
  evidence_id: string;
  case_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: CustodyAction;
  timestamp: string;
  ip_address: string;
  details: string;
  hash_verified: boolean;
  sha256_hash: string;
}

export type TimelineEventType =
  | 'CASE_CREATED'
  | 'EVIDENCE_UPLOADED'
  | 'EVIDENCE_ANALYZED'
  | 'EXTRACTED_EVENT'
  | 'STATUS_CHANGED'
  | 'NOTE_ADDED';

export interface TimelineEvent {
  id: string;
  case_id: string;
  title: string;
  description: string;
  event_type: TimelineEventType;
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

export interface DashboardStatistics {
  overview: {
    total_cases: number;
    active_cases: number;
    closed_cases: number;
    total_evidence: number;
    total_custody_events: number;
    verified_integrity_rate: string;
  };
  evidence_by_category: Record<EvidenceCategory | string, number>;
  recent_cases: Case[];
  recent_evidence: EvidenceItem[];
  recent_activity: ChainOfCustodyEvent[];
}

export interface DuplicateConflictError {
  code: 'DUPLICATE_EVIDENCE';
  message: string;
  sha256_hash: string;
  existing_evidence_id: string;
  existing_filename: string;
  existing_case_id: string;
}
