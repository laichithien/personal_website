"use client";

import { LiquidGlass } from "@/components/ui/liquid-glass";
import { ExpandableWidget } from "./expandable-widget";
import { GraduationCap, MapPin, Calendar, Award } from "lucide-react";
import type { EducationData } from "@/lib/types";

interface EducationWidgetProps {
  education: EducationData;
}

export function EducationWidget({ education }: EducationWidgetProps) {
  const expandedContent = (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-cyan-500/20">
          <GraduationCap className="w-8 h-8 text-cyan-400" />
        </div>
        <div>
          <h4 className="text-xl font-semibold">{education.school}</h4>
          <p className="text-white/70">{education.degree}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Period</span>
          </div>
          <p className="font-medium">{education.period}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-sm">GPA</span>
          </div>
          <p className="font-medium text-cyan-400">{education.gpa}</p>
          <p className="text-sm text-white/50">{education.rank}</p>
        </div>
      </div>

      {education.coursework && education.coursework.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold mb-3 text-white/60">Key Coursework</h5>
          <div className="flex flex-wrap gap-2">
            {education.coursework.map((course) => (
              <span
                key={course}
                className="px-3 py-1.5 rounded-full text-sm bg-white/10 text-white/80 hover:bg-white/15 transition-colors"
              >
                {course}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ExpandableWidget title="Education" expandedContent={expandedContent}>
      <LiquidGlass blur="md" hoverable className="h-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/20">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold">Education</h3>
        </div>
        <div className="space-y-2">
          <p className="font-medium">{education.school}</p>
          <p className="text-white/70 text-sm">{education.degree}</p>
          <p className="text-white/50 text-sm">{education.period}</p>
          <div className="flex gap-4 mt-3">
            <span className="text-sm">
              <span className="text-cyan-400">GPA:</span> {education.gpa}
            </span>
            <span className="text-sm text-white/70">{education.rank}</span>
          </div>
        </div>
      </LiquidGlass>
    </ExpandableWidget>
  );
}
