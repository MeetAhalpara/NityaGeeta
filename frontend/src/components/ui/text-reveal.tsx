"use client";

import {
  useRef,
  type ComponentPropsWithoutRef,
  type FC,
  type ReactNode,
} from "react";
import { motion, MotionValue, useScroll, useTransform } from "motion/react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  children?: string;
  line1?: string;
  line2?: string;
  subtext?: string;
  citation?: string;
}

export const TextReveal: FC<TextRevealProps> = ({
  children,
  line1,
  line2,
  subtext,
  citation,
  className,
}) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "end 45%"],
  });

  const rawLine1 = line1 || (children ? children.split("\n")[0] : "");
  const rawLine2 = line2 || (children ? children.split("\n")[1] || "" : "");

  const wordsLine1 = rawLine1.trim().split(" ").filter(Boolean);
  const wordsLine2 = rawLine2.trim().split(" ").filter(Boolean);
  const totalWords = wordsLine1.length + wordsLine2.length;

  return (
    <div
      ref={sectionRef}
      className={cn(
        "relative z-0 w-full py-6 px-4 sm:px-6 text-center bg-transparent border-none shadow-none my-2",
        className
      )}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center text-center">
        {/* Subtle Decorative Golden Accent Badge */}
        {citation && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C25E38]/10 dark:bg-[#E06D43]/15 border border-[#C25E38]/25 dark:border-[#E06D43]/35 text-[#C25E38] dark:text-[#E06D43] text-xs font-sans font-bold tracking-widest uppercase mb-6 shadow-sm">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{citation}</span>
          </div>
        )}

        {/* Sacred Sanskrit Verse Text Reveal - Strictly 2 Lines */}
        <div className="w-full space-y-3 sm:space-y-4 font-serif font-bold tracking-wide">
          {/* LINE 1 */}
          <div className="flex flex-wrap justify-center text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] leading-tight">
            {wordsLine1.map((word, i) => {
              const globalIndex = i;
              const start = globalIndex / totalWords;
              const end = start + 1 / totalWords;
              return (
                <Word key={`l1-${i}`} progress={scrollYProgress} range={[start, end]}>
                  {word}
                </Word>
              );
            })}
          </div>

          {/* LINE 2 */}
          {wordsLine2.length > 0 && (
            <div className="flex flex-wrap justify-center text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] leading-tight">
              {wordsLine2.map((word, i) => {
                const globalIndex = wordsLine1.length + i;
                const start = globalIndex / totalWords;
                const end = start + 1 / totalWords;
                return (
                  <Word key={`l2-${i}`} progress={scrollYProgress} range={[start, end]}>
                    {word}
                  </Word>
                );
              })}
            </div>
          )}
        </div>

        {/* English Translation Subtext with Elegant Subtle Top Divider */}
        {subtext && (
          <div className="mt-8 pt-5 border-t border-[#C25E38]/20 dark:border-[#E06D43]/25 max-w-2xl mx-auto">
            <p className="text-base sm:text-lg text-[#5C4F45] dark:text-[#D4C7B8] font-serif italic leading-relaxed">
              "{subtext}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface WordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);

  return (
    <span className="relative mx-1 sm:mx-1.5 md:mx-2 inline-block">
      <span className="absolute left-0 top-0 opacity-20 text-[#2D2622] dark:text-[#F5F2EB] pointer-events-none select-none">
        {children}
      </span>
      <motion.span
        style={{ opacity }}
        className="relative text-[#C25E38] dark:text-[#E06D43] transform-gpu will-change-opacity"
      >
        {children}
      </motion.span>
    </span>
  );
};
