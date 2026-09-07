"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github, Linkedin, ShieldCheck } from "lucide-react";

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
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#C25E38]/10 dark:bg-[#E06D43]/15 text-[#C25E38] dark:text-[#E06D43] border border-[#C25E38]/20 dark:border-[#E06D43]/25">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          </div>
          <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed max-w-sm">
            Universal Bhagavad Gita intelligence synthesized across canonical manuscripts and classical commentaries with 100% citation transparency.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <a
              href="https://github.com/MeetAhalpara/NityaGeeta"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub Repository"
              aria-label="GitHub Repository"
              className="w-8 h-8 rounded-lg bg-[#FAF7F2] dark:bg-[#201C19] border border-[#DFD5C6] dark:border-[#38332E] text-[#5C4F45] dark:text-[#D4C7B8] hover:text-[#C25E38] dark:hover:text-[#E06D43] hover:border-[#C25E38]/40 flex items-center justify-center transition-all shadow-xs cursor-pointer"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/meetahalpara"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn Profile"
              aria-label="LinkedIn Profile"
              className="w-8 h-8 rounded-lg bg-[#FAF7F2] dark:bg-[#201C19] border border-[#DFD5C6] dark:border-[#38332E] text-[#5C4F45] dark:text-[#D4C7B8] hover:text-[#C25E38] dark:hover:text-[#E06D43] hover:border-[#C25E38]/40 flex items-center justify-center transition-all shadow-xs cursor-pointer"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
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
