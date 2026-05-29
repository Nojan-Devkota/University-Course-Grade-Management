import uuid

from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class GradeHistory(Base, TimestampMixin):
    """Audit trail for grade changes (who changed what, and when)."""

    __tablename__ = "grade_history"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    enrollment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("enrollments.id", ondelete="CASCADE"), index=True
    )
    changed_by_id: Mapped[uuid.UUID] = mapped_column(index=True)
    changed_by_role: Mapped[str] = mapped_column(String(20))

    old_grade: Mapped[float | None] = mapped_column(Float, nullable=True)
    new_grade: Mapped[float] = mapped_column(Float)
