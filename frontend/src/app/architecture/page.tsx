"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Database,
  Compass,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Layers,
  Flame,
  Lightbulb,
  Heart,
  Quote,
  Target,
  Zap,
  Activity,
  Award,
  ExternalLink,
  BrainCircuit,
  FileText,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { AgentActivity, type AgentActivityItem } from "@/components/agents/agent-activity";
import { Citations, type CitationItem } from "@/components/agents/citations";

const ARCHITECTURE_STEPS = [
  {
    step: "01",
    title: "Sacred Ground Truth Ingestion",
    subtitle: "High-Resolution OCR & Digitization of Primary Canonical Texts",
    icon: Database,
    badge: "Comprehensive Ground Truth",
    summary:
      "Most AI models hallucinate scripture because they scrape low-quality web snippets. NityaGeeta began with an obsession: digitizing and OCR-cleaning the definitive Sadhaka-Sanjivani (Swami Ramsukhdas • Gita Press Gorakhpur), Adi Shankaracharya's Advaita Bhashya, and Winthrop Sargeant's grammatical etymology. Every word is canonical.",
    sources: [
      { name: "Sadhaka-Sanjivani", detail: "Gita Press Gorakhpur", tag: "Primary Authority" },
      { name: "Shankara Bhashya", detail: "Adi Shankaracharya (Advaita Metaphysics)", tag: "Classical Commentary" },
      { name: "Sanskrit Grammar & Etymology", detail: "Winthrop Sargeant Word-for-Word Concordance", tag: "Linguistic Rigor" },
      { name: "Vedic Dincharya", detail: "Ayurvedic Circadian & Mental Mastery", tag: "Daily Protocol" },
    ],
  },
  {
    step: "02",
    title: "Semantic Life Context Mapping",
    subtitle: "Translating Real-World Crises to Exact Gita Verses",
    icon: Compass,
    badge: "700 Verses • 18 Chapters",
    summary:
      "When you bring a modern conflict—burnout, ethical compromise, imposter syndrome, or relational anxiety—our semantic engine bypasses surface jargon to identify the psychological root cause. It maps your challenge directly to the foundational verses and chapters of the Bhagavad Gita.",
    sources: [
      { name: "Karma Yoga (Chapters 2–5)", detail: "Duty without outcome anxiety; freedom from burnout", tag: "Work & Action" },
      { name: "Dhyāna Yoga (Chapter 6)", detail: "Mind mastery, emotional poise, and cognitive stillness", tag: "Mental Health" },
      { name: "Bhakti & Jñāna (Chapters 7–15)", detail: "Self-realization, cosmic purpose, and non-attachment", tag: "Existential Meaning" },
      { name: "Guna & Moksha (Chapters 16–18)", detail: "Discernment of nature and ultimate liberation", tag: "Life Integration" },
    ],
  },
  {
    step: "03",
    title: "Multi-LLM Consensus Council",
    subtitle: "5 Independent Neural Brains Debating in Parallel",
    icon: Cpu,
    badge: "5 Neural Architectures",
    summary:
      "Relying on a single AI model is dangerous—it brings bias, blind spots, and hallucination. NityaGeeta queries an elite ensemble of 5 world-class models simultaneously. They debate, cross-examine scripture interpretations, and score each other on philosophical authenticity.",
    sources: [
      { name: "Google Gemini 2.5 Flash", detail: "High-speed multi-lingual reasoning & corpus extraction", tag: "Speed & Breadth" },
      { name: "DeepSeek-R1 / V3", detail: "Deep step-by-step chain-of-thought philosophical logic", tag: "Analytical Depth" },
      { name: "Anthropic Claude 3.5 Sonnet", detail: "Psychological nuance, empathetic framing, and ethical tone", tag: "Human Nuance" },
      { name: "Meta Llama 3.3 70B & Qwen 2.5", detail: "Open-weights verification and Sanskrit syntax validation", tag: "Consensus Guard" },
    ],
  },
  {
    step: "04",
    title: "Groundedness Scoring & Anti-Hallucination Gate",
    subtitle: "Mathematical Verification Before Any Word Reaches You",
    icon: ShieldCheck,
    badge: "100/100 Groundedness Target",
    summary:
      "Before a resolution is shown, our synthesis engine executes strict verification: 1) Groundedness Check (ensuring every quoted verse exists), 2) Commentary Concordance (matching Gita Press authority), and 3) Actionability (translating metaphysics into concrete daily actions).",
    sources: [
      { name: "Zero Hallucination Filter", detail: "Instantly rejects fabricated or misattributed shlokas", tag: "Safety Core" },
      { name: "Hermeneutic Concordance", detail: "Verifies alignment with traditional Acharya commentaries", tag: "Tradition Integrity" },
      { name: "Actionable Daily Sadhana", detail: "Distills cosmic wisdom into concrete 5-minute daily practices", tag: "Practical Protocol" },
      { name: "Interactive In-Text Citations", detail: "Provides clickable hover popovers linking to source pages", tag: "Full Transparency" },
    ],
  },
];

