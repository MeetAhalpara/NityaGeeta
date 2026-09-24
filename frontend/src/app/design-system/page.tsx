"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  History,
  Send,
  Search,
  Check,
  Copy,
  ArrowLeft,
  Flame,
  ShieldCheck,
  Layers,
  Sliders,
  Type,
  Palette,
  Layout,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

interface TokenCardProps {
  name: string;
  variable: string;
  lightHex: string;
  darkHex: string;
  sampleBgClass: string;
  category: string;
}

function TokenCard({
  name,
  variable,
  lightHex,
  darkHex,
  sampleBgClass,
}: TokenCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col p-3 rounded-2xl bg-surface-elevated/70 border border-border-subtle shadow-2xs hover:border-brand-terracotta/40 transition-all group">
      <div className="flex items-center gap-3">
        <div
          className={`size-10 rounded-xl border border-border-subtle shrink-0 shadow-2xs ${sampleBgClass}`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-ink-primary truncate">{name}</p>
          <p className="text-[10px] font-mono text-ink-muted truncate">
            {variable}
          </p>
        </div>
        <button
          onClick={() => handleCopy(variable)}
          title="Copy CSS Variable"
          className="size-7 rounded-lg flex items-center justify-center text-ink-muted hover:text-brand-terracotta hover:bg-surface-canvas transition-colors cursor-pointer"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-500" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>
      <div className="mt-2.5 pt-2 border-t border-border-subtle/60 flex items-center justify-between text-[10px] text-ink-muted font-mono">
        <span>Light: {lightHex}</span>
        <span>Dark: {darkHex}</span>
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  const { theme, setTheme } = useTheme();
  const [btnLoading, setBtnLoading] = useState(false);
  const [demoInput, setDemoInput] = useState("");
  const [demoError, setDemoError] = useState("");

  const colorTokens: TokenCardProps[] = [
    {
      category: "Surfaces",
      name: "Surface Canvas",
      variable: "--surface-canvas",
      lightHex: "#FAF7F2",
      darkHex: "#1A1816",
      sampleBgClass: "bg-surface-canvas",
    },
    {
      category: "Surfaces",
      name: "Surface Elevated",
      variable: "--surface-elevated",
      lightHex: "#F4EFE6",
      darkHex: "#171717",
      sampleBgClass: "bg-surface-elevated",
    },
    {
      category: "Surfaces",
      name: "Surface Card",
      variable: "--surface-card",
      lightHex: "#EFE9DF",
      darkHex: "#212121",
      sampleBgClass: "bg-surface-card",
    },
    {
      category: "Accents",
      name: "Brand Terracotta",
      variable: "--brand-terracotta",
      lightHex: "#C25E38",
      darkHex: "#E06D43",
      sampleBgClass: "bg-brand-terracotta",
    },
    {
      category: "Accents",
      name: "Terracotta Subtle",
      variable: "--brand-terracotta-subtle",
      lightHex: "rgba(194,94,56,0.12)",
      darkHex: "rgba(224,109,67,0.15)",
      sampleBgClass: "bg-brand-terracotta-subtle",
    },
    {
      category: "Ink / Text",
      name: "Ink Primary",
      variable: "--ink-primary",
      lightHex: "#2D2622",
      darkHex: "#ECECEC",
      sampleBgClass: "bg-ink-primary",
    },
    {
      category: "Ink / Text",
      name: "Ink Secondary",
      variable: "--ink-secondary",
      lightHex: "#5C4F45",
      darkHex: "#D4C7B8",
      sampleBgClass: "bg-ink-secondary",
    },
    {
      category: "Ink / Text",
      name: "Ink Muted",
      variable: "--ink-muted",
      lightHex: "#8C7B70",
      darkHex: "#8E8E8E",
      sampleBgClass: "bg-ink-muted",
    },
    {
      category: "Borders",
      name: "Border Subtle",
      variable: "--border-subtle",
      lightHex: "rgba(230,221,208,0.75)",
      darkHex: "rgba(38,35,32,0.85)",
      sampleBgClass: "bg-border-subtle",
    },
  ];

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-primary transition-colors duration-200">
      {/* ── STICKY TOP NAVBAR ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface-canvas/80 border-b border-border-subtle px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="flex items-center gap-2 text-xs font-semibold text-ink-secondary hover:text-brand-terracotta transition-colors p-1.5 rounded-lg hover:bg-surface-elevated"
          >
            <ArrowLeft className="size-4" />
            <span>Back to App</span>
          </Link>
          <div className="h-4 w-px bg-border-subtle" />
          <div className="flex items-center gap-2">
            <img
              src="/assets/images/icons/NG3.png"
              alt="NityaGeeta"
              className="size-6 object-contain"
            />
            <span className="font-bold text-sm tracking-tight">
              NityaGeeta Design System
            </span>
            <Badge variant="terracotta" size="sm">
              v1.0.0
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-ink-muted font-mono hidden md:block">
            Theme: <span className="text-brand-terracotta capitalize">{theme}</span>
          </div>
          <AnimatedThemeToggler
            theme={theme === "dark" ? "dark" : "light"}
            onThemeChange={(t) => setTheme(t)}
            className="size-9 rounded-xl border border-border-subtle hover:border-brand-terracotta/40 flex items-center justify-center text-ink-secondary hover:text-brand-terracotta transition-colors"
          />
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-16">
        {/* HERO INTRO */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-terracotta/10 border border-brand-terracotta/20 text-brand-terracotta text-xs font-medium">
            <Flame className="size-3.5" />
            <span>Single Source of Truth</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            Scripture & Dialogue Design System
          </h1>
          <p className="text-sm sm:text-base text-ink-secondary max-w-2xl leading-relaxed">
            The authentic parchment and sandalwood visual language grounding NityaGeeta's
            multi-LLM scripture synthesis, dialogue interfaces, and reasoning visualizations.
          </p>
        </section>

        {/* ── SECTION 1: COLOR TOKENS ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border-subtle">
            <Palette className="size-5 text-brand-terracotta" />
            <h2 className="text-lg font-bold">Semantic Color Tokens</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {colorTokens.map((token) => (
              <TokenCard key={token.variable} {...token} />
            ))}
          </div>
        </section>

        {/* ── SECTION 2: TYPOGRAPHY SCALE ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border-subtle">
            <Type className="size-5 text-brand-terracotta" />
            <h2 className="text-lg font-bold">Typography Scale & Scripture Pairing</h2>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-brand-terracotta uppercase tracking-wider">
                Scripture & Shloka Title (Serif / Classical)
              </span>
              <p className="font-serif text-2xl sm:text-3xl text-ink-primary font-bold">
                यदा यदा हि धर्मस्य ग्लानिर्भवति भारत ।
              </p>
              <p className="text-xs text-ink-muted italic font-serif">
                Bhagavad Gita — Chapter 4, Verse 7
              </p>
            </div>

            <div className="h-px bg-border-subtle" />

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-brand-terracotta uppercase tracking-wider">
                Dialogue Body (Inter / Sans-Serif)
              </span>
              <p className="text-sm text-ink-primary leading-relaxed">
                When righteousness is diminished and unrighteousness prevails, I manifest Myself.
                This passage encapsulates Lord Krishna’s assurance to Arjuna on the duty of action
                without attachment.
              </p>
            </div>

            <div className="h-px bg-border-subtle" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-ink-muted">
              <div>
                <span className="block text-ink-primary font-bold">Sans Font</span>
                <span>Inter / system-ui</span>
              </div>
              <div>
                <span className="block text-ink-primary font-bold">Serif Font</span>
                <span>Cinzel / Georgia</span>
              </div>
              <div>
                <span className="block text-ink-primary font-bold">Base Sizing</span>
                <span>14px (Body), 12px (Meta)</span>
              </div>
              <div>
                <span className="block text-ink-primary font-bold">Grid Rhythm</span>
                <span>8-point spatial grid</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: BUTTONS ── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div className="flex items-center gap-2.5">
              <Sliders className="size-5 text-brand-terracotta" />
              <h2 className="text-lg font-bold">Interactive Button Primitives</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBtnLoading((p) => !p)}
            >
              Toggle Loading: {btnLoading ? "ON" : "OFF"}
            </Button>
          </div>

          {/* Variants */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-ink-secondary">Variants</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" isLoading={btnLoading} leftIcon={<Sparkles className="size-3.5" />}>
                Primary Brand
              </Button>
              <Button variant="secondary" isLoading={btnLoading} leftIcon={<BookOpen className="size-3.5" />}>
                Secondary Card
              </Button>
              <Button variant="outline" isLoading={btnLoading}>
                Outline Accent
              </Button>
              <Button variant="ghost" isLoading={btnLoading}>
                Ghost Action
              </Button>
              <Button variant="destructive" isLoading={btnLoading}>
                Destructive Alert
              </Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-ink-secondary">Sizes & Icon Buttons</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small (h-8)</Button>
              <Button size="md">Medium (h-9)</Button>
              <Button size="lg">Large (h-11)</Button>
              <Button size="icon" title="Icon Button" aria-label="Send">
                <Send className="size-4 text-white" />
              </Button>
              <Button size="icon" variant="secondary" title="Search" aria-label="Search">
                <Search className="size-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: FORM & TEXTFIELDS ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border-subtle">
            <Layout className="size-5 text-brand-terracotta" />
            <h2 className="text-lg font-bold">Form & Input Primitives</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              label="Seeker Question"
              placeholder="Inquire on duty, karma, or dharma..."
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              helperText="Focus ring activates brand terracotta glow."
              leftIcon={<Search className="size-4" />}
            />

            <TextField
              label="Validated Field (Success)"
              defaultValue="Chapter 2, Sankhya Yoga"
              helperText="Chapter verified in authoritative corpus."
              rightIcon={<Check className="size-4 text-emerald-500" />}
            />

            <TextField
              label="Error State Input"
              value={demoError}
              onChange={(e) => setDemoError(e.target.value)}
              placeholder="Try triggering an error"
              error="Verse index must be between 1 and 72."
            />
          </div>
        </section>

        {/* ── SECTION 5: BADGES ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border-subtle">
            <Layers className="size-5 text-brand-terracotta" />
            <h2 className="text-lg font-bold">Badges & Metadata Tags</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="terracotta" icon={<Flame className="size-3" />}>
              Gita 2.47
            </Badge>
            <Badge variant="neutral">Commentary Grounded</Badge>
            <Badge variant="outline">Adi Shankara</Badge>
            <Badge variant="success" icon={<ShieldCheck className="size-3" />}>
              SSRF Protected
            </Badge>
            <Badge variant="warning">Contemplation</Badge>
          </div>
        </section>

        {/* ── SECTION 6: STANDARDIZED EMPTY STATES ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border-subtle">
            <History className="size-5 text-brand-terracotta" />
            <h2 className="text-lg font-bold">Standardized Empty & Zero States</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Full Empty State */}
            <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle">
              <span className="text-[10px] font-mono text-ink-muted uppercase tracking-wider block mb-2">
                Full Card Empty State
              </span>
              <EmptyState
                icon={<Sparkles className="size-6 text-brand-terracotta" />}
                title="Begin Your Spiritual Dialogue"
                description="Ask Krishna for guidance on dilemmas, anxiety, karma, or everyday decision making."
                action={
                  <Button variant="primary" size="sm">
                    New Dialogue
                  </Button>
                }
              />
            </div>

            {/* Compact Empty State (for Sidebar / Dropdowns) */}
            <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle flex flex-col justify-center">
              <span className="text-[10px] font-mono text-ink-muted uppercase tracking-wider block mb-2">
                Compact Empty State (Sidebar / Rail)
              </span>
              <div className="max-w-[240px] mx-auto p-3 rounded-xl bg-surface-elevated/70 border border-border-subtle">
                <EmptyState
                  compact
                  icon={<History className="size-4 text-brand-terracotta" />}
                  title="No saved history"
                  description="Your past contemplations and dialogue sessions will appear here."
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
