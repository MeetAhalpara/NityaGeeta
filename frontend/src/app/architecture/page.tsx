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
  Heart,
  Quote,
  Zap,
  Award,
  BrainCircuit,
  FileText,
  Globe,
  Shield,
  Server,
  Flame,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";

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
  const [integrityCitationsOpen, setIntegrityCitationsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB] flex flex-col font-serif selection:bg-[#C25E38]/20 dark:selection:bg-[#E06D43]/30 transition-colors duration-300">
      <ScrollProgress className="fixed top-0 left-0 right-0 z-[10000]" />
      <Navbar activePage="architecture" />

      {/* ── KEYNOTE HERO: THE THINKING & ARCHITECTURE ── */}
      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto w-full text-center">
        <p className="text-xs sm:text-sm font-sans font-bold uppercase tracking-[0.25em] text-[#C25E38] dark:text-[#E06D43] mb-4">
          Sanatana Dharma • Sacred Truth • The Thinking &amp; Architecture
        </p>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.15] text-[#2D2622] dark:text-[#F5F2EB] mb-8 font-serif">
          Why NityaGeeta? <br />
          <span className="text-[#C25E38] dark:text-[#E06D43] font-medium italic">
            The Thinking &amp; Technical Architecture
          </span>
        </h1>

        <p className="text-base sm:text-xl text-[#5C4F45] dark:text-[#D4C7B8] max-w-3xl mx-auto font-sans leading-relaxed mb-10 font-normal">
          The Bhagavad Gita is not casual internet text—it is an eternal, sacred scripture preserved across millennia for over 5,000+ years. Here is the foundational thinking behind NityaGeeta, the human-centric philosophy that guides it, and the architecture that guarantees 100% canonical truth.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 font-sans text-xs sm:text-sm">
          <button
            onClick={() => {
              const el = document.getElementById("the-thinking");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-4 rounded-2xl bg-[#C25E38] dark:bg-[#E06D43] text-white font-bold shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2.5"
          >
            <span>Read The Thinking</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const el = document.getElementById("the-architecture");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-4 rounded-2xl bg-[#EFE9DF] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] font-bold hover:border-[#C25E38] transition-all cursor-pointer flex items-center gap-2"
          >
            <Cpu className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
            <span>Explore The Architecture</span>
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PART 1: THE KEYNOTE — WHY THE GITA?
          ══════════════════════════════════════════════════════════════ */}
      <section id="the-thinking" className="py-20 px-6 max-w-6xl mx-auto w-full border-t border-[#DFD5C6] dark:border-[#38332E]">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <span className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-[#C25E38] dark:text-[#E06D43] block mb-2">
            Part 1 • The Keynote
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[2.2rem] font-normal text-[#2D2622] dark:text-[#F5F2EB] font-serif leading-snug">
            A Theatrical Keynote on Timeless Clarity, Sacred Craftsmanship, and a Universal Guide for the Human Mind
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#5C4F45] dark:text-[#D4C7B8] font-sans leading-relaxed max-w-2xl mx-auto">
            Lights dim. The stage is dark except for a single warm spotlight. A black slide appears behind him with one word: CLARITY.
          </p>
        </div>

        {/* Cinematic Keynote Stage Container */}
        <div className="relative rounded-3xl bg-[#12100E] text-[#FAF7F2] border border-[#2E2822] shadow-2xl overflow-hidden p-6 sm:p-12 lg:p-16 mb-16">
          {/* Warm Ambient Spotlight Overhead */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#C25E38]/25 via-[#E06D43]/10 to-transparent blur-3xl pointer-events-none rounded-full" />

          {/* Act 1: The Opening Monologue */}
          <div className="relative z-10 max-w-3xl mx-auto font-serif text-lg sm:text-xl text-[#FAF7F2]/90 leading-relaxed space-y-6 mb-16">
            <p className="text-2xl sm:text-3xl font-light text-white italic">
              &ldquo;Thank you for visiting and reviewing.
            </p>

            <p>
              Every once in a while, a piece of wisdom comes along that changes everything.
            </p>

            <p>
              Most of the time, the world gives one dogma. He opens a religious book, and what does it tell him? It gives him a list of commandments. <em>&lsquo;Believe this or suffer.&rsquo; &lsquo;Bow down or burn.&rsquo; &lsquo;Retreat from the world, sit on a mountaintop, and renounce one&apos;s life.&rsquo;</em>
            </p>

            <p className="text-[#D4C7B8]">
              That’s how the world has operated for centuries. Fear. Guilt. Blind compliance.
            </p>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#1A1613] border-l-4 border-[#C25E38] space-y-4 my-8">
              <p className="text-white font-medium">
                Over 5,000 years ago, something radically different happened.
              </p>
              <div className="text-base sm:text-lg text-[#D4C7B8] leading-relaxed space-y-2">
                <p>It was not:</p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-[#FAF7F2]">
                  <li>spoken inside a temple,</li>
                  <li>handed down on stone tablets to a priest,</li>
                  <li>telling anyone to run away from reality.</li>
                </ul>
              </div>
              <p className="text-base sm:text-lg text-[#D4C7B8] leading-relaxed pt-2">
                Instead, it was spoken right in the middle of a battlefield. Between two roaring armies. To a man who dropped his bow, fell to his knees in tears, and said: <em>&lsquo;My mind is trembling. I am paralyzed by grief. I don&apos;t know what to do.&rsquo;</em>
              </p>
              <p className="text-base sm:text-lg text-[#E06D43] font-sans font-semibold">
                That seeker represents anyone at life&apos;s crossroads—every student, worker, parent, creator, or seeker who has ever felt overwhelmed by doubt, burnout, and fear of failure.
              </p>
            </div>

            <p className="text-xl sm:text-2xl text-white font-normal text-center py-4 border-y border-[#3E3832]/60">
              &ldquo;What the Gita gave him was not a religion. <br />
              <span className="text-[#E06D43] font-semibold italic">It gave him a universal guide and clear compass for the human mind.&rdquo;</span>
            </p>
          </div>

          {/* Act 2: The 4 Keynote Slides */}
          <div className="relative z-10 max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h3 className="text-2xl sm:text-4xl font-serif text-white mb-2">
                &ldquo;Why Read the Gita in the World?&rdquo;
              </h3>
              <p className="text-xs sm:text-sm font-sans uppercase tracking-[0.2em] text-[#A89F91]">
                4 Shastric Pillars of Sovereign Intellect
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Slide 1: Absolute Intellectual Freedom */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#1A1613] border border-[#3E3832] space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C25E38]/20 text-[#E06D43] text-xs font-mono font-semibold">
                    <span>1. Absolute Intellectual Freedom</span>
                  </div>
                  <span className="text-xs font-mono text-[#A89F91]">Bhagavad Gita 18.63</span>
                </div>

                <h4 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  1. It Demands Critical Thinking — Not Blind Faith
                </h4>

                {/* Shloka Card */}
                <div className="p-5 rounded-xl bg-[#12100E] border border-[#2E2822] space-y-2">
                  <p className="text-lg sm:text-xl font-serif text-[#E06D43] font-medium leading-relaxed">
                    विमृश्यैतदशेषेण यथेच्छसि तथा कुरु॥
                  </p>
                  <p className="text-xs font-mono text-[#A89F91]">
                    Bhagavad Gita, Chapter 18 • Verse 63
                  </p>
                  <p className="text-sm font-sans text-white/90 italic">
                    &ldquo;Reflect upon this wisdom completely and deeply, and then do as you choose.&rdquo;
                  </p>
                </div>

                <div className="text-sm sm:text-base font-serif text-[#D4C7B8] leading-relaxed space-y-3">
                  <p>
                    &ldquo;In almost every scripture on this planet, the conclusion is: <em>&lsquo;Obey.&rsquo;</em> Look at how Krishna concludes the Bhagavad Gita after 18 chapters of deep psychological dissection:
                  </p>
                  <p>
                    Think about that. The Supreme Divinity spends 700 verses explaining metaphysics, human nature, work, and the mind—and at the very end, He looks the seeker in the eye and says: <em>&lsquo;Don&apos;t take My word for it. Analyze it. Question it. And make your own sovereign choice.&rsquo;</em> There is no threat of eternal damnation. There is no coercion. It is the ultimate honor of human dignity and intellect.&rdquo;
                  </p>
                </div>
              </div>

              {/* Slide 2: Freedom From Religious Tribalism */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#1A1613] border border-[#3E3832] space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C25E38]/20 text-[#E06D43] text-xs font-mono font-semibold">
                    <span>2. Freedom From Religious Tribalism</span>
                  </div>
                  <span className="text-xs font-mono text-[#A89F91]">Bhagavad Gita 4.11</span>
                </div>

                <h4 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  2. It Rejects Religious Monopoly
                </h4>

                {/* Shloka Card */}
                <div className="p-5 rounded-xl bg-[#12100E] border border-[#2E2822] space-y-2">
                  <p className="text-lg sm:text-xl font-serif text-[#E06D43] font-medium leading-relaxed">
                    ये यथा मां प्रपद्यन्ते तांस्तथैव भजाम्यहम्। मम वर्त्मानुवर्तन्ते मनुष्याः पार्थ सर्वशः॥
                  </p>
                  <p className="text-xs font-mono text-[#A89F91]">
                    Bhagavad Gita, Chapter 4 • Verse 11
                  </p>
                  <p className="text-sm font-sans text-white/90 italic">
                    &ldquo;In whatever way men approach Me, so do I accept them. All paths, O Partha, lead to Me.&rdquo;
                  </p>
                </div>

                <div className="text-sm sm:text-base font-serif text-[#D4C7B8] leading-relaxed space-y-3">
                  <p>
                    &ldquo;Most religious systems tell you: <em>&lsquo;My path is the only path. Everyone else is lost.&rsquo;</em> The Gita destroys that boundary in one sentence.
                  </p>
                  <p>
                    It doesn’t ask you to convert. It doesn’t ask you to change your name or wear a costume. It tells you that wherever sincerity exists, truth is present. It is universal truth, not tribal allegiance.&rdquo;
                  </p>
                </div>
              </div>

              {/* Slide 3: The Ultimate Antidote to Modern Burnout */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#1A1613] border border-[#3E3832] space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C25E38]/20 text-[#E06D43] text-xs font-mono font-semibold">
                    <span>3. The Ultimate Antidote to Modern Burnout</span>
                  </div>
                  <span className="text-xs font-mono text-[#A89F91]">Bhagavad Gita 2.47</span>
                </div>

                <h4 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  3. It Solves the Disease of Outcome Anxiety
                </h4>

                {/* Shloka Card */}
                <div className="p-5 rounded-xl bg-[#12100E] border border-[#2E2822] space-y-2">
                  <p className="text-lg sm:text-xl font-serif text-[#E06D43] font-medium leading-relaxed">
                    कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥
                  </p>
                  <p className="text-xs font-mono text-[#A89F91]">
                    Bhagavad Gita, Chapter 2 • Verse 47
                  </p>
                  <p className="text-sm font-sans text-white/90 italic">
                    &ldquo;You have a right to your prescribed duty alone, never to its fruits. Let not the fruit of action be your motive, nor let your attachment be to inaction.&rdquo;
                  </p>
                </div>

                <div className="text-sm sm:text-base font-serif text-[#D4C7B8] leading-relaxed space-y-3">
                  <p>
                    &ldquo;Modern life is driven by metrics, stock prices, likes, and outcomes. And it’s making society sick. People are paralyzed by anxiety because their identity is tied to the result. The Gita diagnosed this 5,000 years before modern psychiatry.
                  </p>
                  <p>
                    This is the definition of peak performance. When you pour 100% of your soul into the craftsmanship of the work and completely detach your ego from the applause or the failure, you become invincible. That is Nishkama Karma.&rdquo;
                  </p>
                </div>
              </div>

              {/* Slide 4: Cognitive Architecture */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#1A1613] border border-[#3E3832] space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C25E38]/20 text-[#E06D43] text-xs font-mono font-semibold">
                    <span>4. Cognitive Architecture: The Mind as Friend or Enemy</span>
                  </div>
                  <span className="text-xs font-mono text-[#A89F91]">Bhagavad Gita 6.5–6</span>
                </div>

                <h4 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  4. It Predated Cognitive Behavioral Therapy by Millennia
                </h4>

                {/* Shloka Card */}
                <div className="p-5 rounded-xl bg-[#12100E] border border-[#2E2822] space-y-2">
                  <p className="text-lg sm:text-xl font-serif text-[#E06D43] font-medium leading-relaxed">
                    आत्मैवात्मनो बन्धुरात्मैव रिपुरात्मनः॥
                  </p>
                  <p className="text-xs font-mono text-[#A89F91]">
                    Bhagavad Gita, Chapter 6 • Verses 5–6
                  </p>
                  <p className="text-sm font-sans text-white/90 italic">
                    &ldquo;For one who has conquered the mind, the mind is the greatest of friends; but for one who has failed to master it, his own mind acts as his worst enemy.&rdquo;
                  </p>
                </div>

                <div className="text-sm sm:text-base font-serif text-[#D4C7B8] leading-relaxed space-y-3">
                  <p>
                    &ldquo;Before psychology understood neuroplasticity or cognitive reframing, the Gita declared that heaven and hell aren’t physical places; they are states of your internal consciousness.
                  </p>
                  <p>
                    No one can destroy you like your unmanaged thoughts, and no one can elevate you like a disciplined, focused mind.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Act 3: Why Does One Need to Read the Gita Today? */}
            <div className="mt-16 p-8 sm:p-10 rounded-2xl bg-[#181411] border border-[#3E3832] space-y-6">
              <h4 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                &ldquo;Why Does One Need to Read the Gita?&rdquo;
              </h4>

              <div className="text-base sm:text-lg font-serif text-[#D4C7B8] leading-relaxed space-y-4">
                <p>
                  &ldquo;Now, one might have a question: <em>&lsquo;Why should I? I visit temples, do rituals, enjoy festivals, and follow traditions. Why does one need to read the Gita then?&rsquo;</em>
                </p>
                <p className="text-white font-medium">
                  Here’s the hard truth:
                </p>
                <p>
                  Most people inherit their tradition as ceremony. They light an incense stick, ring a bell, recite a shloka like a magic spell, but their mind remains in chaos. They confuse mythology with methodology.
                </p>
                <p>
                  Look at what the classical tradition itself says about the Gita in the sacred Gītā Dhyānam:
                </p>
              </div>

              {/* Gita Dhyanam 4 Card */}
              <div className="p-5 rounded-xl bg-[#12100E] border border-[#2E2822] space-y-2 my-4">
                <p className="text-lg sm:text-xl font-serif text-[#E06D43] font-medium leading-relaxed">
                  सर्वोपनिषदो गावो दोग्धा गोपालनन्दनः। पार्थो वत्सः सुधीर्भोक्ता दुग्धं गीतामृतं महत्॥
                </p>
                <p className="text-xs font-mono text-[#A89F91]">
                  Gītā Dhyānam, Verse 4
                </p>
                <p className="text-sm font-sans text-white/90 italic">
                  &ldquo;All the Upanishads are the cows; Krishna is the milker; Arjuna is the calf; the pure-hearted seeker is the drinker; and the nectar-like Gita is the supreme milk.&rdquo;
                </p>
              </div>

              <div className="text-base sm:text-lg font-serif text-[#D4C7B8] leading-relaxed space-y-3">
                <p>
                  One doesn’t need to wander through 108 Upanishads or thousands of Vedic hymns. The entire metaphysical essence of Sanatana Dharma has been concentrated into 700 clean, elegant verses.
                </p>
                <p className="text-white font-medium">
                  If one doesn’t read the Gita, he is living in a palace while begging for bread outside. Reading the Gita transforms his heritage from an ancestral superstition into an unshakable intellectual armor.&rdquo;
                </p>
              </div>
            </div>

            {/* Act 4: The Climax — Why NityaGeeta Was Built */}
            <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#1C1713] to-[#12100E] border-2 border-[#C25E38]/50 text-center space-y-6">
              <h4 className="text-3xl sm:text-5xl font-serif text-white">
                &ldquo;This Solution Is Why NityaGeeta Was Built&rdquo;
              </h4>

              <div className="max-w-3xl mx-auto text-base sm:text-lg font-serif text-[#D4C7B8] leading-relaxed space-y-4 text-left sm:text-center">
                <p>
                  When modern AI came along, people started asking generic LLMs for spiritual guidance. And what did they do? They hallucinated fake verses. They gave motivational clichés. They gave black-box answers with zero proof.
                </p>
                <p className="text-white font-bold text-xl sm:text-2xl">
                  NityaGeeta said: No. That is unacceptable.
                </p>
                <p>
                  If one is going to touch something this sacred, one treats it with uncompromising reverence. One indexes all 700 verses into memory. One links every single line back to the original Gita Press and Acharya manuscripts. NityaGeeta has 5 elite models cross-examine each other so no single AI can hallucinate.
                </p>
                <p className="text-xl sm:text-2xl font-serif text-[#E06D43] font-semibold pt-4">
                  &ldquo;That is NityaGeeta. Timeless clarity, delivered through technology worthy of the soul.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PART 2: THE ARCHITECTURE — HOW IT WORKS
          ══════════════════════════════════════════════════════════════ */}
      <section id="the-architecture" className="py-20 px-6 max-w-6xl mx-auto w-full border-t border-[#DFD5C6] dark:border-[#38332E]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-[#C25E38] dark:text-[#E06D43] block mb-2">
            Part 2 • Technical Architecture &amp; Data Pipeline
          </span>
          <h2 className="text-3xl sm:text-5xl font-normal text-[#2D2622] dark:text-[#F5F2EB] font-serif">
            The System Architecture
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#5C4F45] dark:text-[#D4C7B8] font-sans leading-relaxed">
            A clean, production-grade ensemble pipeline connecting over 5,000+ years of Sanskrit commentary to real-time, low-latency AI dialogue.
          </p>
        </div>

        {/* Normal, Clean Visual Architecture Flow Cards (No raw code box) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 font-sans">
          {/* Card 1: Sacred Ingestion */}
          <div className="p-6 rounded-3xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DFD5C6] dark:border-[#38332E] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center mb-4">
                <Database className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43] uppercase tracking-wider block mb-1">
                Stage 1 • Ingestion
              </span>
              <h3 className="text-lg font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB] mb-2">
                Canonical OCR &amp; Digitization
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                Direct high-resolution scan ingestion of 1923 Gita Press Gorakhpur Sadhaka-Sanjivani, Adi Shankaracharya&apos;s Advaita Bhashya, and Winthrop Sargeant&apos;s linguistic concordance.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8E1D7] dark:border-[#38332E] text-xs font-mono text-[#8C7B70] dark:text-[#A89F91]">
              700 Verses • 18 Chapters • 100% Indexed
            </div>
          </div>

          {/* Card 2: Semantic Retrieval */}
          <div className="p-6 rounded-3xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DFD5C6] dark:border-[#38332E] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center mb-4">
                <Server className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43] uppercase tracking-wider block mb-1">
                Stage 2 • Storage &amp; Search
              </span>
              <h3 className="text-lg font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB] mb-2">
                Hybrid Vector &amp; Fast Cache
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                In-memory verse lookup (&lt;2ms latency), Weaviate hybrid vector search for deep semantic matching, and PostgreSQL session persistence with 18-day TTL tokens.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8E1D7] dark:border-[#38332E] text-xs font-mono text-[#8C7B70] dark:text-[#A89F91]">
              PostgreSQL 16 • Redis 7.2 • Weaviate Cloud
            </div>
          </div>

          {/* Card 3: Multi-Model Consensus */}
          <div className="p-6 rounded-3xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DFD5C6] dark:border-[#38332E] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43] uppercase tracking-wider block mb-1">
                Stage 3 • Consensus
              </span>
              <h3 className="text-lg font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB] mb-2">
                5-Model Parallel Council
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                Queries Gemini 2.5, DeepSeek-R1, Claude 3.5, Llama 3.3, and Qwen 2.5 simultaneously. The models cross-examine scripture interpretations to completely remove single-model bias.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8E1D7] dark:border-[#38332E] text-xs font-mono text-[#8C7B70] dark:text-[#A89F91]">
              Parallel asyncio • MoA Ensemble Judge
            </div>
          </div>

          {/* Card 4: Anti-Hallucination Gate */}
          <div className="p-6 rounded-3xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DFD5C6] dark:border-[#38332E] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43] uppercase tracking-wider block mb-1">
                Stage 4 • Verification
              </span>
              <h3 className="text-lg font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB] mb-2">
                Anti-Hallucination Gate
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                Deterministic regex matching against canonical Sanskrit verses. Rejects any synthesized response scoring below 95% groundedness before the seeker ever sees a word.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8E1D7] dark:border-[#38332E] text-xs font-mono text-[#8C7B70] dark:text-[#A89F91]">
              Deterministic Shloka Regex • RAGAS Faithful
            </div>
          </div>
        </div>

        {/* ── 4-STAGE GROUNDING PIPELINE CARDS ── */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#C25E38] dark:text-[#E06D43] block mb-2">
              Deep Dive
            </span>
            <h3 className="text-2xl sm:text-4xl font-serif text-[#2D2622] dark:text-[#F5F2EB]">
              The 4-Stage Grounding Pipeline
            </h3>
            <p className="mt-3 text-sm sm:text-base text-[#5C4F45] dark:text-[#D4C7B8] font-sans">
              How NityaGeeta transforms sacred verses preserved over millennia (spanning more than 5,000 years) into real-time, actionable psychological clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
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

                    <span className="px-3 py-1 rounded-full bg-[#EFE9DF] dark:bg-[#2A2622] text-[#C25E38] dark:text-[#E06D43] text-xs font-sans font-bold tracking-wider uppercase inline-block mb-3">
                      {step.badge}
                    </span>

                    <h4 className="text-2xl font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB] mb-2">
                      {step.title}
                    </h4>
                    <h5 className="text-xs sm:text-sm font-sans font-semibold text-[#8C7B70] dark:text-[#A89F91] mb-4">
                      {step.subtitle}
                    </h5>

                    <p className="text-xs sm:text-sm font-sans text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed mb-6">
                      {step.summary}
                    </p>
                  </div>

                  <div className="border-t border-[#E8E1D7] dark:border-[#38332E] pt-4 mt-auto">
                    <div className="text-xs font-sans font-bold uppercase tracking-wider text-[#8C7B70] dark:text-[#A89F91] mb-2">
                      Primary Sources &amp; Integrity:
                    </div>
                    <div className="space-y-1.5 font-sans">
                      {step.sources.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-[#2D2622] dark:text-[#F5F2EB] font-medium">{s.name}</span>
                          <span className="text-xs text-[#8C7B70] dark:text-[#A89F91]">{s.tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── INTERACTIVE LIVE CONSENSUS SIMULATION ── */}
        <div className="mb-20 font-sans">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C25E38] dark:text-[#E06D43] block mb-2">
              Live Engine Trace
            </span>
            <h3 className="text-3xl sm:text-4xl font-serif font-normal text-[#2D2622] dark:text-[#F5F2EB]">
              Simulated Multi-Agent Trace
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8]">
              Select a life dilemma below to inspect real-time agent verification steps and ground truth citations.
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-8">
            {SIMULATION_CASES.map((sc) => (
              <button
                key={sc.id}
                onClick={() => setActiveSimulation(sc)}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeSimulation.id === sc.id
                    ? "bg-[#C25E38] dark:bg-[#E06D43] text-white shadow-md"
                    : "bg-[#EFE9DF] dark:bg-[#262320] text-[#5C4F45] dark:text-[#D4C7B8] hover:border-[#C25E38]"
                }`}
              >
                {sc.title}
              </button>
            ))}
          </div>

          {/* Trace Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DFD5C6] dark:border-[#38332E] shadow-md max-w-4xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E1D7] dark:border-[#38332E] pb-4">
              <div>
                <span className="text-xs font-mono text-[#C25E38] dark:text-[#E06D43] font-bold">
                  {activeSimulation.chapter}
                </span>
                <h4 className="text-xl font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB] mt-0.5">
                  {activeSimulation.title}
                </h4>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                100% Canonical Grounding
              </span>
            </div>

            {/* Devanagari Shloka */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#EFE9DF]/60 dark:bg-[#262320]/60 border border-[#DFD5C6] dark:border-[#38332E] text-center font-serif text-lg sm:text-xl text-[#C25E38] dark:text-[#E06D43] leading-loose whitespace-pre-line font-medium">
              {activeSimulation.sanskrit}
            </div>

            {/* Step-by-Step Agent Execution */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C7B70] dark:text-[#A89F91] block">
                Verification Pipeline Log:
              </span>
              {activeSimulation.steps.map((st) => (
                <div
                  key={st.id}
                  className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E8E1D7] dark:border-[#38332E] flex items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-[#2D2622] dark:text-[#F5F2EB] font-medium">{st.label}</span>
                  </div>
                  {st.meta && (
                    <span className="text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43] shrink-0">
                      {st.meta}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Citations Preview */}
            <div className="pt-4 border-t border-[#E8E1D7] dark:border-[#38332E]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C7B70] dark:text-[#A89F91] block mb-3">
                Extracted Ground Truth Citations:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeSimulation.citations.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-[#EFE9DF]/50 dark:bg-[#262320]/60 border border-[#DFD5C6] dark:border-[#38332E] text-xs space-y-1.5"
                  >
                    <div className="font-bold text-[#2D2622] dark:text-[#F5F2EB] font-serif text-sm">
                      {c.title}
                    </div>
                    <p className="text-[#6B5E55] dark:text-[#A89F91] italic leading-relaxed">
                      &ldquo;{c.quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── COMPARISON MATRIX ── */}
        <div className="mb-20 font-sans">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C25E38] dark:text-[#E06D43] block mb-2">
              Rigorous Benchmarking
            </span>
            <h3 className="text-3xl sm:text-4xl font-serif text-[#2D2622] dark:text-[#F5F2EB]">
              NityaGeeta vs Generic AI Wrappers
            </h3>
            <p className="mt-3 text-sm sm:text-base text-[#5C4F45] dark:text-[#D4C7B8]">
              Why ordinary chatbots fail on ancient scripture, and how our architecture guarantees fidelity.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[#DFD5C6] dark:border-[#38332E] bg-[#FAF7F2] dark:bg-[#201D1A] shadow-md">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#DFD5C6] dark:border-[#38332E] bg-[#EFE9DF]/70 dark:bg-[#262320]/70 text-[#2D2622] dark:text-[#F5F2EB]">
                  <th className="p-4 sm:p-5 font-serif font-bold">Dimension</th>
                  <th className="p-4 sm:p-5 font-serif font-bold text-red-700 dark:text-red-400">Generic AI (ChatGPT / Gemini)</th>
                  <th className="p-4 sm:p-5 font-serif font-bold text-[#8C7B70] dark:text-[#A89F91]">Single-Model RAG</th>
                  <th className="p-4 sm:p-5 font-serif font-bold text-[#C25E38] dark:text-[#E06D43]">NityaGeeta Multi-Agent Council</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D7] dark:divide-[#38332E]">
                {COMPARISON_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#EFE9DF]/30 dark:hover:bg-[#262320]/30 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-[#2D2622] dark:text-[#F5F2EB]">
                      {row.dimension}
                    </td>
                    <td className="p-4 sm:p-5 text-[#6B5E55] dark:text-[#A89F91]">
                      {row.genericAi.text}
                    </td>
                    <td className="p-4 sm:p-5 text-[#6B5E55] dark:text-[#A89F91]">
                      {row.singleRag.text}
                    </td>
                    <td className="p-4 sm:p-5 font-semibold text-[#C25E38] dark:text-[#E06D43] bg-[#C25E38]/5 dark:bg-[#E06D43]/10">
                      {row.nityaGeeta.text}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ACADEMIC CITATIONS ACCORDION ── */}
        <div className="rounded-3xl border border-[#DFD5C6] dark:border-[#38332E] bg-[#FAF7F2] dark:bg-[#201D1A] overflow-hidden shadow-sm font-sans">
          <button
            onClick={() => setIntegrityCitationsOpen(!integrityCitationsOpen)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#EFE9DF]/40 dark:hover:bg-[#262320]/40 transition cursor-pointer text-left select-none"
            aria-expanded={integrityCitationsOpen}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
              <h4 className="text-sm sm:text-base font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB]">
                Scriptural Fidelity &amp; Integrity Citations
              </h4>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43]">
                4
              </span>
            </div>

            <div className="flex items-center gap-2 text-[#8C7B70] dark:text-[#A89F91] text-xs">
              <span className="hidden sm:inline text-xs">
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
                        <span className="px-1.5 py-0.5 rounded text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43] bg-[#C25E38]/15 dark:bg-[#E06D43]/25">
                          [1]
                        </span>
                        <strong className="text-[#2D2622] dark:text-[#F5F2EB] font-serif text-sm">
                          Unanchored LLM Hallucination Rates
                        </strong>
                      </div>
                      <p className="text-xs sm:text-sm text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
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
                        <span className="px-1.5 py-0.5 rounded text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43] bg-[#C25E38]/15 dark:bg-[#E06D43]/25">
                          [2]
                        </span>
                        <strong className="text-[#2D2622] dark:text-[#F5F2EB] font-serif text-sm">
                          Canonical Corpus Ground Truth
                        </strong>
                      </div>
                      <p className="text-xs sm:text-sm text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
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
                    </div>
                  </div>

                  {/* Citation 3 */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#EFE9DF]/50 dark:bg-[#262320]/60 border border-[#DFD5C6]/70 dark:border-[#38332E]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43] bg-[#C25E38]/15 dark:bg-[#E06D43]/25">
                          [3]
                        </span>
                        <strong className="text-[#2D2622] dark:text-[#F5F2EB] font-serif text-sm">
                          Multi-Agent Consensus Reliability
                        </strong>
                      </div>
                      <p className="text-xs sm:text-sm text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
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
                        <span className="px-1.5 py-0.5 rounded text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43] bg-[#C25E38]/15 dark:bg-[#E06D43]/25">
                          [4]
                        </span>
                        <strong className="text-[#2D2622] dark:text-[#F5F2EB] font-serif text-sm">
                          Deterministic Verification Gate
                        </strong>
                      </div>
                      <p className="text-xs sm:text-sm text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
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

      {/* ══════════════════════════════════════════════════════════════
          PART 3: INVITATION TO START — CALL TO ACTION
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full text-center font-sans border-t border-[#DFD5C6] dark:border-[#38332E]">
        <div className="w-full p-12 sm:p-16 md:p-20 rounded-3xl bg-linear-to-b from-[#EFE9DF]/80 via-[#FAF7F2] to-[#FAF7F2] dark:from-[#262320]/90 dark:via-[#1E1B18] dark:to-[#1A1816] border border-[#DFD5C6] dark:border-[#38332E] shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C25E38]/10 dark:bg-[#E06D43]/15 rounded-full blur-3xl pointer-events-none" />

          <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-[0.28em] text-[#C25E38] dark:text-[#E06D43] relative z-10">
            Part 3 • An Invitation to Truth
          </p>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-[#2D2622] dark:text-[#F5F2EB] leading-tight relative z-10">
            Here&apos;s to the Seekers. <br />
            <span className="text-[#C25E38] dark:text-[#E06D43] italic block mt-1 sm:mt-2">
              The Thinkers. The Strivers.
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-[#5C4F45] dark:text-[#D4C7B8] max-w-2xl mx-auto leading-relaxed font-sans font-normal relative z-10">
            The clarity you have been searching for has existed for over 5,000 years—eternal, unshakable, and canonical. All it took was the reverence to build technology worthy of delivering it.
          </p>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 relative z-10">
            <button
              onClick={() => router.push("/app")}
              className="px-10 py-5 rounded-2xl bg-[#C25E38] dark:bg-[#E06D43] text-white font-bold text-base shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-3"
            >
              <span>Start Your Dialogue Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => router.push("/sources")}
              className="px-10 py-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] font-bold text-base hover:border-[#C25E38] transition-all cursor-pointer flex items-center gap-3"
            >
              <BookOpen className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43]" />
              <span>Explore Sources &amp; Manuscripts</span>
            </button>
          </div>
        </div>
      </section>

      {/* Universal Global Footer */}
      <Footer />
    </div>
  );
}
