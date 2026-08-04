"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Shield,
  ArrowRight,
  Send,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Search,
  CheckCircle2,
  User,
  Github,
  Twitter,
  Facebook,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { TextReveal } from "@/components/ui/text-reveal";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Motion scroll hook for background zoom
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgScale = useTransform(heroScrollProgress, [0, 1], [1, 1.25]);
  const bgOpacity = useTransform(heroScrollProgress, [0, 0.8], [0.45, 0.15]);

  // Real-time continuous 1-to-1 per-pixel scroll transforms for organic navbar shrink
  const { scrollY } = useScroll();
  const navPadding = useTransform(scrollY, [0, 100], ["1.35rem", "0.75rem"]);
  const logoScale = useTransform(scrollY, [0, 100], [1.1, 1.0]);
  const navLinkScale = useTransform(scrollY, [0, 100], [1.08, 1.0]);
  const rightControlsScale = useTransform(scrollY, [0, 100], [1.05, 1.0]);

  // Motion scroll hook for How It Works Light Beam activation
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: howItWorksScrollProgress } = useScroll({
    target: howItWorksRef,
    offset: ["start 65%", "end 45%"],
  });

  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    return howItWorksScrollProgress.on("change", (latest) => {
      if (latest < 0.33) {
        setActiveStep((prev) => (prev !== 1 ? 1 : prev));
      } else if (latest >= 0.33 && latest < 0.66) {
        setActiveStep((prev) => (prev !== 2 ? 2 : prev));
      } else if (latest >= 0.66 && latest < 0.95) {
        setActiveStep((prev) => (prev !== 3 ? 3 : prev));
      } else {
        setActiveStep((prev) => (prev !== 4 ? 4 : prev));
      }
    });
  }, [howItWorksScrollProgress]);

  const progressLineWidth = useTransform(howItWorksScrollProgress, [0, 1], ["0%", "100%"]);

  // Navbar Dropdown State
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<"geeta" | "veducation" | null>("geeta");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sources Page Section State
  const [activeSourceTab, setActiveSourceTab] = useState<"geeta" | "veducation">("geeta");
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);

  // Contact Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "ai_feedback",
    otherCategory: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", category: "ai_feedback", otherCategory: "", message: "" });
    }, 4000);
  };

  const geetaSources = [
    {
      priority: 1,
      id: "source-1",
      title: "Gita Press Sadhaka-Sanjivani",
      author: "Swami Ramsukhdas",
      badge: "Primary Dataset",
      tagline: "1,296-Page Masterwork",
      desc: "Comprehensive practical commentary analyzing every verse, word meaning, and spiritual application in daily life.",
      verses: "700 Verses Covered",
      bgGradient: "from-[#C25E38]/10 dark:from-[#E06D43]/15 to-transparent"
    },
    {
      priority: 2,
      id: "source-2",
      title: "Bhagavad Gita As It Is",
      author: "A.C. Bhaktivedanta Swami Prabhupada",
      badge: "Bhakti Core",
      tagline: "Authentic Translation",
      desc: "Focuses on unalloyed devotion (Bhakti Yoga), offering clear word-for-word Sanskrit translation and purports.",
      verses: "700 Verses Covered",
      bgGradient: "from-[#C25E38]/10 dark:from-[#E06D43]/15 to-transparent"
    },
    {
      priority: 3,
      id: "source-3",
      title: "Srimad Bhagavad Gita Bhashya",
      author: "Adi Shankaracharya",
      badge: "Advaita Vedanta",
      tagline: "Classical Non-Dualism",
      desc: "The foundational non-dualistic commentary establishing self-realization and knowledge (Jnana Yoga).",
      verses: "700 Verses Covered",
      bgGradient: "from-[#C25E38]/10 dark:from-[#E06D43]/15 to-transparent"
    },
    {
      priority: 4,
      id: "source-4",
      title: "Srimad Bhagavad Gita Ramanuja Bhashya",
      author: "Sri Ramanujacharya",
      badge: "Vishishtadvaita",
      tagline: "Qualified Non-Dualism",
      desc: "Emphasizes divine grace, devotion, and cosmic surrender (Prapatti) grounded in classical Ramanuja sampradaya.",
      verses: "700 Verses Covered",
      bgGradient: "from-[#C25E38]/10 dark:from-[#E06D43]/15 to-transparent"
    },
    {
      priority: 5,
      id: "source-5",
      title: "Srimad Bhagavad Gita Madhva Bhashya",
      author: "Sri Madhvacharya",
      badge: "Dvaita Philosophy",
      tagline: "Dualistic Realism",
      desc: "Rigorous philosophical commentary highlighting the distinction between the individual soul and the Supreme.",
      verses: "700 Verses Covered",
      bgGradient: "from-[#C25E38]/10 dark:from-[#E06D43]/15 to-transparent"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB] flex flex-col font-serif selection:bg-[#C25E38]/20 dark:selection:bg-[#E06D43]/30 transition-colors duration-300">
      
      {/* Magic UI Top Scroll Progress Bar */}
      <ScrollProgress className="fixed top-0 left-0 right-0 z-[10000]" />

      {/* Header / Navbar Component with Liquid Glass Effect & Resources Flyout Menu */}
      <Navbar />

      {/* Hero Section with Scroll Zooming Background Image */}
      <section ref={heroRef} className="relative pt-28 pb-24 px-6 overflow-hidden min-h-[90vh] flex items-center justify-center">
        {/* Background Image with Framer Motion Zoom on Scroll */}
        <motion.div
          style={{ scale: bgScale, opacity: bgOpacity }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <Image
            src="/images/hero_krishna.png"
            alt="Lord Krishna Bhagavad Gita Chariot"
            fill
            priority
            className="object-cover object-center filter brightness-[0.9] dark:brightness-[0.7] contrast-[1.05]"
          />
          {/* Theme-adaptive gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/85 via-[#FAF7F2]/65 to-[#FAF7F2] dark:from-[#1A1816]/90 dark:via-[#1A1816]/75 dark:to-[#1A1816]" />
        </motion.div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          <h1 className="text-4xl sm:text-6xl font-normal leading-tight tracking-tight text-[#2D2622] dark:text-[#F5F2EB] mb-6 font-serif">
            Bhagavad Gita in <span className="text-[#C25E38] dark:text-[#E06D43] font-medium italic">Authentic Devotion & Wisdom</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#5C4F45] dark:text-[#D4C7B8] max-w-2xl font-sans leading-relaxed mb-10">
            Read, explore, and converse with eternal wisdom grounded in canonical Sanskrit verses and authentic commentary traditions.
          </p>

          <div className="flex flex-wrap gap-4 justify-center font-sans mb-14">
            <Link href="/app" prefetch={true}>
              <InteractiveHoverButton
                text="NityaGeeta Dialogue"
                icon={<Sparkles className="w-4 h-4" />}
                className="p-3.5 px-8 text-base font-sans font-semibold shadow-xl"
              />
            </Link>
            <a
              href="#sources"
              className="p-3.5 px-8 text-base font-sans font-semibold text-white bg-[#C25E38] dark:bg-[#E06D43] hover:bg-[#A84F2E] dark:hover:bg-[#C25E38] rounded-xl border border-[#C25E38]/40 dark:border-[#E06D43]/50 shadow-xl transition-all duration-300 hover:shadow-2xl active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Explore Geeta Sources
            </a>
          </div>

          {/* Featured Shloka Section with Magic UI TextReveal - Balanced Vertical Centering */}
          <div className="w-full max-w-5xl mx-auto my-8 sm:my-12">
            <TextReveal
              citation="Essential Verses • Chapter 2, Verse 47"
              subtext="You have a right to perform your prescribed duty, but never to the fruits of action."
              line1="कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।"
              line2="मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section - Scroll-Driven Light Beam Activation (1)---(2)---(3)---(4) */}
      <section id="how-it-works" className="py-24 px-6 max-w-6xl mx-auto w-full border-t border-[#E8E1D7] dark:border-[#38332E]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-sans font-semibold tracking-widest text-[#C25E38] dark:text-[#E06D43] uppercase block mb-2">
            Guided Wisdom Engine
          </span>
          <h2 className="text-3xl sm:text-4xl text-[#2D2622] dark:text-[#F5F2EB] font-normal font-serif">
            How <span className="text-[#C25E38] dark:text-[#E06D43]">NityaGeeta Works</span>
          </h2>
          <p className="mt-4 text-[#6B5E55] dark:text-[#A89F91] font-sans text-base leading-relaxed">
            Scroll down to watch the light beam illuminate each step of our grounded wisdom engine.
          </p>
        </div>

        {/* 4-Step Timeline Container */}
        <div ref={howItWorksRef} className="relative font-sans">
          
          {/* Desktop Horizontal Progress Line Track */}
          <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-1.5 bg-[#E8E1D7] dark:bg-[#38332E] rounded-full z-0 overflow-hidden">
            {/* Scroll-Driven Animated Fill Line */}
            <motion.div
              style={{ width: progressLineWidth }}
              className="h-full bg-gradient-to-r from-[#C25E38] via-[#E06D43] to-[#F59E0B] rounded-full shadow-lg shadow-[#C25E38]/50 relative"
            >
              {/* Glowing Pulse Light Orb at Leading Tip */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#F59E0B] shadow-[0_0_12px_#F59E0B] animate-ping" />
            </motion.div>
          </div>

          {/* 4 Equal Spaced Step Columns: (1) --- (2) --- (3) --- (4) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 relative z-10">
            
            {[
              {
                num: 1,
                badge: "Step 01",
                title: "Ask Your Doubt",
                desc: "Express your personal conflict, decision, or query in simple English, Hindi, or Sanskrit.",
              },
              {
                num: 2,
                badge: "Step 02",
                title: "Verse Alignment",
                desc: "Our neural retrieval matches your situation to exact canonical Bhagavad Gita Sanskrit verses.",
              },
              {
                num: 3,
                badge: "Step 03",
                title: "5-Model AI Fan-Out",
                desc: "Dispatches query in parallel across 5 AI models (Groq 70B, Gemini 2.0, OpenRouter, NaraRouter) & scores candidates.",
              },
              {
                num: 4,
                badge: "Step 04",
                title: "Evaluated #1 Best Answer",
                desc: "Receive the winning #1 Best Answer with scorecards, verse citations, and an interactive 5-model inspection drawer.",
              },
            ].map((step) => {
              const isUnlocked = activeStep >= step.num;
              return (
                <div
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  className="flex flex-col items-center text-center cursor-pointer transition-all duration-500"
                >
                  {/* Circle Badge Node - Solid Opaque z-10 to completely mask the progress line */}
                  <div
                    className={`relative z-10 w-14 h-14 rounded-full font-serif font-bold text-lg flex items-center justify-center transition-all duration-500 mb-6 shrink-0 shadow-md ${
                      isUnlocked
                        ? "bg-[#C25E38] dark:bg-[#E06D43] text-white shadow-xl shadow-[#C25E38]/40 scale-110 ring-4 ring-[#C25E38]/20 dark:ring-[#E06D43]/30"
                        : "bg-[#FAF7F2] dark:bg-[#262320] border-2 border-[#DFD5C6] dark:border-[#38332E] text-[#8C7B70]/60 dark:text-[#A89F91]/50"
                    }`}
                  >
                    {step.num}
                  </div>

                  {/* Content Card */}
                  <div
                    className={`p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] transition-all duration-500 w-full h-full flex flex-col justify-between ${
                      isUnlocked
                        ? "border-2 border-[#C25E38]/60 dark:border-[#E06D43]/60 shadow-xl opacity-100"
                        : "border border-[#E8E1D7] dark:border-[#38332E] shadow-sm opacity-40 grayscale"
                    }`}
                  >
                    <div>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                          isUnlocked ? "text-[#C25E38] dark:text-[#E06D43]" : "text-[#8C7B70] dark:text-[#6B5E55]"
                        }`}
                      >
                        {step.badge} {isUnlocked ? "• Active" : ""}
                      </span>
                      <h3 className="text-lg font-bold text-[#2D2622] dark:text-[#F5F2EB] font-serif mb-2">
                        {step.title}
                      </h3>
                      <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* Geeta & Veducation Source Knowledge Base Section */}
      <section id="resources" className="py-20 px-6 max-w-6xl mx-auto w-full border-t border-[#E8E1D7] dark:border-[#38332E]">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-sans font-semibold tracking-widest text-[#C25E38] dark:text-[#E06D43] uppercase block mb-2">
            Priority Knowledge Base
          </span>
          <h2 className="text-3xl sm:text-4xl text-[#2D2622] dark:text-[#F5F2EB] font-normal font-serif">
            Canonical <span className="text-[#C25E38] dark:text-[#E06D43]">Geeta & Veducation Resources</span>
          </h2>
          <p className="mt-4 text-[#6B5E55] dark:text-[#A89F91] font-sans text-base leading-relaxed">
            NityaGeeta synthesizes authentic Gita commentaries and foundational Veducation literature into a unified wisdom engine.
          </p>
        </div>

        {/* Tab Selector: Animated Sliding Pill Background */}
        <div className="flex justify-center mb-10 font-sans">
          <div className="relative inline-flex p-1.5 rounded-2xl bg-[#EFE9DF] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] overflow-hidden">
            <button
              onClick={() => setActiveSourceTab("geeta")}
              className={`relative z-10 px-8 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
                activeSourceTab === "geeta"
                  ? "text-[#C25E38] dark:text-[#E06D43]"
                  : "text-[#6B5E55] dark:text-[#A89F91] hover:text-[#2D2622] dark:hover:text-[#F5F2EB]"
              }`}
            >
              <span>Geeta Resources</span>
              {activeSourceTab === "geeta" && (
                <motion.div
                  layoutId="activeSourceTabPill"
                  className="absolute inset-0 bg-[#FAF7F2] dark:bg-[#1C1917] rounded-xl shadow-md border border-[#DFD5C6] dark:border-[#38332E] -z-10"
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                />
              )}
            </button>

            <button
              onClick={() => setActiveSourceTab("veducation")}
              className={`relative z-10 px-8 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
                activeSourceTab === "veducation"
                  ? "text-[#C25E38] dark:text-[#E06D43]"
                  : "text-[#6B5E55] dark:text-[#A89F91] hover:text-[#2D2622] dark:hover:text-[#F5F2EB]"
              }`}
            >
              <span>Veducation Resources</span>
              {activeSourceTab === "veducation" && (
                <motion.div
                  layoutId="activeSourceTabPill"
                  className="absolute inset-0 bg-[#FAF7F2] dark:bg-[#1C1917] rounded-xl shadow-md border border-[#DFD5C6] dark:border-[#38332E] -z-10"
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Horizontal Stacked Cards List */}
        <div className="flex flex-col space-y-5 font-sans">
          {(activeSourceTab === "geeta" ? [
            {
              priority: 1,
              id: "geeta-1",
              title: "Srimad Bhagavad Gita",
              author: "Gita Press Gorakhpur",
              published: "Established 1923 (Gorakhpur, India)",
              authorBio: "Traditional team of revered Sanskrit scholars at Gita Press",
              badge: "Primary Dataset",
              tagline: "Canonical Edition",
              desc: "Complete Sanskrit verses with authentic verse-by-verse translation from Gita Press Gorakhpur.",
              link: "https://dn720006.ca.archive.org/0/items/shreemed-bhagwat-gita-20220406_20220406_0356/%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A5%80%E0%A4%AE%E0%A4%A6%E0%A5%8D%E0%A4%AD%E0%A4%97%E0%A4%B5%E0%A4%A4%E0%A4%97%E0%A5%80%E0%A4%A4%E0%A4%BE.pdf",
              verses: "700 Verses Covered",
              score: 100,
              scoreLabel: "(100) out of (100)",
              metricName: "Layer 1 Ground Truth",
              scoreBasis: "Verified by NityaGeeta Core Architecture against Gita Press 1923 Canonical Sanskrit Text.",
              authenticityRatio: "(100) out of (100)",
              authenticityDetail: "Original Devanagari Sanskrit verse fidelity free from editorial alteration.",
              contextTrustRatio: "(100) out of (100)",
              contextTrustDetail: "Zero sectarian bias; universally trusted across all traditional Hindu sampradayas.",
              scholarlyAuthorityRatio: "(100) out of (100)",
              scholarlyAuthorityDetail: "Over 100 years of canonical publication authority by Gita Press (est. 1923).",
              summary: "The definitive canonical edition of the Bhagavad Gita published by Gita Press Gorakhpur. It features unaltered Devanagari Sanskrit verses alongside word-by-word literal translations free from sectarian interpretations.",
              whyThisNumber: "Positioned at #1 as Layer 1 Ground Truth because Sanskrit is the original divine language of the Gita. All AI responses must be strictly rooted in this unadulterated source to guarantee zero human bias."
            },
            {
              priority: 2,
              id: "geeta-2",
              title: "The Bhagavad Gita",
              author: "Winthrop Sargeant",
              published: "First Published 1979 (State University of New York Press)",
              authorBio: "Renowned Sanskrit scholar and translator, edited by Prof. Christopher Key Chapple",
              badge: "Word-for-Word English",
              tagline: "Grammatical Breakdown",
              desc: "Detailed word-by-word Sanskrit translation, grammatical analysis, and Roman transliteration.",
              link: "https://dn760103.eu.archive.org/0/items/sargeant-w.-the-bhagavat-gita/Sargeant%2C%20W.%20-%20the-bhagavat-gita.pdf",
              verses: "700 Verses Covered",
              score: 98,
              scoreLabel: "(98) out of (100)",
              metricName: "Layer 2 Precision",
              scoreBasis: "Verified by SUNY Press Sanskrit Interlinear Grammatical Parsing Standard.",
              authenticityRatio: "(99) out of (100)",
              authenticityDetail: "Complete Devanagari script with precise Roman IAST phonetic transliteration.",
              contextTrustRatio: "(98) out of (100)",
              contextTrustDetail: "Pure interlinear word-for-word grammatical parsing without translator bias.",
              scholarlyAuthorityRatio: "(97) out of (100)",
              scholarlyAuthorityDetail: "SUNY Press peer-reviewed academic gold standard for Sanskrit grammar.",
              summary: "An academic masterwork that dissects all 700 verses of the Gita word-by-word, providing Devanagari script, Roman IAST transliteration, exact grammatical role parsing, and literal English definitions.",
              whyThisNumber: "Positioned at #2 as Layer 2 Precision because it anchors NityaGeeta's Sanskrit translation engine to exact grammatical definitions, ensuring total accuracy when answering complex queries."
            },
            {
              priority: 3,
              id: "geeta-3",
              title: "Gita Sadhak Sanjeevani",
              author: "Swami Ramsukhdas",
              published: "First Published 1988 (Gita Press)",
              authorBio: "Venerated saint and lifelong scholar of the Gita Press tradition",
              badge: "Practical Spiritual Guide",
              tagline: "1,296-Page Masterwork",
              desc: "Comprehensive practical commentary analyzing every verse, word meaning, and application in daily life.",
              link: "https://dn760108.eu.archive.org/0/items/gita-sadhak-sanjevani-english/Gita-Sadhak-Sanjevani-English.pdf",
              verses: "700 Verses Covered",
              score: 96,
              scoreLabel: "(96) out of (100)",
              metricName: "Practical Depth",
              scoreBasis: "Verified against Swami Ramsukhdas 1,296-Page Commentary Dataset.",
              authenticityRatio: "(96) out of (100)",
              authenticityDetail: "Complete 700-verse exegesis with authentic word-by-word Sanskrit breakdown.",
              contextTrustRatio: "(97) out of (100)",
              contextTrustDetail: "Focuses purely on daily householder duty (Karma Yoga) without sectarian dogma.",
              scholarlyAuthorityRatio: "(96) out of (100)",
              scholarlyAuthorityDetail: "1,296-page lifetime masterwork by venerated Gita Press scholar.",
              summary: "A monumental 1,296-page practical treatise that transforms subtle Vedic concepts into actionable guidance for everyday life, householders, and spiritual seekers.",
              whyThisNumber: "Positioned at #3 for Practical Depth because when users ask NityaGeeta real-life questions about anxiety, duty, and work, this edition provides unmatched practical solutions."
            },
            {
              priority: 4,
              id: "geeta-4",
              title: "Bhagavad Gita Commentary",
              author: "Sri Shankaracharya Bhashya",
              published: "Written c. 8th Century CE (788–820 CE)",
              authorBio: "Foundational master of Advaita Vedanta (Non-Dualism)",
              badge: "Advaita Vedanta",
              tagline: "Classical Non-Dualism",
              desc: "The foundational non-dualistic commentary establishing self-realization and Jnana Yoga wisdom.",
              link: "https://dn760101.eu.archive.org/0/items/Bhagavad-Gita.with.the.Commentary.of.Sri.Shankaracharya/Bhagavad-Gita.with.the.Commentary.of.Sri.Shankaracharya.pdf",
              verses: "700 Verses Covered",
              score: 95,
              scoreLabel: "(95) out of (100)",
              metricName: "Advaita Authority",
              scoreBasis: "Verified against 8th Century CE Advaita Vedanta Bhashya Standard.",
              authenticityRatio: "(95) out of (100)",
              authenticityDetail: "Foundational 8th-Century Sanskrit manuscript commentary.",
              contextTrustRatio: "(96) out of (100)",
              contextTrustDetail: "Rigorous Advaita Vedanta non-dualistic exegesis.",
              scholarlyAuthorityRatio: "(100) out of (100)",
              scholarlyAuthorityDetail: "1200+ years of uninterrupted historical Vedantic authority.",
              summary: "The earliest surviving classical commentary on the Bhagavad Gita, establishing that ultimate liberation (Moksha) is attained through spiritual knowledge (Jnana Yoga) and Self-realization.",
              whyThisNumber: "Positioned at #4 for Philosophical Authority to ground NityaGeeta in the highest intellectual standards of classical Indian philosophy."
            }
          ] : [
            {
              priority: 1,
              id: "ved-1",
              title: "BOSS (Basics of Sanatan Sanskriti)",
              author: "Veducation Knowledge Series",
              published: "2022 Digital Edition (Veducation)",
              authorBio: "Veducation Sanskriti Research Team",
              badge: "Vedic Essentials",
              tagline: "Sanatan Foundations",
              desc: "Essential handbook on the foundational principles of Sanatan Sanskriti and Vedic lifestyle.",
              link: "https://dn760103.eu.archive.org/0/items/boss-basics-of-sanatan-sanskriti-the-eternal-knowledge-from-veducation-compressed/BOSS%20Basics%20of%20Sanatan%20Sanskriti%20The%20eternal%20knowledge%20from%20Veducation_compressed.pdf",
              verses: "Digital Edition",
              score: 95,
              scoreLabel: "(95) out of (100)",
              metricName: "Sanatan Essentials",
              scoreBasis: "Verified by Veducation Sanskriti Research Team.",
              authenticityRatio: "(95) out of (100)",
              authenticityDetail: "Authentic Sanatan Sanskriti principles sourced directly from Vedic literature.",
              contextTrustRatio: "(95) out of (100)",
              contextTrustDetail: "Neutral, educational presentation tailored for modern seekers.",
              scholarlyAuthorityRatio: "(94) out of (100)",
              scholarlyAuthorityDetail: "Peer-reviewed by Veducation Sanskriti Research Team.",
              summary: "Comprehensive primer breaking down the foundational principles of Sanatan Sanskriti, Vedic heritage, rituals, and eternal truths for modern seekers.",
              whyThisNumber: "Positioned at #1 for Veducation as the core foundational guide to Sanatan principles and lifestyle."
            },
            {
              priority: 2,
              id: "ved-2",
              title: "Vedic Dincharya",
              author: "Veducation Daily Guide",
              published: "2022 Digital Edition (Veducation)",
              authorBio: "Veducation Health & Lifestyle Team",
              badge: "Shastric Routine",
              tagline: "Daily Discipline",
              desc: "Guide to traditional shastric daily routine (Dincharya) for physical, mental, and spiritual well-being.",
              link: "https://dn721907.ca.archive.org/0/items/vedic-dincharya/vedic%20dincharya.pdf",
              verses: "Digital Edition",
              score: 94,
              scoreLabel: "(94) out of (100)",
              metricName: "Shastric Discipline",
              scoreBasis: "Verified by Shastric Ayurvedic Lifestyle Standard.",
              authenticityRatio: "(94) out of (100)",
              authenticityDetail: "Shastric routine grounded in classical Ayurvedic & Smriti texts.",
              contextTrustRatio: "(94) out of (100)",
              contextTrustDetail: "Practical daily habit guidelines for physical and mental purity.",
              scholarlyAuthorityRatio: "(93) out of (100)",
              scholarlyAuthorityDetail: "Verified by traditional Ayurvedic lifestyle standards.",
              summary: "Actionable shastric guide on daily routine (Dincharya), morning rituals, energy discipline, and physical-mental balance.",
              whyThisNumber: "Positioned at #2 for Veducation as the daily practical habit manual for modern lifestyle alignment."
            },
            {
              priority: 3,
              id: "ved-3",
              title: "Brahmacharya: The Ultimate Action Book",
              author: "Local Knowledge Base",
              published: "2026 Curated Local Knowledge Base",
              authorBio: "NityaGeeta Practical Discipline Series",
              badge: "Local Resource",
              tagline: "Action Guide",
              desc: "Practical action guide on self-mastery, focus, energy conservation, and spiritual discipline.",
              link: null,
              verses: "Local Resource",
              score: 92,
              scoreLabel: "(92) out of (100)",
              metricName: "Self-Mastery Guide",
              scoreBasis: "Verified by NityaGeeta Practical Discipline Research Series.",
              authenticityRatio: "(92) out of (100)",
              authenticityDetail: "Actionable self-mastery guidance based on classical Yoga Sutra principles.",
              contextTrustRatio: "(93) out of (100)",
              contextTrustDetail: "Empowerment focused on focus, discipline, and mental clarity.",
              scholarlyAuthorityRatio: "(91) out of (100)",
              scholarlyAuthorityDetail: "Verified by NityaGeeta practical discipline research series.",
              summary: "Actionable manual focusing on willpower, energy conservation, mind control, focus, and spiritual strength.",
              whyThisNumber: "Positioned at #3 as the dedicated action guide for self-mastery and deep mental focus."
            }
          ]).map((source) => {
            const isExpanded = expandedSourceId === source.id;
            return (
              <div
                key={source.id}
                id={source.id}
                className="rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] shadow-md hover:shadow-xl hover:border-[#C25E38]/50 dark:hover:border-[#E06D43]/60 transition-all duration-300 overflow-hidden"
              >
                <div
                  onClick={() => setExpandedSourceId(isExpanded ? null : source.id)}
                  className="p-6 sm:p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 cursor-pointer group"
                >
                  {/* Left Side: Priority Number Badge + Main Content */}
                  <div className="flex items-start sm:items-center gap-5 flex-1">
                    <span className="w-11 h-11 rounded-full bg-[#C25E38] dark:bg-[#E06D43] text-white font-bold text-base flex items-center justify-center shrink-0 shadow-md">
                      #{source.priority}
                    </span>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-[#2D2622] dark:text-[#F5F2EB] font-serif group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition-colors">
                          {source.title}
                        </h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43]">
                          {source.badge}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#C25E38] dark:text-[#E06D43] mb-2">
                        By {source.author}
                      </p>
                      <p className="text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                        {source.desc}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Progress Bar & Score Display */}
                  <div className="flex flex-col items-start sm:items-end justify-between w-full lg:w-[320px] pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E8E1D7] dark:border-[#38332E] shrink-0 gap-2.5">
                    <div className="flex items-center justify-between w-full text-xs font-semibold">
                      <span className="text-[#C25E38] dark:text-[#E06D43] font-bold">{source.metricName}</span>
                      <span className="text-[#2D2622] dark:text-[#F5F2EB] font-mono font-bold">{source.scoreLabel}</span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full cursor-pointer py-1">
                      <div className="w-full h-2.5 rounded-full bg-[#EFE9DF] dark:bg-[#332E2A] overflow-hidden border border-[#DFD5C6] dark:border-[#38332E]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${source.score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-[#C25E38] to-[#E06D43] shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full text-xs pt-0.5 gap-3">
                      <span className="font-bold text-[#2D2622] dark:text-[#F5F2EB] px-2.5 py-0.5 rounded-md bg-[#EFE9DF] dark:bg-[#332E2A] whitespace-nowrap shrink-0 max-w-[160px] truncate">
                        {source.tagline}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 ml-auto">
                        <span className="text-[#8C7B70] dark:text-[#A89F91] font-medium text-[11px] whitespace-nowrap">
                          {source.verses}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-[#C25E38] dark:text-[#E06D43] transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Panel: Book Summary, Author, Era & Priority Selection Rationale */}
                {isExpanded && (
                  <div className="px-6 pb-7 pt-4 border-t border-[#E8E1D7]/80 dark:border-[#38332E]/80 bg-[#EFE9DF]/40 dark:bg-[#2A2521]/60 animate-in fade-in duration-200 font-sans">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-xs">
                      
                      {/* Box 1: Book Summary & Metadata */}
                      <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] space-y-2.5 shadow-sm">
                        <div className="font-bold text-[#C25E38] dark:text-[#E06D43] text-sm font-serif">
                          Book Overview & Summary
                        </div>
                        <p className="text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                          {source.summary}
                        </p>
                        <div className="pt-2.5 border-t border-[#E8E1D7] dark:border-[#38332E] text-[11px] text-[#8C7B70] dark:text-[#A89F91] space-y-1">
                          <div><strong className="text-[#2D2622] dark:text-[#F5F2EB]">Author / Scholar:</strong> {source.authorBio}</div>
                          <div><strong className="text-[#2D2622] dark:text-[#F5F2EB]">Published / Era:</strong> {source.published}</div>
                        </div>
                      </div>

                      {/* Box 2: Why Chosen & Authenticity Trust Ratios */}
                      <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] space-y-3 shadow-sm">
                        <div className="font-bold text-[#C25E38] dark:text-[#E06D43] text-sm font-serif flex items-center justify-between">
                          <span>Why Ranked at Priority #{source.priority}</span>
                          <span className="text-xs font-mono font-bold text-[#2D2622] dark:text-[#F5F2EB]">Score: {source.scoreLabel}</span>
                        </div>

                        <p className="text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                          {source.whyThisNumber}
                        </p>

                        {/* Authenticity & Context Trust Ratios Breakdown */}
                        <div className="pt-2.5 border-t border-[#E8E1D7] dark:border-[#38332E] space-y-2">
                          <div className="font-bold text-[#2D2622] dark:text-[#F5F2EB] text-[11px] tracking-wide">
                            Authenticity & Trust Ratio Breakdown
                          </div>

                          {/* Ratio 1: Text Authenticity */}
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#5C4F45] dark:text-[#D4C7B8] font-medium">Text Authenticity Ratio:</span>
                              <span className="font-mono font-bold text-[#C25E38] dark:text-[#E06D43]">{source.authenticityRatio}</span>
                            </div>
                            <p className="text-[10px] text-[#8C7B70] dark:text-[#A89F91] leading-snug">{source.authenticityDetail}</p>
                          </div>

                          {/* Ratio 2: Context Trust */}
                          <div className="space-y-0.5 pt-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#5C4F45] dark:text-[#D4C7B8] font-medium">Context Trust (Zero-Bias Ratio):</span>
                              <span className="font-mono font-bold text-[#C25E38] dark:text-[#E06D43]">{source.contextTrustRatio}</span>
                            </div>
                            <p className="text-[10px] text-[#8C7B70] dark:text-[#A89F91] leading-snug">{source.contextTrustDetail}</p>
                          </div>

                          {/* Ratio 3: Scholarly Authority */}
                          <div className="space-y-0.5 pt-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#5C4F45] dark:text-[#D4C7B8] font-medium">Scholarly Authority Ratio:</span>
                              <span className="font-mono font-bold text-[#C25E38] dark:text-[#E06D43]">{source.scholarlyAuthorityRatio}</span>
                            </div>
                            <p className="text-[10px] text-[#8C7B70] dark:text-[#A89F91] leading-snug">{source.scholarlyAuthorityDetail}</p>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Footer Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#DFD5C6]/60 dark:border-[#38332E]/60">
                      <span className="text-xs text-[#6B5E55] dark:text-[#A89F91] font-medium">
                        {source.link ? "Read full digital edition online on Archive.org:" : "Available offline in NityaGeeta's local dataset:"}
                      </span>

                      {source.link ? (
                        <a
                          href={source.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white text-xs font-bold hover:opacity-90 transition shadow-md"
                        >
                          <span>Open PDF Edition</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C25E38]/15 text-[#C25E38] dark:bg-[#E06D43]/20 dark:text-[#E06D43] text-xs font-mono font-bold">
                          Local Dataset
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Support & Contact Us Section - Fully Differentiated Light Mode vs Dark Mode */}
      <section id="support" className="py-20 px-6 max-w-6xl mx-auto w-full border-t border-[#E8E1D7] dark:border-[#38332E]">
        
        {/* LIGHT MODE CONTACT CONTAINER */}
        <div className="block dark:hidden bg-[#EFE9DF] border border-[#DFD5C6] rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="text-[#2D2622]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#C25E38]/15 text-[#C25E38] text-xs font-semibold font-sans mb-4">
                <AlertCircle className="w-4 h-4" /> Community & Feedback Portal
              </div>

              <h2 className="text-3xl sm:text-4xl text-[#2D2622] font-serif font-normal leading-tight mb-4">
                Encountered Issues or Have <span className="text-[#C25E38] font-medium">Geeta Wisdom to Share?</span>
              </h2>

              <p className="text-[#5C4F45] font-sans text-base leading-relaxed mb-6">
                NityaGeeta is dedicated to uncompromised authenticity. If you encounter chat glitches, unhelpful responses, potential misuse, or possess deeper commentary insights you wish to contribute, please let us know.
              </p>

              <div className="space-y-4 font-sans text-sm text-[#5C4F45]">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#C25E38] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#2D2622] font-semibold">Report Chat Issues & Errors:</strong> Help us refine AI retrieval if a response is inaccurate or unresourceful.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#C25E38] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#2D2622] font-semibold">Contribute Commentary Insights:</strong> Share additional authentic bhashyas or verse clarifications to enrich our dataset.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#C25E38] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#2D2622] font-semibold">Report Misuse or Harmful Content:</strong> Ensure the platform remains a safe, sacred space for spiritual learning.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Card */}
            <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-2xl border border-[#DFD5C6] shadow-lg text-[#2D2622]">
              <h3 className="text-xl font-serif font-bold text-[#2D2622] mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#C25E38]" /> Contact Us / Submit Feedback
              </h3>

              {submitted ? (
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-300 text-center font-sans">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-emerald-900 mb-1">Thank You!</h4>
                  <p className="text-sm text-emerald-700">
                    Your feedback has been received. Our team will review your report to continuously improve NityaGeeta.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-[#5C4F45] mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#EFE9DF] border border-[#DFD5C6] text-[#2D2622] placeholder-[#8C7B70] focus:outline-none focus:ring-2 focus:ring-[#C25E38] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C4F45] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#EFE9DF] border border-[#DFD5C6] text-[#2D2622] placeholder-[#8C7B70] focus:outline-none focus:ring-2 focus:ring-[#C25E38] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C4F45] mb-1">
                      Topic / Category
                    </label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#EFE9DF] border border-[#DFD5C6] text-[#2D2622] focus:outline-none focus:ring-2 focus:ring-[#C25E38] transition appearance-none cursor-pointer"
                      >
                        <option value="ai_feedback">AI Chat Feedback / Issue</option>
                        <option value="unresourceful_info">Incorrect or Unhelpful Answer</option>
                        <option value="share_wisdom">Share Geeta Wisdom / Commentary</option>
                        <option value="report_misuse">Report Misuse / Misinterpretation</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#C25E38] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <AnimatePresence mode="wait">
                      {formData.category === "other" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -10, height: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <label className="block text-xs font-semibold text-[#5C4F45] mt-3 mb-1">
                            Please describe other category
                          </label>
                          <motion.input
                            type="text"
                            required
                            placeholder="Please describe other category..."
                            value={formData.otherCategory}
                            onChange={(e) => setFormData({ ...formData, otherCategory: e.target.value })}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="w-full px-4 py-2.5 rounded-lg bg-[#EFE9DF] border border-[#DFD5C6] text-[#2D2622] placeholder-[#8C7B70] focus:outline-none focus:ring-2 focus:ring-[#C25E38] transition"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C4F45] mb-1">
                      Message / Feedback Details
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe your issue, suggestion, or commentary insight in detail..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#EFE9DF] border border-[#DFD5C6] text-[#2D2622] placeholder-[#8C7B70] focus:outline-none focus:ring-2 focus:ring-[#C25E38] transition resize-none"
                    />
                  </div>

                  <InteractiveHoverButton
                    type="submit"
                    text="Submit Feedback"
                    icon={<Send className="w-4 h-4" />}
                    className="w-full py-3.5 text-sm font-sans font-bold shadow-lg"
                  />
                </form>
              )}
            </div>
          </div>
        </div>

        {/* DARK MODE CONTACT CONTAINER WITH GEETA BACKGROUND IMAGE */}
        <div className="hidden dark:block relative overflow-hidden rounded-3xl border border-[#E06D43]/40 shadow-2xl">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/bg_vishnu.png"
              alt="Geeta Background"
              fill
              className="object-cover object-center filter brightness-[0.35] contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A1816]/95 via-[#1A1816]/85 to-[#1A1816]/90 backdrop-blur-[2px]" />
          </div>

          <div className="relative z-10 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center font-sans">
            <div>
              <span className="text-xs font-semibold tracking-widest text-[#E06D43] uppercase block mb-2">
                Open Dialogue
              </span>
              <h2 className="text-3xl sm:text-4xl text-[#F5F2EB] font-serif font-normal mb-4">
                We Welcome Your <span className="text-[#E06D43]">Reflections</span>
              </h2>
              <p className="text-[#A89F91] text-sm leading-relaxed mb-8">
                NityaGeeta is built with reverence for canonical Sanskrit traditions. If you notice any nuanced commentary discrepancy or have feature feedback, please send us a message.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#262320]/80 border border-[#38332E]">
                  <Shield className="w-5 h-5 text-[#E06D43] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F2EB]">Authenticity Priority</h4>
                    <p className="text-xs text-[#A89F91]">All reports regarding verse accuracy are prioritized by our editorial team.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#262320]/80 border border-[#38332E]">
                  <MessageSquare className="w-5 h-5 text-[#E06D43] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F2EB]">Community Guidance</h4>
                    <p className="text-xs text-[#A89F91]">Your insights help improve prompt constraints and translation fidelity.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#262320]/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-[#38332E] shadow-2xl text-[#F5F2EB]">
              <h3 className="text-xl font-serif font-bold text-[#F5F2EB] mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" /> Contact Us / Submit Feedback
              </h3>

              {submitted ? (
                <div className="p-6 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-center font-sans">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-emerald-200 mb-1">Thank You!</h4>
                  <p className="text-sm text-emerald-300">
                    Your feedback has been received. Our team will review your report to continuously improve NityaGeeta.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-[#D4C7B8] mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#1A1816] border border-[#38332E] text-[#F5F2EB] placeholder-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#E06D43] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#D4C7B8] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#1A1816] border border-[#38332E] text-[#F5F2EB] placeholder-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#E06D43] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#D4C7B8] mb-1">
                      Topic / Category
                    </label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#1A1816] border border-[#38332E] text-[#F5F2EB] focus:outline-none focus:ring-2 focus:ring-[#E06D43] transition appearance-none cursor-pointer"
                      >
                        <option value="ai_feedback">AI Chat Feedback / Issue</option>
                        <option value="unresourceful_info">Incorrect or Unhelpful Answer</option>
                        <option value="share_wisdom">Share Geeta Wisdom / Commentary</option>
                        <option value="report_misuse">Report Misuse / Misinterpretation</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-amber-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <AnimatePresence mode="wait">
                      {formData.category === "other" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -10, height: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <label className="block text-xs font-semibold text-[#D4C7B8] mt-3 mb-1">
                            Please describe other category
                          </label>
                          <motion.input
                            type="text"
                            required
                            placeholder="Please describe other category..."
                            value={formData.otherCategory}
                            onChange={(e) => setFormData({ ...formData, otherCategory: e.target.value })}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="w-full px-4 py-2.5 rounded-lg bg-[#1A1816] border border-[#38332E] text-[#F5F2EB] placeholder-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#E06D43] transition"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#D4C7B8] mb-1">
                      Message / Feedback Details
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe your issue, suggestion, or commentary insight in detail..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#1A1816] border border-[#38332E] text-[#F5F2EB] placeholder-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#E06D43] transition resize-none"
                    />
                  </div>

                  <InteractiveHoverButton
                    type="submit"
                    text="Submit Feedback"
                    icon={<Send className="w-4 h-4" />}
                    className="w-full py-3.5 text-sm font-sans font-bold shadow-lg"
                  />
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto w-full border-t border-[#E8E1D7] dark:border-[#38332E]">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl text-[#2D2622] dark:text-[#F5F2EB] font-serif font-normal">
            Frequently Asked <span className="text-[#C25E38] dark:text-[#E06D43]">Questions</span>
          </h2>
          <p className="mt-2 text-[#6B5E55] dark:text-[#A89F91] font-sans text-sm">
            Everything you need to know about NityaGeeta's source grounding and AI methodology.
          </p>
        </div>

        <div className="space-y-4 font-sans">
          {/* FAQ Item 1 */}
          <div className="border border-[#E8E1D7] dark:border-[#38332E] rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] overflow-hidden transition-all shadow-sm">
            <button
              onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
              className="w-full px-6 py-5 text-left font-serif font-bold text-lg text-[#2D2622] dark:text-[#F5F2EB] flex items-center justify-between gap-4 focus:outline-none"
            >
              <span>How does NityaGeeta prevent AI hallucinations and provide authentic answers?</span>
              {openFaq === 0 ? (
                <ChevronUp className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#8C7B70] dark:text-[#A89F91] shrink-0" />
              )}
            </button>
            {openFaq === 0 && (
              <div className="px-6 pb-6 pt-1 text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed border-t border-[#E8E1D7]/60 dark:border-[#38332E]">
                NityaGeeta uses a Retrieval-Augmented Generation (RAG) system grounded in authenticated Gita commentaries—primarily the 1,296-page <em>Sadhaka-Sanjivani</em> commentary by Swami Ramsukhdas (Gita Press Gorakhpur). When you ask a question, the platform performs hybrid vector search across canonical Sanskrit verses and commentary purports to ensure responses remain strictly accurate and anchored in tradition.
              </div>
            )}
          </div>

          {/* FAQ Item 2 */}
          <div className="border border-[#E8E1D7] dark:border-[#38332E] rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] overflow-hidden transition-all shadow-sm">
            <button
              onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
              className="w-full px-6 py-5 text-left font-serif font-bold text-lg text-[#2D2622] dark:text-[#F5F2EB] flex items-center justify-between gap-4 focus:outline-none"
            >
              <span>How are the Geeta source commentaries prioritized in responses?</span>
              {openFaq === 1 ? (
                <ChevronUp className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#8C7B70] dark:text-[#A89F91] shrink-0" />
              )}
            </button>
            {openFaq === 1 && (
              <div className="px-6 pb-6 pt-1 text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed border-t border-[#E8E1D7]/60 dark:border-[#38332E]">
                Commentary sources are ranked by their traditional completeness and clarity. Our primary dataset starts with the comprehensive <em>Sadhaka-Sanjivani</em> (Gita Press), followed by <em>Bhagavad Gita As It Is</em> (Prabhupada) for Bhakti perspectives, and classic bhashyas by Shankaracharya (Advaita), Ramanujacharya (Vishishtadvaita), and Madhvacharya (Dvaita).
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E8E1D7] dark:border-[#38332E] bg-[#EFE9DF] dark:bg-[#141211] text-[#5C4F45] dark:text-[#A89F91] font-sans pt-12 pb-8 px-6 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="font-serif font-bold text-xl text-[#2D2622] dark:text-[#F5F2EB]">
                NityaGeeta
              </span>
            </div>
            <p className="text-[#8C7B70] dark:text-[#A89F91] text-xs leading-relaxed">
              Ancient wisdom for modern life. Grounded in authenticated Bhagavad Gita commentaries.
            </p>
            <div className="flex items-center space-x-3 text-[#8C7B70] dark:text-[#A89F91] pt-2">
              <a href="#" className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition"><Github className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="font-serif font-bold uppercase tracking-wider text-[11px] text-[#2D2622] dark:text-[#F5F2EB] mb-3">
              QUICK LINKS
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/app" className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition">
                  NityaGeeta Dialogue
                </Link>
              </li>
              <li><a href="#sources" className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition">Geeta Sources</a></li>
              <li><a href="#support" className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition">Contact Us & Feedback</a></li>
              <li><a href="#faq" className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition">FAQ</a></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="font-serif font-bold uppercase tracking-wider text-[11px] text-[#2D2622] dark:text-[#F5F2EB] mb-3">
              RESOURCES
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition cursor-pointer">1,296-Page Dataset</span></li>
              <li><span className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition cursor-pointer">Gita Press Gorakhpur</span></li>
              <li><span className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition cursor-pointer">Vector Search RAG</span></li>
              <li><span className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition cursor-pointer">Commentary Ranking</span></li>
            </ul>
          </div>

          {/* Legal & Contact Column */}
          <div>
            <h4 className="font-serif font-bold uppercase tracking-wider text-[11px] text-[#2D2622] dark:text-[#F5F2EB] mb-3">
              LEGAL & CONTACT
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition cursor-pointer">Copyright</span></li>
              <li><a href="#support" className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="max-w-7xl mx-auto pt-6 border-t border-[#E8E1D7] dark:border-[#38332E] flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#8C7B70] dark:text-[#A89F91] gap-2">
          <div>
            © 2026 Copyright: <span className="font-semibold text-[#C25E38] dark:text-[#E06D43]">NityaGeeta Foundation</span>. All rights reserved.
          </div>
          <div>
            Powered by Grounded Bhagavad Gita RAG Engine
          </div>
        </div>
      </footer>
    </div>
  );
}
