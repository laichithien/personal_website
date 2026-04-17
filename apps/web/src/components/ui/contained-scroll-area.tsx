"use client";

import { forwardRef, useRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { useContainedScroll } from "@/hooks/use-contained-scroll";

export const containedScrollAreaClassName =
  "vibe-scrollbar overflow-y-auto overscroll-contain [overscroll-behavior:contain] touch-pan-y";

type ContainedScrollAreaProps = ComponentPropsWithoutRef<"div">;

export const ContainedScrollArea = forwardRef<HTMLDivElement, ContainedScrollAreaProps>(
  ({ className, children, ...props }, forwardedRef) => {
    const innerRef = useRef<HTMLDivElement>(null);
    useContainedScroll(innerRef);

    const setRefs = (node: HTMLDivElement | null) => {
      innerRef.current = node;

      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    return (
      <div
        ref={setRefs}
        data-contained-scroll="true"
        className={cn(containedScrollAreaClassName, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ContainedScrollArea.displayName = "ContainedScrollArea";
