from pydantic import BaseModel, Field
from typing import Annotated, Optional
from enum import Enum
from uuid import UUID
from datetime import datetime


class EnrollmentStatus(str, Enum):
    ENROLLED = "enrolled"
    DROPPED = "dropped"
    COMPLETED = "completed"
    FAILED = "failed"
    IN_PROGRESS = "in_progress"


class EnrollmentBase(BaseModel):
    student_id: Annotated[
        UUID,
        Field(
            description="Student ID",
            examples=["123e4567-e89b-12d3-a456-426614174000"],
        ),
    ]

    course_id: Annotated[
        UUID,
        Field(
            description="Course ID",
            examples=["123e4567-e89b-12d3-a456-426614174000"],
        ),
    ]

    status: Annotated[
        EnrollmentStatus,
        Field(
            description="Enrollment status",
            examples=[
                EnrollmentStatus.ENROLLED,
                EnrollmentStatus.DROPPED,
                EnrollmentStatus.COMPLETED,
                EnrollmentStatus.FAILED,
                EnrollmentStatus.IN_PROGRESS,
            ],
            default=EnrollmentStatus.ENROLLED,
        ),
    ]


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentRead(EnrollmentBase):
    id: Annotated[
        UUID,
        Field(
            description="Enrollment ID",
            examples=["123e4567-e89b-12d3-a456-426614174000"],
        ),
    ]

    grade: Annotated[
        Optional[float],
        Field(
            description="Grade",
            examples=[0.0, 1.0, 2.0, 3.0, 4.0],
            ge=0.0,
            le=4.0,
            default=None,
        ),
    ]

    created_at: Annotated[
        datetime,
        Field(
            description="Creation date and time",
            examples=["2026-05-28T12:00:00Z"],
        ),
    ]

    updated_at: Annotated[
        datetime,
        Field(
            description="Last update date and time",
            examples=["2026-05-28T12:00:00Z"],
        ),
    ]


class EnrollmentGradeUpdate(BaseModel):
    grade: Annotated[
        float,
        Field(
            description="Grade",
            examples=[0.0, 1.0, 2.0, 3.0, 4.0],
            ge=0.0,
            le=4.0,
        ),
    ]
