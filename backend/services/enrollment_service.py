from collections.abc import Sequence
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from core.exceptions import BusinessRuleViolation, ConflictError, NotFoundError
from models.enrollment import Enrollment
from repositories import (
    course_repository,
    enrollment_repository as repo,
    student_repository,
)
from schemas.enrollment import EnrollmentCreate, EnrollmentGradeUpdate, EnrollmentStatus

# University rule: a student may not exceed 20 credits in a single term.
MAX_CREDITS_PER_TERM = 20


async def enroll_student(db: AsyncSession, payload: EnrollmentCreate) -> Enrollment:
    """Enroll a student in a course, enforcing every academic precondition."""
    student = await student_repository.get_student(db, payload.student_id)
    if student is None:
        raise NotFoundError(f"Student {payload.student_id} not found.")

    course = await course_repository.get_course(db, payload.course_id)
    if course is None:
        raise NotFoundError(f"Course {payload.course_id} not found.")

    existing = await repo.get_by_student_and_course(
        db, payload.student_id, payload.course_id
    )
    if existing:
        raise ConflictError("Student is already enrolled in this course.")

    # Enforce the 20-credit cap for the course's specific term.
    current_credits = await repo.get_active_credits_for_term(
        db, payload.student_id, course.semester, course.year
    )
    if current_credits + course.credits > MAX_CREDITS_PER_TERM:
        raise BusinessRuleViolation(
            f"Enrolling would total {current_credits + course.credits} credits for "
            f"{course.semester.value} {course.year}, exceeding the "
            f"{MAX_CREDITS_PER_TERM}-credit limit."
        )

    enrollment = Enrollment(
        student_id=payload.student_id,
        course_id=payload.course_id,
        status=payload.status,
    )
    return await repo.create_enrollment(db, enrollment)


async def get_enrollment(db: AsyncSession, enrollment_id: UUID) -> Enrollment:
    enrollment = await repo.get_enrollment(db, enrollment_id)
    if enrollment is None:
        raise NotFoundError(f"Enrollment {enrollment_id} not found.")
    return enrollment


async def list_for_student(
    db: AsyncSession, student_id: UUID
) -> Sequence[Enrollment]:
    return await repo.list_by_student(db, student_id)


async def set_grade(
    db: AsyncSession, enrollment_id: UUID, payload: EnrollmentGradeUpdate
) -> Enrollment:
    """Record a grade. The 0.0-4.0 range is already enforced by the schema."""
    enrollment = await get_enrollment(db, enrollment_id)
    return await repo.update_enrollment(db, enrollment, {"grade": payload.grade})


async def update_status(
    db: AsyncSession, enrollment_id: UUID, status: EnrollmentStatus
) -> Enrollment:
    enrollment = await get_enrollment(db, enrollment_id)
    return await repo.update_enrollment(db, enrollment, {"status": status})
