"use client";

import { LiquidGlass } from "@/components/ui/liquid-glass";
import { ExpandableWidget } from "./expandable-widget";
import { Trophy, Medal, Star, Calendar } from "lucide-react";
import type { AchievementItem } from "@/lib/types";

interface AchievementsWidgetProps {
  achievements: AchievementItem[];
}

export function AchievementsWidget({ achievements }: AchievementsWidgetProps) {
  const expandedContent = (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-yellow-400">
        <Medal className="w-6 h-6" />
        <span className="font-medium">{achievements.length} Achievement{achievements.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-4">
        {achievements.map((achievement, index) => (
          <div
            key={achievement.title}
            className="bg-white/5 rounded-xl p-4 space-y-2 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20 mt-0.5">
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{achievement.title}</h4>
                <p className="text-sm text-white/70">{achievement.event}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                  <span>{achievement.organization}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {achievement.year}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <ExpandableWidget title="Achievements" expandedContent={expandedContent}>
      <LiquidGlass blur="md" hoverable className="h-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-yellow-500/20">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold">Achievements</h3>
        </div>
        <div className="space-y-3">
          {achievements.slice(0, 2).map((achievement) => (
            <div key={achievement.title} className="space-y-1">
              <p className="font-medium text-sm">{achievement.title}</p>
              <p className="text-xs text-white/50">
                {achievement.organization} • {achievement.year}
              </p>
            </div>
          ))}
          {achievements.length > 2 && (
            <p className="text-xs text-white/40">+{achievements.length - 2} more</p>
          )}
        </div>
      </LiquidGlass>
    </ExpandableWidget>
  );
}
