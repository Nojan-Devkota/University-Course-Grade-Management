from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.auth import TokenUser, require_staff
from db.session import get_session
from schemas.course import CourseCreate, CourseRead, Semester
from services import course_service

router = APIRouter(prefix="/courses", tags=["courses"])


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
async def create_course(
    payload: CourseCreate,
    db: AsyncSession = Depends(get_session),
    _: TokenUser = Depends(require_staff),
):
    return await course_service.create_course(db, payload)


@router.get("", response_model=list[CourseRead])
async def list_courses(
    department: str | None = None,
    semester: Semester | None = None,
    year: int | None = None,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_session),
):
    return await course_service.list_courses(
        db,
        department=department,
        semester=semester,
        year=year,
        limit=limit,
        offset=offset,
    )


@router.get("/{course_id}", response_model=CourseRead)
async def get_course(course_id: UUID, db: AsyncSession = Depends(get_session)):
    return await course_service.get_course(db, course_id)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: UUID,
    db: AsyncSession = Depends(get_session),
    _: TokenUser = Depends(require_staff),
):
    await course_service.delete_course(db, course_id)
