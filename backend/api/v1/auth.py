from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_session
from schemas.auth import StaffLoginRequest, StudentLoginRequest, TokenResponse
from services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def student_login(
    payload: StudentLoginRequest, db: AsyncSession = Depends(get_session)
):
    token = await auth_service.login_student(
        db, payload.email, payload.password
    )
    return TokenResponse(access_token=token, role="student")


@router.post("/staff/login", response_model=TokenResponse)
async def staff_login(payload: StaffLoginRequest):
    token = auth_service.login_staff(payload.username, payload.password)
    return TokenResponse(access_token=token, role="staff")
