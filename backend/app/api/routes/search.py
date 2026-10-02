from typing import Optional, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.app.database.session import get_db
from backend.app.models.models import Case, Evidence, EvidenceContent

router = APIRouter(prefix="/search", tags=["Global Search"])

@router.get("")
async def search_vault(
    q: Optional[str] = Query(None, description="Keywords, entities, or SHA-256 hash"),
    category: Optional[str] = None,
    case_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    matched_cases = []
    matched_evidence = []

    case_query = select(Case)
    evidence_query = select(Evidence)

    if category and category != "ALL":
        evidence_query = evidence_query.where(Evidence.evidence_category == category)
    if case_id:
        evidence_query = evidence_query.where(Evidence.case_id == case_id)

    case_res = await db.execute(case_query)
    all_cases = case_res.scalars().all()

    evi_res = await db.execute(evidence_query)
    all_evidence = evi_res.scalars().all()

    if q:
        query_str = q.lower().strip()
        matched_cases = [
            c for c in all_cases
            if query_str in c.title.lower() or query_str in c.case_number.lower() or query_str in (c.description or "").lower()
        ]
        matched_evidence = [
            e for e in all_evidence
            if query_str in e.original_filename.lower() or query_str in e.sha256_hash.lower() or query_str in (e.description or "").lower()
        ]
    else:
        matched_cases = all_cases
        matched_evidence = all_evidence

    return {
        "success": True,
        "query": q or "",
        "total_results": len(matched_cases) + len(matched_evidence),
        "results": {
            "cases": matched_cases,
            "evidence": matched_evidence
        }
    }
