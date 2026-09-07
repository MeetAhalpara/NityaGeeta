"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Shield,
  ShieldCheck,
  ArrowRight,
  Send,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Search,
  CheckCircle2,
  User,
  Github,
  Linkedin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Briefcase,
  Scale,
  Compass,
  HeartHandshake,
  FileText,
  Database,
  Layers,
  Cpu,
  BrainCircuit,
  Award,
  Globe
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { TextReveal } from "@/components/ui/text-reveal";
import { PdfManuscriptReader } from "@/components/ui/pdf-manuscript-reader";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedBookTitle, setSelectedBookTitle] = useState<string>("");
  const [homeCitationsOpen, setHomeCitationsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenPdf = (url: string | null, title: string) => {
    if (!url) return;
    setSelectedBookTitle(title);
    setSelectedPdfUrl(url);
  };

  useEffect(() => {
    if (selectedPdfUrl !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedPdfUrl]);
  
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

  // Modern Life Dilemmas State
  const [activeDilemma, setActiveDilemma] = useState(0);

  const modernDilemmas = [
    {
      id: "career-burnout",
      category: "Work & Ambition",
      title: "Corporate Burnout & Action without Attachment",
      situation: "I am working 70+ hours a week for career success, yet feeling anxious, drained, and fearful of future outcomes.",
      verseCitation: "Chapter 2 • Verse 47",
      verseSanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
      verseTransliteration: "karmaṇy-evādhikāras te mā phaleṣu kadācana | mā karma-phala-hetur bhūr mā te saṅgo 'stv akarmaṇi",
      coreInsight: "You have a right only to the action itself, never to the fruits. When you detach your identity from uncontrollable results, fear vanishes and pure craftsmanship emerges.",
      promptQuery: "I feel burned out and anxious working 70 hours a week for career success. What is the Bhagavad Gita's guidance on duty vs outcome in Chapter 2 Verse 47?",
      tag: "Karma Yoga",
      icon: Briefcase
    },
    {
      id: "moral-conflict",
      category: "Ethics & Decision Making",
      title: "Moral Paralysis & Overcoming Dilemma",
      situation: "I am torn between doing what is easy, profitable, or family-expected versus doing what is ethically right for my soul.",
      verseCitation: "Chapter 2 • Verse 7",
      verseSanskrit: "कार्पण्यदोषोपहतस्वभावः पृच्छामि त्वां धर्मसंमूढचेताः।\nयच्छ्रेयः स्यान्निश्चितं ब्रूहि तन्मे शिष्यस्तेऽहं शाधि मां त्वां प्रपन्नम्॥",
      verseTransliteration: "kārpaṇya-doṣopahata-svabhāvaḥ pṛcchāmi tvāṁ dharma-sammūḍha-cetāḥ | yac chreyaḥ syān niścitaṁ brūhi tan me śiṣyas te 'haṁ śādhi māṁ tvāṁ prapannam",
      coreInsight: "Arjuna collapsed in total moral paralysis on Kurukshetra. The Gita teaches that admitting confusion and surrendering emotional bias to eternal Dharma is the gateway to resolute action.",
      promptQuery: "I am facing a difficult moral conflict where my duty conflicts with emotional attachments. How does Arjuna's dilemma in Chapter 2 Verse 7 teach us to find clarity?",
      tag: "Dharma & Duty",
      icon: Scale
    },
    {
      id: "restless-mind",
      category: "Mental Peace & Anxiety",
      title: "Overthinking, Fear of Failure & Anxiety",
      situation: "My mind constantly loops on future 'what-ifs', making it impossible to stay calm, focused, and present in daily life.",
      verseCitation: "Chapter 6 • Verse 35",
      verseSanskrit: "असंशयं महाबाहो मनो दुर्निग्रहं चलम्।\nअभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते॥",
      verseTransliteration: "asaṁśayaṁ mahā-bāho mano durnigrahaṁ calam | abhyāsena tu kaunteya vairāgyeṇa ca gṛhyate",
      coreInsight: "The mind is naturally as turbulent as the raging wind. Krishna affirms it cannot be conquered by force, but by two deliberate disciplines: persistent practice (Abhyasa) and calm dispassion (Vairagya).",
      promptQuery: "How do I stop overthinking and control an anxious, restless mind according to Chapter 6 Verse 35?",
      tag: "Dhyana Yoga",
      icon: Compass
    },
    {
      id: "relationships",
      category: "Relationships & Emotional Balance",
      title: "Expectations, Betrayal & Inner Poise",
      situation: "I invest deep care and loyalty into people, but lack of reciprocity or betrayal leaves me resentful, wounded, and bitter.",
      verseCitation: "Chapter 12 • Verses 13–14",
      verseSanskrit: "अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च।\nनिर्ममो निरहङ्कारः समदुःखसुखः क्षमी॥",
      verseTransliteration: "adveṣṭā sarva-bhūtānāṁ maitraḥ karuṇa eva ca | nirmamo nirahaṅkāraḥ sama-duḥkha-sukhaḥ kṣamī",
      coreInsight: "The highest emotional mastery is freedom from malice toward all beings, unconditional kindness, zero possessiveness (Nirmama), freedom from ego (Nirahankara), and poise in joy and sorrow.",
      promptQuery: "How can I maintain emotional composure and avoid resentment in difficult relationships according to Chapter 12 Verses 13-14?",
      tag: "Bhakti & Equanimity",
      icon: HeartHandshake
    }
  ];

  const comparisonData = [
    {
      feature: "Scripture Grounding & Accuracy",
      genericAi: "Hallucinates spiritual-sounding quotes that do not exist in the 700 canonical verses.",
      nityaGeeta: "100% in-memory index of all 700 verses with exact Chapter, Verse, and word-by-word Sanskrit parsing (<2ms lookup).",
      highlight: "Zero Hallucinations"
    },
    {
      feature: "Verifiable Source PDF Proof",
      genericAi: "Black-box AI output with zero page-level proof, original manuscripts, or verifiable PDF access.",
      nityaGeeta: "1-Click direct links to original 1923 Gita Press Gorakhpur and SUNY Press PDF manuscripts.",
      highlight: "Original Manuscripts"
    },
    {
      feature: "Commentary Lineage & Neutrality",
      genericAi: "Blends contemporary self-help clichés with unvetted Internet paraphrases and sectarian bias.",
      nityaGeeta: "Rooted in classical bhashyas (Swami Ramsukhdas, Shankaracharya, Sargeant) with zero sectarian distortion.",
      highlight: "Classical Lineage"
    },
    {
      feature: "Multi-Model Consensus Scoring",
      genericAi: "Relies on a single closed LLM without cross-examination, critique, or accuracy evaluation.",
      nityaGeeta: "5 AI models (Groq 70B, Gemini 2.0, OpenRouter MoA) evaluated in parallel with scorecards and citations.",
      highlight: "5-Model MoA"
    },
  ];

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
  const [uploadedImages, setUploadedImages] = useState<
    { id: string; file: File; preview: string; name: string; size: string }[]
  >([]);
  const [submitted, setSubmitted] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - uploadedImages.length;
    if (remainingSlots <= 0) return;

    const newImages = files.slice(0, remainingSlots).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
    }));

    setUploadedImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const handleRemoveImage = (id: string) => {
    setUploadedImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", category: "ai_feedback", otherCategory: "", message: "" });
      setUploadedImages([]);
    }, 4000);
  };

  const geetaSources = [
    {
      priority: 1,
      id: "source-1",
      title: "Gita Press Sadhaka-Sanjivani",
      author: "Swami Ramsukhdas",
      badge: "Primary Dataset",
      tagline: "Comprehensive Masterwork",
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

          <div className="flex flex-wrap gap-4 justify-center font-sans mb-10">
            <InteractiveHoverButton
              onClick={() => router.push("/app")}
              text="NityaGeeta Dialogue"
              icon={<Sparkles className="w-4 h-4" />}
              className="p-3.5 px-8 text-base font-sans font-semibold shadow-xl"
            />
            <button
              onClick={() => router.push("/sources")}
              className="p-3.5 px-7 text-sm sm:text-base font-sans font-semibold text-white bg-[#C25E38] dark:bg-[#E06D43] hover:bg-[#A84F2E] dark:hover:bg-[#C25E38] rounded-xl border border-[#C25E38]/40 dark:border-[#E06D43]/50 shadow-xl transition-all duration-300 hover:shadow-2xl active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Sources & Manuscripts</span>
            </button>
            <button
              onClick={() => router.push("/dilemmas")}
              className="p-3.5 px-7 text-sm sm:text-base font-sans font-semibold text-[#2D2622] dark:text-[#F5F2EB] bg-[#EFE9DF]/80 dark:bg-[#262320]/80 hover:bg-[#E8E1D7] dark:hover:bg-[#332E2A] rounded-xl border border-[#DFD5C6] dark:border-[#38332E] shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
              <span>Life Dilemmas Directory</span>
            </button>
          </div>

          {/* Quick Grounding & Verifiable Scripture Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl mx-auto mb-10 font-sans">
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/80 dark:bg-[#262320]/80 border border-[#E8E1D7] dark:border-[#38332E] backdrop-blur-md text-center shadow-sm hover:shadow-md transition">
              <div className="text-xl sm:text-2xl font-bold font-serif text-[#C25E38] dark:text-[#E06D43]">700 / 700</div>
              <div className="text-[11px] font-semibold text-[#6B5E55] dark:text-[#A89F91] uppercase tracking-wider mt-0.5">Verses Indexed</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/80 dark:bg-[#262320]/80 border border-[#E8E1D7] dark:border-[#38332E] backdrop-blur-md text-center shadow-sm hover:shadow-md transition">
              <div className="text-xl sm:text-2xl font-bold font-serif text-[#C25E38] dark:text-[#E06D43]">100%</div>
              <div className="text-[11px] font-semibold text-[#6B5E55] dark:text-[#A89F91] uppercase tracking-wider mt-0.5">Verifiable Citations</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/80 dark:bg-[#262320]/80 border border-[#E8E1D7] dark:border-[#38332E] backdrop-blur-md text-center shadow-sm hover:shadow-md transition">
              <div className="text-xl sm:text-2xl font-bold font-serif text-[#C25E38] dark:text-[#E06D43]">Original</div>
              <div className="text-[11px] font-semibold text-[#6B5E55] dark:text-[#A89F91] uppercase tracking-wider mt-0.5">PDF Manuscripts</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/80 dark:bg-[#262320]/80 border border-[#E8E1D7] dark:border-[#38332E] backdrop-blur-md text-center shadow-sm hover:shadow-md transition">
              <div className="text-xl sm:text-2xl font-bold font-serif text-[#C25E38] dark:text-[#E06D43]">5-Model</div>
              <div className="text-[11px] font-semibold text-[#6B5E55] dark:text-[#A89F91] uppercase tracking-wider mt-0.5">Parallel Evaluation</div>
            </div>
          </div>

          {/* Featured Shloka Section with Magic UI TextReveal - Balanced Vertical Centering */}
          <div className="w-full max-w-5xl mx-auto my-6 sm:my-10">
            <TextReveal
              citation="Essential Verses • Chapter 2, Verse 47"
              subtext="You have a right to perform your prescribed duty, but never to the fruits of action."
              line1="कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।"
              line2="मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥"
            />
          </div>
        </div>
      </section>

      {/* SECTION 1: Modern Life Dilemmas Grounded in 5,000-Year-Old Wisdom */}
      <section id="modern-dilemmas" className="py-24 px-6 max-w-6xl mx-auto w-full border-t border-[#E8E1D7] dark:border-[#38332E]">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-sans font-semibold tracking-widest text-[#C25E38] dark:text-[#E06D43] uppercase block mb-2">
            Timeless Answers For Contemporary Challenges
          </span>
          <h2 className="text-3xl sm:text-4xl text-[#2D2622] dark:text-[#F5F2EB] font-normal font-serif">
            5,000-Year-Old Wisdom for <span className="text-[#C25E38] dark:text-[#E06D43]">Modern Life Dilemmas</span>
          </h2>
          <p className="mt-4 text-[#6B5E55] dark:text-[#A89F91] font-sans text-base leading-relaxed">
            Select a real-world struggle below to see how canonical Bhagavad Gita verses provide immediate, grounded clarity.
          </p>
        </div>

        {/* Dilemma Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 font-sans">
          {modernDilemmas.map((item, index) => {
            const Icon = item.icon;
            const isSelected = activeDilemma === index;
            return (
              <button
                key={item.id}
                onClick={() => setActiveDilemma(index)}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#FAF7F2] dark:bg-[#262320] border-[#C25E38] dark:border-[#E06D43] shadow-lg ring-2 ring-[#C25E38]/20 dark:ring-[#E06D43]/30 scale-[1.02]"
                    : "bg-[#FAF7F2]/60 dark:bg-[#1C1917]/60 border-[#E8E1D7] dark:border-[#38332E] hover:border-[#C25E38]/40 dark:hover:border-[#E06D43]/40 opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? "bg-[#C25E38] dark:bg-[#E06D43] text-white shadow-md"
                        : "bg-[#EFE9DF] dark:bg-[#332E2A] text-[#8C7B70] dark:text-[#A89F91]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43]"
                        : "bg-transparent text-[#8C7B70] dark:text-[#A89F91]"
                    }`}
                  >
                    {item.tag}
                  </span>
                </div>
                <div>
                  <h3
                    className={`text-sm font-bold font-serif mb-1 leading-snug ${
                      isSelected ? "text-[#C25E38] dark:text-[#E06D43]" : "text-[#2D2622] dark:text-[#F5F2EB]"
                    }`}
                  >
                    {item.category}
                  </h3>
                  <p className="text-xs text-[#6B5E55] dark:text-[#A89F91] line-clamp-2 leading-relaxed">
                    {item.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Dilemma Showcase Card */}
        {modernDilemmas[activeDilemma] && (
          <div className="rounded-3xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] shadow-xl overflow-hidden p-6 sm:p-10 font-sans transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Side: Modern Situation */}
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] text-xs font-bold uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5" /> Modern Life Dilemma
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif text-[#2D2622] dark:text-[#F5F2EB] font-normal leading-snug">
                  {modernDilemmas[activeDilemma].title}
                </h3>
                <div className="p-4 rounded-xl bg-[#EFE9DF]/70 dark:bg-[#1C1917]/70 border border-[#DFD5C6] dark:border-[#38332E] text-sm text-[#5C4F45] dark:text-[#D4C7B8] italic leading-relaxed">
                  &ldquo;{modernDilemmas[activeDilemma].situation}&rdquo;
                </div>
                <p className="text-xs text-[#8C7B70] dark:text-[#A89F91] leading-relaxed">
                  This conflict mirrors Arjuna&apos;s moral dilemma on Kurukshetra. The Gita addresses this root attachment directly:
                </p>
              </div>

              {/* Right Side: Canonical Sanskrit Verse & Practical Purport */}
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#EFE9DF] dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DFD5C6] dark:border-[#38332E] pb-3">
                  <span className="text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> {modernDilemmas[activeDilemma].verseCitation}
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#C25E38]/15 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43]">
                    100% Canonical Grounding
                  </span>
                </div>

                {/* Devanagari Shloka */}
                <div className="font-serif text-lg sm:text-xl text-[#2D2622] dark:text-[#F5F2EB] font-medium leading-loose text-center py-2 bg-[#FAF7F2]/60 dark:bg-[#262320]/60 rounded-xl border border-[#DFD5C6]/60 dark:border-[#38332E]/60 whitespace-pre-line">
                  {modernDilemmas[activeDilemma].verseSanskrit}
                </div>

                {/* Transliteration */}
                <p className="text-xs font-mono text-[#8C7B70] dark:text-[#A89F91] text-center italic">
                  {modernDilemmas[activeDilemma].verseTransliteration}
                </p>

                {/* Core Insight */}
                <div className="pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#2D2622] dark:text-[#F5F2EB] mb-1">
                    Core Philosophical Insight:
                  </div>
                  <p className="text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                    {modernDilemmas[activeDilemma].coreInsight}
                  </p>
                </div>

                {/* Action CTA */}
                <div className="pt-3 border-t border-[#DFD5C6] dark:border-[#38332E] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-[#8C7B70] dark:text-[#A89F91]">
                    Ask NityaGeeta to synthesize this verse with all 5 classical bhashyas:
                  </span>
                  <Link
                    href={`/app?q=${encodeURIComponent(modernDilemmas[activeDilemma].promptQuery)}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white text-xs font-bold hover:opacity-90 transition shadow-md group"
                  >
                    <span>Converse in Dialogue</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Explore Full Dilemmas Directory CTA */}
        <div className="mt-8 p-5 rounded-2xl bg-[#EFE9DF]/80 dark:bg-[#262320]/80 border border-[#DFD5C6] dark:border-[#38332E] flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-center sm:text-left shadow-sm">
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 text-[#C25E38] dark:text-[#E06D43] shrink-0" />
            <div>
              <div className="font-bold text-sm text-[#2D2622] dark:text-[#F5F2EB]">
                Explore 20+ Additional Life Dilemmas in Full Directory
              </div>
              <div className="text-xs text-[#6B5E55] dark:text-[#A89F91]">
                Covering Corporate Burnout, Imposter Syndrome, Loss & Grief, Emotional Equanimity, and Secular Purpose.
              </div>
            </div>
          </div>
          <Link
            href="/dilemmas"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white text-xs font-bold hover:opacity-90 transition shrink-0 shadow-md"
          >
            <span>Open Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* SECTION 2: Why NityaGeeta? Grounded Wisdom vs Generic AI Chatbots */}
      <section id="why-grounded" className="py-24 px-6 max-w-6xl mx-auto w-full border-t border-[#E8E1D7] dark:border-[#38332E]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-sans font-semibold tracking-widest text-[#C25E38] dark:text-[#E06D43] uppercase block mb-2">
            Scriptural Fidelity & Integrity
          </span>
          <h2 className="text-3xl sm:text-4xl text-[#2D2622] dark:text-[#F5F2EB] font-normal font-serif">
            Why <span className="text-[#C25E38] dark:text-[#E06D43]">NityaGeeta</span> vs Generic AI
          </h2>
          <p className="mt-4 text-[#6B5E55] dark:text-[#A89F91] font-sans text-base leading-relaxed">
            Generic chatbots hallucinate quotes and blend unverified self-help clichés. NityaGeeta enforces 100% verifiable Sanskrit manuscript citations.
          </p>
        </div>

        {/* Side-by-Side Comparison Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans mb-12">
          
          {/* Box 1: Generic AI Chatbots */}
          <div className="p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-red-300/60 dark:border-red-900/40 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
              Generic Chatbots
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
                    Generic AI Models
                  </h3>
                  <p className="text-xs text-[#8C7B70] dark:text-[#A89F91]">
                    Standard Generic AI & Competitive Chatbots
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm text-[#5C4F45] dark:text-[#D4C7B8]">
                  <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-[#2D2622] dark:text-[#F5F2EB]">Frequent AI Hallucinations:</strong> Generates synthetic quotes that sound holy but do not exist in the 700 canonical verses.
                    <button
                      onClick={() => {
                        setHomeCitationsOpen(true);
                        setTimeout(() => document.getElementById("home-citations")?.scrollIntoView({ behavior: "smooth" }), 50);
                      }}
                      title="View Citation [1]"
                      className="inline-flex items-center justify-center ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-red-700 dark:text-red-300 bg-red-100/80 dark:bg-red-950/60 hover:bg-red-200/80 transition cursor-pointer border-0"
                    >
                      [1]
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-[#5C4F45] dark:text-[#D4C7B8]">
                  <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-[#2D2622] dark:text-[#F5F2EB]">Zero Page-Level Proof:</strong> Black-box answers with no links to verifiable original Sanskrit PDF manuscripts.
                    <button
                      onClick={() => {
                        setHomeCitationsOpen(true);
                        setTimeout(() => document.getElementById("home-citations")?.scrollIntoView({ behavior: "smooth" }), 50);
                      }}
                      title="View Citation [2]"
                      className="inline-flex items-center justify-center ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-red-700 dark:text-red-300 bg-red-100/80 dark:bg-red-950/60 hover:bg-red-200/80 transition cursor-pointer border-0"
                    >
                      [2]
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-[#5C4F45] dark:text-[#D4C7B8]">
                  <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-[#2D2622] dark:text-[#F5F2EB]">Sectarian & Modern Bias:</strong> Conflates subjective modern internet interpretations with ancient shastric wisdom.
                    <button
                      onClick={() => {
                        setHomeCitationsOpen(true);
                        setTimeout(() => document.getElementById("home-citations")?.scrollIntoView({ behavior: "smooth" }), 50);
                      }}
                      title="View Citation [2]"
                      className="inline-flex items-center justify-center ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-red-700 dark:text-red-300 bg-red-100/80 dark:bg-red-950/60 hover:bg-red-200/80 transition cursor-pointer border-0"
                    >
                      [2]
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-[#5C4F45] dark:text-[#D4C7B8]">
                  <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-[#2D2622] dark:text-[#F5F2EB]">Single Model Blindspot:</strong> Single LLM generation without automated accuracy consensus or cross-examination.
                    <button
                      onClick={() => {
                        setHomeCitationsOpen(true);
                        setTimeout(() => document.getElementById("home-citations")?.scrollIntoView({ behavior: "smooth" }), 50);
                      }}
                      title="View Citation [3]"
                      className="inline-flex items-center justify-center ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-red-700 dark:text-red-300 bg-red-100/80 dark:bg-red-950/60 hover:bg-red-200/80 transition cursor-pointer border-0"
                    >
                      [3]
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-red-200 dark:border-red-950/60 text-xs text-red-600 dark:text-red-400">
              Risk: Misguided spiritual advice, misattributed quotes, and loss of source trust.
            </div>
          </div>

          {/* Box 2: NityaGeeta Grounded Wisdom Engine */}
          <div className="p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#262320] border-2 border-[#C25E38] dark:border-[#E06D43] shadow-2xl relative overflow-hidden flex flex-col justify-between ring-4 ring-[#C25E38]/10 dark:ring-[#E06D43]/15">
            <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-[#C25E38] dark:bg-[#E06D43] text-white text-xs font-bold uppercase tracking-wider shadow-md">
              Verifiable RAG Engine
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
                    NityaGeeta Grounded Architecture
                  </h3>
                  <p className="text-xs text-[#C25E38] dark:text-[#E06D43] font-semibold">
                    100% Sanskrit Shloka & Commentary Grounding
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm text-[#5C4F45] dark:text-[#D4C7B8]">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-[#2D2622] dark:text-[#F5F2EB]">100% Canonical Grounding:</strong> In-memory index of all 700 verses in RAM (&lt;2ms lookup) with exact Chapter and Verse anchors.
                    <button
                      onClick={() => {
                        setHomeCitationsOpen(true);
                        setTimeout(() => document.getElementById("home-citations")?.scrollIntoView({ behavior: "smooth" }), 50);
                      }}
                      title="View Citation [2]"
                      className="inline-flex items-center justify-center ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#C25E38] dark:text-[#E06D43] bg-[#C25E38]/15 dark:bg-[#E06D43]/25 hover:bg-[#C25E38]/30 transition cursor-pointer border-0"
                    >
                      [2]
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-[#5C4F45] dark:text-[#D4C7B8]">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-[#2D2622] dark:text-[#F5F2EB]">Direct PDF Source Proof:</strong> 1-Click access to original 1923 Gita Press and SUNY Press PDF manuscripts to verify for yourself.
                    <button
                      onClick={() => {
                        setHomeCitationsOpen(true);
                        setTimeout(() => document.getElementById("home-citations")?.scrollIntoView({ behavior: "smooth" }), 50);
                      }}
                      title="View Citation [2]"
                      className="inline-flex items-center justify-center ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#C25E38] dark:text-[#E06D43] bg-[#C25E38]/15 dark:bg-[#E06D43]/25 hover:bg-[#C25E38]/30 transition cursor-pointer border-0"
                    >
                      [2]
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-[#5C4F45] dark:text-[#D4C7B8]">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-[#2D2622] dark:text-[#F5F2EB]">Multi-Commentary Synthesis:</strong> Classical bhashyas (Swami Ramsukhdas, Shankaracharya, Sargeant) with zero sectarian distortion.
                    <button
                      onClick={() => {
                        setHomeCitationsOpen(true);
                        setTimeout(() => document.getElementById("home-citations")?.scrollIntoView({ behavior: "smooth" }), 50);
                      }}
                      title="View Citation [2]"
                      className="inline-flex items-center justify-center ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#C25E38] dark:text-[#E06D43] bg-[#C25E38]/15 dark:bg-[#E06D43]/25 hover:bg-[#C25E38]/30 transition cursor-pointer border-0"
                    >
                      [2]
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-[#5C4F45] dark:text-[#D4C7B8]">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-[#2D2622] dark:text-[#F5F2EB]">5-Model Parallel Consensus:</strong> Groq 70B, Gemini 2.0, OpenRouter MoA scored by an automated judge with transparent scorecards.
                    <button
                      onClick={() => {
                        setHomeCitationsOpen(true);
                        setTimeout(() => document.getElementById("home-citations")?.scrollIntoView({ behavior: "smooth" }), 50);
                      }}
                      title="View Citation [3]"
                      className="inline-flex items-center justify-center ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#C25E38] dark:text-[#E06D43] bg-[#C25E38]/15 dark:bg-[#E06D43]/25 hover:bg-[#C25E38]/30 transition cursor-pointer border-0"
                    >
                      [3]
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#DFD5C6] dark:border-[#38332E] flex items-center justify-between text-xs text-[#C25E38] dark:text-[#E06D43] font-bold">
              <span>Result: Uncompromised Authenticity & Sacred Trust</span>
              <a href="#sources" className="inline-flex items-center gap-1 hover:underline">
                Inspect Sources <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Verification Citations & Empirical Footnotes (Interactive Dropdown) */}
        <div id="home-citations" className="mt-8 rounded-2xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DFD5C6] dark:border-[#38332E] shadow-md overflow-hidden scroll-mt-24 transition-all font-sans">
          <div
            onClick={() => setHomeCitationsOpen(!homeCitationsOpen)}
            className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-[#EFE9DF]/60 dark:hover:bg-[#262320] transition select-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-[#2D2622] dark:text-[#F5F2EB] font-serif">
                Academic Research & Empirical Citations
              </span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43]">
                4 Verified Citations
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/architecture");
                }}
                className="text-xs font-bold text-[#C25E38] dark:text-[#E06D43] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
              >
                <span>View Architecture</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <div className="w-6 h-6 rounded-md bg-[#EFE9DF] dark:bg-[#2A2622] flex items-center justify-center">
                <ChevronDown className={`w-4 h-4 text-[#8C7B70] dark:text-[#A89F91] transition-transform duration-300 ${homeCitationsOpen ? "rotate-180" : ""}`} />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {homeCitationsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden border-t border-[#DFD5C6]/60 dark:border-[#38332E]/60 p-4 sm:p-6 space-y-3.5 text-xs text-[#5C4F45] dark:text-[#A89F91] bg-[#FAF7F2]/50 dark:bg-[#1E1B18]/50"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
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
              link: "https://storage.googleapis.com/nityageeta-library/Srimad%20Bhagavad%20Gita%20Press%20Gorakhpur.pdf",
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
              score: 92,
              scoreLabel: "(92) out of (100)",
              metricName: "Layer 2 Precision",
              scoreBasis: "Verified by SUNY Press Sanskrit Interlinear Grammatical Parsing Standard.",
              authenticityRatio: "(99) out of (100)",
              authenticityDetail: "Complete Devanagari script with precise Roman IAST phonetic transliteration.",
              contextTrustRatio: "(92) out of (100)",
              contextTrustDetail: "Pure interlinear word-for-word grammatical parsing without translator bias.",
              scholarlyAuthorityRatio: "(97) out of (100)",
              scholarlyAuthorityDetail: "SUNY Press peer-reviewed academic gold standard for Sanskrit grammar.",
              summary: "An academic masterwork that dissects all 700 verses of the Gita word-by-word, providing Devanagari script, Roman IAST transliteration, exact grammatical role parsing, and literal English definitions.",
              whyThisNumber: "Positioned at #2 as Layer 2 Precision because it anchors NityaGeeta's Sanskrit translation engine to exact grammatical definitions, ensuring total accuracy when answering complex queries."
            },
            {
              priority: 3,
              id: "geeta-3",
              title: "Bhagavad Gita Shankara Bhashya",
              author: "Adi Shankaracharya",
              published: "Written c. 8th Century CE (788–820 CE)",
              authorBio: "Foundational master of Advaita Vedanta (Non-Dualism)",
              badge: "Advaita Vedanta",
              tagline: "Classical Non-Dualism",
              desc: "The foundational non-dualistic commentary establishing self-realization and Jnana Yoga wisdom.",
              link: "https://dn760101.eu.archive.org/0/items/Bhagavad-Gita.with.the.Commentary.of.Sri.Shankaracharya/Bhagavad-Gita.with.the.Commentary.of.Sri.Shankaracharya.pdf",
              verses: "700 Verses Covered",
              score: 98,
              scoreLabel: "(98) out of (100)",
              metricName: "Layer 3 Deep Commentary",
              scoreBasis: "Verified against 8th Century CE Advaita Vedanta Bhashya Standard.",
              authenticityRatio: "(98) out of (100)",
              authenticityDetail: "Foundational 8th-Century Sanskrit manuscript commentary.",
              contextTrustRatio: "(98) out of (100)",
              contextTrustDetail: "Rigorous Advaita Vedanta non-dualistic exegesis on Brahman and the Self.",
              scholarlyAuthorityRatio: "(100) out of (100)",
              scholarlyAuthorityDetail: "1200+ years of uninterrupted historical Vedantic authority.",
              summary: "The earliest surviving classical commentary on the Bhagavad Gita, establishing that ultimate liberation (Moksha) is attained through spiritual knowledge (Jnana Yoga) and Self-realization.",
              whyThisNumber: "Positioned at #3 as Layer 3 Deep Commentary to anchor NityaGeeta in the highest intellectual and metaphysical standards of classical Indian philosophy."
            },
            {
              priority: 4,
              id: "geeta-4",
              title: "Gita Sadhak Sanjeevani",
              author: "Swami Ramsukhdas",
              published: "First Published 1988 (Gita Press)",
              authorBio: "Venerated saint and lifelong scholar of the Gita Press tradition",
              badge: "Practical Spiritual Guide",
              tagline: "Comprehensive Masterwork",
              desc: "Comprehensive practical commentary analyzing every verse, word meaning, and application in daily life.",
              link: "https://dn760108.eu.archive.org/0/items/gita-sadhak-sanjevani-english/Gita-Sadhak-Sanjevani-English.pdf",
              verses: "700 Verses Covered",
              score: 97,
              scoreLabel: "(97) out of (100)",
              metricName: "Layer 4 Practical Application",
              scoreBasis: "Verified against Swami Ramsukhdas Commentary Dataset.",
              authenticityRatio: "(97) out of (100)",
              authenticityDetail: "Complete 700-verse exegesis with authentic word-by-word Sanskrit breakdown.",
              contextTrustRatio: "(98) out of (100)",
              contextTrustDetail: "Focuses purely on daily householder duty (Karma Yoga) without sectarian dogma.",
              scholarlyAuthorityRatio: "(97) out of (100)",
              scholarlyAuthorityDetail: "Comprehensive lifetime masterwork by venerated Gita Press scholar.",
              summary: "A monumental practical treatise that transforms subtle Vedic concepts into actionable guidance for everyday life, householders, and spiritual seekers.",
              whyThisNumber: "Positioned at #4 as Layer 4 Practical Application because when users ask NityaGeeta real-life questions about anxiety, duty, and work, this edition provides unmatched practical solutions."
            }
          ] : [
            {
              priority: 1,
              id: "ved-1",
              title: "B.O.S.S : Basics of Sanatan Sanskriti",
              author: "Veducation Knowledge Series",
              published: "English Edition (Veducation.world)",
              authorBio: "Veducation Sanskriti Research Team",
              badge: "Vedic Essentials",
              tagline: "Sanatan Foundations",
              desc: "Essential handbook on the foundational principles of Sanatan Sanskriti and Vedic lifestyle.",
              link: "https://www.veducation.world/store/BOSS-Eng",
              verses: "Complete Handbook",
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
              title: "Vedic Dincharya : Daily Routine & Shlokas",
              author: "Veducation Health & Lifestyle Team (Hindi Version)",
              published: "Hindi Edition (Veducation.world)",
              authorBio: "Veducation Health & Lifestyle Team",
              badge: "Shastric Routine",
              tagline: "Daily Discipline",
              desc: "Guide to traditional shastric daily routine (Dincharya) for physical, mental, and spiritual well-being.",
              link: "https://www.veducation.world/store/VD-Hindi",
              verses: "Daily Discipline Manual",
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
              title: "Brahmacharya : The Ultimate Action Book",
              author: "Veducation Practical Discipline Team (Hindi Version)",
              published: "Hindi Edition (Veducation.world)",
              authorBio: "Veducation Research & Discipline Series",
              badge: "Self-Mastery",
              tagline: "Action Guide",
              desc: "Practical action guide on self-mastery, focus, energy conservation, and spiritual discipline.",
              link: "https://www.veducation.world/store/Brahmcharya-Hindi",
              verses: "Action Guide",
              score: 92,
              scoreLabel: "(92) out of (100)",
              metricName: "Self-Mastery Guide",
              scoreBasis: "Verified by Veducation Practical Discipline Research Series.",
              authenticityRatio: "(92) out of (100)",
              authenticityDetail: "Actionable self-mastery guidance based on classical Yoga Sutra principles.",
              contextTrustRatio: "(93) out of (100)",
              contextTrustDetail: "Empowerment focused on focus, discipline, and mental clarity.",
              scholarlyAuthorityRatio: "(91) out of (100)",
              scholarlyAuthorityDetail: "Verified by Veducation practical discipline research series.",
              summary: "Actionable manual focusing on willpower, energy conservation, mind control, focus, and spiritual strength.",
              whyThisNumber: "Positioned at #3 as the dedicated action guide for self-mastery and deep mental focus."
            },
            {
              priority: 4,
              id: "ved-4",
              title: "5 in 1 Pack : Complete Vedic Curriculum",
              author: "Veducation Publishing & Cultural Foundation",
              published: "Complete Collector's Pack (Veducation.world)",
              authorBio: "Veducation Editorial & Publishing Wing",
              badge: "5-in-1 Bundle",
              tagline: "5-Book Master Bundle",
              desc: "All-in-one comprehensive 5-book master pack featuring B.O.S.S, Vedic Dincharya, Brahmacharya, and 2 exclusive supplementary gift books.",
              link: "https://www.veducation.world/store/5in1books",
              verses: "5-Book Master Pack",
              score: 97,
              scoreLabel: "(97) out of (100)",
              metricName: "Complete Curriculum",
              scoreBasis: "Official Veducation Store master bundle.",
              authenticityRatio: "(97) out of (100)",
              authenticityDetail: "Encompasses all foundational texts, daily lifestyle shastras, and focus mastery guides.",
              contextTrustRatio: "(97)",
              contextTrustDetail: "Holistic learning ecosystem for individuals, families, and educational institutions.",
              scholarlyAuthorityRatio: "(97) out of (100)",
              scholarlyAuthorityDetail: "Veducation Official Master Collection.",
              summary: "The ultimate 5-in-1 master set bringing together the core foundational texts, daily Ayurvedic discipline manuals, willpower training, and supplementary Vedic wisdom guides.",
              whyThisNumber: "Positioned at #4 as the complete 5-book bundle referenced across our knowledge base."
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
                        {source.link ? "Explore full canonical manuscript in high-resolution in-app reader:" : "Available offline in NityaGeeta's local dataset:"}
                      </span>

                      {source.link ? (
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleOpenPdf(source.link, source.title)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition shadow-md cursor-pointer border-0"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>Read in App Viewer</span>
                          </button>
                          <a
                            href={source.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#EFE9DF] dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] text-[#5C4F45] dark:text-[#D4C7B8] text-xs font-semibold hover:text-[#C25E38] dark:hover:text-[#E06D43] transition shadow-sm"
                            title="Download / Open Archive.org PDF"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
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

        {/* Full Scripture & Manuscript Explorer Banner */}
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#262320] border-2 border-[#C25E38]/30 dark:border-[#E06D43]/40 flex flex-col sm:flex-row items-center justify-between gap-6 font-sans text-center sm:text-left shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center shrink-0 shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-base sm:text-lg font-serif text-[#2D2622] dark:text-[#F5F2EB]">
                Scripture & Manuscript Explorer (In-App PDF Viewers)
              </div>
              <div className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] mt-1">
                Explore the complete Sadhaka-Sanjivani, SUNY Press grammar breakdown, 18 Chapters index, and 4-pillar vetting criteria.
              </div>
            </div>
          </div>
          <Link
            href="/sources"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white text-xs font-bold hover:opacity-90 transition shrink-0 shadow-md"
          >
            <span>Open Sources Explorer</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Support & Contact Us Section - Direct Redirect to Dedicated /contact Portal */}
      <section id="support" className="py-20 px-6 max-w-5xl mx-auto w-full border-t border-[#E8E1D7] dark:border-[#38332E]">
        <div className="p-8 sm:p-12 md:p-14 rounded-3xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DFD5C6] dark:border-[#38332E] shadow-xl text-center flex flex-col items-center relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#C25E38]/10 dark:bg-[#E06D43]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] text-xs font-bold uppercase tracking-wider font-sans mb-4 relative z-10">
            <MessageSquare className="w-3.5 h-3.5" /> Open Peer Review & Verification
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif text-[#2D2622] dark:text-[#F5F2EB] font-normal max-w-2xl leading-tight relative z-10">
            Have Questions, Sanskrit Corrections, or <span className="text-[#C25E38] dark:text-[#E06D43]">Archival Contributions?</span>
          </h2>

          <p className="mt-4 text-xs sm:text-sm md:text-base text-[#6B5E55] dark:text-[#D4C7B8] max-w-xl leading-relaxed font-sans relative z-10">
            NityaGeeta is built with reverence for canonical Sanskrit traditions and open scholarly transparency. Whether you noticed a nuance in commentary, discovered a glitch, or want to contribute bhashyas, your input directly shapes this project.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 w-full max-w-3xl font-sans text-xs text-left relative z-10">
            <div className="p-4 rounded-2xl bg-[#EFE9DF]/60 dark:bg-[#262320] border border-[#DFD5C6]/80 dark:border-[#38332E]">
              <div className="font-bold text-[#2D2622] dark:text-[#F5F2EB] text-sm mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                Verse Accuracy
              </div>
              <p className="text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                Report OCR typos in shlokas or translations. We cross-verify with physical Gita Press editions within 24h.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#EFE9DF]/60 dark:bg-[#262320] border border-[#DFD5C6]/80 dark:border-[#38332E]">
              <div className="font-bold text-[#2D2622] dark:text-[#F5F2EB] text-sm mb-1 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                Visual Bug Reports
              </div>
              <p className="text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                Attach screenshots of UI glitches or chat anomalies directly in our high-res image submission portal.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#EFE9DF]/60 dark:bg-[#262320] border border-[#DFD5C6]/80 dark:border-[#38332E]">
              <div className="font-bold text-[#2D2622] dark:text-[#F5F2EB] text-sm mb-1 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                Bhashya Insights
              </div>
              <p className="text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                Share authentic references from Advaita, Vishishtadvaita, Dvaita, or Veducation repositories.
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <button
              onClick={() => router.push("/contact")}
              className="px-6 py-3.5 rounded-2xl bg-[#C25E38] dark:bg-[#E06D43] hover:brightness-110 text-white font-sans font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer border-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Visit Contact & Feedback Portal</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto w-full border-t border-[#E8E1D7] dark:border-[#38332E]">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] text-xs font-bold uppercase tracking-wider font-sans mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl text-[#2D2622] dark:text-[#F5F2EB] font-serif font-normal">
            Everything You Need To <span className="text-[#C25E38] dark:text-[#E06D43]">Know</span>
          </h2>
          <p className="mt-2 text-[#6B5E55] dark:text-[#D4C7B8] font-sans text-sm max-w-xl mx-auto">
            Clear insights on our verified scriptural grounding, 5-model AI architecture, and privacy commitments.
          </p>
        </div>

        <div className="space-y-4 font-sans">
          {/* FAQ Item 1 */}
          <div className="border border-[#E8E1D7] dark:border-[#38332E] rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] overflow-hidden transition-all shadow-sm hover:border-[#C25E38]/40">
            <button
              onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
              className="w-full px-6 py-5 text-left font-serif font-bold text-base sm:text-lg text-[#2D2622] dark:text-[#F5F2EB] flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
            >
              <span>1. How does NityaGeeta prevent AI hallucinations and provide authentic answers?</span>
              {openFaq === 0 ? (
                <ChevronUp className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#8C7B70] dark:text-[#A89F91] shrink-0" />
              )}
            </button>
            {openFaq === 0 && (
              <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed border-t border-[#E8E1D7]/60 dark:border-[#38332E] space-y-2">
                <p>
                  NityaGeeta utilizes a strict Retrieval-Augmented Generation (RAG) system grounded in authenticated Sanskrit Gita commentaries—primarily the monumental <em>Sadhaka-Sanjivani</em> commentary by Swami Ramsukhdas (Gita Press Gorakhpur) and Winthrop Sargeant&apos;s SUNY Press interlinear grammar.
                </p>
                <p>
                  When you ask a question, our engine performs hybrid vector search across all 700 canonical Sanskrit verses in RAM (&lt;2ms) before prompting the AI, ensuring every answer is anchored to verified chapters, verses, and traditional purports without hallucination.
                </p>
              </div>
            )}
          </div>

          {/* FAQ Item 2 */}
          <div className="border border-[#E8E1D7] dark:border-[#38332E] rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] overflow-hidden transition-all shadow-sm hover:border-[#C25E38]/40">
            <button
              onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
              className="w-full px-6 py-5 text-left font-serif font-bold text-base sm:text-lg text-[#2D2622] dark:text-[#F5F2EB] flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
            >
              <span>2. Which classical commentaries and translations are included in the dataset?</span>
              {openFaq === 1 ? (
                <ChevronUp className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#8C7B70] dark:text-[#A89F91] shrink-0" />
              )}
            </button>
            {openFaq === 1 && (
              <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed border-t border-[#E8E1D7]/60 dark:border-[#38332E] space-y-2">
                <p>
                  Commentary sources are ranked by scholarly authority and non-sectarian clarity:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-[#5C4F45] dark:text-[#D4C7B8]">
                  <li><strong>Gita Press Gorakhpur (Sadhaka-Sanjivani):</strong> Comprehensive practical treatise by Swami Ramsukhdas.</li>
                  <li><strong>Winthrop Sargeant (SUNY Press):</strong> Word-for-word grammatical parsing and Roman IAST phonetics.</li>
                  <li><strong>Adi Shankaracharya (Advaita Bhashya):</strong> Classical 8th-century non-dualist exegesis on Self-realization.</li>
                  <li><strong>Sri Ramanujacharya & Sri Madhvacharya:</strong> Theistic devotion (Bhakti & Prapatti) and Dvaita realism.</li>
                  <li><strong>Veducation Knowledge Series:</strong> BOSS (Sanatan Foundations) and Vedic Dincharya for lifestyle alignment.</li>
                </ul>
              </div>
            )}
          </div>

          {/* FAQ Item 3 */}
          <div className="border border-[#E8E1D7] dark:border-[#38332E] rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] overflow-hidden transition-all shadow-sm hover:border-[#C25E38]/40">
            <button
              onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
              className="w-full px-6 py-5 text-left font-serif font-bold text-base sm:text-lg text-[#2D2622] dark:text-[#F5F2EB] flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
            >
              <span>3. How does the 5-Model Parallel Consensus Engine work?</span>
              {openFaq === 2 ? (
                <ChevronUp className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#8C7B70] dark:text-[#A89F91] shrink-0" />
              )}
            </button>
            {openFaq === 2 && (
              <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed border-t border-[#E8E1D7]/60 dark:border-[#38332E] space-y-2">
                <p>
                  Instead of relying on a single black-box AI model, NityaGeeta dispatches user prompts simultaneously to 5 frontier models (Groq LLaMA-3 70B, Google Gemini 2.0, DeepSeek, and OpenRouter Mixture-of-Agents).
                </p>
                <p>
                  An automated Judge model evaluates each response on citation fidelity, accuracy against classical Sanskrit shlokas, and tone purity, surfacing the winning #1 candidate while allowing seekers to inspect alternative model perspectives in real-time.
                </p>
              </div>
            )}
          </div>

          {/* FAQ Item 4 */}
          <div className="border border-[#E8E1D7] dark:border-[#38332E] rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] overflow-hidden transition-all shadow-sm hover:border-[#C25E38]/40">
            <button
              onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
              className="w-full px-6 py-5 text-left font-serif font-bold text-base sm:text-lg text-[#2D2622] dark:text-[#F5F2EB] flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
            >
              <span>4. Is NityaGeeta free to use and what is your privacy policy?</span>
              {openFaq === 3 ? (
                <ChevronUp className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#8C7B70] dark:text-[#A89F91] shrink-0" />
              )}
            </button>
            {openFaq === 3 && (
              <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed border-t border-[#E8E1D7]/60 dark:border-[#38332E] space-y-2">
                <p>
                  NityaGeeta is 100% free, non-commercial, and ad-free. We adhere to a strict <Link href="/privacy" className="text-[#C25E38] dark:text-[#E06D43] font-bold underline">Sacred Privacy Pledge</Link>:
                </p>
                <p>
                  We will never run commercial banner ads, sell user data to advertising networks, or use your private spiritual inquiries to train public AI models. You have complete control over your session history and account data.
                </p>
              </div>
            )}
          </div>

          {/* FAQ Item 5 */}
          <div className="border border-[#E8E1D7] dark:border-[#38332E] rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] overflow-hidden transition-all shadow-sm hover:border-[#C25E38]/40">
            <button
              onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
              className="w-full px-6 py-5 text-left font-serif font-bold text-base sm:text-lg text-[#2D2622] dark:text-[#F5F2EB] flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
            >
              <span>5. Can I read and verify the original source PDF manuscripts?</span>
              {openFaq === 4 ? (
                <ChevronUp className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#8C7B70] dark:text-[#A89F91] shrink-0" />
              )}
            </button>
            {openFaq === 4 && (
              <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed border-t border-[#E8E1D7]/60 dark:border-[#38332E] space-y-2">
                <p>
                  Yes! We believe transparency is the highest virtue. Visit our dedicated <Link href="/sources" className="text-[#C25E38] dark:text-[#E06D43] font-bold underline">Resources & Sources Page</Link> to access the in-app PDF reader and archive links for original Gita Press, SUNY Press, and Acharya manuscripts.
                </p>
              </div>
            )}
          </div>

          {/* FAQ Item 6 */}
          <div className="border border-[#E8E1D7] dark:border-[#38332E] rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] overflow-hidden transition-all shadow-sm hover:border-[#C25E38]/40">
            <button
              onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}
              className="w-full px-6 py-5 text-left font-serif font-bold text-base sm:text-lg text-[#2D2622] dark:text-[#F5F2EB] flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
            >
              <span>6. How can scholars or seekers report a disputed citation or feedback?</span>
              {openFaq === 5 ? (
                <ChevronUp className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#8C7B70] dark:text-[#A89F91] shrink-0" />
              )}
            </button>
            {openFaq === 5 && (
              <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed border-t border-[#E8E1D7]/60 dark:border-[#38332E] space-y-2">
                <p>
                  We actively welcome scholarly contributions and feedback. You can visit our{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/contact")}
                    className="text-[#C25E38] dark:text-[#E06D43] font-bold underline inline cursor-pointer bg-transparent border-0 p-0 text-xs sm:text-sm"
                  >
                    Contact & Community Feedback Page
                  </button>{" "}
                  to submit suggested improvements, Sanskrit corrections, screenshot bug reports, or commentary additions.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Universal Global Footer */}
      <Footer />

      {/* High-Resolution In-App PDF Manuscript Reader Modal Portal */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {selectedPdfUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="bg-[#FAF7F2] dark:bg-[#1A1816] rounded-2xl sm:rounded-3xl border border-[#DFD5C6] dark:border-white/20 shadow-2xl w-[96vw] max-w-[1600px] h-[90vh] sm:h-[92vh] flex flex-col overflow-hidden"
              >
                {/* Theme-Adaptive Top Header */}
                <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 bg-[#FAF7F2] dark:bg-[#201C19] border-b border-[#E8E1D7] dark:border-white/10 text-[#2D2622] dark:text-[#F5F2EB] font-sans shrink-0">
                  <div className="flex items-center gap-2.5 truncate max-w-md sm:max-w-xl">
                    <BookOpen className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />
                    <div>
                      <h3 className="text-sm sm:text-base font-bold font-serif truncate text-[#2D2622] dark:text-[#F5F2EB]">
                        {selectedBookTitle}
                      </h3>
                      <div className="text-[10px] text-[#8C7B70] dark:text-[#A89F91] font-mono">
                        Archived Edition • Public Domain Research Preservation
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setSelectedPdfUrl(null)}
                      className="p-1.5 sm:p-2 rounded-xl bg-[#EFE9DF] dark:bg-white/10 hover:bg-[#C25E38] dark:hover:bg-[#E06D43] text-[#2D2622] dark:text-white hover:text-white transition cursor-pointer flex items-center justify-center border-0"
                      aria-label="Close Viewer"
                      title="Close Viewer"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* PDF Manuscript Reader with HTML5 Canvas & Full Working Controls */}
                <div className="flex-1 w-full h-full overflow-hidden">
                  <PdfManuscriptReader
                    url={selectedPdfUrl}
                    title={selectedBookTitle}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
  }
  