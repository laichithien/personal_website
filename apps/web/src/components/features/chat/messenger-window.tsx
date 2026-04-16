"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { useContainedScroll } from "@/hooks/use-contained-scroll";
import { ChatTab } from "./chat-tab";
import { ContactTab } from "./contact-tab";

interface MessengerWindowProps {
  onClose: () => void;
}

export function MessengerWindow({ onClose }: MessengerWindowProps) {
  const contactContainerRef = useRef<HTMLDivElement>(null);
  useContainedScroll(contactContainerRef);

  return (
    <motion.div
      layoutId="messenger-container"
      className="fixed bottom-6 right-6 z-50 w-[350px] h-[500px] overscroll-contain"
    >
      {/* Use LiquidGlass for consistent design system */}
      <LiquidGlass
        blur="xl"
        glow
        className="h-full w-full flex flex-col overflow-hidden bg-black/60"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h3 className="font-semibold">Send message</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Close chatbox"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full rounded-none border-b border-white/10 bg-transparent shrink-0">
            <TabsTrigger value="chat" className="flex-1">
              Chat AI
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex-1">
              Email Me
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab - use calc to fill remaining space */}
          <TabsContent value="chat" className="h-[calc(500px-130px)] flex flex-col m-0 overflow-hidden">
            <ChatTab />
          </TabsContent>

          <TabsContent value="contact" className="h-[calc(500px-130px)] m-0 overflow-hidden">
            <div
              ref={contactContainerRef}
              data-contained-scroll="true"
              className="vibe-scrollbar h-full overflow-auto overscroll-contain p-4 [overscroll-behavior:contain] touch-pan-y"
            >
              <ContactTab />
            </div>
          </TabsContent>
        </Tabs>
      </LiquidGlass>
    </motion.div>
  );
}
