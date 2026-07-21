import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: React.ReactNode;
}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ children, text, icon, className, ...props }, ref) => {
  const content = children || text;

  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-auto cursor-pointer overflow-hidden rounded-xl border border-[#C25E38]/40 dark:border-[#E06D43]/50 bg-[#FAF7F2] dark:bg-[#262320] p-2.5 px-6 text-center font-sans font-semibold text-[#2D2622] dark:text-[#F5F2EB] shadow-md transition-all duration-250 ease-out active:scale-[0.98] flex items-center justify-center gap-2 transform-gpu will-change-transform",
        className
      )}
      {...props}
    >
      {/* Default Content with Pulsing Terracotta Dot */}
      <div className="flex items-center justify-center gap-2 transform-gpu transition-all duration-250 ease-out">
        <div className="bg-[#C25E38] dark:bg-[#E06D43] h-2.5 w-2.5 rounded-full transition-transform duration-300 ease-out group-hover:scale-[110] transform-gpu will-change-transform" />
        <span className="inline-block transition-all duration-250 ease-out group-hover:translate-x-3 group-hover:opacity-0 whitespace-nowrap font-sans font-semibold will-change-[transform,opacity]">
          {content}
        </span>
      </div>

      {/* Hover Content - Perfectly Centered with Snappy Instant Response */}
      <div className="text-white absolute inset-0 z-10 flex h-full w-full items-center justify-center gap-2 opacity-0 transition-all duration-250 ease-out translate-x-3 group-hover:translate-x-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transform-gpu will-change-[transform,opacity]">
        <span className="font-sans font-semibold">{content}</span>
        {icon || <ArrowRight className="w-4 h-4" />}
      </div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";
