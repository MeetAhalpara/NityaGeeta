"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export function Footer() {
  const router = useRouter();

  return (
    <footer className="mt-auto border-t border-[#E8E1D7] dark:border-[#38332E] bg-[#EFE9DF] dark:bg-[#141211] text-[#5C4F45] dark:text-[#A89F91] font-sans pt-12 pb-8 px-6 text-xs transition-colors">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
        {/* Column 1: Brand & Mission */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-2xl font-bold text-[#2D2622] dark:text-[#F5F2EB] tracking-tight">
              NityaGeeta
            </h3>
            <span
              className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#C25E38]/15 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] border border-[#C25E38]/30 dark:border-[#E06D43]/40"
              title="Verified"
              aria-label="Verified"
            >
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          </div>
          <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed max-w-sm">
            Universal Bhagavad Gita intelligence synthesized across canonical manuscripts and classical commentaries with 100% citation transparency.
          </p>
        </div>

        {/* Column 2: Platform Navigation */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold uppercase tracking-wider text-[11px] text-[#2D2622] dark:text-[#F5F2EB]">
            Platform
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button
                type="button"
                onClick={() => router.push("/app")}
                className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors cursor-pointer bg-transparent border-0 p-0 text-left font-medium"
              >
                AI Dialogue
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => router.push("/dilemmas")}
                className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors cursor-pointer bg-transparent border-0 p-0 text-left"
              >
                Life Dilemmas
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => router.push("/sources")}
                className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors cursor-pointer bg-transparent border-0 p-0 text-left"
              >
                Sources Library
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => router.push("/architecture")}
                className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors cursor-pointer bg-transparent border-0 p-0 text-left"
              >
                System Architecture
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Governance & Contact */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold uppercase tracking-wider text-[11px] text-[#2D2622] dark:text-[#F5F2EB]">
            Governance
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button
                type="button"
                onClick={() => router.push("/contact")}
                className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors cursor-pointer bg-transparent border-0 p-0 text-left"
              >
                Contact & Feedback
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => router.push("/privacy")}
                className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors cursor-pointer bg-transparent border-0 p-0 text-left"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => router.push("/terms")}
                className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors cursor-pointer bg-transparent border-0 p-0 text-left"
              >
                Terms of Service
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom copyright line */}
      <div className="max-w-6xl mx-auto pt-5 border-t border-[#E8E1D7] dark:border-[#38332E] flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#8C7B70] dark:text-[#A89F91] gap-2">
        <div>
          © 2026 <span className="font-semibold text-[#C25E38] dark:text-[#E06D43]">NityaGeeta Foundation</span>. All rights reserved.
        </div>
        <div className="text-[10px] tracking-wide text-[#8C7B70] dark:text-[#A89F91]">
          Canonical Sanskrit Ground Truth • 100% Verified Citations
        </div>
      </div>
    </footer>
  );
}
