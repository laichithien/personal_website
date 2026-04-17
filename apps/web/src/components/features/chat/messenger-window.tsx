"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContainedScrollArea } from "@/components/ui/contained-scroll-area";
import { GlassIconButton } from "@/components/ui/glass-icon-button";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { ChatTab } from "./chat-tab";
import { ContactTab } from "./contact-tab";

interface MessengerWindowProps {
  onClose: () => void;
}

export function MessengerWindow({ onClose }: MessengerWindowProps) {
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
          <GlassIconButton onClick={onClose} size="sm" aria-label="Close chatbox">
            <X className="w-4 h-4" />
          </GlassIconButton>
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
            <ContainedScrollArea className="h-full p-4">
              <ContactTab />
            </ContainedScrollArea>
          </TabsContent>
        </Tabs>
      </LiquidGlass>
    </motion.div>
  );
}
