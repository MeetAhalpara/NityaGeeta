"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ChevronDown, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TangentSummaryItem {
  id: string;
  topicName: string;
  sutraSummary: string;
  turnCount?: number;
  shlokasCited?: string[];
  timestamp?: string;
}

export interface TangentAccordionProps {
  tangents: TangentSummaryItem[];
  className?: string;
}

export function TangentAccordion({ tangents, className }: TangentAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!tangents || tangents.length === 0) return null;

  return (
    <div className={cn("my-3 space-y-2 font-sans text-xs", className)}>
      {tangents.map((item) => {
        const isExpanded = expandedId === item.id;

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-[#DFD5C6] dark:border-[#38332E] bg-[#EFE9DF]/50 dark:bg-[#262320]/50 overflow-hidden transition-all shadow-sm"
          >
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#EFE9DF]/80 dark:hover:bg-[#262320]/80 transition cursor-pointer select-none"
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43]">
                  <RotateCcw className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-[#2D2622] dark:text-[#F5F2EB]">
                    Tangent Explored: {item.topicName}
                  </span>
                  {item.turnCount && (
                    <span className="ml-2 text-[10px] font-mono text-[#8C7B70] dark:text-[#A89F91]">
                      ({item.turnCount} turns squashed)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#8C7B70] dark:text-[#A89F91] text-[11px]">
                <span className="font-medium text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43]">
                  Sūtra Collapsed
                </span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              </div>
            </button>

            {/* Accordion Body */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-[#DFD5C6]/60 dark:border-[#38332E]/60 bg-[#FAF7F2] dark:bg-[#1E1B18] p-3.5"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43] shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-serif font-bold text-xs text-[#2D2622] dark:text-[#F5F2EB]">
                        Sūtra Summary Note
                      </h5>
                      <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed mt-0.5">
                        {item.sutraSummary}
                      </p>
                    </div>
                  </div>

                  {item.shlokasCited && item.shlokasCited.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#DFD5C6]/40 dark:border-[#38332E]/40 flex items-center gap-1.5 text-[11px] font-medium text-[#C25E38] dark:text-[#E06D43]">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>Scripture References: {item.shlokasCited.join(", ")}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
