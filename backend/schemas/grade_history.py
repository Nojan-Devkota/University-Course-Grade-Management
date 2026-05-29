from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class GradeHistoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Annotated[UUID, Field(description="Grade history entry ID")]
    enrollment_id: Annotated[UUID, Field(description="Enrollment ID")]
    changed_by_id: Annotated[UUID, Field(description="User who changed the grade")]
    changed_by_role: Annotated[str, Field(description="Role of the user (staff/student)")]
    old_grade: Annotated[float | None, Field(description="Previous grade, if any")]
    new_grade: Annotated[float, Field(description="New grade value")]
    created_at: Annotated[datetime, Field(description="When the change was recorded")]
