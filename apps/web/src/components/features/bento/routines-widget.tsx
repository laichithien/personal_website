"use client";

import { LiquidGlass } from "@/components/ui/liquid-glass";
import { ExpandableWidget } from "./expandable-widget";
import { Calendar, Coffee, Sun, Moon, Zap } from "lucide-react";

interface RoutinesWidgetProps {
  routines: string[];
}

const routineIcons = [Sun, Coffee, Zap, Moon];

export function RoutinesWidget({ routines }: RoutinesWidgetProps) {
  const expandedContent = (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-cyan-400">
        <Calendar className="w-6 h-6" />
        <span className="font-medium">Daily Rhythm</span>
      </div>

      <div className="space-y-3">
        {routines.length > 0 ? (
          routines.map((routine, index) => {
            const Icon = routineIcons[index % routineIcons.length];
            return (
              <div
                key={index}
                className="bg-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
              >
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-white/80">{routine}</span>
              </div>
            );
          })
        ) : (
          <p className="text-white/40 text-sm">No routines specified</p>
        )}
      </div>

      <div className="pt-4 border-t border-white/10">
        <p className="text-sm text-white/50">
          Consistency and balance are key to sustainable productivity
        </p>
      </div>
    </div>
  );

  return (
    <ExpandableWidget title="Daily Rhythm" expandedContent={expandedContent}>
      <LiquidGlass blur="lg" hoverable className="h-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-semibold">Daily Rhythm</h3>
        </div>
        <div className="space-y-2">
          {routines.length > 0 ? (
            routines.slice(0, 3).map((routine, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-white/70"
              >
                <Coffee className="w-4 h-4 text-white/40" />
                <span className="text-sm">{routine}</span>
              </div>
            ))
          ) : (
            <span className="text-white/40 text-sm">No routines specified</span>
          )}
          {routines.length > 3 && (
            <p className="text-xs text-white/40 pl-7">+{routines.length - 3} more</p>
          )}
        </div>
      </LiquidGlass>
    </ExpandableWidget>
  );
}
