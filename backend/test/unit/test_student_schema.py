from datetime import datetime, timezone
from uuid import UUID, uuid4

import pytest
from pydantic import ValidationError

from schemas.student import (
    StudentBase,
    StudentCreate,
    StudentRead,
    StudentReadPrivate,
    StudentReadPublic,
)


def valid_student_base_kwargs(**overrides):
    data = {
        "first_name": "John",
        "last_name": "Doe",
        "student_number": "AO1234567",
    }
    data.update(overrides)
    return data


def valid_student_create_kwargs(**overrides):
    data = {
        **valid_student_base_kwargs(),
        "email": "john.doe@example.com",
        "password": "securepass",
    }
    data.update(overrides)
    return data


def valid_student_read_kwargs(**overrides):
    data = {
        **valid_student_base_kwargs(),
        "id": uuid4(),
        "created_at": datetime(2026, 5, 28, 12, 0, tzinfo=timezone.utc),
        "updated_at": datetime(2026, 5, 28, 13, 0, tzinfo=timezone.utc),
    }
    data.update(overrides)
    return data


class TestStudentBaseValid:
    def test_accepts_minimal_valid_payload(self):
        student = StudentBase(**valid_student_base_kwargs())
        assert student.first_name == "John"
        assert student.last_name == "Doe"
        assert student.student_number == "AO1234567"

    @pytest.mark.parametrize("student_number", ["AO0000000", "AO9999999"])
    def test_accepts_valid_student_numbers(self, student_number):
        student = StudentBase(**valid_student_base_kwargs(student_number=student_number))
        assert student.student_number == student_number

    def test_accepts_name_at_max_length(self):
        name = "x" * 100
        student = StudentBase(**valid_student_base_kwargs(first_name=name, last_name=name))
        assert student.first_name == name
        assert student.last_name == name


class TestStudentBaseFirstNameValidation:
    def test_rejects_empty_first_name(self):
        with pytest.raises(ValidationError):
            StudentBase(**valid_student_base_kwargs(first_name=""))

    def test_rejects_first_name_over_100_characters(self):
        with pytest.raises(ValidationError):
            StudentBase(**valid_student_base_kwargs(first_name="x" * 101))


class TestStudentBaseLastNameValidation:
    def test_rejects_empty_last_name(self):
        with pytest.raises(ValidationError):
            StudentBase(**valid_student_base_kwargs(last_name=""))

    def test_rejects_last_name_over_100_characters(self):
        with pytest.raises(ValidationError):
            StudentBase(**valid_student_base_kwargs(last_name="x" * 101))


class TestStudentBaseStudentNumberValidation:
    @pytest.mark.parametrize(
        "student_number",
        [
            "ao1234567",
            "AO123456",
            "AO12345678",
            "AO123456A",
            "1234567",
            "AO-1234567",
            "",
        ],
    )
    def test_rejects_invalid_student_numbers(self, student_number):
        with pytest.raises(ValidationError) as exc_info:
            StudentBase(**valid_student_base_kwargs(student_number=student_number))
        assert "student_number" in str(exc_info.value).lower()


class TestStudentBaseRequiredFields:
    def test_rejects_missing_required_fields(self):
        with pytest.raises(ValidationError) as exc_info:
            StudentBase(first_name="John")
        missing_fields = {err["loc"][0] for err in exc_info.value.errors()}
        assert {"last_name", "student_number"} <= missing_fields


class TestStudentCreateValid:
    def test_accepts_minimal_valid_payload(self):
        student = StudentCreate(**valid_student_create_kwargs())
        assert student.email == "john.doe@example.com"
        assert student.password.get_secret_value() == "securepass"
        assert student.home_address is None

    def test_accepts_home_address_when_provided(self):
        address = "123 Main St, Anytown, USA"
        student = StudentCreate(**valid_student_create_kwargs(home_address=address))
        assert student.home_address == address

    def test_accepts_password_at_min_length(self):
        student = StudentCreate(**valid_student_create_kwargs(password="12345678"))
        assert student.password.get_secret_value() == "12345678"


class TestStudentCreateEmailValidation:
    @pytest.mark.parametrize(
        "email",
        ["not-an-email", "@example.com", "john@", "john.doe"],
    )
    def test_rejects_invalid_email(self, email):
        with pytest.raises(ValidationError):
            StudentCreate(**valid_student_create_kwargs(email=email))


