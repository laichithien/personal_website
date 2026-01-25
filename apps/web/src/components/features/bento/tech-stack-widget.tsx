"use client";

import { LiquidGlass } from "@/components/ui/liquid-glass";
import { ExpandableWidget } from "./expandable-widget";
import type { TechItem } from "@/lib/types";

interface TechStackWidgetProps {
  items: TechItem[];
}

const categoryColors: Record<string, string> = {
  language: "bg-blue-500/20 text-blue-300",
  frontend: "bg-green-500/20 text-green-300",
  backend: "bg-purple-500/20 text-purple-300",
  database: "bg-yellow-500/20 text-yellow-300",
  devops: "bg-orange-500/20 text-orange-300",
  data: "bg-cyan-500/20 text-cyan-300",
};

const categoryLabels: Record<string, string> = {
  language: "Languages",
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  devops: "DevOps",
  data: "Data & AI",
};

export function TechStackWidget({ items }: TechStackWidgetProps) {
  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, TechItem[]>);

  const expandedContent = (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <div key={category}>
          <h4 className="text-lg font-semibold mb-3 text-white/80">
            {categoryLabels[category] || category}
          </h4>
          <div className="flex flex-wrap gap-2">
            {categoryItems.map((item) => (
              <span
                key={item.name}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${categoryColors[item.category]} transition-transform hover:scale-105`}
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="pt-4 border-t border-white/10">
        <p className="text-sm text-white/50">
          Click outside or press the X to close
        </p>
      </div>
    </div>
  );

  return (
    <ExpandableWidget title="Tech Stack" expandedContent={expandedContent}>
      <LiquidGlass blur="lg" hoverable className="h-full p-6">
        <h3 className="text-xl font-semibold mb-4">Tech Stack</h3>
        <div className="flex flex-wrap gap-2">
          {items.slice(0, 12).map((item) => (
            <span
              key={item.name}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${categoryColors[item.category]}`}
            >
              {item.name}
            </span>
          ))}
          {items.length > 12 && (
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white/60">
              +{items.length - 12} more
            </span>
          )}
        </div>
      </LiquidGlass>
    </ExpandableWidget>
  );
}
