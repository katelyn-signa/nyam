from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from backend.app.database.session import get_db
from backend.app.models.models import Case, Evidence, CaseTimelineEvent, CaseNote
from backend.app.schemas.schemas import CaseCreate, CaseUpdate, CaseResponse
from backend.app.services.case_service import CaseService

router = APIRouter(prefix="/cases", tags=["Case Management"])

@router.get("", response_model=List[CaseResponse])
async def list_cases(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    cases = await CaseService.get_cases(db, status=status, priority=priority, search=search)
    return cases

@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(case_in: CaseCreate, db: AsyncSession = Depends(get_db)):
    created = await CaseService.create_case(db, case_in.model_dump(), creator_name=case_in.assigned_to or "Investigator")
    return created

@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(case_id: UUID, db: AsyncSession = Depends(get_db)):
    query = select(Case).where(Case.id == case_id).options(selectinload(Case.evidence))
    res = await db.execute(query)
    c = res.scalars().first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case docket not found")
    c.evidence_count = len(c.evidence)
    return c

@router.put("/{case_id}", response_model=CaseResponse)
async def update_case(case_id: UUID, case_in: CaseUpdate, db: AsyncSession = Depends(get_db)):
    query = select(Case).where(Case.id == case_id)
    res = await db.execute(query)
    c = res.scalars().first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    update_data = case_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(c, field, val)

    await db.commit()
    await db.refresh(c)
    return c

@router.delete("/{case_id}")
async def delete_case(case_id: UUID, db: AsyncSession = Depends(get_db)):
    query = select(Case).where(Case.id == case_id)
    res = await db.execute(query)
    c = res.scalars().first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    await db.delete(c)
    await db.commit()
    return {"success": True, "message": f"Case {c.case_number} deleted successfully."}
