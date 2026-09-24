"use client";

import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "terracotta"
  | "neutral"
  | "outline"
  | "success"
  | "warning";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  icon,
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    terracotta:
      "bg-brand-terracotta/12 text-brand-terracotta border border-brand-terracotta/25 font-semibold",
    neutral:
      "bg-surface-card text-ink-secondary border border-border-subtle font-medium",
    outline:
      "bg-transparent text-ink-primary border border-border-accent font-medium",
    success:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium",
    warning:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium",
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: "px-2 py-0.5 text-[10px] gap-1 rounded-md",
    md: "px-2.5 py-0.5 text-[11px] gap-1.5 rounded-lg",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center tracking-tight select-none transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
