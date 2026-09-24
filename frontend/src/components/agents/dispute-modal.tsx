"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Send,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { CitationItem } from "./citations";

export interface CitationDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  citation?: CitationItem | null;
  onSuccess?: (disputeId: string) => void;
}

const DISPUTE_REASONS = [
  { id: "page_misalignment", label: "Page Number Misalignment in Printed Commentary" },
  { id: "translation_discrepancy", label: "Translation Nuance / Vernacular Discrepancy" },
  { id: "context_missing", label: "Missing Commentary Context / Partial Verse" },
  { id: "shloka_attribution", label: "Incorrect Shloka Attribution or Chapter Ref" },
  { id: "other", label: "Other Commentary / Typography Dispute" },
];

export function CitationDisputeModal({
  isOpen,
  onClose,
  citation,
  onSuccess,
}: CitationDisputeModalProps) {
  const [reason, setReason] = useState(DISPUTE_REASONS[0].id);
  const [explanation, setExplanation] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Close on Escape key press for accessibility
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleResetAndClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !citation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim()) {
      setErrorMessage("Please provide a brief explanation of the discrepancy.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citationId: citation.id,
          title: citation.title,
          chapter: citation.chapter,
          verse: citation.verse,
          page: citation.page,
          source: citation.source || citation.domain || "Vedic Library",
          reason,
          explanation: explanation.trim(),
          email: email.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmittedTicket(data.disputeId);
        if (onSuccess) onSuccess(data.disputeId);
      } else {
        setErrorMessage(data.error || "Failed to submit dispute. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Dispute submission error:", err);
      setErrorMessage("Network error connecting to governance API.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedTicket(null);
    setExplanation("");
    setEmail("");
    setErrorMessage(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleResetAndClose();
        }}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dispute-modal-title"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#DFD5C6] dark:border-[#38332E] bg-[#FAF7F2] dark:bg-[#1E1B18] shadow-2xl font-sans"
        >
          {/* Header Banner */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#DFD5C6]/60 dark:border-[#38332E]/60 bg-[#EFE9DF]/50 dark:bg-[#262320]/60">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43]">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 
                  id="dispute-modal-title"
                  className="text-sm font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]"
                >
                  Dispute Citation / Source Audit
                </h3>
                <p className="text-[11px] text-[#8C7B70] dark:text-[#A89F91]">
                  NityaGeeta Human-in-the-Loop Governance
                </p>
              </div>
            </div>
            <button
              id="dispute-modal-close-btn"
              type="button"
              onClick={handleResetAndClose}
              className="p-1.5 rounded-full text-[#8C7B70] hover:text-[#2D2622] dark:text-[#A89F91] dark:hover:text-[#F5F2EB] hover:bg-[#E6DDD0]/60 dark:hover:bg-[#2D2825] transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6">
            {submittedTicket ? (
              /* Success View */
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4 ring-8 ring-emerald-500/5">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] mb-1">
                  Dispute Audit Ticket Logged
                </h4>
                <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] mb-4 max-w-xs mx-auto">
                  Your citation report has been appended to the NityaGeeta auditing queue for commentary review.
                </p>

                <div className="inline-flex flex-col items-center justify-center px-4 py-3 rounded-2xl bg-[#EFE9DF] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] mb-6">
                  <span className="text-[10px] font-mono text-[#8C7B70] dark:text-[#A89F91] uppercase tracking-wider">
                    Governance Ticket Ref
                  </span>
                  <span className="text-sm font-mono font-bold text-[#C25E38] dark:text-[#E06D43]">
                    #{submittedTicket}
                  </span>
                </div>

                <div className="flex justify-center">
                  <button
                    id="dispute-success-done-btn"
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#C25E38] hover:bg-[#A84E2B] dark:bg-[#E06D43] dark:hover:bg-[#C85B33] text-white shadow-md transition cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              /* Form View */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Target Citation Summary Card */}
                <div className="p-3.5 rounded-2xl bg-[#EFE9DF]/60 dark:bg-[#262320]/60 border border-[#DFD5C6]/60 dark:border-[#38332E]/60">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#C25E38] dark:text-[#E06D43] mb-1">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {citation.chapter && `Chapter ${citation.chapter}`}
                      {citation.chapter && citation.verse && " • "}
                      {citation.verse && `Verse ${citation.verse}`}
                      {citation.page && ` (p. ${citation.page})`}
                    </span>
                  </div>
                  <h5 className="font-serif font-bold text-xs text-[#2D2622] dark:text-[#F5F2EB] line-clamp-1">
                    {citation.title}
                  </h5>
                  {citation.quote && (
                    <p className="text-[11px] text-[#5C4F45] dark:text-[#D4C7B8] italic line-clamp-2 mt-1">
                      &ldquo;{citation.quote}&rdquo;
                    </p>
                  )}
                </div>

                {/* Reason Selection */}
                <div>
                  <label
                    htmlFor="dispute-reason-select"
                    className="block text-xs font-bold text-[#2D2622] dark:text-[#F5F2EB] mb-1.5"
                  >
                    Dispute Category <span className="text-[#C25E38] dark:text-[#E06D43]">*</span>
                  </label>
                  <select
                    id="dispute-reason-select"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DFD5C6] dark:border-[#38332E] bg-[#FAF7F2] dark:bg-[#1C1917] text-[#2D2622] dark:text-[#F5F2EB] focus:outline-none focus:ring-2 focus:ring-[#C25E38] dark:focus:ring-[#E06D43] transition cursor-pointer"
                  >
                    {DISPUTE_REASONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Explanation Input */}
                <div>
                  <label
                    htmlFor="dispute-explanation-input"
                    className="block text-xs font-bold text-[#2D2622] dark:text-[#F5F2EB] mb-1.5"
                  >
                    Discrepancy Details <span className="text-[#C25E38] dark:text-[#E06D43]">*</span>
                  </label>
                  <textarea
                    id="dispute-explanation-input"
                    rows={3}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Describe what is incorrect in the citation, page reference, or commentary translation..."
                    className="w-full p-3 text-xs rounded-xl border border-[#DFD5C6] dark:border-[#38332E] bg-[#FAF7F2] dark:bg-[#1C1917] text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70]/60 dark:placeholder-[#A89F91]/50 focus:outline-none focus:ring-2 focus:ring-[#C25E38] dark:focus:ring-[#E06D43] transition resize-none"
                  />
                </div>

                {/* Contact Email (Optional) */}
                <div>
                  <label
                    htmlFor="dispute-email-input"
                    className="block text-xs font-bold text-[#2D2622] dark:text-[#F5F2EB] mb-1.5 flex items-center justify-between"
                  >
                    <span>Contact Email</span>
                    <span className="text-[10px] font-normal text-[#8C7B70] dark:text-[#A89F91]">
                      Optional (for follow-up)
                    </span>
                  </label>
                  <input
                    id="dispute-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="scholar@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DFD5C6] dark:border-[#38332E] bg-[#FAF7F2] dark:bg-[#1C1917] text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70]/60 dark:placeholder-[#A89F91]/50 focus:outline-none focus:ring-2 focus:ring-[#C25E38] dark:focus:ring-[#E06D43] transition"
                  />
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#DFD5C6]/60 dark:border-[#38332E]/60">
                  <button
                    id="dispute-cancel-btn"
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#8C7B70] hover:text-[#2D2622] dark:text-[#A89F91] dark:hover:text-[#F5F2EB] hover:bg-[#E6DDD0]/60 dark:hover:bg-[#2D2825] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="dispute-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#C25E38] hover:bg-[#A84E2B] dark:bg-[#E06D43] dark:hover:bg-[#C85B33] text-white shadow-md hover:shadow-lg disabled:opacity-50 transition cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Logging Ticket...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Dispute</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
