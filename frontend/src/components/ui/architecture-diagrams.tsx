"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cpu, 
  ShieldCheck, 
  Workflow, 
  Layers, 
  Copy, 
  Check, 
  Code2, 
  GitBranch, 
  Server,
  Sparkles
} from "lucide-react";

interface DiagramTab {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  mermaidCode: string;
}

const DIAGRAMS: DiagramTab[] = [
  {
    id: "rag",
    title: "Hybrid RAG & Consensus Council",
    icon: Cpu,
    description: "Multi-layered retrieval combining dense semantic embeddings, BM25 Sanskrit keyword matching, and 5-model neural consensus scoring.",
    mermaidCode: `graph TD
    A[Seeker Crisis / Dilemma] --> B[FastAPI Backend /chat]
    B --> C[Hybrid Scripture RAG]
    C -->|Dense Semantic Embedding| D[(Vector Index: 700 Verses)]
    C -->|BM25 Sparse Search| E[(Gita Press Gorakhpur & Bhashyas)]
    D & E --> F[Reciprocal Rank Fusion RRF]
    F --> G[Multi-LLM Consensus Council]
    G -->|Parallel Fan-Out| H[Gemini 2.5 Flash]
    G -->|Parallel Fan-Out| I[Claude 3.5 Sonnet]
    G -->|Parallel Fan-Out| J[Meta Llama 3.3 70B]
    H & I & J --> K[LLM Judge & Authenticity Scorer]
    K --> L[Citation Guardrail Validator]
    L -->|100% Groundedness Verified| M[Actionable Guidance Output]
    L -.->|Hallucination Detected| N[Citation Dispute Logger]`
  },
  {
    id: "resilience",
    title: "3-State Circuit Breaker & Fallback Mesh",
    icon: ShieldCheck,
    description: "Failover mesh protecting against upstream provider rate limits and latency spikes via 3-state circuit breakers, Redis caching, and automated fallback tiers.",
    mermaidCode: `graph TD
    UserReq[Inbound Query] --> CB{Circuit Breaker State}
    CB -->|CLOSED: Error Rate < 50%| PrimaryLLM[Primary Groq Model]
    CB -->|OPEN: High Failure Spikes| FallbackTier[Tier 2 Fallback: Secondary LLM Provider]
    CB -->|HALF-OPEN: Canary Probe| Canary[Canary Test Request]
    PrimaryLLM -->|Success| CacheStore[(Redis Cache & Response Store)]
    PrimaryLLM -->|Timeout / Rate Limit| Trip[Trip Breaker -> Increment Failure Count]
    Trip --> FallbackTier
    FallbackTier --> FallbackCache[(Cached Archetype Wisdom Response)]
    Canary -->|Probe Succeeded| ResetCB[Reset to CLOSED State]
    Canary -->|Probe Failed| ReopenCB[Keep OPEN for 60s Cooldown]`
  },
  {
    id: "memory",
    title: "NetworkX Tangent Memory Stack",
    icon: GitBranch,
    description: "Directed Acyclic Graph (DAG) state machine preserving conversational context when seekers explore tangential philosophical queries.",
    mermaidCode: `graph TD
    Root[Root Topic: Karma Yoga & Workplace Stress] --> Turn1[Turn 1: How to overcome anxiety?]
    Turn1 --> Tangent1[Tangent PUSH: Sanskrit Root of Karma]
    Tangent1 --> Turn2[Turn 2: Etymology from 'Kri' (To Do)]
    Turn2 --> Tangent2[Sub-Tangent PUSH: Nishkama vs Sakama]
    Tangent2 --> Squash[Tangent POP & SQUASH: Collapse into Sutra Summary]
    Squash --> RootContext[Optimized Memory Context: Collapsed Sutra Tokens]
    RootContext --> Turn3[Turn 3: Application to Modern Deadlines]`
  }
];

