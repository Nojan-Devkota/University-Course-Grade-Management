from collections.abc import Sequence
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from core.exceptions import ConflictError, NotFoundError
from models.course import Course
from repositories import course_repository as repo
from schemas.course import CourseCreate, Semester


async def create_course(db: AsyncSession, payload: CourseCreate) -> Course:
    """Create a course offering, rejecting a duplicate of the same
    code + semester + year."""
    existing = await repo.get_course_by_offering(
        db, payload.code, payload.semester, payload.year
    )
    if existing:
        raise ConflictError(
            f"Course {payload.code} for {payload.semester.value} {payload.year} "
            "already exists."
        )

    course = Course(
        code=payload.code,
        title=payload.title,
        credits=payload.credits,
        department=payload.department,
        semester=payload.semester,
        year=payload.year,
    )
    return await repo.create_course(db, course)


async def get_course(db: AsyncSession, course_id: UUID) -> Course:
    course = await repo.get_course(db, course_id)
    if course is None:
        raise NotFoundError(f"Course {course_id} not found.")
    return course


async def list_courses(
    db: AsyncSession,
    *,
    department: str | None = None,
    semester: Semester | None = None,
    year: int | None = None,
    limit: int = 100,
    offset: int = 0,
) -> Sequence[Course]:
    return await repo.list_courses(
        db,
        department=department,
        semester=semester,
        year=year,
        limit=limit,
        offset=offset,
    )


async def delete_course(db: AsyncSession, course_id: UUID) -> None:
    course = await get_course(db, course_id)
    await repo.delete_course(db, course)
