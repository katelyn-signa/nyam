from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.app.database.session import get_db
from backend.app.models.models import User
from backend.app.schemas.schemas import UserRegister, UserLogin, Token, UserResponse
from backend.app.core.security import verify_password, get_password_hash, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.email == user_in.email)
    res = await db.execute(query)
    if res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address is already registered."
        )

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role if user_in.role in ["ADMIN", "INVESTIGATOR", "VIEWER"] else "INVESTIGATOR",
        organization=user_in.organization or "Department of Justice"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=str(user.id))
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
async def login(login_in: UserLogin, db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.email == login_in.email)
    res = await db.execute(query)
    user = res.scalars().first()

    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    token = create_access_token(subject=str(user.id))
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
async def get_current_user():
    # Demo mock fallback for me endpoint
    return {
        "id": "11111111-1111-1111-1111-111111111111",
        "email": "sarah.connor@courtlens.internal",
        "full_name": "Lead Counsel Sarah Connor",
        "role": "ADMIN",
        "organization": "Department of Justice / Cyber Division",
        "created_at": "2026-01-10T09:00:00Z"
    }
