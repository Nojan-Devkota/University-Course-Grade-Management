# University Course & Grade Management API

Production-oriented FastAPI backend for managing students, course offerings, enrollments, and grades. Built with strict Pydantic validation, async SQLAlchemy, JWT authentication, layered architecture, and FERPA-aware public/private response schemas.

## Features

- **Validated API contracts** — dedicated Pydantic schemas for every request and response
- **Layered architecture** — routers, services, repositories, and ORM models kept separate
- **Async I/O** — async SQLAlchemy sessions for concurrent request handling
- **Role-based access** — student and staff JWT flows with route-level authorization
- **Academic business rules** — GPA scale (0.0–4.0), 20-credit cap per semester, unique course offerings
- **Grade audit trail** — grade changes recorded with actor and timestamp
- **Privacy by design** — sensitive student fields excluded from public responses

## Tech stack

| Layer | Technology |
|-------|------------|
| API | FastAPI, Uvicorn |
| Validation | Pydantic v2 |
| Database | SQLAlchemy 2.0 (async), SQLite (dev) / PostgreSQL (production) |
| Auth | JWT (PyJWT), PBKDF2 password hashing |
| Testing | pytest, httpx |

## Requirements

- Python 3.11+
- pip and a virtual environment

## Quick start

### 1. Clone and install

```powershell
git clone https://github.com/Nojan-Devkota/University-Course-Grade-Management.git
cd University-Course-Grade-Management

python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Configure environment

Copy the example env file and edit it:

```powershell
Copy-Item .env.example .env
```

**Required before running in any shared or production environment:**

| Variable | What to set |
|----------|-------------|
| `JWT_SECRET_KEY` | A long random string (32+ characters). Generate one with: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `STAFF_PASSWORD` | A strong password (not the default) |

Other variables have sensible defaults for local development. See [Environment variables](#environment-variables) below.

> **Note:** `.env` lives in the **project root** (same folder as this README). It is gitignored and must never be committed.

### 3. Run the API

Start the server from the `backend` directory:

```powershell
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

On first startup, tables are created automatically and `app.db` is written to `backend/app.db`.

| Resource | URL |
|----------|-----|
| Swagger UI | http://127.0.0.1:8000/docs |
| ReDoc | http://127.0.0.1:8000/redoc |
| Health check | http://127.0.0.1:8000/health |

## Authentication

Protected routes require an `Authorization: Bearer <token>` header.

### Register a student

```http
POST /api/v1/students
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "student_number": "AO1234567",
  "email": "john.doe@example.com",
  "password": "securepass"
}
```

