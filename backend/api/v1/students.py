from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

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


@router.get("/{student_id}", response_model=StudentReadPublic)
async def get_student(student_id: UUID, db: AsyncSession = Depends(get_session)):
    return await student_service.get_student(db, student_id)


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(student_id: UUID, db: AsyncSession = Depends(get_session)):
    await student_service.delete_student(db, student_id)
