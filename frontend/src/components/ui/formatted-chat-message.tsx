"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles } from "lucide-react";
import { GitaTermHoverCard, segmentText } from "./gita-term-hover-card";

interface FormattedChatMessageProps {
  content: string;
  className?: string;
}

interface ParsedSection {
  type: "text" | "shloka";
  content?: string;
  sanskrit?: string;
  translation?: string;
  verseCitation?: string;
}

// ── OCR / noise guards ────────────────────────────────────────────────────────
function isOcrNoiseLine(line: string): boolean {
  const t = line.trim();
  if (!t) return true;
  return /^(श्रीमद्भगवद्गीता|अध्याय\s*[\d\u0966-\u096F]+|Boour|\d{4,})$/i.test(t);
}

function isPureDevanagariVerseLine(line: string): boolean {
  const t = line.trim();
  if (!t || isOcrNoiseLine(t)) return false;
  const dev = (t.match(/[\u0900-\u097F]/g) || []).length;
  const lat = (t.match(/[a-zA-Z]/g) || []).length;
  if (dev < 8) return false;
  return dev >= lat || /[\u0900-\u097F]+.*[॥\|]/u.test(t);
}

function extractVerseCitation(ctxLines: string[], verseLine: string): string {
  const full = [...ctxLines.slice(-3), verseLine].join(" ");
  const cv = full.match(/Chapter\s+(\d+)[,\s]+Verse\s+(\d+)/i);
  if (cv) return `CHAPTER ${cv[1]}, VERSE ${cv[2]}`;
  const dot = full.match(/\b(?:BG|Gita)?\s*\(?(\d{1,2})\.(\d{1,2})\)?/i);
  if (dot) return `BHAGAVAD GITA ${dot[1]}.${dot[2]}`;
  const dn = verseLine.match(/॥\s*([\u0966-\u096F0-9\.]+)\s*॥/);
  if (dn) {
    const DEV: Record<string, string> = { "०":"0","१":"1","२":"2","३":"3","४":"4","५":"5","६":"6","७":"7","८":"8","९":"9" };
    const c = dn[1].replace(/[\u0966-\u096F]/g, (d) => DEV[d] || d);
    if (c.includes(".")) { const p = c.split("."); return `CHAPTER ${p[0]}, VERSE ${p[1]}`; }
    return `CHAPTER 6, VERSE ${c}`;
  }
  return "BHAGAVAD GITA VERSE";
}

