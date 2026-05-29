from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_session
from schemas.enrollment import (
    EnrollmentCreate,
    EnrollmentGradeUpdate,
    EnrollmentRead,
    EnrollmentStatus,
)
from services import enrollment_service

router = APIRouter(prefix="/enrollments", tags=["enrollments"])


@router.post("", response_model=EnrollmentRead, status_code=status.HTTP_201_CREATED)
async def enroll_student(
    payload: EnrollmentCreate, db: AsyncSession = Depends(get_session)
):
    return await enrollment_service.enroll_student(db, payload)


@router.get("/{enrollment_id}", response_model=EnrollmentRead)
async def get_enrollment(
    enrollment_id: UUID, db: AsyncSession = Depends(get_session)
):
    return await enrollment_service.get_enrollment(db, enrollment_id)


@router.get("/by-student/{student_id}", response_model=list[EnrollmentRead])
async def list_for_student(
    student_id: UUID, db: AsyncSession = Depends(get_session)
):
    return await enrollment_service.list_for_student(db, student_id)


@router.patch("/{enrollment_id}/grade", response_model=EnrollmentRead)
async def set_grade(
    enrollment_id: UUID,
    payload: EnrollmentGradeUpdate,
    db: AsyncSession = Depends(get_session),
):
    return await enrollment_service.set_grade(db, enrollment_id, payload)


@router.patch("/{enrollment_id}/status", response_model=EnrollmentRead)
async def update_status(
    enrollment_id: UUID,
    new_status: EnrollmentStatus,
    db: AsyncSession = Depends(get_session),
):
    return await enrollment_service.update_status(db, enrollment_id, new_status)
