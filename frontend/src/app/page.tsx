"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import Link from "next/link";

function LeftHand() {
  return (
    <motion.svg
      initial={{ y: "100%", rotate: -15 }}
      animate={{ y: "10%", rotate: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="absolute bottom-0 left-[-5%] w-[40vw] max-w-[400px] min-w-[250px] z-20 origin-bottom-left"
      viewBox="0 0 400 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="leftHandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4b4b" />
          <stop offset="100%" stopColor="#ff8c42" />
        </linearGradient>
      </defs>
      {/* Hand Silhouette */}
      <path
        d="M330,500 L350,280 C352,250 320,240 300,260 L280,310 L280,180 C280,150 240,150 230,180 L220,300 L210,140 C210,110 170,110 160,140 L150,300 L140,160 C140,130 100,130 90,160 L80,330 L40,300 C20,285 0,310 10,330 L110,480 C130,510 160,520 190,520 L330,500 Z"
        fill="url(#leftHandGrad)"
        stroke="#18181b"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* Palm Line */}
      <path
        d="M140,430 C180,390 230,390 270,430"
        stroke="#18181b"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M205,410 L205,440"
        stroke="#18181b"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

function RightHand() {
  return (
    <motion.svg
      initial={{ y: "100%", rotate: 15 }}
      animate={{ y: "10%", rotate: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      className="absolute bottom-0 right-[-5%] w-[40vw] max-w-[400px] min-w-[250px] z-20 origin-bottom-right"
      viewBox="0 0 400 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="rightHandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* Hand Silhouette (Flipped) */}
      <path
        d="M70,500 L50,280 C48,250 80,240 100,260 L120,310 L120,180 C120,150 160,150 170,180 L180,300 L190,140 C190,110 230,110 240,140 L250,300 L260,160 C260,130 300,130 310,160 L320,330 L360,300 C380,285 400,310 390,330 L290,480 C270,510 240,520 210,520 L70,500 Z"
        fill="url(#rightHandGrad)"
        stroke="#18181b"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* Palm Line */}
      <path
        d="M260,430 C220,390 170,390 130,430"
        stroke="#18181b"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M195,410 L195,440"
        stroke="#18181b"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-r from-[#ff6b8b] via-[#ff9a76] to-[#fff382] font-sans text-zinc-950 selection:bg-zinc-950 selection:text-white">
      {/* Top Header / Logo */}
      <header className="absolute top-6 left-0 right-0 z-30 flex justify-center items-center px-6">
        <Link href="/login" className="flex items-center gap-2 group">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-6 py-2 bg-white rounded-full border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] group-hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all"
          >
            <div className="w-6 h-6 rounded bg-[#ec4899] border-2 border-zinc-950 flex items-center justify-center">
              <span className="text-white text-xs font-bold leading-none tracking-tighter">UG</span>
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-950 uppercase">
              UniGrade
            </span>
          </motion.div>
        </Link>
      </header>

      {/* Floating Badge */}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 12 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
        className="absolute top-12 right-[10%] md:right-[20%] z-40 hidden sm:flex flex-col items-center justify-center w-32 h-32 bg-[#6ee7b7] rounded-full border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]"
      >
        <span className="text-sm font-black text-center leading-tight uppercase px-2">
          Ready for<br />Production
        </span>
        <div className="mt-2 w-6 h-6 bg-white rounded-full border-2 border-zinc-950 flex items-center justify-center">
          <ArrowRight className="w-3 h-3 text-zinc-950" />
        </div>
      </motion.div>

      {/* Main Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center relative z-30"
        >
          <h1 className="flex flex-col items-center justify-center font-black text-[12vw] leading-[0.85] tracking-tighter uppercase">
            <span className="text-zinc-950 drop-shadow-sm">MANAGE YOUR</span>
            <span className="text-zinc-950 drop-shadow-sm">UNIVERSITY</span>
            <span className="text-zinc-950 drop-shadow-sm relative inline-block">
              COURSES
              {/* Optional playful underline */}
              <svg className="absolute w-full h-[0.3em] left-0 bottom-[-0.1em] text-[#ec4899] -z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,10 Q50,20 100,10" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-12 z-40"
        >
          <Link href="/login">
            <button className="flex items-center gap-3 px-8 py-4 bg-white rounded-full border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px]">
              <span className="text-base sm:text-lg font-bold text-zinc-950">
                Log in and discover
              </span>
              <div className="w-8 h-8 rounded-full border-2 border-zinc-950 flex items-center justify-center bg-[#fff382]">
                <ArrowRight className="w-4 h-4 text-zinc-950" />
              </div>
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Decorative Hands */}
      <LeftHand />
      <RightHand />
      
      {/* Bottom Left Badge */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-6 z-40"
      >
        <div className="w-10 h-10 bg-zinc-950 rounded-full flex items-center justify-center text-white font-bold cursor-help hover:bg-zinc-800 transition-colors shadow-lg">
          v1
        </div>
      </motion.div>
    </main>
  );
}
