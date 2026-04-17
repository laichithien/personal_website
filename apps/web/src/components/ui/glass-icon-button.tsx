"use client";

import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface GlassIconButtonProps extends ComponentProps<"button"> {
  asChild?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClassMap = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

export function GlassIconButton({
  asChild = false,
  className,
  size = "md",
  ...props
}: GlassIconButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white",
        sizeClassMap[size],
        className
      )}
      {...props}
    />
  );
}
