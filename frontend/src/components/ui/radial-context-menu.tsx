"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { LucideIcon } from "lucide-react";
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

interface RadialContextMenuProps {
  children: React.ReactNode;
  menuItems: RadialMenuItem[];
  size?: number;
  iconSize?: number;
  bandWidth?: number;
  innerGap?: number;
  outerGap?: number;
  outerRingWidth?: number;
}

export function RadialContextMenu({
  children,
  menuItems,
  size = 230,
  iconSize = 16,
  bandWidth = 48,
  innerGap = 6,
  outerGap = 6,
  outerRingWidth = 10,
}: RadialContextMenuProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const radius = size / 2;
  const outerRingOuterRadius = radius;
  const outerRingInnerRadius = outerRingOuterRadius - outerRingWidth;
  const wedgeOuterRadius = outerRingInnerRadius - outerGap;
  const wedgeInnerRadius = wedgeOuterRadius - bandWidth;
  const iconRingRadius = (wedgeOuterRadius + wedgeInnerRadius) / 2;
  const centerRadius = Math.max(wedgeInnerRadius - innerGap, 0);

  const slice = 360 / menuItems.length;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Toggle close if already open
    if (position !== null) {
      closeMenu();
      return;
    }
    // Clamp coordinates to stay within window bounds
    const x = Math.min(Math.max(e.clientX, radius + 10), window.innerWidth - radius - 10);
    const y = Math.min(Math.max(e.clientY, radius + 10), window.innerHeight - radius - 10);
    setPosition({ x, y });
    setActiveIndex(null);
  };

  const closeMenu = () => {
    setPosition(null);
    setActiveIndex(null);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div onContextMenu={handleContextMenu} className="relative w-full h-full min-h-full flex flex-col flex-1">
      {children}

      <AnimatePresence>
        {position && (
          <>
            {/* Transparent backdrop for outside clicks */}
            <div
              className="fixed inset-0 z-[100] cursor-default"
              onClick={closeMenu}
              onContextMenu={(e) => {
                e.preventDefault();
                closeMenu();
              }}
            />

            {/* Radial Context Menu centered at right-click cursor location */}
            <div
              style={{
                position: "fixed",
                left: position.x - radius,
                top: position.y - radius,
                width: size,
                height: size,
              }}
              className="z-[101] pointer-events-auto select-none"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.4, rotate: 20 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={cn(
                  "relative size-full rounded-full shadow-2xl backdrop-blur-2xl overflow-hidden transition-colors border",
                  isDark
                    ? "bg-[#1A1816]/95 border-[#E06D43]/40"
                    : "bg-[#FAF7F2]/95 border-[#C25E38]/40"
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

                        {/* Icon & Label container */}
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
                                : isDark ? "text-[#D4C7B8] opacity-80 group-hover:opacity-100" : "text-[#5C4F45] opacity-80 group-hover:opacity-100"
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
    </div>
  );
}
