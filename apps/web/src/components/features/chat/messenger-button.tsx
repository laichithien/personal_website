"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { MessengerWindow } from "./messenger-window";

export function MessengerButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            layoutId="messenger-container"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 md:bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 flex items-center justify-center hover:bg-cyan-400 transition-colors"
            aria-label="Open chat messenger"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - tap to close on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              aria-label="Close messenger"
            />
            <MessengerWindow onClose={() => setIsOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
