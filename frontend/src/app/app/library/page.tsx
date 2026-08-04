"use client";

import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, Trash2, ChevronRight,
  MessageSquare, Clock, BookOpen, ArrowLeft,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

// ── Types ─────────────────────────────────────────────────────────────────────
interface LocalSession {
  id: string;
  title: string;
  updatedAt: number;       // epoch ms — from localStorage
  messages: { id: string; sender: string; text: string }[];
}

interface DbSession {
  id: string;
  title: string;
  message_count: number;
  last_active_at: string | null;
  created_at: string | null;
}

interface DisplaySession {
  id: string;
  title: string;
  updatedAt: number;       // epoch ms — unified
  messageCount: number;
  preview: string;         // last user question
  source: "local" | "db";
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const STORAGE_KEY = "nityageeta_chat_history";

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)  return `${diffDays} days ago`;
  if (diffDays < 365) return d.toLocaleDateString([], { month: "short", day: "numeric" });
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function groupByDate(sessions: DisplaySession[]): { label: string; items: DisplaySession[] }[] {
  const now = new Date();
  const groups: Record<string, DisplaySession[]> = {
    Today: [], Yesterday: [], "This Week": [], "This Month": [], Older: [],
  };
  for (const s of sessions) {
    const diff = Math.floor((now.getTime() - s.updatedAt) / 86_400_000);
    if (diff === 0)       groups["Today"].push(s);
    else if (diff === 1)  groups["Yesterday"].push(s);
    else if (diff < 7)    groups["This Week"].push(s);
    else if (diff < 30)   groups["This Month"].push(s);
    else                  groups["Older"].push(s);
  }
  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LibraryPage() {
  const { theme, setTheme } = useTheme();
  const { data: authSession, status } = useSession();
  const router = useRouter();

  const [sessions, setSessions] = useState<DisplaySession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingDb, setLoadingDb] = useState(false);

  // Auth guard
  useEffect(() => {
    if (status === "unauthenticated") router.push("/signup");
  }, [status, router]);

  // Load sessions: merge localStorage (fast) + DB (authoritative)
  useEffect(() => {
    // 1. Load from localStorage immediately
    const local: DisplaySession[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: LocalSession[] = JSON.parse(raw);
        for (const s of parsed) {
          const userMsgs = s.messages.filter((m) => m.sender === "user");
          local.push({
            id: s.id,
            title: s.title,
            updatedAt: s.updatedAt,
            messageCount: s.messages.length,
            preview: userMsgs[userMsgs.length - 1]?.text ?? s.title,
            source: "local",
          });
        }
      }
    } catch { /* ignore */ }
    setSessions(local);

    // 2. Fetch from DB and merge (DB wins on conflicts)
    const email = authSession?.user?.email;
    if (!email) return;

    setLoadingDb(true);
    const apiBase = process.env.NEXT_PUBLIC_AUTH_API_BASE || "http://localhost:8000";
    fetch(`${apiBase}/api/v1/sessions/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email: email }),
    })
      .then((r) => r.json())
      .then((data: { sessions: DbSession[] }) => {
        const dbMap = new Map<string, DbSession>();
        for (const s of data.sessions ?? []) dbMap.set(s.id, s);

        setSessions((prev) => {
          const localMap = new Map<string, DisplaySession>(prev.map((s) => [s.id, s]));

          // Add/update with DB sessions
          for (const db of dbMap.values()) {
            const ts = db.last_active_at ? new Date(db.last_active_at).getTime() : Date.now();
            const existing = localMap.get(db.id);
            localMap.set(db.id, {
              id: db.id,
              title: db.title,
              updatedAt: ts,
              messageCount: db.message_count,
              preview: existing?.preview ?? db.title,
              source: "db",
            });
          }

          return Array.from(localMap.values()).sort((a, b) => b.updatedAt - a.updatedAt);
        });
      })
      .catch(() => { /* DB unavailable — localStorage is enough */ })
      .finally(() => setLoadingDb(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authSession?.user?.email]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) => s.title.toLowerCase().includes(q) || s.preview.toLowerCase().includes(q)
    );
  }, [sessions, searchQuery]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  // Open a session — navigate to its URL
  const openSession = (id: string) => router.push(`/app/search/${id}`);

  // Delete from localStorage + DB
  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: LocalSession[] = JSON.parse(raw);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.filter((s) => s.id !== id)));
      }
    } catch { /* ignore */ }

    // UI
    setSessions((prev) => prev.filter((s) => s.id !== id));

    // DB (fire-and-forget)
    const email = authSession?.user?.email;
    if (email) {
      const apiBase = process.env.NEXT_PUBLIC_AUTH_API_BASE || "http://localhost:8000";
      fetch(`${apiBase}/api/v1/sessions/${id}?user_email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      }).catch(() => { /* silent */ });
    }
  };

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#FAF7F2] dark:bg-[#1A1816]">
        <div className="w-10 h-10 border-4 border-[#C25E38]/20 dark:border-[#E06D43]/20 border-t-[#C25E38] dark:border-t-[#E06D43] rounded-full animate-spin" />
      </div>
    );
  }
  if (status === "unauthenticated") return null;

  const userName = authSession?.user?.name ?? "User";

  return (
    <div className="min-h-screen w-screen bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-[#FAF7F2]/95 dark:bg-[#1A1816]/95 backdrop-blur-sm border-b border-[#E6DDD0] dark:border-[#2D2825] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">

        {/* Left: back + breadcrumb */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <button
            onClick={() => router.push("/app")}
            className="flex items-center gap-1.5 text-[#8C7B70] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors"
            aria-label="Back to dialogue"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
          </button>

          <button
            onClick={() => router.push("/app")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
          >
            <img src="/assets/images/icons/NG2.png" alt="NityaGeeta" className="w-6 h-6 object-contain" />
            <span
              className="font-bold text-sm hidden sm:block"
              style={{ fontFamily: '"Cinzel", Georgia, serif' }}
            >
              NityaGeeta
            </span>
          </button>

          <span className="text-[#8C7B70] text-sm hidden sm:block">/</span>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[#C25E38] dark:text-[#E06D43] hidden sm:flex">
            <BookOpen className="w-4 h-4 shrink-0" />
            Library
          </span>
        </div>

        {/* Centre: search */}
        <div className="flex-1 max-w-lg">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-[#8C7B70] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dialogues…"
              className="w-full pl-8 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-[#1C1917] border border-[#E6DDD0] dark:border-[#2D2825] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition-colors text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70]"
            />
          </div>
        </div>

        {/* Right: new + avatar + theme */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push("/app")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#C25E38] dark:bg-[#E06D43] text-white hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Dialogue</span>
          </button>

          <AnimatedThemeToggler
            theme={theme === "dark" ? "dark" : "light"}
            onThemeChange={(t) => setTheme(t)}
            className="p-1.5 rounded-lg text-[#8C7B70] hover:text-[#C25E38] dark:hover:text-[#E06D43]"
          />

          {authSession?.user?.image ? (
            <img
              src={authSession.user.image}
              alt={userName}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C25E38] to-[#E06D43] flex items-center justify-center text-white font-bold text-[11px]">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Stats strip */}
        <div className="flex items-center gap-5 mb-6 text-sm text-[#8C7B70] dark:text-[#A89F91]">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            <strong className="text-[#2D2622] dark:text-[#F5F2EB]">{sessions.length}</strong>
            &nbsp;{sessions.length === 1 ? "dialogue" : "dialogues"}
          </span>
          {loadingDb && (
            <span className="text-xs italic flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-[#C25E38]/30 border-t-[#C25E38] rounded-full animate-spin inline-block" />
              Syncing…
            </span>
          )}
          {searchQuery.trim() && (
            <span className="text-xs">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-60">
            <span className="text-5xl" style={{ fontFamily: '"Noto Serif Devanagari", serif' }}>ॐ</span>
            <p className="font-semibold">
              {searchQuery ? "No dialogues match your search." : "No dialogues yet."}
            </p>
            <p className="text-sm text-[#8C7B70] max-w-xs">
              {searchQuery
                ? "Try different keywords or clear the search."
                : "Ask your first question and your conversations will appear here."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push("/app")}
                className="mt-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#C25E38] dark:bg-[#E06D43] text-white hover:opacity-90 transition-opacity"
              >
                Start a Dialogue
              </button>
            )}
          </div>
        )}

        {/* Grouped session list */}
        {filtered.length > 0 && (
          <div className="space-y-7">
            {grouped.map(({ label, items }) => (
              <section key={label}>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#8C7B70] dark:text-[#A89F91] mb-2.5 px-1">
                  {label}
                </h2>
                <div className="space-y-2">
                  {items.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => openSession(s.id)}
                      className="group flex items-start justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E6DDD0] dark:border-[#2D2825] hover:border-[#C25E38]/40 dark:hover:border-[#E06D43]/40 hover:shadow-sm transition-all cursor-pointer"
                    >
                      {/* Icon */}
                      <div className="mt-0.5 w-9 h-9 rounded-xl bg-[#F4EFE6] dark:bg-[#2C2824] flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate text-[#2D2622] dark:text-[#F5F2EB] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition-colors">
                          {s.title}
                        </p>
                        <p className="text-xs text-[#8C7B70] dark:text-[#A89F91] truncate mt-0.5">
                          {s.preview}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#8C7B70] dark:text-[#A89F91]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(s.updatedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {s.messageCount} msg{s.messageCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        <ChevronRight className="w-4 h-4 text-[#8C7B70] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition-colors" />
                        <button
                          onClick={(e) => deleteSession(s.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
                          aria-label="Delete dialogue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
