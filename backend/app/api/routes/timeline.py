from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.app.database.session import get_db
from backend.app.models.models import CaseTimelineEvent, CaseNote
from backend.app.schemas.schemas import (
    TimelineEventCreate,
    TimelineEventResponse,
    CaseNoteCreate,
    CaseNoteResponse
)

router = APIRouter(tags=["Case Timelines & Notes"])

@router.get("/cases/{case_id}/timeline", response_model=List[TimelineEventResponse])
async def get_case_timeline(case_id: UUID, db: AsyncSession = Depends(get_db)):
    query = select(CaseTimelineEvent).where(CaseTimelineEvent.case_id == case_id).order_by(CaseTimelineEvent.timestamp.desc())
    res = await db.execute(query)
    return res.scalars().all()

@router.post("/cases/{case_id}/timeline", response_model=TimelineEventResponse, status_code=status.HTTP_201_CREATED)
async def add_timeline_event(case_id: UUID, event_in: TimelineEventCreate, db: AsyncSession = Depends(get_db)):
    event = CaseTimelineEvent(
        case_id=case_id,
        title=event_in.title,
        description=event_in.description,
        event_type=event_in.event_type,
        timestamp=event_in.timestamp,
        source_evidence_id=event_in.source_evidence_id,
        actor_name="Investigator"
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event

@router.get("/cases/{case_id}/notes", response_model=List[CaseNoteResponse])
async def get_case_notes(case_id: UUID, db: AsyncSession = Depends(get_db)):
    query = select(CaseNote).where(CaseNote.case_id == case_id).order_by(CaseNote.created_at.desc())
    res = await db.execute(query)
    return res.scalars().all()

@router.post("/cases/{case_id}/notes", response_model=CaseNoteResponse, status_code=status.HTTP_201_CREATED)
async def add_case_note(case_id: UUID, note_in: CaseNoteCreate, db: AsyncSession = Depends(get_db)):
    note = CaseNote(
        case_id=case_id,
        user_id="usr-inv-02",
        user_name="Detective Marcus Vance",
        user_role="INVESTIGATOR",
        content=note_in.content
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note
