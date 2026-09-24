"use client";

import React from "react";
import { GitFork, ChevronRight, Layers, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TopicBreadcrumbProps {
  mainTopic: string;
  activeTangent?: string | null;
  className?: string;
  onPopTangent?: () => void;
}

export function TopicBreadcrumb({
  mainTopic,
  activeTangent,
  className,
  onPopTangent,
}: TopicBreadcrumbProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#EFE9DF]/60 dark:bg-[#262320]/60 border border-[#DFD5C6]/60 dark:border-[#38332E]/60 font-sans text-xs transition-all",
        className
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden truncate">
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] shrink-0">
          <Compass className="w-3 h-3" />
        </div>

        <div className="flex items-center gap-1.5 truncate text-[11px]">
          <span className="font-bold text-[#2D2622] dark:text-[#F5F2EB] truncate">
            {mainTopic}
          </span>

          {activeTangent && (
            <>
              <ChevronRight className="w-3 h-3 text-[#8C7B70] dark:text-[#A89F91] shrink-0" />
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#C25E38]/10 dark:bg-[#E06D43]/20 font-bold text-[#C25E38] dark:text-[#E06D43] truncate">
                <GitFork className="w-3 h-3" />
                <span>Tangent: {activeTangent}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {activeTangent && onPopTangent && (
        <button
          type="button"
          onClick={onPopTangent}
          className="ml-2 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#C25E38]/10 hover:bg-[#C25E38]/20 dark:bg-[#E06D43]/20 dark:hover:bg-[#E06D43]/30 text-[#C25E38] dark:text-[#E06D43] transition cursor-pointer shrink-0"
        >
          Return to Main
        </button>
      )}
    </div>
  );
}
