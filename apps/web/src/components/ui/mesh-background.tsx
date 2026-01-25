"use client";

import { motion } from "framer-motion";

export function MeshBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-zinc-950">
      {/* Purple blob - Top left */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-purple-900/40 blur-[100px]"
      />

      {/* Blue blob - Bottom right */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute -bottom-[10%] -right-[10%] h-[600px] w-[600px] rounded-full bg-blue-900/30 blur-[120px]"
      />

      {/* Cyan accent - Center */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 50, -50, 0],
          y: [0, 100, -100, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute top-[40%] left-[30%] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[80px]"
      />

      {/* Noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-50" />
    </div>
  );
}
