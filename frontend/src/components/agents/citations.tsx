"use client";

import React, { useState, useRef } from "react";
import { ExternalLink, BookOpen, ChevronDown, Quote, Link2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CitationItem {
  id: string;
  title: string;
  domain?: string;
  url?: string;
  source?: string;
  page?: number;
  chapter?: string;
  verse?: string;
  snippet?: string;
  quote?: string;
  priority?: number;
}

function getSafeCitationUrl(rawUrl?: string): { url: string; isExternal: boolean } {
  if (!rawUrl) return { url: "/sources", isExternal: false };
  try {
    const parsed = new URL(rawUrl);
    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";
    const isGoogleStorage =
      parsed.hostname === "storage.googleapis.com" ||
      parsed.hostname.endsWith(".storage.googleapis.com");
    if (isHttp && !isGoogleStorage) {
      return {
        url: parsed.origin + parsed.pathname + parsed.search + parsed.hash,
        isExternal: true,
      };
    }
  } catch {
    // Malformed URL
  }
  return { url: "/sources", isExternal: false };
}

interface CitationProps {
  citationId: string;
  index: number;
  idPrefix?: string;
  citation?: CitationItem;
  className?: string;
}

/**
 * In-text interactive citation pill with hover popover preview
 */
export function Citation({
  citationId,
  index,
  idPrefix = "source",
  citation,
  className,
}: CitationProps) {
  const [isHovered, setIsHovered] = useState(false);
  const elementId = `${idPrefix}-cite-${citationId}-${index}`;

  return (
    <span
      className="relative inline-block align-baseline mx-0.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        id={elementId}
        type="button"
        onClick={() => {
          if (citation?.url) {
            window.open(citation.url, "_blank", "noopener,noreferrer");
          }
        }}
        className={cn(
          "inline-flex items-center justify-center min-w-[1.25rem] h-[1.25rem] px-1.5 text-[10px] font-mono font-bold rounded-md transition-all cursor-pointer",
          "bg-[#C25E38]/10 hover:bg-[#C25E38]/20 text-[#C25E38] dark:bg-[#E06D43]/20 dark:hover:bg-[#E06D43]/30 dark:text-[#E06D43] border border-[#C25E38]/20 dark:border-[#E06D43]/30",
          "hover:scale-105 active:scale-95 select-none focus:outline-none focus:ring-1 focus:ring-[#C25E38]",
          className
        )}
        aria-label={`Source citation ${index}${citation?.title ? `: ${citation.title}` : ""}`}
      >
        {index}
      </button>

      {/* Hover preview tooltip */}
      <AnimatePresence>
        {isHovered && citation && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] shadow-2xl z-50 text-left font-sans pointer-events-auto block whitespace-normal"
          >
            <span className="flex items-start justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43]">
                Citation [{index}]
              </span>
              {citation.domain && (
                <span className="text-[10px] font-mono text-[#8C7B70] dark:text-[#A89F91] truncate max-w-[120px]">
                  {citation.domain}
                </span>
              )}
            </span>

            <span className="block text-xs font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] line-clamp-2 mb-1">
              {citation.title}
            </span>

            {(citation.verse || citation.chapter) && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-[#C25E38] dark:text-[#E06D43] mb-1.5">
                <BookOpen className="w-3 h-3 shrink-0" />
                <span>
                  {citation.chapter && `Chapter ${citation.chapter}`}
                  {citation.chapter && citation.verse && " • "}
                  {citation.verse && `Verse ${citation.verse}`}
                  {citation.page && ` (Page ${citation.page})`}
                </span>
              </span>
            )}

            {(citation.quote || citation.snippet) && (
              <span className="block text-[11px] text-[#5C4F45] dark:text-[#D4C7B8] italic line-clamp-3 bg-[#EFE9DF]/60 dark:bg-[#1C1917]/60 p-2 rounded-lg border border-[#DFD5C6]/50 dark:border-[#38332E]/50 mb-2 leading-relaxed">
                &ldquo;{citation.quote || citation.snippet}&rdquo;
              </span>
            )}

            {citation.url && (() => {
              const { url: safeUrl, isExternal } = getSafeCitationUrl(citation.url);
              return (
                <a
                  href={safeUrl}
                  target={isExternal ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C25E38] dark:text-[#E06D43] hover:underline"
                >
                  <span>{citation.domain ? `Source: ${citation.domain}` : "View in Vedic Library"}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              );
            })()}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

interface CitationsProps {
  citations: CitationItem[];
  idPrefix?: string;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Expandable / Collapsible Sources & Bibliography drawer
 */
export function Citations({
  citations,
  idPrefix = "source",
  defaultOpen = false,
  className,
}: CitationsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!citations || citations.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#DFD5C6] dark:border-[#38332E] bg-[#EFE9DF]/40 dark:bg-[#262320]/40 overflow-hidden font-sans text-xs transition-all",
        className
      )}
    >
      {/* Header / Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#EFE9DF]/80 dark:hover:bg-[#262320]/80 transition cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-[#C25E38] dark:text-[#E06D43]" />
          <span className="font-bold text-[#2D2622] dark:text-[#F5F2EB]">
            Sources & Citations
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43]">
            {citations.length}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[#8C7B70] dark:text-[#A89F91] text-[11px]">
          <span>{isOpen ? "Hide" : "Show"}</span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Expanded Citations List */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[#DFD5C6] dark:border-[#38332E]"
          >
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {citations.map((cite, idx) => (
                <div
                  key={cite.id || `${idPrefix}-${idx}`}
                  className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#DFD5C6] dark:border-[#38332E] hover:border-[#C25E38]/40 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43]">
                        [{idx + 1}]
                      </span>
                      {cite.domain && (
                        <span className="text-[10px] font-mono text-[#8C7B70] dark:text-[#A89F91] truncate">
                          {cite.domain}
                        </span>
                      )}
                    </div>

                    <h5 className="font-serif font-bold text-xs text-[#2D2622] dark:text-[#F5F2EB] mb-1 line-clamp-1">
                      {cite.title}
                    </h5>

                    {(cite.chapter || cite.verse) && (
                      <p className="text-[11px] text-[#C25E38] dark:text-[#E06D43] font-medium mb-1">
                        {cite.chapter && `Chapter ${cite.chapter}`}
                        {cite.chapter && cite.verse && " • "}
                        {cite.verse && `Verse ${cite.verse}`}
                        {cite.page && ` (p. ${cite.page})`}
                      </p>
                    )}

                    {(cite.quote || cite.snippet) && (
                      <p className="text-[11px] text-[#5C4F45] dark:text-[#D4C7B8] italic line-clamp-2 leading-tight mb-2">
                        &ldquo;{cite.quote || cite.snippet}&rdquo;
                      </p>
                    )}
                  </div>

                  {cite.url && (() => {
                    const { url: safeUrl, isExternal } = getSafeCitationUrl(cite.url);
                    return (
                      <div className="pt-2 border-t border-[#DFD5C6]/40 dark:border-[#38332E]/40 flex justify-end">
                        <a
                          href={safeUrl}
                          target={isExternal ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C25E38] dark:text-[#E06D43] hover:underline"
                        >
                          <span>{cite.domain ? `Source: ${cite.domain}` : "Open in Vedic Library"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
