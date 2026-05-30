"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  Clock,
  Award,
  Building2,
  Calendar,
  Filter,
  X,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getCourses, createCourse, deleteCourse, type Course, type CourseCreate } from "@/lib/api";
import { cn, getSemesterColor, formatDate } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function CoursesPage() {
  const { token, role } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState<string | null>(null);
  const [filterSemester, setFilterSemester] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CourseCreate>({
    code: "",
    title: "",
    credits: 3,
    department: "",
    semester: "Fall",
    year: 2026,
  });

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const departments = [...new Set(courses.map((c) => c.department))];

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase());
    const matchesDept = !filterDept || c.department === filterDept;
    const matchesSemester = !filterSemester || c.semester === filterSemester;
    return matchesSearch && matchesDept && matchesSemester;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      await createCourse(form, token);
      setDialogOpen(false);
      setForm({
        code: "",
        title: "",
        credits: 3,
        department: "",
        semester: "Fall",
        year: 2026,
      });
      await fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || role !== "staff") return;
    try {
      await deleteCourse(id, token);
      await fetchCourses();
    } catch {
      // Handle silently
    }
  };

  const getCreditDots = (credits: number) => {
    return Array.from({ length: 6 }, (_, i) => (
      <div
        key={i}
        className={cn(
          "w-3 h-3 border-2 border-zinc-950 transition-colors",
          i < credits ? "bg-[#fff382]" : "bg-white"
        )}
      />
    ));
  };

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
            <div className="p-3 rounded-xl bg-[#a855f7] border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
              <BookOpen className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-zinc-950 uppercase tracking-tighter">Courses</h1>
              <p className="text-zinc-600 font-bold text-sm mt-1 uppercase tracking-tight">
                Browse and manage the course catalog
              </p>
            </div>
          </div>
          {role === "staff" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="bg-[#fff382] text-zinc-950 hover:bg-[#fff382]">
                  <Plus className="w-5 h-5 mr-2" strokeWidth={3} />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent className="border-4 border-zinc-950 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] rounded-none">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Create New Course</DialogTitle>
                  <DialogDescription className="font-bold uppercase tracking-tight text-zinc-600">Add a new course to the catalog</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 mt-4">
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase tracking-tight text-zinc-950">Course Code</label>
                      <Input
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                        placeholder="CS3303"
                        pattern="^[A-Z]{2,3}\d{3,4}$"
                        required
                        className="rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase tracking-tight text-zinc-950">Credits</label>
                      <Input
                        type="number"
                        value={form.credits}
                        onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) })}
                        min={0}
                        max={6}
                        required
                        className="rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-tight text-zinc-950">Title</label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Introduction to Computer Science"
                      required
                      className="rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-tight text-zinc-950">Department</label>
                    <Input
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      placeholder="Computer Science"
                      required
                      className="rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase tracking-tight text-zinc-950">Semester</label>
                      <select
                        value={form.semester}
                        onChange={(e) => setForm({ ...form, semester: e.target.value })}
                        className="flex h-10 w-full border-2 border-zinc-950 bg-white px-4 py-2 text-sm text-zinc-950 transition-all duration-200 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] font-bold uppercase tracking-tight"
                        required
                      >
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                        <option value="Fall">Fall</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase tracking-tight text-zinc-950">Year</label>
                      <Input
                        type="number"
                        value={form.year}
                        onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                        min={2000}
                        max={2100}
                        required
                        className="rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="default"
                    className="w-full bg-[#a855f7] text-white hover:bg-[#a855f7]"
                    disabled={creating}
                  >
                    {creating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Create Course"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-950" strokeWidth={3} />
            <Input
              placeholder="Search courses by title, code, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 rounded-none shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] font-bold uppercase tracking-tight"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-950 hover:text-[#ff6b8b]"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 mr-2 bg-zinc-950 text-white px-2 py-1 rounded border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]">
            <Filter className="w-4 h-4" strokeWidth={3} />
            <span className="text-xs font-black uppercase tracking-tight">Filters:</span>
          </div>
          {["Spring", "Summer", "Fall"].map((sem) => (
            <button
              key={sem}
              onClick={() => setFilterSemester(filterSemester === sem ? null : sem)}
              className={cn(
                "px-3 py-1 text-xs font-black uppercase tracking-tight border-2 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] transition-all",
                filterSemester === sem
                  ? "border-zinc-950 bg-[#6ee7b7] text-zinc-950"
                  : "border-zinc-950 bg-white text-zinc-950 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]"
              )}
            >
              {sem}
            </button>
          ))}
          {departments.slice(0, 5).map((dept) => (
            <button
              key={dept}
              onClick={() => setFilterDept(filterDept === dept ? null : dept)}
              className={cn(
                "px-3 py-1 text-xs font-black uppercase tracking-tight border-2 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] transition-all",
                filterDept === dept
                  ? "border-zinc-950 bg-[#ff9a76] text-zinc-950"
                  : "border-zinc-950 bg-white text-zinc-950 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]"
              )}
            >
              {dept}
            </button>
          ))}
          {(filterDept || filterSemester) && (
            <button
              onClick={() => { setFilterDept(null); setFilterSemester(null); }}
              className="px-3 py-1 text-xs font-black uppercase tracking-tight border-2 border-zinc-950 bg-[#ff6b8b] text-white shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] transition-all"
            >
              Clear All
            </button>
          )}
        </div>
        <p className="text-sm font-black uppercase tracking-tight text-zinc-600 mt-3">
          Showing {filtered.length} of {courses.length} courses
        </p>
      </motion.div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-12 h-12 text-zinc-950" strokeWidth={3} />
          </motion.div>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-64 border-4 border-zinc-950 border-dashed bg-white shadow-[8px_8px_0px_0px_rgba(24,24,27,1)]"
        >
          <GraduationCap className="w-16 h-16 mb-4 text-zinc-950" strokeWidth={2} />
          <p className="text-2xl font-black uppercase tracking-tighter">No courses found</p>
          <p className="text-sm font-bold text-zinc-600 uppercase mt-1">Try adjusting your filters or add a new course</p>
        </motion.div>
      ) : (
        <motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((course) => (
            <motion.div key={course.id} variants={fadeInUp}>
              <Card className="group hover:-translate-y-1 hover:translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] transition-all duration-200 overflow-hidden bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge variant="default" className="mb-2 bg-[#a855f7] text-white border-2 border-zinc-950 font-black tracking-tight">{course.code}</Badge>
                      <h3 className="font-black text-zinc-950 text-xl tracking-tight uppercase leading-none mt-1">
                        {course.title}
                      </h3>
                    </div>
                    {role === "staff" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-950 hover:bg-[#ff6b8b] hover:text-white rounded-none border-2 border-transparent hover:border-zinc-950"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 className="w-5 h-5" strokeWidth={3} />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t-2 border-zinc-100">
                    <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 uppercase tracking-tight">
                      <Building2 className="w-4 h-4 text-zinc-950" strokeWidth={3} />
                      <span>{course.department}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 uppercase tracking-tight">
                        <Calendar className="w-4 h-4 text-zinc-950" strokeWidth={3} />
                        <Badge className="bg-[#fff382] text-zinc-950 border-2 border-zinc-950 font-black tracking-tight rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]">
                          {course.semester} {course.year}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t-2 border-zinc-100">
                      <div className="flex items-center gap-3">
                        <Award className="w-4 h-4 text-zinc-950" strokeWidth={3} />
                        <span className="text-sm font-bold text-zinc-600 uppercase tracking-tight">
                          {course.credits} credit{course.credits !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getCreditDots(course.credits)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
