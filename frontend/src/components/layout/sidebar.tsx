"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

const getNavItems = (role: string | null) => {
  const items = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/courses", label: "Courses", icon: BookOpen },
  ];

  if (role === "staff") {
    items.splice(1, 0, { href: "/students", label: "Students", icon: Users });
    items.push({ href: "/enrollments", label: "Enrollments", icon: ClipboardList });
  }

  return items;
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, role } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r-4 border-zinc-950 bg-white"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 pb-4 border-b-4 border-zinc-950 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#ec4899] border-2 border-zinc-950 flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-black text-zinc-950 uppercase tracking-tight whitespace-nowrap overflow-hidden"
            >
              UniGrade
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-3">
        {getNavItems(role).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl text-base font-black uppercase tracking-tight transition-all duration-200 group border-2",
                isActive
                  ? "text-zinc-950 bg-[#fff382] border-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]"
                  : "text-zinc-950 border-transparent hover:border-zinc-950 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:bg-[#6ee7b7]"
              )}
            >
              <item.icon
                strokeWidth={3}
                className={cn(
                  "w-5 h-5 shrink-0 relative z-10 transition-colors",
                  isActive ? "text-zinc-950" : "text-zinc-950"
                )}
              />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Role badge */}
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-4 mb-4 px-4 py-3 rounded-xl bg-[#ff9a76] border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-zinc-950 fill-zinc-950" />
              <span className="text-sm font-bold text-zinc-950 uppercase tracking-tight">
                Role: {" "}
                <span className="font-black">
                  {role || "guest"}
                </span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <div className="p-4 space-y-3 border-t-4 border-zinc-950 bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full h-12 justify-start gap-3 uppercase font-black tracking-tight",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" strokeWidth={3} />
          {!collapsed && <span>Sign Out</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full h-12 justify-start gap-3 uppercase font-black tracking-tight",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" strokeWidth={3} />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" strokeWidth={3} />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </motion.aside>
  );
}
