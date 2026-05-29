from collections.abc import Sequence
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.student import Student


async def get_student(db: AsyncSession, student_id: UUID) -> Student | None:
    """Fetch one student by primary key. ``db.get`` is the fast path for PK lookups."""
    return await db.get(Student, student_id)


async def get_student_by_number(
    db: AsyncSession, student_number: str
) -> Student | None:
    """Look up by the human-facing business key (e.g. ``AO1234567``)."""
    result = await db.execute(
        select(Student).where(Student.student_number == student_number)
    )
    return result.scalar_one_or_none()


async def get_student_by_email(db: AsyncSession, email: str) -> Student | None:
    """Used for uniqueness checks and (later) authentication."""
    result = await db.execute(select(Student).where(Student.email == email))
    return result.scalar_one_or_none()


async def list_students(
    db: AsyncSession, *, limit: int = 100, offset: int = 0
) -> Sequence[Student]:
    """Paginated listing. Always bound the result set so a large table can't
    return everything at once."""
    result = await db.execute(
        select(Student).order_by(Student.last_name, Student.first_name)
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()


async def create_student(db: AsyncSession, student: Student) -> Student:
    """Persist a new student. ``refresh`` reloads server-generated fields
    (id, created_at) so the returned object is complete."""
    db.add(student)
    await db.commit()
    await db.refresh(student)
    return student


async def update_student(
    db: AsyncSession, student: Student, data: dict[str, Any]
) -> Student:
    """Apply changes to an already-loaded student and persist them."""
    for key, value in data.items():
        setattr(student, key, value)
    await db.commit()
    await db.refresh(student)
    return student


async def delete_student(db: AsyncSession, student: Student) -> None:
    await db.delete(student)
    await db.commit()
