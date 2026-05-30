"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { motion } from "framer-motion";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-zinc-950 selection:bg-zinc-950 selection:text-white">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="ml-[280px] min-h-screen transition-all duration-300 relative"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50 z-0 pointer-events-none" />
        <div className="relative z-10 min-h-screen px-8 py-8">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