### Student login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securepass"
}
```

Response includes `access_token` and `role: "student"`.

### Staff login

Uses credentials from `.env` (`STAFF_USERNAME`, `STAFF_PASSWORD`):

```http
POST /api/v1/auth/staff/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your-staff-password"
}
```

Response includes `access_token` and `role: "staff"`.

In Swagger UI, click **Authorize** and enter: `Bearer <your-token>`

## API overview

Base path: `/api/v1`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | — | Liveness check |
| `POST` | `/auth/login` | — | Student JWT |
| `POST` | `/auth/staff/login` | — | Staff JWT |
| `POST` | `/students` | — | Register student |
| `GET` | `/students` | — | List students (public fields) |
| `GET` | `/students/{id}` | Optional | Public view; private if self or staff |
| `DELETE` | `/students/{id}` | Staff | Delete student |
| `POST` | `/courses` | Staff | Create course offering |
| `GET` | `/courses` | — | List courses (filter by department, semester, year) |
| `GET` | `/courses/{id}` | — | Get course |
| `DELETE` | `/courses/{id}` | Staff | Delete course |
| `POST` | `/enrollments` | Student/Staff | Enroll in a course |
| `GET` | `/enrollments/{id}` | — | Get enrollment |
| `GET` | `/enrollments/by-student/{id}` | Student/Staff | List a student's enrollments |
| `PATCH` | `/enrollments/{id}/grade` | Staff | Assign or update grade |
| `PATCH` | `/enrollments/{id}/status` | Staff | Update enrollment status |
| `GET` | `/enrollments/{id}/grade-history` | Staff | View grade change audit trail |

Full request/response schemas are documented in Swagger at `/docs`.

## Authorization matrix

| Action | Public | Student | Staff |
|--------|:------:|:-------:|:-----:|
| Register student | ✓ | — | — |
| View student (name, number) | ✓ | ✓ | ✓ |
| View student (email, address) | — | Self | ✓ |
| Create / delete courses | — | — | ✓ |
| Enroll in courses | — | Self | ✓ |
| Assign / update grades | — | — | ✓ |
| View grade history | — | — | ✓ |

## Business rules

Enforced at the schema, service, and database layers:

- **Course codes** — `^[A-Z]{2,3}\d{3,4}$` (e.g. `CS3303`)
- **Student numbers** — `^AO\d{7}$` (e.g. `AO1234567`)
- **Grades** — 0.0 to 4.0 GPA scale
- **Credits** — 0–6 per course; max **20 credits** per student per semester
- **Course offerings** — unique by code + semester + year
- **Enrollments** — one enrollment per student per course offering
- **Grade history** — every grade change records who changed it and when

## Testing

From the project root (with the virtual environment active):

```powershell
pytest
```

| Suite | Location | Coverage |
|-------|----------|----------|
| Unit | `backend/test/unit/` | Pydantic schema validation |
| Integration | `backend/test/integration/` | Full HTTP API with in-memory DB |

Integration tests set `TESTING=true` automatically and do not require a `.env` file or a real database file.

```powershell
pytest -v                          # verbose output
pytest backend/test/integration/   # integration tests only
```

## Project structure

```
University-Course-Grade-Management/
├── .env.example          # Environment template (copy to .env)
├── requirements.txt
├── pytest.ini
└── backend/
    ├── main.py           # FastAPI app entry point
    ├── api/v1/           # HTTP routes and response_model wiring
    ├── core/             # Config, auth, security, logging, exceptions
    ├── db/               # Async engine, session, declarative base
    ├── models/           # SQLAlchemy ORM tables
    ├── repositories/     # Async database queries
    ├── schemas/          # Pydantic request/response models
    ├── services/         # Business rules and orchestration
    └── test/             # Unit and integration tests
```

## Environment variables

All variables are optional for local development except where noted. Loaded from `.env` at the project root or from the process environment.

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./app.db` | Async database connection URL |
| `SQL_ECHO` | `true` | Log SQL statements (`false` recommended in production) |
| `JWT_SECRET_KEY` | `change-me-in-production` | **Change in production.** JWT signing secret |
| `STAFF_USERNAME` | `admin` | Staff login username |
| `STAFF_PASSWORD` | `adminpass123` | **Change in production.** Staff login password |
| `TESTING` | `false` | Set by pytest; skips DB init on startup |

### Production database

Replace `DATABASE_URL` with a PostgreSQL async URL when deploying:

```bash
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
```

Use Alembic migrations for schema changes in production instead of relying on startup `create_all`.

## Error responses

Domain errors from the service layer map to consistent HTTP responses:

| Error | HTTP status |
|-------|-------------|
| Record not found | `404` |
| Duplicate / conflict | `409` |
| Business rule violation (e.g. credit cap) | `422` |
| Missing or invalid auth | `401` |
| Insufficient permissions | `403` |
| Invalid request body | `422` (Pydantic validation) |

## Security notes

- Passwords are hashed with PBKDF2 before storage; plaintext passwords are never persisted
- Public student responses exclude email, home address, and password fields
- Structured logging avoids writing PII to logs
- Keep `.env` out of version control; rotate `JWT_SECRET_KEY` and staff credentials for production

## License

See repository license file if present.
