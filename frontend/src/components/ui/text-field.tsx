"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      className,
      containerClassName,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={cn("w-full space-y-1.5 text-left", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-ink-secondary select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-ink-muted shrink-0">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              "w-full h-10 rounded-xl bg-surface-elevated/70 border border-border-subtle px-3 text-xs text-ink-primary placeholder:text-ink-muted/80 transition-all outline-none",
              "focus:border-brand-terracotta focus:ring-2 focus:ring-brand-terracotta/20 focus:bg-surface-canvas",
              leftIcon && "pl-9",
              (rightIcon || error) && "pr-9",
              error &&
                "border-red-500/80 focus:border-red-500 focus:ring-red-500/20 text-red-900 dark:text-red-200",
              disabled &&
                "opacity-50 cursor-not-allowed bg-surface-elevated/30 select-none",
              className
            )}
            {...props}
          />

          {error ? (
            <div className="absolute right-3 flex items-center pointer-events-none text-red-500">
              <AlertCircle className="size-4" />
            </div>
          ) : rightIcon ? (
            <div className="absolute right-3 flex items-center text-ink-muted">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {error ? (
          <p id={errorId} className="text-[11px] text-red-500 font-medium pl-0.5">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-[11px] text-ink-muted pl-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

TextField.displayName = "TextField";
