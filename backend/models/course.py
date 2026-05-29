import uuid
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base, TimestampMixin
from schemas.course import Semester

if TYPE_CHECKING:
    from models.enrollment import Enrollment


class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    code: Mapped[str] = mapped_column(String(8), index=True)
    title: Mapped[str] = mapped_column(String(500))
    credits: Mapped[int]
    department: Mapped[str] = mapped_column(String(300))
    semester: Mapped[Semester]
    year: Mapped[int]

    enrollments: Mapped[list["Enrollment"]] = relationship(
        back_populates="course",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        # The same course code repeats every term, so the offering is only
        # unique once you include the semester and year.
        UniqueConstraint("code", "semester", "year", name="uq_course_offering"),
        CheckConstraint("credits >= 0 AND credits <= 6", name="ck_course_credits"),
        CheckConstraint("year >= 2000 AND year <= 2100", name="ck_course_year"),
    )
