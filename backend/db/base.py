from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Shared parent for every ORM model.

    SQLAlchemy collects all tables that inherit from this class into a single
    registry (``Base.metadata``), which is what lets us create or migrate the
    whole schema at once.
    """


class TimestampMixin:
    """Adds audit timestamps to any model that inherits it.

    ``server_default``/``onupdate`` mean the database fills these in, so the
    values are trustworthy even if a row is changed outside the API.
    """

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        onupdate=func.now(),
    )
