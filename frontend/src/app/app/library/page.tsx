"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, Trash2, ChevronRight,
  MessageSquare, Clock, BookOpen,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  ConversationSession,
  loadAllSessions,
  deleteSession,
} from "@/lib/session-store";

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: diffDays > 365 ? "numeric" : undefined });
}

function groupByDate(sessions: ConversationSession[]): { label: string; items: ConversationSession[] }[] {
  const now = new Date();
  const groups: Record<string, ConversationSession[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    "This Month": [],
    Older: [],
  };
  for (const s of sessions) {
    const diff = Math.floor((now.getTime() - s.updatedAt) / 86_400_000);
    if (diff === 0) groups["Today"].push(s);
    else if (diff === 1) groups["Yesterday"].push(s);
    else if (diff < 7) groups["This Week"].push(s);
    else if (diff < 30) groups["This Month"].push(s);
    else groups["Older"].push(s);
  }
  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

export default function LibraryPage() {
  const { theme, setTheme } = useTheme();
  const { data: authSession, status } = useSession();
  const router = useRouter();

  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/signup");
  }, [status, router]);

  useEffect(() => {
    setSessions(loadAllSessions());
  }, []);

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#FAF7F2] dark:bg-[#1A1816]">
        <div className="w-10 h-10 border-4 border-[#C25E38]/20 dark:border-[#E06D43]/20 border-t-[#C25E38] dark:border-t-[#E06D43] rounded-full animate-spin" />
      </div>
    );
  }
  if (status === "unauthenticated") return null;

  const filtered = sessions
    .filter((s) =>
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const grouped = groupByDate(filtered);

  const openSession = (id: string) => router.push(`/app/search/${id}`);

  const removeSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteSession(id);
    setSessions(updated);
  };

  const userName = authSession?.user?.name ?? "User";

  return (
    <div className="min-h-screen w-screen bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB]">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-[#FAF7F2]/90 dark:bg-[#1A1816]/90 backdrop-blur border-b border-[#E6DDD0] dark:border-[#2D2825] px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: logo + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/app")}
            className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
          >
            <img src="/assets/images/icons/NG2.png" alt="NityaGeeta" className="w-7 h-7 object-contain" />
            <span className="font-bold text-sm hidden sm:block" style={{ fontFamily: '"Cinzel", Georgia, serif' }}>
              NityaGeeta
            </span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#8C7B70] shrink-0" />
          <span className="font-semibold text-sm text-[#C25E38] dark:text-[#E06D43] flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            Library
          </span>
        </div>

        {/* Centre: search bar */}
        <div className="flex-1 max-w-md">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-[#8C7B70] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dialogues…"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-[#1C1917] border border-[#E6DDD0] dark:border-[#2D2825] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition-colors text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70]"
            />
          </div>
        </div>

        {/* Right: new dialogue + avatar + theme */}
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
            <img src={authSession.user.image} alt={userName} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C25E38] to-[#E06D43] flex items-center justify-center text-white font-bold text-xs">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats strip */}
        <div className="flex items-center gap-6 mb-8 text-sm text-[#8C7B70] dark:text-[#A89F91]">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            <strong className="text-[#2D2622] dark:text-[#F5F2EB]">{sessions.length}</strong>
            {sessions.length === 1 ? " dialogue" : " dialogues"}
          </span>
          {searchQuery && (
            <span className="flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 opacity-60">
            <span className="text-5xl" style={{ fontFamily: '"Noto Serif Devanagari", serif' }}>ॐ</span>
            <p className="font-semibold text-base">
              {searchQuery ? "No dialogues match your search." : "No dialogues yet."}
            </p>
            <p className="text-sm text-[#8C7B70] max-w-xs">
              {searchQuery
                ? "Try a different keyword or clear the search."
                : "Start a new dialogue and your conversations will appear here."}
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
        ) : (
          /* Grouped sessions */
          <div className="space-y-8">
            {grouped.map(({ label, items }) => (
              <section key={label}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#8C7B70] dark:text-[#A89F91] mb-3 px-1">
                  {label}
                </h2>
                <div className="space-y-2">
                  {items.map((s) => {
                    const msgCount = s.messages.length;
                    const userMsgs = s.messages.filter((m) => m.sender === "user");
                    const preview = userMsgs[userMsgs.length - 1]?.text ?? s.title;

                    return (
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
                            {preview}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#8C7B70] dark:text-[#A89F91]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(s.updatedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {msgCount} message{msgCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <ChevronRight className="w-4 h-4 text-[#8C7B70] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition-colors" />
                          <button
                            onClick={(e) => removeSession(s.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
