"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import {
  Copy,
  Sparkles,
  BookOpen,
  Compass,
  Sun,
  Moon,
  Home,
  RotateCw,
  Share2,
  LucideIcon,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

export type RadialMenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  action: () => void;
};

type Point = { x: number; y: number };

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function polarToCartesian(radius: number, angleDeg: number): Point {
  const rad = degToRad(angleDeg);
  return {
    x: Math.cos(rad) * radius,
    y: Math.sin(rad) * radius,
  };
}

function slicePath(
  index: number,
  total: number,
  wedgeRadius: number,
  innerRadius: number
) {
  if (total <= 0) return "";
  const FULL_CIRCLE = 360;
  const START_ANGLE = -90;
  const anglePerSlice = FULL_CIRCLE / total;
  const midDeg = START_ANGLE + anglePerSlice * index;
  const halfSlice = anglePerSlice / 2;

  const startDeg = midDeg - halfSlice;
  const endDeg = midDeg + halfSlice;

  const outerStart = polarToCartesian(wedgeRadius, startDeg);
  const outerEnd = polarToCartesian(wedgeRadius, endDeg);
  const innerStart = polarToCartesian(innerRadius, startDeg);
  const innerEnd = polarToCartesian(innerRadius, endDeg);

  const largeArcFlag = anglePerSlice > 180 ? 1 : 0;

  return `
    M ${outerStart.x} ${outerStart.y}
    A ${wedgeRadius} ${wedgeRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}
    L ${innerEnd.x} ${innerEnd.y}
    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}
    Z
  `;
}

interface GlobalRadialContextMenuProps {
  children: React.ReactNode;
}

