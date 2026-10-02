from typing import Optional, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from backend.app.models.models import Case, CaseTimelineEvent, CaseNote

class CaseService:
    @staticmethod
    async def create_case(db: AsyncSession, case_data: dict, creator_name: str) -> Case:
        # Generate case number
        year = datetime.utcnow().year
        count_res = await db.execute(select(Case))
        total_cases = len(count_res.scalars().all())
        case_number = f"CASE-{year}-{str(total_cases + 1).padStart(3, '0') if hasattr(str, 'padStart') else str(total_cases + 1).zfill(3)}"

        new_case = Case(
            case_number=case_number,
            title=case_data["title"],
            description=case_data.get("description", ""),
            case_type=case_data.get("case_type", "General Legal Investigation"),
            status=case_data.get("status", "OPEN"),
            priority=case_data.get("priority", "MEDIUM"),
            jurisdiction=case_data.get("jurisdiction", "Federal District Court"),
            incident_date=case_data.get("incident_date"),
            assigned_to=case_data.get("assigned_to", creator_name)
        )
        db.add(new_case)
        await db.flush()

        # Add initial timeline event
        timeline_event = CaseTimelineEvent(
            case_id=new_case.id,
            title=f"Case Docketed: {new_case.case_number}",
            description=f"Matter '{new_case.title}' formally initiated under jurisdiction {new_case.jurisdiction}.",
            event_type="CASE_CREATED",
            actor_name=creator_name
        )
        db.add(timeline_event)

        await db.commit()
        await db.refresh(new_case)
        return new_case

    @staticmethod
    async def get_cases(db: AsyncSession, status: Optional[str] = None, priority: Optional[str] = None, search: Optional[str] = None) -> List[Case]:
        query = select(Case).order_by(Case.created_at.desc())
        if status and status != "ALL":
            query = query.where(Case.status == status)
        if priority and priority != "ALL":
            query = query.where(Case.priority == priority)
        res = await db.execute(query)
        cases = res.scalars().all()

        if search:
            q = search.lower()
            cases = [c for c in cases if q in c.title.lower() or q in c.case_number.lower() or q in (c.description or "").lower()]
        return cases
