from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.exceptions import UnauthorizedError
from core.security import create_access_token, verify_password
from repositories import student_repository as repo

# Stable identifier for staff tokens (no staff table in this project).
STAFF_USER_ID = UUID("00000000-0000-0000-0000-000000000001")


async def login_student(db: AsyncSession, email: str, password: str) -> str:
    student = await repo.get_student_by_email(db, email)
    if student is None or not verify_password(password, student.hashed_password):
        raise UnauthorizedError("Invalid email or password.")
    return create_access_token(
        subject=student.id, role="student", email=student.email
    )


def login_staff(username: str, password: str) -> str:
    if username != settings.staff_username or password != settings.staff_password:
        raise UnauthorizedError("Invalid staff credentials.")
    return create_access_token(subject=STAFF_USER_ID, role="staff")
