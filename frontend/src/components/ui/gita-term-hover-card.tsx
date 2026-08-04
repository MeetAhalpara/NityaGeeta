"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

// ── Term dictionary ───────────────────────────────────────────────────────────
export interface GitaTerm {
  term: string;
  variants: string[];
  meaning: string;
  description: string;
  chapter?: string;
}

export const GITA_TERMS: GitaTerm[] = [
  {
    term: "Dharma",
    variants: ["dharma", "Dharma"],
    meaning: "One's eternal inner nature and duty",
    description:
      "Dharma is that which is inseparably present with a thing — its essential nature. Fire's Dharma is heat; sugar's Dharma is sweetness. The Dharma of a living being is service — it is impossible to not be serving something. The Gita teaches: follow your own Dharma, even imperfectly, rather than another's path.",
    chapter: "Chapter 3, Verse 35",
  },
  {
    term: "Karma",
    variants: ["karma", "Karma"],
    meaning: "Action, and the law of consequence",
    description:
      "Every action — even a thought — is Karma and produces a consequence. Three kinds: Karma (prescribed duties that bind through enjoyment), Vikarma (forbidden acts that bind through suffering), and Akarma (action offered to God — creates no bondage). 'You have a right to perform your duty, but not to the fruits of action.' (Gita 2.47)",
    chapter: "Chapter 2, Verse 47",
  },
  {
    term: "Atman",
    variants: ["atman", "Atman", "Ātman", "atma", "Atma"],
    meaning: "The eternal, indestructible spirit soul",
    description:
      "You are not this body — you are the eternal spirit soul sitting inside it like a driver in a vehicle. The soul cannot be cut by weapons, burned by fire, wetted by water, or dried by wind. 'Aham Brahmasmi' — I am an eternal spirit soul.",
    chapter: "Chapter 2, Verse 23",
  },
  {
    term: "Brahman",
    variants: ["brahman", "Brahman"],
    meaning: "The ultimate, infinite reality",
    description:
      "Brahman is the absolute ground of all existence — from whom everything originates, in whom everything is sustained, and into whom everything dissolves (Vedanta Sutra 1.1.2). The spiritual world is a manifestation of His internal energy: Sat (eternal), Chit (conscious) and Ananda (blissful).",
    chapter: "Chapter 13, Verse 12",
  },
  {
    term: "Yoga",
    variants: ["yoga", "Yoga"],
    meaning: "The spiritual process of uniting the soul with God",
    description:
      "Yoga is derived from 'Yuj' — to unite, to link, to join. It is not exercise on a mat. Yoga is the process of linking the soul with the Supersoul, with God. Five major systems: Ashtanga Yoga, Dhyana Yoga, Karma Yoga, Gyana Yoga, and Bhakti Yoga. Requires: enthusiasm, patience, determination, courage and solitude.",
    chapter: "Bhagavad Gita",
  },
  {
    term: "Karma Yoga",
    variants: ["karma yoga", "Karma Yoga", "karmayoga", "Karmayoga"],
    meaning: "Connecting to God by performing duty without attachment",
    description:
      "Karma Yoga means performing prescribed duties for God's satisfaction, without attachment to results. Both Karma and Vikarma bind the soul to this world. Only Akarma — action offered entirely to God — creates no bondage. (Gita 3.9)",
    chapter: "Chapter 3, Verse 9",
  },
  {
    term: "Bhakti",
    variants: ["bhakti", "Bhakti"],
    meaning: "Loving devotional service to God",
    description:
      "Bhakti Yoga is the art of doing everything for God — offering your mind, intelligence, words and every action to His service. It is the total sum and final step of all Yoga systems. 'One can understand Me only by devotional service.' (Gita 18.55)",
    chapter: "Chapter 12, Verse 2",
  },
  {
    term: "Jnana",
    variants: ["jnana", "Jnana", "gyana", "Gyana", "gyan", "Gyan"],
    meaning: "Realised wisdom — knowing God through understanding",
    description:
      "Gyana Yoga connects to God through philosophical inquiry and study. Dedicating mind and intelligence to know God is one valid path, through which one generally reaches the impersonal Brahman realisation. All Darshan Shastras are built on this process.",
    chapter: "Chapter 4, Verse 38",
  },
  {
    term: "Maya",
    variants: ["maya", "Maya"],
    meaning: "Cosmic illusion — 'that which is not'",
    description:
      "Maya is God's external energy that keeps us in the illusion that material happiness is just one step away. But all that is temporary (Asat). Maya Devi is Goddess Durga herself — a teacher and mother, ensuring only purified souls cross this ocean of material existence.",
    chapter: "Chapter 7, Verse 14",
  },
  {
    term: "Moksha",
    variants: ["moksha", "Moksha", "mukti", "Mukti"],
    meaning: "Liberation — freedom from the cycle of birth and death",
    description:
      "Moksha is the ultimate goal of human life — escaping the endless cycle of birth, death, old age and disease. It is not a place but a state: returning to one's eternal spiritual form (Sat-Chit-Ananda). Only in Bharat Varsha (earth) can one perform Karma or Tapas to attain Moksha — even demigods desire birth here.",
    chapter: "Chapter 18, Verse 66",
  },
  {
    term: "Samsara",
    variants: ["samsara", "Samsara"],
    meaning: "The endless cycle of birth, death and rebirth",
    description:
      "Both good Karma and bad Karma keep us in Samsara — one binds like gold chains, the other like iron chains. Both are chains. The soul shapes its subtle body (mind, intelligence, ego) through desires across lifetimes, receiving bodies accordingly. Only Akarma ends the cycle.",
  },
  {
    term: "Gunas",
    variants: ["gunas", "Gunas", "guna", "Guna"],
    meaning: "The three qualities (modes) of material nature",
    description:
      "All material existence is woven from three modes: Sattva (goodness — clarity, peace), Rajas (passion — desire, activity), and Tamas (ignorance — inertia, delusion). These control all actions and reactions. Controlled cosmically by Vishnu (Sattva), Brahma (Rajas) and Shiva (Tamas).",
    chapter: "Chapter 14, Verse 5",
  },
  {
    term: "Sattva",
    variants: ["sattva", "Sattva", "sattvic", "Sattvic"],
    meaning: "The mode of goodness — clarity, purity and harmony",
    description:
      "In Sattva, we feel happiness, knowledge, gratitude and satisfaction. Sattvic people are free from egotism, endowed with enthusiasm and determination, equipoised in success and failure (Gita 18.26). Cultivate Sattva through pure diet, honest work, meditation and devotion.",
    chapter: "Chapter 14, Verse 6",
  },
  {
    term: "Rajas",
    variants: ["rajas", "Rajas", "rajasic", "Rajasic"],
    meaning: "The mode of passion — desire and restless activity",
    description:
      "In Rajas, we feel unending desires, attachment, dissatisfaction and rage. Rajasik people crave the fruits of work, are covetous and constantly moved by joy and sorrow (Gita 18.27). In balance Rajas fuels righteous action; in excess it breeds greed and conflict.",
    chapter: "Chapter 14, Verse 7",
  },
  {
    term: "Tamas",
    variants: ["tamas", "Tamas", "tamasic", "Tamasic"],
    meaning: "The mode of ignorance — inertia and darkness",
    description:
      "In Tamas, we feel laziness, madness, indolence and delusion, covering our knowledge. Tamasic people are undisciplined, stubborn, slothful, despondent and procrastinating (Gita 18.28). Overcome Tamas by cultivating Rajas first, then elevating to Sattva.",
    chapter: "Chapter 14, Verse 8",
  },
  {
    term: "Ahimsa",
    variants: ["ahimsa", "Ahimsa"],
    meaning: "Non-violence — in thought, word and deed",
    description:
      "Ahimsa is the first of the 10 Yamas in Ashtanga Yoga: do not injure, do not harm by action, do not hurt by words or thought — not even in dreams. Let go of fear and insecurity, which are the sources of abuse.",
    chapter: "Chapter 16, Verse 2",
  },
  {
    term: "Equanimity",
    variants: ["equanimity"],
    meaning: "Samatvam — steady balance in all circumstances",
    description:
      "Samatvam (equanimity) is the very definition of Yoga: remaining balanced in success and failure, pleasure and pain, praise and criticism. The Gita calls this the mark of a wise person.",
    chapter: "Chapter 2, Verse 48",
  },
  {
    term: "Nishkama Karma",
    variants: ["nishkama karma", "Nishkama Karma", "nishkama", "Nishkama"],
    meaning: "Desireless action — acting without craving results",
    description:
      "Actions performed without any expectation for results. Only non-attachment makes it possible. Such actions create no bondage and put one on the path to liberation. As Draupadi tore her sari to help Krishna — selfless action always bears fruit beyond expectation.",
    chapter: "Chapter 2, Verse 47",
  },
  {
    term: "Samadhi",
    variants: ["samadhi", "Samadhi"],
    meaning: "The final stage of Ashtanga Yoga — union with the divine",
    description:
      "Samadhi is when the Yogi achieves perfection of Dhyana for sustained periods, gradually dissolves bodily identity, and can travel consciousness to higher dimensions. Three types: Sahaja (temporary), Maha (permanent — leaving the body), and Bhava (leaving in highest devotional ecstasy, as with Mirabai).",
  },
  {
    term: "Dhyana",
    variants: ["dhyana", "Dhyana"],
    meaning: "Deep contemplative meditation",
    description:
      "The 7th limb of Ashtanga Yoga — uninterrupted, focused contemplation. In Dhyana on a deity, there is only the continuous stream of thought about that deity, uninterrupted by any other thought. One of the four ways Lord Krishna teaches to attain perfection.",
  },
  {
    term: "Viveka",
    variants: ["viveka", "Viveka"],
    meaning: "Discernment — discriminating the real from the unreal",
    description:
      "The ability to tell the eternal (Atman, Brahman) from the temporary (body, world, possessions). The first and most essential spiritual faculty. Without Viveka, wisdom cannot take root.",
  },
  {
    term: "Vairagya",
    variants: ["vairagya", "Vairagya"],
    meaning: "Dispassion — freedom from attachment",
    description:
      "Clear-eyed detachment from temporary material pleasures. Vairagya grows as Viveka deepens. It is not coldness — it is the freedom of a heart that can love fully without clinging.",
  },
  {
    term: "Prakriti",
    variants: ["prakriti", "Prakriti"],
    meaning: "Material nature — God's external energy",
    description:
      "Prakriti is everything in the material world: body, mind, emotions, the physical universe. Made of five gross elements (earth, water, fire, air, ether) and three subtle elements (mind, intelligence, false ego). Asat (temporary), Achit (non-conscious) and Nirananda (devoid of bliss).",
    chapter: "Chapter 13, Verse 19",
  },
  {
    term: "Purusha",
    variants: ["purusha", "Purusha"],
    meaning: "Pure consciousness — the eternal witnessing Self",
    description:
      "Consciousness itself — unchanging, eternal, the witness of all that Prakriti does. Suffering arises when the soul mistakes itself for Prakriti. Realising yourself as Purusha — the observer, not the observed — is the heart of the Gita's liberating wisdom.",
    chapter: "Chapter 13, Verse 19",
  },
  {
    term: "Bhagavan",
    variants: ["bhagavan", "Bhagavan", "Bhagwan", "bhagwan"],
    meaning: "The Supreme Personality of Godhead",
    description:
      "Defined as the one full in six opulences: Strength, Fame, Wealth, Knowledge, Beauty and Renunciation — all in full measure. Despite possessing everything, He accepts even a leaf, a flower or a drop of water offered with sincere love. 'He is the ultimate well-wisher of every living being.' (Gita 5.29)",
    chapter: "Chapter 5, Verse 29",
  },
  {
    term: "Parmatma",
    variants: ["parmatma", "Parmatma", "paramatma", "Paramatma"],
    meaning: "The Supersoul — God present in every heart",
    description:
      "Parmatma resides in the heart of every living entity, approximately the size of a thumb. He witnesses everything — every thought, every action. Yogis who meditate for thousands of years can perceive this form.",
    chapter: "Chapter 18, Verse 61",
  },
  {
    term: "Krishna",
    variants: ["Krishna", "Krsna", "Kṛṣṇa"],
    meaning: "The Supreme Personality of Godhead — 8th avatar of Vishnu",
    description:
      "The divine teacher who delivered the Bhagavad Gita to Arjuna on the battlefield of Kurukshetra. He is the 8th avatar in the Dashavatar list, appearing in the 28th Dwapara Yuga. He is the source of all Avatars. 'One can understand Me only by devotional service.' (Gita 18.55)",
    chapter: "Chapter 18, Verse 55",
  },
  {
    term: "Arjuna",
    variants: ["Arjuna", "arjuna"],
    meaning: "The warrior who receives the Gita's wisdom",
    description:
      "The great Pandava warrior who, overwhelmed by grief and confusion at Kurukshetra, turns to Krishna for guidance. Arjuna represents every human being who faces a crisis between duty and attachment.",
  },
  {
    term: "Sanatan Dharma",
    variants: ["sanatan dharma", "Sanatan Dharma", "sanatana dharma", "Sanatana Dharma"],
    meaning: "The eternal constitutional system of life",
    description:
      "The complete system of duties, rules and spiritual processes designed by God for every living entity — to fulfil material desires harmoniously while advancing spiritually toward God. Not a religion; the eternal way of life (Sanatan = eternal, Sanskriti = culture).",
  },
];

