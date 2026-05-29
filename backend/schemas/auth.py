from pydantic import BaseModel, EmailStr, Field
from typing import Annotated


class StudentLoginRequest(BaseModel):
    email: Annotated[EmailStr, Field(examples=["john.doe@example.com"])]
    password: Annotated[str, Field(min_length=8, examples=["securepass"])]


class StaffLoginRequest(BaseModel):
    username: Annotated[str, Field(min_length=1, examples=["admin"])]
    password: Annotated[str, Field(min_length=8, examples=["adminpass123"])]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
