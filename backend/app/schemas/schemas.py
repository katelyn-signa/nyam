from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str
    role: str = "INVESTIGATOR"
    organization: Optional[str] = "Department of Justice"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: str
    organization: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Case Schemas
class CaseCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: Optional[str] = None
    case_type: str = "General Legal Investigation"
    priority: str = "MEDIUM"
    jurisdiction: str = "Federal District Court"
    incident_date: Optional[datetime] = None
    assigned_to: Optional[str] = None

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    case_type: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    jurisdiction: Optional[str] = None
    assigned_to: Optional[str] = None

class CaseResponse(BaseModel):
    id: UUID
    case_number: str
    title: str
    description: Optional[str]
    case_type: str
    status: str
    priority: str
    jurisdiction: str
    incident_date: Optional[datetime]
    assigned_to: Optional[str]
    ai_summary: Optional[str]
    created_at: datetime
    updated_at: datetime
    evidence_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Evidence Schemas
class AIAnalysisResult(BaseModel):
    short_summary: str
    key_points: List[str]
    entities: Dict[str, List[str]]
    important_events: List[Dict[str, str]]
    suggested_category: str
    relevance_score: int
    disclaimer: str = "AI-generated assistance — verify against original evidence. Does not constitute legal advice or legal findings."

class EvidenceResponse(BaseModel):
    id: UUID
    case_id: UUID
    filename: str
    original_filename: str
    file_type: str
    mime_type: str
    file_size: int
    storage_path: str
    uploaded_by: str
    uploaded_by_name: Optional[str]
    description: Optional[str]
    evidence_category: str
    sha256_hash: str
    status: str
    source: str
    created_at: datetime
    updated_at: datetime
    extracted_text: Optional[str] = None
    ai_summary: Optional[AIAnalysisResult] = None

    class Config:
        from_attributes = True

class CustodyEventResponse(BaseModel):
    id: UUID
    evidence_id: UUID
    case_id: UUID
    user_id: str
    user_name: str
    user_role: str
    action: str
    timestamp: datetime
    ip_address: str
    details: Optional[str]
    sha256_hash: str
    hash_verified: bool

    class Config:
        from_attributes = True

class TimelineEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str = "EXTRACTED_EVENT"
    timestamp: Optional[datetime] = None
    source_evidence_id: Optional[str] = None

class TimelineEventResponse(BaseModel):
    id: UUID
    case_id: UUID
    title: str
    description: Optional[str]
    event_type: str
    timestamp: datetime
    source_evidence_id: Optional[str]
    actor_name: str

    class Config:
        from_attributes = True

class CaseNoteCreate(BaseModel):
    content: str = Field(min_length=1)

class CaseNoteResponse(BaseModel):
    id: UUID
    case_id: UUID
    user_id: str
    user_name: str
    user_role: str
    content: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DuplicateErrorResponse(BaseModel):
    code: str = "DUPLICATE_EVIDENCE"
    message: str
    sha256_hash: str
    existing_evidence_id: str
    existing_filename: str
    existing_case_id: str
