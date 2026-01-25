"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useRef, useEffect, type ReactNode } from "react";

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
  const [expandedPos, setExpandedPos] = useState({ top: 0, left: 0, width: 672 });
  const widgetRef = useRef<HTMLDivElement>(null);

  // Calculate expanded position on mount and resize
  useEffect(() => {
    const updateExpandedPosition = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const modalWidth = Math.min(672, viewportWidth - 32);

      setExpandedPos({
        top: viewportHeight * 0.1,
        left: (viewportWidth - modalWidth) / 2,
        width: modalWidth,
      });
    };

    updateExpandedPosition();
    window.addEventListener("resize", updateExpandedPosition);
    return () => window.removeEventListener("resize", updateExpandedPosition);
  }, []);

  const handleExpand = () => {
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      setOriginRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
    setIsExpanded(true);
    document.body.style.overflow = "hidden";

    // Notify smooth scroll container to disable scrolling
    window.dispatchEvent(new CustomEvent("widgetExpandStateChange", { detail: { expanded: true } }));

    // Delay showing expanded content for smooth transition
    setTimeout(() => setShowExpandedContent(true), 250);
  };

  const handleClose = () => {
    setShowExpandedContent(false);
    setTimeout(() => {
      setIsExpanded(false);
      document.body.style.overflow = "";

      // Notify smooth scroll container to re-enable scrolling
      window.dispatchEvent(new CustomEvent("widgetExpandStateChange", { detail: { expanded: false } }));
    }, 100);
  };

  return (
    <>
      {/* Original widget - clickable */}
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

      {/* Expanded modal overlay */}
      <AnimatePresence>
        {isExpanded && originRect && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Expanded content - animates from widget position */}
            <motion.div
              initial={{
                top: originRect.top,
                left: originRect.left,
                width: originRect.width,
                height: originRect.height,
                borderRadius: 16,
              }}
              animate={{
                top: expandedPos.top,
                left: expandedPos.left,
                width: expandedPos.width,
                height: "auto",
                borderRadius: 16,
              }}
              exit={{
                top: originRect.top,
                left: originRect.left,
                width: originRect.width,
                height: originRect.height,
                borderRadius: 16,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 26,
              }}
              className="fixed z-51 overflow-hidden"
              style={{
                zIndex: 51,
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 0 30px rgba(6, 182, 212, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Top highlight gradient */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Original content - visible during transition */}
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: showExpandedContent ? 0 : 1 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0"
                style={{ pointerEvents: showExpandedContent ? "none" : "auto" }}
              >
                {children}
              </motion.div>

              {/* Expanded content with scroll */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showExpandedContent ? 1 : 0 }}
                transition={{ duration: 0.2, delay: showExpandedContent ? 0.1 : 0 }}
                className="relative max-h-[80vh] overflow-y-auto"
              >
                {/* Close button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: showExpandedContent ? 1 : 0,
                    scale: showExpandedContent ? 1 : 0
                  }}
                  transition={{ delay: 0.2 }}
                  className="sticky top-4 float-right mr-4 mt-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-white/80" />
                </motion.button>

                <div className="p-6 pt-2">
                  {title && (
                    <motion.h3
                      initial={{ opacity: 0, y: -10 }}
                      animate={{
                        opacity: showExpandedContent ? 1 : 0,
                        y: showExpandedContent ? 0 : -10
                      }}
                      transition={{ delay: 0.15 }}
                      className="text-2xl font-bold mb-4"
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
                      }
                    }}
                  >
                    {expandedContent || children}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
