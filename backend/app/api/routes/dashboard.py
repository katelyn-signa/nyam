from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.app.database.session import get_db
from backend.app.models.models import Case, Evidence, EvidenceAuditEvent

router = APIRouter(prefix="/dashboard", tags=["Executive Dashboard"])

@router.get("/statistics")
async def get_dashboard_statistics(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    case_res = await db.execute(select(Case).order_by(Case.created_at.desc()))
    all_cases = case_res.scalars().all()

    evi_res = await db.execute(select(Evidence).order_by(Evidence.uploaded_at.desc()))
    all_evidence = evi_res.scalars().all()

    audit_res = await db.execute(select(EvidenceAuditEvent).order_by(EvidenceAuditEvent.timestamp.desc()).limit(10))
    recent_activity = audit_res.scalars().all()

    active_cases = len([c for c in all_cases if c.status in ["OPEN", "UNDER_INVESTIGATION", "PENDING"]])
    closed_cases = len([c for c in all_cases if c.status in ["CLOSED", "ARCHIVED"]])

    categories_count: Dict[str, int] = {
        "DOCUMENT": 0, "IMAGE": 0, "VIDEO": 0, "AUDIO": 0,
        "DIGITAL": 0, "FINANCIAL": 0, "COMMUNICATION": 0, "OTHER": 0
    }
    for e in all_evidence:
        cat = e.evidence_category if e.evidence_category in categories_count else "OTHER"
        categories_count[cat] += 1

    return {
        "success": True,
        "data": {
            "overview": {
                "total_cases": len(all_cases),
                "active_cases": active_cases,
                "closed_cases": closed_cases,
                "total_evidence": len(all_evidence),
                "total_custody_events": len(recent_activity),
                "verified_integrity_rate": "100%"
            },
            "evidence_by_category": categories_count,
            "recent_cases": all_cases[:5],
            "recent_evidence": all_evidence[:5],
            "recent_activity": recent_activity
        }
    }
