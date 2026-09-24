"use client";

import { type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-3 text-center space-y-1.5 select-none",
          className
        )}
      >
        {icon && (
          <div className="size-8 rounded-xl bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <p className="text-xs font-semibold text-ink-primary">{title}</p>
        {description && (
          <p className="text-[11px] text-ink-muted leading-tight max-w-[200px]">
            {description}
          </p>
        )}
        {action && <div className="pt-1.5">{action}</div>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-10 px-4 text-center max-w-sm mx-auto space-y-3.5 select-none",
        className
      )}
    >
      <div className="relative">
        <div className="size-14 rounded-2xl bg-gradient-to-b from-brand-terracotta/15 to-brand-terracotta/5 border border-brand-terracotta/20 flex items-center justify-center text-brand-terracotta shadow-xs">
          {icon || <Sparkles className="size-6 text-brand-terracotta" />}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-bold text-ink-primary tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-ink-muted leading-relaxed max-w-xs">
            {description}
          </p>
        )}
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
