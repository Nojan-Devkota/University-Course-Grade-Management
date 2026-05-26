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

## 4. Initial Development Milestone
**Task:** Define the initial Pydantic models for `Student`, `Course`, and `Enrollment`.
* **Objective:** Achieve 100% test coverage on data validation before writing database logic.
* **Deliverable:** A `schemas.py` file containing the `Base`, `Create`, and `Read` variations for each entity.
