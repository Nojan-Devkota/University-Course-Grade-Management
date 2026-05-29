from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from models.grade_history import GradeHistory


async def record_grade_change(
    db: AsyncSession,
    *,
    enrollment_id: UUID,
    changed_by_id: UUID,
    changed_by_role: str,
    old_grade: float | None,
    new_grade: float,
) -> GradeHistory:
    entry = GradeHistory(
        enrollment_id=enrollment_id,
        changed_by_id=changed_by_id,
        changed_by_role=changed_by_role,
        old_grade=old_grade,
        new_grade=new_grade,
    )
    db.add(entry)
    await db.flush()
    return entry


async def list_for_enrollment(
    db: AsyncSession, enrollment_id: UUID
) -> list[GradeHistory]:
    from sqlalchemy import select

    result = await db.execute(
        select(GradeHistory)
        .where(GradeHistory.enrollment_id == enrollment_id)
        .order_by(GradeHistory.created_at.desc())
    )
    return list(result.scalars().all())
