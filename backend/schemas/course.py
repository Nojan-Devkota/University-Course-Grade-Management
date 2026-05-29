from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from enum import Enum
from uuid import UUID
from datetime import datetime

class Semester(str, Enum):
    SPRING = "Spring"
    SUMMER = "Summer"
    FALL = "Fall"


class CourseBase(BaseModel):
    code: Annotated[
        str,
        Field(
            pattern=r"^[A-Z]{2,3}\d{3,4}$",
            description="Course code must be in the format of 2 or 3 uppercase letters followed by 3 or 4 digits",
            examples=["CS3303"],
        ),
    ]

    title: Annotated[
        str,
        Field(
            min_length=1,
            max_length=500,
            description="Course title must be between 1 and 500 characters",
            examples=["Introduction to Computer Science"],
        ),
    ]

    credits: Annotated[
        int,
        Field(
            ge=0, le=6, description="Course credits must be between 0 and 6", examples=[3]
        ),
    ]

    department: Annotated[
        str,
        Field(
            min_length=1,
            max_length=300,
            description="Department must be between 1 and 300 characters",
            examples=["Computer Science"],
        ),
    ]

    semester: Annotated[
        Semester,
        Field(
            description="Semester must be one of the following: Spring, Summer, Fall",
            examples=[Semester.SPRING],
        ),
    ]

    year: Annotated[
        int,
        Field(
            ge=2000,
            le=2100,
            description="Year must be between 2000 and 2100",
            examples=[2026],
        ),
    ]
    
class CourseCreate(CourseBase):
    pass
    
class CourseRead(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: Annotated[
        UUID,
        Field(
            description="Course ID",
            examples=["123e4567-e89b-12d3-a456-426614174000"],
        )
    ]
    
    created_at: Annotated[
        datetime,
        Field(
            description="Creation date and time",
            examples=["2026-05-28T12:00:00Z"],
        )
    ]
    
    updated_at: Annotated[
        datetime,
        Field(
            description="Last update date and time",
            examples=["2026-05-28T12:00:00Z"],
        )
    ]