from pydantic import BaseModel, ConfigDict, Field, EmailStr, SecretStr
from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID


class StudentBase(BaseModel):
    first_name: Annotated[
        str,
        Field(
            min_length=1,
            max_length=100,
            description="First name must be between 1 and 100 characters",
            examples=["John"],
        ),
    ]

    last_name: Annotated[
        str,
        Field(
            min_length=1,
            max_length=100,
            description="Last name must be between 1 and 100 characters",
            examples=["Doe"],
        ),
    ]

    student_number: Annotated[
        str,
        Field(
            pattern=r"^AO\d{7}$",
            description="Student number must be in the format of AO followed by 7 digits",
            examples=["AO1234567"],
        ),
    ]


class StudentCreate(StudentBase):
    email: Annotated[
        EmailStr,
        Field(
            description="Email must be a valid email address",
            examples=["john.doe@example.com"],
        ),
    ]

    password: Annotated[
        SecretStr,
        Field(
            description="Password must be at least 8 characters long",
            min_length=8,
        ),
    ]

    home_address: Annotated[
        Optional[str],
        Field(
            min_length=1,
            max_length=300,
            description="Home address must be between 1 and 300 characters",
            examples=["123 Main St, Anytown, USA"],
            default=None,
        ),
    ]


class StudentRead(StudentBase):
    model_config = ConfigDict(from_attributes=True)

    id: Annotated[
        UUID,
        Field(
            description="Student ID",
            examples=["123e4567-e89b-12d3-a456-426614174000"],
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


class StudentReadPublic(StudentRead):
    pass


class StudentReadPrivate(StudentRead):
    email: Annotated[
        EmailStr,
        Field(
            description="Email address",
            examples=["john.doe@example.com"],
        ),
    ]

    home_address: Annotated[
        Optional[str],
        Field(
            min_length=1,
            max_length=300,
            description="Home address must be between 1 and 300 characters",
            examples=["123 Main St, Anytown, USA"],
            default=None,
        ),
    ]

