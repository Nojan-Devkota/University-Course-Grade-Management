"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Search,
  Plus,
  Award,
  Calendar,
  User,
  BookOpen,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import {
  getStudents,
  getCourses,
  getEnrollmentsForStudent,
  createEnrollment,
  setGrade,
  type Student,
  type Course,
  type Enrollment,
} from "@/lib/api";
import { cn, getStatusColor, getGradeColor, getGradeLetter, formatDate } from "@/lib/utils";

import { useRouter } from "next/navigation";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function EnrollmentsPage() {
  const router = useRouter();
  const { token, role } = useAuth();

  useEffect(() => {
    if (role === "student") {
      router.push("/dashboard");
    }
  }, [role, router]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [gradeValue, setGradeValue] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollForm, setEnrollForm] = useState({
    student_id: "",
    course_id: "",
  });

  useEffect(() => {
    async function init() {
      try {
        const [s, c] = await Promise.all([
          getStudents(token).catch(() => []),
          getCourses().catch(() => []),
        ]);
        setStudents(s);
        setCourses(c);
        if (s.length > 0) {
          setSelectedStudent(s[0].id);
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [token]);

  useEffect(() => {
    if (!selectedStudent || !token) return;
    setEnrollmentLoading(true);
    getEnrollmentsForStudent(selectedStudent, token)
      .then(setEnrollments)
      .catch(() => setEnrollments([]))
      .finally(() => setEnrollmentLoading(false));
  }, [selectedStudent, token]);

  const getCourseById = (id: string) => courses.find((c) => c.id === id);
  const getStudentById = (id: string) => students.find((s) => s.id === id);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      await createEnrollment(enrollForm, token);
      setDialogOpen(false);
      if (selectedStudent) {
        const data = await getEnrollmentsForStudent(selectedStudent, token);
        setEnrollments(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll");
    } finally {
      setCreating(false);
    }
  };

  const handleSetGrade = async () => {
    if (!token || !selectedEnrollment) return;
    try {
      await setGrade(selectedEnrollment.id, parseFloat(gradeValue), token);
      setGradeDialogOpen(false);
      if (selectedStudent) {
        const data = await getEnrollmentsForStudent(selectedStudent, token);
        setEnrollments(data);
      }
    } catch {
      // Handle silently
    }
  };

  const currentStudent = selectedStudent ? getStudentById(selectedStudent) : null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#6ee7b7] border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
              <ClipboardList className="w-6 h-6 text-zinc-950" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-zinc-950 uppercase tracking-tighter">Enrollments</h1>
              <p className="text-zinc-600 font-bold text-sm mt-1 uppercase tracking-tight">
                Manage student course enrollments and grades
              </p>
            </div>
          </div>
          {role === "staff" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="bg-[#fff382] text-zinc-950 hover:bg-[#fff382]">
                  <Plus className="w-5 h-5 mr-2" strokeWidth={3} />
                  New Enrollment
                </Button>
              </DialogTrigger>
              <DialogContent className="border-4 border-zinc-950 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] rounded-none">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Enroll Student in Course</DialogTitle>
                  <DialogDescription className="font-bold uppercase tracking-tight text-zinc-600">Create a new enrollment record</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEnroll} className="space-y-4 mt-4">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 rounded-none bg-[#ff6b8b] border-2 border-zinc-950 text-white font-bold uppercase tracking-tight text-sm"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-tight text-zinc-950">Student</label>
                    <select
                      value={enrollForm.student_id}
                      onChange={(e) => setEnrollForm({ ...enrollForm, student_id: e.target.value })}
                      className="flex h-10 w-full border-2 border-zinc-950 bg-white px-4 py-2 text-sm text-zinc-950 transition-all duration-200 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] font-bold uppercase tracking-tight"
                      required
                    >
                      <option value="">Select a student...</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} {s.last_name} ({s.student_number})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-tight text-zinc-950">Course</label>
                    <select
                      value={enrollForm.course_id}
                      onChange={(e) => setEnrollForm({ ...enrollForm, course_id: e.target.value })}
                      className="flex h-10 w-full border-2 border-zinc-950 bg-white px-4 py-2 text-sm text-zinc-950 transition-all duration-200 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] font-bold uppercase tracking-tight"
                      required
                    >
                      <option value="">Select a course...</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="submit"
                    variant="default"
                    className="w-full bg-[#6ee7b7] text-zinc-950 hover:bg-[#6ee7b7]"
                    disabled={creating}
                  >
                    {creating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Enroll Student"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Student Selector */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="sticky top-8 bg-[#fff382] border-4 border-zinc-950 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] rounded-none">
            <CardHeader className="pb-4 border-b-4 border-zinc-950 bg-white">
              <CardTitle className="text-xl flex items-center gap-3 uppercase font-black tracking-tight">
                <User className="w-6 h-6 text-[#ff6b8b]" strokeWidth={3} />
                Students
              </CardTitle>
              <CardDescription className="text-sm font-bold text-zinc-600 uppercase tracking-tight">Select a student</CardDescription>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              <div className="max-h-[500px] overflow-y-auto">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student.id)}
                    className={cn(
                      "w-full text-left px-4 py-4 text-sm transition-all duration-200 border-b-2 border-zinc-950 last:border-b-0",
                      selectedStudent === student.id
                        ? "bg-[#6ee7b7] text-zinc-950 font-black"
                        : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 font-bold"
                    )}
                  >
                    <p className="uppercase tracking-tight truncate">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className={cn(
                      "text-xs mt-1 uppercase",
                      selectedStudent === student.id ? "text-zinc-800" : "text-zinc-500"
                    )}>
                      {student.student_number}
                    </p>
                  </button>
                ))}
                {students.length === 0 && !loading && (
                  <p className="text-sm font-bold text-zinc-600 text-center py-6 uppercase">
                    No students found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enrollments */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          {currentStudent && (
            <div className="mb-6">
              <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tighter">
                {currentStudent.first_name} {currentStudent.last_name}&apos;s Enrollments
              </h2>
              <p className="text-sm font-bold text-zinc-600 uppercase tracking-tight mt-1">
                {enrollments.length} enrollment{enrollments.length !== 1 ? "s" : ""} found
              </p>
            </div>
          )}

          {enrollmentLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-12 h-12 text-zinc-950 animate-spin" strokeWidth={3} />
            </div>
          ) : enrollments.length === 0 ? (
            <Card className="bg-white border-4 border-zinc-950 border-dashed shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] rounded-none">
              <CardContent className="flex flex-col items-center justify-center h-64 text-zinc-950">
                <ClipboardList className="w-16 h-16 mb-4 text-zinc-950" strokeWidth={2} />
                <p className="text-2xl font-black uppercase tracking-tighter">No enrollments yet</p>
                <p className="text-sm font-bold mt-1 uppercase text-zinc-600">This student is not enrolled in any courses</p>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial="initial"
              animate="animate"
              variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
              className="space-y-4"
            >
              {enrollments.map((enrollment) => {
                const course = getCourseById(enrollment.course_id);
                return (
                  <motion.div key={enrollment.id} variants={fadeInUp}>
                    <Card className="group hover:-translate-y-1 hover:translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] transition-all duration-200 overflow-hidden bg-white">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-[#a855f7] border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] shrink-0">
                              <BookOpen className="w-6 h-6 text-white" strokeWidth={3} />
                            </div>
                            <div>
                              <h3 className="font-black text-zinc-950 text-xl uppercase tracking-tight leading-none mt-1">
                                {course?.title || "Unknown Course"}
                              </h3>
                              <div className="flex items-center gap-3 mt-3">
                                {course && (
                                  <Badge className="bg-[#fff382] text-zinc-950 border-2 border-zinc-950 font-black tracking-tight rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]">
                                    {course.code}
                                  </Badge>
                                )}
                                <Badge className={cn("text-xs border-2 border-zinc-950 rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] font-black uppercase tracking-tight bg-white", getStatusColor(enrollment.status))}>
                                  {enrollment.status.replace("_", " ")}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 sm:border-l-4 sm:border-zinc-950 sm:pl-6">
                            {/* Grade */}
                            <div className="text-right">
                              <p className="text-xs font-black uppercase tracking-tight text-zinc-500 mb-1">Grade</p>
                              <div className="flex items-center justify-end gap-2">
                                <span className={cn("text-3xl font-black uppercase", getGradeColor(enrollment.grade))}>
                                  {enrollment.grade !== null ? enrollment.grade.toFixed(1) : "—"}
                                </span>
                                <span className={cn("text-lg font-black uppercase", getGradeColor(enrollment.grade))}>
                                  {getGradeLetter(enrollment.grade)}
                                </span>
                              </div>
                            </div>

                            {/* Set Grade button (staff only) */}
                            {role === "staff" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] bg-white hover:bg-[#ff9a76] hover:text-zinc-950 rounded-none uppercase font-black tracking-tight"
                                onClick={() => {
                                  setSelectedEnrollment(enrollment);
                                  setGradeValue(enrollment.grade?.toString() || "");
                                  setGradeDialogOpen(true);
                                }}
                              >
                                <Award className="w-4 h-4 mr-2" strokeWidth={3} />
                                Set Grade
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Additional info */}
                        <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t-2 border-zinc-100">
                          {course && (
                            <>
                              <span className="text-xs font-bold text-zinc-600 uppercase tracking-tight flex items-center gap-2">
                                <Award className="w-4 h-4 text-zinc-950" strokeWidth={3} />
                                {course.credits} credits
                              </span>
                              <span className="text-xs font-bold text-zinc-600 uppercase tracking-tight flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-zinc-950" strokeWidth={3} />
                                {course.semester} {course.year}
                              </span>
                            </>
                          )}
                          <span className="text-xs font-bold text-zinc-600 uppercase tracking-tight flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#ec4899]" strokeWidth={3} />
                            Enrolled {formatDate(enrollment.created_at)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent className="border-4 border-zinc-950 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] rounded-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Set Grade</DialogTitle>
            <DialogDescription className="font-bold uppercase tracking-tight text-zinc-600">
              Enter a grade between 0.0 and 4.0 for this enrollment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              type="number"
              step="0.1"
              min="0"
              max="4"
              value={gradeValue}
              onChange={(e) => setGradeValue(e.target.value)}
              placeholder="e.g. 3.5"
              className="rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] font-black text-xl"
            />
            <div className="flex justify-end gap-3 pt-4 border-t-2 border-zinc-950">
              <Button variant="outline" className="border-2 border-zinc-950 bg-white hover:bg-zinc-100 rounded-none uppercase font-black" onClick={() => setGradeDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="default" className="border-2 border-zinc-950 bg-[#ff6b8b] text-white hover:bg-[#ff6b8b] rounded-none uppercase font-black shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all" onClick={handleSetGrade}>
                Save Grade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
