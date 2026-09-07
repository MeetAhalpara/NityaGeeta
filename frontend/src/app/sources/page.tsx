"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Search,
  ExternalLink,
  Shield,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  ArrowRight,
  Download,
  Info,
  Compass,
  Check,
  X,
  HelpCircle,
  Award,
  BookMarked,
  Library,
  Github,
  Linkedin,
  Loader2,
  Globe,
  GraduationCap,
  Newspaper,
  MessageSquare,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Lock,
  Languages
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { PdfManuscriptReader } from "@/components/ui/pdf-manuscript-reader";

interface ScoringInfo {
  title: string;
  score: number;
  scoreLabel: string;
  metricName: string;
  tierTag: string;
  whyScored: string;
  comparisonWithOthers: string;
  breakdown: {
    fidelity: string;
    fidelityScore: number;
    rigor: string;
    rigorScore: number;
    authority: string;
    authorityScore: number;
  };
  supportingResources: Array<{
    name: string;
    institution: string;
    detail: string;
    url: string;
    type?: string;
  }>;
}

export default function SourcesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "geeta" | "veducation" | "chapters" | "vetting">("all");
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedBookTitle, setSelectedBookTitle] = useState<string>("");
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(true);
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);
  const [activeScoringInfo, setActiveScoringInfo] = useState<ScoringInfo | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Open in-app browser viewer
  const handleOpenPdf = (url: string | null, title: string) => {
    if (!url) return;
    setIsPdfLoading(true);
    setSelectedBookTitle(title);
    setSelectedPdfUrl(url);
  };

  // Lock background body scroll when any modal is open
  useEffect(() => {
    if (activeScoringInfo !== null || selectedPdfUrl !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeScoringInfo, selectedPdfUrl]);

  const geetaEditions = [
    {
      id: "geeta-1",
      priority: 1,
      tierBadge: "CANON 01",
      tierLabel: "TIER 1",
      title: "Srimad Bhagavad Gita (Gita Press Original)",
      author: "Gita Press Gorakhpur Editorial Board",
      era: "Centenary Heritage Edition (Gita Press Gorakhpur • Est. 1923)",
      tradition: "Classical Sanskrit Ground Truth (Zero Sectarian Bias)",
      tagline: "Sanskrit Ground Truth (Layer 1)",
      desc: "Pure canonical Sanskrit verses with authentic word-by-word synonyms. No sectarian bias and zero speculative interpretation across all 700 verses.",
      pdfUrl: "https://storage.googleapis.com/nityageeta-library/Srimad%20Bhagavad%20Gita%20Press%20Gorakhpur.pdf",
      storeUrl: "https://www.amazon.com/Srimad-Bhagwad-Sanskrit-Hindi-English/dp/8172241305/ref=sr_1_1?dib=eyJ2IjoiMSJ9.O5tQuquAgsu__8kLyZR9C22Iyz6p5raMknosOGzyl0F702zX5etM4j0QGHwzAXkgFuhzwyxTwjbYx_BQHZ5hU1H2mPMshK2sO58ydEBLuDYpY6pJ2NZ7yzPkIKb97rCV-Amy13jIHqgk8q4pOotQqaxWBOIaCA4ufsfuYzgrSv9tQhdBdnemukM12R37gjfsmJ3Jeay6KcGvnQ59wBedi-o88BH28ww9bipi5WZ_A1I.OVIFtF2-MbWRsqQ5rE08ThpxLK_svYBgen039hGcTiU&dib_tag=se&keywords=Srimad+Bhagavad+Gita+with+Hindi+Translation%2C+Hardcover%2C+Gita+Press+Gorakhpur+Edition&nsdOptOutParam=true&qid=1788260718&sr=8-1",
      totalVerses: "700 Verses Covered",
      score: 100,
      scoreLabel: "100 / 100",
      metricName: "Layer 1 Ground Truth",
      authenticityRatio: "100%",
      authenticityDetail: "Original Devanagari Sanskrit verses free from sectarian distortion or editorial alteration.",
      contextTrustRatio: "100%",
      contextTrustDetail: "Universal standard benchmark text accepted across all traditional Hindu institutions.",
      scholarlyAuthority: "Centenary benchmark of uncorrupted scripture preservation awarded the Gandhi Peace Prize.",
      summary: "The pure canonical Sanskrit foundation of NityaGeeta. Gita Press Gorakhpur provides the standard 700 Sanskrit verses without sectarian interpretation, ensuring that every AI insight is anchored in authentic revelation.",
      whyChosen: "Selected as Layer 1 Ground Truth because Sanskrit is the original sacred language of the Gita. Zero sectarian bias guarantees that AI responses remain universally true and free of dogma.",
      keywords: [
        "gita press original", "gita press centenary", "gorakhpur", "pure sanskrit", "700 verses",
        "word by word", "synonyms", "authentic baseline", "canonical baseline", "hindi english",
        "devanagari", "classical consensus", "shlokas", "scripture baseline",
        "time", "cosmic vision", "cosmic revelation", "ground truth"
      ],
      chapters: [
        { num: 1, title: "Chapter 1: Arjuna Vishada Yoga", pages: "1–24", description: "47 verses of original Devanagari text, meter, and Hindi translation covering the battlefield assembly and Arjuna's despair.", keywords: ["arjuna vishada", "battlefield", "grief", "dilemma", "original sanskrit", "devanagari"] },
        { num: 2, title: "Chapter 2: Sankhya Yoga", pages: "25–68", description: "72 verses establishing the eternal nature of the soul (Atman), Swadharma, Nishkama Karma (2.47), and the Sthitaprajna state.", keywords: ["sankhya", "atman", "immortality", "karma yoga", "sthitaprajna", "equanimity"] },
        { num: 3, title: "Chapter 3: Karma Yoga", pages: "69–96", description: "43 verses on the wheel of cosmic sacrifice (Yajna-Chakra), social duty, and overcoming Kama and Krodha.", keywords: ["karma yoga", "yajna", "duty", "selfless action", "desire", "anger"] },
        { num: 4, title: "Chapter 4: Jnana Karma Sanyasa Yoga", pages: "97–120", description: "42 verses on the history of Yoga, divine descent (Avatara), and the purifying fire of spiritual wisdom.", keywords: ["avatara", "divine descent", "wisdom fire", "jnana", "parampara"] },
        { num: 5, title: "Chapter 5: Karma Sanyasa Yoga", pages: "121–138", description: "29 verses on the harmony between external action and internal renunciation, and the state of Brahma-Nirvana.", keywords: ["sanyasa", "renunciation", "brahma nirvana", "inner peace", "detachment"] },
        { num: 6, title: "Chapter 6: Dhyana Yoga", pages: "139–166", description: "47 verses on meditation practice, posture, diet, mental discipline, and the destiny of an unsuccessful yogi.", keywords: ["dhyana", "meditation", "mind control", "abhyasa", "vairagya", "yoga practice"] },
        { num: 7, title: "Chapter 7: Jnana Vijnana Yoga", pages: "167–184", description: "30 verses revealing material and spiritual energies (Prakriti), Maya, and the steadfast love of the enlightened.", keywords: ["jnana vijnana", "prakriti", "maya", "devotees", "supreme nature"] },
        { num: 8, title: "Chapter 8: Akshara Brahma Yoga", pages: "185–200", description: "28 verses on consciousness at death, cosmic cycles of day and night of Brahma, and the two paths of departure.", keywords: ["akshara brahma", "antakala", "cosmic time", "kalpa", "imperishable"] },
        { num: 9, title: "Chapter 9: Raja Vidya Raja Guhya Yoga", pages: "201–218", description: "34 verses detailing the sovereign spiritual science, universal presence of God, and effortless divine protection.", keywords: ["raja vidya", "sovereign science", "supreme secret", "divine protection", "bhakti"] },
        { num: 10, title: "Chapter 10: Vibhuti Yoga", pages: "219–238", description: "42 verses recounting divine splendors across all creation and Sri Krishna's omnipresent majesty.", keywords: ["vibhuti", "divine glories", "splendors", "manifestations", "omnipresence"] },
        { num: 11, title: "Chapter 11: Vishwaroopa Darshana Yoga", pages: "239–266", description: "55 verses describing Arjuna's vision of the cosmic universal form, blinding radiance, and Time the Destroyer.", keywords: ["vishwaroopa", "universal form", "cosmic vision", "time", "destroyer", "infinite"] },
        { num: 12, title: "Chapter 12: Bhakti Yoga", pages: "267–278", description: "20 verses on loving devotion, stages of surrender, and the spiritual qualities that make a devotee dear to God.", keywords: ["bhakti", "devotion", "surrender", "devotee virtues", "love of god"] },
        { num: 13, title: "Chapter 13: Kshetra Kshetragya Vibhaga Yoga", pages: "279–298", description: "34 verses analyzing the field of nature (body/mind/senses) and the supreme observer (Kshetragya).", keywords: ["kshetra", "kshetragya", "the field", "the knower", "witness consciousness"] },
        { num: 14, title: "Chapter 14: Gunatraya Vibhaga Yoga", pages: "299–312", description: "27 verses explaining how Sattva, Rajas, and Tamas bind the soul and how to transcend the three modes.", keywords: ["three gunas", "sattva", "rajas", "tamas", "gunatita", "modes of nature"] },
        { num: 15, title: "Chapter 15: Purushottama Yoga", pages: "313–322", description: "20 verses on the cosmic Ashvattha tree, the living entity's transmigration, and the eternal Purushottama.", keywords: ["purushottama", "ashvattha tree", "supreme person", "transmigration", "kshar akshar"] },
        { num: 16, title: "Chapter 16: Daivasura Sampad Vibhaga Yoga", pages: "323–334", description: "24 verses contrasting divine virtues with demoniac traits, and scriptural authority as the guide for action.", keywords: ["daivi sampad", "asuri sampad", "divine virtues", "demoniac traits", "shastra pramana"] },
        { num: 17, title: "Chapter 17: Shraddhatraya Vibhaga Yoga", pages: "335–348", description: "28 verses on the three kinds of faith, diet, austerity, sacrifice, and the supreme purifying power of OM TAT SAT.", keywords: ["shraddhatraya", "threefold faith", "sattvic food", "om tat sat", "austerity"] },
        { num: 18, title: "Chapter 18: Moksha Sanyasa Yoga", pages: "349–400", description: "78 verses summarizing the entire Gita: action, knowledge, meditation, Swadharma, and supreme surrender (18.66).", keywords: ["moksha sanyasa", "liberation", "swadharma", "tyaga", "surrender", "conclusion", "sarva dharman parityajya"] }
      ],
      scoringDetails: {
        title: "Srimad Bhagavad Gita (Gita Press Original)",
        score: 100,
        scoreLabel: "100 / 100",
        metricName: "Layer 1 Ground Truth (Gold Standard)",
        tierTag: "Sanskrit Ground Truth #1",
        whyScored: "Receives 100/100 as NityaGeeta's foundational ground truth because it preserves the complete, unaltered 700 Devanagari verses with zero sectarian interpretation from the century-old Gita Press Gorakhpur archive.",
        comparisonWithOthers: "While other editions add theological or philosophical purports, Gita Press Original provides the pure canonical benchmark text accepted across all traditions.",
        breakdown: {
          fidelity: "40/40 - Exact Devanagari Sanskrit manuscript fidelity with zero unauthorized modern alterations.",
          fidelityScore: 40,
          rigor: "30/30 - Pure canonical 700-verse baseline used as the standard across Indian academia and temples.",
          rigorScore: 30,
          authority: "30/30 - Over 100 years of trusted, non-profit scriptural preservation by Gita Press Gorakhpur.",
          authorityScore: 30
        },
        supportingResources: [
          {
            name: "Gandhi Peace Prize Citation: Gita Press Gorakhpur",
            institution: "Government of India (Press Information Bureau • PIB)",
            url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=1933252&reg=48&lang=2",
            detail: "Official national citation conferring the Gandhi Peace Prize on Gita Press Gorakhpur in recognition of 100 years of uncorrupted scripture publication and preservation.",
            type: "academic"
          },
          {
            name: "Gita Press Gorakhpur Centenary Institutional Archive",
            institution: "Gita Press Gorakhpur (Est. 1923)",
            url: "https://gitapress.org",
            detail: "Official repository and canonical publishing trust preserving 700 unaltered Sanskrit verses and authentic translations.",
            type: "archive"
          }
        ]
      }
    },
    {
      id: "geeta-2",
      priority: 2,
      tierBadge: "CANON 02",
      tierLabel: "TIER 2",
      title: "The Bhagavad Gita: Interlinear Translation & Grammar",
      author: "Winthrop Sargeant (State University of New York Press)",
      era: "Published 1979 (SUNY Press, ed. Christopher Key Chapple)",
      tradition: "Academic Sanskrit Grammar & Morphological Concordance",
      tagline: "Word-for-Word Translation (Layer 2)",
      desc: "Linguistic gold standard for word mapping: dissects every word of all 700 verses with Roman IAST phonetics, grammatical role parsing (case, mood, tense), and root etymology.",
      pdfUrl: "https://storage.googleapis.com/nityageeta-library/The%20Bhagavad%20Gita%20Winthrop%20Sargeant%20(Word-for-Word%20English).pdf",
      storeUrl: "https://www.amazon.com/Bhagavad-Gita-Revised-Cultural-Perspectives/dp/0873958314",
      totalVerses: "700 Verses Covered",
      score: 92,
      scoreLabel: "92 / 100",
      metricName: "Layer 2 Word-for-Word Precision",
      authenticityRatio: "99%",
      authenticityDetail: "Complete Devanagari script alongside exhaustive Roman IAST phonetic transliteration.",
      contextTrustRatio: "92%",
      contextTrustDetail: "Best linguistic and grammatical source; designed for lexical accuracy rather than spiritual commentary.",
      scholarlyAuthority: "Peer-reviewed SUNY Press academic gold standard edited by Prof. Christopher Key Chapple.",
      summary: "An interlinear academic masterwork that dissects all 700 verses word-by-word. It provides grammatical cases, moods, tenses, and literal root definitions without translator theology.",
      whyChosen: "Selected as Layer 2 to anchor NityaGeeta's translation engine to rigorous Sanskrit etymology and syntax, guaranteeing that English answers faithfully mirror the Sanskrit words.",
      keywords: [
        "winthrop sargeant", "sargeant", "suny press", "sanskrit grammar", "grammar", "parsing", "morphology",
        "roots", "dhatu", "interlinear", "word for word", "literal translation", "iast", "transliteration",
        "phonetics", "linguistics", "case", "tense", "mood", "etymology", "academic", "objective", "dictionary",
        "time", "cosmic time", "kala", "cosmology", "cycles of time", "universal form"
      ],
      chapters: [
        { num: 1, title: "Interlinear Chapter 1 (Verses 1–47)", pages: "35–74", description: "Word-by-word Sanskrit grammatical parsing, compounds, case endings, and syntactic roles for Arjuna Vishada Yoga.", keywords: ["grammar", "word for word", "sanskrit", "parsing", "compounds", "arjuna"] },
        { num: 2, title: "Interlinear Chapter 2 (Verses 1–72)", pages: "75–150", description: "Grammatical root breakdown (Dhatu) for Atman, Karma Yoga, and the morphological structure of Sthitaprajna verses.", keywords: ["grammar", "atman", "soul", "karma", "sanskrit", "roots", "sthitaprajna"] },
        { num: 3, title: "Interlinear Chapter 3 (Verses 1–43)", pages: "151–196", description: "Morphological analysis of Vedic verbs for action (Karman), sacrifice (Yajna), and duty (Dharma).", keywords: ["grammar", "karma", "yajna", "action", "sanskrit", "roots"] },
        { num: 4, title: "Interlinear Chapter 4 (Verses 1–42)", pages: "197–242", description: "Grammatical breakdown of divine incarnation verses, lineage terminology, and wisdom sacrifices.", keywords: ["grammar", "avatara", "wisdom", "jnana", "sanskrit", "dhatu"] },
        { num: 5, title: "Interlinear Chapter 5 (Verses 1–29)", pages: "243–274", description: "Word-by-word syntax parsing renunciation (Sanyasa) vs action (Yoga) and inner detachment.", keywords: ["grammar", "sanyasa", "renunciation", "detachment", "sanskrit"] },
        { num: 6, title: "Interlinear Chapter 6 (Verses 1–47)", pages: "275–314", description: "Linguistic roots of meditation, breath control (Prana-Apana), equanimity, and mental restraint.", keywords: ["grammar", "meditation", "dhyana", "breath", "mind", "sanskrit"] },
        { num: 7, title: "Interlinear Chapter 7 (Verses 1–30)", pages: "315–344", description: "Sanskrit vocabulary dissection for material nature (Prakriti), divine energy, and the 4 classes of devotees.", keywords: ["grammar", "prakriti", "maya", "devotees", "sanskrit"] },
        { num: 8, title: "Interlinear Chapter 8 (Verses 1–28)", pages: "345–384", description: "Sanskrit vocabulary on cosmic time cycles, imperishable Brahman, death consciousness, and Kalpa transitions.", keywords: ["grammar", "time", "cosmic time", "brahman", "sanskrit", "kalpa"] },
        { num: 9, title: "Interlinear Chapter 9 (Verses 1–34)", pages: "385–418", description: "Grammatical analysis of sovereign secret knowledge, universal immanence, and pure devotion.", keywords: ["grammar", "raja vidya", "secret", "devotion", "sanskrit"] },
        { num: 10, title: "Interlinear Chapter 10 (Verses 1–42)", pages: "419–444", description: "Case analysis and etymology of divine attributes across planetary beings, seers, and elements.", keywords: ["grammar", "vibhuti", "glories", "attributes", "sanskrit"] },
        { num: 11, title: "Interlinear Chapter 11 (Verses 1–55)", pages: "445–510", description: "Word-by-word morphological dissection of the Cosmic Universal Form and Time the Destroyer (Kalo'smi).", keywords: ["grammar", "cosmic", "universal form", "vishwaroopa", "sanskrit", "time"] },
        { num: 12, title: "Interlinear Chapter 12 (Verses 1–20)", pages: "511–530", description: "Syntactic parsing of devotion verses, comparing meditation on the Unmanifest (Avyakta) with personal devotion.", keywords: ["grammar", "bhakti", "devotion", "unmanifest", "sanskrit"] },
        { num: 13, title: "Interlinear Chapter 13 (Verses 1–34)", pages: "531–564", description: "Grammatical distinction of the Field (matter/mind) vs the Knower of the Field (observer consciousness).", keywords: ["grammar", "kshetra", "kshetragya", "witness", "sanskrit"] },
        { num: 14, title: "Interlinear Chapter 14 (Verses 1–27)", pages: "565–592", description: "Morphological breakdown of the 3 cosmic gunas (Sattva, Rajas, Tamas) and liberation terminology.", keywords: ["grammar", "gunas", "sattva", "rajas", "tamas", "sanskrit"] },
        { num: 15, title: "Interlinear Chapter 15 (Verses 1–20)", pages: "593–614", description: "Word analysis of the eternal Ashvattha tree, perishable vs imperishable entities, and the Supreme Purusha.", keywords: ["grammar", "ashvattha", "purushottama", "supreme person", "sanskrit"] },
        { num: 16, title: "Interlinear Chapter 16 (Verses 1–24)", pages: "615–636", description: "Lexical vocabulary for 26 divine virtues vs demoniac traits, desire, anger, and spiritual degradation.", keywords: ["grammar", "virtues", "divine", "demoniac", "sanskrit"] },
        { num: 17, title: "Interlinear Chapter 17 (Verses 1–28)", pages: "637–660", description: "Grammatical analysis of threefold faith, dietary habits, and the sacred threefold syllable OM TAT SAT.", keywords: ["grammar", "faith", "diet", "om tat sat", "sanskrit"] },
        { num: 18, title: "Interlinear Chapter 18 (Verses 1–78)", pages: "661–739", description: "Exhaustive grammatical synthesis of renunciation, 5 causal factors of action, intellect (Buddhi), and final surrender.", keywords: ["grammar", "renunciation", "moksha", "tyaga", "surrender", "sanskrit"] }
      ],
      scoringDetails: {
        title: "The Bhagavad Gita: Interlinear Translation & Grammar",
        score: 92,
        scoreLabel: "92 / 100",
        metricName: "Linguistic & Grammatical Precision (Layer 2)",
        tierTag: "Linguistic Gold Standard #2",
        whyScored: "Scores 92/100 as the definitive linguistic benchmark for word-by-word Sanskrit parsing, grammatical case breakdown, and phonetic transliteration published by SUNY Press.",
        comparisonWithOthers: "Sargeant is not for spiritual guidance, but serves as the objective grammatical ground-check to prevent translation drift in the AI engine.",
        breakdown: {
          fidelity: "38/40 - Exact Roman IAST and Devanagari typography with morphological breakdown.",
          fidelityScore: 38,
          rigor: "28/30 - Grammatical dissection of all 700 verses down to roots (Dhatu).",
          rigorScore: 28,
          authority: "26/30 - Peer-reviewed SUNY Press university publication edited by Prof. Christopher Key Chapple.",
          authorityScore: 26
        },
        supportingResources: [
          {
            name: "SUNY Press Official Book Catalog & Critical Monograph",
            institution: "State University of New York Press (Indology)",
            url: "https://sunypress.edu/Books/T/The-Bhagavad-Gita",
            detail: "Official university press publication record for Winthrop Sargeant's 25th-anniversary critical edition.",
            type: "academic"
          },
          {
            name: "Harvard University Library HOLLIS Archival Concordance",
            institution: "Harvard Library (Department of South Asian Studies)",
            url: "https://hollis.harvard.edu/primo-explore/search?query=any,contains,Winthrop%20Sargeant%20The%20Bhagavad%20Gita&vid=HVD2",
            detail: "Harvard library catalog record citing Sargeant's grammatical concordance as standard Sanskrit reference.",
            type: "academic"
          }
        ]
      }
    },
    {
      id: "geeta-3",
      priority: 3,
      tierBadge: "CANON 03",
      tierLabel: "TIER 3",
      title: "Srimad Bhagavad Gita Shankara Bhashya",
      author: "Adi Shankaracharya (Translated by Alladi Mahadeva Sastry)",
      era: "Written c. 8th Century CE (788–820 CE)",
      tradition: "Advaita Vedanta (Classical Non-Dualism)",
      tagline: "Deep Commentary (Layer 3)",
      desc: "Most historically authoritative commentary on the Gita, establishing that ultimate liberation (Moksha) is attained through spiritual Self-knowledge (Jnana Yoga).",
      pdfUrl: "https://storage.googleapis.com/nityageeta-library/Bhagavad%20Gita%20with%20the%20Commentary%20of%20Adi%20Shankaracharya.pdf",
      storeUrl: "https://www.amazon.com/Bhagavad-Gita-commentary-Sankaracharya-Hardcover/dp/9361684906",
      totalVerses: "700 Verses Covered",
      score: 98,
      scoreLabel: "98 / 100",
      metricName: "Layer 3 Deep Commentary",
      authenticityRatio: "98%",
      authenticityDetail: "Foundational 8th-century Sanskrit manuscript commentary establishing the Gita as primary scripture.",
      contextTrustRatio: "98%",
      contextTrustDetail: "Strict non-dualist metaphysical exegesis on Brahman, Atman, and freedom from existential delusion.",
      scholarlyAuthority: "Over 1,200 years of unbroken philosophical authority across the four Amnaya Peethams.",
      summary: "Adi Shankaracharya's commentary is the historical benchmark for intellectual rigor. It established the Bhagavad Gita as a pillar of Vedanta (Prasthanatrayi) and articulates the non-difference between Atman and Brahman.",
      whyChosen: "Selected as Layer 3 Deep Commentary to anchor NityaGeeta in classical Indian metaphysics, self-knowledge (Jnana Yoga), and non-dual contemplation.",
      keywords: [
        "adi shankaracharya", "shankara", "shankaracharya", "shankara bhashya", "advaita", "advaita vedanta",
        "non dualism", "nondualism", "jnana yoga", "knowledge", "moksha", "liberation", "brahman", "atman",
        "maya", "illusion", "alladi mahadeva sastry", "philosophical rigor", "sringeri", "intellect", "consciousness",
        "time", "cosmic time", "kala", "cosmology", "cycles of creation"
      ],
      chapters: [
        { num: 1, title: "Shankara Prologue & Chapter 1 (Arjuna Vishada)", pages: "1–24", description: "Adi Shankara's masterly philosophical introduction on the twofold Vedic Dharma (Pravritti & Nivritti) and the root cause of human grief.", keywords: ["advaita", "pravritti", "nivritti", "dharma", "grief", "shankara", "shankara bhashya"] },
        { num: 2, title: "Advaita Bhashya on Chapter 2 (Sankhya Yoga)", pages: "25–90", description: "Shankara's celebrated refutation of existential delusion and demonstration of the eternal, non-dual, immutable Atman.", keywords: ["advaita", "non duality", "atman", "soul", "shankara", "maya", "immutability"] },
        { num: 3, title: "Advaita Bhashya on Chapter 3 (Karma Yoga)", pages: "91–134", description: "Dialectic on Jnana-Nishtha vs Karma-Nishtha: how selfless duty purifies the mind (Chitta Shuddhi) for self-realization.", keywords: ["advaita", "karma", "chitta shuddhi", "selfless action", "mind purification"] },
        { num: 4, title: "Advaita Bhashya on Chapter 4 (Jnana Karma Sanyasa)", pages: "135–172", description: "The illusory nature of divine incarnation through Maya, the wisdom lineage, and recognizing inaction in action.", keywords: ["advaita", "maya", "avatara", "lineage", "inaction in action", "wisdom fire"] },
        { num: 5, title: "Advaita Bhashya on Chapter 5 (Karma Sanyasa Yoga)", pages: "173–198", description: "The true renunciant dwelling serenely in the nine-gated city of the body, recognizing the Self does not act.", keywords: ["advaita", "sanyasa", "nine gated city", "witness", "non action of self"] },
        { num: 6, title: "Advaita Bhashya on Chapter 6 (Dhyana Yoga)", pages: "199–232", description: "Meditation on the non-dual Self: seeing the Self in all beings and all beings in the Self through Samadhi.", keywords: ["advaita", "meditation", "samadhi", "dhyana", "self in all beings", "equanimity"] },
        { num: 7, title: "Advaita Bhashya on Chapter 7 (Jnana Vijnana Yoga)", pages: "233–260", description: "Prakriti as Maya, the higher transcendent nature, and the wise devotee (Jnani) identified as the very Self of the Lord.", keywords: ["advaita", "maya", "prakriti", "brahman", "ultimate reality", "jnana", "four devotees"] },
        { num: 8, title: "Advaita Bhashya on Chapter 8 (Akshara Brahma Yoga)", pages: "261–290", description: "Shankara's dialectic on cosmic time cycles, creation, dissolution (Pralaya), meditation on Om, and the unmanifest beyond.", keywords: ["cosmic time", "om", "creation", "cycles", "advaita", "meditation", "pralaya", "kalpa"] },
        { num: 9, title: "Advaita Bhashya on Chapter 9 (Raja Vidya Raja Guhya)", pages: "291–320", description: "The supreme non-dual paradox: all beings exist in Brahman, but Brahman is unaffected and unattached like infinite space.", keywords: ["advaita", "space metaphor", "unattached", "sovereign secret", "bhakti"] },
        { num: 10, title: "Advaita Bhashya on Chapter 10 (Vibhuti Yoga)", pages: "321–348", description: "Contemplating Brahman through phenomenal excellence to turn the mind from visible effects to the uncaused Cause.", keywords: ["advaita", "vibhuti", "uncaused cause", "divine glories", "meditation"] },
        { num: 11, title: "Advaita Bhashya on Chapter 11 (Vishwaroopa Darshana)", pages: "349–378", description: "The cosmic universal form seen through divine vision, proving the entire cosmos is sustained within the divine body.", keywords: ["advaita", "universal form", "vishwaroopa", "divine vision", "cosmic reality"] },
        { num: 12, title: "Advaita Bhashya on Chapter 12 (Bhakti Yoga)", pages: "379–398", description: "Comparison of devotion to the Saguna Form vs contemplation of the Nirguna Akshara Brahman, leading to supreme peace.", keywords: ["advaita", "nirguna", "saguna", "bhakti", "equanimity", "surrender"] },
        { num: 13, title: "Advaita Bhashya on Chapter 13 (Kshetra Kshetragya)", pages: "399–440", description: "The foundational core of Advaita: discriminating between the inert Field (Kshetra) and the sole Knower (Kshetragya/Atman).", keywords: ["consciousness", "observer", "witness", "matter and spirit", "atman", "kshetra", "kshetragya", "advaita"] },
        { num: 14, title: "Advaita Bhashya on Chapter 14 (Gunatraya Vibhaga)", pages: "441–462", description: "How the three Gunas bind through delusion and passion, and how the Gunatita sage abides in unaffected awareness.", keywords: ["advaita", "three gunas", "gunatita", "transcending nature", "witness awareness"] },
        { num: 15, title: "Advaita Bhashya on Chapter 15 (Purushottama Yoga)", pages: "463–480", description: "Felling the cosmic Ashvattha tree with the axe of non-attachment (Asanga-Shastra), revealing the supreme Purushottama.", keywords: ["advaita", "asanga shastra", "ashvattha tree", "purushottama", "supreme self"] },
        { num: 16, title: "Advaita Bhashya on Chapter 16 (Daivasura Sampad)", pages: "481–496", description: "Ethical prerequisites for Vedantic inquiry: cultivating Daivi Sampad to dissolve mental impurities that block knowledge.", keywords: ["advaita", "ethics", "daivi sampad", "purity of mind", "prerequisites"] },
        { num: 17, title: "Advaita Bhashya on Chapter 17 (Shraddhatraya Vibhaga)", pages: "497–512", description: "Analysis of faith, food, sacrifice, and the metaphysical significance of the sacred Vedic formula OM TAT SAT.", keywords: ["advaita", "faith", "om tat sat", "vedic formula", "sacrifice"] },
        { num: 18, title: "Advaita Bhashya on Chapter 18 (Moksha Sanyasa Yoga)", pages: "513–554", description: "Culmination of Advaita philosophy: demonstrating that action cannot cause liberation; pure Self-Knowledge alone liberates.", keywords: ["advaita", "liberation", "self knowledge alone", "moksha", "tyaga", "sanyasa", "sarva dharman parityajya"] }
      ],
      scoringDetails: {
        title: "Srimad Bhagavad Gita Shankara Bhashya",
        score: 98,
        scoreLabel: "98 / 100",
        metricName: "Deep Commentary & Classical Metaphysics (Layer 3)",
        tierTag: "Classical Historical Authority #3",
        whyScored: "Scores 98/100 as the most historically authoritative commentary in Indian civilization, having established the Gita as a primary scripture (Prasthanatrayi) since the 8th century CE.",
        comparisonWithOthers: "Focuses strictly on transcendental liberation (Moksha) and philosophical inquiry, providing the deep metaphysical bedrock for spiritual questions.",
        breakdown: {
          fidelity: "39/40 - Classical 8th-century Sanskrit manuscript lineage maintained across 4 Amnaya Peethams.",
          fidelityScore: 39,
          rigor: "30/30 - Peerless dialectical and logical metaphysics defining Advaita Vedanta.",
          rigorScore: 30,
          authority: "29/30 - 1,200+ years of uninterrupted Vedantic teaching authority.",
          authorityScore: 29
        },
        supportingResources: [
          {
            name: "Sringeri Sharada Peetham Official Works of Adi Shankaracharya",
            institution: "Dakshinamnaya Sri Sharada Peetham (Sringeri)",
            url: "https://sringeri.net/history/sri-adi-shankaracharya/works-of-sri-adi-shankaracharya",
            detail: "Official repository maintaining unbroken 8th-century palm-leaf recensions of Adi Shankara's bhashya.",
            type: "academic"
          }
        ]
      }
    },
    {
      id: "geeta-4",
      priority: 4,
      tierBadge: "CANON 04",
      tierLabel: "TIER 4",
      title: "Srimad Bhagavad Gita (Sadhaka-Sanjivani)",
      author: "Swami Ramsukhdas (Gita Press Gorakhpur)",
      era: "Established 1923 / First Published 1988",
      tradition: "Gita Press Gorakhpur (Practical Householder Vedanta)",
      tagline: "Modern Practical Application (Layer 4)",
      desc: "Best for everyday life questions: an exhaustive, neutral, and practical masterpiece analyzing word meaning, psychological depth, and ethical action for modern life.",
      pdfUrl: "https://storage.googleapis.com/nityageeta-library/Gita-Sadhak-Sanjevani-English.pdf",
      storeUrl: "https://www.amazon.com/Srimad-Bhagavadgita-v-Sadhaka-Sanjivani/dp/812930063X",
      totalVerses: "700 Verses Covered",
      score: 97,
      scoreLabel: "97 / 100",
      metricName: "Layer 4 Practical Application",
      authenticityRatio: "97%",
      authenticityDetail: "Original Devanagari Sanskrit verses free from sectarian distortion.",
      contextTrustRatio: "98%",
      contextTrustDetail: "Universal focus on Nishkama Karma Yoga and practical householder spiritual life.",
      scholarlyAuthority: "100+ years of authoritative scriptural publishing by Gita Press Gorakhpur.",
      summary: "Regarded as the definitive modern commentary on the Bhagavad Gita for daily living, Swami Ramsukhdas's Sadhaka-Sanjivani breaks down subtle Vedic wisdom into actionable principles for duties, anxiety, relationships, and self-realization.",
      whyChosen: "Selected as Layer 4 Practical Application because it bridges pure Sanskrit accuracy with profound, non-sectarian practical application for modern human challenges.",
      keywords: [
        "sadhaka sanjivani", "sadhak sanjeevani", "swami ramsukhdas", "ramsukhdas", "gita press", "gorakhpur",
        "karma yoga", "nishkama karma", "duty", "swadharma", "grief", "anxiety", "depression",
        "psychology", "practical life", "householder", "ground truth", "verse by verse", "decision making",
        "complete commentary", "masterwork", "canonical", "ethics", "mind", "action", "surrender", "bhakti",
        "time", "cosmic time", "kala", "cosmology", "cycles of time", "kalpa", "pralaya", "universal vision"
      ],
      chapters: [
        { num: 1, title: "Arjuna Vishada Yoga", pages: "1–44", description: "Arjuna's moral collapse, existential crisis, battlefield dilemma, and complete surrender to Sri Krishna.", keywords: ["despair", "grief", "moral crisis", "kurukshetra", "battlefield", "dilemma", "confusion"] },
        { num: 2, title: "Sankhya Yoga", pages: "45–180", description: "Immortality of the Atman, Swadharma, Nishkama Karma Yoga (2.47), and Sthitaprajna state of equanimity.", keywords: ["soul", "atman", "death", "immortality", "karma yoga", "sthitaprajna", "equanimity", "duty"] },
        { num: 3, title: "Karma Yoga", pages: "181–270", description: "The discipline of selfless action, yajna, social responsibility (Lokasangraha), and conquering desire (Kama).", keywords: ["karma", "duty", "selfless action", "yajna", "desire", "kama", "society", "service"] },
        { num: 4, title: "Jnana Karma Sanyasa Yoga", pages: "271–340", description: "Divine descent (Avatara), eternal lineage (Parampara), and wisdom fire burning all karmic reactions.", keywords: ["avatara", "divine descent", "wisdom", "parampara", "burning karma", "lineage", "jnana"] },
        { num: 5, title: "Karma Sanyasa Yoga", pages: "341–380", description: "True inner renunciation vs external asceticism, performing duty like a lotus untouched by water.", keywords: ["renunciation", "sanyasa", "inner detachment", "lotus leaf", "equanimity", "peace"] },
        { num: 6, title: "Dhyana Yoga (Atmasamyama)", pages: "381–460", description: "Mind mastery, yogic posture, breath control, and conquering the restless mind through Abhyasa and Vairagya.", keywords: ["meditation", "mind control", "dhyana", "abhyasa", "vairagya", "restless mind", "focus", "yoga posture"] },
        { num: 7, title: "Jnana Vijnana Yoga", pages: "461–520", description: "Apara and Para Prakriti, the 4 types of seekers (Arta, Jijnasu, Artharthi, Jnani), and Maya's divine veil.", keywords: ["prakriti", "maya", "divine energy", "four types of devotees", "jnani", "realization"] },
        { num: 8, title: "Akshara Brahma Yoga", pages: "521–580", description: "The imperishable Absolute, consciousness at death (Antakala), cosmic cycles of time, Brahma's day/night, and Kalpas.", keywords: ["cosmic time", "time", "kala", "cosmology", "kalpa", "cycles of creation", "death", "eternity", "antakala"] },
        { num: 9, title: "Raja Vidya Raja Guhya Yoga", pages: "581–630", description: "Sovereign knowledge, divine sustenance of the universe, and the universality of loving devotion.", keywords: ["sovereign science", "supreme secret", "divine protection", "universal love", "devotion"] },
        { num: 10, title: "Vibhuti Yoga", pages: "631–680", description: "Divine splendors and infinite manifestations of the Supreme in nature, celestial beings, and human intellect.", keywords: ["divine glories", "vibhuti", "manifestations", "splendor", "celestial", "sun", "mountains"] },
        { num: 11, title: "Vishwaroopa Darshana Yoga", pages: "681–770", description: "The cosmic universal form, Arjuna's divine vision of the entire universe, and Sri Krishna's revelation as Time the Destroyer (Kalo'smi).", keywords: ["cosmic vision", "cosmology", "universal form", "time", "destroyer", "universe", "infinite form"] },
        { num: 12, title: "Bhakti Yoga", pages: "771–820", description: "Loving devotion, surrender, meditation on the personal vs unmanifest form, and the 35 divine virtues of a devotee.", keywords: ["devotion", "bhakti", "love", "compassion", "surrender", "virtues", "equanimity"] },
        { num: 13, title: "Kshetra Kshetragya Vibhaga Yoga", pages: "821–890", description: "The field (matter, body, emotions) vs the Knower of the field (witness consciousness, Atman), and Prakriti-Purusha.", keywords: ["the field", "knower of field", "kshetra", "kshetragya", "witness", "consciousness", "prakriti purusha"] },
        { num: 14, title: "Gunatraya Vibhaga Yoga", pages: "891–940", description: "The three Gunas (Sattva, Rajas, Tamas), their binding forces, mental bondage, and how to transcend the Gunas (Gunatita).", keywords: ["three gunas", "sattva", "rajas", "tamas", "gunatita", "transcending nature", "purity"] },
        { num: 15, title: "Purushottama Yoga", pages: "941–990", description: "The upside-down Ashvattha tree of material existence, Kshar and Akshar, and the eternal glory of Purushottama (the Supreme Person).", keywords: ["ashvattha tree", "cosmic tree", "purushottama", "supreme person", "kshar akshar", "transcendence"] },
        { num: 16, title: "Daivasura Sampad Vibhaga Yoga", pages: "991–1040", description: "The divine virtues (fearlessness, compassion, truth) vs demoniac vices (arrogance, greed, wrath) and the three gates to self-destruction.", keywords: ["divine qualities", "demoniac qualities", "virtues", "vices", "greed", "anger", "gates to hell"] },
        { num: 17, title: "Shraddhatraya Vibhaga Yoga", pages: "1041–1100", description: "Threefold divisions of human faith, food diets (Sattvic, Rajasic, Tamasic), sacrifices, charity, and the sacred syllables OM TAT SAT.", keywords: ["threefold faith", "sattvic diet", "food", "charity", "austerity", "om tat sat"] },
        { num: 18, title: "Moksha Sanyasa Yoga", pages: "1101–End", description: "Supreme synthesis: Tyaga vs Sanyasa, 5 factors of action, Swadharma duties, and Sri Krishna's final promise of complete surrender (18.66).", keywords: ["liberation", "moksha", "surrender", "swadharma", "conclusion", "tyaga", "sanyasa", "sarva dharman parityajya"] }
      ],
      scoringDetails: {
        title: "Srimad Bhagavad Gita (Sadhaka-Sanjivani)",
        score: 97,
        scoreLabel: "97 / 100",
        metricName: "Modern Practical Application (Layer 4)",
        tierTag: "Practical Life Benchmark #4",
        whyScored: "Scores 97/100 as the ultimate practical commentary for modern seekers, providing exhaustive, neutral, and life-applicable guidance for work, duty, and ethics.",
        comparisonWithOthers: "Unlike purely linguistic or metaphysical works, Sadhaka-Sanjivani directly addresses daily dilemmas, work stress, and householder challenges.",
        breakdown: {
          fidelity: "39/40 - Exact Gorakhpur Devanagari Sanskrit manuscript fidelity with zero unauthorized modern alterations.",
          fidelityScore: 39,
          rigor: "29/30 - Complete word-by-word practical synthesis addressing everyday human challenges.",
          rigorScore: 29,
          authority: "29/30 - Over 100 years of trusted, non-profit scriptural preservation by Gita Press.",
          authorityScore: 29
        },
        supportingResources: [
          {
            name: "Sadhaka-Sanjivani Canonical Critical Commentary",
            institution: "Gita Press Gorakhpur Official Publication Record",
            url: "https://gitapress.org",
            detail: "The exhaustive, verse-by-verse analytical masterwork by Swami Ramsukhdas synthesizing practical ethical action (Karmayoga), devotion (Bhakti), and philosophical discernment (Jnana).",
            type: "academic"
          }
        ]
      }
    }
  ];

  const veducationSeries = [
    {
      id: "ved-1",
      priority: 1,
      tierBadge: "VEDIC 01",
      tierLabel: "TIER 1",
      title: "B.O.S.S : Basics of Sanatan Sanskriti",
      author: "Prateeik Prajapati & Veducation Research Team",
      era: "English Edition",
      tradition: "Foundational Sanatan Dharma Principles & Heritage",
      tagline: "Vedic Essentials Handbook",
      desc: "Comprehensive primer breaking down foundational Sanatan principles, Vedic heritage, karma, samskaras, and eternal truths for modern generations.",
      pdfUrl: "https://storage.googleapis.com/nityageeta-library/BOSS.pdf",
      storeUrl: "https://www.veducation.world/store/BOSS-Eng",
      totalVerses: "Complete Heritage Handbook",
      score: 95,
      scoreLabel: "95 / 100",
      metricName: "Sanatan Foundations",
      authenticityRatio: "95%",
      authenticityDetail: "Grounded directly in authentic Vedic Smritis and foundational Shastras.",
      contextTrustRatio: "96%",
      contextTrustDetail: "Objective, pedagogical breakdown tailored for contemporary seekers without dogmatism.",
      scholarlyAuthority: "Researched and verified by Veducation cultural research team.",
      summary: "A crisp, visual guide explaining the structural roots of Vedic civilization, the Purusharthas (Dharma, Artha, Kama, Moksha), the Varnashrama framework, and why Sanatan traditions hold scientific and spiritual validity.",
      whyChosen: "Selected because this book covers foundational Vedic chapters and cultural pillars essential for grounding beginners and modern seekers in the overarching worldview of Sanatan Dharma.",
      keywords: [
        "boss", "b.o.s.s", "b.o.s.s.", "basics of sanatan sanskriti", "sanatan sanskriti", "sanatan dharma",
        "time", "cosmic", "cosmology", "cosmic time", "yugas", "satya yuga", "treta yuga", "dwapara yuga",
        "kali yuga", "kalpa", "mahayuga", "creation", "universe", "vedic civilization", "16 samskaras",
        "purusharthas", "dharma", "artha", "kama", "moksha", "varnashrama", "karma", "reincarnation",
        "rebirth", "vedas", "upanishads", "shastras", "smriti", "rituals", "astronomy", "scientific spirituality",
        "prateeik prajapati", "vedic essentials", "fundamentals", "hinduism", "basics",
        "mythology", "not mythology", "living tradition", "historical roots", "ancient cultural memories",
        "sacred spiritual narratives", "sacred narratives", "itihasa", "pure fiction", "fiction"
      ],
      chapters: [
        { num: 1, title: "Basics of Soul (Atma, Jeev)", pages: "1–18", description: "Who are we, nature of Atman, gross body vs subtle body, and spiritual consciousness.", keywords: ["soul", "atma", "atman", "jeev", "jiva", "subtle body", "gross body", "death", "consciousness"] },
        { num: 2, title: "Basics of God (Ishwar, Parmatma, Bhagavan)", pages: "19–39", description: "The 3 aspects of Supreme Reality (Brahman, Paramatma, Bhagavan) and divine reciprocation.", keywords: ["god", "ishwar", "parmatma", "bhagavan", "supreme", "krishna", "vishnu", "brahman"] },
        { num: 3, title: "Basics of Demigods (Devi Devta)", pages: "40–66", description: "Ganas, 12 Adityas, 8 Vasus, 11 Rudras, Shiva, Indra, and universal administration.", keywords: ["demigods", "devi devta", "devas", "shiva", "indra", "rudras", "adityas", "vasus"] },
        { num: 4, title: "Basics of Nature (Prakriti)", pages: "67–68", description: "Material nature, 3 Gunas (Sattva, Rajas, Tamas), and 24 cosmic elements.", keywords: ["nature", "prakriti", "gunas", "material world", "sattva", "rajas", "tamas"] },
        { num: 5, title: "Basics of Yoga & Asanas", pages: "69–94", description: "Connecting with the Divine, Ashtanga Yoga, Dhyana, focus, and pranayama breathwork.", keywords: ["yoga", "asanas", "meditation", "dhyana", "pranayama", "ashtanga", "mind"] },
        { num: 6, title: "Basics of Dharma", pages: "95–124", description: "The 4 Purusharthas (Dharma, Artha, Kama, Moksha), Varnashrama system, and Swadharma duties.", keywords: ["dharma", "purusharthas", "duty", "artha", "kama", "moksha", "varnashrama", "swadharma", "ethics"] },
        { num: 7, title: "Basics of Karma", pages: "125–144", description: "Sanchita, Prarabdha, Kriyamana karma, reincarnation, and 16 life Samskaras.", keywords: ["karma", "reincarnation", "rebirth", "samskaras", "16 samskaras", "destiny", "past life"] },
        { num: 8, title: "Basics of Cosmos (Brahmand & Cosmology)", pages: "145–176", description: "Vedic cosmology, structure of 14 Lokas, planetary realms, material creation, and cosmic dimensions.", keywords: ["cosmos", "cosmology", "brahmand", "universe", "creation", "14 lokas", "realms", "space", "planets", "astronomy", "space dimensions"] },
        { num: 9, title: "Basics of Time (Kaal, Yugas & Cosmic Cycles)", pages: "177–200", description: "Kaal (Time), 4 Yugas (Satya, Treta, Dwapara, Kali), Mahayugas, Manvantaras, Kalpas, Brahma's lifespan, and Pralaya (cosmic dissolution).", keywords: ["time", "cosmic time", "kaal", "yugas", "kali yuga", "satya yuga", "treta yuga", "dwapara yuga", "kalpa", "manvantara", "pralaya", "cosmic cycles", "brahma lifespan", "cosmic dissolution", "creation and destruction"] },
        { num: 10, title: "Basics of Vedic Shastras & Itihasa (Living Tradition vs Mythology)", pages: "201–236", description: "Explains why Hinduism is not mythology, but an eternal living tradition combining authentic historical roots (Itihasa - Ramayana & Mahabharata), ancient cultural memories, and sacred spiritual narratives (Shruti & Smriti) rather than pure fiction.", keywords: ["shastras", "scriptures", "vedas", "upanishads", "puranas", "itihasa", "ramayana", "mahabharata", "smriti", "shruti", "mythology", "not mythology", "living tradition", "historical roots", "cultural memories", "sacred narratives", "spiritual narratives", "history", "fiction", "pure fiction"] }
      ],
      scoringDetails: {
        title: "B.O.S.S : Basics of Sanatan Sanskriti",
        score: 95,
        scoreLabel: "95 / 100",
        metricName: "Foundational Sanatan Pedagogy",
        tierTag: "Vedic Foundations #1",
        whyScored: "Scores 95/100 for systematically demystifying Vedic concepts (Karma, Reincarnation, 16 Samskaras, 4 Purusharthas) with structured charts and verifiable Shastric citations.",
        comparisonWithOthers: "Compared to dense classical Sanskrit bhashyas, BOSS is designed as an accessible orientation manual that equips modern youth with foundational context before reading advanced commentaries.",
        breakdown: {
          fidelity: "38/40 - Rigorous grounding in Vedic Smritis, Upanishads, and Manu Smriti principles.",
          fidelityScore: 38,
          rigor: "29/30 - Structured breakdown of 4 Purusharthas and civilizational pillars.",
          rigorScore: 29,
          authority: "28/30 - Peer-recognized modern cultural handbook published by Veducation.",
          authorityScore: 28
        },
        supportingResources: [
          {
            name: "Veducation Official Store: BOSS English Edition",
            institution: "Veducation.world",
            url: "https://www.veducation.world/store/BOSS-Eng",
            detail: "Official English publication for Basics of Sanatan Sanskriti.",
            type: "academic"
          }
        ]
      }
    },
    {
      id: "ved-2",
      priority: 2,
      tierBadge: "VEDIC 02",
      tierLabel: "TIER 2",
      title: "Vedic Dincharya : Daily Routine & Shlokas",
      author: "Veducation Health & Lifestyle Team (Hindi Version)",
      era: "Hindi Edition",
      tradition: "Classical Ayurvedic & Smriti Daily Discipline",
      tagline: "Daily Shastric Discipline",
      desc: "Step-by-step actionable guide on traditional daily routines (Dincharya), morning Brahmamuhurta habits, energy conservation, and mental purity.",
      pdfUrl: "https://storage.googleapis.com/nityageeta-library/Vedic%20Dincharya.pdf",
      storeUrl: "https://www.amazon.in/dp/9359164534?ref=cm_sw_r_ffobk_cso_cp_mwn_dp_S1PZD5B2XQX1CZJSQ64R&ref_=cm_sw_r_ffobk_cso_cp_mwn_dp_S1PZD5B2XQX1CZJSQ64R&social_share=cm_sw_r_ffobk_cso_cp_mwn_dp_S1PZD5B2XQX1CZJSQ64R&bestFormat=true",
      totalVerses: "Daily Routine Manual",
      score: 94,
      scoreLabel: "94 / 100",
      metricName: "Daily Discipline",
      authenticityRatio: "94%",
      authenticityDetail: "Synthesized from classical Charaka Samhita and Ashtanga Hridaya shastras.",
      contextTrustRatio: "95%",
      contextTrustDetail: "Practical daily habit guidelines for physical health, circadian rhythm, and mental purity.",
      scholarlyAuthority: "Grounded in traditional Ayurvedic lifestyle principles.",
      summary: "Bridges classical Ayurvedic Smriti guidelines with modern lifestyle realities—explaining the circadian biology of waking at Brahmamuhurta, sunlight exposure, satvik diet, and evening wind-down rituals.",
      whyChosen: "Selected because it provides concrete, actionable daily lifestyle routines that translate theoretical Gita teachings on purity (Sattva) into practical daily habits.",
      keywords: [
        "vedic dincharya", "dincharya", "dinacharya", "daily routine", "habits", "rituals",
        "circadian rhythm", "circadian", "brahmamuhurta", "morning routine", "evening routine", "ratricharya",
        "sleep", "diet", "satvik food", "food", "eating", "digestion", "ayurveda", "charaka samhita",
        "ashtanga hridaya", "ayurvedic health", "physical purity", "mental balance", "energy", "sunlight",
        "bathing", "shlokas", "lifestyle discipline", "health", "wellness", "discipline"
      ],
      chapters: [],
      translationNotice: {
        badge: "Beta Version • Translation in Progress",
        message: "Translation from Hindi / Sanskrit to English is currently in progress.",
        subtext: "This publication is in Beta. Individual chapters, shlokas, and daily habit routines will be indexed once the complete English translation is finalized."
      },
      scoringDetails: {
        title: "Vedic Dincharya : Daily Routine & Shlokas",
        score: 94,
        scoreLabel: "94 / 100",
        metricName: "Circadian & Ayurvedic Habit Architecture",
        tierTag: "Daily Discipline #2",
        whyScored: "Scores 94/100 because it translates the Bhagavad Gita's emphasis on Yuktahara-Vihara (regulated habits in 6.17) into concrete morning, afternoon, and evening disciplines.",
        comparisonWithOthers: "While metaphysical commentaries explain *why* the mind must be purified, Vedic Dincharya provides the physiological and chronological *how*.",
        breakdown: {
          fidelity: "37/40 - Derived from classical Charaka Samhita & Ashtanga Hridaya Sutras.",
          fidelityScore: 37,
          rigor: "29/30 - Actionable circadian habit protocols from Brahmamuhurta to Ratricharya.",
          rigorScore: 29,
          authority: "28/30 - Verified against traditional Ayurvedic lifestyle principles.",
          authorityScore: 28
        },
        supportingResources: [
          {
            name: "Vedic Dincharya (Amazon Heritage Edition)",
            institution: "Amazon India (Official Verified Edition)",
            url: "https://www.amazon.in/dp/9359164534?ref=cm_sw_r_ffobk_cso_cp_mwn_dp_S1PZD5B2XQX1CZJSQ64R&ref_=cm_sw_r_ffobk_cso_cp_mwn_dp_S1PZD5B2XQX1CZJSQ64R&social_share=cm_sw_r_ffobk_cso_cp_mwn_dp_S1PZD5B2XQX1CZJSQ64R&bestFormat=true",
            detail: "Official edition of Vedic Dincharya for ideal shastric lifestyle.",
            type: "academic"
          }
        ]
      }
    },
    {
      id: "ved-3",
      priority: 3,
      tierBadge: "VEDIC 03",
      tierLabel: "TIER 3",
      title: "Brahmacharya : The Ultimate Action Book",
      author: "Veducation Research & Discipline Team (Hindi Version)",
      era: "Hindi Edition",
      tradition: "Patanjali Yoga Sutra Self-Mastery & Focus",
      tagline: "Self-Mastery Action Manual",
      desc: "Practical action manual focusing on mental discipline, energy conservation, focus mastery, and overcoming compulsive digital distractions.",
      pdfUrl: "https://storage.googleapis.com/nityageeta-library/Brahmacharya-the-Ultimate-Action-Book-for-Brahmacharya.pdf",
      storeUrl: "https://www.veducation.world/store/Brahmcharya-Hindi",
      totalVerses: "Action Guide",
      score: 92,
      scoreLabel: "92 / 100",
      metricName: "Willpower & Focus",
      authenticityRatio: "92%",
      authenticityDetail: "Based on classical Patanjali Yoga Sutra Yama-Niyama self-restraint guidelines.",
      contextTrustRatio: "94%",
      contextTrustDetail: "Empowerment focused on concentration, mental clarity, and digital discipline.",
      scholarlyAuthority: "Curated by Veducation Research Series.",
      summary: "Synthesizes classical Patanjali Yoga Sutra principles on self-restraint (Yama-Niyama) into high-impact focus strategies for students, engineers, and creators seeking unshakeable mental clarity.",
      whyChosen: "Selected because this book delivers the essential psychological focus techniques required to conquer restlessness and maintain unshakeable concentration.",
      keywords: [
        "brahmacharya", "celibacy", "self mastery", "willpower", "focus", "focus mastery",
        "concentration", "mind control", "senses", "indriya nigraha", "digital detox", "distraction",
        "dopamine", "semen retention", "energy conservation", "ojas", "tejas", "mental clarity",
        "meditation", "patanjali", "yoga sutras", "yama", "niyama", "addiction", "lust",
        "chitta vritti nirodha", "action book", "students", "habits", "self discipline"
      ],
      chapters: [],
      translationNotice: {
        badge: "Beta Version • Translation in Progress",
        message: "Translation from Hindi / Sanskrit to English is currently in progress.",
        subtext: "This publication is in Beta. Practical self-mastery protocols, diagnostic frameworks, and English explanations will be indexed once the complete translation is finalized."
      },
      scoringDetails: {
        title: "Brahmacharya : The Ultimate Action Book",
        score: 92,
        scoreLabel: "92 / 100",
        metricName: "Mental Clarity & Willpower Protocol",
        tierTag: "Self-Mastery Protocol #3",
        whyScored: "Scores 92/100 as an applied manual on conquering sensory impulses (Indriya Nigraha in Gita 2.58–68) and digital dopamine distraction.",
        comparisonWithOthers: "Focuses specifically on psychological discipline and willpower preservation rather than theoretical philosophy.",
        breakdown: {
          fidelity: "36/40 - Anchored in Patanjali Yoga Sutra Sadhanapada & Gita 6.14.",
          fidelityScore: 36,
          rigor: "28/30 - Direct mental habit reprogramming and focus mastery steps.",
          rigorScore: 28,
          authority: "28/30 - Verified Shastric discipline index.",
          authorityScore: 28
        },
        supportingResources: [
          {
            name: "Veducation Official Store: Brahmacharya (Hindi)",
            institution: "Veducation.world",
            url: "https://www.veducation.world/store/Brahmcharya-Hindi",
            detail: "Official Hindi publication of Brahmacharya : The Ultimate Action Book.",
            type: "academic"
          }
        ]
      }
    },
    {
      id: "ved-4",
      priority: 4,
      tierBadge: "VEDIC 04",
      tierLabel: "TIER 4",
      title: "5 in 1 Pack : Complete Vedic Curriculum",
      author: "Veducation Publishing & Cultural Foundation",
      era: "Complete Collector's Pack",
      tradition: "Full Comprehensive Vedic Curriculum",
      tagline: "5-Book Master Bundle",
      desc: "Complete Veducation B.O.S.S Trilogy Set Special Offer: All-in-one comprehensive 5-book master pack featuring B.O.S.S, Vedic Dincharya, Brahmacharya, and 2 exclusive supplementary gift books.",
      pdfUrl: null,
      storeUrl: "https://www.veducation.world/store/5in1books",
      totalVerses: "5-in-1 Master Collection",
      score: 97,
      scoreLabel: "97 / 100",
      metricName: "Complete Curriculum",
      authenticityRatio: "97%",
      authenticityDetail: "Encompasses all foundational texts, daily lifestyle shastras, and focus mastery guides.",
      contextTrustRatio: "97%",
      contextTrustDetail: "Holistic learning ecosystem for individuals, families, and educational institutions.",
      scholarlyAuthority: "Veducation Official Master Collection.",
      summary: "An integrated curriculum uniting foundational philosophy, daily lifestyle routines, and focus mastery. Designed to provide one with a complete foundation in Vedic wisdom.",
      whyChosen: "Selected because this comprehensive bundle unifies foundational philosophy (B.O.S.S), daily routines (Vedic Dincharya), mental focus (Brahmacharya), and sacred prayer handbooks.",
      keywords: [
        "5 in 1 pack", "5 in 1", "5in1", "five in one", "bundle", "complete curriculum", "all books",
        "master bundle", "boxset", "gift books", "vedic curriculum", "comprehensive", "boss",
        "vedic dincharya", "brahmacharya", "full library", "all in one", "sanatan pack",
        "special offer", "trilogy", "project golden bird"
      ],
      chapters: [],
      bundleBooks: [
        {
          title: "1. B.O.S.S : Basics of Sanatan Sanskriti",
          tag: "Foundational Wisdom",
          description: "Introduces foundational concepts of Sanatan Dharma, including the nature of the Soul, God, Nature, Yoga, Karma, Dharma, and Time. One gains clear understanding of core spiritual and philosophical questions."
        },
        {
          title: "2. Vedic Dincharya",
          tag: "Practical Routine",
          description: "Translates eternal Vedic principles into practical daily routines, helping one optimize morning habits, focus, physical vitality, and inner peace."
        },
        {
          title: "3. Brahmacharya : The Ultimate Action Book",
          tag: "Mind & Self-Mastery",
          description: "A practical guide for mastering mental discipline, focus, and energy conservation, helping one overcome compulsive digital habits and cultivate lasting clarity."
        },
        {
          title: "+ 2 Free Surprise Gift Books",
          mrp: "FREE Bonus",
          tag: "Sacred Gift",
          description: "Two complimentary companion books included to support one's daily reflection and spiritual growth."
        }
      ],
      scoringDetails: {
        title: "5 in 1 Pack : Complete Vedic Curriculum",
        score: 97,
        scoreLabel: "97 / 100",
        metricName: "5-in-1 Complete Bundle Architecture",
        tierTag: "Master Collection #4",
        whyScored: "Scores 97/100 as the complete curriculum combining philosophy, lifestyle routines, and cognitive discipline.",
        comparisonWithOthers: "Combines individual specialized books into a unified, all-encompassing Vedic learning set.",
        breakdown: {
          fidelity: "39/40 - Comprehensive fidelity across 5 classical and modern shastric books.",
          fidelityScore: 39,
          rigor: "29/30 - Complete end-to-end Sanatan lifestyle and philosophical framework.",
          rigorScore: 29,
          authority: "29/30 - Official Veducation Store master bundle.",
          authorityScore: 29
        },
        supportingResources: [
          {
            name: "Veducation Official Store 5-in-1 Pack",
            institution: "Veducation.world",
            url: "https://www.veducation.world/store/5in1books",
            detail: "Official 5-in-1 master pack bundle with B.O.S.S, Vedic Dincharya, Brahmacharya, and 2 gift books.",
            type: "academic"
          }
        ]
      }
    }
  ];

  const chaptersIndex = [
    {
      num: 1,
      name: "Arjuna Vishada Yoga",
      devanagari: "अर्जुनविषादयोग",
      verses: 47,
      theme: "The Despair of Arjuna & Moral Paralysis",
      focus: "Observing the battlefield, collapse of confidence, and existential grief.",
      keywords: ["chapter 1", "chapter 01", "arjuna vishada yoga", "despair", "grief", "moral crisis", "depression", "breakdown", "battlefield", "kurukshetra", "family", "existential grief", "pacifism", "confusion", "moral dilemma", "paralysis", "arjuna"]
    },
    {
      num: 2,
      name: "Sankhya Yoga",
      devanagari: "साङ्ख्ययोग",
      verses: 72,
      theme: "The Eternal Soul & Duty (Karma Yoga)",
      focus: "Immortality of the Atman, equanimity in action (2.47), and the Sthitaprajna state.",
      keywords: ["chapter 2", "chapter 02", "sankhya yoga", "eternal soul", "atman", "death", "immortality", "rebirth", "karma yoga", "2.47", "sthitaprajna", "equanimity", "steady mind", "action without attachment", "mind control", "soul"]
    },
    {
      num: 3,
      name: "Karma Yoga",
      devanagari: "कर्मयोग",
      verses: 43,
      theme: "The Discipline of Selfless Action",
      focus: "Action vs renunciation, setting an example for society, and conquering desire.",
      keywords: ["chapter 3", "chapter 03", "karma yoga", "selfless action", "duty", "yajna", "sacrifice", "desire", "kama", "action vs inaction", "setting example", "society", "nishkama karma", "work"]
    },
    {
      num: 4,
      name: "Jnana Karma Sanyasa Yoga",
      devanagari: "ज्ञानकर्मसंन्यासयोग",
      verses: 42,
      theme: "Wisdom in Action & Lineage of Knowledge",
      focus: "Divine descent (Avatara), wisdom burning karmic seeds, and sacred sacrifice.",
      keywords: ["chapter 4", "chapter 04", "jnana karma sanyasa yoga", "divine incarnation", "avatara", "lineage", "parampara", "wisdom fire", "burning karmic seeds", "sacred sacrifice", "knowledge", "wisdom in action"]
    },
    {
      num: 5,
      name: "Karma Sanyasa Yoga",
      devanagari: "कर्मसंन्यासयोग",
      verses: 29,
      theme: "Action Renunciation & Inner Freedom",
      focus: "Remaining untouched by sin like a lotus leaf on water; the sage with equal vision.",
      keywords: ["chapter 5", "chapter 05", "karma sanyasa yoga", "renunciation of action", "inner freedom", "lotus leaf", "detached action", "equal vision", "peace", "samadarshi"]
    },
    {
      num: 6,
      name: "Dhyana Yoga",
      devanagari: "ध्यानयोग",
      verses: 47,
      theme: "The Yoga of Meditation & Mind Mastery",
      focus: "Taming the restless mind through Abhyasa and Vairagya; the yogi's posture and focus.",
      keywords: ["chapter 6", "chapter 06", "dhyana yoga", "meditation", "mind control", "abhyasa", "vairagya", "restless mind", "taming the mind", "posture", "asanas", "focus", "pranayama", "willpower", "concentration"]
    },
    {
      num: 7,
      name: "Jnana Vijnana Yoga",
      devanagari: "ज्ञानविज्ञानयोग",
      verses: 30,
      theme: "Knowledge of the Ultimate Reality",
      focus: "Higher and lower cosmic energies (Prakriti), the four types of seekers.",
      keywords: ["chapter 7", "chapter 07", "jnana vijnana yoga", "ultimate reality", "prakriti", "maya", "four types of seekers", "cosmic energy", "divine knowledge", "creation", "elements"]
    },
    {
      num: 8,
      name: "Akshara Brahma Yoga",
      devanagari: "अक्षरब्रह्मयोग",
      verses: 28,
      theme: "The Path to the Imperishable Absolute",
      focus: "Consciousness at the moment of death (Antakala) and cosmic cycles of creation.",
      keywords: ["chapter 8", "chapter 08", "akshara brahma yoga", "time", "cosmic time", "kala", "cycles of creation", "cosmology", "death", "antakala", "brahma day and night", "afterlife", "imperishable absolute", "eternity", "kalpa"]
    },
    {
      num: 9,
      name: "Raja Vidya Raja Guhya Yoga",
      devanagari: "राजविद्याराजगुह्ययोग",
      verses: 34,
      theme: "The Sovereign Secret & Sovereign Science",
      focus: "Omnipresence of the Divine, direct surrender, and universal grace.",
      keywords: ["chapter 9", "chapter 09", "raja vidya raja guhya yoga", "sovereign secret", "sovereign science", "omnipresence", "direct surrender", "universal grace", "ananya bhakti", "protection", "divine love"]
    },
    {
      num: 10,
      name: "Vibhuti Yoga",
      devanagari: "विभूतियोग",
      verses: 42,
      theme: "The Divine Splendors & Manifestations",
      focus: "Seeing the Divine in the radiant sun, sacred mountains, Gayatri meter, and masters.",
      keywords: ["chapter 10", "chapter 10", "vibhuti yoga", "divine splendors", "cosmic opulence", "manifestations", "seeing god in nature", "sun", "himalayas", "gayatri", "splendor", "glory"]
    },
    {
      num: 11,
      name: "Vishwaroopa Darshana Yoga",
      devanagari: "विश्वरूपदर्शनयोग",
      verses: 55,
      theme: "The Cosmic Universal Vision",
      focus: "Arjuna receives the divine eye and beholds the infinite, awe-inspiring cosmic form.",
      keywords: ["chapter 11", "chapter 11", "vishwaroopa darshana yoga", "cosmic vision", "universal form", "time", "time the destroyer", "kalo'smi", "infinite form", "arjuna awe", "divine eye", "cosmic", "cosmos", "universe"]
    },
    {
      num: 12,
      name: "Bhakti Yoga",
      devanagari: "भक्तियोग",
      verses: 20,
      theme: "The Discipline of Loving Devotion",
      focus: "Attributes of the beloved devotee: kindness, freedom from envy, and equanimity.",
      keywords: ["chapter 12", "chapter 12", "bhakti yoga", "devotion", "loving devotion", "qualities of devotee", "kindness", "forgiveness", "surrender", "equanimity", "love", "compassion"]
    },
    {
      num: 13,
      name: "Kshetra Kshetragya Vibhaga Yoga",
      devanagari: "क्षेत्रक्षेत्रज्ञविभागयोग",
      verses: 35,
      theme: "The Field and the Knower of the Field",
      focus: "Distinguishing the mortal body/mind (the field) from the immortal observer (Atman).",
      keywords: ["chapter 13", "chapter 13", "kshetra kshetragya vibhaga yoga", "field and knower of field", "body and soul", "matter and spirit", "prakriti purusha", "witness", "observer", "atman", "consciousness"]
    },
    {
      num: 14,
      name: "Gunatraya Vibhaga Yoga",
      devanagari: "गुणत्रयविभागयोग",
      verses: 27,
      theme: "The Three Modes of Material Nature",
      focus: "Sattva (harmony), Rajas (passion), and Tamas (inertia) and transcending them.",
      keywords: ["chapter 14", "chapter 14", "gunatraya vibhaga yoga", "three modes of nature", "gunas", "sattva", "rajas", "tamas", "harmony", "passion", "inertia", "transcending gunas", "gunatita"]
    },
    {
      num: 15,
      name: "Purushottama Yoga",
      devanagari: "पुरुषोत्तमयोग",
      verses: 20,
      theme: "The Supreme Cosmic Person",
      focus: "The inverted Ashvattha tree of samsara and the eternal spark of the divine soul.",
      keywords: ["chapter 15", "chapter 15", "purushottama yoga", "supreme cosmic person", "ashvattha tree", "inverted tree", "eternal spark", "jivatma", "cosmic banyan", "tree of life"]
    },
    {
      num: 16,
      name: "Daivasura Sampad Vibhaga Yoga",
      devanagari: "दैवासुरसम्पद्विभागयोग",
      verses: 24,
      theme: "The Divine and Demonic Natures",
      focus: "Virtues leading to liberation vs destructive vices (lust, anger, greed) leading to bondage.",
      keywords: ["chapter 16", "chapter 16", "daivasura sampad vibhaga yoga", "divine and demonic natures", "virtues vs vices", "lust anger greed", "three gates to hell", "moral conduct", "ethics", "character"]
    },
    {
      num: 17,
      name: "Shraddhatraya Vibhaga Yoga",
      devanagari: "श्रद्धात्रयविभागयोग",
      verses: 28,
      theme: "The Threefold Faith & Diet",
      focus: "How Sattva, Rajas, and Tamas influence our faith, food, charity, and austerity.",
      keywords: ["chapter 17", "chapter 17", "shraddhatraya vibhaga yoga", "threefold faith", "diet", "sattvic food", "rajasic food", "tamasic food", "charity", "austerity", "om tat sat", "food habits", "faith"]
    },
    {
      num: 18,
      name: "Moksha Sanyasa Yoga",
      devanagari: "मोक्षसंन्यासयोग",
      verses: 78,
      theme: "Liberation through Total Surrender",
      focus: "The supreme summary: fulfilling natural duty (Swadharma) and total surrender (18.66).",
      keywords: ["chapter 18", "chapter 18", "moksha sanyasa yoga", "liberation", "total surrender", "swadharma", "18.66", "sarva dharman parityajya", "summary of gita", "ultimate peace", "conclusion"]
    }
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
    "own", "same", "so", "than", "too", "very", "can", "will", "just", "don", "should", "now",
    "book", "books", "commentary", "commentaries", "information", "info", "tell", "show", "find",
    "looking", "look", "want", "would", "like", "best", "give", "please", "read", "teach", "teaches",
    "contains", "containing", "know", "study", "name",
    "related", "relates", "relating", "relation", "mention", "mentioned", "mentioning",
    "covers", "covering", "detail", "details", "talk", "talks", "talking", "having",
    "guide", "guides", "guiding", "guidance",
    "question", "questions", "answer", "answers", "answering",
    "topic", "topics", "subject", "subjects", "concept", "concepts",
    "explain", "explains", "explaining", "explanation", "explanations",
    "describe", "describes", "describing", "description",
    "help", "helps", "helping", "helpful", "need", "needs",
    "someone", "anyone", "everyone", "thing", "things",
    "content", "contents", "contain", "contains", "containing", "knowledge",
    "provide", "provides", "providing", "learn", "learning", "learnt",
    "work", "works", "working", "understand", "understands", "understanding",
    "feeling", "feels", "feel", "infomration",
    "while", "rather", "strictly", "combines", "combining", "pure", "versus", "vs"
  ]), []);

  // Common typo and phonetic normalization dictionary for Indian search queries
  const TYPO_MAP: Record<string, string> = useMemo(() => ({
    consmic: "cosmic",
    cosmology: "cosmic",
    infomration: "information",
    univers: "universe",
    karm: "karma",
    dharm: "dharma",
    atmam: "atman",
    dhyan: "dhyana",
    jnanam: "jnana",
    shlok: "shloka",
    sloka: "shloka",
    geeta: "gita",
    bhagvat: "bhagavad"
  }), []);

  // Multi-tier semantic and fuzzy scoring function
  const scoreSemanticItem = (
    query: string,
    corpus: string,
    keywords: string[],
    title: string
  ): number => {
    if (!query.trim()) return 1;

    const rawQuery = query.toLowerCase().trim();
    const collapsedQuery = rawQuery.replace(/[^a-z0-9]/g, "");
    const collapsedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const collapsedKeywords = keywords.map(k => k.toLowerCase().replace(/[^a-z0-9]/g, "")).join(" ");
    const collapsedCorpus = corpus.toLowerCase().replace(/[^a-z0-9]/g, "");

    let score = 0;

    // 1. Direct Acronym / Title Collapsed Match (e.g. "boss" matches "b.o.s.s.")
    if (collapsedQuery.length >= 2) {
      if (collapsedTitle === collapsedQuery) score += 150;
      else if (collapsedTitle.includes(collapsedQuery)) score += 90;
      else if (collapsedKeywords.includes(collapsedQuery)) score += 80;
      else if (collapsedCorpus.includes(collapsedQuery)) score += 50;
    }

    // 2. Exact phrase match in raw corpus or keywords
    if (corpus.toLowerCase().includes(rawQuery)) {
      score += 70;
    }

    // 3. Extract meaningful search tokens without stop words and map typos
    const rawTokens = rawQuery.split(/[\s,+#_.:;?!/\\|()\[\]{}'"]+/).filter(Boolean);
    const meaningfulTokens = rawTokens
      .map(t => TYPO_MAP[t] || t)
      .filter(t => !STOP_WORDS.has(t));
    const tokensToUse = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;

    let matchedTokensCount = 0;
    tokensToUse.forEach(token => {
      const cleanToken = token.replace(/[^a-z0-9]/g, "");
      if (!cleanToken) return;
      const normalizedToken = TYPO_MAP[cleanToken] || cleanToken;

      let tokenMatched = false;

      // Check title
      if (title.toLowerCase().includes(token) || title.toLowerCase().includes(normalizedToken) || collapsedTitle.includes(cleanToken) || collapsedTitle.includes(normalizedToken)) {
        score += 40;
        tokenMatched = true;
      }

      // Check keywords array
      const kwMatch = keywords.some(k => k.toLowerCase().includes(token) || k.toLowerCase().replace(/[^a-z0-9]/g, "").includes(cleanToken));
      if (kwMatch) {
        score += 35;
        tokenMatched = true;
      }

      // Check overall corpus
      if (corpus.toLowerCase().includes(token) || collapsedCorpus.includes(cleanToken)) {
        score += 15;
        tokenMatched = true;
      }

      if (tokenMatched) matchedTokensCount++;
    });

    // Multi-token synergy boost when multiple concepts match simultaneously
    if (tokensToUse.length > 1 && matchedTokensCount >= Math.ceil(tokensToUse.length * 0.5)) {
      score += matchedTokensCount * 25;
    }

    return score;
  };

  // Unified Semantic Search Engine
  const { filteredGeeta, filteredVeducation, filteredChapters, totalMatches, isSearchActive } = useMemo(() => {
    const rawQ = searchQuery.trim();
    if (!rawQ) {
      return {
        filteredGeeta: geetaEditions,
        filteredVeducation: veducationSeries,
        filteredChapters: chaptersIndex,
        totalMatches: geetaEditions.length + veducationSeries.length + chaptersIndex.length,
        isSearchActive: false
      };
    }

    const scoredGeeta = geetaEditions
      .map((b) => {
        const chaptersText = (b.chapters || []).map((c: any) => `${c.title} ${c.description} ${(c.keywords || []).join(" ")}`).join(" ");
        const corpus = `${b.title} ${b.author} ${b.desc} ${b.tradition} ${b.era} ${b.tagline} ${b.summary} ${b.whyChosen} ${b.tierBadge} ${b.tierLabel} ${b.metricName} ${(b.keywords || []).join(" ")} ${chaptersText}`;
        const score = scoreSemanticItem(rawQ, corpus, b.keywords || [], b.title);
        return { item: b, score };
      })
      .filter((res) => res.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((res) => res.item);

    const scoredVeducation = veducationSeries
      .map((b) => {
        const chaptersText = (b.chapters || []).map((c: any) => `${c.title} ${c.description} ${(c.keywords || []).join(" ")}`).join(" ");
        const corpus = `${b.title} ${b.author} ${b.desc} ${b.tradition} ${b.era} ${b.tagline} ${b.summary} ${b.whyChosen} ${b.tierBadge} ${b.tierLabel} ${b.metricName} ${(b.keywords || []).join(" ")} ${chaptersText}`;
        const score = scoreSemanticItem(rawQ, corpus, b.keywords || [], b.title);
        return { item: b, score };
      })
      .filter((res) => res.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((res) => res.item);

    const scoredChapters = chaptersIndex
      .map((c) => {
        const corpus = `chapter ${c.num} ${c.num} ${c.name} ${c.devanagari} ${c.theme} ${c.focus} ${c.verses} verses ${(c.keywords || []).join(" ")}`;
        const score = scoreSemanticItem(rawQ, corpus, c.keywords || [], c.name);
        return { item: c, score };
      })
      .filter((res) => res.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((res) => res.item);

    const total = scoredGeeta.length + scoredVeducation.length + scoredChapters.length;

    return {
      filteredGeeta: scoredGeeta,
      filteredVeducation: scoredVeducation,
      filteredChapters: scoredChapters,
      totalMatches: total,
      isSearchActive: true
    };
  }, [searchQuery, geetaEditions, veducationSeries, chaptersIndex]);

  const hasNoResults = isSearchActive && totalMatches === 0;

  const currentTabMatchesCount = useMemo(() => {
    if (activeTab === "all") return totalMatches;
    if (activeTab === "geeta") return filteredGeeta.length;
    if (activeTab === "veducation") return filteredVeducation.length;
    if (activeTab === "chapters") return filteredChapters.length;
    return 0;
  }, [activeTab, totalMatches, filteredGeeta, filteredVeducation, filteredChapters]);

  const activeTabName = useMemo(() => {
    if (activeTab === "geeta") return "Gita Commentaries";
    if (activeTab === "veducation") return "Veducation Series";
    if (activeTab === "chapters") return "18 Chapters Index";
    if (activeTab === "vetting") return "Editorial Vetting";
    return "All Categories";
  }, [activeTab]);

  const getBookMatchedChapters = useCallback(
    (book: any) => {
      if (!isSearchActive || !book.chapters) return [];
      const rawQ = searchQuery.toLowerCase().trim();
      const rawTokens = rawQ.split(/[\s,+#_.:;?!/\\|()\[\]{}'"]+/).filter(Boolean);
      const meaningfulTokens = rawTokens
        .map(t => TYPO_MAP[t] || t)
        .filter((t) => !STOP_WORDS.has(t));
      const tokensToUse = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;
      if (tokensToUse.length === 0) return [];

      const matched: { chapter: any; score: number }[] = [];

      book.chapters.forEach((ch: any) => {
        let chScore = 0;
        const chCorpus = `${ch.title} ${ch.description} ${(ch.keywords || []).join(" ")}`.toLowerCase();
        const chCollapsed = chCorpus.replace(/[^a-z0-9]/g, "");

        tokensToUse.forEach((token) => {
          const cleanToken = token.replace(/[^a-z0-9]/g, "");
          if (!cleanToken) return;
          const normalizedToken = TYPO_MAP[cleanToken] || cleanToken;

          if (ch.title.toLowerCase().includes(token) || ch.title.toLowerCase().includes(normalizedToken)) chScore += 45;
          if ((ch.keywords || []).some((k: string) => k.toLowerCase().includes(token) || k.toLowerCase().includes(normalizedToken))) chScore += 40;
          if (ch.description.toLowerCase().includes(token) || ch.description.toLowerCase().includes(normalizedToken)) chScore += 25;
          if (chCollapsed.includes(cleanToken) || chCollapsed.includes(normalizedToken)) chScore += 20;

          // Stem and prefix matching (e.g. "cosmology" -> "cosm" matches "cosmos" & "cosmic")
          if (cleanToken.length >= 4) {
            const prefix = cleanToken.slice(0, 4);
            if (chCollapsed.includes(prefix)) {
              chScore += 25;
            }
          }
        });

        if (chScore > 0) {
          matched.push({ chapter: ch, score: chScore });
        }
      });

      return matched
        .sort((a, b) => b.score - a.score)
        .slice(0, 1)
        .map((m) => m.chapter);
    },
    [isSearchActive, searchQuery, STOP_WORDS, TYPO_MAP]
  );

  const getBookSearchMetadata = useCallback(
    (book: any) => {
      if (!isSearchActive || !searchQuery.trim()) return null;
      const rawQ = searchQuery.toLowerCase().trim();
      const rawTokens = rawQ.split(/[\s,+#_.:;?!/\\|()\[\]{}'"]+/).filter(Boolean);
      const meaningfulTokens = rawTokens
        .map(t => TYPO_MAP[t] || t)
        .filter((t) => !STOP_WORDS.has(t));
      const tokensToUse = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;
      if (tokensToUse.length === 0) return null;

      if (book.chapters && book.chapters.length > 0) {
        const scoredChapters: { chapter: any; score: number }[] = [];
        book.chapters.forEach((ch: any) => {
          let chScore = 0;
          const chCorpus = `${ch.title} ${ch.description} ${(ch.keywords || []).join(" ")}`.toLowerCase();
          const chCollapsed = chCorpus.replace(/[^a-z0-9]/g, "");

          tokensToUse.forEach((token) => {
            const cleanToken = token.replace(/[^a-z0-9]/g, "");
            if (!cleanToken) return;
            const normalizedToken = TYPO_MAP[cleanToken] || cleanToken;

            if (ch.title.toLowerCase().includes(token) || ch.title.toLowerCase().includes(normalizedToken)) chScore += 50;
            if ((ch.keywords || []).some((k: string) => k.toLowerCase().includes(token) || k.toLowerCase().includes(normalizedToken))) chScore += 45;
            if (ch.description.toLowerCase().includes(token) || ch.description.toLowerCase().includes(normalizedToken)) chScore += 30;
            if (chCollapsed.includes(cleanToken) || chCollapsed.includes(normalizedToken)) chScore += 20;

            if (cleanToken.length >= 4) {
              const prefix = cleanToken.slice(0, 4);
              if (chCollapsed.includes(prefix)) {
                chScore += 25;
              }
            }
          });

          if (chScore > 0) {
            scoredChapters.push({ chapter: ch, score: chScore });
          }
        });

        scoredChapters.sort((a, b) => b.score - a.score);

        if (scoredChapters.length > 0) {
          const topChapter = scoredChapters[0].chapter;
          const pageStr = topChapter.pages ? ` (pp. ${topChapter.pages})` : "";

          // Curated precise 1-chapter summaries for specific matched chapters
          if (book.id === "ved-1" && topChapter.num === 8) {
            return {
              chapterLabel: `Matched in Chapter 8${pageStr}:`,
              chapterTitles: topChapter.title,
              summary: "Covers the structural architecture of the Brahmand (Cosmos), 14 planetary realms (Lokas), material creation, and cosmic dimensions."
            };
          }

          if (book.id === "ved-1" && topChapter.num === 9) {
            return {
              chapterLabel: `Matched in Chapter 9${pageStr}:`,
              chapterTitles: topChapter.title,
              summary: "Covers Shastric calculations of Cosmic Time (Kaal), 4 Yugas, Mahayugas, Manvantaras, Kalpas, and Pralaya (cosmic dissolution)."
            };
          }

          if (book.id === "ved-1" && topChapter.num === 10) {
            return {
              chapterLabel: `Matched in Chapter 10${pageStr}:`,
              chapterTitles: topChapter.title,
              summary: "Explains why Hinduism is not mythology, but an eternal living tradition combining authentic historical roots (Itihasa), ancient cultural memories, and sacred spiritual narratives rather than pure fiction."
            };
          }

          if ((book.id === "geeta-1" || book.id === "geeta-4") && topChapter.num === 11) {
            return {
              chapterLabel: `Matched in Chapter 11${pageStr}:`,
              chapterTitles: topChapter.title,
              summary: "The cosmic universal form, Arjuna's divine vision of the entire universe, and Sri Krishna's revelation as Time the Ultimate Destroyer (Kalo'smi)."
            };
          }

          if ((book.id === "geeta-1" || book.id === "geeta-4") && topChapter.num === 8) {
            return {
              chapterLabel: `Matched in Chapter 8${pageStr}:`,
              chapterTitles: topChapter.title,
              summary: "The imperishable Absolute, consciousness at death (Antakala), cosmic cycles of time, Brahma's day and night (Kalpas), and universal dissolution."
            };
          }

          if (book.id === "geeta-2" && topChapter.num === 11) {
            return {
              chapterLabel: `Matched in Chapter 11${pageStr}:`,
              chapterTitles: topChapter.title,
              summary: "Interlinear grammatical breakdown, Sanskrit Dhatu root analysis, and case endings for the revelation of the Universal Form."
            };
          }

          if (book.id === "geeta-3" && topChapter.num === 8) {
            return {
              chapterLabel: `Matched in Chapter 8${pageStr}:`,
              chapterTitles: topChapter.title,
              summary: "Classical Advaita Vedanta dialectic on cosmic time cycles, creation, dissolution, and the transcendent Atman beyond material time."
            };
          }

          return {
            chapterLabel: `Matched in Chapter ${topChapter.num}${pageStr}:`,
            chapterTitles: topChapter.title,
            summary: topChapter.description
          };
        }
      }

      // Fallback if general book metadata matched
      return {
        chapterLabel: "Relevant Overview:",
        chapterTitles: book.metricName || book.tagline,
        summary: book.desc || book.summary
      };
    },
    [isSearchActive, searchQuery, STOP_WORDS, TYPO_MAP]
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1C1917] text-[#2D2622] dark:text-[#F5F2EB] flex flex-col font-serif selection:bg-[#C25E38]/20 dark:selection:bg-[#E06D43]/30 transition-colors duration-300">
      <ScrollProgress className="fixed top-0 left-0 right-0 z-[10000]" />
      <Navbar activePage="sources" />

      {/* Hero Header */}
      <section className="pt-32 pb-16 px-6 max-w-6xl mx-auto w-full text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal leading-tight text-[#2D2622] dark:text-[#F5F2EB] mb-6 font-serif">
          Verifiable <span className="text-[#C25E38] dark:text-[#E06D43] font-medium italic">Sources & Manuscripts</span>
        </h1>

        <p className="text-base sm:text-lg text-[#5C4F45] dark:text-[#D4C7B8] max-w-3xl mx-auto font-sans leading-relaxed mb-10 [text-wrap:balance]">
          NityaGeeta is built on complete transparency. One can explore authentic Gita Press commentaries, SUNY Press word-for-word grammatical breakdowns, and classical Sanskrit texts that ground NityaGeeta&apos;s intelligence.
        </p>

        {/* Global Search Bar */}
        <div className="max-w-xl mx-auto relative font-sans mb-10">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#8C7B70] dark:text-[#A89F91] absolute left-4 pointer-events-none shrink-0" />
            <input
              type="text"
              placeholder="Search books, topics, cosmic time, Sanskrit grammar, chapters..."
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (activeTab === "vetting" && val.trim()) {
                  setActiveTab("all");
                }
              }}
              className="w-full pl-11 pr-28 py-2.5 rounded-2xl bg-[#EFE9DF] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] dark:placeholder-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#C25E38] dark:focus:ring-[#E06D43] transition shadow-inner text-sm"
            />
            {isSearchActive && (
              <div className="absolute right-2.5 flex items-center bg-[#E5DCD0] dark:bg-[#332E2A] border border-[#D5C9B9] dark:border-[#423C36] rounded-full px-2.5 py-1 gap-2 shadow-2xs shrink-0 select-none">
                <span className="text-[11px] font-semibold text-[#C25E38] dark:text-[#E06D43] tracking-tight whitespace-nowrap leading-none">
                  {totalMatches} {totalMatches === 1 ? "match" : "matches"}
                </span>
                <span className="w-px h-3 bg-[#CBBFB0] dark:bg-[#4E463F]" />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("all");
                  }}
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

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 font-sans text-xs font-bold">
          {[
            { id: "all", label: `All Resources (${totalMatches})` },
            { id: "geeta", label: `Gita Commentaries (${filteredGeeta.length})` },
            { id: "veducation", label: `Veducation Series (${filteredVeducation.length})` },
            { id: "chapters", label: `18 Chapters Index (${filteredChapters.length})` },
            { id: "vetting", label: "Editorial Vetting Standards" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#C25E38] dark:bg-[#E06D43] text-white border-[#C25E38] shadow-md scale-[1.02]"
                  : "bg-[#EFE9DF]/80 dark:bg-[#262320]/80 border-[#DFD5C6] dark:border-[#38332E] text-[#5C4F45] dark:text-[#D4C7B8] hover:border-[#C25E38]/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 pb-24 w-full flex-1 font-sans">

        {/* Clean Empty State when ZERO results found across all categories - ALWAYS DISPLAYED AT THE VERY TOP */}
        {hasNoResults && (
          <div className="py-14 sm:py-16 text-center flex flex-col items-center justify-center space-y-6 bg-[#FAF7F2] dark:bg-[#201C19] rounded-3xl border border-[#DFD5C6] dark:border-[#38332E] p-8 shadow-sm mb-12 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-[#EFE9DF] dark:bg-[#2A2521] border border-[#DFD5C6] dark:border-[#3E3832] flex items-center justify-center text-[#C25E38] dark:text-[#E06D43] shadow-inner">
              <Search className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-lg">
              <h3 className="text-2xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
                No matching manuscripts found
              </h3>
              <p className="text-sm text-[#8C7B70] dark:text-[#A89F91] leading-relaxed">
                No commentary, chapter, or book matched <span className="font-semibold text-[#C25E38] dark:text-[#E06D43]">&ldquo;{searchQuery}&rdquo;</span>. Try searching{" "}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("karma");
                    setActiveTab("all");
                  }}
                  className="font-semibold text-[#C25E38] dark:text-[#E06D43] underline underline-offset-2 hover:opacity-80 cursor-pointer"
                >
                  &lsquo;karma&rsquo;
                </button>
                ,{" "}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("cosmic time");
                    setActiveTab("all");
                  }}
                  className="font-semibold text-[#C25E38] dark:text-[#E06D43] underline underline-offset-2 hover:opacity-80 cursor-pointer"
                >
                  &lsquo;cosmic time&rsquo;
                </button>
                , or{" "}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("Chapter 2");
                    setActiveTab("all");
                  }}
                  className="font-semibold text-[#C25E38] dark:text-[#E06D43] underline underline-offset-2 hover:opacity-80 cursor-pointer"
                >
                  &lsquo;Chapter 2&rsquo;
                </button>
                .
              </p>
            </div>

            {/* Suggested Search Query Chips */}
            <div className="pt-2 w-full max-w-lg">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8C7B70] dark:text-[#A89F91] mb-3">
                Suggested Topics & Keywords
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  "Karma",
                  "Cosmic Time",
                  "Chapter 2",
                  "Daily Routine",
                  "Sadhaka-Sanjivani",
                  "Mind Control",
                  "Sanskrit Grammar",
                  "Advaita Shankara",
                  "B.O.S.S"
                ].map((suggestedQuery) => (
                  <button
                    key={suggestedQuery}
                    type="button"
                    onClick={() => {
                      setSearchQuery(suggestedQuery);
                      setActiveTab("all");
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#EFE9DF] dark:bg-[#2A2521] border border-[#DFD5C6] dark:border-[#3E3832] text-xs font-semibold text-[#2D2622] dark:text-[#F5F2EB] hover:border-[#C25E38] dark:hover:border-[#E06D43] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition cursor-pointer shadow-2xs"
                  >
                    {suggestedQuery}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                }}
                className="px-6 py-2.5 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition shadow-sm cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}

        {/* Cross-Tab Switcher: When search has matches in other tabs, but 0 in current filtered tab */}
        {isSearchActive && !hasNoResults && activeTab !== "all" && currentTabMatchesCount === 0 && (
          <div className="mb-10 p-6 rounded-2xl bg-[#EFE9DF]/80 dark:bg-[#262320]/80 border border-[#DFD5C6] dark:border-[#38332E] text-center space-y-4 animate-in fade-in duration-200 shadow-sm">
            <p className="text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
              No results in <strong className="text-[#2D2622] dark:text-[#F5F2EB]">{activeTabName}</strong> for &ldquo;{searchQuery}&rdquo;, but found <strong className="text-[#C25E38] dark:text-[#E06D43]">{totalMatches} matches</strong> across other sections.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {filteredVeducation.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("veducation")}
                  className="px-4 py-2 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition shadow-sm cursor-pointer"
                >
                  View Veducation Series ({filteredVeducation.length})
                </button>
              )}
              {filteredGeeta.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("geeta")}
                  className="px-4 py-2 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition shadow-sm cursor-pointer"
                >
                  View Gita Commentaries ({filteredGeeta.length})
                </button>
              )}
              {filteredChapters.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("chapters")}
                  className="px-4 py-2 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition shadow-sm cursor-pointer"
                >
                  View Chapters Index ({filteredChapters.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#DFD5C6] dark:border-[#3E3832] text-xs font-bold text-[#2D2622] dark:text-[#F5F2EB] hover:border-[#C25E38] dark:hover:border-[#E06D43] transition cursor-pointer"
              >
                View All Categories ({totalMatches})
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: GEETA COMMENTARIES SECTION */}
        {(activeTab === "all" || activeTab === "geeta") && filteredGeeta.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between border-b border-[#E8E1D7] dark:border-[#38332E] pb-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38] dark:text-[#E06D43]">
                  Primary Dataset Layer
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-[#2D2622] dark:text-[#F5F2EB] font-normal mt-0.5">
                  Canonical Bhagavad Gita Commentaries
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-[#8C7B70] dark:text-[#A89F91] hidden sm:block">
                {filteredGeeta.length} of {geetaEditions.length} Editions Available
              </span>
            </div>

            <div className="space-y-6">
              {filteredGeeta.map((source) => {
                const isExpanded = expandedSourceId === source.id;
                const matchedChapters = getBookMatchedChapters(source);
                const searchMeta = getBookSearchMetadata(source);
                return (
                  <div
                    key={source.id}
                    id={source.id}
                    className="rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedSourceId(isExpanded ? null : source.id)}
                      className="p-6 sm:p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 cursor-pointer group"
                    >
                      <div className="flex items-start sm:items-center gap-5 flex-1">
                        {/* Apple/Linear-Grade Sleek Rank Badge */}
                        <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-[#EFE9DF] dark:bg-[#1E1B18] border border-[#DFD5C6] dark:border-[#3E3832] flex flex-col items-center justify-center shrink-0 shadow-sm group-hover:border-[#C25E38]/50 transition-colors">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#C25E38] dark:text-[#E06D43] leading-none mb-1">
                            {source.tierLabel}
                          </span>
                          <span className="text-xl sm:text-2xl font-serif font-black text-[#2D2622] dark:text-[#F5F2EB] leading-none">
                            0{source.priority}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-[#2D2622] dark:text-[#F5F2EB] font-serif group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition-colors">
                              {source.title}
                            </h3>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43]">
                              {source.metricName}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#C25E38] dark:text-[#E06D43] mb-2">
                            By {source.author} • {source.era}
                          </p>
                          <p className="text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                            {source.desc}
                          </p>
                        </div>
                      </div>

                      {/* Score, Prominent (i) Audit Badge, and Expand Arrow */}
                      <div className="flex flex-col items-start sm:items-end justify-between w-full lg:w-[300px] pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E8E1D7] dark:border-[#38332E] shrink-0 gap-2.5">
                        
                        {/* Score Row with High-Visibility (i) Button */}
                        <div className="flex items-center justify-between w-full text-xs font-semibold">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#2D2622] dark:text-[#F5F2EB] font-bold">Authenticity Score</span>
                            {/* Sleek (i) Info Icon Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveScoringInfo(source.scoringDetails);
                              }}
                              className="p-1 rounded-full text-[#8C7B70] dark:text-[#A89F91] hover:text-[#C25E38] dark:hover:text-[#E06D43] hover:bg-[#C25E38]/10 dark:hover:bg-[#E06D43]/20 transition cursor-pointer"
                              title="View Scoring Audit & Verified Citations"
                              aria-label="View Scoring Audit"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[#C25E38] dark:text-[#E06D43] font-mono font-extrabold text-sm">{source.scoreLabel}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-[#EFE9DF] dark:bg-[#332E2A] overflow-hidden border border-[#DFD5C6] dark:border-[#38332E]">
                          <div
                            style={{ width: `${source.score}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-[#C25E38] to-[#E06D43]"
                          />
                        </div>

                        {/* Tagline and Expand Toggle */}
                        <div className="flex items-center justify-between w-full text-xs pt-1">
                          <span className="font-semibold text-[#5C4F45] dark:text-[#D4C7B8] px-2.5 py-0.5 rounded-md bg-[#EFE9DF] dark:bg-[#332E2A] text-[11px]">
                            {source.tagline}
                          </span>
                          <div className="p-1 rounded-lg text-[#C25E38] dark:text-[#E06D43] hover:bg-[#EFE9DF] dark:hover:bg-[#332E2A]">
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Search Match Metadata Highlight Strip (Full-width, clearly separated, no magic icon!) */}
                    {isSearchActive && searchMeta && (
                      <div className="px-6 sm:px-7 py-3.5 bg-[#FAF3EC] dark:bg-[#2A231E] border-t border-[#DFD5C6] dark:border-[#38332E] text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                          <span className="font-bold text-[#C25E38] dark:text-[#E06D43] tracking-wide">
                            {searchMeta.chapterLabel}
                          </span>
                          <span className="font-bold text-[#2D2622] dark:text-[#F5F2EB] font-serif text-[13px]">
                            {searchMeta.chapterTitles}
                          </span>
                        </div>
                        <p className="text-[#5C4F45] dark:text-[#D4C7B8] mt-1 leading-relaxed text-[12px]">
                          {searchMeta.summary}
                        </p>
                      </div>
                    )}

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="px-6 pb-7 pt-4 border-t border-[#E8E1D7] dark:border-[#38332E] bg-[#EFE9DF]/40 dark:bg-[#2A2521]/60 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-xs">
                          {/* Overview */}
                          <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] space-y-2.5 shadow-sm">
                            <div className="font-bold text-[#C25E38] dark:text-[#E06D43] text-sm font-serif">
                              Comprehensive Edition Overview
                            </div>
                            <p className="text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                              {source.summary}
                            </p>
                            <div className="pt-2.5 border-t border-[#E8E1D7] dark:border-[#38332E] text-[11px] text-[#8C7B70] dark:text-[#A89F91] space-y-1">
                              <div><strong className="text-[#2D2622] dark:text-[#F5F2EB]">Tradition:</strong> {source.tradition}</div>
                              <div><strong className="text-[#2D2622] dark:text-[#F5F2EB]">Coverage:</strong> {source.totalVerses}</div>
                            </div>
                          </div>

                          {/* Rationale & Verification */}
                          <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] space-y-2.5 shadow-sm">
                            <div className="font-bold text-[#C25E38] dark:text-[#E06D43] text-sm font-serif">
                              Why Included in NityaGeeta
                            </div>
                            <p className="text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                              {source.whyChosen}
                            </p>
                            <div className="pt-2.5 border-t border-[#E8E1D7] dark:border-[#38332E] space-y-1.5 text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-[#5C4F45] dark:text-[#D4C7B8]">Text Authenticity:</span>
                                <span className="font-mono font-bold text-[#C25E38] dark:text-[#E06D43]">{source.authenticityRatio}</span>
                              </div>
                              <p className="text-[10px] text-[#8C7B70] dark:text-[#A89F91]">{source.authenticityDetail}</p>
                            </div>
                          </div>

                          {/* Manuscript Chapters & Key Sections */}
                          {source.chapters && source.chapters.length > 0 && (() => {
                            const displayChapters = (isSearchActive && matchedChapters.length > 0)
                              ? matchedChapters
                              : source.chapters;

                            return (
                              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] space-y-2.5 shadow-sm md:col-span-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#C25E38] dark:text-[#E06D43] text-sm font-serif">
                                    {isSearchActive && matchedChapters.length > 0
                                      ? `Matched Manuscript Chapter (${displayChapters.length} Section)`
                                      : `Manuscript Chapters & Key Sections (${source.chapters.length} Sections)`}
                                  </span>
                                  <span className="text-[11px] font-mono text-[#8C7B70] dark:text-[#A89F91]">
                                    {isSearchActive && matchedChapters.length > 0 ? "Exact Search Match" : "Verified Commentary Index"}
                                  </span>
                                </div>
                                <div className={`grid gap-2 pt-1 ${displayChapters.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                                  {displayChapters.map((ch: any, idx: number) => {
                                    const isMatched = matchedChapters.some((m: any) => m.num === ch.num);
                                    return (
                                      <div
                                        key={idx}
                                        className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between transition-colors ${
                                          isMatched
                                            ? "bg-[#C25E38]/10 dark:bg-[#E06D43]/20 border-[#C25E38] dark:border-[#E06D43]"
                                            : "bg-[#EFE9DF]/50 dark:bg-[#262320]/60 border-[#E8E1D7] dark:border-[#38332E]"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-mono font-bold text-[#C25E38] dark:text-[#E06D43]">
                                            Section / Chapter {ch.num} (pp. {ch.pages})
                                          </span>
                                          {isMatched && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C25E38] dark:bg-[#E06D43] text-white">
                                              MATCHED
                                            </span>
                                          )}
                                        </div>
                                        <div className="font-semibold text-[#2D2622] dark:text-[#F5F2EB] mb-0.5">{ch.title}</div>
                                        <p className="text-[11px] text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                                          {ch.description}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Action Bar (Icon-only with hover tooltip) */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#DFD5C6] dark:border-[#38332E]">
                          <span className="text-xs text-[#6B5E55] dark:text-[#A89F91]">
                            Open and verify the full manuscript edition:
                          </span>
                          <div className="flex items-center gap-2">
                            {source.pdfUrl && (
                              <div className="relative group/tooltip">
                                <button
                                  type="button"
                                  onClick={() => handleOpenPdf(source.pdfUrl, source.title)}
                                  title="Read in-app viewer"
                                  aria-label="Read in-app viewer"
                                  className="w-10 h-10 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition shadow-sm cursor-pointer"
                                >
                                  <BookOpen className="w-4 h-4 shrink-0" />
                                </button>
                                <div className="absolute bottom-full right-0 mb-2 hidden group-hover/tooltip:flex items-center px-2.5 py-1 rounded-lg bg-[#2D2622] dark:bg-[#F5F2EB] text-[#FAF7F2] dark:text-[#1A1816] text-[11px] font-semibold whitespace-nowrap shadow-lg z-30 pointer-events-none transition-all">
                                  Read in-app viewer
                                  <div className="absolute top-full right-3.5 border-4 border-transparent border-t-[#2D2622] dark:border-t-[#F5F2EB]" />
                                </div>
                              </div>
                            )}
                            {source.storeUrl && (
                              <div className="relative group/tooltip">
                                <a
                                  href={source.storeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Official edition link"
                                  aria-label="Official edition link"
                                  className="w-10 h-10 rounded-xl bg-[#EFE9DF] dark:bg-[#332E2A] text-[#C25E38] dark:text-[#E06D43] border border-[#DFD5C6] dark:border-[#38332E] flex items-center justify-center hover:border-[#C25E38]/50 hover:bg-[#FAF7F2] dark:hover:bg-[#201C19] active:scale-95 transition shadow-2xs cursor-pointer"
                                >
                                  <ExternalLink className="w-4 h-4 shrink-0" />
                                </a>
                                <div className="absolute bottom-full right-0 mb-2 hidden group-hover/tooltip:flex items-center px-2.5 py-1 rounded-lg bg-[#2D2622] dark:bg-[#F5F2EB] text-[#FAF7F2] dark:text-[#1A1816] text-[11px] font-semibold whitespace-nowrap shadow-lg z-30 pointer-events-none transition-all">
                                  Official edition link
                                  <div className="absolute top-full right-3.5 border-4 border-transparent border-t-[#2D2622] dark:border-t-[#F5F2EB]" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 2: VEDUCATION LITERATURE */}
        {(activeTab === "all" || activeTab === "veducation") && filteredVeducation.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between border-b border-[#E8E1D7] dark:border-[#38332E] pb-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38] dark:text-[#E06D43]">
                  Vedic Lifestyle & Foundations
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-[#2D2622] dark:text-[#F5F2EB] font-normal mt-0.5">
                  Veducation Knowledge Series
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-[#8C7B70] dark:text-[#A89F91] hidden sm:block">
                {filteredVeducation.length} of {veducationSeries.length} Handbooks Available
              </span>
            </div>

            <div className="space-y-6">
              {filteredVeducation.map((source) => {
                const isExpanded = expandedSourceId === source.id;
                const matchedChapters = getBookMatchedChapters(source);
                const searchMeta = getBookSearchMetadata(source);
                return (
                  <div
                    key={source.id}
                    id={source.id}
                    className="rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedSourceId(isExpanded ? null : source.id)}
                      className="p-6 sm:p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 cursor-pointer group"
                    >
                      <div className="flex items-start sm:items-center gap-5 flex-1">
                        {/* Apple/Linear-Grade Sleek Rank Badge */}
                        <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-[#EFE9DF] dark:bg-[#1E1B18] border border-[#DFD5C6] dark:border-[#3E3832] flex flex-col items-center justify-center shrink-0 shadow-sm group-hover:border-[#C25E38]/50 transition-colors">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#C25E38] dark:text-[#E06D43] leading-none mb-1">
                            {source.tierLabel}
                          </span>
                          <span className="text-xl sm:text-2xl font-serif font-black text-[#2D2622] dark:text-[#F5F2EB] leading-none">
                            0{source.priority}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-[#2D2622] dark:text-[#F5F2EB] font-serif group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition-colors">
                              {source.title}
                            </h3>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43]">
                              {source.metricName}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#C25E38] dark:text-[#E06D43] mb-2">
                            By {source.author} • {source.era}
                          </p>
                          <p className="text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                            {source.desc}
                          </p>
                        </div>
                      </div>

                      {/* Score, Prominent (i) Audit Badge, and Expand Arrow */}
                      <div className="flex flex-col items-start sm:items-end justify-between w-full lg:w-[300px] pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E8E1D7] dark:border-[#38332E] shrink-0 gap-2.5">
                        
                        {/* Score Row with High-Visibility (i) Button */}
                        <div className="flex items-center justify-between w-full text-xs font-semibold">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#2D2622] dark:text-[#F5F2EB] font-bold">Authenticity Score</span>
                            {/* Sleek (i) Info Icon Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveScoringInfo(source.scoringDetails);
                              }}
                              className="p-1 rounded-full text-[#8C7B70] dark:text-[#A89F91] hover:text-[#C25E38] dark:hover:text-[#E06D43] hover:bg-[#C25E38]/10 dark:hover:bg-[#E06D43]/20 transition cursor-pointer"
                              title="View Scoring Audit & Verified Citations"
                              aria-label="View Scoring Audit"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[#C25E38] dark:text-[#E06D43] font-mono font-extrabold text-sm">{source.scoreLabel}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-[#EFE9DF] dark:bg-[#332E2A] overflow-hidden border border-[#DFD5C6] dark:border-[#38332E]">
                          <div
                            style={{ width: `${source.score}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-[#C25E38] to-[#E06D43]"
                          />
                        </div>

                        {/* Tagline and Expand Toggle */}
                        <div className="flex items-center justify-between w-full text-xs pt-1">
                          <span className="font-semibold text-[#5C4F45] dark:text-[#D4C7B8] px-2.5 py-0.5 rounded-md bg-[#EFE9DF] dark:bg-[#332E2A] text-[11px]">
                            {source.tagline}
                          </span>
                          <div className="p-1 rounded-lg text-[#C25E38] dark:text-[#E06D43] hover:bg-[#EFE9DF] dark:hover:bg-[#332E2A]">
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Search Match Metadata Highlight Strip (Full-width, clearly separated, no magic icon!) */}
                    {isSearchActive && searchMeta && (
                      <div className="px-6 sm:px-7 py-3.5 bg-[#FAF3EC] dark:bg-[#2A231E] border-t border-[#DFD5C6] dark:border-[#38332E] text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                          <span className="font-bold text-[#C25E38] dark:text-[#E06D43] tracking-wide">
                            {searchMeta.chapterLabel}
                          </span>
                          <span className="font-bold text-[#2D2622] dark:text-[#F5F2EB] font-serif text-[13px]">
                            {searchMeta.chapterTitles}
                          </span>
                        </div>
                        <p className="text-[#5C4F45] dark:text-[#D4C7B8] mt-1 leading-relaxed text-[12px]">
                          {searchMeta.summary}
                        </p>
                      </div>
                    )}

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="px-6 pb-7 pt-4 border-t border-[#E8E1D7] dark:border-[#38332E] bg-[#EFE9DF]/40 dark:bg-[#2A2521]/60 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-xs">
                          {/* Comprehensive Edition Overview & Why Included (Omitted for 5-in-1 pack since bundle books detail each component) */}
                          {!source.bundleBooks && (
                            <>
                              {/* Comprehensive Edition Overview */}
                              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] space-y-2.5 shadow-sm">
                                <div className="font-bold text-[#C25E38] dark:text-[#E06D43] text-sm font-serif">
                                  Comprehensive Edition Overview
                                </div>
                                <p className="text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                                  {source.summary}
                                </p>
                                <div className="pt-2.5 border-t border-[#E8E1D7] dark:border-[#38332E] text-[11px] text-[#8C7B70] dark:text-[#A89F91] space-y-1">
                                  <div><strong className="text-[#2D2622] dark:text-[#F5F2EB]">Tradition:</strong> {source.tradition}</div>
                                  <div><strong className="text-[#2D2622] dark:text-[#F5F2EB]">Coverage:</strong> {source.totalVerses}</div>
                                </div>
                              </div>

                              {/* Rationale & Verification */}
                              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] space-y-2.5 shadow-sm">
                                <div className="font-bold text-[#C25E38] dark:text-[#E06D43] text-sm font-serif">
                                  Why Included in NityaGeeta
                                </div>
                                <p className="text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                                  {source.whyChosen}
                                </p>
                                <div className="pt-2.5 border-t border-[#E8E1D7] dark:border-[#38332E] space-y-1.5 text-[11px]">
                                  <div className="flex justify-between">
                                    <span className="text-[#5C4F45] dark:text-[#D4C7B8]">Text Authenticity:</span>
                                    <span className="font-mono font-bold text-[#C25E38] dark:text-[#E06D43]">{source.authenticityRatio}</span>
                                  </div>
                                  <p className="text-[10px] text-[#8C7B70] dark:text-[#A89F91]">{source.authenticityDetail}</p>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Beta Translation Notice */}
                          {source.translationNotice && (
                            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] space-y-3 shadow-sm md:col-span-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                  <span className="font-bold text-[#C25E38] dark:text-[#E06D43] text-sm font-serif">
                                    Manuscript Status &amp; Indexing
                                  </span>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                  {source.translationNotice.badge}
                                </span>
                              </div>
                              <div className="p-3 rounded-lg bg-[#EFE9DF]/60 dark:bg-[#262320]/60 border border-[#E8E1D7] dark:border-[#38332E] flex items-start gap-3">
                                <Languages className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43] shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-[#2D2622] dark:text-[#F5F2EB]">
                                    {source.translationNotice.message}
                                  </p>
                                  <p className="text-[11px] text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                                    {source.translationNotice.subtext}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 5 in 1 Master Pack: Included Books */}
                          {source.bundleBooks && source.bundleBooks.length > 0 && (
                            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] space-y-3 shadow-sm md:col-span-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-[#C25E38] dark:text-[#E06D43] text-sm font-serif">
                                    Included Books in 5 in 1 Master Pack
                                  </span>
                                  <p className="text-[11px] text-[#6B5E55] dark:text-[#A89F91]">
                                    Complete Veducation B.O.S.S Trilogy Set Special Offer (3 Master Books + 2 Surprise Gifts)
                                  </p>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C25E38]/10 text-[#C25E38] dark:text-[#E06D43] border border-[#C25E38]/30">
                                  Complete Collector&apos;s Set
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                {source.bundleBooks.map((item: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="p-3 rounded-lg bg-[#EFE9DF]/50 dark:bg-[#262320]/60 border border-[#E8E1D7] dark:border-[#38332E] flex flex-col justify-between"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <div className="font-bold text-xs sm:text-sm text-[#2D2622] dark:text-[#F5F2EB] font-serif">
                                          {item.title}
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          {item.tag && (
                                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#C25E38]/10 text-[#C25E38] dark:text-[#E06D43] font-medium">
                                              {item.tag}
                                            </span>
                                          )}
                                          {item.mrp && (
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                              {item.mrp}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-[11px] text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                                        {item.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Book Chapters & Topical Breakdown */}
                          {source.chapters && source.chapters.length > 0 && (() => {
                            const displayChapters = (isSearchActive && matchedChapters.length > 0)
                              ? matchedChapters
                              : source.chapters;

                            return (
                              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] space-y-2.5 shadow-sm md:col-span-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#C25E38] dark:text-[#E06D43] text-sm font-serif">
                                    {isSearchActive && matchedChapters.length > 0
                                      ? `Matched Book Chapter (${displayChapters.length} Section)`
                                      : `Book Chapters & Topical Breakdown (${source.chapters.length} Sections)`}
                                  </span>
                                  <span className="text-[11px] font-mono text-[#8C7B70] dark:text-[#A89F91]">
                                    {isSearchActive && matchedChapters.length > 0 ? "Exact Search Match" : "From Verified OCR Dataset"}
                                  </span>
                                </div>
                                <div className={`grid gap-2 pt-1 ${displayChapters.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                                  {displayChapters.map((ch: any, idx: number) => {
                                    const isMatched = matchedChapters.some((m: any) => m.num === ch.num);
                                    return (
                                      <div
                                        key={idx}
                                        className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between transition-colors ${
                                          isMatched
                                            ? "bg-[#C25E38]/10 dark:bg-[#E06D43]/20 border-[#C25E38] dark:border-[#E06D43]"
                                            : "bg-[#EFE9DF]/50 dark:bg-[#262320]/60 border-[#E8E1D7] dark:border-[#38332E]"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-mono font-bold text-[#C25E38] dark:text-[#E06D43]">
                                            Section / Chapter {ch.num} (pp. {ch.pages})
                                          </span>
                                          {isMatched && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C25E38] dark:bg-[#E06D43] text-white">
                                              MATCHED
                                            </span>
                                          )}
                                        </div>
                                        <div className="font-semibold text-[#2D2622] dark:text-[#F5F2EB] mb-0.5">{ch.title}</div>
                                        <p className="text-[11px] text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                                          {ch.description}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Action Bar (Icon-only with hover tooltips) */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#DFD5C6] dark:border-[#38332E]">
                          <span className="text-xs text-[#6B5E55] dark:text-[#A89F91]">
                            Open and verify this publication:
                          </span>
                          <div className="flex items-center gap-2">
                            {source.pdfUrl && (
                              <div className="relative group/tooltip">
                                <button
                                  type="button"
                                  onClick={() => handleOpenPdf(source.pdfUrl, source.title)}
                                  title="Read in-app viewer"
                                  aria-label="Read in-app viewer"
                                  className="w-10 h-10 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition shadow-sm cursor-pointer"
                                >
                                  <BookOpen className="w-4 h-4 shrink-0" />
                                </button>
                                <div className="absolute bottom-full right-0 mb-2 hidden group-hover/tooltip:flex items-center px-2.5 py-1 rounded-lg bg-[#2D2622] dark:bg-[#F5F2EB] text-[#FAF7F2] dark:text-[#1A1816] text-[11px] font-semibold whitespace-nowrap shadow-lg z-30 pointer-events-none transition-all">
                                  Read in-app viewer
                                  <div className="absolute top-full right-3.5 border-4 border-transparent border-t-[#2D2622] dark:border-t-[#F5F2EB]" />
                                </div>
                              </div>
                            )}
                            {source.storeUrl && (
                              <div className="relative group/tooltip">
                                <a
                                  href={source.storeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Official edition link"
                                  aria-label="Official edition link"
                                  className="w-10 h-10 rounded-xl bg-[#EFE9DF] dark:bg-[#332E2A] text-[#C25E38] dark:text-[#E06D43] border border-[#DFD5C6] dark:border-[#38332E] flex items-center justify-center hover:border-[#C25E38]/50 hover:bg-[#FAF7F2] dark:hover:bg-[#201C19] active:scale-95 transition shadow-2xs cursor-pointer"
                                >
                                  <ExternalLink className="w-4 h-4 shrink-0" />
                                </a>
                                <div className="absolute bottom-full right-0 mb-2 hidden group-hover/tooltip:flex items-center px-2.5 py-1 rounded-lg bg-[#2D2622] dark:bg-[#F5F2EB] text-[#FAF7F2] dark:text-[#1A1816] text-[11px] font-semibold whitespace-nowrap shadow-lg z-30 pointer-events-none transition-all">
                                  Official edition link
                                  <div className="absolute top-full right-3.5 border-4 border-transparent border-t-[#2D2622] dark:border-t-[#F5F2EB]" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 3: 18 CHAPTERS THEMATIC INDEX */}
        {(activeTab === "all" || activeTab === "chapters") && filteredChapters.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between border-b border-[#E8E1D7] dark:border-[#38332E] pb-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38] dark:text-[#E06D43]">
                  Complete Canonical Structure
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-[#2D2622] dark:text-[#F5F2EB] font-normal mt-0.5">
                  18 Chapters Thematic Index (700 Verses)
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-[#8C7B70] dark:text-[#A89F91] hidden sm:block">
                {filteredChapters.length} of 18 Chapters
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChapters.map((ch) => (
                <div
                  key={ch.num}
                  onClick={() => router.push(`/dilemmas?chapter=${ch.num}`)}
                  className="group/chapter p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] hover:border-[#C25E38]/50 dark:hover:border-[#E06D43]/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#EFE9DF] dark:bg-[#1E1B18] text-[#C25E38] dark:text-[#E06D43] border border-[#DFD5C6] dark:border-[#3E3832] group-hover/chapter:border-[#C25E38]/40 transition-colors">
                        Chapter {ch.num < 10 ? `0${ch.num}` : ch.num}
                      </span>
                      <span className="text-[11px] font-mono text-[#8C7B70] dark:text-[#A89F91]">
                        {ch.verses} Verses
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] mb-0.5 group-hover/chapter:text-[#C25E38] dark:group-hover/chapter:text-[#E06D43] transition-colors">
                      {ch.name}
                    </h3>
                    <div className="text-xs text-[#C25E38] dark:text-[#E06D43] font-serif mb-2">
                      {ch.devanagari}
                    </div>
                    <p className="text-xs font-semibold text-[#2D2622] dark:text-[#F5F2EB] mb-1">
                      {ch.theme}
                    </p>
                    <p className="text-xs text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                      {ch.focus}
                    </p>
                  </div>

                  {/* Direct Link to Chapter Dilemmas & Detailed Verses */}
                  <div className="pt-4 mt-4 border-t border-[#E8E1D7] dark:border-[#38332E]">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C25E38] dark:text-[#E06D43]">
                      <span>Explore Chapter {ch.num} Verses & Dilemmas</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/chapter:translate-x-1.5 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 4: EDITORIAL VETTING & AUTHENTICITY CRITERIA */}
        {((activeTab === "all" && !isSearchActive) || activeTab === "vetting") && (
          <section className="mb-20">
            <div className="border-b border-[#E8E1D7] dark:border-[#38332E] pb-4 mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38] dark:text-[#E06D43]">
                Editorial Integrity
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#2D2622] dark:text-[#F5F2EB] font-normal mt-0.5">
                NityaGeeta 4-Pillar Source Vetting Methodology
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] hover:border-[#C25E38]/50 dark:hover:border-[#E06D43]/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center font-bold mb-4">
                  1
                </div>
                <h3 className="text-base font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] mb-2">
                  Manuscript Fidelity
                </h3>
                <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                  Only unaltered Devanagari Sanskrit verses from canonical 1923 Gita Press Gorakhpur manuscripts are admitted into the RAM index.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] hover:border-[#C25E38]/50 dark:hover:border-[#E06D43]/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center font-bold mb-4">
                  2
                </div>
                <h3 className="text-base font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] mb-2">
                  Grammatical Precision
                </h3>
                <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                  Interlinear word-by-word parsing benchmarked against SUNY Press Winthrop Sargeant ensures zero translation drift or ambiguity.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] hover:border-[#C25E38]/50 dark:hover:border-[#E06D43]/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center font-bold mb-4">
                  3
                </div>
                <h3 className="text-base font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] mb-2">
                  Zero Sectarian Bias
                </h3>
                <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                  Commentaries are synthesized across Advaita (Shankaracharya), Vishishtadvaita (Ramanuja), and practical Karma Yoga (Sadhaka-Sanjivani).
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] hover:border-[#C25E38]/50 dark:hover:border-[#E06D43]/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center font-bold mb-4">
                  4
                </div>
                <h3 className="text-base font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] mb-2">
                  Parampara Authority
                </h3>
                <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                  NityaGeeta strictly excludes unverified modern internet paraphrases or speculative self-help editions that distort the Gita&apos;s sacred core.
                </p>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Interactive Authenticity Scoring Audit Modal - Harmonious Medium Proportions & Direct Source Links */}
      {mounted && createPortal(
        <AnimatePresence>
          {activeScoringInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-10"
              onClick={() => setActiveScoringInfo(null)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#FAF7F2] dark:bg-[#201C19] border border-[#DFD5C6] dark:border-[#38332E] rounded-3xl w-[94vw] max-w-5xl max-h-[88vh] shadow-2xl font-sans relative flex flex-col overflow-hidden"
              >
                {/* Balanced & Refined Top Header */}
                <div className="px-7 py-5 flex items-center justify-between border-b border-[#E8E1D7] dark:border-[#38332E] shrink-0 bg-[#FAF7F2] dark:bg-[#201C19]">
                  <div className="flex items-center gap-3.5 pr-6 truncate">
                    <div className="w-10 h-10 rounded-2xl bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center font-bold shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB] truncate">
                      {activeScoringInfo.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => setActiveScoringInfo(null)}
                    className="p-2 rounded-xl text-[#8C7B70] dark:text-[#A89F91] hover:text-[#C25E38] dark:hover:text-[#E06D43] hover:bg-[#EFE9DF] dark:hover:bg-[#332E2A] transition cursor-pointer shrink-0"
                    aria-label="Close Audit"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body (Scrolls cleanly inside container without clipping borders) */}
                <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-5 text-xs text-[#5C4F45] dark:text-[#D4C7B8]">
                  {/* Score Highlight Hero Card */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[#EFE9DF] dark:bg-[#181513] border border-[#DFD5C6] dark:border-[#38332E] shadow-sm">
                    <div>
                      <div className="text-[11px] font-semibold text-[#8C7B70] dark:text-[#A89F91]">
                        Metric Classification & Benchmark Tier
                      </div>
                      <div className="text-sm sm:text-base font-bold text-[#2D2622] dark:text-[#F5F2EB] mt-0.5">
                        {activeScoringInfo.metricName}
                      </div>
                      <span className="inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43]">
                        {activeScoringInfo.tierTag}
                      </span>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <div className="text-[11px] font-semibold text-[#8C7B70] dark:text-[#A89F91]">
                        Overall Audit Score
                      </div>
                      <div className="text-3xl font-mono font-black text-[#C25E38] dark:text-[#E06D43]">
                        {activeScoringInfo.scoreLabel}
                      </div>
                      <div className="text-[10px] text-[#8C7B70] dark:text-[#A89F91] font-sans">
                        Peer-Verified Consensus
                      </div>
                    </div>
                  </div>

                  {/* Two-Column Wide Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left Column (6 Cols) */}
                    <div className="lg:col-span-6 space-y-4">
                      <div>
                        <h4 className="font-bold text-sm text-[#2D2622] dark:text-[#F5F2EB] mb-2 font-serif flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                          Why Does This Edition Receive This Exact Score?
                        </h4>
                        <p className="leading-relaxed bg-[#FAF7F2] dark:bg-[#181513] p-4 rounded-2xl border border-[#E8E1D7] dark:border-[#38332E]">
                          {activeScoringInfo.whyScored}
                        </p>
                      </div>

                      {/* 3-Pillar Weight Breakdown */}
                      <div>
                        <h4 className="font-bold text-sm text-[#2D2622] dark:text-[#F5F2EB] mb-2 font-serif">
                          3-Pillar Scoring Weight Breakdown:
                        </h4>
                        <div className="space-y-2">
                          <div className="p-3 rounded-xl bg-[#EFE9DF]/80 dark:bg-[#181513] border border-[#DFD5C6] dark:border-[#38332E]">
                            <div className="flex items-center justify-between font-bold text-[#C25E38] dark:text-[#E06D43] mb-1">
                              <span>Text Fidelity (40% Weight)</span>
                              <span className="font-mono">{activeScoringInfo.breakdown.fidelityScore}/40</span>
                            </div>
                            <div className="text-[11px] text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                              {activeScoringInfo.breakdown.fidelity}
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-[#EFE9DF]/80 dark:bg-[#181513] border border-[#DFD5C6] dark:border-[#38332E]">
                            <div className="flex items-center justify-between font-bold text-[#C25E38] dark:text-[#E06D43] mb-1">
                              <span>Context Rigor (30% Weight)</span>
                              <span className="font-mono">{activeScoringInfo.breakdown.rigorScore}/30</span>
                            </div>
                            <div className="text-[11px] text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                              {activeScoringInfo.breakdown.rigor}
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-[#EFE9DF]/80 dark:bg-[#181513] border border-[#DFD5C6] dark:border-[#38332E]">
                            <div className="flex items-center justify-between font-bold text-[#C25E38] dark:text-[#E06D43] mb-1">
                              <span>Authority (30% Weight)</span>
                              <span className="font-mono">{activeScoringInfo.breakdown.authorityScore}/30</span>
                            </div>
                            <div className="text-[11px] text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                              {activeScoringInfo.breakdown.authority}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (6 Cols) - Clickable Deep URLs to Specific Source Records */}
                    <div className="lg:col-span-6 space-y-4">
                      <div>
                        <h4 className="font-bold text-sm text-[#2D2622] dark:text-[#F5F2EB] mb-2 font-serif flex items-center gap-1.5">
                          <Library className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                          Comparative Benchmark Across Library
                        </h4>
                        <p className="leading-relaxed bg-[#FAF7F2] dark:bg-[#181513] p-4 rounded-2xl border border-[#E8E1D7] dark:border-[#38332E]">
                          {activeScoringInfo.comparisonWithOthers}
                        </p>
                      </div>

                      {/* Deep Clickable Verified Source Records & Third-Party Proof */}
                      {activeScoringInfo.supportingResources && activeScoringInfo.supportingResources.length > 0 && (
                        <div>
                          <h4 className="font-bold text-sm text-[#2D2622] dark:text-[#F5F2EB] mb-2 font-serif flex items-center gap-1.5">
                            <BookMarked className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                            Supporting Scholarly Proof & Authentic Citations:
                          </h4>
                          <div className="space-y-2.5">
                            {activeScoringInfo.supportingResources.map((res, idx) => (
                              <a
                                key={idx}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#181513] border border-[#E8E1D7] dark:border-[#38332E] hover:border-[#C25E38] dark:hover:border-[#E06D43] transition-all group shadow-sm hover:shadow-md cursor-pointer"
                              >
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <div className="font-bold text-[#2D2622] dark:text-[#F5F2EB] text-xs group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition-colors flex items-center gap-1.5">
                                    {res.type === "news" && <Newspaper className="w-3.5 h-3.5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />}
                                    {res.type === "forum" && <MessageSquare className="w-3.5 h-3.5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />}
                                    {res.type === "academic" && <GraduationCap className="w-3.5 h-3.5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />}
                                    {res.type === "archive" && <Globe className="w-3.5 h-3.5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />}
                                    <span>{res.name}</span>
                                  </div>
                                  <ExternalLink className="w-3.5 h-3.5 text-[#8C7B70] dark:text-[#A89F91] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition-colors shrink-0" />
                                </div>
                                <div className="text-[11px] text-[#C25E38] dark:text-[#E06D43] font-semibold mb-1">
                                  {res.institution}
                                </div>
                                <div className="text-[11px] text-[#8C7B70] dark:text-[#A89F91] leading-relaxed mb-2">
                                  {res.detail}
                                </div>
                                <div className="inline-flex items-center gap-1 text-[10px] font-mono text-[#C25E38] dark:text-[#E06D43] group-hover:underline">
                                  <span>Verify Authenticity Record</span>
                                  <ChevronRight className="w-3 h-3" />
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Embedded In-App PDF Reader Modal - Theme-Aware Header & Browser-Native Reader */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedPdfUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6"
              onClick={() => setSelectedPdfUrl(null)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
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
                    {/* Theme-Adaptive Icon-Only Close Button */}
                    <button
                      onClick={() => setSelectedPdfUrl(null)}
                      className="p-1.5 sm:p-2 rounded-xl bg-[#EFE9DF] dark:bg-white/10 hover:bg-[#C25E38] dark:hover:bg-[#E06D43] text-[#2D2622] dark:text-white hover:text-white transition cursor-pointer flex items-center justify-center"
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

      {/* Universal Global Footer */}
      <Footer />
    </div>
  );
}
