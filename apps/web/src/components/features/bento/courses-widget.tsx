"use client";

import { LiquidGlass } from "@/components/ui/liquid-glass";
import { ExpandableWidget } from "./expandable-widget";
import { Award, BookMarked, Calendar, CheckCircle } from "lucide-react";
import type { CourseItem } from "@/lib/types";

interface CoursesWidgetProps {
  courses: CourseItem[];
}

export function CoursesWidget({ courses }: CoursesWidgetProps) {
  const expandedContent = (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-green-400">
        <BookMarked className="w-6 h-6" />
        <span className="font-medium">{courses.length} Professional Course{courses.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.title}
            className="bg-white/5 rounded-xl p-4 space-y-3 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/20 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium">{course.title}</h4>
                  <span className="text-xs text-white/50 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {course.year}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pl-11">
              {course.focus.map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-300"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <ExpandableWidget title="Professional Courses" expandedContent={expandedContent}>
      <LiquidGlass blur="md" hoverable className="h-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-500/20">
            <Award className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold">Professional Courses</h3>
        </div>
        <div className="space-y-3">
          {courses.slice(0, 2).map((course) => (
            <div key={course.title} className="space-y-2">
              <div className="flex justify-between items-start">
                <p className="font-medium text-sm">{course.title}</p>
                <span className="text-xs text-white/50">{course.year}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {course.focus.slice(0, 2).map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/70"
                  >
                    {topic}
                  </span>
                ))}
                {course.focus.length > 2 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/50">
                    +{course.focus.length - 2}
                  </span>
                )}
              </div>
            </div>
          ))}
          {courses.length > 2 && (
            <p className="text-xs text-white/40">+{courses.length - 2} more courses</p>
          )}
        </div>
      </LiquidGlass>
    </ExpandableWidget>
  );
}
