"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BookOpen,
  ClipboardList,
  TrendingUp,
  GraduationCap,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getStudents, getCourses, getEnrollmentsForStudent, type Student, type Course, type Enrollment } from "@/lib/api";
import { getStatusColor, getGradeColor, getGradeLetter, formatDate, cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeType,
  color,
  href,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  change: string;
  changeType: "up" | "down";
  color: string;
  href: string;
  delay: number;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ delay, duration: 0.5 }}
    >
      <Link href={href}>
        <Card className="group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] transition-all duration-200 cursor-pointer overflow-hidden relative">
          <div className={`absolute inset-0 ${color} opacity-100 transition-colors duration-500`} />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-white border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]">
                <Icon className="w-5 h-5 text-zinc-950" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-black uppercase tracking-tight ${
                changeType === "up" ? "text-emerald-600" : "text-red-600"
              }`}>
                {changeType === "up" ? (
                  <ArrowUpRight className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <ArrowDownRight className="w-4 h-4" strokeWidth={3} />
                )}
                {change}
              </div>
            </div>
            <div className="text-4xl font-black text-zinc-950 mb-1 tracking-tighter">
              <AnimatedCounter value={value} />
            </div>
            <div className="text-sm font-bold text-zinc-950 uppercase tracking-tight">{label}</div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function RecentActivityItem({
  action,
  subject,
  time,
  icon: Icon,
  color,
}: {
  action: string;
  subject: string;
  time: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: string;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex items-center gap-4 py-4 group border-b-2 border-zinc-200 last:border-b-0"
    >
      <div className={`p-2 rounded-xl border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] ${color} shrink-0`}>
        <Icon className="w-5 h-5 text-zinc-950" strokeWidth={3} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-zinc-950 truncate uppercase tracking-tight">
          {action} <span className="font-black text-[#ec4899]">{subject}</span>
        </p>
        <p className="text-xs font-bold text-zinc-500 mt-0.5">{time}</p>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { token, role, userId } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (role === "staff") {
          const [s, c] = await Promise.all([
            getStudents(token).catch(() => []),
            getCourses().catch(() => []),
          ]);
          setStudents(s);
          setCourses(c);
        } else if (role === "student" && userId && token) {
          const [e, c] = await Promise.all([
            getEnrollmentsForStudent(userId, token).catch(() => []),
            getCourses().catch(() => []),
          ]);
          setEnrollments(e);
          setCourses(c);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token, role, userId]);

  const departments = [...new Set(courses.map((c) => c.department))];

  const recentActivities = [
    {
      action: "New student registered:",
      subject: students[0] ? `${students[0].first_name} ${students[0].last_name}` : "John Doe",
      time: "2 minutes ago",
      icon: Users,
      color: "bg-[#6ee7b7]",
    },
    {
      action: "Course created:",
      subject: courses[0]?.title || "Introduction to CS",
      time: "15 minutes ago",
      icon: BookOpen,
      color: "bg-[#a855f7]",
    },
    {
      action: "Grade updated for",
      subject: "Data Structures (CS3303)",
      time: "1 hour ago",
      icon: TrendingUp,
      color: "bg-[#fff382]",
    },
    {
      action: "Enrollment completed:",
      subject: students[1] ? `${students[1].first_name} ${students[1].last_name}` : "Jane Smith",
      time: "3 hours ago",
      icon: ClipboardList,
      color: "bg-[#ff9a76]",
    },
    {
      action: "Semester update:",
      subject: "Fall 2026 courses published",
      time: "Yesterday",
      icon: Calendar,
      color: "bg-[#ff6b8b]",
    },
  ];

  const getCourseById = (id: string) => courses.find((c) => c.id === id);

  if (loading) return null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-xl bg-[#ec4899] border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
            <Activity className="w-6 h-6 text-white" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-zinc-950 uppercase tracking-tighter">Dashboard</h1>
            <p className="text-zinc-600 font-bold text-sm mt-1 uppercase tracking-tight">
              Welcome back! Here&apos;s your academic overview.
            </p>
          </div>
        </div>
      </motion.div>

      {role === "student" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2 lg:col-span-3">
            <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tighter mb-4">My Enrolled Classes</h2>
          </div>
          {enrollments.length === 0 ? (
            <div className="col-span-full">
              <Card className="bg-white border-4 border-zinc-950 border-dashed shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] rounded-none">
                <CardContent className="flex flex-col items-center justify-center h-64 text-zinc-950">
                  <ClipboardList className="w-16 h-16 mb-4 text-zinc-950" strokeWidth={2} />
                  <p className="text-2xl font-black uppercase tracking-tighter">No enrollments yet</p>
                  <p className="text-sm font-bold mt-1 uppercase text-zinc-600">You are not enrolled in any courses</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <AnimatePresence>
              {enrollments.map((enrollment, idx) => {
                const course = getCourseById(enrollment.course_id);
                return (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="h-full group hover:-translate-y-1 hover:translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] transition-all duration-200 bg-white">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Badge variant="default" className="mb-2 bg-[#a855f7] text-white border-2 border-zinc-950 font-black tracking-tight rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]">
                              {course?.code || "Unknown Code"}
                            </Badge>
                            <h3 className="font-black text-zinc-950 text-xl tracking-tight uppercase leading-none mt-1">
                              {course?.title || "Unknown Course"}
                            </h3>
                          </div>
                          <div className="p-2 rounded-xl bg-[#6ee7b7] border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] shrink-0">
                            <BookOpen className="w-5 h-5 text-zinc-950" strokeWidth={3} />
                          </div>
                        </div>

                        <div className="mt-auto pt-4 border-t-2 border-zinc-100 flex flex-col gap-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-zinc-500 uppercase">Status</span>
                            <Badge className={cn("text-xs border-2 border-zinc-950 rounded-none shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] font-black uppercase tracking-tight bg-white", getStatusColor(enrollment.status))}>
                              {enrollment.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-zinc-500 uppercase">Grade</span>
                            <div className="flex items-center gap-2">
                              <span className={cn("text-2xl font-black uppercase", getGradeColor(enrollment.grade))}>
                                {enrollment.grade !== null ? enrollment.grade.toFixed(1) : "—"}
                              </span>
                              <span className={cn("text-base font-black uppercase", getGradeColor(enrollment.grade))}>
                                {getGradeLetter(enrollment.grade)}
                              </span>
                            </div>
                          </div>
                          {course && (
                            <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                              <span className="text-xs font-bold text-zinc-500 uppercase">Credits</span>
                              <span className="text-sm font-black text-zinc-950">{course.credits}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <StatCard
              icon={Users}
              label="Total Students"
              value={students.length}
              change="+12%"
              changeType="up"
              color="bg-[#fff382]"
              href="/students"
              delay={0}
            />
            <StatCard
              icon={BookOpen}
              label="Active Courses"
              value={courses.length}
              change="+8%"
              changeType="up"
              color="bg-[#6ee7b7]"
              href="/courses"
              delay={0.1}
            />
            <StatCard
              icon={GraduationCap}
              label="Departments"
              value={departments.length || 12}
              change="+2"
              changeType="up"
              color="bg-[#ff9a76]"
              href="/courses"
              delay={0.2}
            />
            <StatCard
              icon={TrendingUp}
              label="Avg. GPA"
              value={3}
              change="-0.1"
              changeType="down"
              color="bg-[#ff6b8b]"
              href="/enrollments"
              delay={0.3}
            />
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader className="border-b-4 border-zinc-950 pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl uppercase">
                    <Activity className="w-6 h-6 text-[#ec4899]" strokeWidth={3} />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <motion.div
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                  >
                    {recentActivities.map((activity, i) => (
                      <RecentActivityItem key={i} {...activity} />
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-6"
            >
              {/* Role Card */}
              <Card className="overflow-hidden bg-[#fff382]">
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#ec4899] border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-white" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-zinc-950 uppercase tracking-tight">Your Role</p>
                      <p className="text-xs font-bold text-zinc-600 uppercase">{role || "Staff"} Account</p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs border-2 border-zinc-950 bg-white">
                    {role === "staff" ? "Full Access" : "Limited Access"}
                  </Badge>
                </CardContent>
              </Card>

              {/* Semester Overview */}
              <Card>
                <CardHeader className="pb-3 border-b-2 border-zinc-950">
                  <CardTitle className="text-lg flex items-center gap-2 uppercase tracking-tight">
                    <Calendar className="w-5 h-5 text-[#ff9a76]" strokeWidth={3} />
                    Current Semester
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-2">
                      <span className="text-sm font-bold text-zinc-500 uppercase">Semester</span>
                      <Badge variant="success">Spring 2026</Badge>
                    </div>
                    <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-2">
                      <span className="text-sm font-bold text-zinc-500 uppercase">Courses</span>
                      <span className="text-sm font-black text-zinc-950">{courses.length}</span>
                    </div>
                    <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-2">
                      <span className="text-sm font-bold text-zinc-500 uppercase">Students</span>
                      <span className="text-sm font-black text-zinc-950">{students.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-zinc-500 uppercase">Departments</span>
                      <span className="text-sm font-black text-zinc-950">{departments.length || 12}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Departments */}
              <Card>
                <CardHeader className="pb-3 border-b-2 border-zinc-950">
                  <CardTitle className="text-lg flex items-center gap-2 uppercase tracking-tight">
                    <BookOpen className="w-5 h-5 text-[#6ee7b7]" strokeWidth={3} />
                    Departments
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {(departments.length > 0 ? departments.slice(0, 5) : ["Computer Science", "Mathematics", "Physics", "Engineering", "Biology"]).map(
                      (dept, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-zinc-950 uppercase truncate">{dept}</span>
                            <span className="text-xs font-bold text-zinc-500">{100 - i * 15}%</span>
                          </div>
                          <div className="h-3 w-full bg-zinc-100 border-2 border-zinc-950 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max(30, 100 - i * 15)}%` }}
                              transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                              className="h-full bg-[#ff6b8b] border-r-2 border-zinc-950"
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
