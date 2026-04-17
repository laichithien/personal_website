"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { getLiquidGlassClassName } from "@/components/ui/liquid-glass";
import { ContainedScrollArea } from "@/components/ui/contained-scroll-area";
import { GlassIconButton } from "@/components/ui/glass-icon-button";

interface ExpandableWidgetProps {
  children: ReactNode;
  expandedContent?: ReactNode;
  title?: string;
  className?: string;
}

interface WidgetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function ExpandableWidget({
  children,
  expandedContent,
  title,
  className = "",
}: ExpandableWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandedContent, setShowExpandedContent] = useState(false);
  const [originRect, setOriginRect] = useState<WidgetRect | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [expandedWidth, setExpandedWidth] = useState(672);
  const widgetRef = useRef<HTMLDivElement>(null);
  const showContentTimeoutRef = useRef<number | null>(null);
  const collapseTimeoutRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (showContentTimeoutRef.current !== null) {
      window.clearTimeout(showContentTimeoutRef.current);
      showContentTimeoutRef.current = null;
    }
    if (collapseTimeoutRef.current !== null) {
      window.clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const modalWidth = Math.min(672, viewportWidth - 32);

      setViewportSize({ width: viewportWidth, height: viewportHeight });
      setExpandedWidth(modalWidth);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const finishClose = useCallback(() => {
    setIsExpanded(false);
    setOriginRect(null);
  }, []);

  const handleClose = useCallback(() => {
    clearTimers();
    setShowExpandedContent(false);
    collapseTimeoutRef.current = window.setTimeout(finishClose, 100);
  }, [clearTimers, finishClose]);

  useEffect(() => {
    if (!isExpanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [handleClose, isExpanded]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleExpand = () => {
    const rect = widgetRef.current?.getBoundingClientRect();
    if (!rect) return;

    clearTimers();
    setOriginRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    setIsExpanded(true);
    showContentTimeoutRef.current = window.setTimeout(() => setShowExpandedContent(true), 250);
  };

  return (
    <>
      <motion.div
        ref={widgetRef}
        onClick={handleExpand}
        className={`cursor-pointer h-full ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ opacity: isExpanded ? 0 : 1 }}
      >
        {children}
      </motion.div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isExpanded && originRect && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={handleClose}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                />

                <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
                  <motion.div
                    initial={{
                      x:
                        originRect.left +
                        originRect.width / 2 -
                        viewportSize.width / 2,
                      y:
                        originRect.top +
                        originRect.height / 2 -
                        viewportSize.height / 2,
                      width: originRect.width,
                      height: originRect.height,
                      borderRadius: 16,
                    }}
                    animate={{
                      x: 0,
                      y: 0,
                      width: expandedWidth,
                      height: "auto",
                      borderRadius: 16,
                    }}
                    exit={{
                      x:
                        originRect.left +
                        originRect.width / 2 -
                        viewportSize.width / 2,
                      y:
                        originRect.top +
                        originRect.height / 2 -
                        viewportSize.height / 2,
                      width: originRect.width,
                      height: originRect.height,
                      borderRadius: 16,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 26,
                    }}
                    className={`${getLiquidGlassClassName({ blur: "lg", glow: true })} pointer-events-auto overflow-hidden bg-white/8`}
                  >
                    <motion.div
                      initial={{ opacity: 1 }}
                      animate={{ opacity: showExpandedContent ? 0 : 1 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0"
                      style={{ pointerEvents: showExpandedContent ? "none" : "auto" }}
                    >
                      {children}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: showExpandedContent ? 1 : 0 }}
                      transition={{ duration: 0.2, delay: showExpandedContent ? 0.1 : 0 }}
                      className="relative max-h-[80vh]"
                    >
                      <motion.div
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="sticky top-0 z-10 flex items-center justify-end px-4 pt-4"
                      >
                        <GlassIconButton
                          onClick={handleClose}
                          size="sm"
                          aria-label={title ? `Close ${title}` : "Close details"}
                          className="bg-white/10"
                        >
                          <X className="w-5 h-5" />
                        </GlassIconButton>
                      </motion.div>

                      <ContainedScrollArea className="max-h-[80vh] px-6 pb-6">
                        {title && (
                          <motion.h3
                            initial={{ opacity: 0, y: -10 }}
                            animate={{
                              opacity: showExpandedContent ? 1 : 0,
                              y: showExpandedContent ? 0 : -10,
                            }}
                            transition={{ delay: 0.15 }}
                            className="mb-4 pt-2 text-2xl font-bold"
                          >
                            {title}
                          </motion.h3>
                        )}

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: showExpandedContent ? 1 : 0,
                            y: showExpandedContent ? 0 : 10,
                            scale: showExpandedContent ? [1, 1.01, 0.99, 1] : 1,
                          }}
                          transition={{
                            delay: 0.2,
                            scale: {
                              delay: 0.35,
                              duration: 0.3,
                              times: [0, 0.4, 0.7, 1],
                            },
                          }}
                        >
                          {expandedContent || children}
                        </motion.div>
                      </ContainedScrollArea>
                    </motion.div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