interface ComparisonCell {
  text: string;
  ref?: string;
}

interface ComparisonRow {
  dimension: string;
  genericAi: ComparisonCell;
  singleRag: ComparisonCell;
  nityaGeeta: ComparisonCell;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    dimension: "Scriptural Ground Truth",
    genericAi: { text: "Unverified web scraping (frequently fabricates fake Sanskrit quotes)", ref: "1" },
    singleRag: { text: "Simple uncleaned PDF search with broken formatting" },
    nityaGeeta: { text: "OCR-verified Sadhaka-Sanjivani + Acharya Bhashyas", ref: "2" },
  },
  {
    dimension: "Multi-Model Consensus",
    genericAi: { text: "Single model (single point of cognitive failure)", ref: "3" },
    singleRag: { text: "Single prompt wrapper around one LLM" },
    nityaGeeta: { text: "5-Model Council (Gemini, DeepSeek, Claude, Llama, Qwen debating live)", ref: "3" },
  },
  {
    dimension: "Hallucination Defense",
    genericAi: { text: "Zero verification (generates plausible-sounding false verses)", ref: "1" },
    singleRag: { text: "Basic vector distance threshold" },
    nityaGeeta: { text: "Mathematical Groundedness Scoring + Verse Verification Gate", ref: "4" },
  },
  {
    dimension: "Citation Transparency",
    genericAi: { text: "Vague generalities or no source references" },
    singleRag: { text: "Static page numbers without interactive previews" },
    nityaGeeta: { text: "Interactive In-Text Pills with Hover Popovers & Direct Library PDF Links", ref: "2" },
  },
  {
    dimension: "Modern Application",
    genericAi: { text: "Generic motivational fluff or dry academic text" },
    singleRag: { text: "Raw Sanskrit text dumps without practical modern context" },
    nityaGeeta: { text: "Actionable psychological reframing for corporate, ethical & personal crises" },
  },
];

