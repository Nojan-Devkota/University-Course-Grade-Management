from collections.abc import Sequence
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.course import Course
from schemas.course import Semester


async def get_course(db: AsyncSession, course_id: UUID) -> Course | None:
    return await db.get(Course, course_id)


async def get_course_by_offering(
    db: AsyncSession, code: str, semester: Semester, year: int
) -> Course | None:
    """A course offering is only unique across code + semester + year, so all
    three are needed to resolve exactly one row."""
    result = await db.execute(
        select(Course).where(
            Course.code == code,
            Course.semester == semester,
            Course.year == year,
        )
    )
    return result.scalar_one_or_none()


async def list_courses(
    db: AsyncSession,
    *,
    department: str | None = None,
    semester: Semester | None = None,
    year: int | None = None,
    limit: int = 100,
    offset: int = 0,
) -> Sequence[Course]:
    """Listing with optional filters. Each provided filter narrows the query."""
    stmt = select(Course)
    if department is not None:
        stmt = stmt.where(Course.department == department)
    if semester is not None:
        stmt = stmt.where(Course.semester == semester)
    if year is not None:
        stmt = stmt.where(Course.year == year)

    stmt = stmt.order_by(Course.code).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


async def create_course(db: AsyncSession, course: Course) -> Course:
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course


async def update_course(
    db: AsyncSession, course: Course, data: dict[str, Any]
) -> Course:
    for key, value in data.items():
        setattr(course, key, value)
    await db.commit()
    await db.refresh(course)
    return course


async def delete_course(db: AsyncSession, course: Course) -> None:
    await db.delete(course)
    await db.commit()
