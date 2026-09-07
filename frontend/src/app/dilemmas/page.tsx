"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  Search,
  Briefcase,
  Scale,
  HeartHandshake,
  Globe,
  ArrowRight,
  BookOpen,
  Layers,
  CheckCircle2,
  Bookmark,
  Grid,
  ChevronDown,
  Info,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import {
  GITA_DILEMMAS_MASTER,
  GITA_CHAPTERS_INFO,
  GitaDilemma,
  GitaChapterInfo
} from "@/data/gitaDilemmas";

export default function DilemmasPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedChapter, setSelectedChapter] = useState<number | "all">("all");
  const [showChaptersDrawer, setShowChaptersDrawer] = useState(false);
  const [showInfoPopover, setShowInfoPopover] = useState(false);

  // Automatically read ?chapter=X from URL if navigated from /sources
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ch = params.get("chapter");
      if (ch) {
        const parsed = parseInt(ch, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 18) {
          setSelectedChapter(parsed);
          setActiveCategory("all");
        }
      }
    }
  }, []);

  // Category filters without numbers as requested
  const categories = [
    { id: "all", label: "All Dilemmas", icon: Layers },
    { id: "work", label: "Work & Ambition", icon: Briefcase },
    { id: "ethics", label: "Ethics & Duty", icon: Scale },
    { id: "mental", label: "Mental Peace & Anxiety", icon: Compass },
    { id: "relationships", label: "Relationships & Harmony", icon: HeartHandshake },
    { id: "existential", label: "Life Purpose & Meaning", icon: Globe }
  ];

  // Common conversational stop words for Semantic NLP Extraction
  const STOP_WORDS = useMemo(() => new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", "about",
    "of", "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "i", "me", "my", "myself", "we", "our", "you", "your", "he", "him",
    "she", "her", "it", "its", "they", "them", "what", "which", "who", "whom", "this", "that",
    "these", "those", "from", "as", "by", "into", "through", "during", "before", "after",
    "above", "below", "up", "down", "out", "off", "over", "under", "again", "further",
    "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both",
    "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only",
    "own", "same", "so", "than", "too", "very", "can", "will", "just", "should", "now",
    "tell", "show", "find", "looking", "look", "want", "would", "like", "give", "please",
    "help", "helps", "need", "needs", "feel", "feeling", "feelings", "dilemma", "dilemmas", "situation",
    "shloka", "verse", "verses", "chapter", "content", "contents", "contain", "contains",
    "knowledge", "provide", "provides", "learn", "learning", "understand",
    "understands", "understanding", "explain", "explains", "guidance", "guide", "infomration",
    "one", "ones", "someone", "anyone", "everyone", "person", "people", "getting", "got", "goes", "going"
  ]), []);

  // Common typo and phonetic normalization dictionary for Indian dilemma queries
  const TYPO_MAP: Record<string, string> = useMemo(() => ({
    consmic: "cosmic",
    infomration: "information",
    karm: "karma",
    dharm: "dharma",
    atmam: "atman",
    dhyan: "dhyana",
    jnanam: "jnana",
    shlok: "shloka",
    sloka: "shloka",
    geeta: "gita",
    bhagvat: "bhagavad",
    burn: "burnout",
    burnt: "burnout",
    burned: "burnout",
    burning: "burnout",
    exhausted: "exhaustion",
    exaustion: "exhaustion",
    overwhelm: "overwhelmed",
    overworked: "burnout"
  }), []);

  // Emotional, psychological, and Vedic concept synonyms
  const SEMANTIC_SYNONYMS: Record<string, string[]> = useMemo(() => ({
    burnout: ["exhaustion", "fatigue", "overworked", "tired", "overwhelmed", "workaholic", "hustle", "workload", "burn", "burnt", "burned"],
    anxiety: ["panic", "fear", "worry", "nervous", "terror", "stress", "heartbeat", "trembling", "somatic", "mental", "restless", "phobia", "chills", "agitation", "anxious"],
    depression: ["sadness", "grief", "despair", "hopeless", "collapse", "empty", "meaningless", "unmotivated", "sorrow", "crying", "melancholy", "down", "depressed"],
    duty: ["dharma", "responsibility", "obligation", "career", "job", "profession", "calling", "swadharma", "ethics", "moral", "role", "work", "action"],
    grief: ["loss", "death", "mourning", "bereavement", "sorrow", "crying", "heartbreak", "tragedy", "dying", "passed", "funeral", "beloved"],
    relationships: ["family", "friends", "betrayal", "conflict", "marriage", "partner", "loyalty", "attachment", "love", "toxic", "kinship", "relatives", "parents", "friendship"],
    action: ["karma", "work", "execution", "focus", "discipline", "laziness", "procrastination", "motivation", "effort", "sloth", "tamas", "inaction", "craftsmanship"],
    mind: ["peace", "meditation", "restless", "focus", "monkey", "thoughts", "dhyana", "overthinking", "stillness", "calm", "clarity", "concentration", "mastery"],
    anger: ["rage", "frustration", "irritation", "krodha", "revenge", "bitterness", "resentment", "grudge", "hate", "furious", "wrath"],
    detachment: ["surrender", "equanimity", "samatvam", "vairagya", "letting go", "outcome", "stoicism", "serenity", "unattached", "renunciation", "titiksha"],
    purpose: ["meaning", "existential", "who am i", "soul", "atman", "god", "destiny", "calling", "identity", "immortal", "direction", "origin"],
    confusion: ["paralysis", "indecision", "doubt", "crossroads", "stuck", "uncertainty", "hesitation", "quandary", "perplexed", "lost"],
    fear: ["dread", "terror", "bhaya", "mortality", "extinction", "scared", "frightened", "paralyzed", "afraid"],
    discipline: ["control", "habit", "brahmacharya", "sadhana", "practice", "abhyasa", "routine", "restraint", "willpower"]
  }), []);

  // Robust Multi-Token Semantic NLP & Conceptual Search Engine
  const filteredDilemmas = useMemo(() => {
    const rawQ = searchQuery.trim();
    if (!rawQ) {
      const filtered = GITA_DILEMMAS_MASTER.filter((item) => {
        const matchesCategory = activeCategory === "all" || item.category === activeCategory;
        const matchesChapter = selectedChapter === "all" || item.chapter === selectedChapter;
        return matchesCategory && matchesChapter;
      });
      return filtered.sort((a, b) => (a.chapter !== b.chapter ? a.chapter - b.chapter : a.verse - b.verse));
    }

    const cleanQ = rawQ.replace(/^[#@]/, "").toLowerCase();
    
    // Normalize common compound conversational expressions
    const preprocessedQ = cleanQ
      .replace(/\b(burnt|burned|burn)\s+out\b/g, "burnout")
      .replace(/\bloved\s+ones?\b/g, "loss")
      .replace(/\blosing\s+(a\s+)?(loved\s+one|someone|person)\b/g, "grief loss")
      .replace(/\bloss\s+of\s+(a\s+)?(loved\s+one|someone|person)\b/g, "grief loss")
      .replace(/\b(guide|guides|guidance)\s+(my\s+)?mind\b/g, "guidance")
      .trim();

    const rawTokens = preprocessedQ.split(/[\s,+#_.:;?!/\\|()\[\]{}'"]+/).filter(Boolean);
    const meaningfulTokens = rawTokens
      .map((t) => TYPO_MAP[t] || t)
      .filter((t) => !STOP_WORDS.has(t));
    const tokensToUse = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;

    const scoreDilemma = (item: GitaDilemma): number => {
      const titleLower = item.title.toLowerCase();
      const situationLower = item.situation.toLowerCase();
      const insightLower = item.coreInsight.toLowerCase();
      const tagLower = item.tag.toLowerCase();
      const catLower = item.categoryLabel.toLowerCase();
      const sanskritLower = item.verseSanskrit.toLowerCase();
      const translitLower = item.verseTransliteration.toLowerCase();
      const promptLower = item.promptQuery.toLowerCase();
      const chapterInfo = GITA_CHAPTERS_INFO.find((c) => c.num === item.chapter);
      const chNameLower = (chapterInfo?.name || "").toLowerCase();
      const chThemeLower = (chapterInfo?.theme || "").toLowerCase();

      const collapsedQuery = preprocessedQ.replace(/[^a-z0-9]/g, "");
      const collapsedTitle = titleLower.replace(/[^a-z0-9]/g, "");

      let score = 0;

      // 1. Chapter/Verse numerical reference (e.g. "2.47", "2:47", "chapter 2", "ch 2")
      const verseRefDot = `${item.chapter}.${item.verse}`;
      const verseRefColon = `${item.chapter}:${item.verse}`;
      if (cleanQ === verseRefDot || cleanQ === verseRefColon) score += 350;
      else if (cleanQ.includes(verseRefDot) || cleanQ.includes(verseRefColon)) score += 250;
      if (cleanQ === `chapter ${item.chapter}` || cleanQ === `ch ${item.chapter}` || cleanQ === `chapter ${item.chapter.toString().padStart(2, "0")}`) score += 120;

      // 2. Exact phrase match in title, tag, situation, or prompt
      if (titleLower.includes(cleanQ) || titleLower.includes(preprocessedQ)) {
        score += 250;
        if (titleLower.startsWith(cleanQ) || titleLower.startsWith(preprocessedQ) || titleLower.includes(` ${cleanQ} `) || titleLower.includes(` ${preprocessedQ} `)) {
          score += 60;
        }
      } else if (collapsedTitle.includes(collapsedQuery) && collapsedQuery.length >= 3) {
        score += 120;
      }
      if (tagLower.includes(cleanQ) || tagLower.includes(preprocessedQ)) score += 110;
      if (situationLower.includes(cleanQ) || situationLower.includes(preprocessedQ)) score += 85;
      if (promptLower.includes(cleanQ) || promptLower.includes(preprocessedQ)) score += 60;
      if (insightLower.includes(cleanQ) || insightLower.includes(preprocessedQ)) score += 50;
      if (chNameLower.includes(cleanQ) || chThemeLower.includes(cleanQ)) score += 50;

      // Priority boost for Corporate Burnout (2.47) when searching burnout
      if (cleanQ.includes("burnout") && item.id === "work-2-47") {
        score += 80;
      }

      // Topic relevance gating for emotional queries like grief / bereavement
      if (cleanQ.includes("grief") || preprocessedQ.includes("grief")) {
        if (titleLower.includes("grief") || titleLower.includes("grieving")) {
          score += 200;
        } else if (situationLower.includes("grief") || promptLower.includes("grief") || insightLower.includes("grief") || situationLower.includes("passed away")) {
          score += 100;
        } else if (titleLower.includes("death") || situationLower.includes("bereavement") || situationLower.includes("mourning")) {
          score += 40;
        } else {
          score = 0; // Strictly filter out cards that only have incidental generic words
        }
      }

      // 3. Multi-token scoring across all dilemma fields with priority weighting
      let matchedCoreTokensCount = 0;

      tokensToUse.forEach((token) => {
        const cleanToken = token.replace(/[^a-z0-9]/g, "");
        if (!cleanToken) return;

        let tokenScore = 0;
        let tokenMatchedCore = false;

        // Title and tag matches indicate direct topic relevance
        if (titleLower.split(/\s+/).includes(cleanToken)) {
          tokenScore += 120;
          tokenMatchedCore = true;
        } else if (titleLower.includes(token) || collapsedTitle.includes(cleanToken)) {
          tokenScore += 80;
          tokenMatchedCore = true;
        }
        if (tagLower.includes(token)) {
          tokenScore += 75;
          tokenMatchedCore = true;
        }
        if (catLower.includes(token) || item.category === token) {
          tokenScore += 65;
          tokenMatchedCore = true;
        }
        if (situationLower.includes(token)) {
          tokenScore += 45;
          tokenMatchedCore = true;
        }
        if (promptLower.includes(token)) {
          tokenScore += 40;
          tokenMatchedCore = true;
        }
        if (insightLower.includes(token)) tokenScore += 25;
        if (chThemeLower.includes(token)) tokenScore += 25;
        if (sanskritLower.includes(token) || translitLower.includes(token)) tokenScore += 30;

        // Stem / prefix matching for 4+ char terms
        if (cleanToken.length >= 4) {
          const prefix = cleanToken.slice(0, 4);
          if (collapsedTitle.includes(prefix)) {
            tokenScore += 35;
            tokenMatchedCore = true;
          }
        }

        // Semantic synonym expansion
        Object.entries(SEMANTIC_SYNONYMS).forEach(([concept, syns]) => {
          if (cleanToken === concept || syns.includes(cleanToken)) {
            const hasInTitle = titleLower.includes(concept) || syns.some((s) => titleLower.includes(s));
            const hasInSituation = situationLower.includes(concept) || syns.some((s) => situationLower.includes(s));
            const hasInPrompt = promptLower.includes(concept) || syns.some((s) => promptLower.includes(s));
            const hasInTag = tagLower.includes(concept) || syns.some((s) => tagLower.includes(s));

            if (hasInTitle) {
              tokenScore += 65;
              tokenMatchedCore = true;
            } else if (hasInSituation || hasInPrompt || hasInTag) {
              tokenScore += 35;
              tokenMatchedCore = true;
            } else if (insightLower.includes(concept) || syns.some((s) => insightLower.includes(s))) {
              tokenScore += 20;
            }
          }
        });

        if (tokenMatchedCore) {
          matchedCoreTokensCount++;
        }

        score += tokenScore;
      });

      // 4. Multi-token Synergy Boost & Irrelevance Gate
      if (tokensToUse.length >= 2) {
        if (matchedCoreTokensCount >= 2) {
          score += matchedCoreTokensCount * 60;
        } else if (matchedCoreTokensCount === 0 && !titleLower.includes(cleanQ)) {
          score = 0;
        }
      }

      return score;
    };

    // Minimum relevance score threshold to filter out low-scoring noise
    const minThreshold = tokensToUse.length >= 2 ? 65 : 45;

    // First filter by category and chapter
    const scoredPrimary = GITA_DILEMMAS_MASTER
      .filter((item) => {
        const matchesCategory = activeCategory === "all" || item.category === activeCategory;
        const matchesChapter = selectedChapter === "all" || item.chapter === selectedChapter;
        return matchesCategory && matchesChapter;
      })
      .map((item) => ({ item, score: scoreDilemma(item) }))
      .filter((res) => res.score >= minThreshold);

    // If active filters produced 0 results, fall back to search across ALL dilemmas
    const finalScored =
      scoredPrimary.length > 0
        ? scoredPrimary
        : GITA_DILEMMAS_MASTER
            .map((item) => ({ item, score: scoreDilemma(item) }))
            .filter((res) => res.score >= minThreshold);

    // Rank by score descending, breaking ties by Chapter and Verse
    finalScored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.item.chapter !== b.item.chapter) return a.item.chapter - b.item.chapter;
      return a.item.verse - b.item.verse;
    });

    return finalScored.map((res) => res.item);
  }, [searchQuery, activeCategory, selectedChapter, STOP_WORDS, SEMANTIC_SYNONYMS, TYPO_MAP]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1C1917] text-[#2D2622] dark:text-[#F5F2EB] flex flex-col font-serif selection:bg-[#C25E38]/20 dark:selection:bg-[#E06D43]/30 transition-colors duration-300">
      <ScrollProgress className="fixed top-0 left-0 right-0 z-[10000]" />
      <Navbar activePage="dilemmas" />

      {/* Header */}
      <section className="pt-32 pb-8 px-6 max-w-6xl mx-auto w-full text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal leading-tight text-[#2D2622] dark:text-[#F5F2EB] mb-6 font-serif">
          Modern Life Dilemmas in <span className="text-[#C25E38] dark:text-[#E06D43] font-medium italic">Vedic Wisdom</span>
        </h1>

        <p className="text-base sm:text-lg text-[#5C4F45] dark:text-[#D4C7B8] max-w-3xl mx-auto font-sans leading-relaxed mb-8">
          Clear answers and timeless wisdom from the Bhagavad Gita for everyday life challenges with one-click AI guidance.
        </p>

        {/* Search Bar (Balanced max-w-lg eliminating trailing empty space) */}
        <div className="max-w-lg mx-auto relative font-sans mb-8">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#8C7B70] dark:text-[#A89F91] absolute left-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by topic, keyword, verse (e.g. 2.47), or Sanskrit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-28 py-2.5 rounded-2xl bg-[#EFE9DF] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] dark:placeholder-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#C25E38] dark:focus:ring-[#E06D43] transition text-sm shadow-inner"
            />
            {searchQuery.trim() && (
              <div className="absolute right-2.5 flex items-center bg-[#E5DCD0] dark:bg-[#332E2A] border border-[#D5C9B9] dark:border-[#423C36] rounded-full px-2.5 py-1 gap-2 shadow-2xs shrink-0 select-none">
                <span className="text-[11px] font-semibold text-[#C25E38] dark:text-[#E06D43] tracking-tight whitespace-nowrap leading-none">
                  {filteredDilemmas.length} {filteredDilemmas.length === 1 ? "match" : "matches"}
                </span>
                <span className="w-px h-3 bg-[#CBBFB0] dark:bg-[#4E463F]" />
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-0.5 text-[#8C7B70] dark:text-[#A89F91] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors cursor-pointer flex items-center justify-center leading-none"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Primary Category Filter Pills (Strictly Clean Without Numbers) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 font-sans text-xs font-bold mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  if (cat.id !== "all") {
                    setSelectedChapter("all");
                  }
                }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-[#C25E38] dark:bg-[#E06D43] text-white border-[#C25E38] shadow-md scale-[1.02]"
                    : "bg-[#EFE9DF]/80 dark:bg-[#262320]/80 border-[#DFD5C6] dark:border-[#38332E] text-[#5C4F45] dark:text-[#D4C7B8] hover:border-[#C25E38]/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Browse by Chapter Buttons (Visible ONLY when in 'All Dilemmas') */}
        {activeCategory === "all" && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#EFE9DF]/60 dark:bg-[#262320]/60 border border-[#DFD5C6] dark:border-[#38332E] max-w-5xl mx-auto font-sans mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3 px-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                <span className="text-xs font-bold text-[#2D2622] dark:text-[#F5F2EB] uppercase tracking-wider">
                  Browse Dilemmas by Chapter
                </span>

                {/* (i) Info Popover Trigger */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setShowInfoPopover(!showInfoPopover)}
                    onMouseEnter={() => setShowInfoPopover(true)}
                    onMouseLeave={() => setShowInfoPopover(false)}
                    className="p-1 rounded-full text-[#8C7B70] dark:text-[#A89F91] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition cursor-pointer"
                    aria-label="Scriptural Inquiry Information"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  <AnimatePresence>
                    {showInfoPopover && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] shadow-2xl z-50 text-left text-xs leading-relaxed text-[#5C4F45] dark:text-[#D4C7B8]"
                      >
                        <div className="flex items-center gap-1.5 font-bold text-[#C25E38] dark:text-[#E06D43] mb-1.5 font-serif">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>How Chapters Work</span>
                        </div>
                        <p className="font-sans">
                          The Bhagavad Gita contains <strong>700 verses across 18 chapters</strong>. Here, NityaGeeta highlights foundational situations from each chapter so one can find practical guidance for daily life. One can also explore the complete books anytime in the Library.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <button
                onClick={() => setShowChaptersDrawer(!showChaptersDrawer)}
                className="text-xs font-semibold text-[#C25E38] dark:text-[#E06D43] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{showChaptersDrawer ? "Hide Chapter List" : "View All 18 Chapters (700 Verses)"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showChaptersDrawer ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Chapter Buttons: Symmetrically balanced in two clean rows (All Chapters + Ch 1–9, and Ch 10–18) */}
            <div className="flex flex-col gap-2 items-center justify-center text-xs font-mono">
              {/* Row 1: All Chapters + Ch 1 to Ch 9 */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <button
                  onClick={() => setSelectedChapter("all")}
                  className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer font-bold ${
                    selectedChapter === "all"
                      ? "bg-[#C25E38] dark:bg-[#E06D43] text-white border-[#C25E38] shadow-sm"
                      : "bg-[#FAF7F2] dark:bg-[#1E1B18] border-[#DFD5C6] dark:border-[#38332E] text-[#5C4F45] dark:text-[#D4C7B8] hover:border-[#C25E38]/50"
                  }`}
                >
                  All Chapters
                </button>
                {GITA_CHAPTERS_INFO.slice(0, 9).map((ch) => (
                  <button
                    key={ch.num}
                    onClick={() => setSelectedChapter(selectedChapter === ch.num ? "all" : ch.num)}
                    className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer font-medium ${
                      selectedChapter === ch.num
                        ? "bg-[#C25E38] dark:bg-[#E06D43] text-white border-[#C25E38] font-bold shadow-sm"
                        : "bg-[#FAF7F2] dark:bg-[#1E1B18] border-[#DFD5C6] dark:border-[#38332E] text-[#5C4F45] dark:text-[#D4C7B8] hover:border-[#C25E38]/50 hover:text-[#C25E38]"
                    }`}
                  >
                    Ch {ch.num}
                  </button>
                ))}
              </div>

              {/* Row 2: Ch 10 to Ch 18 */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {GITA_CHAPTERS_INFO.slice(9, 18).map((ch) => (
                  <button
                    key={ch.num}
                    onClick={() => setSelectedChapter(selectedChapter === ch.num ? "all" : ch.num)}
                    className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer font-medium ${
                      selectedChapter === ch.num
                        ? "bg-[#C25E38] dark:bg-[#E06D43] text-white border-[#C25E38] font-bold shadow-sm"
                        : "bg-[#FAF7F2] dark:bg-[#1E1B18] border-[#DFD5C6] dark:border-[#38332E] text-[#5C4F45] dark:text-[#D4C7B8] hover:border-[#C25E38]/50 hover:text-[#C25E38]"
                    }`}
                  >
                    Ch {ch.num}
                  </button>
                ))}
              </div>
            </div>

            {/* Expandable 18-Chapter Verse Reference Table */}
            {showChaptersDrawer && (
              <div className="mt-4 pt-4 border-t border-[#DFD5C6] dark:border-[#38332E] overflow-x-auto text-left">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#DFD5C6] dark:border-[#38332E] text-[#C25E38] dark:text-[#E06D43] font-bold">
                      <th className="py-2 px-3 text-left font-mono">Chapter</th>
                      <th className="py-2 px-3 text-left font-serif">Sanskrit Name</th>
                      <th className="py-2 px-3 text-left">Theme / Core Guidance</th>
                      <th className="py-2 px-3 text-right font-mono">Verses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFD5C6]/40 dark:divide-[#38332E]/40 text-[#5C4F45] dark:text-[#D4C7B8]">
                    {GITA_CHAPTERS_INFO.map((ch) => (
                      <tr
                        key={ch.num}
                        onClick={() => setSelectedChapter(ch.num)}
                        className={`hover:bg-[#C25E38]/10 dark:hover:bg-[#E06D43]/20 cursor-pointer transition ${
                          selectedChapter === ch.num ? "bg-[#C25E38]/15 dark:bg-[#E06D43]/25 font-bold" : ""
                        }`}
                      >
                        <td className="py-2 px-3 font-mono font-semibold text-[#2D2622] dark:text-[#F5F2EB]">
                          {ch.num}
                        </td>
                        <td className="py-2 px-3 font-serif">
                          {ch.name} <span className="opacity-80 text-[11px]">({ch.devanagari})</span>
                        </td>
                        <td className="py-2 px-3 text-[11px]">{ch.theme}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#C25E38] dark:text-[#E06D43]">
                          {ch.verses} Verses
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-[#C25E38]/30 dark:border-[#E06D43]/30 font-bold bg-[#FAF7F2] dark:bg-[#1E1B18]">
                      <td className="py-2.5 px-3 font-mono text-[#C25E38] dark:text-[#E06D43]">TOTAL</td>
                      <td className="py-2.5 px-3 font-serif">18 Chapters</td>
                      <td className="py-2.5 px-3">Complete Bhagavad Gita</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#C25E38] dark:text-[#E06D43]">
                        700 Verses
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Grid of Dilemmas */}
      <main className="max-w-6xl mx-auto px-6 pb-24 w-full flex-1 font-sans">
        <div className="flex items-center justify-between border-b border-[#E8E1D7] dark:border-[#38332E] pb-4 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38] dark:text-[#E06D43]">
            Showing {filteredDilemmas.length} Life Dilemmas
            {selectedChapter !== "all" && ` in Chapter ${selectedChapter}`}
          </span>
          <span className="text-xs text-[#8C7B70] dark:text-[#A89F91] hidden sm:block">
            Everyday Guidance from the Gita
          </span>
        </div>

        {filteredDilemmas.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center space-y-5 rounded-3xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] p-8 max-w-2xl mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-3xl bg-[#C25E38]/10 dark:bg-[#E06D43]/20 border border-[#C25E38]/20 dark:border-[#E06D43]/30 flex items-center justify-center text-[#C25E38] dark:text-[#E06D43] shadow-inner">
              <Search className="w-6 h-6" />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
                No matching life dilemmas found
              </h3>
              <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                No dilemma matched &ldquo;<span className="text-[#C25E38] dark:text-[#E06D43] font-semibold">{searchQuery}</span>&rdquo;. Try searching{" "}
                <button
                  type="button"
                  onClick={() => setSearchQuery("burnout")}
                  className="text-[#C25E38] dark:text-[#E06D43] underline font-semibold hover:opacity-80 cursor-pointer"
                >
                  &lsquo;burnout&rsquo;
                </button>
                ,{" "}
                <button
                  type="button"
                  onClick={() => setSearchQuery("anxiety")}
                  className="text-[#C25E38] dark:text-[#E06D43] underline font-semibold hover:opacity-80 cursor-pointer"
                >
                  &lsquo;anxiety&rsquo;
                </button>
                ,{" "}
                <button
                  type="button"
                  onClick={() => setSearchQuery("duty")}
                  className="text-[#C25E38] dark:text-[#E06D43] underline font-semibold hover:opacity-80 cursor-pointer"
                >
                  &lsquo;duty&rsquo;
                </button>
                , or{" "}
                <button
                  type="button"
                  onClick={() => setSearchQuery("Chapter 2")}
                  className="text-[#C25E38] dark:text-[#E06D43] underline font-semibold hover:opacity-80 cursor-pointer"
                >
                  &lsquo;Chapter 2&rsquo;
                </button>
                .
              </p>
            </div>

            {/* Curated Suggested Topic Chips */}
            <div className="w-full pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C7B70] dark:text-[#A89F91] mb-2.5">
                Suggested Topics & Dilemmas
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  "Burnout",
                  "Anxiety & Panic",
                  "Dharma & Duty",
                  "Grief & Loss",
                  "Mind Mastery",
                  "Family Conflict",
                  "Surrender",
                  "Titiksha",
                  "Karma Yoga",
                  "Chapter 2"
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setSearchQuery(chip);
                      setActiveCategory("all");
                      setSelectedChapter("all");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#EFE9DF] dark:bg-[#1E1B18] border border-[#DFD5C6] dark:border-[#38332E] text-xs text-[#5C4F45] dark:text-[#D4C7B8] hover:border-[#C25E38]/60 hover:text-[#C25E38] dark:hover:text-[#E06D43] transition cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                  setSelectedChapter("all");
                }}
                className="px-6 py-2 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition shadow-sm cursor-pointer"
              >
                Clear Search & Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredDilemmas.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-3xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] p-6 sm:p-8 shadow-md hover:shadow-xl hover:border-[#C25E38]/50 dark:hover:border-[#E06D43]/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Card Top Meta */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-[#C25E38]/10 dark:bg-[#E06D43]/15 text-[#C25E38] dark:text-[#E06D43] border border-[#C25E38]/20 dark:border-[#E06D43]/25 shadow-2xs">
                        {item.categoryLabel}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43] flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" /> {item.verseCitation}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] mb-3 leading-snug group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition-colors">
                      {item.title}
                    </h3>

                    {/* Sanskrit Shloka */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2]/80 dark:bg-[#1C1917]/80 border border-[#DFD5C6]/60 dark:border-[#38332E]/60 text-center font-serif text-base sm:text-lg lg:text-xl font-medium text-[#C25E38] dark:text-[#E06D43] whitespace-pre-line leading-relaxed tracking-wide mb-2.5">
                      {item.verseSanskrit}
                    </div>

                    {/* Transliteration */}
                    <p className="text-[11px] sm:text-xs font-serif italic text-[#5C4F45] dark:text-[#D4C7B8] text-center mb-4 line-clamp-2 leading-relaxed tracking-wide">
                      {item.verseTransliteration}
                    </p>

                    {/* Core Insight */}
                    <div className="mb-6">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#2D2622] dark:text-[#F5F2EB] mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C25E38] dark:text-[#E06D43]" />
                        <span>Gita&apos;s Guidance:</span>
                      </div>
                      <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                        {item.coreInsight}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom Meta with 1-Click AI Dialogue Action */}
                  <div className="pt-4 border-t border-[#E8E1D7] dark:border-[#38332E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-[#EFE9DF] dark:bg-[#1E1B18] text-[#8C7B70] dark:text-[#A89F91]">
                      #{item.tag}
                    </span>

                    <button
                      type="button"
                      onClick={() => router.push(`/app?prompt=${encodeURIComponent(item.promptQuery)}`)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C25E38]/10 hover:bg-[#C25E38] dark:bg-[#E06D43]/15 dark:hover:bg-[#E06D43] text-[#C25E38] hover:text-white dark:text-[#E06D43] dark:hover:text-white text-xs font-bold font-sans transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-sm group/btn shrink-0"
                      title="Open this dilemma in NityaGeeta 1-click AI Dialogue"
                    >
                      <span>Ask AI for Guidance</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Banner: Ask AI Directly for Unique Situations */}
            <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-[#FAF7F2] to-[#EFE9DF]/80 dark:from-[#262320] dark:to-[#1E1B18] border border-[#DFD5C6] dark:border-[#38332E] flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm text-center sm:text-left">
              <div>
                <h4 className="text-base sm:text-lg font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] mb-1">
                  Have a specific question or personal situation?
                </h4>
                <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] max-w-xl">
                  One can ask NityaGeeta directly. NityaGeeta finds the most relevant verses and explanations from authentic Gita commentaries to guide one&apos;s situation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/app")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition shadow-md shrink-0 cursor-pointer font-sans group/banner"
              >
                <span>Ask NityaGeeta AI</span>
                <ArrowRight className="w-4 h-4 group-hover/banner:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Universal Global Footer */}
      <Footer />
    </div>
  );
}
