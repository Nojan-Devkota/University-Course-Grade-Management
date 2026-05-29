from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.auth import TokenUser, get_current_user, get_current_user_optional, require_staff
from db.session import get_session
from schemas.student import StudentCreate, StudentReadPrivate, StudentReadPublic
from services import student_service

router = APIRouter(prefix="/students", tags=["students"])


@router.post(
    "",
    response_model=StudentReadPrivate,
    status_code=status.HTTP_201_CREATED,
)
async def create_student(
    payload: StudentCreate, db: AsyncSession = Depends(get_session)
):
    return await student_service.create_student(db, payload)


@router.get("", response_model=list[StudentReadPublic])
async def list_students(
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_session),
):
    return await student_service.list_students(db, limit=limit, offset=offset)


@router.get("/{student_id}", response_model=StudentReadPrivate | StudentReadPublic)
async def get_student(
    student_id: UUID,
    db: AsyncSession = Depends(get_session),
    user: TokenUser | None = Depends(get_current_user_optional),
):
    student = await student_service.get_student(db, student_id)
    if user and (user.role == "staff" or user.id == student_id):
        return StudentReadPrivate.model_validate(student)
    return StudentReadPublic.model_validate(student)


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: UUID,
    db: AsyncSession = Depends(get_session),
    _: TokenUser = Depends(require_staff),
):
    await student_service.delete_student(db, student_id)
