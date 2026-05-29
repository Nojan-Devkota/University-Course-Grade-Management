from collections.abc import Sequence
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from core.exceptions import ConflictError, NotFoundError
from core.security import hash_password
from models.student import Student
from repositories import student_repository as repo
from schemas.student import StudentCreate


async def create_student(db: AsyncSession, payload: StudentCreate) -> Student:
    """Register a new student: enforce uniqueness, then store with a hashed password."""
    if await repo.get_student_by_email(db, payload.email):
        raise ConflictError(f"A student with email {payload.email} already exists.")
    if await repo.get_student_by_number(db, payload.student_number):
        raise ConflictError(
            f"A student with number {payload.student_number} already exists."
        )

    student = Student(
        first_name=payload.first_name,
        last_name=payload.last_name,
        student_number=payload.student_number,
        email=payload.email,
        # Never store the plaintext password; only the hash.
        hashed_password=hash_password(payload.password.get_secret_value()),
        home_address=payload.home_address,
    )
    return await repo.create_student(db, student)


async def get_student(db: AsyncSession, student_id: UUID) -> Student:
    student = await repo.get_student(db, student_id)
    if student is None:
        raise NotFoundError(f"Student {student_id} not found.")
    return student


async def list_students(
    db: AsyncSession, *, limit: int = 100, offset: int = 0
) -> Sequence[Student]:
    return await repo.list_students(db, limit=limit, offset=offset)


async def delete_student(db: AsyncSession, student_id: UUID) -> None:
    student = await get_student(db, student_id)
    await repo.delete_student(db, student)
