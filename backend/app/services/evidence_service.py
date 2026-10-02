import hashlib
import time
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from backend.app.models.models import Evidence, EvidenceContent, EvidenceAuditEvent, CaseTimelineEvent
from backend.app.storage.local import LocalStorageProvider
from backend.app.ai.factory import get_ai_provider

storage_provider = LocalStorageProvider()
ai_provider = get_ai_provider()

class DuplicateEvidenceException(Exception):
    def __init__(self, existing_evidence: Evidence, sha256_hash: str):
        self.existing_evidence = existing_evidence
        self.sha256_hash = sha256_hash

class EvidenceService:
    @staticmethod
    def calculate_sha256(content: bytes) -> str:
        """Calculate cryptographically secure SHA-256 hash from raw uploaded buffer."""
        return hashlib.sha256(content).hexdigest()

    @classmethod
    async def process_and_store_evidence(
        cls,
        db: AsyncSession,
        case_id: str,
        original_filename: str,
        content: bytes,
        mime_type: str,
        user_id: str,
        user_name: str,
        user_role: str,
        description: Optional[str] = None,
        category: Optional[str] = None,
        source: str = "Digital Evidence Intake",
        force_duplicate: bool = False,
        client_ip: str = "127.0.0.1"
    ) -> Evidence:
        # Step 1: Compute authoritative SHA-256 hash on server
        sha256_hash = cls.calculate_sha256(content)

        # Step 2: Duplicate check
        query = select(Evidence).where(Evidence.sha256_hash == sha256_hash)
        res = await db.execute(query)
        existing = res.scalars().first()

        if existing and not force_duplicate:
            raise DuplicateEvidenceException(existing_evidence=existing, sha256_hash=sha256_hash)

        # Step 3: Determine extension & category
        ext = original_filename.split(".")[-1].lower() if "." in original_filename else "bin"
        if not category:
            category = await ai_provider.classify_evidence(original_filename, content[:500].decode("utf-8", errors="ignore"))

        # Step 4: Save to storage provider
        safe_filename = f"{int(time.time())}_{original_filename.replace(' ', '_')}"
        stored_path = await storage_provider.save_file(safe_filename, content)

        # Step 5: Extract readable text
        extracted_text = ""
        if ext in ["txt", "csv", "json", "log"] or mime_type.startswith("text/"):
            extracted_text = content.decode("utf-8", errors="replace")
        else:
            extracted_text = f"[Binary File Artifact]\nFilename: {original_filename}\nSize: {len(content)} bytes\nSHA-256: {sha256_hash}"

        # Step 6: Create Evidence Record
        evidence = Evidence(
            case_id=case_id,
            filename=safe_filename,
            original_filename=original_filename,
            file_type=ext,
            mime_type=mime_type,
            file_size=len(content),
            storage_path=stored_path,
            uploaded_by=user_id,
            uploaded_by_name=user_name,
            description=description or f"Evidence file {original_filename} ingested into vault.",
            evidence_category=category,
            sha256_hash=sha256_hash,
            status="PROCESSED",
            source=source
        )
        db.add(evidence)
        await db.flush()

        # Step 7: Record Content & AI Summary
        ai_summary = await ai_provider.summarize_evidence(original_filename, extracted_text, category)
        content_record = EvidenceContent(
            evidence_id=evidence.id,
            extracted_text=extracted_text,
            ai_summary_json=ai_summary
        )
        db.add(content_record)

        # Step 8: Create Chain of Custody Audit Event
        custody_event = EvidenceAuditEvent(
            evidence_id=evidence.id,
            case_id=case_id,
            user_id=user_id,
            user_name=user_name,
            user_role=user_role,
            action="UPLOADED",
            ip_address=client_ip,
            details=f"Initial ingestion of '{original_filename}' ({len(content)} bytes). SHA-256 integrity seal calculated.",
            sha256_hash=sha256_hash,
            hash_verified=True
        )
        db.add(custody_event)

        # Step 9: Add to Case Timeline
        timeline_event = CaseTimelineEvent(
            case_id=case_id,
            title=f"Evidence Ingested: {original_filename}",
            description=f"Category: {category} · SHA-256: {sha256_hash[:16]}...",
            event_type="EVIDENCE_UPLOADED",
            source_evidence_id=str(evidence.id),
            actor_name=user_name
        )
        db.add(timeline_event)

        await db.commit()
        await db.refresh(evidence)
        return evidence
