import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getGradeColor(grade: number | null): string {
  if (grade === null) return "text-zinc-500";
  if (grade >= 3.5) return "text-emerald-400";
  if (grade >= 3.0) return "text-green-400";
  if (grade >= 2.5) return "text-yellow-400";
  if (grade >= 2.0) return "text-orange-400";
  return "text-red-400";
}

export function getGradeLetter(grade: number | null): string {
  if (grade === null) return "N/A";
  if (grade >= 3.7) return "A";
  if (grade >= 3.3) return "A-";
  if (grade >= 3.0) return "B+";
  if (grade >= 2.7) return "B";
  if (grade >= 2.3) return "B-";
  if (grade >= 2.0) return "C+";
  if (grade >= 1.7) return "C";
  if (grade >= 1.3) return "C-";
  if (grade >= 1.0) return "D";
  return "F";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "enrolled": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "completed": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "in_progress": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "dropped": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "failed": return "bg-rose-500/20 text-rose-400 border-rose-500/30";
    default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }
}

export function getSemesterColor(semester: string): string {
  switch (semester) {
    case "Spring": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Summer": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Fall": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }
}
