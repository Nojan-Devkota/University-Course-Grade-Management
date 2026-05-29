from collections.abc import Sequence
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from core.auth import TokenUser
from core.exceptions import BusinessRuleViolation, ConflictError, ForbiddenError, NotFoundError
from models.enrollment import Enrollment
from repositories import (
    course_repository,
    enrollment_repository as repo,
    grade_history_repository,
    student_repository,
)
from schemas.enrollment import EnrollmentCreate, EnrollmentGradeUpdate, EnrollmentStatus

MAX_CREDITS_PER_TERM = 20


def _ensure_can_manage_student(actor: TokenUser, student_id: UUID) -> None:
    if actor.role == "staff":
        return
    if actor.role == "student" and actor.id == student_id:
        return
    raise ForbiddenError("You may only act on your own student record.")


async def enroll_student(
    db: AsyncSession, payload: EnrollmentCreate, actor: TokenUser
) -> Enrollment:
    _ensure_can_manage_student(actor, payload.student_id)

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
    db: AsyncSession, student_id: UUID, actor: TokenUser
) -> Sequence[Enrollment]:
    _ensure_can_manage_student(actor, student_id)
    return await repo.list_by_student(db, student_id)


async def set_grade(
    db: AsyncSession,
    enrollment_id: UUID,
    payload: EnrollmentGradeUpdate,
    actor: TokenUser,
) -> Enrollment:
    if actor.role != "staff":
        raise ForbiddenError("Only staff may assign grades.")

    enrollment = await get_enrollment(db, enrollment_id)
    old_grade = enrollment.grade
    enrollment.grade = payload.grade

    await grade_history_repository.record_grade_change(
        db,
        enrollment_id=enrollment_id,
        changed_by_id=actor.id,
        changed_by_role=actor.role,
        old_grade=old_grade,
        new_grade=payload.grade,
    )
    await db.commit()
    await db.refresh(enrollment)
    return enrollment


async def update_status(
    db: AsyncSession,
    enrollment_id: UUID,
    status: EnrollmentStatus,
    actor: TokenUser,
) -> Enrollment:
    if actor.role != "staff":
        raise ForbiddenError("Only staff may update enrollment status.")

    enrollment = await get_enrollment(db, enrollment_id)
    return await repo.update_enrollment(db, enrollment, {"status": status})


async def get_grade_history(db: AsyncSession, enrollment_id: UUID):
    await get_enrollment(db, enrollment_id)
    return await grade_history_repository.list_for_enrollment(db, enrollment_id)