// ── Lookup map ────────────────────────────────────────────────────────────────
const TERM_MAP = new Map<string, GitaTerm>();
for (const entry of GITA_TERMS) {
  for (const v of entry.variants) {
    TERM_MAP.set(v.toLowerCase(), entry);
  }
}

const ALL_VARIANTS = Array.from(TERM_MAP.keys()).sort((a, b) => b.length - a.length);
export const GITA_TERM_REGEX = new RegExp(
  `\\b(${ALL_VARIANTS.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "gi"
);

// ── Zero-dependency hover card ────────────────────────────────────────────────
interface GitaTermHoverCardProps {
  word: string;
  entry: GitaTerm;
}

export function GitaTermHoverCard({ word, entry }: GitaTermHoverCardProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<"top" | "bottom">("top");
  const triggerRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine whether to show card above or below trigger
  const calcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos(rect.top > 220 ? "top" : "bottom");
  }, []);

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    calcPos();
    setVisible(true);
  };

  const hide = () => {
    timerRef.current = setTimeout(() => setVisible(false), 120);
  };

  const keepOpen = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <span className="relative inline-block">
      {/* Trigger */}
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="cursor-help border-b border-dashed border-[#C25E38]/50 dark:border-[#E06D43]/50 text-[#C25E38] dark:text-[#E06D43] font-medium transition-colors hover:border-[#C25E38] dark:hover:border-[#E06D43]"
        aria-label={`${word} — ${entry.meaning}`}
        tabIndex={0}
      >
        {word.charAt(0).toUpperCase() + word.slice(1)}
      </span>

      {/* Card */}
      {visible && (
        <div
          ref={cardRef}
          onMouseEnter={keepOpen}
          onMouseLeave={hide}
          role="tooltip"
          className={`
            absolute z-50 w-72 rounded-xl p-4 shadow-xl
            bg-[#FAF6EF] dark:bg-[#1E1B18]
            border border-[#E6DDD0] dark:border-[#2D2825]
            left-1/2 -translate-x-1/2
            animate-fade-in-up
            ${pos === "top" ? "bottom-full mb-2" : "top-full mt-2"}
          `}
          style={{ animation: "gitaCardIn 0.15s ease-out" }}
        >
          {/* Arrow */}
          <div
            className={`
              absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45
              bg-[#FAF6EF] dark:bg-[#1E1B18]
              border-[#E6DDD0] dark:border-[#2D2825]
              ${pos === "top"
                ? "bottom-[-5px] border-b border-r"
                : "top-[-5px] border-t border-l"}
            `}
          />

          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span
                className="text-base font-bold text-[#C25E38] dark:text-[#E06D43] leading-tight block"
                style={{ fontFamily: '"Cinzel", "Georgia", serif' }}
              >
                {entry.term}
              </span>
              <span className="text-xs text-[#8C7B70] dark:text-[#A89F91] mt-0.5 font-medium italic block">
                {entry.meaning}
              </span>
            </div>
            <span className="text-[#C25E38]/30 dark:text-[#E06D43]/30 text-2xl select-none shrink-0">
              ॐ
            </span>
          </div>

          <div className="w-full h-px bg-[#E6DDD0] dark:bg-[#2D2825] mb-3" />

          <span className="text-xs text-[#4A3E37] dark:text-[#D4C7B8] leading-relaxed font-sans block">
            {entry.description}
          </span>

          {entry.chapter && (
            <span className="mt-2.5 text-[11px] font-mono text-[#C25E38]/70 dark:text-[#E06D43]/70 uppercase tracking-wide block">
              — {entry.chapter}
            </span>
          )}
        </div>
      )}

      <style>{`
        @keyframes gitaCardIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);   }
        }
      `}</style>
    </span>
  );
}

// ── Text segmenter ────────────────────────────────────────────────────────────
export interface TextSegment {
  text: string;
  entry?: GitaTerm;
}

export function segmentText(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  const regex = new RegExp(GITA_TERM_REGEX.source, "gi");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index) });
    }
    const entry = TERM_MAP.get(match[0].toLowerCase());
    segments.push({ text: match[0], entry });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }
  return segments;
}
