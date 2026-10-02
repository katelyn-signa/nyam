import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class UserRoleEnum(str, Enum):
    ADMIN = "ADMIN"
    INVESTIGATOR = "INVESTIGATOR"
    VIEWER = "VIEWER"

class CaseStatusEnum(str, Enum):
    OPEN = "OPEN"
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"
    PENDING = "PENDING"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"

class CasePriorityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class EvidenceCategoryEnum(str, Enum):
    DOCUMENT = "DOCUMENT"
    IMAGE = "IMAGE"
    VIDEO = "VIDEO"
    AUDIO = "AUDIO"
    DIGITAL = "DIGITAL"
    FINANCIAL = "FINANCIAL"
    COMMUNICATION = "COMMUNICATION"
    OTHER = "OTHER"

class EvidenceStatusEnum(str, Enum):
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    PROCESSED = "PROCESSED"
    FAILED = "FAILED"

class CustodyActionEnum(str, Enum):
    UPLOADED = "UPLOADED"
    VIEWED = "VIEWED"
    DOWNLOADED = "DOWNLOADED"
    ANALYZED = "ANALYZED"
    MODIFIED = "MODIFIED"
    RENAMED = "RENAMED"
    CATEGORIZED = "CATEGORIZED"
    NOTE_ADDED = "NOTE_ADDED"
    DELETED = "DELETED"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(32), default="INVESTIGATOR", nullable=False)
    organization = Column(String(255), default="Department of Justice")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class Case(Base):
    __tablename__ = "cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_number = Column(String(64), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    case_type = Column(String(128), default="General Legal Investigation")
    status = Column(String(32), default="OPEN", index=True, nullable=False)
    priority = Column(String(32), default="MEDIUM", index=True, nullable=False)
    jurisdiction = Column(String(255), default="Federal District Court")
    incident_date = Column(DateTime, nullable=True)
    assigned_to = Column(String(255), nullable=True)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    evidence = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    timeline_events = relationship("CaseTimelineEvent", back_populates="case", cascade="all, delete-orphan")
    notes = relationship("CaseNote", back_populates="case", cascade="all, delete-orphan")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(32), nullable=False)
    mime_type = Column(String(128), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    storage_path = Column(String(512), nullable=False)
    uploaded_by = Column(String(64), nullable=False)
    uploaded_by_name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    evidence_category = Column(String(64), default="DOCUMENT", index=True, nullable=False)
    sha256_hash = Column(String(64), nullable=False, index=True)
    status = Column(String(32), default="PROCESSING", nullable=False)
    source = Column(String(255), default="Digital Evidence Intake")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    case = relationship("Case", back_populates="evidence")
    content = relationship("EvidenceContent", uselist=False, back_populates="evidence", cascade="all, delete-orphan")
    audit_events = relationship("EvidenceAuditEvent", back_populates="evidence", cascade="all, delete-orphan")

class EvidenceContent(Base):
    __tablename__ = "evidence_content"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evidence_id = Column(UUID(as_uuid=True), ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False, unique=True)
    extracted_text = Column(Text, nullable=True)
    ai_summary_json = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    evidence = relationship("Evidence", back_populates="content")

class EvidenceAuditEvent(Base):
    __tablename__ = "evidence_audit_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evidence_id = Column(UUID(as_uuid=True), ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False, index=True)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(64), nullable=False)
    user_name = Column(String(255), nullable=False)
    user_role = Column(String(32), nullable=False)
    action = Column(String(32), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    ip_address = Column(String(45), default="127.0.0.1")
    details = Column(Text, nullable=True)
    sha256_hash = Column(String(64), nullable=False)
    hash_verified = Column(Boolean, default=True)

    evidence = relationship("Evidence", back_populates="audit_events")

class CaseTimelineEvent(Base):
    __tablename__ = "case_timeline_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    event_type = Column(String(64), default="EXTRACTED_EVENT", index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    source_evidence_id = Column(String(64), nullable=True)
    actor_name = Column(String(255), default="System")

    case = relationship("Case", back_populates="timeline_events")

class CaseNote(Base):
    __tablename__ = "case_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(64), nullable=False)
    user_name = Column(String(255), nullable=False)
    user_role = Column(String(32), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    case = relationship("Case", back_populates="notes")
