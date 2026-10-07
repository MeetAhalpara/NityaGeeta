"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Check,
  ExternalLink,
  Languages
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";

interface Advisor {
  id: string;
  name: string;
  role: string;
  tagline: string;
  badge: string;
  tradition: string;
  bookTitle: string;
  publisher: string;
  sourceUrl: string;
  coreBelief: string;
  quote: string;
  lens: string;
  icon: React.ElementType;
}

const ADVISORS_DATA: Advisor[] = [
  {
    id: "scripture",
    name: "Vidvan (The Scripture Scholar)",
    role: "Scripture Ground Truth",
    tagline: "Guardian of the 700 Canonical Verses",
    badge: "Advisor 1 • Canon",
    tradition: "Classical Sanskrit Baseline (Zero Sectarian Bias)",
    bookTitle: "Srimad Bhagavad Gita (Gita Press Original)",
    publisher: "Gita Press Gorakhpur • Centenary Heritage Archive (Est. 1923)",
    sourceUrl: "/sources#geeta-1",
    coreBelief:
      "Truth cannot be improvised. Every answer must be anchored directly in the uncorrupted 700 Devanagari Sanskrit verses, free of speculative interpretations or modern revisions.",
    quote:
      "Before a single syllable of guidance is offered, verify the Sanskrit origin. Did Sri Krishna speak this in the Gita, or is it unverified speculation? If the verse is not in the canon, it does not exist.",
    lens: "Canonical Integrity & Exact Verse Citations",
    icon: BookOpen,
  },
  {
    id: "linguistics",
    name: "Prof. Winthrop Sargeant",
    role: "Linguistic Rigor & Etymology",
    tagline: "Grammatical Concordance & Morphological Parsing",
    badge: "Advisor 2 • Language",
    tradition: "Academic Sanskrit Grammar (SUNY Press)",
    bookTitle: "The Bhagavad Gita: Interlinear Translation & Grammar",
    publisher: "State University of New York Press • Ed. Christopher Key Chapple",
    sourceUrl: "/sources#geeta-2",
    coreBelief:
      "Every Sanskrit word contains an exact verbal root (Dhātu), grammatical case, mood, and tense. English renderings must faithfully preserve the precise morphological architecture of the sacred language.",
    quote:
      "Do not settle for loose poetic approximations. When Sri Krishna says ‘Karmanyevadhikaraste’, parse the dative case and the root ‘kṛ’. Precision in Sanskrit grammar is the foundation of fidelity in truth.",
    lens: "Root Etymology, Word-for-Word Concordance & Syntax",
    icon: Languages,
  },
  {
    id: "metaphysics",
    name: "Acharya Shankara",
    role: "Inner Stillness & Witness Consciousness",
    tagline: "Classical Advaita Vedanta Commentary (8th Century CE)",
    badge: "Advisor 3 • Stillness",
    tradition: "Advaita Vedanta (Classical Non-Dualism)",
    bookTitle: "Srimad Bhagavad Gita Shankara Bhashya",
    publisher: "Adi Shankaracharya • Translated by Alladi Mahadeva Sastry",
    sourceUrl: "/sources#geeta-3",
    coreBelief:
      "Suffering is born of false identification (Adhyāsa) between the eternal witness (Sākṣī Ātman) and the agitated mind. Liberation is not achieved through restless doing, but through immediate Self-knowledge (Jñāna).",
    quote:
      "Suffering begins when the seeker mistakes the turbulent waves of the mind for the ocean of consciousness. You are the eternal Witness (Sakshi Atman). Know your true nature, and existential grief dissolves.",
    lens: "Witness Consciousness, Non-Dual Discernment & Inner Peace",
    icon: Sparkles,
  },
  {
    id: "action",
    name: "Swami Ramsukhdas",
    role: "Practical Action & Daily Duty",
    tagline: "Householder Sadhana & Nishkama Karma Yoga",
    badge: "Advisor 4 • Duty",
    tradition: "Gita Press Gorakhpur (Practical Householder Vedanta)",
    bookTitle: "Srimad Bhagavad Gita (Sadhaka-Sanjivani)",
    publisher: "Gita Press Gorakhpur • 1,100+ Verse-by-Verse Analytical Pages",
    sourceUrl: "/sources#geeta-4",
    coreBelief:
      "The Gita was spoken in the middle of a battlefield, not on a quiet mountain. Nishkama Karma Yoga means performing one's prescribed duty with wholehearted dedication while renouncing anxiety over outcomes.",
    quote:
      "The Gita was spoken in the middle of a battlefield, not on a quiet mountain. Put your full energy into your duty right now, without claiming ownership of the fruits. That is peace in action.",
    lens: "Action Without Burnout, Workplace Ethics & Moral Resolve",
    icon: Flame,
  },
  {
    id: "modern",
    name: "Dr. Vijnana (Vedic Science Scholar)",
    role: "Modern Mind & Scientific Living",
    tagline: "Cognitive Psychology, Circadian Discipline & Sanatan Roots",
    badge: "Advisor 5 • Modern Mind",
    tradition: "Applied Vedic Science & Cognitive Discipline",
    bookTitle: "B.O.S.S : Basics of Sanatan Sanskriti",
    publisher: "Prateeik Prajapati & Veducation Cultural Research",
    sourceUrl: "/sources#ved-1",
    coreBelief:
      "Ancient Vedic disciplines are not blind rituals—they are neuroscience and behavioral psychology proven across millennia. Dincharya and mental mastery must be seamlessly integrated into modern high-performance life.",
    quote:
      "When mental stress or burnout strikes, align your daily routine (Dincharya) with natural law. Ancient breath control and meditative equanimity are the ultimate biological antidotes to modern overload.",
    lens: "Habit Architecture, Circadian Mastery & Cognitive Clarity",
    icon: BrainCircuit,
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
    dimension: "Multi-Perspective Consensus",
    genericAi: { text: "Single unanchored prompt (single point of cognitive failure)", ref: "3" },
    singleRag: { text: "Single prompt wrapper without cross-examination" },
    nityaGeeta: { text: "The Council of 5 (Vidvan, Prof., Acharya, Swami, Dr. + The 6th Mind)", ref: "3" },
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
      { id: "s1", type: "step" as const, label: "Scanning canonical verses for Nishkama Karma Yoga principles", status: "complete" as const },
      { id: "s2", type: "step" as const, label: "Consulting the Council: Vidvan (Scripture), Prof. (Linguistic), Acharya (Inner), Swami (Practical), Dr. (Modern)", status: "complete" as const, meta: "5/5 scored" },
      { id: "s3", type: "step" as const, label: "The Sixth Mind synthesis: Calculating 98.6/100 groundedness • Unifying actionable protocol", status: "complete" as const },
    ],
    citations: [
      {
        id: "c1",
        title: "Sadhaka-Sanjivani: Nishkama Karma",
        chapter: "2",
        verse: "47",
        page: 142,
        domain: "gita-press.org",
        url: "/sources#geeta-4",
        quote: "You have a right to perform your prescribed duty, but never to the fruits of action. Never consider yourself the cause of the results, nor be attached to inaction.",
      },
      {
        id: "c2",
        title: "Shankara Bhashya on Gita 2.47",
        chapter: "2",
        verse: "47",
        domain: "advaita-vedanta.org",
        url: "/sources#geeta-3",
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
      { id: "s2", type: "step" as const, label: "Cross-verifying Sanskrit syntax with Prof. (Linguistic) concordance", status: "complete" as const },
      { id: "s3", type: "step" as const, label: "The Sixth Mind synthesis: Unifying Vidvan (Scripture), Acharya (Inner), and Swami (Practical)", status: "complete" as const, meta: "99.2% consensus" },
    ],
    citations: [
      {
        id: "c1",
        title: "Sadhaka-Sanjivani: The Eternal Atman",
        chapter: "2",
        verse: "20",
        page: 86,
        domain: "gita-press.org",
        url: "/sources#geeta-4",
        quote: "The soul is never born, nor does it ever die. Unborn, eternal, ever-existing and primeval, it is not slain when the body is slain.",
      },
    ],
  },
];