class TestStudentCreatePasswordValidation:
    @pytest.mark.parametrize("password", ["short", "1234567", ""])
    def test_rejects_password_shorter_than_8_characters(self, password):
        with pytest.raises(ValidationError):
            StudentCreate(**valid_student_create_kwargs(password=password))


class TestStudentCreateHomeAddressValidation:
    def test_treats_empty_home_address_as_none(self):
        student = StudentCreate(**valid_student_create_kwargs(home_address=""))
        assert student.home_address is None

    def test_rejects_home_address_over_300_characters(self):
        with pytest.raises(ValidationError):
            StudentCreate(**valid_student_create_kwargs(home_address="x" * 301))


class TestStudentCreateRequiredFields:
    def test_rejects_missing_create_only_fields(self):
        with pytest.raises(ValidationError) as exc_info:
            StudentCreate(**valid_student_base_kwargs())
        missing_fields = {err["loc"][0] for err in exc_info.value.errors()}
        assert {"email", "password"} <= missing_fields


class TestStudentRead:
    def test_accepts_valid_read_payload(self):
        student_id = uuid4()
        created = datetime(2026, 5, 28, 12, 0, tzinfo=timezone.utc)
        updated = datetime(2026, 5, 28, 13, 0, tzinfo=timezone.utc)

        student = StudentRead(
            **valid_student_base_kwargs(),
            id=student_id,
            created_at=created,
            updated_at=updated,
        )

        assert student.id == student_id
        assert student.created_at == created
        assert student.updated_at == updated
        assert student.student_number == "AO1234567"

    def test_coerces_id_from_string(self):
        student_id = "123e4567-e89b-12d3-a456-426614174000"
        student = StudentRead(
            **valid_student_base_kwargs(),
            id=student_id,
            created_at="2026-05-28T12:00:00Z",
            updated_at="2026-05-28T12:00:00Z",
        )
        assert student.id == UUID(student_id)

    def test_rejects_invalid_uuid(self):
        with pytest.raises(ValidationError):
            StudentRead(
                **valid_student_base_kwargs(),
                id="not-a-uuid",
                created_at="2026-05-28T12:00:00Z",
                updated_at="2026-05-28T12:00:00Z",
            )

    def test_rejects_missing_read_only_fields(self):
        with pytest.raises(ValidationError) as exc_info:
            StudentRead(**valid_student_base_kwargs())
        missing_fields = {err["loc"][0] for err in exc_info.value.errors()}
        assert {"id", "created_at", "updated_at"} <= missing_fields


class TestStudentReadPublic:
    def test_accepts_valid_public_read_payload(self):
        payload = valid_student_read_kwargs()
        student = StudentReadPublic(**payload)
        assert student.first_name == "John"
        assert student.id == payload["id"]

    def test_excludes_sensitive_fields_from_model(self):
        public_fields = set(StudentReadPublic.model_fields)
        assert "email" not in public_fields
        assert "home_address" not in public_fields
        assert "password" not in public_fields


class TestStudentReadPrivate:
    def test_accepts_valid_private_read_payload(self):
        student = StudentReadPrivate(
            **valid_student_read_kwargs(),
            email="john.doe@example.com",
            home_address="123 Main St",
        )
        assert student.email == "john.doe@example.com"
        assert student.home_address == "123 Main St"

    def test_includes_sensitive_fields_in_model(self):
        private_fields = set(StudentReadPrivate.model_fields)
        assert "email" in private_fields
        assert "home_address" in private_fields

    def test_accepts_null_home_address(self):
        student = StudentReadPrivate(
            **valid_student_read_kwargs(),
            email="john.doe@example.com",
        )
        assert student.home_address is None

    def test_rejects_invalid_email(self):
        with pytest.raises(ValidationError):
            StudentReadPrivate(
                **valid_student_read_kwargs(),
                email="not-an-email",
            )

    def test_rejects_missing_email(self):
        with pytest.raises(ValidationError) as exc_info:
            StudentReadPrivate(**valid_student_read_kwargs())
        missing_fields = {err["loc"][0] for err in exc_info.value.errors()}
        assert "email" in missing_fields