export function ArchitectureDiagrams() {
  const [activeTab, setActiveTab] = useState(DIAGRAMS[0].id);
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");
  const [copied, setCopied] = useState(false);

  const currentDiagram = DIAGRAMS.find((d) => d.id === activeTab) || DIAGRAMS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDiagram.mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#FAF7F2] dark:bg-[#1C1917] rounded-3xl border border-[#E6DDD0] dark:border-[#2D2825] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6DDD0]/60 dark:border-[#2D2825]/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C25E38] dark:text-[#E06D43] mb-1">
            <Workflow className="w-4 h-4" />
            <span>Interactive Engineering Blueprints</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB]">
            System Architecture & Data Topology
          </h3>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-[#EFE9DF] dark:bg-[#262320] p-1 rounded-xl self-start">
          <button
            onClick={() => setViewMode("visual")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "visual"
                ? "bg-[#C25E38] text-white shadow-xs"
                : "text-[#8C7B70] hover:text-[#2D2622] dark:hover:text-[#F5F2EB]"
            }`}
          >
            Visual Blueprint
          </button>
          <button
            onClick={() => setViewMode("code")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "code"
                ? "bg-[#C25E38] text-white shadow-xs"
                : "text-[#8C7B70] hover:text-[#2D2622] dark:hover:text-[#F5F2EB]"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Mermaid.js Code</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {DIAGRAMS.map((diag) => {
          const Icon = diag.icon;
          const isActive = diag.id === activeTab;
          return (
            <button
              key={diag.id}
              onClick={() => setActiveTab(diag.id)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isActive
                  ? "bg-[#FAF7F2] dark:bg-[#221F1C] border-[#C25E38] dark:border-[#E06D43] shadow-sm ring-1 ring-[#C25E38]/20"
                  : "bg-white/60 dark:bg-[#161413]/60 border-[#E6DDD0]/60 dark:border-[#2D2825]/60 hover:border-[#C25E38]/40"
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isActive
                    ? "bg-[#C25E38] text-white"
                    : "bg-[#EFE9DF] dark:bg-[#262320] text-[#8C7B70]"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#2D2622] dark:text-[#F5F2EB] truncate">
                  {diag.title}
                </p>
                <p className="text-[10px] text-[#8C7B70] dark:text-[#A89F91] truncate">
                  {diag.id === "rag" ? "FastAPI & RAG" : diag.id === "resilience" ? "Circuit Breakers & Redis" : "NetworkX Memory"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
        {currentDiagram.description}
      </p>

      {/* Blueprint Container */}
      <div className="relative rounded-2xl bg-white/80 dark:bg-[#12100F]/90 border border-[#E6DDD0]/70 dark:border-[#2D2825] p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === "visual" ? (
            <motion.div
              key={`visual-${activeTab}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {activeTab === "rag" && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825]">
                      <span className="font-bold text-[#C25E38] dark:text-[#E06D43] block mb-1">1. User Query</span>
                      <p className="text-[11px] text-[#8C7B70]">Dilemma facet extraction & Sanskrit intent tokenization</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825]">
                      <span className="font-bold text-[#C25E38] dark:text-[#E06D43] block mb-1">2. Hybrid Retrieval</span>
                      <p className="text-[11px] text-[#8C7B70]">Dense cosine similarity + BM25 Sparse Reciprocal Rank Fusion</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825]">
                      <span className="font-bold text-[#C25E38] dark:text-[#E06D43] block mb-1">3. Council Debate</span>
                      <p className="text-[11px] text-[#8C7B70]">5-Model parallel consensus: Gemini, Claude, Llama 3.3</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825]">
                      <span className="font-bold text-[#C25E38] dark:text-[#E06D43] block mb-1">4. Guardrail Gate</span>
                      <p className="text-[11px] text-[#8C7B70]">Anti-hallucination verification against 700 canonical verses</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF7F2]/60 dark:bg-[#1A1816]/60 border border-[#E6DDD0]/40 dark:border-[#2D2825]/40 text-center">
                    <span className="text-[11px] font-mono text-[#8C7B70] dark:text-[#A89F91]">
                      [Client App] ──(SSE Stream)──► [FastAPI CircuitBreaker] ──(RRF Fusion)──► [VerseIndex Cache] ──► [Synthesized Output]
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "resilience" && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825]">
                      <span className="font-bold text-[#C25E38] dark:text-[#E06D43] block mb-1">State 1: CLOSED (Healthy)</span>
                      <p className="text-[11px] text-[#8C7B70]">Direct high-throughput execution with latency tracking &lt;500ms</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825]">
                      <span className="font-bold text-[#C25E38] dark:text-[#E06D43] block mb-1">State 2: OPEN (Tripped)</span>
                      <p className="text-[11px] text-[#8C7B70]">Error rate &gt;50%; upstream requests diverted to Redis cached wisdom</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825]">
                      <span className="font-bold text-[#C25E38] dark:text-[#E06D43] block mb-1">State 3: HALF-OPEN (Canary)</span>
                      <p className="text-[11px] text-[#8C7B70]">Cooldown expires (60s); sends canary test probes before restoring traffic</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF7F2]/60 dark:bg-[#1A1816]/60 border border-[#E6DDD0]/40 dark:border-[#2D2825]/40 text-center">
                    <span className="text-[11px] font-mono text-[#8C7B70] dark:text-[#A89F91]">
                      [Inbound Request] ──► [CircuitBreaker Guard] ──(Healthy)──► [Primary Groq LLM] ──(Tripped)──► [Redis Fallback Cache]
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "memory" && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825]">
                      <span className="font-bold text-[#C25E38] dark:text-[#E06D43] block mb-1">Root Node</span>
                      <p className="text-[11px] text-[#8C7B70]">Anchor life crisis (e.g., Karma Yoga & Workplace Stress)</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825]">
                      <span className="font-bold text-[#C25E38] dark:text-[#E06D43] block mb-1">Tangent PUSH</span>
                      <p className="text-[11px] text-[#8C7B70]">Branching into deep Sanskrit etymology or sub-inquiry</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825]">
                      <span className="font-bold text-[#C25E38] dark:text-[#E06D43] block mb-1">POP & Squash</span>
                      <p className="text-[11px] text-[#8C7B70]">Collapses tangent into concise sutra summary to optimize token window</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF7F2]/60 dark:bg-[#1A1816]/60 border border-[#E6DDD0]/40 dark:border-[#2D2825]/40 text-center">
                    <span className="text-[11px] font-mono text-[#8C7B70] dark:text-[#A89F91]">
                      [Root Topic Node] ──(Branch)──► [Tangent Exploration] ──(Squash)──► [Collapsed Sutra Context Prompt]
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`code-${activeTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EFE9DF] dark:bg-[#262320] text-[#2D2622] dark:text-[#F5F2EB] hover:bg-[#C25E38] hover:text-white transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Mermaid</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#1E1B18] text-[#FAF7F2] font-mono text-xs overflow-x-auto leading-relaxed border border-[#3C3630]">
                <code>{currentDiagram.mermaidCode}</code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
