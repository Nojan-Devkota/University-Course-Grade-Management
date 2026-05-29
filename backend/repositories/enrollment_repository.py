from collections.abc import Sequence
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.course import Course
from models.enrollment import Enrollment
from schemas.course import Semester
from schemas.enrollment import EnrollmentStatus


async def get_enrollment(db: AsyncSession, enrollment_id: UUID) -> Enrollment | None:
    return await db.get(Enrollment, enrollment_id)


async def get_by_student_and_course(
    db: AsyncSession, student_id: UUID, course_id: UUID
) -> Enrollment | None:
    """Used to prevent a student from enrolling in the same course twice."""
    result = await db.execute(
        select(Enrollment).where(
            Enrollment.student_id == student_id,
            Enrollment.course_id == course_id,
        )
    )
    return result.scalar_one_or_none()


async def list_by_student(
    db: AsyncSession, student_id: UUID
) -> Sequence[Enrollment]:
    result = await db.execute(
        select(Enrollment).where(Enrollment.student_id == student_id)
    )
    return result.scalars().all()


async def list_by_course(db: AsyncSession, course_id: UUID) -> Sequence[Enrollment]:
    result = await db.execute(
        select(Enrollment).where(Enrollment.course_id == course_id)
    )
    return result.scalars().all()


async def get_active_credits_for_term(
    db: AsyncSession, student_id: UUID, semester: Semester, year: int
) -> int:
    """Sum the credits a student is actively taking in a given term.

    Joins enrollments to their courses, ignores dropped enrollments, and sums
    the course credits. This is what the service layer checks against the
    20-credit-per-semester cap. ``coalesce(..., 0)`` turns a NULL sum (no rows)
    into 0.
    """
    stmt = (
        select(func.coalesce(func.sum(Course.credits), 0))
        .select_from(Enrollment)
        .join(Course, Enrollment.course_id == Course.id)
        .where(
            Enrollment.student_id == student_id,
            Course.semester == semester,
            Course.year == year,
            Enrollment.status != EnrollmentStatus.DROPPED,
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one()


async def create_enrollment(db: AsyncSession, enrollment: Enrollment) -> Enrollment:
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return enrollment


async def update_enrollment(
    db: AsyncSession, enrollment: Enrollment, data: dict[str, Any]
) -> Enrollment:
    for key, value in data.items():
        setattr(enrollment, key, value)
    await db.commit()
    await db.refresh(enrollment)
    return enrollment


async def delete_enrollment(db: AsyncSession, enrollment: Enrollment) -> None:
    await db.delete(enrollment)
    await db.commit()
