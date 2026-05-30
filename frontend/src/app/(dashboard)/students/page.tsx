"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Plus,
  Trash2,
  Mail,
  MapPin,
  Hash,
  Calendar,
  UserCircle,
  X,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { getStudents, createStudent, deleteStudent, type Student, type StudentCreate } from "@/lib/api";
import { formatDate } from "@/lib/utils";

import { useRouter } from "next/navigation";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function StudentsPage() {
  const router = useRouter();
  const { token, role } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role === "student") {
      router.push("/dashboard");
    }
  }, [role, router]);
  
  const [form, setForm] = useState<StudentCreate>({
    first_name: "",
    last_name: "",
    student_number: "",
    email: "",
    password: "",
    home_address: "",
  });

  const fetchStudents = async () => {
    try {
      const data = await getStudents(token);
      setStudents(data);
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const filtered = students.filter(
    (s) =>
      s.first_name.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_number.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createStudent({
        ...form,
        home_address: form.home_address?.trim() || undefined,
      });
      setDialogOpen(false);
      setForm({
        first_name: "",
        last_name: "",
        student_number: "",
        email: "",
        password: "",
        home_address: "",
      });
      await fetchStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create student");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || role !== "staff") return;
    try {
      await deleteStudent(id, token);
      await fetchStudents();
    } catch {
      // Handle silently
    }
  };

  const getInitials = (first: string, last: string) =>
    `${first[0] || ""}${last[0] || ""}`.toUpperCase();

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-[#fff382]",
      "bg-[#ff6b8b]",
      "bg-[#6ee7b7]",
      "bg-[#ff9a76]",
      "bg-[#a855f7]",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
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
            <div className="p-3 rounded-xl bg-[#6ee7b7] border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
              <Users className="w-6 h-6 text-zinc-950" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-zinc-950 uppercase tracking-tighter">Students</h1>
              <p className="text-zinc-600 font-bold text-sm mt-1 uppercase tracking-tight">
                Manage student records and profiles
              </p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="bg-[#fff382] text-zinc-950 hover:bg-[#fff382]">
                <Plus className="w-5 h-5 mr-2" strokeWidth={3} />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="border-4 border-zinc-950 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] rounded-none">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Register New Student</DialogTitle>
                <DialogDescription className="font-bold uppercase tracking-tight text-zinc-600">Create a new student account</DialogDescription>
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
                    <label className="text-sm font-black uppercase tracking-tight text-zinc-950">First Name</label>
                    <Input
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      placeholder="John"
                      required
                      className="rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-tight text-zinc-950">Last Name</label>
                    <Input
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      placeholder="Doe"
                      required
                      className="rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-tight text-zinc-950">Student Number</label>
                  <Input
                    value={form.student_number}
                    onChange={(e) => setForm({ ...form, student_number: e.target.value })}
                    placeholder="AO1234567"
                    pattern="^AO\d{7}$"
                    required
                    className="rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-tight text-zinc-950">Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john.doe@university.edu"
                    required
                    className="rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-tight text-zinc-950">Password</label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 8 characters"
                    minLength={8}
                    required
                    className="rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-tight text-zinc-950">Home Address (Optional)</label>
                  <Input
                    value={form.home_address || ""}
                    onChange={(e) => setForm({ ...form, home_address: e.target.value || undefined })}
                    placeholder="123 Main St, Anytown, USA"
                    className="rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                  />
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
                    "Create Student"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-950" strokeWidth={3} />
          <Input
            placeholder="Search students by name or number..."
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
        <p className="text-sm font-black uppercase tracking-tight text-zinc-600 mt-3">
          Showing {filtered.length} of {students.length} students
        </p>
      </motion.div>

      {/* Student Grid */}
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
          <UserCircle className="w-16 h-16 mb-4 text-zinc-950" strokeWidth={2} />
          <p className="text-2xl font-black uppercase tracking-tighter">No students found</p>
          <p className="text-sm font-bold text-zinc-600 uppercase mt-1">Try adjusting your search or add a new student</p>
        </motion.div>
      ) : (
        <motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((student) => (
            <motion.div key={student.id} variants={fadeInUp}>
              <Card className="group hover:-translate-y-1 hover:translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] transition-all duration-200 overflow-hidden bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] ${getAvatarColor(
                          student.first_name
                        )} flex items-center justify-center text-zinc-950 font-black text-xl`}
                      >
                        {getInitials(student.first_name, student.last_name)}
                      </div>
                      <div>
                        <h3 className="font-black text-zinc-950 text-xl tracking-tight uppercase">
                          {student.first_name} {student.last_name}
                        </h3>
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-tight flex items-center gap-1 mt-1">
                          <Hash className="w-4 h-4 text-[#ec4899]" strokeWidth={3} />
                          {student.student_number}
                        </p>
                      </div>
                    </div>
                    {role === "staff" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-950 hover:bg-[#ff6b8b] hover:text-white rounded-none border-2 border-transparent hover:border-zinc-950"
                        onClick={() => handleDelete(student.id)}
                      >
                        <Trash2 className="w-5 h-5" strokeWidth={3} />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t-2 border-zinc-100">
                    {student.email && (
                      <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 uppercase tracking-tight">
                        <Mail className="w-4 h-4 text-zinc-950" strokeWidth={3} />
                        <span className="truncate">{student.email}</span>
                      </div>
                    )}
                    {student.home_address && (
                      <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 uppercase tracking-tight">
                        <MapPin className="w-4 h-4 text-zinc-950" strokeWidth={3} />
                        <span className="truncate">{student.home_address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 uppercase tracking-tight">
                      <Calendar className="w-4 h-4 text-zinc-950" strokeWidth={3} />
                      <span>Joined {formatDate(student.created_at)}</span>
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
