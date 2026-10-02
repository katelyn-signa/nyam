from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from backend.app.database.session import get_db
from backend.app.models.models import Evidence, EvidenceContent, EvidenceAuditEvent
from backend.app.schemas.schemas import EvidenceResponse, CustodyEventResponse, DuplicateErrorResponse
from backend.app.services.evidence_service import EvidenceService, DuplicateEvidenceException
from backend.app.services.custody_service import CustodyService
from backend.app.storage.local import LocalStorageProvider

router = APIRouter(tags=["Evidence Management"])
storage_provider = LocalStorageProvider()

@router.get("/evidence", response_model=List[EvidenceResponse])
async def list_evidence(
    category: Optional[str] = None,
    case_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Evidence).order_by(Evidence.uploaded_at.desc())
    if category and category != "ALL":
        query = query.where(Evidence.evidence_category == category)
    if case_id:
        query = query.where(Evidence.case_id == case_id)
    res = await db.execute(query)
    return res.scalars().all()

@router.post("/cases/{case_id}/evidence", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    case_id: UUID,
    request: Request,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    source: str = Form("Digital Evidence Intake"),
    force_duplicate: bool = Form(False),
    db: AsyncSession = Depends(get_db)
):
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    client_ip = request.client.host if request.client else "127.0.0.1"

    try:
        evidence = await EvidenceService.process_and_store_evidence(
            db=db,
            case_id=case_id,
            original_filename=file.filename or "evidence.bin",
            content=file_bytes,
            mime_type=file.content_type or "application/octet-stream",
            user_id="usr-inv-02",
            user_name="Detective Marcus Vance",
            user_role="INVESTIGATOR",
            description=description,
            category=category,
            source=source,
            force_duplicate=force_duplicate,
            client_ip=client_ip
        )
        return evidence
    except DuplicateEvidenceException as dup_err:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "DUPLICATE_EVIDENCE",
                "message": "A file with identical cryptographic SHA-256 hash already exists in this repository.",
                "sha256_hash": dup_err.sha256_hash,
                "existing_evidence_id": str(dup_err.existing_evidence.id),
                "existing_filename": dup_err.existing_evidence.original_filename,
                "existing_case_id": str(dup_err.existing_evidence.case_id)
            }
        )

@router.get("/evidence/{evidence_id}", response_model=EvidenceResponse)
async def get_evidence(evidence_id: UUID, request: Request, db: AsyncSession = Depends(get_db)):
    query = select(Evidence).where(Evidence.id == evidence_id).options(selectinload(Evidence.content))
    res = await db.execute(query)
    item = res.scalars().first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence item not found.")

    # Record chain of custody VIEW event
    await CustodyService.log_event(
        db=db,
        evidence_id=str(item.id),
        case_id=str(item.case_id),
        user_id="usr-admin-01",
        user_name="Active Investigator",
        user_role="INVESTIGATOR",
        action="VIEWED",
        sha256_hash=item.sha256_hash,
        details="Evidence record examined in vault.",
        ip_address=request.client.host if request.client else "127.0.0.1"
    )

    return item

@router.get("/evidence/{evidence_id}/download")
async def download_evidence(evidence_id: UUID, request: Request, db: AsyncSession = Depends(get_db)):
    query = select(Evidence).where(Evidence.id == evidence_id)
    res = await db.execute(query)
    item = res.scalars().first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence item not found.")

    # Log download event
    await CustodyService.log_event(
        db=db,
        evidence_id=str(item.id),
        case_id=str(item.case_id),
        user_id="usr-admin-01",
        user_name="Lead Counsel",
        user_role="ADMIN",
        action="DOWNLOADED",
        sha256_hash=item.sha256_hash,
        details=f"Evidence export downloaded: {item.original_filename}",
        ip_address=request.client.host if request.client else "127.0.0.1"
    )

    try:
        content = await storage_provider.get_file(item.storage_path)
    except FileNotFoundError:
        content = b"[CourtLens Forensic Evidence Sealed Artifact]"

    return Response(
        content=content,
        media_type=item.mime_type,
        headers={"Content-Disposition": f'attachment; filename="{item.original_filename}"'}
    )

@router.get("/evidence/{evidence_id}/custody", response_model=List[CustodyEventResponse])
async def get_evidence_custody(evidence_id: UUID, db: AsyncSession = Depends(get_db)):
    logs = await CustodyService.get_evidence_custody(db, str(evidence_id))
    return logs
