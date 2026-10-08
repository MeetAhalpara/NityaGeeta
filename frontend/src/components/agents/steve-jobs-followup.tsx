"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, Sparkles, ArrowRight } from "lucide-react";

export interface SteveJobsPathway {
  id: string;
  icon: string;
  label: string;
  prompt: string;
  description: string;
}

export interface SteveJobsFollowUpProps {
  resonanceCheck: string;
  pathways: SteveJobsPathway[];
  onSelectPathway: (prompt: string) => void;
}

export const SteveJobsFollowUp: React.FC<SteveJobsFollowUpProps> = ({
  resonanceCheck,
  pathways,
  onSelectPathway,
}) => {
  if (!pathways || pathways.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-6 pt-5 border-t border-[#C25E38]/20 dark:border-[#C25E38]/30 space-y-4"
    >
      {/* 1. The Human Resonance Check */}
      <div className="flex items-center gap-2 text-sm font-serif italic text-stone-700 dark:text-stone-300">
        <Sparkles className="w-4 h-4 text-[#C25E38] flex-shrink-0" />
        <span>{resonanceCheck}</span>
      </div>

      <div className="text-xs uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
        <Compass className="w-3.5 h-3.5 text-[#C25E38]" />
        <span>Where would you like to go next?</span>
      </div>

      {/* 2. The 3 Distinct Guided Pathways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {pathways.map((pathway, idx) => (
          <motion.button
            key={pathway.id || idx}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectPathway(pathway.prompt)}
            className="flex flex-col justify-between text-left p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 hover:border-[#C25E38]/60 hover:bg-stone-50 dark:hover:bg-stone-800/80 transition-all duration-200 group shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base select-none">{pathway.icon}</span>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-100 group-hover:text-[#C25E38] transition-colors line-clamp-1">
                  {pathway.label}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2">
                {pathway.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] font-medium text-[#C25E38]">
              <span className="line-clamp-1 opacity-90">{pathway.prompt}</span>
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 group-hover:translate-x-1 transition-transform ml-1" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
