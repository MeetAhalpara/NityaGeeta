"use client";

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Globe, ExternalLink, BookOpen, ChevronUp, ChevronDown, Info, Languages } from 'lucide-react';

export interface SourceItem {
  type?: string;
  source?: string;
  title?: string;
  snippet?: string;
  url?: string;
  priority?: number;
  page?: number;
  sanskrit?: string;
  translation?: string;
}

export interface SourcesBubbleProps {
  citations: SourceItem[];
  className?: string;
}

function cleanScriptureText(text: string | undefined): string {
  if (!text) return "";
  let cleaned = text;

  // Remove solitary page numbers and Devnagari digits at start/isolated lines (e.g., "394", "३९४")
  cleaned = cleaned.replace(/^(?:\d+|[०-९]+)\s*$/gm, "");
  // Remove isolated asterisks
  cleaned = cleaned.replace(/^\s*\*\s*$/gm, "");
  // Remove book header lines like "* Srimad Bhagavad Gita *", "श्रीमद्भगवद्गीता"
  cleaned = cleaned.replace(/^\s*\*?\s*(?:Srimad Bhagavad Gita|श्रीमद्भगवद्गीता)\s*\*?\s*$/gmi, "");
  // Remove chapter heading lines if isolated
  cleaned = cleaned.replace(/^\s*\[?\s*(?:Chapter|अध्याय)\s*\d+[\]\s]*$/gmi, "");
  // Remove leading/trailing quotation marks & extra whitespace
  cleaned = cleaned.replace(/^["'\s]+|["'\s]+$/g, "");
  // Collapse multiple blank lines
  cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, "\n\n");
  
  return cleaned.trim();
}

export function SourcesBubble({ citations, className }: SourcesBubbleProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activePageModal, setActivePageModal] = React.useState<SourceItem | null>(null);

  if (!citations || citations.length === 0) return null;

  const topSources = citations.slice(0, 4);

  return (
    <div className={cn("mt-3 flex flex-col gap-2 pt-2 border-t border-[#E6DDD0]/40 dark:border-[#2D2825]/40", className)}>
      
      {/* PERPLEXITY-STYLE COMPACT BUBBLE BUTTON AT BOTTOM OF MESSAGE */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFE9DF]/80 dark:bg-[#1E1C1A]/80 border border-[#E6DDD0] dark:border-[#3C3630] text-xs text-[#5C4F45] dark:text-[#D4C7B8] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-all shadow-sm w-fit cursor-pointer"
      >
        {/* OVERLAPPING AVATARS / ICONS */}
        <div className="flex -space-x-2 overflow-hidden items-center">
          {topSources.map((item, idx) => {
            const isWeb = item.type === "web" || item.url;
            const domain = item.url ? new URL(item.url).hostname.replace("www.", "") : "web";
            const faviconUrl = isWeb && item.url ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;

            return (
              <div
                key={idx}
                className="inline-block h-5 w-5 rounded-full ring-2 ring-[#FAF7F2] dark:ring-[#1A1816] bg-[#C25E38]/10 overflow-hidden shrink-0 flex items-center justify-center"
              >
                {faviconUrl ? (
                  <img
                    src={faviconUrl}
                    alt={domain}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : isWeb ? (
                  <Globe className="w-3 h-3 text-[#C25E38]" />
                ) : (
                  <BookOpen className="w-3 h-3 text-[#C25E38]" />
                )}
              </div>
            );
          })}
        </div>

        <span className="font-semibold text-xs text-[#2D2622] dark:text-[#F5F2EB] font-sans">
          {citations.length} {citations.length === 1 ? "source" : "sources"}
        </span>

        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </motion.button>

      {/* EXPANDABLE SOURCES DRAWER AT BOTTOM */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#E6DDD0] dark:border-[#2D2825] space-y-2.5 shadow-sm"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C7B70] dark:text-[#A89F91]">
              Retrieved Web & Canonical Scripture Sources ({citations.length})
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {citations.map((item, idx) => {
                const isWeb = item.type === "web" || item.url;
                const domain = item.url ? new URL(item.url).hostname.replace("www.", "") : item.source || "Scripture Resource";

                if (isWeb) {
                  return (
                    <a
                      key={idx}
                      href={item.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-[#F4EFE6]/70 dark:bg-[#12100F]/70 border border-[#E6DDD0]/60 dark:border-[#2D2825]/60 hover:border-[#C25E38]/50 transition-all flex flex-col justify-between space-y-1 group"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#8C7B70] dark:text-[#A89F91]">
                        <span className="flex items-center gap-1 font-semibold truncate">
                          <Globe className="w-3 h-3 text-[#C25E38] shrink-0" />
                          {domain}
                        </span>
                        <ExternalLink className="w-3 h-3 text-[#C25E38] group-hover:translate-x-0.5 transition-transform" />
                      </div>

                      <p className="font-sans font-medium text-xs text-[#2D2622] dark:text-[#F5F2EB] line-clamp-2 leading-snug">
                        {item.title || item.snippet || `Web Source ${idx + 1}`}
                      </p>
                    </a>
                  );
                }

                // Canonical Scripture Book Card with Page number
                const cleanedCardSnippet = cleanScriptureText(item.translation || item.sanskrit);

                return (
                  <div
                    key={idx}
                    onClick={() => setActivePageModal(item)}
                    className="p-2.5 rounded-lg bg-[#F4EFE6]/70 dark:bg-[#12100F]/70 border border-[#E6DDD0]/60 dark:border-[#2D2825]/60 hover:border-[#C25E38]/50 transition-all flex flex-col justify-between space-y-1 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#8C7B70] dark:text-[#A89F91]">
                      <span className="flex items-center gap-1 font-semibold truncate pr-2">
                        <BookOpen className="w-3 h-3 text-[#C25E38] shrink-0" />
                        [Priority {item.priority || 1}] {item.source}
                      </span>
                      {item.page && (
                        <span className="px-1.5 py-0.5 rounded bg-[#C25E38]/10 text-[#C25E38] font-bold text-[10px] shrink-0">
                          Page {item.page}
                        </span>
                      )}
                    </div>

                    <p className="font-serif italic text-xs text-[#5C4F45] dark:text-[#D4C7B8] line-clamp-2 leading-snug">
                      "{cleanedCardSnippet || `Scripture Page ${item.page}`}"
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCRIPTURE PAGE READER MODAL */}
      <AnimatePresence>
        {activePageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#E6DDD0] dark:border-[#2D2825] rounded-2xl p-6 space-y-4 shadow-2xl text-left max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#E6DDD0]/60 dark:border-[#2D2825]/60 pb-3">
                <div className="pr-4">
                  <span className="text-xs font-mono font-bold text-[#C25E38] block mb-0.5">
                    [Priority {activePageModal.priority || 1}] Canonical Gita Scripture Edition
                  </span>
                  <h4 className="font-serif font-bold text-lg text-[#2D2622] dark:text-[#F5F2EB] leading-snug">
                    {activePageModal.source} — Page {activePageModal.page}
                  </h4>
                </div>
                <button
                  onClick={() => setActivePageModal(null)}
                  className="text-[#8C7B70] hover:text-[#2D2622] dark:hover:text-[#F5F2EB] text-base font-bold px-2.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* DISCLAIMER BADGE FOR SANSKRIT / HINDI PRIORITY 1 TEXT */}
              {(activePageModal.priority === 1 || activePageModal.sanskrit) && (
                <div className="p-3 rounded-xl bg-[#C25E38]/10 dark:bg-[#E06D43]/15 border border-[#C25E38]/30 text-xs text-[#2D2622] dark:text-[#F5F2EB] flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#C25E38] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-[#C25E38] dark:text-[#E06D43]">Scripture Language Notice</p>
                    <p className="leading-relaxed text-[11px] text-[#5C4F45] dark:text-[#D4C7B8]">
                      The original text for this canonical edition is written in authentic Devanagari Sanskrit / Hindi.
                    </p>
                  </div>
                </div>
              )}

              {/* ORIGINAL SANSKRIT / HINDI TEXT */}
              {activePageModal.sanskrit && (
                <div className="p-4 rounded-xl bg-[#F4EFE6] dark:bg-[#12100F] border border-[#E6DDD0]/60 dark:border-[#2D2825]/60 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#8C7B70] tracking-wider">
                    Original Devanagari Sanskrit / Hindi Text (Page {activePageModal.page})
                  </span>
                  <div className="font-sans text-sm sm:text-base text-[#2D2622] dark:text-[#F5F2EB] font-medium leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto p-1 scrollbar-hide">
                    {cleanScriptureText(activePageModal.sanskrit)}
                  </div>
                </div>
              )}

              {/* ENGLISH TRANSLATION & COMMENTARY */}
              {activePageModal.translation && (
                <div className="p-4 rounded-xl bg-[#F4EFE6] dark:bg-[#12100F] border border-[#E6DDD0]/60 dark:border-[#2D2825]/60 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#8C7B70] tracking-wider">
                    English Translation & Commentary
                  </span>
                  <div className="font-serif italic text-sm sm:text-base text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto p-1 scrollbar-hide">
                    "{cleanScriptureText(activePageModal.translation)}"
                  </div>
                </div>
              )}

              {/* TRANSLATION RESOURCES LINKS */}
              <div className="p-3.5 rounded-xl bg-[#EFE9DF]/60 dark:bg-[#1A1816]/60 border border-[#E6DDD0]/60 dark:border-[#2D2825]/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C7B70]">
                  <Languages className="w-3.5 h-3.5 text-[#C25E38]" />
                  <span>Online Sanskrit & Hindi Translation Resources:</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <a
                    href="https://www.polytranslator.com/sanskrit-to-english/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-black/40 border border-[#E6DDD0] dark:border-[#2D2825] text-[#C25E38] hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <span>1. PolyTranslator (Sanskrit to English)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://www.machinetranslation.com/translation/sanskrit-english"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-black/40 border border-[#E6DDD0] dark:border-[#2D2825] text-[#C25E38] hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <span>2. MachineTranslation (Sanskrit-English)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActivePageModal(null)}
                  className="px-5 py-2 rounded-xl bg-[#C25E38] hover:bg-[#A84E2B] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Done Reading
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