export function GlobalRadialContextMenu({ children }: GlobalRadialContextMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const size = 240;
  const iconSize = 16;
  const bandWidth = 50;
  const innerGap = 6;
  const outerGap = 6;
  const outerRingWidth = 10;

  const radius = size / 2;
  const outerRingOuterRadius = radius;
  const outerRingInnerRadius = outerRingOuterRadius - outerRingWidth;
  const wedgeOuterRadius = outerRingInnerRadius - outerGap;
  const wedgeInnerRadius = wedgeOuterRadius - bandWidth;
  const iconRingRadius = (wedgeOuterRadius + wedgeInnerRadius) / 2;
  const centerRadius = Math.max(wedgeInnerRadius - innerGap, 0);

  // If on /app, the app page has its own specialized chat radial menu.
  // On all other pages (or outside chat context), global menu activates!
  const isAppPage = pathname?.startsWith("/app");

  const menuItems: RadialMenuItem[] = useMemo(() => {
    return [
      {
        id: "copy",
        label: "Copy Text / Link",
        icon: Copy,
        action: async () => {
          try {
            const selectedText = window.getSelection()?.toString()?.trim();
            if (selectedText) {
              await navigator.clipboard.writeText(selectedText);
              setCopiedNotification("Text Copied");
            } else {
              await navigator.clipboard.writeText(window.location.href);
              setCopiedNotification("Page Link Copied");
            }
            setTimeout(() => setCopiedNotification(null), 2000);
          } catch (e) {
            console.error("Clipboard copy error:", e);
          }
        },
      },
      {
        id: "app",
        label: "Ask AI Dialogue",
        icon: Sparkles,
        action: () => router.push("/app"),
      },
      {
        id: "sources",
        label: "Scripture Sources",
        icon: BookOpen,
        action: () => router.push("/sources"),
      },
      {
        id: "dilemmas",
        label: "Daily Dilemmas",
        icon: Compass,
        action: () => router.push("/dilemmas"),
      },
      {
        id: "theme",
        label: isDark ? "Light Mode" : "Dark Mode",
        icon: isDark ? Sun : Moon,
        action: () => setTheme(isDark ? "light" : "dark"),
      },
      {
        id: "home",
        label: "Go Home",
        icon: Home,
        action: () => router.push("/"),
      },
    ];
  }, [isDark, router, setTheme]);

  const slice = 360 / menuItems.length;

  const handleGlobalContextMenu = (e: MouseEvent) => {
    // If inside /app, let the app page's own specific radial menu take precedence
    if (isAppPage) return;

    // Prevent default right-click browser menu
    e.preventDefault();

    // Toggle close if already open
    if (position !== null) {
      closeMenu();
      return;
    }

    // Clamp coordinates within window bounds
    const x = Math.min(Math.max(e.clientX, radius + 15), window.innerWidth - radius - 15);
    const y = Math.min(Math.max(e.clientY, radius + 15), window.innerHeight - radius - 15);
    setPosition({ x, y });
    setActiveIndex(null);
  };

  const closeMenu = () => {
    setPosition(null);
    setActiveIndex(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    window.addEventListener("contextmenu", handleGlobalContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleGlobalContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [position, isAppPage, radius]);

  return (
    <>
      {children}

      <AnimatePresence>
        {position && !isAppPage && (
          <>
            {/* Transparent backdrop to dismiss */}
            <div
              className="fixed inset-0 z-[99990] cursor-default"
              onClick={closeMenu}
              onContextMenu={(e) => {
                e.preventDefault();
                closeMenu();
              }}
            />

            {/* Radial Menu positioned at click coordinates */}
            <div
              style={{
                position: "fixed",
                left: position.x - radius,
                top: position.y - radius,
                width: size,
                height: size,
              }}
              className="z-[99995] pointer-events-auto select-none font-sans"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.4, rotate: -25 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.4, rotate: 20 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={cn(
                  "relative size-full rounded-full shadow-2xl backdrop-blur-2xl overflow-hidden transition-colors border",
                  isDark
                    ? "bg-[#1A1816]/95 border-[#E06D43]/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
                    : "bg-[#FAF7F2]/95 border-[#C25E38]/40 shadow-[0_10px_35px_rgba(194,94,56,0.15)]"
                )}
              >
                <svg
                  className="absolute inset-0 size-full"
                  viewBox={`${-radius} ${-radius} ${radius * 2} ${radius * 2}`}
                >
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const midDeg = -90 + slice * index;
                    const { x: iconX, y: iconY } = polarToCartesian(
                      iconRingRadius,
                      midDeg
                    );
                    const ICON_BOX = iconSize * 2.4;
                    const isActive = activeIndex === index;

                    return (
                      <g
                        key={item.id}
                        className="cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeMenu();
                          item.action();
                        }}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        {/* Outer accent ring slice */}
                        <motion.path
                          d={slicePath(
                            index,
                            menuItems.length,
                            outerRingOuterRadius,
                            outerRingInnerRadius
                          )}
                          className={cn(
                            "transition-colors duration-150",
                            isActive
                              ? isDark ? "fill-[#E06D43]" : "fill-[#C25E38]"
                              : isDark ? "fill-[#38332E]/80" : "fill-[#DFD5C6]/80"
                          )}
                        />

                        {/* Wedge slice */}
                        <motion.path
                          d={slicePath(
                            index,
                            menuItems.length,
                            wedgeOuterRadius,
                            wedgeInnerRadius
                          )}
                          className={cn(
                            "transition-colors duration-150 stroke-1",
                            isDark ? "stroke-[#38332E]/90" : "stroke-[#DFD5C6]/90",
                            isActive
                              ? isDark ? "fill-[#E06D43]" : "fill-[#C25E38]"
                              : isDark ? "fill-[#262320]" : "fill-[#EFE9DF]"
                          )}
                        />

                        {/* Icon Container */}
                        <foreignObject
                          x={iconX - ICON_BOX / 2}
                          y={iconY - ICON_BOX / 2}
                          width={ICON_BOX}
                          height={ICON_BOX}
                          className="pointer-events-none"
                        >
                          <div
                            className={cn(
                              "size-full flex flex-col items-center justify-center rounded-full transition-all duration-150",
                              isActive
                                ? "text-white scale-110"
                                : isDark
                                  ? "text-[#D4C7B8] opacity-80 group-hover:opacity-100"
                                  : "text-[#5C4F45] opacity-80 group-hover:opacity-100"
                            )}
                          >
                            <Icon style={{ height: iconSize, width: iconSize }} />
                          </div>
                        </foreignObject>
                      </g>
                    );
                  })}

                  {/* Center hub */}
                  <circle
                    cx={0}
                    cy={0}
                    r={centerRadius}
                    className={cn(
                      "stroke-1",
                      isDark
                        ? "fill-[#141211] stroke-[#38332E]"
                        : "fill-[#FAF7F2] stroke-[#DFD5C6]"
                    )}
                  />

                  {/* Center text / label display */}
                  <foreignObject
                    x={-centerRadius}
                    y={-centerRadius}
                    width={centerRadius * 2}
                    height={centerRadius * 2}
                    className="pointer-events-none"
                  >
                    <div className="size-full flex items-center justify-center text-center p-1">
                      {activeIndex !== null ? (
                        <span className={cn(
                          "text-[10px] font-sans font-bold leading-tight truncate max-w-full px-1",
                          isDark ? "text-[#E06D43]" : "text-[#C25E38]"
                        )}>
                          {menuItems[activeIndex]?.label}
                        </span>
                      ) : (
                        <span className={cn(
                          "text-sm font-serif font-bold",
                          isDark ? "text-[#E06D43]" : "text-[#C25E38]"
                        )}>
                          ॐ
                        </span>
                      )}
                    </div>
                  </foreignObject>
                </svg>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Subtle Copied Notification Toast */}
      <AnimatePresence>
        {copiedNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[99999] px-4 py-2.5 rounded-2xl bg-[#262320] text-white text-xs font-sans font-bold shadow-2xl flex items-center gap-2 border border-white/10"
          >
            <Check className="w-4 h-4 text-[#E06D43]" />
            <span>{copiedNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