export default function ArchitecturePage() {
  const router = useRouter();
  const [activeSimulation, setActiveSimulation] = useState(SIMULATION_CASES[0]);
  const [integrityCitationsOpen, setIntegrityCitationsOpen] = useState(false);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState("scripture");
  const activeAdvisor = ADVISORS_DATA.find((a) => a.id === selectedAdvisorId) || ADVISORS_DATA[0];

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
          PART 2: THE COUNCIL OF CLARITY — THE SYSTEM ARCHITECTURE
          ══════════════════════════════════════════════════════════════ */}
      <section id="the-architecture" className="py-20 px-6 max-w-6xl mx-auto w-full border-t border-[#DFD5C6] dark:border-[#38332E]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-[#C25E38] dark:text-[#E06D43] block mb-2">
            Part 2 • Technical Architecture &amp; The Council of Clarity
          </span>
          <h2 className="text-3xl sm:text-5xl font-normal text-[#2D2622] dark:text-[#F5F2EB] font-serif leading-tight">
            The Rule of Five Advisors &amp; The Sixth Mind
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#5C4F45] dark:text-[#D4C7B8] font-sans leading-relaxed">
            When facing a defining life dilemma, true clarity is never found in a single echo chamber, nor in a crowd of twenty shouting opinions. It requires five senior perspectives at one table—and a decisive mind to distill them into truth.
          </p>
        </div>

        {/* ── THE 3-WAY CONTRAST: WHY 5? ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 font-sans">
          {/* Card 1: 1-2 Voices */}
          <div className="p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DFD5C6] dark:border-[#38332E] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                  Too Narrow
                </span>
                <span className="text-xs font-mono text-[#8C7B70] dark:text-[#A89F91]">
                  1 to 2 Voices
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB] mb-2">
                The Echo Chamber
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                Consulting only one or two voices traps the seeker in personal blind spots, translator bias, or sectarian dogma. If that sole voice misinterprets a verse, the entire decision is compromised with zero cross-examination.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8E1D7] dark:border-[#38332E] text-xs font-semibold text-amber-700 dark:text-amber-400">
              Vulnerable to Single-Point Bias
            </div>
          </div>

          {/* Card 2: 10-20 Voices */}
          <div className="p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DFD5C6] dark:border-[#38332E] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-800 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
                  Too Noisy
                </span>
                <span className="text-xs font-mono text-[#8C7B70] dark:text-[#A89F91]">
                  10 to 20 Voices
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB] mb-2">
                Analysis Paralysis
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                Asking a dozen voices about one life dilemma produces twenty conflicting answers. One urges total renunciation, another aggressive ambition, another endless contemplation. The seeker is left overwhelmed and unable to take action.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8E1D7] dark:border-[#38332E] text-xs font-semibold text-rose-700 dark:text-rose-400">
              Freezes Decision-Making
            </div>
          </div>

          {/* Card 3: The Council of 5 */}
          <div className="p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#201D1A] border-2 border-[#C25E38] dark:border-[#E06D43] shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C25E38]/10 dark:bg-[#E06D43]/15 rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-[#C25E38]/15 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] text-xs font-bold uppercase tracking-wider">
                  The Golden Mean
                </span>
                <span className="text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43]">
                  The Council of 5
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB] mb-2">
                Balanced High Council
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                Five distinct senior lenses span the complete human spectrum: Sacred Ground Truth, Linguistic Rigor, Metaphysical Stillness, Daily Duty, and Modern Science. Broad enough to eliminate error, focused enough to converge on truth.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8E1D7] dark:border-[#38332E] text-xs font-bold text-[#C25E38] dark:text-[#E06D43] flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Optimal Human Decision Architecture</span>
            </div>
          </div>
        </div>

        {/* ── THE 5 LIVING SCHOLARS SHOWCASE ── */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#C25E38] dark:text-[#E06D43] block mb-2">
              The Five Senior Perspectives
            </span>
            <h3 className="text-2xl sm:text-4xl font-serif text-[#2D2622] dark:text-[#F5F2EB]">
              Meet The Council
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] font-sans">
              Each advisor holds unwavering conviction rooted in their foundational canonical manuscript. Select an advisor to inspect their voice and canonical text.
            </p>
          </div>

          {/* Interactive Advisor Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 font-sans">
            {ADVISORS_DATA.map((adv) => {
              const AdvIcon = adv.icon;
              const isSelected = selectedAdvisorId === adv.id;
              return (
                <button
                  key={adv.id}
                  onClick={() => setSelectedAdvisorId(adv.id)}
                  aria-selected={isSelected}
                  role="tab"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border",
                    isSelected
                      ? "bg-[#C25E38] dark:bg-[#E06D43] text-white border-[#C25E38] dark:border-[#E06D43] shadow-md scale-102"
                      : "bg-[#EFE9DF]/80 dark:bg-[#262320] text-[#5C4F45] dark:text-[#D4C7B8] border-[#DFD5C6] dark:border-[#38332E] hover:border-[#C25E38] dark:hover:border-[#E06D43]"
                  )}
                >
                  <AdvIcon className="w-4 h-4 shrink-0" />
                  <span>{adv.name.split(" ")[0]}</span>
                  <span className="hidden md:inline text-xs opacity-80">({adv.role.split(" ")[0]})</span>
                </button>
              );
            })}
          </div>

          {/* Active Advisor Presentation Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAdvisor.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="p-8 sm:p-12 rounded-3xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DFD5C6] dark:border-[#38332E] shadow-xl max-w-5xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
                {/* Left Column: Living Voice & Scholar Profile (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] text-xs font-bold uppercase tracking-wider">
                      {activeAdvisor.badge}
                    </span>
                    <span className="text-xs text-[#8C7B70] dark:text-[#A89F91] font-medium">
                      {activeAdvisor.tradition}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB]">
                      {activeAdvisor.name}
                    </h4>
                    <p className="text-xs sm:text-sm font-mono text-[#C25E38] dark:text-[#E06D43] mt-1">
                      Domain: {activeAdvisor.role}
                    </p>
                  </div>

                  {/* Dramatic Living Quote */}
                  <div className="p-6 rounded-2xl bg-[#EFE9DF]/60 dark:bg-[#262320]/60 border-l-4 border-[#C25E38] dark:border-[#E06D43] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C7B70] dark:text-[#A89F91]">
                      <Quote className="w-3.5 h-3.5 text-[#C25E38] dark:text-[#E06D43]" />
                      <span>Living Voice in Council</span>
                    </div>
                    <blockquote className="font-serif italic text-base sm:text-lg text-[#2D2622] dark:text-[#F5F2EB] leading-relaxed">
                      &ldquo;{activeAdvisor.quote}&rdquo;
                    </blockquote>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8C7B70] dark:text-[#A89F91] block">
                      Core Guiding Conviction:
                    </span>
                    <p className="text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                      {activeAdvisor.coreBelief}
                    </p>
                  </div>
                </div>

                {/* Right Column: Canonical Manuscript & Clean Read PDF Button (5 cols) */}
                <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-[#EFE9DF]/50 dark:bg-[#1A1816] border border-[#DFD5C6] dark:border-[#38332E] flex flex-col justify-between h-full space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C25E38] dark:text-[#E06D43] mb-3">
                      <BookOpen className="w-4 h-4" />
                      <span>Primary Manuscript</span>
                    </div>
                    <h5 className="text-lg sm:text-xl font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB] mb-2 leading-snug">
                      {activeAdvisor.bookTitle}
                    </h5>
                    <p className="text-xs text-[#8C7B70] dark:text-[#A89F91] leading-relaxed mb-4">
                      {activeAdvisor.publisher}
                    </p>
                    <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#E8E1D7] dark:border-[#38332E] text-xs text-[#5C4F45] dark:text-[#D4C7B8]">
                      <strong className="text-[#2D2622] dark:text-[#F5F2EB] block mb-0.5">Council Lens:</strong>
                      {activeAdvisor.lens}
                    </div>
                  </div>

                  {/* Redirect directly to book in sources library */}
                  <div className="pt-4 border-t border-[#DFD5C6] dark:border-[#38332E]">
                    <Link
                      href={activeAdvisor.sourceUrl}
                      className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#C25E38] dark:bg-[#E06D43] text-white font-sans text-xs sm:text-sm font-bold shadow-md hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Read in Sources Library</span>
                      <ArrowRight className="w-4 h-4 opacity-80" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── THE SIXTH MIND: THE DECISIVE LEADER ── */}
        <div className="mb-20">
          <div className="relative rounded-3xl bg-[#12100E] text-[#FAF7F2] border border-[#2E2822] shadow-2xl overflow-hidden p-8 sm:p-12 lg:p-16">
            {/* Warm overhead glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-[#C25E38]/20 via-[#E06D43]/10 to-transparent blur-3xl pointer-events-none rounded-full" />

            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
              <span className="px-3.5 py-1 rounded-full bg-[#C25E38]/20 text-[#E06D43] text-xs font-sans font-bold uppercase tracking-widest inline-block border border-[#C25E38]/30">
                The Head of the Table • Synthesis
              </span>

              <h3 className="text-3xl sm:text-5xl font-serif text-white font-normal leading-tight">
                The Sixth Mind: The Decisive Leader
              </h3>

              <div className="text-base sm:text-lg font-serif text-[#D4C7B8] leading-relaxed space-y-4 text-left sm:text-center">
                <p>
                  In the real world, when five senior advisors finish speaking in a boardroom or a council chamber, the seeker does not leave the room with five conflicting instructions.
                </p>
                <p className="text-white font-medium text-lg sm:text-xl">
                  At the head of the table sits the Decisive Sixth Mind.
                </p>
                <p>
                  It listens to <strong className="text-white">Vidvan</strong> for unyielding scriptural ground truth. It listens to <strong className="text-white">Prof. Sargeant</strong> for grammatical precision. It listens to <strong className="text-white">Acharya Shankara</strong> for inner stillness. It listens to <strong className="text-white">Swami Ramsukhdas</strong> for actionable duty. And it listens to <strong className="text-white">Dr. Vijnana</strong> for modern cognitive relevance.
                </p>
                <p>
                  The Sixth Mind weighs every perspective, eliminates conflicting noise, rejects misattributed verses, and unifies all five into one calm, coherent, compassionate resolution.
                </p>
                <p className="text-xl sm:text-2xl font-serif text-[#E06D43] font-semibold pt-4">
                  &ldquo;Five perspectives debate. One decisive mind unifies. That is how clarity is born.&rdquo;
                </p>
              </div>

              {/* 4-Step Synthesis Flow Pills */}
              <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left font-sans text-xs">
                <div className="p-4 rounded-xl bg-[#1C1815] border border-[#2E2822]">
                  <span className="text-[#E06D43] font-mono font-bold block mb-1">01 • Council</span>
                  <div className="text-white font-bold mb-1">5 Living Voices</div>
                  <p className="text-[#A89F91] text-[11px] leading-relaxed">Parallel exploration across 5 distinct scholarly traditions.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#1C1815] border border-[#2E2822]">
                  <span className="text-[#E06D43] font-mono font-bold block mb-1">02 • Cross-Examine</span>
                  <div className="text-white font-bold mb-1">Noise Removal</div>
                  <p className="text-[#A89F91] text-[11px] leading-relaxed">Contradictions, hallucinations, and single-author biases pruned.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#1C1815] border border-[#2E2822]">
                  <span className="text-[#E06D43] font-mono font-bold block mb-1">03 • Unify</span>
                  <div className="text-white font-bold mb-1">The 6th Mind</div>
                  <p className="text-[#A89F91] text-[11px] leading-relaxed">Harmonized around the core revelation of the Bhagavad Gita.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#1C1815] border border-[#2E2822]">
                  <span className="text-[#E06D43] font-mono font-bold block mb-1">04 • Deliver</span>
                  <div className="text-white font-bold mb-1">Crystalline Clarity</div>
                  <p className="text-[#A89F91] text-[11px] leading-relaxed">Actionable, grounded resolution delivered directly to the seeker.</p>
                </div>
              </div>
            </div>
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
              NityaGeeta vs Ungrounded Chatbots
            </h3>
            <p className="mt-3 text-sm sm:text-base text-[#5C4F45] dark:text-[#D4C7B8]">
              Why ordinary chatbots fail on ancient scripture, and how NityaGeeta guarantees fidelity.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[#DFD5C6] dark:border-[#38332E] bg-[#FAF7F2] dark:bg-[#201D1A] shadow-md">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#DFD5C6] dark:border-[#38332E] bg-[#EFE9DF]/70 dark:bg-[#262320]/70 text-[#2D2622] dark:text-[#F5F2EB]">
                  <th className="p-4 sm:p-5 font-serif font-bold">Dimension</th>
                  <th className="p-4 sm:p-5 font-serif font-bold text-red-700 dark:text-red-400">Generic Chatbots</th>
                  <th className="p-4 sm:p-5 font-serif font-bold text-[#8C7B70] dark:text-[#A89F91]">Single-Model Search</th>
                  <th className="p-4 sm:p-5 font-serif font-bold text-[#C25E38] dark:text-[#E06D43]">NityaGeeta Council of Clarity</th>
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
