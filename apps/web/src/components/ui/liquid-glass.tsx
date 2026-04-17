"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef, type ReactNode } from "react";

interface LiquidGlassProps extends Omit<HTMLMotionProps<"div">, "children"> {
  blur?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  hoverable?: boolean;
  children?: ReactNode;
}

export const liquidGlassBlurMap = {
  sm: "backdrop-blur-[6px]",
  md: "backdrop-blur-sm",
  lg: "backdrop-blur-md",
  xl: "backdrop-blur-lg",
};

export function getLiquidGlassClassName({
  blur = "md",
  glow = false,
  hoverable = false,
}: Pick<LiquidGlassProps, "blur" | "glow" | "hoverable">) {
  return cn(
    "relative rounded-2xl",
    "bg-white/6",
    liquidGlassBlurMap[blur],
    "border border-white/10",
    "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
    "shadow-xl shadow-black/15",
    glow && "ring-1 ring-cyan-500/16 shadow-[0_0_22px_rgba(6,182,212,0.12)]",
    hoverable && "transition-all duration-300 hover:bg-white/10 hover:border-white/20"
  );
}

export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(
  ({ className, blur = "md", glow = false, hoverable = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          getLiquidGlassClassName({ blur, glow, hoverable }),
          className
        )}
        {...props}
      >
        {/* Top highlight gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

LiquidGlass.displayName = "LiquidGlass";
