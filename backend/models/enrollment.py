import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import CheckConstraint, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base, TimestampMixin
from schemas.enrollment import EnrollmentStatus

if TYPE_CHECKING:
    from models.course import Course
    from models.student import Student


class Enrollment(Base, TimestampMixin):
    __tablename__ = "enrollments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"), index=True
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True
    )

    status: Mapped[EnrollmentStatus] = mapped_column(default=EnrollmentStatus.ENROLLED)
    # Nullable because a grade does not exist until the course is graded.
    grade: Mapped[Optional[float]] = mapped_column(nullable=True)

    student: Mapped["Student"] = relationship(back_populates="enrollments")
    course: Mapped["Course"] = relationship(back_populates="enrollments")

    __table_args__ = (
        # A student can only have one enrollment row per course offering.
        UniqueConstraint("student_id", "course_id", name="uq_enrollment_student_course"),
        CheckConstraint("grade >= 0.0 AND grade <= 4.0", name="ck_enrollment_grade"),
    )
