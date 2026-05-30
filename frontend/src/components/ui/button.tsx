import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer border-2 border-zinc-950",
  {
    variants: {
      variant: {
        default: "bg-[#fff382] text-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        destructive: "bg-[#ff4b4b] text-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        outline: "bg-white text-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        secondary: "bg-[#6ee7b7] text-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        ghost: "border-transparent bg-transparent text-zinc-950 hover:bg-zinc-100 hover:border-zinc-950 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]",
        link: "border-transparent bg-transparent text-zinc-950 underline-offset-4 hover:underline",
        glow: "bg-[#ec4899] text-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
