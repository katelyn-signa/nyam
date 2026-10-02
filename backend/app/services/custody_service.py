from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.app.models.models import EvidenceAuditEvent

class CustodyService:
    @staticmethod
    async def log_event(
        db: AsyncSession,
        evidence_id: str,
        case_id: str,
        user_id: str,
        user_name: str,
        user_role: str,
        action: str,
        sha256_hash: str,
        details: str,
        ip_address: str = "127.0.0.1"
    ) -> EvidenceAuditEvent:
        event = EvidenceAuditEvent(
            evidence_id=evidence_id,
            case_id=case_id,
            user_id=user_id,
            user_name=user_name,
            user_role=user_role,
            action=action,
            details=details,
            sha256_hash=sha256_hash,
            ip_address=ip_address,
            hash_verified=True
        )
        db.add(event)
        await db.commit()
        await db.refresh(event)
        return event

    @staticmethod
    async def get_evidence_custody(db: AsyncSession, evidence_id: str) -> List[EvidenceAuditEvent]:
        query = select(EvidenceAuditEvent).where(EvidenceAuditEvent.evidence_id == evidence_id).order_by(EvidenceAuditEvent.timestamp.desc())
        res = await db.execute(query)
        return res.scalars().all()

    @staticmethod
    async def get_all_audit_logs(db: AsyncSession) -> List[EvidenceAuditEvent]:
        query = select(EvidenceAuditEvent).order_by(EvidenceAuditEvent.timestamp.desc())
        res = await db.execute(query)
        return res.scalars().all()