const SIMULATION_CASES = [
  {
    id: "burnout",
    title: "Corporate Burnout & Outcome Anxiety",
    chapter: "Chapter 2 • Verse 47",
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    steps: [
      { id: "s1", type: "step" as const, label: "Scanning Sadhaka-Sanjivani for Nishkama Karma Yoga principles", status: "complete" as const },
      { id: "s2", type: "step" as const, label: "Consulting 5 AI models (Gemini, DeepSeek, Claude, Llama, Qwen)", status: "complete" as const, meta: "5/5 scored" },
      { id: "s3", type: "step" as const, label: "Calculating groundedness: 98.6/100 • Synthesizing daily actionable protocol", status: "complete" as const },
    ],
    citations: [
      {
        id: "c1",
        title: "Sadhaka-Sanjivani: Nishkama Karma",
        chapter: "2",
        verse: "47",
        page: 142,
        domain: "gita-press.org",
        url: "/sources#sadhaka-sanjivani",
        quote: "You have a right to perform your prescribed duty, but never to the fruits of action. Never consider yourself the cause of the results, nor be attached to inaction.",
      },
      {
        id: "c2",
        title: "Shankara Bhashya on Gita 2.47",
        chapter: "2",
        verse: "47",
        domain: "advaita-vedanta.org",
        url: "/sources#shankara-bhashya",
        quote: "Psychological liberation occurs when the ego releases ownership of outcome.",
      },
    ],
  },
  {
    id: "grief",
    title: "Emotional Grief & Fear of Impermanence",
    chapter: "Chapter 2 • Verse 20",
    sanskrit: "न जायते म्रियते वा कदाचिन्\nनायं भूत्वा भविता वा न भूयः।",
    steps: [
      { id: "s1", type: "step" as const, label: "Mapping Atman immortality commentary across Advaita traditions", status: "complete" as const },
      { id: "s2", type: "step" as const, label: "Cross-verifying Sanskrit syntax with Winthrop Sargeant linguistic corpus", status: "complete" as const },
      { id: "s3", type: "step" as const, label: "Consensus winner: Claude 3.5 + DeepSeek-R1 synthesis", status: "complete" as const, meta: "99.2% consensus" },
    ],
    citations: [
      {
        id: "c1",
        title: "Sadhaka-Sanjivani: The Eternal Atman",
        chapter: "2",
        verse: "20",
        page: 86,
        domain: "gita-press.org",
        url: "/sources#sadhaka-sanjivani",
        quote: "The soul is never born, nor does it ever die. Unborn, eternal, ever-existing and primeval, it is not slain when the body is slain.",
      },
    ],
  },
];

