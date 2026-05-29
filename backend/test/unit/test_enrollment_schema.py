from datetime import datetime, timezone
from uuid import UUID, uuid4

import pytest
from pydantic import ValidationError

from schemas.enrollment import (
    EnrollmentBase,
    EnrollmentCreate,
    EnrollmentGradeUpdate,
    EnrollmentRead,
    EnrollmentStatus,
)


def valid_enrollment_base_kwargs(**overrides):
    data = {
        "student_id": uuid4(),
        "course_id": uuid4(),
        "status": EnrollmentStatus.ENROLLED,
    }
    data.update(overrides)
    return data


def valid_enrollment_read_kwargs(**overrides):
    data = {
        **valid_enrollment_base_kwargs(),
        "id": uuid4(),
        "created_at": datetime(2026, 5, 28, 12, 0, tzinfo=timezone.utc),
        "updated_at": datetime(2026, 5, 28, 13, 0, tzinfo=timezone.utc),
    }
    data.update(overrides)
    return data


class TestEnrollmentStatus:
    def test_enum_values(self):
        assert EnrollmentStatus.ENROLLED.value == "enrolled"
        assert EnrollmentStatus.DROPPED.value == "dropped"
        assert EnrollmentStatus.COMPLETED.value == "completed"
        assert EnrollmentStatus.FAILED.value == "failed"
        assert EnrollmentStatus.IN_PROGRESS.value == "in_progress"

    def test_coerces_from_string_in_base(self):
        enrollment = EnrollmentBase(**valid_enrollment_base_kwargs(status="dropped"))
        assert enrollment.status is EnrollmentStatus.DROPPED


class TestEnrollmentBaseValid:
    def test_accepts_minimal_valid_payload(self):
        student_id = uuid4()
        course_id = uuid4()
        enrollment = EnrollmentBase(
            **valid_enrollment_base_kwargs(student_id=student_id, course_id=course_id)
        )
        assert enrollment.student_id == student_id
        assert enrollment.course_id == course_id
        assert enrollment.status is EnrollmentStatus.ENROLLED

    @pytest.mark.parametrize(
        "status",
        [
            EnrollmentStatus.ENROLLED,
            EnrollmentStatus.DROPPED,
            EnrollmentStatus.COMPLETED,
            EnrollmentStatus.FAILED,
            EnrollmentStatus.IN_PROGRESS,
        ],
    )
    def test_accepts_all_statuses(self, status):
        enrollment = EnrollmentBase(**valid_enrollment_base_kwargs(status=status))
        assert enrollment.status is status

    def test_coerces_ids_from_string(self):
        student_id = "123e4567-e89b-12d3-a456-426614174000"
        course_id = "223e4567-e89b-12d3-a456-426614174000"
        enrollment = EnrollmentBase(
            **valid_enrollment_base_kwargs(student_id=student_id, course_id=course_id)
        )
        assert enrollment.student_id == UUID(student_id)
        assert enrollment.course_id == UUID(course_id)


class TestEnrollmentBaseIdValidation:
    def test_rejects_invalid_student_id(self):
        with pytest.raises(ValidationError) as exc_info:
            EnrollmentBase(**valid_enrollment_base_kwargs(student_id="not-a-uuid"))
        assert "student_id" in str(exc_info.value).lower()

    def test_rejects_invalid_course_id(self):
        with pytest.raises(ValidationError) as exc_info:
            EnrollmentBase(**valid_enrollment_base_kwargs(course_id="not-a-uuid"))
        assert "course_id" in str(exc_info.value).lower()


class TestEnrollmentBaseStatusValidation:
    def test_rejects_invalid_status(self):
        with pytest.raises(ValidationError) as exc_info:
            EnrollmentBase(**valid_enrollment_base_kwargs(status="graduated"))
        assert "status" in str(exc_info.value).lower()


class TestEnrollmentBaseRequiredFields:
    def test_rejects_missing_required_fields(self):
        with pytest.raises(ValidationError) as exc_info:
            EnrollmentBase(student_id=uuid4())
        missing_fields = {err["loc"][0] for err in exc_info.value.errors()}
        assert "course_id" in missing_fields

    def test_status_defaults_when_omitted(self):
        enrollment = EnrollmentBase(student_id=uuid4(), course_id=uuid4())
        assert enrollment.status is EnrollmentStatus.ENROLLED


class TestEnrollmentCreate:
    def test_accepts_valid_payload(self):
        enrollment = EnrollmentCreate(**valid_enrollment_base_kwargs())
        assert enrollment.status is EnrollmentStatus.ENROLLED

    def test_does_not_accept_grade_field(self):
        assert "grade" not in EnrollmentCreate.model_fields

    def test_ignores_grade_in_payload(self):
        enrollment = EnrollmentCreate(**valid_enrollment_base_kwargs(grade=3.5))
        assert not hasattr(enrollment, "grade")


class TestEnrollmentRead:
    def test_accepts_valid_read_payload(self):
        enrollment_id = uuid4()
        created = datetime(2026, 5, 28, 12, 0, tzinfo=timezone.utc)
        updated = datetime(2026, 5, 28, 13, 0, tzinfo=timezone.utc)

        enrollment = EnrollmentRead(
            **valid_enrollment_base_kwargs(),
            id=enrollment_id,
            created_at=created,
            updated_at=updated,
        )

        assert enrollment.id == enrollment_id
        assert enrollment.created_at == created
        assert enrollment.updated_at == updated

    def test_grade_defaults_to_none(self):
        enrollment = EnrollmentRead(**valid_enrollment_read_kwargs())
        assert enrollment.grade is None

    @pytest.mark.parametrize("grade", [0.0, 2.5, 4.0])
    def test_accepts_grade_within_range(self, grade):
        enrollment = EnrollmentRead(**valid_enrollment_read_kwargs(grade=grade))
        assert enrollment.grade == grade

    @pytest.mark.parametrize("grade", [-0.1, 4.1])
    def test_rejects_grade_outside_range(self, grade):
        with pytest.raises(ValidationError):
            EnrollmentRead(**valid_enrollment_read_kwargs(grade=grade))

    def test_coerces_id_from_string(self):
        enrollment_id = "123e4567-e89b-12d3-a456-426614174000"
        enrollment = EnrollmentRead(**valid_enrollment_read_kwargs(id=enrollment_id))
        assert enrollment.id == UUID(enrollment_id)

    def test_rejects_invalid_uuid(self):
        with pytest.raises(ValidationError):
            EnrollmentRead(**valid_enrollment_read_kwargs(id="not-a-uuid"))

    def test_rejects_missing_read_only_fields(self):
        with pytest.raises(ValidationError) as exc_info:
            EnrollmentRead(**valid_enrollment_base_kwargs())
        missing_fields = {err["loc"][0] for err in exc_info.value.errors()}
        assert {"id", "created_at", "updated_at"} <= missing_fields


class TestEnrollmentGradeUpdate:
    @pytest.mark.parametrize("grade", [0.0, 1.5, 4.0])
    def test_accepts_grade_within_range(self, grade):
        update = EnrollmentGradeUpdate(grade=grade)
        assert update.grade == grade

    @pytest.mark.parametrize("grade", [-0.1, 4.1, -1.0, 5.0])
    def test_rejects_grade_outside_range(self, grade):
        with pytest.raises(ValidationError):
            EnrollmentGradeUpdate(grade=grade)

    def test_rejects_missing_grade(self):
        with pytest.raises(ValidationError) as exc_info:
            EnrollmentGradeUpdate()
        missing_fields = {err["loc"][0] for err in exc_info.value.errors()}
        assert "grade" in missing_fields
