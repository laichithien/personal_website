"use client";

import { LiquidGlass } from "@/components/ui/liquid-glass";
import { ExpandableWidget } from "./expandable-widget";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const expandedContent = (
    <div className="space-y-4">
      {project.image && (
        <div className="relative h-48 overflow-hidden rounded-xl bg-white/5">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 720px, (min-width: 768px) 600px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <p className="text-white/80 leading-relaxed">{project.description}</p>

      <div>
        <h4 className="text-sm font-semibold mb-2 text-white/60">Technologies</h4>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full text-sm bg-white/10 text-white/80"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-white/10">
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Live
          </a>
        )}
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
          >
            <Github className="w-4 h-4" />
            Source Code
          </a>
        )}
      </div>
    </div>
  );

  return (
    <ExpandableWidget title={project.title} expandedContent={expandedContent}>
      <LiquidGlass blur="md" hoverable className="h-full">
        <div className="p-4 flex flex-col h-full">
          <h4 className="font-semibold mb-2">{project.title}</h4>
          <p className="text-sm text-white/60 mb-3 flex-1 line-clamp-2">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/70"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/50">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </LiquidGlass>
    </ExpandableWidget>
  );
}
