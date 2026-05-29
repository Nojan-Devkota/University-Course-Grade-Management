from datetime import datetime, timezone
from uuid import UUID, uuid4

import pytest
from pydantic import ValidationError

from schemas.course import CourseBase, CourseRead, Semester


def valid_course_base_kwargs(**overrides):
    data = {
        "code": "CS3303",
        "title": "Introduction to Computer Science",
        "credits": 3,
        "department": "Computer Science",
        "semester": Semester.SPRING,
        "year": 2026,
    }
    data.update(overrides)
    return data


class TestSemester:
    def test_enum_values(self):
        assert Semester.SPRING.value == "Spring"
        assert Semester.SUMMER.value == "Summer"
        assert Semester.FALL.value == "Fall"

    def test_coerces_from_string_in_course_base(self):
        course = CourseBase(**valid_course_base_kwargs(semester="Fall"))
        assert course.semester is Semester.FALL


class TestCourseBaseValid:
    def test_accepts_minimal_valid_payload(self):
        course = CourseBase(**valid_course_base_kwargs())
        assert course.code == "CS3303"
        assert course.title == "Introduction to Computer Science"
        assert course.credits == 3
        assert course.department == "Computer Science"
        assert course.semester is Semester.SPRING
        assert course.year == 2026

    @pytest.mark.parametrize("code", ["CS101", "MAT1234", "EE3303"])
    def test_accepts_valid_course_codes(self, code):
        course = CourseBase(**valid_course_base_kwargs(code=code))
        assert course.code == code

    @pytest.mark.parametrize("semester", [Semester.SPRING, Semester.SUMMER, Semester.FALL])
    def test_accepts_all_semesters(self, semester):
        course = CourseBase(**valid_course_base_kwargs(semester=semester))
        assert course.semester is semester

    @pytest.mark.parametrize("credits", [0, 6])
    def test_accepts_credit_boundaries(self, credits):
        course = CourseBase(**valid_course_base_kwargs(credits=credits))
        assert course.credits == credits

    @pytest.mark.parametrize("year", [2000, 2100])
    def test_accepts_year_boundaries(self, year):
        course = CourseBase(**valid_course_base_kwargs(year=year))
        assert course.year == year


class TestCourseBaseCodeValidation:
    @pytest.mark.parametrize(
        "code",
        [
            "cs3303",
            "CS33",
            "CS33033",
            "C3303",
            "CS12",
            "ABCD3303",
            "CS-3303",
            "",
        ],
    )
    def test_rejects_invalid_course_codes(self, code):
        with pytest.raises(ValidationError) as exc_info:
            CourseBase(**valid_course_base_kwargs(code=code))
        assert "code" in str(exc_info.value).lower()


class TestCourseBaseTitleValidation:
    def test_rejects_empty_title(self):
        with pytest.raises(ValidationError):
            CourseBase(**valid_course_base_kwargs(title=""))

    def test_rejects_title_over_500_characters(self):
        with pytest.raises(ValidationError):
            CourseBase(**valid_course_base_kwargs(title="x" * 501))

    def test_accepts_title_at_max_length(self):
        title = "x" * 500
        course = CourseBase(**valid_course_base_kwargs(title=title))
        assert course.title == title


class TestCourseBaseCreditsValidation:
    @pytest.mark.parametrize("credits", [-1, 7])
    def test_rejects_credits_outside_range(self, credits):
        with pytest.raises(ValidationError):
            CourseBase(**valid_course_base_kwargs(credits=credits))


class TestCourseBaseDepartmentValidation:
    def test_rejects_empty_department(self):
        with pytest.raises(ValidationError):
            CourseBase(**valid_course_base_kwargs(department=""))

    def test_rejects_department_over_300_characters(self):
        with pytest.raises(ValidationError):
            CourseBase(**valid_course_base_kwargs(department="x" * 301))


class TestCourseBaseSemesterValidation:
    def test_rejects_invalid_semester(self):
        with pytest.raises(ValidationError):
            CourseBase(**valid_course_base_kwargs(semester="Winter"))


class TestCourseBaseYearValidation:
    @pytest.mark.parametrize("year", [1999, 2101])
    def test_rejects_year_outside_range(self, year):
        with pytest.raises(ValidationError):
            CourseBase(**valid_course_base_kwargs(year=year))


class TestCourseBaseRequiredFields:
    def test_rejects_missing_required_fields(self):
        with pytest.raises(ValidationError) as exc_info:
            CourseBase(code="CS3303")
        errors = exc_info.value.errors()
        missing_fields = {err["loc"][0] for err in errors}
        assert {"title", "credits", "department", "semester", "year"} <= missing_fields


class TestCourseRead:
    def test_accepts_valid_read_payload(self):
        course_id = uuid4()
        created = datetime(2026, 5, 28, 12, 0, tzinfo=timezone.utc)
        updated = datetime(2026, 5, 28, 13, 0, tzinfo=timezone.utc)

        course = CourseRead(
            **valid_course_base_kwargs(),
            id=course_id,
            created_at=created,
            updated_at=updated,
        )

        assert course.id == course_id
        assert course.created_at == created
        assert course.updated_at == updated
        assert course.code == "CS3303"

    def test_coerces_id_from_string(self):
        course_id = "123e4567-e89b-12d3-a456-426614174000"
        course = CourseRead(
            **valid_course_base_kwargs(),
            id=course_id,
            created_at="2026-05-28T12:00:00Z",
            updated_at="2026-05-28T12:00:00Z",
        )
        assert course.id == UUID(course_id)

    def test_rejects_invalid_uuid(self):
        with pytest.raises(ValidationError):
            CourseRead(
                **valid_course_base_kwargs(),
                id="not-a-uuid",
                created_at="2026-05-28T12:00:00Z",
                updated_at="2026-05-28T12:00:00Z",
            )

    def test_rejects_missing_read_only_fields(self):
        with pytest.raises(ValidationError) as exc_info:
            CourseRead(**valid_course_base_kwargs())
        missing_fields = {err["loc"][0] for err in exc_info.value.errors()}
        assert {"id", "created_at", "updated_at"} <= missing_fields