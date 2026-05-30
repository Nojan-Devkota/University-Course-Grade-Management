const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type FetchOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

function formatApiError(status: number, detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (item && typeof item === "object" && "msg" in item) {
          return String((item as { msg: string }).msg);
        }
        return null;
      })
      .filter(Boolean);
    if (messages.length > 0) return messages.join("; ");
  }
  return `Request failed (HTTP ${status})`;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new Error(
      `Cannot reach the API at ${API_BASE}. Start the backend: cd backend && python -m uvicorn main:app --reload --port 8000`
    );
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "An error occurred" }));
    throw new Error(formatApiError(res.status, error.detail));
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export async function loginStudent(email: string, password: string) {
  return apiFetch<{ access_token: string; role: string }>("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function loginStaff(username: string, password: string) {
  return apiFetch<{ access_token: string; role: string }>("/api/v1/auth/staff/login", {
    method: "POST",
    body: { username, password },
  });
}

// Students
export async function getStudents(token?: string | null) {
  return apiFetch<Student[]>("/api/v1/students", { token });
}

export async function getStudent(id: string, token?: string | null) {
  return apiFetch<Student>(`/api/v1/students/${id}`, { token });
}

export async function createStudent(data: StudentCreate) {
  return apiFetch<Student>("/api/v1/students", {
    method: "POST",
    body: data,
  });
}

export async function deleteStudent(id: string, token: string) {
  return apiFetch<void>(`/api/v1/students/${id}`, {
    method: "DELETE",
    token,
  });
}

// Courses
export async function getCourses(params?: { department?: string; semester?: string; year?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.department) searchParams.set("department", params.department);
  if (params?.semester) searchParams.set("semester", params.semester);
  if (params?.year) searchParams.set("year", params.year.toString());
  const query = searchParams.toString();
  return apiFetch<Course[]>(`/api/v1/courses${query ? `?${query}` : ""}`);
}

export async function getCourse(id: string) {
  return apiFetch<Course>(`/api/v1/courses/${id}`);
}

export async function createCourse(data: CourseCreate, token: string) {
  return apiFetch<Course>("/api/v1/courses", {
    method: "POST",
    body: data,
    token,
  });
}

export async function deleteCourse(id: string, token: string) {
  return apiFetch<void>(`/api/v1/courses/${id}`, {
    method: "DELETE",
    token,
  });
}

// Enrollments
export async function getEnrollmentsForStudent(studentId: string, token: string) {
  return apiFetch<Enrollment[]>(`/api/v1/enrollments/by-student/${studentId}`, { token });
}

export async function createEnrollment(data: EnrollmentCreate, token: string) {
  return apiFetch<Enrollment>("/api/v1/enrollments", {
    method: "POST",
    body: data,
    token,
  });
}

export async function setGrade(enrollmentId: string, grade: number, token: string) {
  return apiFetch<Enrollment>(`/api/v1/enrollments/${enrollmentId}/grade`, {
    method: "PATCH",
    body: { grade },
    token,
  });
}

// Types
export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  email?: string;
  home_address?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentCreate {
  first_name: string;
  last_name: string;
  student_number: string;
  email: string;
  password: string;
  home_address?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  department: string;
  semester: string;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface CourseCreate {
  code: string;
  title: string;
  credits: number;
  department: string;
  semester: string;
  year: number;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: string;
  grade: number | null;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentCreate {
  student_id: string;
  course_id: string;
  status?: string;
}
