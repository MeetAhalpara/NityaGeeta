"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { EASE_IN_OUT } from "@/lib/ease";

export type LoaderVariant =
  | "spinner"
  | "dots"
  | "bars"
  | "dot-matrix"
  | "dither"
  | "ascii"
  | "ascii-line"
  | "ascii-braille"
  | "ascii-blocks"
  | "ascii-bounce"
  | "morph"
  | "comet"
  | "scramble"
  | "metaballs"
  | "newton"
  | "helix"
  | "percent";

const ASCII_SETS: Record<string, string[]> = {
  ascii: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  "ascii-line": ["|", "/", "-", "\\"],
  "ascii-braille": ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"],
  "ascii-blocks": ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█", "▇", "▆", "▅", "▄", "▃", "▂"],
  "ascii-bounce": ["⠁", "⠂", "⠄", "⡀", "⢀", "⠠", "⠐", "⠈"],
};

export interface LoaderProps {
  variant?: LoaderVariant;
  size?: number;
  speed?: number;
  label?: string;
  className?: string;
}

const REDUCED = {
  animate: { opacity: [1, 0.4, 1] },
  transition: { duration: 1.4, ease: EASE_IN_OUT, repeat: Infinity },
};

export function Loader({
  variant = "ascii-line",
  size = 14,
  speed = 0.8,
  label = "Reasoning",
  className = "",
}: LoaderProps) {
  const reduce = useReducedMotion() ?? false;
  const frames = ASCII_SETS[variant] || ASCII_SETS["ascii-line"];
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const step = ((reduce ? speed * 2.5 : speed) / frames.length) * 1000;
    const id = setInterval(
      () => setFrame((f) => (f + 1) % frames.length),
      step
    );
    return () => clearInterval(id);
  }, [frames.length, speed, reduce]);

  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center font-mono text-[#C25E38] dark:text-[#E06D43] select-none ${className}`}
      style={{ fontSize: size, lineHeight: 1 }}
    >
      {frames[frame % frames.length]}
      <span className="sr-only">{label}</span>
    </span>
  );
}
