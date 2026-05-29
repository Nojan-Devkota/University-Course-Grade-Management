# Project Specification: University Course & Grade Management API

## 1. Project Overview
This project involves designing and implementing a robust Backend API using **FastAPI** to manage student enrollments, course data, and academic grading. The system is designed to replace manual tracking with a high-performance, validated, and secure digital infrastructure.

---

## 2. Engineering Manager’s Expectations (The Technical Standards)
The Engineering Manager (EM) focuses on code quality, maintainability, and system reliability.

### **A. Strict Data Integrity & Typing**
* **Pydantic Enforcement:** Every request (Inbound) and response (Outbound) must have a dedicated Pydantic schema. Generic dictionaries are strictly prohibited.
* **Response Modeling:** All route decorators must include the `response_model` parameter. This ensures the automated Swagger/OpenAPI documentation is always in sync with the actual code.
* **Advanced Field Validation:** Use Pydantic's `Field` and `Annotated` to enforce business logic at the schema level (e.g., `ge=0` for grades, `max_length` for strings).

### **B. Clean Architecture**
* **Dependency Injection:** Utilize FastAPI's `Depends` for reusable logic such as authentication, database sessions, and header validation.
* **Asynchronous Programming:** All I/O bound operations (database calls, external API requests) must use `async/await` syntax to ensure the API handles high concurrency during peak periods.

### **C. Error Handling**
* **Explicit Exceptions:** Instead of letting the code crash, use FastAPI's `HTTPException` with appropriate status codes (400 for bad requests, 404 for missing records, 422 for validation errors).

---

## 3. University Board’s Expectations (The Business & Compliance Standards)
The Board focuses on legal compliance (FERPA), student privacy, and organizational accountability.

### **A. Data Privacy & Security (PII Protection)**
* **Schema Segregation:** Implement a "Multi-Schema" pattern.
    * **Private Schema:** Contains sensitive data like hashed passwords, internal IDs, and home addresses.
    * **Public/Student Schema:** Filters out sensitive fields to ensure students and professors only see the information they are authorized to view.
* **FERPA Compliance:** Ensure that personally identifiable information is never leaked via logs or public API endpoints.

### **B. Auditability & Reporting**
* **Timestamps:** Every record must track `created_at` and `updated_at` to provide a clear timeline of academic changes.
* **Grade History:** The system should be built to eventually support "Who changed this grade?" queries to prevent academic fraud.

### **C. Academic Constraints**
* **Business Rules:** The API must enforce university-specific constraints:
    * Students cannot enroll in more than 20 credits per semester.
    * Grade values must strictly fall within the 0.0 – 4.0 GPA scale.
    * Course codes must follow the standard university regex pattern (e.g., CS3358).

---

## 4. Project Structure

The backend follows a layered layout: routers handle HTTP only, Pydantic schemas validate requests and responses, services enforce business rules, and repositories perform async database access via SQLAlchemy.

```
University-Course-Grade-Management/
├── app/
│   ├── main.py                 # FastAPI app, lifespan, router registration
│   ├── core/
│   │   ├── config.py           # Environment settings (pydantic-settings)
│   │   ├── security.py         # Password hashing, JWT helpers
│   │   ├── exceptions.py       # Global exception handlers
│   │   └── logging.py          # Structured logging (no PII)
│   ├── db/
│   │   ├── session.py          # Async database session (Depends)
│   │   └── base.py             # SQLAlchemy declarative base
│   ├── models/                 # SQLAlchemy ORM tables
│   │   ├── student.py
│   │   ├── course.py
│   │   ├── enrollment.py
│   │   └── grade_history.py    # Phase 2: grade audit trail
│   ├── schemas/                # Pydantic models (Base, Create, Read, Public/Private)
│   │   ├── student.py
│   │   ├── course.py
│   │   └── enrollment.py
│   ├── api/
│   │   └── v1/
│   │       ├── router.py       # Aggregates versioned routes
│   │       ├── students.py
│   │       ├── courses.py
│   │       └── enrollments.py
│   ├── services/               # Business rules (credit caps, enrollment logic)
│   │   ├── student_service.py
│   │   ├── course_service.py
│   │   └── enrollment_service.py
│   └── repositories/           # Async DB queries (no Pydantic here)
│       ├── student_repository.py
│       ├── course_repository.py
│       └── enrollment_repository.py
├── alembic/                    # Database migrations
│   └── versions/
├── tests/
│   ├── unit/
│   │   ├── test_course_schema.py  # Milestone 1: course schema validation
│   │   └── test_services.py
│   └── integration/
│       └── test_api.py
├── pyproject.toml              # Dependencies and tooling
├── docker-compose.yml          # Local PostgreSQL
├── ProjectOvervier.md
└── README.md
```

### Layer responsibilities

| Layer | Path | Responsibility |
|-------|------|----------------|
| API | `app/api/v1/` | HTTP routes, `response_model`, `Depends` for auth and DB |
| Schemas | `app/schemas/` | Inbound/outbound validation; public vs private response models |
| Services | `app/services/` | Academic rules (20-credit cap, grade bounds, enrollment checks) |
| Repositories | `app/repositories/` | Async SQLAlchemy queries scoped by role |
| Models | `app/models/` | Database table definitions (ORM) |
| Core | `app/core/` | Config, security, shared error handling |

---

## 5. Initial Development Milestone
**Task:** Define the initial Pydantic models for `Student`, `Course`, and `Enrollment`.
* **Objective:** Achieve 100% test coverage on data validation before writing database logic.
* **Deliverable:** Schema modules under `app/schemas/` (`student.py`, `course.py`, `enrollment.py`) with `Base`, `Create`, and `Read` variations for each entity (plus public/private variants per Section 3).
