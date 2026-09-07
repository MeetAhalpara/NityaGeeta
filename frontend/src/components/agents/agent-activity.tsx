"use client";

import React, { useState, useEffect, useRef, useId, ReactNode } from "react";
import {
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Clock,
  Search,
  Terminal,
  FileText,
  FileCode,
  PenTool,
  BrainCircuit,
  Loader2,
  ExternalLink,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AgentSearchResult {
  id: string;
  title: string;
  domain?: string;
  url?: string;
  icon?: ReactNode;
}

export type AgentActivityItem =
  | {
      id: string;
      type: "text";
      content: string;
    }
  | {
      id: string;
      type: "step";
      label: string;
      status?: "active" | "complete" | "pending";
      meta?: string;
    }
  | {
      id: string;
      type: "search";
      query: string;
      results?: AgentSearchResult[];
      moreCount?: number;
    }
  | {
      id: string;
      type: "tool";
      action: "read" | "edit" | "run" | "search" | string;
      target: string;
      additions?: number;
      deletions?: number;
    }
  | {
      id: string;
      type: "trace";
      kind: "thinking" | "message" | "write" | "run" | "read";
      label: string;
      detail?: string;
    };

export interface AgentActivityProps {
  items: AgentActivityItem[];
  contentType?: "step" | "text" | "search" | "tool" | "trace" | "mixed";
  status?: "working" | "complete";
  duration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  collapseOnComplete?: boolean;
  activeLabel?: ReactNode;
  summary?: ReactNode;
  renderWorkingStatus?: (context: { label: ReactNode; duration: number }) => ReactNode;
  renderCompletedStatus?: (context: { summary: ReactNode; duration: number }) => ReactNode;
  maxHeight?: number;
  className?: string;
  contentClassName?: string;
}

/**
 * AgentActivity: Adaptive activity stream for AI reasoning, searches, tool calls, and execution traces.
 */
export function AgentActivity({
  items = [],
  contentType = "mixed",
  status = "working",
  duration = 0,
  open,
  defaultOpen = false,
  onOpenChange,
  collapseOnComplete = true,
  activeLabel,
  summary,
  renderWorkingStatus,
  renderCompletedStatus,
  maxHeight = 220,
  className,
  contentClassName,
}: AgentActivityProps) {
  const isControlled = open !== undefined;
  // If all step items are already complete and none active, infer complete status to prevent runaway timer
  const allStepsComplete = items.length > 0 && items.every((i) => i.type !== "step" || i.status === "complete");
  const effectiveStatus = status === "working" && allStepsComplete && !items.some((i) => i.type === "step" && i.status === "active")
    ? "complete"
    : status;

  const [internalOpen, setInternalOpen] = useState(defaultOpen || effectiveStatus === "working");
  const isOpen = isControlled ? open : internalOpen;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(duration > 0 ? duration : (effectiveStatus === "complete" ? 1.2 : 0));

  const isWorking = effectiveStatus === "working";

  // Live timer when working
  useEffect(() => {
    if (!isWorking) {
      setElapsed(duration > 0 ? duration : 1.2);
      return;
    }
    const start = performance.now();
    const interval = setInterval(() => {
      setElapsed((performance.now() - start) / 1000 + duration);
    }, 100);
    return () => clearInterval(interval);
  }, [isWorking, duration]);

  // Handle auto-collapse when changing from working to complete
  useEffect(() => {
    if (status === "complete" && collapseOnComplete && !isControlled) {
      const timer = setTimeout(() => {
        setInternalOpen(false);
        onOpenChange?.(false);
      }, 400);
      return () => clearTimeout(timer);
    } else if (status === "working" && !isControlled) {
      setInternalOpen(true);
      onOpenChange?.(true);
    }
  }, [status, collapseOnComplete, isControlled, onOpenChange]);

  // Auto-scroll to bottom as new activity arrives while working
  useEffect(() => {
    if (isWorking && isOpen && viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [items, isWorking, isOpen]);

  const toggleOpen = () => {
    const nextState = !isOpen;
    if (!isControlled) {
      setInternalOpen(nextState);
    }
    onOpenChange?.(nextState);
  };

  // Derive default status labels
  const currentStep = items.filter((i) => i.type === "step" && i.status === "active").pop();
  const defaultWorkingLabel =
    activeLabel || (currentStep && "label" in currentStep ? currentStep.label : "Synthesizing Vedic wisdom…");

  const completedStepCount = items.filter((i) => i.type === "step").length;
  const searchCount = items.filter((i) => i.type === "search").length;
  const toolCount = items.filter((i) => i.type === "tool" || i.type === "trace").length;

  const defaultSummary = summary || (
    <span>
      Synthesized in {elapsed > 0 ? elapsed.toFixed(1) : "0.8"}s
      {completedStepCount > 0 && ` • ${completedStepCount} steps`}
      {searchCount > 0 && ` • ${searchCount} searches`}
      {toolCount > 0 && ` • ${toolCount} citations & references`}
    </span>
  );

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#DFD5C6] dark:border-[#38332E] bg-[#EFE9DF]/50 dark:bg-[#262320]/50 overflow-hidden font-sans text-xs transition-all shadow-sm",
        className
      )}
    >
      {/* Header / Summary Status Bar */}
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2.5 text-left transition cursor-pointer select-none",
          isWorking
            ? "bg-[#FAF7F2]/90 dark:bg-[#1E1B18]/90 text-[#2D2622] dark:text-[#F5F2EB]"
            : "hover:bg-[#FAF7F2]/60 dark:hover:bg-[#1E1B18]/60 text-[#5C4F45] dark:text-[#D4C7B8]"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {isWorking ? (
            <div className="relative flex items-center justify-center w-4 h-4">
              <Loader2 className="w-4 h-4 animate-spin text-[#C25E38] dark:text-[#E06D43]" />
            </div>
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}

          <div className="text-xs font-semibold truncate text-[#2D2622] dark:text-[#F5F2EB]">
            {isWorking ? (
              renderWorkingStatus ? (
                renderWorkingStatus({ label: defaultWorkingLabel, duration: elapsed })
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="font-bold text-[#C25E38] dark:text-[#E06D43]">Thinking:</span>
                  <span className="truncate">{defaultWorkingLabel}</span>
                </span>
              )
            ) : renderCompletedStatus ? (
              renderCompletedStatus({ summary: defaultSummary, duration: elapsed })
            ) : (
              defaultSummary
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#8C7B70] dark:text-[#A89F91] text-[11px] shrink-0 ml-2">
          {isWorking && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#C25E38]/10 text-[#C25E38] dark:bg-[#E06D43]/20 dark:text-[#E06D43]">
              {elapsed.toFixed(1)}s
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Activity Timeline Viewport */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[#DFD5C6] dark:border-[#38332E]"
          >
            <div
              ref={viewportRef}
              style={{ maxHeight: `${maxHeight}px` }}
              className={cn(
                "p-3.5 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-[#DFD5C6] dark:scrollbar-thumb-[#38332E]",
                contentClassName
              )}
            >
              {items.map((item, idx) => (
                <ActivityItemRow key={item.id || idx} item={item} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActivityItemRow({ item }: { item: AgentActivityItem }) {
  switch (item.type) {
    case "text":
      return (
        <div className="flex items-start gap-2 text-[11px] text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
          <BrainCircuit className="w-3.5 h-3.5 mt-0.5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />
          <p className="whitespace-pre-wrap font-sans">{item.content}</p>
        </div>
      );

    case "step":
      return (
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#DFD5C6]/60 dark:border-[#38332E]/60 text-[11px]">
          <div className="flex items-center gap-2 min-w-0">
            {item.status === "complete" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : item.status === "active" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C25E38] dark:text-[#E06D43] shrink-0" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-[#8C7B70] dark:text-[#A89F91] shrink-0" />
            )}
            <span
              className={cn(
                "truncate font-medium",
                item.status === "active"
                  ? "text-[#C25E38] dark:text-[#E06D43] font-bold"
                  : item.status === "complete"
                  ? "text-[#2D2622] dark:text-[#F5F2EB]"
                  : "text-[#8C7B70] dark:text-[#A89F91]"
              )}
            >
              {item.label}
            </span>
          </div>

          {item.meta && (
            <span className="text-[10px] font-mono text-[#8C7B70] dark:text-[#A89F91] px-1.5 py-0.5 rounded bg-[#EFE9DF] dark:bg-[#262320] shrink-0">
              {item.meta}
            </span>
          )}
        </div>
      );

    case "search":
      return (
        <div className="space-y-1.5 p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#DFD5C6]/60 dark:border-[#38332E]/60 text-[11px]">
          <div className="flex items-center gap-2 text-[#C25E38] dark:text-[#E06D43] font-mono text-[11px]">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold truncate">Query: &ldquo;{item.query}&rdquo;</span>
          </div>

          {item.results && item.results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-5">
              {item.results.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFE9DF]/60 dark:bg-[#262320]/60 border border-[#DFD5C6]/40 dark:border-[#38332E]/40 truncate text-[10px]"
                >
                  {res.icon || <FileText className="w-3 h-3 text-[#8C7B70]" />}
                  <span className="truncate text-[#2D2622] dark:text-[#F5F2EB] font-medium">
                    {res.title}
                  </span>
                  {res.domain && (
                    <span className="text-[9px] font-mono text-[#8C7B70] dark:text-[#A89F91] ml-auto shrink-0">
                      {res.domain}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {item.moreCount && (
            <div className="pl-5 text-[10px] font-mono text-[#8C7B70] dark:text-[#A89F91]">
              +{item.moreCount} more verified Vedic sources
            </div>
          )}
        </div>
      );

    case "tool":
      return (
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#DFD5C6]/60 dark:border-[#38332E]/60 text-[11px] font-mono">
          <div className="flex items-center gap-2 min-w-0">
            <Terminal className="w-3.5 h-3.5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />
            <span className="font-bold text-[#C25E38] dark:text-[#E06D43] uppercase text-[10px]">
              {item.action}
            </span>
            <span className="truncate text-[#2D2622] dark:text-[#F5F2EB]">
              {item.target}
            </span>
          </div>

          {(item.additions !== undefined || item.deletions !== undefined) && (
            <div className="flex items-center gap-1 text-[10px] shrink-0">
              {item.additions !== undefined && (
                <span className="text-emerald-600 font-bold">+{item.additions}</span>
              )}
              {item.deletions !== undefined && (
                <span className="text-red-600 font-bold">-{item.deletions}</span>
              )}
            </div>
          )}
        </div>
      );

    case "trace":
      return (
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#DFD5C6]/60 dark:border-[#38332E]/60 text-[11px]">
          <div className="flex items-center gap-2 min-w-0">
            {item.kind === "thinking" && <BrainCircuit className="w-3.5 h-3.5 text-[#C25E38] shrink-0" />}
            {item.kind === "write" && <PenTool className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
            {item.kind === "run" && <Terminal className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            {item.kind === "read" && <FileText className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
            {item.kind === "message" && <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}

            <span className="font-bold text-[#2D2622] dark:text-[#F5F2EB]">
              {item.label}
            </span>
            {item.detail && (
              <span className="text-[#8C7B70] dark:text-[#A89F91] truncate font-mono text-[10px]">
                {item.detail}
              </span>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}