// ── Message content parser ────────────────────────────────────────────────────
function parseMessageContent(rawText: string): ParsedSection[] {
  if (!rawText) return [];

  let cleaned = rawText
    .replace(/\*\*(?:Sacred Gita Verse & Transliteration|Spiritual Explanation & Guidance|Wisdom of the Acharyas & Commentaries|Practical Daily Application|Core Scriptural Guidance|Wisdom of the Acharyas|Advaita Non-Dual Metaphysics|Wisdom of Shankara & Atman Realization|Practical Sadhana & Daily Discipline|Actionable Karma Yoga Steps|Universal Energy & Physics Connections|Cosmic Cause-and-Effect Analysis|Cognitive Psychology & Reframing|Neuroscience & Mind Resilience Steps)\*\*\n?/gi, "")
    .replace(/^###+\s*/gm, "");

  const lines = cleaned.split("\n");
  const sections: ParsedSection[] = [];
  let buf: string[] = [];

  const flush = () => {
    if (!buf.length) return;
    let block = buf.join("\n").trim();
    block = block.replace(/\b(uddhared|ātmanā|na|ātmā|hy|ātmānaḥ|bandhur|ripur|karmāṇi|saṅgaṁ|tyaktvā|dhanañjaya)\b[a-zāīūṛṁḥṭḍṇśṣñ\s'\(\)\d\.\–\-]*/gi, "").trim();
    block = block.replace(/^[,;]\s*([a-z])?/, (_m, fc) => fc ? fc.toUpperCase() : "").trim();
    if (block) sections.push({ type: "text", content: block });
    buf = [];
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isPureDevanagariVerseLine(line)) {
      const citation = extractVerseCitation(buf, line);
      flush();

      const sanskritLines: string[] = [];
      while (i < lines.length && isPureDevanagariVerseLine(lines[i])) {
        const clean = lines[i].replace(/\s*\([a-zA-gāīūṛṁḥṭḍṇśṣñ\s']+\)/gi, "").trim();
        if (clean && !isOcrNoiseLine(clean)) sanskritLines.push(clean);
        i++;
      }
      while (i < lines.length && /[āīūṛṁḥṭḍṇśṣñ]/i.test(lines[i]) && !/[a-z]{6,}/i.test(lines[i].replace(/[āīūṛṁḥṭḍṇśṣñ]/gi, ""))) i++;

      let translation: string | undefined;
      if (i < lines.length) {
        const nl = lines[i].trim();
        if (/^(?:Translation|Translated as):\s*$/i.test(nl)) {
          i++;
          if (i < lines.length) { translation = lines[i].trim().replace(/^[""']|[""']$/g, ""); i++; }
        } else if (/^(?:Translation|Translated as):/i.test(nl)) {
          translation = nl.replace(/^(?:Translation|Translated as):\s*/i, "").trim().replace(/^[""']|[""']$/g, "");
          i++;
        } else if (/^["][^"]+["]$/.test(nl) && !isPureDevanagariVerseLine(nl)) {
          translation = nl.replace(/^["]|["]$/g, "");
          i++;
        }
      }
      if (sanskritLines.length > 0) {
        sections.push({ type: "shloka", sanskrit: sanskritLines.join("\n"), translation, verseCitation: citation });
      }
      continue;
    } else {
      const t = line.trim();
      if (isOcrNoiseLine(t)) { i++; continue; }
      if (!/^(?:Translation|Translated as):?$/i.test(t) && !/^\*?(?:Translation|Translated as):?\*?$/i.test(t)) buf.push(line);
      i++;
    }
  }
  flush();
  return sections;
}

// ── Hover-card text renderer ──────────────────────────────────────────────────
// Takes a plain string and returns React nodes with Gita terms wrapped in hover cards.
function renderWithHoverCards(text: string, keyPrefix: string): React.ReactNode {
  const segments = segmentText(text);
  if (segments.length === 1 && !segments[0].entry) return text;
  return (
    <>
      {segments.map((seg, idx) =>
        seg.entry ? (
          <GitaTermHoverCard key={`${keyPrefix}-${idx}`} word={seg.text} entry={seg.entry} />
        ) : (
          <React.Fragment key={`${keyPrefix}-${idx}`}>{seg.text}</React.Fragment>
        )
      )}
    </>
  );
}

// ReactMarkdown custom text node — intercepts every leaf text node
function GitaTextNode({ children, nodeKey }: { children: React.ReactNode; nodeKey: string }) {
  if (typeof children === "string") return <>{renderWithHoverCards(children, nodeKey)}</>;
  if (Array.isArray(children)) {
    return (
      <>
        {children.map((child, i) =>
          typeof child === "string"
            ? <React.Fragment key={i}>{renderWithHoverCards(child, `${nodeKey}-${i}`)}</React.Fragment>
            : <React.Fragment key={i}>{child}</React.Fragment>
        )}
      </>
    );
  }
  return <>{children}</>;
}

// ── Main export ───────────────────────────────────────────────────────────────
export function FormattedChatMessage({ content, className = "" }: FormattedChatMessageProps) {
  if (!content) return null;
  const sections = parseMessageContent(content);

  return (
    <div className={`space-y-4 leading-relaxed text-[#2D2622] dark:text-[#F5F2EB] font-sans ${className}`}>
      {sections.map((sec, index) => {

        // ── Shloka card ───────────────────────────────────────────────────────
        if (sec.type === "shloka" && sec.sanskrit) {
          return (
            <div
              key={index}
              className="my-5 p-5 rounded-2xl bg-[#F4EFE6]/95 dark:bg-[#1A1816]/95 border-l-4 border-[#C25E38] dark:border-[#E06D43] border border-[#E6DDD0]/80 dark:border-[#2D2825]/80 shadow-md space-y-3.5 text-left transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between text-xs tracking-wider border-b border-[#E6DDD0]/50 dark:border-[#2D2825]/50 pb-2.5">
                <span
                  className="flex items-center gap-1.5 font-bold text-[#C25E38] dark:text-[#E06D43] uppercase"
                  style={{ fontFamily: 'var(--font-cinzel), "Cinzel", Georgia, serif' }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C25E38] dark:text-[#E06D43]" />
                  Sacred Gita Verse
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full bg-[#C25E38]/15 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] font-bold text-[11px] uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-cinzel), "Cinzel", monospace' }}
                >
                  {sec.verseCitation || "BHAGAVAD GITA VERSE"}
                </span>
              </div>

              {/* Sanskrit */}
              <p
                className="text-lg sm:text-xl font-bold text-[#2D2622] dark:text-[#FFF8F0] leading-relaxed tracking-wide whitespace-pre-wrap py-1"
                style={{ fontFamily: '"Noto Serif Devanagari", var(--font-sans), serif' }}
              >
                {sec.sanskrit}
              </p>

              {/* Translation */}
              <div className="pt-2 border-t border-[#E6DDD0]/50 dark:border-[#2D2825]/50 text-xs sm:text-sm text-[#2D2622] dark:text-[#F5F2EB] font-sans leading-relaxed">
                <span className="font-bold text-[#C25E38] dark:text-[#E06D43] text-[11px] uppercase tracking-wider block mb-1 font-mono">
                  English Translation:
                </span>
                <p className="italic text-[#4A3E37] dark:text-[#E0D8CC] font-sans text-sm sm:text-base leading-relaxed">
                  &quot;{(sec.translation || "One should uplift oneself by the Self, and not degrade oneself; for the Self alone is the friend of oneself, and the Self alone is the enemy of oneself.").replace(/^["""'']+|["""'']+$/g, "").trim()}&quot;
                </p>
              </div>
            </div>
          );
        }

        // ── Text section with hover cards ─────────────────────────────────────
        if (sec.type === "text" && sec.content) {
          return (
            <div key={index} className="text-sm sm:text-base leading-relaxed">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <div className="mb-3 leading-relaxed">
                      <GitaTextNode nodeKey={`p-${index}`}>{children}</GitaTextNode>
                    </div>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-[#2D2622] dark:text-[#F5F2EB]">
                      <GitaTextNode nodeKey={`s-${index}`}>{children}</GitaTextNode>
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-[#5C4F45] dark:text-[#D4C7B8]">
                      <GitaTextNode nodeKey={`e-${index}`}>{children}</GitaTextNode>
                    </em>
                  ),
                  li: ({ children }) => (
                    <li className="my-0.5">
                      <GitaTextNode nodeKey={`li-${index}`}>{children}</GitaTextNode>
                    </li>
                  ),
                  ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                }}
              >
                {sec.content}
              </ReactMarkdown>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
