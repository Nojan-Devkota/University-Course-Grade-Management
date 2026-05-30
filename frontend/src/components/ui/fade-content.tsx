"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface FadeContentProps {
  children: React.ReactNode;
  blur?: boolean;
  duration?: number;
  initialOpacity?: number;
  className?: string;
}

export function FadeContent({
  children,
  blur = false,
  duration = 1000,
  initialOpacity = 0,
  className = "",
}: FadeContentProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: initialOpacity, y: 20, filter: blur ? "blur(10px)" : "blur(0px)" }}
      animate={
        isInView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: initialOpacity, y: 20, filter: blur ? "blur(10px)" : "blur(0px)" }
      }
      transition={{ duration: duration / 1000, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
