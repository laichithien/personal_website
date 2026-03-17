"use client";

import { motion } from "framer-motion";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles, Github, Linkedin, Mail } from "lucide-react";
import Image from "next/image";

interface HeroData {
  name: string;
  title: string;
  tagline: string;
  avatar: string;
}

export function HeroSection({ data }: { data: HeroData }) {
  const scrollToTech = () => {
    document.getElementById("tech")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-4xl"
    >
      <LiquidGlass blur="xl" glow className="p-6 md:p-10">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Avatar - Left side on desktop */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative flex-shrink-0"
          >
            <div className="relative">
              {/* Glow effect behind avatar */}
              <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl" />

              {/* Avatar container */}
              <div className="relative w-48 h-64 md:w-56 md:h-72 rounded-2xl overflow-hidden ring-2 ring-white/20 shadow-2xl">
                {data.avatar ? (
                  <Image
                    src={data.avatar}
                    alt={data.name}
                    fill
                    className="object-cover object-top"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                    <span className="text-6xl font-bold text-white/30">
                      {data.name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>

              {/* Decorative rotating border */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 rounded-2xl border border-dashed border-cyan-500/30"
              />
            </div>
          </motion.div>

          {/* Content - Right side on desktop */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 flex-1">
            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-gradient"
            >
              {data.name}
            </motion.h1>

            {/* Title */}
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-cyan-400 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {data.title}
            </motion.p>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/60 max-w-md text-lg"
            >
              {data.tagline}
            </motion.p>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3 mt-2"
            >
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-white/70 hover:text-white" />
              </a>
              <a
                href="https://www.linkedin.com/in/yourprofile/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-white/70 hover:text-white" />
              </a>
              <a
                href="mailto:contact@yourdomain.com"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-white/70 hover:text-white" />
              </a>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                onClick={scrollToTech}
                variant="outline"
                className="mt-4 border-white/20 hover:bg-white/10"
              >
                <ArrowDown className="w-4 h-4 mr-2" />
                Explore My Work
              </Button>
            </motion.div>
          </div>
        </div>
      </LiquidGlass>
    </motion.div>
  );
}
