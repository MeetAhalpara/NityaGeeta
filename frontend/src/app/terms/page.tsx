"use client";

import Link from "next/link";
import { FileText, CheckCircle2, ShieldAlert, ArrowLeft, BookOpen, Mail } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB] flex flex-col font-serif selection:bg-[#C25E38]/20 dark:selection:bg-[#E06D43]/30 transition-colors duration-300">
      <ScrollProgress className="fixed top-0 left-0 right-0 z-[10000]" />
      <Navbar activePage="terms" />

      {/* Hero Header */}
      <section className="pt-32 pb-14 px-6 max-w-4xl mx-auto w-full text-center font-sans">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] text-xs font-bold uppercase tracking-wider mb-4">
          <FileText className="w-4 h-4" /> Usage Guidelines & Editorial Integrity
        </div>

        <h1 className="text-4xl sm:text-5xl font-normal leading-tight text-[#2D2622] dark:text-[#F5F2EB] mb-4 font-serif">
          Terms of <span className="text-[#C25E38] dark:text-[#E06D43] font-medium italic">Service</span>
        </h1>

        <p className="text-base text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed max-w-2xl mx-auto">
          Please review the principles governing respectful spiritual study, AI-generated synthesis, and scholarly attribution on NityaGeeta.
        </p>
        <p className="text-xs text-[#8C7B70] dark:text-[#A89F91] mt-2 font-mono">
          Last Updated: August 2026 • Version 1.1
        </p>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pb-24 w-full flex-1 font-sans text-sm leading-relaxed text-[#5C4F45] dark:text-[#D4C7B8] space-y-8">
        
        {/* Section 1 */}
        <section className="space-y-3 p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] shadow-sm">
          <h2 className="text-xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
            1. Acceptance of Terms & Purpose
          </h2>
          <p>
            By accessing or using NityaGeeta (the &ldquo;Platform&rdquo;), you agree to be bound by these Terms of Service. NityaGeeta is a non-commercial educational and spiritual research initiative created to make the Bhagavad Gita accessible, verifiable, and relevant for modern seekers.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] shadow-sm">
          <h2 className="text-xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
            2. Reverent & Respectful Conduct
          </h2>
          <p>
            Users agree to interact with the platform in a respectful, reverent manner appropriate for sacred scripture study. You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-[#5C4F45] dark:text-[#D4C7B8]">
            <li>Use the dialogue engine to generate hateful, derogatory, defamatory, or abusive content against any religion or community.</li>
            <li>Attempt to bypass grounding guardrails or inject malicious prompts designed to distort canonical Sanskrit shlokas.</li>
            <li>Automate bulk scraping or flood the API in a manner that degrades service for fellow seekers.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] shadow-sm">
          <h2 className="text-xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
            3. AI Retrieval & Advisory Disclaimer
          </h2>
          <p>
            NityaGeeta synthesizes canonical commentaries using modern neural RAG and parallel large language models. While our architecture minimizes hallucinations through strict chapter-and-verse grounding:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-[#5C4F45] dark:text-[#D4C7B8]">
            <li><strong>Philosophical Guidance Only:</strong> AI-generated responses are intended for spiritual contemplation, personal study, and education.</li>
            <li><strong>Not Professional Advice:</strong> NityaGeeta does not provide clinical mental health therapy, medical diagnosis, legal counsel, or financial planning.</li>
            <li><strong>Source Verification:</strong> Users are always encouraged to verify quotes against the provided original source PDFs.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] shadow-sm">
          <h2 className="text-xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
            4. Intellectual Property & Attribution
          </h2>
          <p>
            The original Sanskrit verses of the Bhagavad Gita and classical commentaries by historical acharyas (Adi Shankaracharya, Ramanujacharya, Madhvacharya) exist in the sacred public domain. Modern commentary datasets and translations (such as Gita Press Gorakhpur and SUNY Press) are utilized under academic, non-commercial fair-use standards with explicit attribution and links to archival editions.
          </p>
        </section>

        {/* Section 5 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#EFE9DF] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-center space-y-3">
          <h3 className="text-base font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
            Questions Regarding Terms or Disputed Sources?
          </h3>
          <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8]">
            If you wish to dispute a source citation or request an editorial clarification, please submit a feedback ticket:
          </p>
          <div className="pt-2">
            <Link
              href="/#support"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white text-xs font-bold hover:opacity-90 transition shadow-md"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Editorial Team</span>
            </Link>
          </div>
        </section>

      </main>

      {/* Universal Global Footer */}
      <Footer />
    </div>
  );
}
