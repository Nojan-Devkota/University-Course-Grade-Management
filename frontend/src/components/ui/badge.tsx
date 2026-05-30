import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 border-zinc-950 px-2.5 py-0.5 text-xs font-black uppercase tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[#fff382] text-zinc-950 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]",
        secondary: "bg-[#6ee7b7] text-zinc-950 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]",
        destructive: "bg-[#ff4b4b] text-white shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]",
        outline: "bg-white text-zinc-950 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]",
        success: "bg-[#a3e635] text-zinc-950 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
