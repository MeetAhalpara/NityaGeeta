"use client";

/**
 * TextAnimate — MagicUI-compatible text animation component.
 *
 * Matches the @magicui/text-animate API exactly so you can swap it
 * for the official package later if needed.
 *
 * Uses motion/react v12 (already installed). No new dependencies.
 *
 * Usage:
 *   <TextAnimate animation="blurInUp" by="word" once>
 *     Your text here
 *   </TextAnimate>
 */

import { motion, useInView, type Variants } from "motion/react";
import { useRef, type ElementType } from "react";
import { cn } from "@/lib/utils";

// ── Animation presets ─────────────────────────────────────────────────────────

type AnimationVariant =
  | "blurInUp"
  | "blurIn"
  | "fadeIn"
  | "fadeInUp"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "scaleUp"
  | "scaleDown";

const PRESETS: Record<AnimationVariant, Variants> = {
  blurInUp: {
    hidden: { opacity: 0, filter: "blur(8px)", y: 10 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
  blurIn: {
    hidden: { opacity: 0, filter: "blur(8px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  scaleDown: {
    hidden: { opacity: 0, scale: 1.2 },
    visible: { opacity: 1, scale: 1 },
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────

type SplitBy = "text" | "word" | "character" | "line";

type AsElement =
  | "p" | "span" | "div"
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "li" | "article" | "section";

interface TextAnimateProps {
  children: string;
  /** Animation preset */
  animation?: AnimationVariant;
  /** How to split the text */
  by?: SplitBy;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Duration of each segment (seconds) */
  duration?: number;
  /** Stagger between segments (seconds) — auto-computed if omitted */
  stagger?: number;
  /** Custom motion variants (overrides animation preset) */
  variants?: Variants;
  /** HTML element to render */
  as?: AsElement;
  /** Class on the container */
  className?: string;
  /** Class on each animated segment */
  segmentClassName?: string;
  /** Trigger animation when entering viewport */
  startOnView?: boolean;
  /** Only animate once */
  once?: boolean;
  /** Screen-reader label */
  accessible?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TextAnimate({
  children,
  animation = "blurInUp",
  by = "word",
  delay = 0,
  duration = 0.3,
  stagger,
  variants,
  as = "p",
  className,
  segmentClassName,
  startOnView = true,
  once = false,
  accessible = true,
}: TextAnimateProps) {
  const containerRef = useRef<HTMLElement>(null);
  const inView = useInView(containerRef, { once, amount: 0.2 });

  const segmentVariants = variants ?? PRESETS[animation];

  // ── Split text into segments ──────────────────────────────────────────────
  let segments: string[] = [];
  if (by === "character") {
    segments = children.split("");
  } else if (by === "word") {
    segments = children.split(/(\s+)/); // keeps spaces as segments
  } else if (by === "line") {
    segments = children.split("\n");
  } else {
    // "text" — animate the whole string as one segment
    segments = [children];
  }

  // Auto stagger based on split type
  const autoStagger = stagger ?? (
    by === "character" ? 0.025 :
    by === "word"      ? 0.04  :
    by === "line"      ? 0.1   : 0
  );

  // ── Container variants (stagger children) ────────────────────────────────
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: autoStagger,
      },
    },
  };

  const shouldAnimate = startOnView ? inView : true;

  const Container = motion[as as keyof typeof motion] as typeof motion.p;

  return (
    <Container
      ref={containerRef as React.Ref<HTMLParagraphElement>}
      aria-label={accessible ? children : undefined}
      variants={containerVariants}
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
      className={cn("inline", className)}
    >
      {segments.map((segment, i) => {
        // Pure whitespace — render as-is without animating
        if (/^\s+$/.test(segment)) {
          return <span key={i} aria-hidden={accessible}>{segment}</span>;
        }

        return (
          <motion.span
            key={i}
            aria-hidden={accessible}
            variants={segmentVariants}
            transition={{ duration, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn("inline-block", segmentClassName)}
          >
            {segment}
            {/* Add space after words when splitting by word */}
            {by === "word" && i < segments.length - 1 && !/^\s/.test(segments[i + 1] ?? "") ? "\u00a0" : ""}
          </motion.span>
        );
      })}
    </Container>
  );
}
