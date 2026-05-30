import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border-2 border-zinc-950 bg-white px-4 py-2 text-sm text-zinc-950 font-medium placeholder:text-zinc-500 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] transition-all focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
