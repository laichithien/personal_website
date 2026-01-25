"use client";

import { LiquidGlass } from "@/components/ui/liquid-glass";
import { ExpandableWidget } from "./expandable-widget";
import { Music, Music2, Disc3, Headphones } from "lucide-react";

interface MusicWidgetProps {
  instruments: string[];
  currentlyPlaying: string;
}

export function MusicWidget({ instruments, currentlyPlaying }: MusicWidgetProps) {
  const expandedContent = (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-cyan-400">
        <Headphones className="w-6 h-6" />
        <span className="font-medium">Musical Journey</span>
      </div>

      <div className="space-y-4">
        <div className="bg-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-white/60">
            <Music2 className="w-4 h-4" />
            <span className="text-sm font-medium">Instruments I Play</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {instruments.length > 0 ? (
              instruments.map((instrument) => (
                <span
                  key={instrument}
                  className="px-4 py-2 rounded-xl text-sm bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                >
                  {instrument}
                </span>
              ))
            ) : (
              <span className="text-white/40 text-sm">Not specified</span>
            )}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-white/60">
            <Disc3 className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-sm font-medium">Currently Playing</span>
          </div>
          <p className="text-lg text-cyan-400 font-medium">
            {currentlyPlaying || "Nothing right now"}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <p className="text-sm text-white/50">
          Music helps me stay creative and focused while coding
        </p>
      </div>
    </div>
  );

  return (
    <ExpandableWidget title="Music" expandedContent={expandedContent}>
      <LiquidGlass blur="lg" hoverable className="h-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <Music className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-semibold">Music</h3>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-white/40 mb-1">Instruments</p>
            <div className="flex gap-2">
              {instruments.length > 0 ? (
                instruments.map((instrument) => (
                  <span
                    key={instrument}
                    className="px-3 py-1 rounded-full text-sm bg-white/10"
                  >
                    {instrument}
                  </span>
                ))
              ) : (
                <span className="text-white/40 text-sm">Not specified</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-white/40 mb-1">Currently Playing</p>
            <p className="text-cyan-400">{currentlyPlaying || "Nothing right now"}</p>
          </div>
        </div>
      </LiquidGlass>
    </ExpandableWidget>
  );
}
