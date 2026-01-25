"use client";

import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownProps {
  content: string;
}

export const Markdown = memo(({ content }: MarkdownProps) => {
  return (
    <div className="prose prose-sm prose-invert prose-p:leading-relaxed prose-pre:p-0 break-words max-w-none prose-p:my-1 prose-headings:my-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Custom render for code blocks
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match;

          return !isInline && match ? (
            <div className="rounded-lg overflow-hidden my-2 border border-white/10 shadow-lg">
              {/* Code block header */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-white/5">
                <span className="text-xs text-white/40 font-mono">{match[1]}</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500/30" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/30" />
                  <div className="w-2 h-2 rounded-full bg-green-500/30" />
                </div>
              </div>

              {/* Code content */}
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  background: "rgba(0, 0, 0, 0.5)",
                  padding: "0.75rem",
                  fontSize: "0.75rem",
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          ) : (
            // Inline code
            <code
              {...props}
              className="bg-white/10 text-cyan-300 rounded px-1 py-0.5 font-mono text-xs"
            >
              {children}
            </code>
          );
        },
        // Links open in new tab
        a: ({ ...props }) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          />
        ),
        // Compact lists
        ul: ({ ...props }) => (
          <ul {...props} className="list-disc pl-4 space-y-0.5 my-1" />
        ),
        ol: ({ ...props }) => (
          <ol {...props} className="list-decimal pl-4 space-y-0.5 my-1" />
        ),
        // Compact paragraphs
        p: ({ ...props }) => (
          <p {...props} className="my-1" />
        ),
        // Headers
        h1: ({ ...props }) => (
          <h1 {...props} className="text-lg font-bold my-2" />
        ),
        h2: ({ ...props }) => (
          <h2 {...props} className="text-base font-bold my-2" />
        ),
        h3: ({ ...props }) => (
          <h3 {...props} className="text-sm font-bold my-1" />
        ),
        // Horizontal rule
        hr: ({ ...props }) => (
          <hr {...props} className="border-white/10 my-2" />
        ),
        // Blockquote
        blockquote: ({ ...props }) => (
          <blockquote
            {...props}
            className="border-l-2 border-cyan-500/50 pl-3 my-2 text-white/70 italic"
          />
        ),
        // Strong/bold
        strong: ({ ...props }) => (
          <strong {...props} className="font-semibold text-white" />
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

Markdown.displayName = "Markdown";
