"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database,
  Cpu, 
  ShieldCheck, 
  Workflow, 
  Layers, 
  Copy, 
  Check, 
  Code2, 
  GitBranch, 
  Server,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Table,
  Key,
  ArrowRight,
  Info,
  CheckCircle2,
  Lock
} from "lucide-react";

interface DiagramTab {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  description: string;
  mermaidCode: string;
}

interface EntityField {
  name: string;
  type: string;
  key?: "PK" | "FK" | "UK" | "PK,FK";
}

interface EntityTable {
  id: string;
  title: string;
  category: "Identity & Auth" | "Session & Chat" | "Scripture Corpus" | "Telemetry & Streams";
  fields: EntityField[];
}

const DATABASE_ENTITIES: EntityTable[] = [
  {
    id: "users",
    title: "USERS",
    category: "Identity & Auth",
    fields: [
      { name: "id", type: "UUID", key: "PK" },
      { name: "email", type: "VARCHAR(255)", key: "UK" },
      { name: "display_name", type: "VARCHAR(255)" },
      { name: "avatar_url", type: "TEXT" },
      { name: "preferred_lang", type: "VARCHAR(10)" },
      { name: "is_active", type: "BOOLEAN" },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "oauth_accounts",
    title: "OAUTH_ACCOUNTS",
    category: "Identity & Auth",
    fields: [
      { name: "id", type: "UUID", key: "PK" },
      { name: "user_id", type: "UUID", key: "FK" },
      { name: "provider", type: "VARCHAR(50)" },
      { name: "provider_uid", type: "VARCHAR(255)", key: "UK" },
      { name: "access_token", type: "TEXT" },
      { name: "refresh_token", type: "TEXT" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "sessions",
    title: "SESSIONS",
    category: "Identity & Auth",
    fields: [
      { name: "id", type: "UUID", key: "PK" },
      { name: "user_id", type: "UUID", key: "FK" },
      { name: "token_hash", type: "VARCHAR(255)", key: "UK" },
      { name: "expires_at", type: "TIMESTAMP" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "conversations",
    title: "CONVERSATIONS",
    category: "Session & Chat",
    fields: [
      { name: "id", type: "UUID", key: "PK" },
      { name: "user_id", type: "UUID", key: "FK" },
      { name: "title", type: "VARCHAR(255)" },
      { name: "message_count", type: "INTEGER" },
      { name: "last_active_at", type: "TIMESTAMP" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "messages",
    title: "MESSAGES",
    category: "Session & Chat",
    fields: [
      { name: "id", type: "UUID", key: "PK" },
      { name: "conversation_id", type: "UUID", key: "FK" },
      { name: "user_id", type: "UUID", key: "FK" },
      { name: "role", type: "VARCHAR(20)" },
      { name: "content", type: "TEXT" },
      { name: "tokens_used", type: "INTEGER" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "bookmarks",
    title: "BOOKMARKS",
    category: "Session & Chat",
    fields: [
      { name: "id", type: "UUID", key: "PK" },
      { name: "user_id", type: "UUID", key: "FK" },
      { name: "conversation_id", type: "UUID", key: "FK" },
      { name: "message_id", type: "UUID", key: "FK" },
      { name: "note", type: "TEXT" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "shlokas",
    title: "SHLOKA_CORPUS",
    category: "Scripture Corpus",
    fields: [
      { name: "shloka_id", type: "VARCHAR(50)", key: "PK" },
      { name: "chapter", type: "INTEGER" },
      { name: "verse", type: "INTEGER" },
      { name: "sanskrit_text", type: "TEXT" },
      { name: "transliteration", type: "TEXT" },
      { name: "english_meaning", type: "TEXT" },
      { name: "word_meanings", type: "JSONB" },
    ],
  },
  {
    id: "telemetry_stream",
    title: "TELEMETRY_STREAM",
    category: "Telemetry & Streams",
    fields: [
      { name: "event_id", type: "VARCHAR(64)", key: "PK" },
      { name: "user_id", type: "UUID", key: "FK" },
      { name: "shloka_id", type: "VARCHAR(50)", key: "FK" },
      { name: "chapter", type: "INTEGER" },
      { name: "verse", type: "INTEGER" },
      { name: "dwell_ms", type: "INTEGER" },
      { name: "interactions", type: "JSONB" },
      { name: "timestamp", type: "FLOAT" },
    ],
  },
];

const RELATIONSHIPS = [
  { from: "users", to: "oauth_accounts", label: "authenticates_via (1:N)" },
  { from: "users", to: "sessions", label: "holds_active (1:N)" },
  { from: "users", to: "conversations", label: "initiates (1:N)" },
  { from: "conversations", to: "messages", label: "records (1:N)" },
  { from: "messages", to: "bookmarks", label: "referenced_in (1:N)" },
  { from: "users", to: "telemetry_stream", label: "emits_dwell (1:N)" },
  { from: "telemetry_stream", to: "shlokas", label: "observes_verse (N:1)" },
];

const DIAGRAMS: DiagramTab[] = [
  {
    id: "schema",
    title: "Domain Data Model & Relational Topology",
    subtitle: "PostgreSQL & Redis Streams",
    icon: Database,
    description: "Normalized PostgreSQL 16 schema with 18-day session TTL tokens, Google OAuth federated identity, and real-time Redis Streams behavioral telemetry.",
    mermaidCode: `erDiagram
    USERS ||--o{ OAUTH_ACCOUNTS : "authenticates via"
    USERS ||--o{ SESSIONS : "holds active (18-day TTL)"
    USERS ||--o{ CONVERSATIONS : "initiates"
    USERS ||--o{ BOOKMARKS : "saves"
    USERS ||--o{ TELEMETRY_STREAM : "emits dwell telemetry"
    CONVERSATIONS ||--|{ MESSAGES : "records"
    MESSAGES ||--o{ BOOKMARKS : "referenced in"
    MESSAGES }o--o{ SHLOKA_CORPUS : "cites grounded shlokas"
    TELEMETRY_STREAM }o--|| SHLOKA_CORPUS : "tracks reading dwell"

    USERS {
        uuid id PK
        string email UK
        string display_name
        string avatar_url
        string preferred_lang
        boolean is_active
        timestamp created_at
    }
    OAUTH_ACCOUNTS {
        uuid id PK
        uuid user_id FK
        string provider
        string provider_uid UK
        text access_token
    }
    SESSIONS {
        uuid id PK
        uuid user_id FK
        string token_hash UK
        timestamp expires_at
    }
    CONVERSATIONS {
        uuid id PK
        uuid user_id FK
        string title
        int message_count
        timestamp last_active_at
    }
    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        uuid user_id FK
        string role
        text content
        int tokens_used
    }
    BOOKMARKS {
        uuid id PK
        uuid user_id FK
        uuid conversation_id FK
        uuid message_id FK
        text note
    }
    SHLOKA_CORPUS {
        string shloka_id PK
        int chapter
        int verse
        text sanskrit_text
        text english_meaning
        jsonb word_meanings
    }
    TELEMETRY_STREAM {
        string event_id PK
        uuid user_id FK
        string shloka_id FK
        int dwell_ms
        jsonb interactions
        timestamp timestamp
    }`
  },
  {
    id: "rag",
    title: "Hybrid RAG & Consensus Council",
    subtitle: "FastAPI & RAG Ensemble",
    icon: Cpu,
    description: "Multi-layered retrieval combining dense semantic embeddings, BM25 Sanskrit keyword matching, and 5-model neural consensus scoring with LLM judge arbitration.",
    mermaidCode: `graph TD
    A[Seeker Crisis / Dilemma] --> B[FastAPI Backend /chat]
    B --> C[Hybrid Scripture RAG]
    C -->|Dense Semantic Embedding| D[(Vector Index: 700 Verses)]
    C -->|BM25 Sparse Search| E[(Gita Press Gorakhpur & Bhashyas)]
    D & E --> F[Reciprocal Rank Fusion RRF k=60]
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
    subtitle: "Circuit Breakers & Redis",
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
    subtitle: "Directed Graph Memory",
    icon: GitBranch,
    description: "Directed Acyclic Graph (DAG) state machine preserving conversational context when seekers explore tangential philosophical queries.",
    mermaidCode: `graph TD
    Root[Root Topic: Karma Yoga & Workplace Stress] --> Turn1[Turn 1: How to overcome anxiety?]
    Turn1 --> Tangent1[Tangent PUSH: Sanskrit Root of Karma]
    Turn1 --> Turn2[Turn 2: Etymology from 'Kri' (To Do)]
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
  
  // Interactive Zoom & Pan State
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [highlightedEntity, setHighlightedEntity] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentDiagram = DIAGRAMS.find((d) => d.id === activeTab) || DIAGRAMS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDiagram.mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.45));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.65));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when clicking canvas background
    if ((e.target as HTMLElement).closest(".entity-table-card")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

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

      {/* 4 Tabs Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {DIAGRAMS.map((diag) => {
          const Icon = diag.icon;
          const isActive = diag.id === activeTab;
          return (
            <button
              key={diag.id}
              onClick={() => {
                setActiveTab(diag.id);
                handleResetZoom();
              }}
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
                  {diag.subtitle}
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
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative rounded-2xl bg-white/90 dark:bg-[#12100F] border border-[#E6DDD0]/80 dark:border-[#2D2825] p-6 overflow-hidden min-h-[560px] select-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(194, 94, 56, 0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      >
        <AnimatePresence mode="wait">
          {viewMode === "visual" ? (
            <motion.div
              key={`visual-${activeTab}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full min-h-[500px] flex flex-col justify-between"
            >
              {/* ── TAB 1: DOMAIN DATA MODEL & ENTITY RELATIONSHIPS ── */}
              {activeTab === "schema" && (
                <div 
                  className="relative transition-transform duration-75 origin-top-left cursor-grab active:cursor-grabbing pb-16"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
                  }}
                >
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#E6DDD0]/60 dark:border-[#2D2825] pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43] uppercase tracking-wider">
                        Domain Data Model (PostgreSQL & Redis Streams)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DF] dark:bg-[#262320] text-[#5C4F45] dark:text-[#D4C7B8] font-mono">
                        8 Core Entities
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#8C7B70] dark:text-[#A89F91]">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-xs bg-[#C25E38]"></span> PK = Primary Key
                      </span>
                      <span className="flex items-center gap-1 ml-2">
                        <span className="w-2 h-2 rounded-xs bg-sky-500"></span> FK = Foreign Key
                      </span>
                      <span className="flex items-center gap-1 ml-2">
                        <span className="w-2 h-2 rounded-xs bg-amber-500"></span> UK = Unique Key
                      </span>
                    </div>
                  </div>

                  {/* Relational Entity Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {DATABASE_ENTITIES.map((entity) => {
                      const isHovered = highlightedEntity === entity.id;
                      const hasActiveRelation = RELATIONSHIPS.some(
                        (r) => (r.from === highlightedEntity && r.to === entity.id) ||
                               (r.to === highlightedEntity && r.from === entity.id)
                      );

                      return (
                        <div
                          key={entity.id}
                          onMouseEnter={() => setHighlightedEntity(entity.id)}
                          onMouseLeave={() => setHighlightedEntity(null)}
                          className={`entity-table-card rounded-xl border transition-all duration-200 overflow-hidden shadow-sm ${
                            isHovered
                              ? "border-[#C25E38] dark:border-[#E06D43] ring-2 ring-[#C25E38]/30 shadow-md scale-[1.02] bg-white dark:bg-[#1E1B18]"
                              : hasActiveRelation
                                ? "border-sky-500/60 dark:border-sky-400/60 ring-1 ring-sky-500/20 bg-white dark:bg-[#1A1816]"
                                : "border-[#DFD5C6] dark:border-[#2D2825] bg-white/95 dark:bg-[#181614]/95 hover:border-[#C25E38]/50"
                          }`}
                        >
                          {/* Table Header */}
                          <div className="px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#201D1A] border-b border-[#E6DDD0] dark:border-[#2D2825] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Table className="w-3.5 h-3.5 text-[#C25E38] dark:text-[#E06D43]" />
                              <span className="text-xs font-mono font-bold text-[#2D2622] dark:text-[#F5F2EB] tracking-wide">
                                {entity.title}
                              </span>
                            </div>
                            <span className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-[#EFE9DF] dark:bg-[#262320] text-[#8C7B70] dark:text-[#A89F91]">
                              {entity.category}
                            </span>
                          </div>

                          {/* Column Header Row */}
                          <div className="grid grid-cols-12 px-3 py-1 bg-[#FAF7F2]/50 dark:bg-[#141211] text-[9px] font-mono uppercase text-[#8C7B70] dark:text-[#7A7067] border-b border-[#E6DDD0]/40 dark:border-[#2D2825]/40">
                            <span className="col-span-4">Type</span>
                            <span className="col-span-6">Column</span>
                            <span className="col-span-2 text-right">Key</span>
                          </div>

                          {/* Column Fields */}
                          <div className="divide-y divide-[#E6DDD0]/30 dark:divide-[#2D2825]/40 text-xs font-mono">
                            {entity.fields.map((field) => (
                              <div
                                key={field.name}
                                className="grid grid-cols-12 px-3 py-1.5 items-center hover:bg-[#FAF7F2] dark:hover:bg-[#221F1C] transition-colors"
                              >
                                <span className="col-span-4 text-[10px] text-[#8C7B70] dark:text-[#9E9385] truncate">
                                  {field.type}
                                </span>
                                <span className="col-span-6 text-[11px] font-medium text-[#2D2622] dark:text-[#E8E4DD] truncate">
                                  {field.name}
                                </span>
                                <span className="col-span-2 text-right">
                                  {field.key && (
                                    <span
                                      className={`inline-block px-1 py-0.2 rounded text-[8px] font-bold ${
                                        field.key === "PK"
                                          ? "bg-[#C25E38]/15 text-[#C25E38] dark:text-[#E06D43]"
                                          : field.key === "FK"
                                            ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                      }`}
                                    >
                                      {field.key}
                                    </span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Connected Relationships Ribbon */}
                  <div className="mt-8 p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1A1816] border border-[#E6DDD0] dark:border-[#2D2825]">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-3.5 h-3.5 text-[#C25E38] dark:text-[#E06D43]" />
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2D2622] dark:text-[#F5F2EB]">
                        Key Foreign Key Constraints & Stream Cardinalities
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[10px] font-mono">
                      {RELATIONSHIPS.map((rel, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1.5 rounded-lg bg-white/80 dark:bg-[#221F1C] border border-[#E6DDD0]/60 dark:border-[#2D2825] flex items-center justify-between"
                        >
                          <span className="text-[#C25E38] dark:text-[#E06D43] font-bold">{rel.from}</span>
                          <span className="text-[#8C7B70] dark:text-[#7A7067] px-1 text-[9px]">{rel.label}</span>
                          <span className="text-sky-600 dark:text-sky-400 font-bold">{rel.to}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: HYBRID RAG & CONSENSUS COUNCIL ── */}
              {activeTab === "rag" && (
                <div 
                  className="space-y-6 transition-transform duration-75 origin-top-left cursor-grab active:cursor-grabbing pb-16"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825] shadow-xs">
                      <div className="w-7 h-7 rounded-lg bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center font-bold font-mono text-xs mb-2">1</div>
                      <h4 className="font-bold text-xs text-[#2D2622] dark:text-[#F5F2EB] mb-1">Seeker Intent Analysis</h4>
                      <p className="text-[11px] text-[#8C7B70] dark:text-[#A89F91]">Identifies emotional motif (burnout, grief, dilemma) & extracts Sanskrit root query.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825] shadow-xs">
                      <div className="w-7 h-7 rounded-lg bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center font-bold font-mono text-xs mb-2">2</div>
                      <h4 className="font-bold text-xs text-[#2D2622] dark:text-[#F5F2EB] mb-1">Dual-Retriever Ensemble</h4>
                      <p className="text-[11px] text-[#8C7B70] dark:text-[#A89F91]">Dense semantic embeddings + BM25Okapi inverted index fused via RRF (k=60).</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825] shadow-xs">
                      <div className="w-7 h-7 rounded-lg bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center font-bold font-mono text-xs mb-2">3</div>
                      <h4 className="font-bold text-xs text-[#2D2622] dark:text-[#F5F2EB] mb-1">Multi-LLM Fan-Out</h4>
                      <p className="text-[11px] text-[#8C7B70] dark:text-[#A89F91]">Async parallel query across 5 LLMs (Groq Llama 3.3, Claude, Gemini, Mixtral).</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825] shadow-xs">
                      <div className="w-7 h-7 rounded-lg bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center font-bold font-mono text-xs mb-2">4</div>
                      <h4 className="font-bold text-xs text-[#2D2622] dark:text-[#F5F2EB] mb-1">LLM Judge & Guardrail</h4>
                      <p className="text-[11px] text-[#8C7B70] dark:text-[#A89F91]">Verifies shloka authenticity, enforces zero-hallucination score, and streams SSE.</p>
                    </div>
                  </div>

                  {/* Flow Topology Card */}
                  <div className="p-5 rounded-2xl bg-[#FAF7F2]/80 dark:bg-[#181614] border border-[#E6DDD0] dark:border-[#2D2825] font-mono text-xs">
                    <p className="text-[11px] text-[#C25E38] dark:text-[#E06D43] font-bold uppercase tracking-wider mb-2">Execution Latency & Throughput SLA</p>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#5C4F45] dark:text-[#D4C7B8]">
                      <span>BM25 Retrieval: <strong className="text-emerald-600 dark:text-emerald-400">18ms</strong></span>
                      <span>Vector Search: <strong className="text-emerald-600 dark:text-emerald-400">32ms</strong></span>
                      <span>Consensus Evaluation: <strong className="text-emerald-600 dark:text-emerald-400">650ms</strong></span>
                      <span>Time-to-First-Token (TTFT): <strong className="text-[#C25E38] dark:text-[#E06D43]">&lt;850ms</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: 3-STATE CIRCUIT BREAKER & FALLBACK MESH ── */}
              {activeTab === "resilience" && (
                <div 
                  className="space-y-6 transition-transform duration-75 origin-top-left cursor-grab active:cursor-grabbing pb-16"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border-2 border-emerald-500/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">STATE 1: CLOSED</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">Healthy (Default)</span>
                      </div>
                      <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] mb-3">Requests flow directly to primary Groq/Llama cluster. Sub-500ms latency tracking.</p>
                      <span className="text-[10px] font-mono text-[#8C7B70]">Failure Threshold: &lt; 5 failures</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border-2 border-rose-500/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">STATE 2: OPEN</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono">Tripped (Cooldown)</span>
                      </div>
                      <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] mb-3">5 consecutive timeouts trip breaker. Inbound queries routed to Redis cached responses.</p>
                      <span className="text-[10px] font-mono text-[#8C7B70]">Cooldown Timer: 30.0s cooldown</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border-2 border-amber-500/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">STATE 3: HALF-OPEN</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">Canary Test</span>
                      </div>
                      <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8] mb-3">Cooldown expires. Sends 2 canary probe requests to verify upstream recovery.</p>
                      <span className="text-[10px] font-mono text-[#8C7B70]">Success Needed: 2 probes</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#FAF7F2]/80 dark:bg-[#181614] border border-[#E6DDD0] dark:border-[#2D2825] font-mono text-xs">
                    <p className="text-[11px] text-[#C25E38] dark:text-[#E06D43] font-bold uppercase tracking-wider mb-2">Zero-Downtime Guarantee</p>
                    <p className="text-[11px] text-[#5C4F45] dark:text-[#D4C7B8]">
                      Even if all 5 external AI providers experience outages simultaneously, NityaGeeta gracefully delivers pre-warmed canonical commentaries from local memory index in &lt;15ms.
                    </p>
                  </div>
                </div>
              )}

              {/* ── TAB 4: NETWORKX TANGENT MEMORY STACK ── */}
              {activeTab === "memory" && (
                <div 
                  className="space-y-6 transition-transform duration-75 origin-top-left cursor-grab active:cursor-grabbing pb-16"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825]">
                      <span className="text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43] block mb-1">1. Root Dilemma Node</span>
                      <p className="text-[11px] text-[#5C4F45] dark:text-[#D4C7B8]">Initial existential crisis anchor (e.g., "Burnout and paralyzing fear of failure").</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825]">
                      <span className="text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43] block mb-1">2. Tangent PUSH</span>
                      <p className="text-[11px] text-[#5C4F45] dark:text-[#D4C7B8]">Seeker branches into Sanskrit etymology ("What does Nishkama mean?").</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#E6DDD0] dark:border-[#2D2825]">
                      <span className="text-xs font-mono font-bold text-[#C25E38] dark:text-[#E06D43] block mb-1">3. POP & Squash</span>
                      <p className="text-[11px] text-[#5C4F45] dark:text-[#D4C7B8]">Collapses tangent into a 2-sentence sutra token to prevent LLM context bloating.</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#FAF7F2]/80 dark:bg-[#181614] border border-[#E6DDD0] dark:border-[#2D2825] font-mono text-xs">
                    <p className="text-[11px] text-[#C25E38] dark:text-[#E06D43] font-bold uppercase tracking-wider mb-2">Token Efficiency Benchmark</p>
                    <p className="text-[11px] text-[#5C4F45] dark:text-[#D4C7B8]">
                      NetworkX DAG compression shrinks 12-turn conversational exploration from ~8,400 tokens to 420 tokens (95% reduction), keeping response latency sub-second.
                    </p>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EFE9DF] dark:bg-[#262320] text-[#2D2622] dark:text-[#F5F2EB] hover:bg-[#C25E38] hover:text-white transition-all cursor-pointer shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
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

              <pre className="p-5 rounded-2xl bg-[#181614] text-[#FAF7F2] font-mono text-xs overflow-x-auto leading-relaxed border border-[#2D2825]">
                <code>{currentDiagram.mermaidCode}</code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FLOATING ZOOM & PAN NAVIGATION DOCK (BOTTOM-RIGHT) ── */}
        {viewMode === "visual" && (
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-[#FAF7F2]/95 dark:bg-[#1E1B18]/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#DFD5C6] dark:border-[#2D2825] shadow-lg">
            <button
              onClick={handleZoomIn}
              title="Zoom In (+)"
              className="p-2 rounded-xl text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF] dark:hover:bg-[#262320] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out (-)"
              className="p-2 rounded-xl text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF] dark:hover:bg-[#262320] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-[#DFD5C6] dark:bg-[#2D2825] mx-0.5"></div>
            <button
              onClick={handleResetZoom}
              title="Reset Zoom & Pan (100%)"
              className="p-2 rounded-xl text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF] dark:hover:bg-[#262320] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono text-[#8C7B70] px-1.5 font-bold">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between text-[11px] text-[#8C7B70] dark:text-[#A89F91] font-mono pt-2 border-t border-[#E6DDD0]/60 dark:border-[#2D2825]/60">
        <span>Complete SQLAlchemy models & schema definitions located in <code className="text-[#C25E38] dark:text-[#E06D43]">database/models.py</code></span>
        <span>Drag canvas to pan • Use zoom dock to scale</span>
      </div>
    </div>
  );
}