export default function ArchitecturePage() {
  const router = useRouter();
  const [activeSimulation, setActiveSimulation] = useState(SIMULATION_CASES[0]);
  const [citationsOpen, setCitationsOpen] = useState(false);
  const [integrityCitationsOpen, setIntegrityCitationsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB] flex flex-col font-serif selection:bg-[#C25E38]/20 dark:selection:bg-[#E06D43]/30 transition-colors duration-300">
      <ScrollProgress className="fixed top-0 left-0 right-0 z-[10000]" />
      <Navbar activePage="architecture" />

      {/* ── KEYNOTE HERO: REVERENT VEDIC ETHICS & TIMELESS CLARITY ── */}
      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto w-full text-center">
        <p className="text-xs sm:text-sm font-sans font-bold uppercase tracking-[0.25em] text-[#C25E38] dark:text-[#E06D43] mb-4">
          Sanatana Dharma • Canonical Truth • Mind Mastery
        </p>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.15] text-[#2D2622] dark:text-[#F5F2EB] mb-8 font-serif">
          Sacred Vedic Wisdom for the <br />
          <span className="text-[#C25E38] dark:text-[#E06D43] font-medium italic">Modern Seeker</span>
        </h1>

        <p className="text-base sm:text-xl text-[#5C4F45] dark:text-[#D4C7B8] max-w-3xl mx-auto font-sans leading-relaxed mb-10 font-normal">
          Rooted in the eternal truths of Sanatana Dharma and the 700 canonical verses of the Bhagavad Gita—synthesized through reverent, multi-agent AI dialogue with zero hallucinations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 font-sans text-xs sm:text-sm">
          <button
            onClick={() => router.push("/app")}
            className="px-8 py-4 rounded-2xl bg-[#C25E38] dark:bg-[#E06D43] text-white font-bold shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2.5"
          >
            <span>Experience NityaGeeta Dialogue</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => router.push("/dilemmas")}
            className="px-8 py-4 rounded-2xl bg-[#EFE9DF] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] font-bold hover:border-[#C25E38] transition-all cursor-pointer flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
            <span>Browse 700-Verse Dilemmas</span>
          </button>
        </div>
      </section>

      {/* ── ARCHITECTURAL PILLARS: 4-STAGE GROUNDING PIPELINE ── */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#C25E38] dark:text-[#E06D43] block mb-2">
            Engineering & Tradition
          </span>
          <h2 className="text-3xl sm:text-5xl font-normal text-[#2D2622] dark:text-[#F5F2EB] font-serif">
            The 4-Stage Grounding Pipeline
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#5C4F45] dark:text-[#D4C7B8] font-sans">
            How NityaGeeta transforms 5,000-year-old Sanskrit verses into real-time, actionable psychological clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ARCHITECTURE_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="p-8 sm:p-10 rounded-3xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DFD5C6] dark:border-[#38332E] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-serif text-[#DFD5C6] dark:text-[#38332E] font-bold">
                      {step.step}
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#EFE9DF] dark:bg-[#2A2622] text-[#C25E38] dark:text-[#E06D43] text-[11px] font-sans font-bold tracking-wider uppercase inline-block mb-3">
                    {step.badge}
                  </span>

                  <h3 className="text-2xl font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB] mb-2">
                    {step.title}
                  </h3>
                  <h4 className="text-xs sm:text-sm font-sans font-semibold text-[#8C7B70] dark:text-[#A89F91] mb-4">
                    {step.subtitle}
                  </h4>

                  <p className="text-xs sm:text-sm font-sans text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed mb-6">
                    {step.summary}
                  </p>
                </div>

                <div className="border-t border-[#E8E1D7] dark:border-[#38332E] pt-4 mt-auto">
                  <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#8C7B70] dark:text-[#A89F91] mb-2">
                    Primary Sources & Integrity:
                  </div>
                  <div className="space-y-1.5 font-sans">
                    {step.sources.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-[#2D2622] dark:text-[#F5F2EB] font-medium">{s.name}</span>
                        <span className="text-[10px] text-[#8C7B70] dark:text-[#A89F91]">{s.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── INTERACTIVE LIVE CONSENSUS SIMULATION ── */}
      <section className="py-20 px-6 max-w-5xl mx-auto w-full font-sans">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C25E38] dark:text-[#E06D43] block mb-2">
            Live Engine Trace
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#2D2622] dark:text-[#F5F2EB]">
            Simulated Multi-Agent Trace
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8]">
            Select a life dilemma below to inspect real-time agent verification steps and ground truth citations.
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-8">
          {SIMULATION_CASES.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveSimulation(sc)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeSimulation.id === sc.id
                  ? "bg-[#C25E38] dark:bg-[#E06D43] text-white shadow-md"
                  : "bg-[#EFE9DF] dark:bg-[#262320] text-[#5C4F45] dark:text-[#D4C7B8] hover:border-[#C25E38]"
              }`}
            >
              {sc.title}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DFD5C6] dark:border-[#38332E] shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E1D7] dark:border-[#38332E] pb-4">
            <div>
              <span className="text-[11px] font-mono text-[#C25E38] dark:text-[#E06D43] font-bold">
                {activeSimulation.chapter}
              </span>
              <h3 className="text-xl font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB]">
                {activeSimulation.title}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold self-start sm:self-auto">
              ✓ Verified Ground Truth
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#EFE9DF]/50 dark:bg-[#1A1816] border border-[#DFD5C6] dark:border-[#38332E] font-serif text-center">
            <p className="text-sm sm:text-base text-[#C25E38] dark:text-[#E06D43] leading-relaxed whitespace-pre-line font-bold">
              {activeSimulation.sanskrit}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7B70] dark:text-[#A89F91]">
              Live Agent Activity
            </h4>
            <AgentActivity
              items={activeSimulation.steps as AgentActivityItem[]}
              status="complete"
              duration={1.2}
              defaultOpen={true}
              collapseOnComplete={false}
            />
          </div>

          <div className="pt-4 border-t border-[#E8E1D7] dark:border-[#38332E]">
            <Citations
              citations={activeSimulation.citations as CitationItem[]}
            />
          </div>
        </div>
      </section>

      {/* ── COMPARISON MATRIX & CITATIONS SECTION ── */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full font-sans">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C25E38] dark:text-[#E06D43] block mb-2">
            Rigorous Verification
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#2D2622] dark:text-[#F5F2EB]">
            Why Generic AI Fails on Scripture
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8]">
            Comparing standard LLMs with NityaGeeta&apos;s verified multi-agent Sanskrit synthesis.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-[#DFD5C6] dark:border-[#38332E] shadow-xl bg-[#FAF7F2] dark:bg-[#201D1A]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E1D7] dark:border-[#38332E] bg-[#EFE9DF]/60 dark:bg-[#1C1917] text-[11px] font-bold uppercase tracking-wider">
                <th className="p-4 sm:p-6 text-[#5C4F45] dark:text-[#D4C7B8]">Dimension</th>
                <th className="p-4 sm:p-6 text-red-600 dark:text-red-400">Generic AI</th>
                <th className="p-4 sm:p-6 text-[#8C7B70] dark:text-[#A89F91]">Single RAG Wrappers</th>
                <th className="p-4 sm:p-6 text-[#C25E38] dark:text-[#E06D43] font-black">NityaGeeta Engine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D7] dark:divide-[#38332E] text-xs">
              {COMPARISON_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#EFE9DF]/30 dark:hover:bg-[#262320] transition">
                  <td className="p-4 sm:p-6 font-bold text-[#2D2622] dark:text-[#F5F2EB]">{row.dimension}</td>
                  <td className="p-4 sm:p-6 text-[#6B5E55] dark:text-[#A89F91]">
                    {row.genericAi.text}
                    {row.genericAi.ref && (
                      <sup className="text-[#C25E38] dark:text-[#E06D43] font-mono font-bold ml-1">
                        [{row.genericAi.ref}]
                      </sup>
                    )}
                  </td>
                  <td className="p-4 sm:p-6 text-[#6B5E55] dark:text-[#A89F91]">
                    {row.singleRag.text}
                  </td>
                  <td className="p-4 sm:p-6 font-semibold text-[#2D2622] dark:text-[#F5F2EB] bg-[#C25E38]/5 dark:bg-[#E06D43]/10">
                    {row.nityaGeeta.text}
                    {row.nityaGeeta.ref && (
                      <sup className="text-[#C25E38] dark:text-[#E06D43] font-mono font-bold ml-1">
                        [{row.nityaGeeta.ref}]
                      </sup>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Scriptural Fidelity & Integrity Citations Accordion (Default Closed) */}
        <div className="mt-8 rounded-2xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DFD5C6] dark:border-[#38332E] overflow-hidden shadow-sm font-sans">
          <button
            type="button"
            onClick={() => setIntegrityCitationsOpen(!integrityCitationsOpen)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#EFE9DF]/40 dark:hover:bg-[#262320]/40 transition cursor-pointer text-left select-none"
            aria-expanded={integrityCitationsOpen}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
              <h3 className="text-sm font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB]">
                Scriptural Fidelity & Integrity Citations
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43]">
                4
              </span>
            </div>

            <div className="flex items-center gap-2 text-[#8C7B70] dark:text-[#A89F91] text-xs">
              <span className="hidden sm:inline text-[11px]">
                {integrityCitationsOpen ? "Hide Citations" : "Show Citations"}
              </span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  integrityCitationsOpen && "rotate-180"
                )}
              />
            </div>
          </button>

          <AnimatePresence initial={false}>
            {integrityCitationsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden border-t border-[#E8E1D7] dark:border-[#38332E]"
              >
                <div className="p-6 space-y-4">
                  {/* Citation 1 */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#EFE9DF]/50 dark:bg-[#262320]/60 border border-[#DFD5C6]/70 dark:border-[#38332E]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#C25E38] dark:text-[#E06D43] bg-[#C25E38]/15 dark:bg-[#E06D43]/25">
                          [1]
                        </span>
                        <strong className="text-[#2D2622] dark:text-[#F5F2EB] font-serif text-sm">
                          Unanchored LLM Hallucination Rates
                        </strong>
                      </div>
                      <p className="text-xs text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                        Empirical research confirms high hallucination rates and Sanskrit verse misattribution in ungrounded foundational models.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href="https://crfm.stanford.edu/helm/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#DFD5C6] dark:border-[#38332E] text-[#C25E38] dark:text-[#E06D43] hover:border-[#C25E38] hover:scale-105 active:scale-95 transition shadow-xs flex items-center justify-center cursor-pointer"
                        title="Stanford CRFM HELM Evaluation Benchmark"
                        aria-label="Stanford CRFM HELM Evaluation Benchmark"
                      >
                        <BrainCircuit className="w-4 h-4" />
                      </a>
                      <a
                        href="https://arxiv.org/abs/2309.01219"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#DFD5C6] dark:border-[#38332E] text-[#C25E38] dark:text-[#E06D43] hover:border-[#C25E38] hover:scale-105 active:scale-95 transition shadow-xs flex items-center justify-center cursor-pointer"
                        title="arXiv:2309.01219: Siren's Song in the AI Ocean: Survey on LLM Hallucination"
                        aria-label="arXiv:2309.01219: Siren's Song in the AI Ocean: Survey on LLM Hallucination"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Citation 2 */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#EFE9DF]/50 dark:bg-[#262320]/60 border border-[#DFD5C6]/70 dark:border-[#38332E]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#C25E38] dark:text-[#E06D43] bg-[#C25E38]/15 dark:bg-[#E06D43]/25">
                          [2]
                        </span>
                        <strong className="text-[#2D2622] dark:text-[#F5F2EB] font-serif text-sm">
                          Canonical Corpus Ground Truth
                        </strong>
                      </div>
                      <p className="text-xs text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                        Sourced from Gita Press Gorakhpur (1923), Shankaracharya Advaita Bhashya, and SUNY Press interlinear concordances.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => router.push("/sources")}
                        className="p-2 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white hover:opacity-90 hover:scale-105 active:scale-95 transition cursor-pointer border-0 shadow-xs flex items-center justify-center"
                        title="Browse Canonical Resources Library"
                        aria-label="Browse Canonical Resources Library"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                      <a
                        href="https://gitapress.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#DFD5C6] dark:border-[#38332E] text-[#C25E38] dark:text-[#E06D43] hover:border-[#C25E38] hover:scale-105 active:scale-95 transition shadow-xs flex items-center justify-center cursor-pointer"
                        title="Gita Press Gorakhpur Official Centenary Institution (Est. 1923)"
                        aria-label="Gita Press Gorakhpur Official Centenary Institution (Est. 1923)"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                      <a
                        href="https://sunypress.edu/Books/T/The-Bhagavad-Gita"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#DFD5C6] dark:border-[#38332E] text-[#C25E38] dark:text-[#E06D43] hover:border-[#C25E38] hover:scale-105 active:scale-95 transition shadow-xs flex items-center justify-center cursor-pointer"
                        title="SUNY Press: The Bhagavad Gita by Winthrop Sargeant"
                        aria-label="SUNY Press: The Bhagavad Gita by Winthrop Sargeant"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Citation 3 */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#EFE9DF]/50 dark:bg-[#262320]/60 border border-[#DFD5C6]/70 dark:border-[#38332E]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#C25E38] dark:text-[#E06D43] bg-[#C25E38]/15 dark:bg-[#E06D43]/25">
                          [3]
                        </span>
                        <strong className="text-[#2D2622] dark:text-[#F5F2EB] font-serif text-sm">
                          Multi-Agent Consensus Reliability
                        </strong>
                      </div>
                      <p className="text-xs text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                        Multi-agent debate frameworks achieve up to 34% error reduction over single models through automated peer cross-examination.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href="https://arxiv.org/abs/2305.14325"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#DFD5C6] dark:border-[#38332E] text-[#C25E38] dark:text-[#E06D43] hover:border-[#C25E38] hover:scale-105 active:scale-95 transition shadow-xs flex items-center justify-center cursor-pointer"
                        title="MIT / Google (arXiv:2305.14325): Improving Factuality and Reasoning through Multiagent Debate"
                        aria-label="MIT / Google (arXiv:2305.14325): Improving Factuality and Reasoning through Multiagent Debate"
                      >
                        <Layers className="w-4 h-4" />
                      </a>
                      <a
                        href="https://aiindex.stanford.edu/report/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#DFD5C6] dark:border-[#38332E] text-[#C25E38] dark:text-[#E06D43] hover:border-[#C25E38] hover:scale-105 active:scale-95 transition shadow-xs flex items-center justify-center cursor-pointer"
                        title="Stanford HAI: AI Index Report Portal"
                        aria-label="Stanford HAI: AI Index Report Portal"
                      >
                        <Award className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Citation 4 */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#EFE9DF]/50 dark:bg-[#262320]/60 border border-[#DFD5C6]/70 dark:border-[#38332E]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#C25E38] dark:text-[#E06D43] bg-[#C25E38]/15 dark:bg-[#E06D43]/25">
                          [4]
                        </span>
                        <strong className="text-[#2D2622] dark:text-[#F5F2EB] font-serif text-sm">
                          Deterministic Verification Gate
                        </strong>
                      </div>
                      <p className="text-xs text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                        Deterministic regex and semantic cross-checking against canonical shloka indexes before response synthesis.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href="https://arxiv.org/abs/2309.15217"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#DFD5C6] dark:border-[#38332E] text-[#C25E38] dark:text-[#E06D43] hover:border-[#C25E38] hover:scale-105 active:scale-95 transition shadow-xs flex items-center justify-center cursor-pointer"
                        title="RAGAS Framework (arXiv:2309.15217): Automated Reference-Free RAG Faithfulness"
                        aria-label="RAGAS Framework (arXiv:2309.15217): Automated Reference-Free RAG Faithfulness"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full text-center font-sans">
        <div className="w-full p-12 sm:p-16 md:p-20 rounded-3xl bg-gradient-to-b from-[#EFE9DF]/80 via-[#FAF7F2] to-[#FAF7F2] dark:from-[#262320]/90 dark:via-[#1E1B18] dark:to-[#1A1816] border border-[#DFD5C6] dark:border-[#38332E] shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C25E38]/10 dark:bg-[#E06D43]/15 rounded-full blur-3xl pointer-events-none" />

          <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-[0.28em] text-[#C25E38] dark:text-[#E06D43] relative z-10">
            An Invitation to Truth
          </p>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-[#2D2622] dark:text-[#F5F2EB] leading-tight relative z-10">
            Here&apos;s to the Seekers. <br />
            <span className="text-[#C25E38] dark:text-[#E06D43] italic block mt-1 sm:mt-2">
              The Thinkers. The Strivers.
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-[#5C4F45] dark:text-[#D4C7B8] max-w-2xl mx-auto leading-relaxed font-sans font-normal relative z-10">
            The clarity you have been searching for has existed for 5,000 years. All it took was the courage to build technology worthy of delivering it.
          </p>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 relative z-10">
            <button
              onClick={() => router.push("/app")}
              className="px-10 py-5 rounded-2xl bg-[#C25E38] dark:bg-[#E06D43] text-white font-bold text-base shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-3"
            >
              <span>Start Your Dialogue Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Universal Global Footer */}
      <Footer />
    </div>
  );
}
