"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus,
  Trash2,
  History,
  Globe,
  Layers,
  Home,
  BookOpen,
  User,
  HelpCircle,
  LogOut,
  RotateCw,
  Copy,
  Clipboard,
  Sun,
  Moon,
  SquarePen,
  Search,
  PanelLeft,
  X,
} from "lucide-react";
import Link from "next/link";
import { RadialContextMenu, RadialMenuItem } from "@/components/ui/radial-context-menu";
import {
  AnimatedSidebarProvider,
  AnimatedSidebar,
  AnimatedSidebarHeader,
  AnimatedSidebarContent,
  AnimatedSidebarFooter,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuItem,
  AnimatedSidebarMenuButton,
  AnimatedSidebarInset,
  AnimatedSidebarTrigger,
  AnimatedSidebarRail,
  useAnimatedSidebar,
} from "@/components/motion/animated-sidebar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { ReasoningText } from "@/components/agents/loading-states/reasoning-text";
import { SourcesBubble } from "@/components/ui/avatar-group";
import { FormattedChatMessage } from "@/components/ui/formatted-chat-message";
import { AgentActivity, type AgentActivityItem } from "@/components/agents/agent-activity";
import { Citations, Citation } from "@/components/agents/citations";
import { EmptyState } from "@/components/ui/empty-state";
import { TopicBreadcrumb } from "@/components/agents/topic-breadcrumb";
import { TangentAccordion, type TangentSummaryItem } from "@/components/agents/tangent-accordion";



interface CitationItem {
  type?: string;
  priority: number;
  source: string;
  page: number;
  chapter?: string;
  verse?: string;
  citation?: string;
  sanskrit?: string;
  translation?: string;
  score?: number;
  url?: string;
  title?: string;
  snippet?: string;
}

interface ScorecardItem {
  model_name: string;
  score: number;
  groundedness_score?: number;
  citation_score?: number;
  clarity_score?: number;
  feedback?: string;
}

interface CandidateItem {
  model_name: string;
  response: string;
  score?: number;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  winning_model?: string;
  best_score?: number;
  reasoning?: string;
  scorecards?: ScorecardItem[];
  candidates?: CandidateItem[];
  citations?: CitationItem[];
  web_citations?: CitationItem[];
}

interface ConversationSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
}

const STORAGE_KEY = "nityageeta_chat_history";

