"use client";

import { LiquidGlass } from "@/components/ui/liquid-glass";
import { ExpandableWidget } from "./expandable-widget";
import { BookOpen, ExternalLink, FileText } from "lucide-react";
import type { PublicationItem } from "@/lib/types";

interface PublicationsWidgetProps {
  publications: PublicationItem[];
}

export function PublicationsWidget({ publications }: PublicationsWidgetProps) {
  const expandedContent = (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-purple-400">
        <FileText className="w-6 h-6" />
        <span className="font-medium">{publications.length} Published Paper{publications.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-4">
        {publications.map((pub) => (
          <div
            key={pub.doi}
            className="bg-white/5 rounded-xl p-4 space-y-3 hover:bg-white/10 transition-colors"
          >
            <h4 className="font-medium leading-tight">{pub.title}</h4>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {pub.venue}
              </span>
              <span>{pub.year}</span>
            </div>
            <a
              href={`https://doi.org/${pub.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              DOI: {pub.doi}
            </a>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <ExpandableWidget title="Publications" expandedContent={expandedContent}>
      <LiquidGlass blur="md" hoverable className="h-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <BookOpen className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold">Publications</h3>
        </div>
        <div className="space-y-4">
          {publications.slice(0, 2).map((pub) => (
            <div key={pub.doi} className="space-y-1">
              <p className="text-sm font-medium leading-tight line-clamp-2">{pub.title}</p>
              <p className="text-xs text-white/50">
                {pub.venue} • {pub.year}
              </p>
            </div>
          ))}
          {publications.length > 2 && (
            <p className="text-xs text-white/40">+{publications.length - 2} more</p>
          )}
        </div>
      </LiquidGlass>
    </ExpandableWidget>
  );
}
