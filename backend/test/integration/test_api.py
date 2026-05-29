import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_health(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.anyio
async def test_student_registration_and_public_view(
    client: AsyncClient, student_payload: dict
):
    create = await client.post("/api/v1/students", json=student_payload)
    assert create.status_code == 201
    body = create.json()
    assert body["email"] == student_payload["email"]
    assert "password" not in body
    assert "hashed_password" not in body

    public = await client.get(f"/api/v1/students/{body['id']}")
    assert public.status_code == 200
    assert "email" not in public.json()


@pytest.mark.anyio
async def test_student_private_view_when_self(
    client: AsyncClient, registered_student: dict, student_token: str
):
    response = await client.get(
        f"/api/v1/students/{registered_student['id']}",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == registered_student["email"]


@pytest.mark.anyio
async def test_duplicate_student_email_conflict(
    client: AsyncClient, student_payload: dict
):
    await client.post("/api/v1/students", json=student_payload)
    duplicate = await client.post(
        "/api/v1/students",
        json={
            **student_payload,
            "student_number": "AO7654321",
            "email": student_payload["email"],
        },
    )
    assert duplicate.status_code == 409


@pytest.mark.anyio
async def test_staff_creates_course(
    client: AsyncClient, staff_token: str, course_payload: dict
):
    response = await client.post(
        "/api/v1/courses",
        json=course_payload,
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert response.status_code == 201
    assert response.json()["code"] == "CS3303"


@pytest.mark.anyio
async def test_create_course_requires_staff(
    client: AsyncClient, course_payload: dict
):
    response = await client.post("/api/v1/courses", json=course_payload)
    assert response.status_code == 401


@pytest.mark.anyio
async def test_enrollment_and_credit_cap(
    client: AsyncClient,
    registered_student: dict,
    student_token: str,
    staff_token: str,
):
    course_ids = []
    for n in range(1, 5):
        response = await client.post(
            "/api/v1/courses",
            json={
                "code": f"CS330{n}",
                "title": f"Course {n}",
                "credits": 6,
                "department": "CS",
                "semester": "Fall",
                "year": 2026,
            },
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        assert response.status_code == 201
        course_ids.append(response.json()["id"])

    auth = {"Authorization": f"Bearer {student_token}"}
    student_id = registered_student["id"]

    for cid in course_ids[:3]:
        enroll = await client.post(
            "/api/v1/enrollments",
            json={"student_id": student_id, "course_id": cid},
            headers=auth,
        )
        assert enroll.status_code == 201

    over_cap = await client.post(
        "/api/v1/enrollments",
        json={"student_id": student_id, "course_id": course_ids[3]},
        headers=auth,
    )
    assert over_cap.status_code == 422


@pytest.mark.anyio
async def test_grade_assignment_and_history(
    client: AsyncClient,
    registered_student: dict,
    student_token: str,
    staff_token: str,
    course_payload: dict,
):
    course = await client.post(
        "/api/v1/courses",
        json=course_payload,
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    course_id = course.json()["id"]

    enroll = await client.post(
        "/api/v1/enrollments",
        json={
            "student_id": registered_student["id"],
            "course_id": course_id,
        },
        headers={"Authorization": f"Bearer {student_token}"},
    )
    enrollment_id = enroll.json()["id"]

    forbidden = await client.patch(
        f"/api/v1/enrollments/{enrollment_id}/grade",
        json={"grade": 3.5},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert forbidden.status_code == 403

    graded = await client.patch(
        f"/api/v1/enrollments/{enrollment_id}/grade",
        json={"grade": 3.7},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert graded.status_code == 200
    assert graded.json()["grade"] == 3.7

    history = await client.get(
        f"/api/v1/enrollments/{enrollment_id}/grade-history",
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert history.status_code == 200
    entries = history.json()
    assert len(entries) == 1
    assert entries[0]["new_grade"] == 3.7
    assert entries[0]["old_grade"] is None
    assert entries[0]["changed_by_role"] == "staff"


@pytest.mark.anyio
async def test_invalid_login_returns_401(client: AsyncClient, student_payload: dict):
    await client.post("/api/v1/students", json=student_payload)
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": student_payload["email"], "password": "wrongpassword"},
    )
    assert response.status_code == 401
