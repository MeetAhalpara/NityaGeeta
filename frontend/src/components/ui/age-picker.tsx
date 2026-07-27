"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronDown } from "lucide-react";

// ── Layout constants ──────────────────────────────────────────────
const ITEM_H   = 44;
const ITEM_GAP = 5;
const STRIDE   = ITEM_H + ITEM_GAP;
const VISIBLE  = 3;                          // must be odd
const CENTER   = Math.floor(VISIBLE / 2);    // = 1
const DRUM_H   = STRIDE * VISIBLE - ITEM_GAP;

const MIN_AGE = 18;
const MAX_AGE = 100;
const AGES    = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);

interface AgePickerProps {
  value: string;
  onChange: (age: string) => void;
}

export function AgePicker({ value, onChange }: AgePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef    = useRef<HTMLDivElement>(null);
  const drumRef         = useRef<HTMLDivElement>(null);
  const isDragging      = useRef(false);
  const dragStart       = useRef(0);
  const wheelTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Motion value drives the entire drum position ──────────────────
  const offsetY = useMotionValue(0);

  // Live fractional index derived directly from offsetY — no React state lag
  const liveIndex = useTransform(offsetY, (y) =>
    Math.max(0, Math.min(AGES.length - 1, -y / STRIDE))
  );

  const indexToOffset = (idx: number) => -idx * STRIDE;

  // The index we committed via onChange (React state boundary)
  const selectedAge   = value ? parseInt(value, 10) : MIN_AGE;
  const clampedAge    = Math.min(MAX_AGE, Math.max(MIN_AGE, isNaN(selectedAge) ? MIN_AGE : selectedAge));
  const selectedIndex = clampedAge - MIN_AGE;

  // ── Snap to nearest integer index ────────────────────────────────
  const snap = useCallback((fromOffset: number) => {
    const raw = -fromOffset / STRIDE;
    const idx = Math.round(Math.max(0, Math.min(AGES.length - 1, raw)));
    animate(offsetY, indexToOffset(idx), {
      type: "spring",
      stiffness: 380,
      damping: 36,
      // Cancel any in-flight animation first
      velocity: 0,
    });
    onChange(String(MIN_AGE + idx));
  }, [offsetY, onChange]); // eslint-disable-line

  // Jump to current value when drum opens (no animation)
  useEffect(() => {
    if (open) {
      // Use stop() to abort any in-flight spring before setting
      offsetY.stop?.();
      offsetY.set(indexToOffset(selectedIndex));
    }
  }, [open]); // intentionally only on open change

  // ── Mouse wheel ───────────────────────────────────────────────────
  useEffect(() => {
    const el = drumRef.current;
    if (!el || !open) return;

    const MIN_OFFSET = indexToOffset(AGES.length - 1);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Stop any running spring so we read the true visual position
      offsetY.stop?.();
      const next = offsetY.get() - e.deltaY * 0.55;
      offsetY.set(Math.max(MIN_OFFSET, Math.min(0, next)));

      if (wheelTimer.current) clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => snap(offsetY.get()), 130);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (wheelTimer.current) clearTimeout(wheelTimer.current);
    };
  }, [open, snap, offsetY]);

  // ── Pointer drag ──────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    offsetY.stop?.();
    isDragging.current = true;
    dragStart.current  = e.clientY - offsetY.get();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const MIN_OFFSET = indexToOffset(AGES.length - 1);
    const next = e.clientY - dragStart.current;
    offsetY.set(Math.max(MIN_OFFSET, Math.min(0, next)));
  };

  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    snap(offsetY.get());
  };

  // ── Outside-click close ───────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const displayValue = value ? `${value} yrs` : "Select age";

  return (
    <div ref={containerRef}>
      {/* Label */}
      <div className="mb-1.5">
        <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8]">
          Age
        </label>
      </div>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 bg-[#EFE9DF]/60 dark:bg-[#1C1917] border rounded-xl px-4 py-3 text-xs font-mono transition-colors
          ${open
            ? "border-[#C25E38] dark:border-[#E06D43]"
            : "border-[#DFD5C6] dark:border-[#38332E] hover:border-[#C25E38]/50 dark:hover:border-[#E06D43]/50"
          }
          ${value ? "text-[#2D2622] dark:text-[#F5F2EB]" : "text-[#8C7B70] dark:text-[#A89F91]"}
        `}
      >
        <span>{displayValue}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="w-3.5 h-3.5 text-[#8C7B70] dark:text-[#A89F91]" />
        </motion.span>
      </button>

      {/* Drum */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -4 }}
            animate={{ height: DRUM_H, opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="mt-1.5 rounded-2xl border border-[#DFD5C6] dark:border-[#38332E] bg-[#EFE9DF]/60 dark:bg-[#1C1917] overflow-hidden relative"
            style={{ height: DRUM_H }}
          >
            {/* Fixed centre highlight bar */}
            <div
              className="pointer-events-none absolute inset-x-2 z-20 rounded-xl border border-[#C25E38]/60 dark:border-[#E06D43]/55 bg-[#C25E38]/[0.10] dark:bg-[#E06D43]/[0.10]"
              style={{ top: CENTER * STRIDE, height: ITEM_H }}
            />

            {/* Drag surface */}
            <div
              ref={drumRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="absolute inset-0 overflow-hidden"
              style={{ cursor: "grab", touchAction: "none", userSelect: "none" }}
            >
              {/* Moving list */}
              <motion.div
                style={{ y: offsetY, paddingTop: CENTER * STRIDE }}
                className="absolute inset-x-2 top-0"
              >
                {AGES.map((age, idx) => {
                  // Each row reads liveIndex directly from the motion value —
                  // no React re-render needed, so opacity/scale are always in
                  // sync with the physical position of the list.
                  return (
                    <AgeRow
                      key={age}
                      age={age}
                      idx={idx}
                      liveIndex={liveIndex}
                      itemH={ITEM_H}
                      onSelect={() => {
                        animate(offsetY, indexToOffset(idx), {
                          type: "spring", stiffness: 380, damping: 36,
                        });
                        onChange(String(age));
                        setTimeout(() => setOpen(false), 210);
                      }}
                    />
                  );
                })}
              </motion.div>
            </div>

            {/* Top / bottom colour fades */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-10 rounded-t-2xl"
              style={{ height: "30%", background: "linear-gradient(to bottom, var(--drum-bg) 0%, transparent 100%)" }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 rounded-b-2xl"
              style={{ height: "30%", background: "linear-gradient(to top, var(--drum-bg) 0%, transparent 100%)" }}
            />
            <style>{`:root{--drum-bg:#EDE8DF}.dark{--drum-bg:#1C1917}`}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Separate component so useTransform subscribes per-row ─────────
// This avoids re-rendering the whole list; each row reacts independently
// to the liveIndex motion value.
function AgeRow({
  age, idx, liveIndex, itemH, onSelect,
}: {
  age: number;
  idx: number;
  liveIndex: ReturnType<typeof useTransform>;
  itemH: number;
  onSelect: () => void;
}) {
  const opacity = useTransform(liveIndex, (li: number) => {
    const dist = Math.abs(li - idx);
    if (dist < 0.5) return 1;
    if (dist < 1.5) return 1 - (dist - 0.5) * 0.6;   // 1 → 0.4 across the ±1 slot
    return 0.18;
  });

  const scale = useTransform(liveIndex, (li: number) => {
    const dist = Math.abs(li - idx);
    if (dist < 0.5) return 1;
    if (dist < 1.5) return 1 - (dist - 0.5) * 0.08;  // 1 → 0.92
    return 0.88;
  });

  // Colour: terracotta when selected, muted otherwise
  const isSelected = useTransform(liveIndex, (li: number) => Math.abs(li - idx) < 0.5);
  const [selected, setSelected] = useState(false);
  useEffect(() => isSelected.on("change", setSelected), [isSelected]);

  return (
    <motion.div
      onClick={onSelect}
      style={{ opacity, scale, height: itemH, cursor: "pointer" }}
      className={`flex items-center justify-center rounded-xl font-mono font-semibold select-none mb-[5px] last:mb-0
        ${selected
          ? "text-[#C25E38] dark:text-[#E06D43] text-base"
          : "text-[#5C4F45] dark:text-[#A89F91] text-sm"
        }
      `}
    >
      {age}
    </motion.div>
  );
}
