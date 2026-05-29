from fastapi import APIRouter

from api.v1 import auth, courses, enrollments, students

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(students.router)
api_router.include_router(courses.router)
api_router.include_router(enrollments.router)