/** Generate a cryptographically secure UUID v4 for new session IDs */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    const timestamp = Date.now();
    for (let i = 0; i < 16; i++) {
      bytes[i] = ((timestamp >> (i * 2)) ^ (i * 17)) & 0xff;
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // RFC 4122 version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Fire-and-forget: save conversation to backend DB (does not block UI) */
async function saveSessionToDb(sessionId: string, userEmail: string, messages: Message[], title: string) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_AUTH_API_BASE || "http://localhost:8000";
    await fetch(`${apiBase}/api/v1/sessions/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, user_email: userEmail, title, messages }),
    });
  } catch {
    // Silently ignore — localStorage is the primary store, DB is secondary
  }
}
function NityaGeetaChatSidebar({
  conversations,
  activeSessionId,
  selectConversation,
  deleteConversation,
  createNewDialogue,
  loading,
  session,
  userName,
  userInitial,
  theme,
  setTheme,
  showProfileMenu,
  setShowProfileMenu,
  imageError,
  setImageError,
  router,
}: {
  conversations: ConversationSession[];
  activeSessionId: string | null;
  selectConversation: (item: ConversationSession) => void;
  deleteConversation: (id: string, e: React.MouseEvent) => void;
  createNewDialogue: () => void;
  loading: boolean;
  session: any;
  userName: string;
  userInitial: string;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  showProfileMenu: boolean;
  setShowProfileMenu: React.Dispatch<React.SetStateAction<boolean>>;
  imageError: boolean;
  setImageError: (err: boolean) => void;
  router: any;
}) {
  const { open, setOpen, toggleSidebar } = useAnimatedSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Filter conversations if searching
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden select-none bg-[#F4EFE6] dark:bg-[#171717] transition-colors duration-200">
      {/* ── UNIFIED PERSISTENT HEADER (Height: 48px / h-12) ── */}
      <div className="h-12 px-2.5 flex items-center justify-between shrink-0 border-b border-[#E6DDD0]/50 dark:border-[#262320] w-full overflow-hidden">
        {/* Left: Brand Logo & Title */}
        <div
          onClick={() => {
            if (!open) {
              toggleSidebar();
            } else {
              router.push("/");
            }
          }}
          title="NityaGeeta"
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="size-9 rounded-xl flex items-center justify-center hover:bg-[#E6DDD0]/60 dark:hover:bg-[#212121] transition-colors shrink-0">
            <img
              src="/assets/images/icons/NG3.png"
              alt="NityaGeeta"
              className="w-6 h-6 object-contain group-hover:scale-105 transition-transform shrink-0"
            />
          </div>
          <span className="group-data-[state=collapsed]/sidebar:hidden font-semibold text-base tracking-tight text-[#2D2622] dark:text-[#ECECEC] hover:opacity-85 transition-opacity whitespace-nowrap pl-0.5">
            NityaGeeta
          </span>
        </div>

        {/* Right: Search & Close (hidden when collapsed) */}
        <div className="group-data-[state=collapsed]/sidebar:hidden flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSearching((p) => !p);
            }}
            title="Search dialogues"
            className={`size-8 rounded-lg flex items-center justify-center text-[#8C7B70] hover:text-[#2D2622] dark:hover:text-[#ECECEC] hover:bg-[#E6DDD0]/60 dark:hover:bg-[#212121] transition-colors cursor-pointer ${
              isSearching ? "text-[#C25E38] dark:text-[#E06D43] bg-[#E6DDD0]/60 dark:bg-[#212121]" : ""
            }`}
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
            title="Close sidebar"
            className="size-8 rounded-lg flex items-center justify-center text-[#8C7B70] hover:text-[#2D2622] dark:hover:text-[#ECECEC] hover:bg-[#E6DDD0]/60 dark:hover:bg-[#212121] transition-colors cursor-pointer"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── PERSISTENT NEW DIALOGUE BUTTON (Locked Coordinates in Both States) ── */}
      <div className="px-2.5 pt-2 shrink-0 w-full overflow-hidden">
        <button
          onClick={createNewDialogue}
          disabled={loading}
          title="New Dialogue"
          className="w-full h-9 rounded-xl bg-[#EFE9DF]/90 dark:bg-[#212121] hover:bg-[#E6DDD0] dark:hover:bg-[#2a2a2a] text-xs font-semibold text-[#2D2622] dark:text-[#ECECEC] transition-colors shadow-2xs cursor-pointer border border-[#DFD5C6]/60 dark:border-[#38332E]/60 disabled:opacity-50 flex items-center overflow-hidden"
        >
          <div className="w-[34px] h-full shrink-0 flex items-center justify-center">
            <SquarePen className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
          </div>
          <span className="group-data-[state=collapsed]/sidebar:hidden whitespace-nowrap pr-3 text-xs font-semibold text-[#2D2622] dark:text-[#ECECEC]">
            New Dialogue
          </span>
        </button>
      </div>

      {/* ── COLLAPSED MIDDLE: History Button Tightly Stacked Below New Dialogue ── */}
      <div className="group-data-[state=expanded]/sidebar:hidden px-2.5 pt-2 shrink-0 w-full overflow-hidden">
        <button
          onClick={toggleSidebar}
          title="Recent Dialogues"
          className="w-full h-9 rounded-xl hover:bg-[#E6DDD0]/60 dark:hover:bg-[#212121] text-[#8C7B70] hover:text-[#2D2622] dark:hover:text-[#ECECEC] transition-colors cursor-pointer border border-transparent hover:border-[#DFD5C6]/60 dark:hover:border-[#38332E]/60 flex items-center overflow-hidden"
        >
          <div className="w-[34px] h-full shrink-0 flex items-center justify-center">
            <History className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
          </div>
        </button>
      </div>

      {/* Collapsed spacer to push footer to bottom */}
      <div className="group-data-[state=expanded]/sidebar:hidden flex-1" />

      {/* Expanded view middle content (Search + Grouped Recents, scrollable) */}
      <div className="group-data-[state=collapsed]/sidebar:hidden flex-1 overflow-y-auto scrollbar-hide px-2.5 pt-2 pb-2.5 space-y-3 min-h-0">

        {/* Search bar when toggled */}
        {isSearching && (
          <div className="px-0.5">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-[#8C7B70]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter dialogues..."
                autoFocus
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#EFE9DF]/80 dark:bg-[#212121] border border-[#DFD5C6] dark:border-[#38332E] text-xs text-[#2D2622] dark:text-[#ECECEC] placeholder-[#8C7B70] focus:outline-none focus:ring-1 focus:ring-[#C25E38]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-[#8C7B70] hover:text-[#2D2622] dark:hover:text-[#ECECEC]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Recents Section */}
        <div>
          <div className="px-1.5 pb-1 flex items-center justify-between text-[11px] font-semibold text-[#8C7B70] dark:text-[#8E8E8E]">
            <span className="tracking-wide">Recents</span>
            {filteredConversations.length > 0 && (
              <span className="text-[10px] font-mono opacity-60">{filteredConversations.length}</span>
            )}
          </div>

          {filteredConversations.length === 0 ? (
            searchQuery ? (
              <p className="px-1.5 py-3 text-[11px] text-[#8C7B70] dark:text-[#8E8E8E] italic">
                No matching dialogues found.
              </p>
            ) : (
              <EmptyState
                compact
                icon={<History className="size-4 text-brand-terracotta" />}
                title="No saved history"
                description="Your past contemplations and dialogue history will appear here."
                className="py-4"
              />
            )
          ) : (() => {
            const now = Date.now();
            const groups = [
              { label: "Today", items: filteredConversations.filter((s) => now - s.updatedAt < 86_400_000) },
              { label: "Yesterday", items: filteredConversations.filter((s) => { const d = now - s.updatedAt; return d >= 86_400_000 && d < 172_800_000; }) },
              { label: "This Week", items: filteredConversations.filter((s) => { const d = now - s.updatedAt; return d >= 172_800_000 && d < 604_800_000; }) },
              { label: "Older", items: filteredConversations.filter((s) => now - s.updatedAt >= 604_800_000) },
            ].filter((g) => g.items.length > 0);

            return (
              <div className="space-y-2.5 mt-1">
                {groups.map(({ label, items }) => (
                  <div key={label}>
                    <p className="px-1.5 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8C7B70]/60 dark:text-[#8E8E8E]/60">
                      {label}
                    </p>
                    <div className="space-y-0.5">
                      {items.map((item) => {
                        const isActive = activeSessionId === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => selectConversation(item)}
                            className={`group/item flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                              isActive
                                ? "bg-[#C25E38]/10 text-[#C25E38] dark:text-[#E06D43] font-medium"
                                : "text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#E6DDD0]/50 dark:hover:bg-[#212121]"
                            }`}
                          >
                            <span className="truncate pr-1 leading-snug">{item.title}</span>
                            <button
                              onClick={(e) => deleteConversation(item.id, e)}
                              title="Delete dialogue"
                              className="opacity-0 group-hover/item:opacity-60 hover:!opacity-100 p-0.5 hover:text-red-500 transition-all shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── UNIFIED PERSISTENT FOOTER ── */}
      <div className="mt-auto p-2 border-t border-[#E6DDD0]/50 dark:border-[#262320] shrink-0 w-full overflow-hidden">
        <div className="flex items-center justify-between gap-1.5 w-full">
          <div
            onClick={() => setShowProfileMenu((p) => !p)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#E6DDD0]/50 dark:hover:bg-[#212121] transition-colors cursor-pointer group flex-1 min-w-0"
          >
            {session?.user?.image && !imageError ? (
              <img
                src={session.user.image}
                alt={userName}
                onError={() => setImageError(true)}
                className="size-7 rounded-full object-cover shrink-0 select-none shadow-sm group-hover:ring-2 group-hover:ring-[#C25E38]/50 transition-all"
              />
            ) : (
              <div className="size-7 rounded-full bg-[#525E62] dark:bg-[#3F484A] flex items-center justify-center text-white font-medium text-[11px] shrink-0 select-none shadow-sm group-hover:ring-2 group-hover:ring-[#C25E38]/50 transition-all">
                {userInitial}
              </div>
            )}
            <div className="group-data-[state=collapsed]/sidebar:hidden min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-[#2D2622] dark:text-[#ECECEC] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition-colors">
                {userName}
              </div>
              <div className="truncate text-[10px] text-[#8C7B70] dark:text-[#8E8E8E]">
                {session?.user?.email ? "Seeker Account" : "Free"}
              </div>
            </div>
            <ChevronUp className="group-data-[state=collapsed]/sidebar:hidden w-3.5 h-3.5 text-[#8C7B70] shrink-0" />
          </div>

          <div className="group-data-[state=collapsed]/sidebar:hidden shrink-0">
            <AnimatedThemeToggler
              theme={theme === "dark" ? "dark" : "light"}
              onThemeChange={(t) => setTheme(t)}
              className="p-1.5 rounded-lg text-[#8C7B70] hover:text-[#C25E38] dark:hover:text-[#E06D43] shrink-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppMainPage() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedThinkingId, setExpandedThinkingId] = useState<string | null>(null);
  const [thinkingTab, setThinkingTab] = useState<"models" | "resources">("models");
  const [activeCandidateTab, setActiveCandidateTab] = useState<number>(0);
  
  const [conversations, setConversations] = useState<ConversationSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showHistoryMenu, setShowHistoryMenu] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Conversation Stack & Tangent Memory State
  const [activeTangent, setActiveTangent] = useState<string | null>(null);
  const [collapsedTangents, setCollapsedTangents] = useState<TangentSummaryItem[]>([]);

  const activeSession = conversations.find((c) => c.id === activeSessionId);
  const activeTopicName = activeSession?.title || "Spiritual & Daily Guidance";

  const handleReturnToMain = () => {
    if (activeTangent) {
      const newSummary: TangentSummaryItem = {
        id: `tangent-${Date.now()}`,
        topicName: activeTangent,
        sutraSummary: `Explored detailed inquiry on ${activeTangent}. Context squashed back to main guidance thread.`,
        turnCount: 2,
      };
      setCollapsedTangents((prev) => [...prev, newSummary]);
      setActiveTangent(null);
    }
  };

  // Ref to the input box & scroll anchor
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isRestoringRef = useRef(false); // true when loading an old session

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    // Use requestAnimationFrame to wait for DOM paint, then scroll
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior, block: "end" });
      });
    });
  };

  // Scroll when messages change — instant on restore, smooth on new message
  useEffect(() => {
    if (messages.length === 0) return;
    if (isRestoringRef.current) {
      // Restoring old session — jump instantly to the bottom
      scrollToBottom("instant");
      isRestoringRef.current = false;
    } else {
      scrollToBottom("smooth");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // On mount + pathname change: restore session from URL, or reset to blank
  useEffect(() => {
    const match = pathname?.match(/\/app\/search\/([a-zA-Z0-9_-]+)/);
    const urlSessionId = match?.[1] ?? null;

    // If currently active or submitting, do not reset state
    if (urlSessionId && urlSessionId === activeSessionId) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed: ConversationSession[] = saved ? JSON.parse(saved) : [];
      setConversations(parsed);

      if (urlSessionId) {
        const found = parsed.find((s) => s.id === urlSessionId);
        if (found) {
          isRestoringRef.current = true;
          setActiveSessionId(found.id);
          setMessages(found.messages);
          return;
        }
      }

      // No session in URL (e.g. /app after clicking +) — reset to blank or prefill from URL query
      if (!urlSessionId && !loading) {
        setActiveSessionId(null);
        setMessages([]);
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const initialQ = urlParams.get("q") || urlParams.get("prompt") || "";
          setQuery(initialQ);
        } else {
          setQuery("");
        }
        setExpandedThinkingId(null);
      }
    } catch (e) {
      console.error("Failed to load conversation history:", e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/profile");
    router.prefetch("/signin");
    router.prefetch("/signup");
  }, [router]);

  const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "true";

  useEffect(() => {
    if (status === "unauthenticated" && !isPreview) {
      router.push("/signup");
    }
  }, [status, router, isPreview]);

  if (status === "loading" && !isPreview) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#FAF7F2] dark:bg-[#1A1816]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#C25E38]/20 dark:border-[#E06D43]/20 border-t-[#C25E38] dark:border-t-[#E06D43] rounded-full animate-spin" />
          <p className="text-sm text-[#8C7B70] dark:text-[#A89F91] font-sans">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" && !isPreview) return null;

  const cleanMarkdownText = (raw: string) => {
    if (!raw) return "";
    return raw
      .replace(/^###\s+/gm, "")
      .replace(/###/g, "")
      .replace(/\$/g, "")
      .replace(/Not applicable in this context\./gi, "")
      .replace(/Although the provided scripture context does not contain direct information.*?\./gi, "")
      .trim();
  };

  const createNewDialogue = () => {
    if (loading) return;
    setActiveSessionId(null);
    setMessages([]);
    setQuery("");
    setExpandedThinkingId(null);
    setActiveCandidateTab(0);
    window.history.replaceState(null, "", "/app");
    router.replace("/app");
  };

  const selectConversation = (sessionItem: ConversationSession) => {
    if (loading) return;
    isRestoringRef.current = true; // signal the scroll effect to jump instantly
    setActiveSessionId(sessionItem.id);
    setMessages(sessionItem.messages);
    window.history.replaceState(null, "", `/app/search/${sessionItem.id}`);
  };

  const deleteConversation = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    const updated = conversations.filter((c) => c.id !== sessionId);
    setConversations(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
        setMessages(updated[0].messages);
      } else {
        createNewDialogue();
      }
    }
  };

  const updateSessionState = (
    updatedMessages: Message[],
    promptTitle?: string,
    explicitSessionId?: string
  ) => {
    let currentSessionId = explicitSessionId || activeSessionId;

    if (!currentSessionId) {
      currentSessionId = generateUUID();
      setActiveSessionId(currentSessionId);
      window.history.replaceState(null, "", `/app/search/${currentSessionId}`);
    }

    const titleText = promptTitle
      ? promptTitle.slice(0, 40) + (promptTitle.length > 40 ? "…" : "")
      : "Dialogue Session";

    setConversations((prev) => {
      let nextSessions: ConversationSession[] = [];
      const existing = prev.find((s) => s.id === currentSessionId);
      if (!existing) {
        const newSession: ConversationSession = {
          id: currentSessionId!,
          title: titleText,
          updatedAt: Date.now(),
          messages: updatedMessages,
        };
        nextSessions = [newSession, ...prev];
      } else {
        nextSessions = prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, updatedAt: Date.now(), messages: updatedMessages }
            : s
        );
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSessions));
      } catch (e) {
        console.error(e);
      }
      return nextSessions;
    });

    if (currentSessionId && session?.user?.email) {
      saveSessionToDb(currentSessionId, session.user.email, updatedMessages, titleText);
    }

    return currentSessionId;
  };

  const handleSend = async (textToSend?: string, isRetry?: boolean) => {
    if (loading) return; // Prevent multiple simultaneous questions
    const messageText = textToSend || query;
    if (!messageText.trim()) return;

    let nextMessages: Message[];

    if (isRetry) {
      // Remove trailing error messages if retrying existing question
      const cleaned = messages.filter(
        (m) =>
          !(
            m.sender === "bot" &&
            (m.text.includes("offline") ||
              m.text.includes("wrong") ||
              m.text.includes("unreachable"))
          )
      );
      const hasUserMsg = cleaned.some(
        (m) => m.sender === "user" && m.text === messageText
      );
      if (!hasUserMsg) {
        cleaned.push({
          id: Date.now().toString(),
          sender: "user",
          text: messageText,
        });
      }
      nextMessages = cleaned;
    } else {
      const userMsg: Message = {
        id: Date.now().toString(),
        sender: "user",
        text: messageText,
      };
      nextMessages = [...messages, userMsg];
    }

    setMessages(nextMessages);
    if (!textToSend) setQuery("");
    setLoading(true);

    const targetSessionId = updateSessionState(nextMessages, messageText);

    try {
      const apiBase = process.env.NEXT_PUBLIC_AUTH_API_BASE || "http://localhost:8000";
      let res = await fetch(`${apiBase}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: messageText }),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch("http://127.0.0.1:8000/api/v1/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: messageText }),
        }).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: cleanMarkdownText(data.answer),
          winning_model: data.winning_model,
          best_score: data.best_score,
          reasoning: data.reasoning,
          scorecards: data.scorecards || [],
          candidates: data.candidates || [],
          citations: data.citations || [],
        };
        const finalMessages = [...nextMessages, botMsg];
        setMessages(finalMessages);
        setActiveCandidateTab(0);
        updateSessionState(finalMessages, messageText, targetSessionId);
      } else {
        const statusNote = res ? ` (HTTP ${res.status})` : " (server offline / unreachable)";
        const errMessages = [
          ...nextMessages,
          {
            id: (Date.now() + 1).toString(),
            sender: "bot" as const,
            text: `### NityaGeeta Knowledge Engine Reconnecting

The scriptural intelligence service is temporarily unreachable${statusNote}. Your question has been saved in this session.

Please click **Retry Question** below or try again in a moment.

---

**Developer Diagnostics:**  
The FastAPI backend service is not active on \`localhost:8000\`.

To start the backend in your terminal from the project root:
\`\`\`powershell
.\\.venv\\Scripts\\python.exe -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
\`\`\`
*Or simply run \`powershell .\\start_backend.ps1\` to launch automatically.*`,
          },
        ];
        setMessages(errMessages);
        updateSessionState(errMessages, messageText, targetSessionId);
      }
    } catch (err) {
      console.error(err);
      const errMessages = [
        ...nextMessages,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot" as const,
          text: `### NityaGeeta Connection Interrupted

Unable to complete dialogue reasoning with the scripture knowledge engine. Your inquiry has been saved.

Please click **Retry Question** below to reconnect.

---

**Developer Diagnostics:**  
Connection to \`http://localhost:8000\` was interrupted or timed out.

Start or verify the backend server:
\`\`\`powershell
.\\.venv\\Scripts\\python.exe -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
\`\`\``,
        },
      ];
      setMessages(errMessages);
      updateSessionState(errMessages, messageText, targetSessionId);
    } finally {
      setLoading(false);
    }
  };

  const userName = session?.user?.name || (isPreview ? "Meet Ahalpara" : "User");
  const userInitial = session?.user?.name ? userName.charAt(0).toUpperCase() : "ME";
  // ID of the most recent bot message — only this one gets the animate-in effect
  const latestBotId = [...messages].reverse().find(m => m.sender === "bot")?.id ?? null;

  const radialMenuItems: RadialMenuItem[] = [
    {
      id: "copy",
      label: "Copy Text",
      icon: Copy,
      action: async () => {
        try {
          const selectedText = window.getSelection()?.toString()?.trim();
          if (selectedText) {
            await navigator.clipboard.writeText(selectedText);
          } else {
            const lastBot = [...messages].reverse().find((m) => m.sender === "bot");
            if (lastBot) {
              await navigator.clipboard.writeText(lastBot.text);
            } else if (query) {
              await navigator.clipboard.writeText(query);
            }
          }
        } catch (e) {
          console.error("Copy error:", e);
        }
      },
    },
    {
      id: "paste",
      label: "Paste Input",
      icon: Clipboard,
      action: async () => {
        // Focus the input box so cursor stays inside the input bar
        inputRef.current?.focus();
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            setQuery((prev) => (prev ? prev + " " + text : text));
          }
        } catch (e) {
          console.warn("Clipboard API read restriction:", e);
          try {
            const text = window.prompt("Paste text here:");
            if (text) {
              setQuery((prev) => (prev ? prev + " " + text : text));
            }
          } catch (pErr) {
            console.error("Paste fallback error:", pErr);
          }
        }
      },
    },
    {
      id: "refresh",
      label: "Refresh Chat",
      icon: RotateCw,
      action: () => {
        const lastUser = [...messages].reverse().find((m) => m.sender === "user")?.text;
        if (lastUser) {
          handleSend(lastUser, true);
        } else {
          createNewDialogue();
        }
      },
    },
    {
      id: "new",
      label: "New Dialogue",
      icon: Plus,
      action: () => createNewDialogue(),
    },
    {
      id: "theme",
      label: theme === "dark" ? "Light Mode" : "Dark Mode",
      icon: theme === "dark" ? Sun : Moon,
      action: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
    {
      id: "home",
      label: "Go Home",
      icon: Home,
      action: () => router.push("/"),
    },
  ];

  const renderInputBox = (isCentered: boolean) => (
    <div className={`relative flex items-center bg-[#F4EFE6] dark:bg-[#12100F] border border-transparent focus-within:border-[#C25E38] dark:focus-within:border-[#E06D43] rounded-full px-3 py-1.5 transition-all shadow-sm ${isCentered ? "w-full max-w-xl mx-auto" : "w-full"}`}>
      <span className="font-sans text-lg text-[#8C7B70] opacity-60 pl-2 select-none">ॐ</span>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
        placeholder={loading ? "NityaGeeta is contemplating your question..." : "Have questions? Type here..."}
        className="flex-1 bg-transparent px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-0 outline-none text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] min-w-0 disabled:opacity-50"
        disabled={loading}
      />
      <button
        onClick={() => handleSend()}
        disabled={loading || !query.trim()}
        className="w-9 h-9 rounded-full bg-[#C25E38] dark:bg-[#E06D43] text-white flex items-center justify-center hover:scale-105 disabled:opacity-40 shrink-0 shadow-sm transition-all"
      >
        <Send className="w-4 h-4 text-white" />
      </button>
    </div>
  );

  return (
    <AnimatedSidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-screen overflow-hidden bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB] transition-colors duration-200">
        
        {/* SIDEBAR: N logo | [| ] | + | History */}
        {/* SIDEBAR: Exact ChatGPT Layout (Image 1 Collapsed, Image 2 Expanded) */}
        <AnimatedSidebar side="left" variant="sidebar" collapsible="icon" className="border-r border-[#E6DDD0]/80 dark:border-[#262320]">
          <NityaGeetaChatSidebar
            conversations={conversations}
            activeSessionId={activeSessionId}
            selectConversation={selectConversation}
            deleteConversation={deleteConversation}
            createNewDialogue={createNewDialogue}
            loading={loading}
            session={session}
            userName={userName}
            userInitial={userInitial}
            theme={theme}
            setTheme={(t) => setTheme(t)}
            showProfileMenu={showProfileMenu}
            setShowProfileMenu={setShowProfileMenu}
            imageError={imageError}
            setImageError={setImageError}
            router={router}
          />
          <AnimatedSidebarRail />
        </AnimatedSidebar>

        {/* Animated Profile Dropdown Menu - ChatGPT style floating menu */}
        <AnimatePresence>
          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setShowProfileMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.12 } }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "bottom left" }}
                className="fixed bottom-16 left-3 md:left-4 z-[9999] min-w-[220px] rounded-2xl bg-[#FAF7F2]/95 dark:bg-[#1f1d1b]/95 backdrop-blur-2xl border border-[#DFD5C6] dark:border-[#38332E] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.45)] p-2 space-y-1 text-xs overflow-hidden"
              >
                <div className="px-3 py-2.5 border-b border-[#E6DDD0]/60 dark:border-[#38332E]/60 mb-1">
                  <p className="font-bold text-[#2D2622] dark:text-[#F5F2EB] truncate text-sm">{userName || "Meet Ahalpara"}</p>
                  <p className="text-[10px] text-[#8C7B70] dark:text-[#A89F91] truncate font-mono">{session?.user?.email || "Seeker Account"}</p>
                </div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
                  }}
                  className="space-y-1"
                >
                  {[
                    { label: "Home", icon: Home, action: () => { setShowProfileMenu(false); router.push("/"); } },
                    { label: "Resources", icon: BookOpen, action: () => { setShowProfileMenu(false); router.push("/#resources"); } },
                    { label: "Profile", icon: User, action: () => { setShowProfileMenu(false); router.push("/profile"); } },
                    { label: "Support", icon: HelpCircle, action: () => { setShowProfileMenu(false); router.push("/#support"); } },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.label}
                        variants={{
                          hidden: { opacity: 0, y: -6 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
                          },
                        }}
                        onClick={item.action}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF] dark:hover:bg-[#332E2A] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-all font-medium cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                        <span>{item.label}</span>
                      </motion.button>
                    );
                  })}

                  <div className="pt-1 border-t border-[#E6DDD0]/60 dark:border-[#38332E]/60">
                    <motion.button
                      variants={{
                        hidden: { opacity: 0, y: -6 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
                        },
                      }}
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MAIN DIALOGUE CORE WITH RADIAL CONTEXT MENU */}
        <RadialContextMenu menuItems={radialMenuItems}>
          <AnimatedSidebarInset className="flex-1 h-full flex flex-col relative bg-[#FAF7F2] dark:bg-[#1A1816] overflow-hidden">
            
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-5 dark:opacity-10 pointer-events-none z-0"
              style={{ backgroundImage: "url('/assets/images/ChatBG/BG.png')" }}
            />

            {/* TOP APPLE-STYLE MINIMALIST HEADER */}
            <header className="relative z-20 w-full flex items-center justify-between px-4 sm:px-6 h-14 border-b border-[#E6DDD0]/40 dark:border-[#2D2825]/40 bg-[#FAF7F2]/80 dark:bg-[#1A1816]/80 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <AnimatedSidebarTrigger className="size-8 rounded-lg flex items-center justify-center text-[#8C7B70] hover:text-[#2D2622] dark:hover:text-[#F5F2EB] hover:bg-[#EFE9DF]/60 dark:hover:bg-[#262320]/60 transition-colors shrink-0" />
                <TopicBreadcrumb
                  mainTopic={activeTopicName}
                  activeTangent={activeTangent}
                  onPopTangent={handleReturnToMain}
                  className="max-w-xs sm:max-w-md border-none bg-transparent dark:bg-transparent px-1 py-0 shadow-none"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => createNewDialogue()}
                  title="Start fresh dialogue"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] hover:text-[#C25E38] dark:hover:text-[#E06D43] hover:bg-[#EFE9DF]/60 dark:hover:bg-[#262320]/60 transition-colors cursor-pointer"
                >
                  <SquarePen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Dialogue</span>
                </button>
                <AnimatedThemeToggler />
              </div>
            </header>

            {/* Full-width Scrollable Container: Mouse scrolling works anywhere on the window */}
            <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide w-full h-full">
              <div className="px-4 sm:px-8 py-6 space-y-6 flex flex-col w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto min-h-full">

                {/* SŪTRA COLLAPSED TANGENTS ACCORDION */}
                {collapsedTangents.length > 0 && (
                  <TangentAccordion tangents={collapsedTangents} />
                )}

              {messages.length === 0 ? (
                <div className="flex-1 my-auto" />
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.sender === "user" ? (
                      <div className="max-w-[80%] bg-[#EFE9DF] dark:bg-[#2C2824] rounded-2xl rounded-tr-none px-5 py-3.5 shadow-sm border border-[#E6DDD0]/40 dark:border-[#3C3630]/40">
                        <p className="text-sm sm:text-base leading-relaxed text-[#2D2622] dark:text-[#F5F2EB] font-sans">{msg.text}</p>
                      </div>
                    ) : (
                      <div className="w-full bg-[#F4EFE6]/40 dark:bg-[#12100F]/40 border-l-[3px] border-[#C25E38] dark:border-[#E06D43] rounded-r-2xl rounded-bl-none p-6 space-y-5 shadow-sm">
                        
                        {/* PERPLEXITY-STYLE CLEAN THINKING DROPDOWN HEADER (WITHOUT BADGES/BRAIN ICONS) */}
                        {(msg.candidates?.length > 0 || msg.citations?.length > 0) && (
                          <div className="border-b border-[#E6DDD0]/60 dark:border-[#2D2825]/60 pb-2">
                            <button
                              onClick={() => setExpandedThinkingId((prev) => (prev === msg.id ? null : msg.id))}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8C7B70] dark:text-[#A89F91] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors"
                            >
                              <span>NityaGeeta's analysis is provided below</span>

                              {expandedThinkingId === msg.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {/* EXPANDABLE THINKING DRAWER (TAB 1: 5-MODEL PERSPECTIVES, TAB 2: RETRIEVED SCRIPTURE RESOURCES) */}
                            {expandedThinkingId === msg.id && (
                              <div className="mt-3 p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#E6DDD0] dark:border-[#2D2825] space-y-4">
                                
                                {/* TABS SELECTOR */}
                                <div className="flex items-center gap-3 border-b border-[#E6DDD0]/60 dark:border-[#2D2825]/60 pb-2">
                                  <button
                                    onClick={() => setThinkingTab("models")}
                                    className={`flex items-center gap-1.5 text-xs font-semibold transition-all ${
                                      thinkingTab === "models"
                                        ? "text-[#C25E38] dark:text-[#E06D43] border-b-2 border-[#C25E38] pb-1"
                                        : "text-[#8C7B70] hover:text-[#2D2622]"
                                    }`}
                                  >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>1. Multiple Brain Perspectives</span>
                                  </button>

                                  {/* TAB 2 HEADER */}
                                  {(() => {
                                    const webCitations = msg.web_citations?.length 
                                      ? msg.web_citations 
                                      : msg.citations?.filter(c => c.type === "web" || Boolean(c.url)) || [];
                                    return (
                                      <>
                                        <button
                                          onClick={() => setThinkingTab("resources")}
                                          className={`flex items-center gap-1.5 text-xs font-semibold transition-all ${
                                            thinkingTab === "resources"
                                              ? "text-[#C25E38] dark:text-[#E06D43] border-b-2 border-[#C25E38] pb-1"
                                              : "text-[#8C7B70] hover:text-[#2D2622]"
                                          }`}
                                        >
                                          <Globe className="w-3.5 h-3.5" />
                                          <span>
                                            2. Live Web Resources ({webCitations.length})
                                          </span>
                                        </button>
                                      </>
                                    );
                                  })()}
                                </div>


                                {/* TAB 1 CONTENT: 5 MODEL ENSEMBLE */}
                                {thinkingTab === "models" && (
                                  <div className="space-y-3">
                                    {msg.reasoning && (
                                      <div className="p-3 rounded-lg bg-[#C25E38]/8 dark:bg-[#E06D43]/12 border border-[#C25E38]/20 text-xs text-[#2D2622] dark:text-[#F5F2EB]">
                                        <span className="font-bold text-[#C25E38] dark:text-[#E06D43] uppercase tracking-wider block mb-1">Synthesized Reasoning Summary</span>
                                        <p className="leading-relaxed">{msg.reasoning}</p>
                                      </div>
                                    )}

                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                      {msg.candidates?.map((cand, cIdx) => {
                                        const isActive = activeCandidateTab === cIdx;
                                        return (
                                          <button
                                            key={cand.model_name || cIdx}
                                            onClick={() => setActiveCandidateTab(cIdx)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                                              isActive
                                                ? "bg-[#C25E38] dark:bg-[#E06D43] text-white shadow-sm font-bold"
                                                : "bg-[#EFE9DF] dark:bg-[#262320] text-[#5C4F45] dark:text-[#A89F91] hover:text-[#2D2622]"
                                            }`}
                                          >
                                            <span>{cand.model_name}</span>
                                            <span className="text-[10px] opacity-75">({cand.score ?? msg.scorecards?.find(s => s.model_name === cand.model_name)?.score ?? 90}/100)</span>
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {msg.candidates?.[activeCandidateTab] && (
                                      <div className="mt-3 p-4 rounded-xl bg-[#EFE9DF]/60 dark:bg-[#262320]/60 border border-[#E6DDD0] dark:border-[#38332E] text-xs space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-[#C25E38] dark:text-[#E06D43]">
                                            {msg.candidates[activeCandidateTab].model_name} Full Response
                                          </span>
                                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#C25E38]/10 text-[#C25E38] dark:text-[#E06D43] font-bold">
                                            Score: {msg.candidates[activeCandidateTab].score}/100
                                          </span>
                                        </div>
                                        <p className="text-[#5C4F45] dark:text-[#D4C7B8] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto pr-2">
                                          {msg.candidates[activeCandidateTab].response}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* TAB 2 CONTENT: LIVE EXTERNAL WEB RESOURCES ONLY */}
                                {thinkingTab === "resources" && (() => {
                                  const webCitations = msg.web_citations?.length 
                                    ? msg.web_citations 
                                    : msg.citations?.filter(c => c.type === "web" || Boolean(c.url)) || [];
                                  
                                  return (
                                    <div className="space-y-3">
                                      {webCitations.length === 0 ? (
                                        <p className="text-xs text-[#8C7B70] dark:text-[#A89F91] italic p-2">No external live web links retrieved for this response.</p>
                                      ) : (
                                        webCitations.map((cit, cIdx) => {
                                          const safeUrl = (() => {
                                            if (!cit.url) return "#";
                                            try {
                                              const parsed = new URL(cit.url);
                                              if (parsed.protocol === "http:" || parsed.protocol === "https:") {
                                                return parsed.origin + parsed.pathname + parsed.search + parsed.hash;
                                              }
                                            } catch {
                                              // Invalid URL
                                            }
                                            return "#";
                                          })();

                                          const domain = (() => {
                                            try {
                                              return cit.url ? new URL(cit.url).hostname.replace('www.', '') : (cit.source || 'Web Resource');
                                            } catch {
                                              return cit.source || 'Web Resource';
                                            }
                                          })();

                                          return (
                                            <a
                                              key={cIdx}
                                              href={safeUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-3 rounded-lg bg-[#EFE9DF]/50 dark:bg-[#262320]/50 border border-[#E6DDD0] dark:border-[#38332E] hover:border-[#C25E38]/50 transition-all flex items-start gap-2.5 text-xs block group"
                                            >
                                              <div className="p-1.5 rounded-md bg-[#C25E38]/10 text-[#C25E38] dark:text-[#E06D43] shrink-0 mt-0.5">
                                                <Globe className="w-3.5 h-3.5" />
                                              </div>
                                              <div className="min-w-0 flex-1 space-y-1">
                                                <div className="font-sans font-semibold text-[#2D2622] dark:text-[#F5F2EB] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition-colors flex items-center gap-1 justify-between">
                                                  <span className="truncate">{cit.title || domain}</span>
                                                  <ExternalLink className="w-3 h-3 shrink-0 text-[#C25E38]" />
                                                </div>
                                                {cit.snippet && (
                                                  <p className="font-sans text-[#5C4F45] dark:text-[#D4C7B8] text-xs leading-relaxed line-clamp-2">{cit.snippet}</p>
                                                )}
                                              </div>
                                            </a>
                                          );
                                        })
                                      )}
                                    </div>
                                  );
                                })()}


                              </div>
                            )}
                          </div>
                        )}

                        <motion.div
                          key={msg.id}
                          initial={msg.id === latestBotId ? { opacity: 0, filter: "blur(8px)", y: 10 } : false}
                          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                          <FormattedChatMessage content={msg.text} />

                          {(msg.text.includes("offline") || msg.text.includes("wrong") || msg.text.includes("unreachable")) && (
                            <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-[#E6DDD0]/40 dark:border-[#2D2825]/40 mt-3">
                              <button
                                onClick={() => {
                                  const lastUserMsg = messages.filter((m) => m.sender === "user").pop()?.text;
                                  if (lastUserMsg) {
                                    handleSend(lastUserMsg, true);
                                  }
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white font-sans text-xs font-bold shadow-md hover:bg-[#a84e2c] transition-all cursor-pointer"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                                <span>Retry Question</span>
                              </button>

                              <button
                                onClick={() => createNewDialogue()}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EFE9DF] dark:bg-[#2C2824] text-[#2D2622] dark:text-[#F5F2EB] border border-[#DFD5C6] dark:border-[#38332E] font-sans text-xs font-bold hover:border-[#C25E38] transition-all cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 text-[#C25E38] dark:text-[#E06D43]" />
                                <span>Start New Dialogue</span>
                              </button>
                            </div>
                          )}
                        </motion.div>



                        {/* CITATIONS & SOURCES DRAWER */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="pt-2">
                            <Citations
                              idPrefix={`msg-${msg.id}`}
                              citations={msg.citations.map((c, i) => ({
                                id: `cite-${msg.id}-${i}`,
                                title: c.title || c.source || `Scriptural Reference ${i + 1}`,
                                domain: c.url
                                  ? new URL(c.url).hostname.replace(/^www\./, "")
                                  : "nityageeta.org",
                                url: c.url,
                                chapter: c.chapter,
                                verse: c.verse,
                                page: c.page,
                                quote: c.translation || c.snippet || c.sanskrit,
                              }))}
                              defaultOpen={false}
                            />
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                ))
              )}
              
              {loading && (
                <div className="flex justify-start w-full">
                  <div className="w-full max-w-2xl bg-[#F4EFE6]/40 dark:bg-[#12100F]/40 border-l-[3px] border-[#C25E38] dark:border-[#E06D43] p-4 rounded-r-2xl rounded-bl-none">
                    <AgentActivity
                      status="working"
                      contentType="step"
                      items={[
                        { id: "s1", type: "step", label: "Consulting Sadhaka-Sanjivani & Vedic corpus", status: "complete" },
                        { id: "s2", type: "step", label: "Synthesizing consensus across Multi-LLM Council (Gemini, DeepSeek, Claude, Llama)", status: "active", meta: "5 models" },
                        { id: "s3", type: "step", label: "Verifying canonical verse citations & commentary accuracy", status: "pending" }
                      ]}
                    />
                  </div>
                </div>
              )}
              {/* Invisible anchor — always scroll here */}
              <div ref={bottomRef} className="h-1 shrink-0" />
            </div>
          </div>

            {/* Fixed Bottom Input Bar (Disabled when loading) */}

            <div className="relative z-10 w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-8 pb-6 pt-2 flex flex-col gap-3">
              {renderInputBox(false)}
            </div>
          </AnimatedSidebarInset>
        </RadialContextMenu>
      </div>
    </AnimatedSidebarProvider>
  );
}
