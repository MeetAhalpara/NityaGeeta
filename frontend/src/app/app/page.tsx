"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
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
} from "lucide-react";
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
} from "@/components/motion/animated-sidebar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { ReasoningText } from "@/components/agents/loading-states/reasoning-text";
import { SourcesBubble } from "@/components/ui/avatar-group";
import { FormattedChatMessage } from "@/components/ui/formatted-chat-message";



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

/** Generate a UUID v4 for new session IDs */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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

  // On mount: if URL is /app/search/[id], restore that session
  useEffect(() => {
    const match = pathname?.match(/\/app\/search\/([a-zA-Z0-9_-]+)/);
    const urlSessionId = match?.[1] ?? null;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ConversationSession[] = JSON.parse(saved);
        setConversations(parsed);
        if (urlSessionId) {
          const found = parsed.find((s) => s.id === urlSessionId);
          if (found) {
            setActiveSessionId(found.id);
            setMessages(found.messages);
            return;
          }
        }
        // No URL session — start fresh (don't auto-load last session)
      }
    } catch (e) {
      console.error("Failed to load conversation history:", e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/profile");
    router.prefetch("/signin");
    router.prefetch("/signup");
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signup");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#FAF7F2] dark:bg-[#1A1816]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#C25E38]/20 dark:border-[#E06D43]/20 border-t-[#C25E38] dark:border-t-[#E06D43] rounded-full animate-spin" />
          <p className="text-sm text-[#8C7B70] dark:text-[#A89F91] font-sans">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

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
    router.replace("/app", { scroll: false });
  };

  const selectConversation = (sessionItem: ConversationSession) => {
    if (loading) return;
    setActiveSessionId(sessionItem.id);
    setMessages(sessionItem.messages);
    router.replace(`/app/search/${sessionItem.id}`, { scroll: false });
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

  const updateSessionState = (updatedMessages: Message[], promptTitle?: string) => {
    setConversations((prev) => {
      let nextSessions: ConversationSession[] = [];
      let resolvedId = activeSessionId;

      if (activeSessionId) {
        nextSessions = prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, updatedAt: Date.now(), messages: updatedMessages }
            : s
        );
      } else {
        // First message — generate a UUID and update the URL (Perplexity-style)
        const newId = generateUUID();
        resolvedId = newId;
        setActiveSessionId(newId);
        // Update URL without navigation — layout stays exactly the same
        router.replace(`/app/search/${newId}`, { scroll: false });
        const titleText = promptTitle
          ? promptTitle.slice(0, 40) + (promptTitle.length > 40 ? "…" : "")
          : "Dialogue Session";
        const newSession: ConversationSession = {
          id: newId,
          title: titleText,
          updatedAt: Date.now(),
          messages: updatedMessages,
        };
        nextSessions = [newSession, ...prev];

        // Fire-and-forget DB save for the new session
        if (session?.user?.email) {
          saveSessionToDb(newId, session.user.email, updatedMessages, titleText);
        }
      }

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSessions));
      } catch (e) {
        console.error(e);
      }

      // Sync DB on subsequent messages too (fire-and-forget)
      if (resolvedId && session?.user?.email) {
        const titleText = nextSessions.find((s) => s.id === resolvedId)?.title ?? "Dialogue Session";
        saveSessionToDb(resolvedId, session.user.email, updatedMessages, titleText);
      }

      return nextSessions;
    });
  };

  const handleSend = async (textToSend?: string) => {
    if (loading) return; // Prevent multiple simultaneous questions
    const messageText = textToSend || query;
    if (!messageText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: messageText,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!textToSend) setQuery("");
    setLoading(true);

    updateSessionState(nextMessages, messageText);

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
        updateSessionState(finalMessages, messageText);
      } else {
        const statusNote = res ? ` (HTTP ${res.status})` : " — server unreachable";
        const errMessages = [
          ...nextMessages,
          {
            id: (Date.now() + 1).toString(),
            sender: "bot" as const,
            text: `The NityaGeeta server is currently offline${statusNote}. Please start the API with:\n\n\`\`\`\nuvicorn api.main:app --host 0.0.0.0 --port 8000 --reload\n\`\`\`\n\nThen try your question again.`,
          },
        ];
        setMessages(errMessages);
        updateSessionState(errMessages, messageText);
      }
    } catch (err) {
      console.error(err);
      const errMessages = [
        ...nextMessages,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot" as const,
          text: "Something went wrong reaching the server. Please make sure the API is running on port 8000 and try again.",
        },
      ];
      setMessages(errMessages);
    } finally {
      setLoading(false);
    }
  };

  const userName = session?.user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const renderInputBox = (isCentered: boolean) => (
    <div className={`relative flex items-center bg-[#F4EFE6] dark:bg-[#12100F] border border-[#E6DDD0] dark:border-[#2D2825] rounded-full px-3 py-1.5 transition-all focus-within:border-[#C25E38] dark:focus-within:border-[#E06D43] shadow-sm ${isCentered ? "w-full max-w-xl mx-auto" : "w-full"}`}>
      <span className="font-sans text-lg text-[#8C7B70] opacity-60 pl-2 select-none">ॐ</span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
        placeholder={loading ? "NityaGeeta is contemplating your question..." : "Ask any Bhagavad Gita doubt or life decision......"}
        className="flex-1 bg-transparent px-4 py-2.5 text-sm sm:text-base focus:outline-n  text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] min-w-0 disabled:opacity-50"
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
        <AnimatedSidebar side="left" variant="sidebar" collapsible="icon">
          <AnimatedSidebarHeader>
            <div className="w-full flex items-center justify-start px-2.5 py-1">
              <img
                src="/assets/images/icons/NG2.png"
                alt="NityaGeeta Logo"
                className="w-8 h-8 object-contain select-none shrink-0"
              />
            </div>
          </AnimatedSidebarHeader>

          <AnimatedSidebarContent className="px-1.5 py-2 flex flex-col gap-1 overflow-hidden">
            <div className="w-full flex items-center justify-start">
              <AnimatedSidebarTrigger showLabel={false} />
            </div>

            {/* + New Dialogue — always visible (icon when collapsed, icon+label when expanded) */}
            <AnimatedSidebarMenu>
              <AnimatedSidebarMenuItem className="w-full">
                <AnimatedSidebarMenuButton
                  onSelect={() => router.push("/app")}
                  disabled={loading}
                  icon={<Plus className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />}
                >
                  New Dialogue
                </AnimatedSidebarMenuButton>
              </AnimatedSidebarMenuItem>

              {/* History icon — always visible, opens library */}
              <AnimatedSidebarMenuItem className="w-full">
                <AnimatedSidebarMenuButton
                  onSelect={() => setShowHistoryMenu((p) => !p)}
                  isActive={showHistoryMenu}
                  icon={<History className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />}
                >
                  Recent
                </AnimatedSidebarMenuButton>
              </AnimatedSidebarMenuItem>
            </AnimatedSidebarMenu>

            {/* Conversation list — only visible when sidebar is expanded */}
            <div className="group-data-[state=collapsed]/sidebar:hidden flex-1 overflow-hidden flex flex-col min-h-0">
              {showHistoryMenu && (
                <div className="flex-1 overflow-y-auto scrollbar-hide mt-0.5">
                  {conversations.length === 0 ? (
                    <p className="px-2.5 py-2 text-[11px] text-[#8C7B70] italic">No saved history.</p>
                  ) : (() => {
                    const now = Date.now();
                    const groups = [
                      { label: "Today",     items: conversations.filter(s => now - s.updatedAt < 86_400_000) },
                      { label: "Yesterday", items: conversations.filter(s => { const d = now - s.updatedAt; return d >= 86_400_000 && d < 172_800_000; }) },
                      { label: "This Week", items: conversations.filter(s => { const d = now - s.updatedAt; return d >= 172_800_000 && d < 604_800_000; }) },
                      { label: "Older",     items: conversations.filter(s => now - s.updatedAt >= 604_800_000) },
                    ].filter(g => g.items.length > 0);

                    return (
                      <div className="space-y-3 pb-2">
                        {groups.map(({ label, items }) => (
                          <div key={label}>
                            <p className="px-2.5 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#8C7B70]/60 dark:text-[#A89F91]/60">
                              {label}
                            </p>
                            {items.map((item) => {
                              const isActive = activeSessionId === item.id;
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => selectConversation(item)}
                                  className={`group/item flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                                    isActive
                                      ? "bg-[#C25E38]/10 text-[#C25E38] dark:text-[#E06D43] font-semibold"
                                      : "text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF]/50 dark:hover:bg-[#2C2824]/50"
                                  }`}
                                >
                                  <span className="truncate pr-1 leading-snug">{item.title}</span>
                                  <button
                                    onClick={(e) => deleteConversation(item.id, e)}
                                    className="opacity-0 group-hover/item:opacity-60 hover:!opacity-100 p-0.5 hover:text-red-500 transition-all shrink-0"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </AnimatedSidebarContent>

          <AnimatedSidebarFooter>
            <div className="flex items-center gap-3 p-1">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover shrink-0 select-none shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C25E38] to-[#E06D43] flex items-center justify-center text-white font-bold text-xs shrink-0 select-none shadow-sm">
                  {userInitial}
                </div>
              )}
              <div className="flex-1 truncate text-xs font-semibold">{userName}</div>
              <AnimatedThemeToggler
                theme={theme === "dark" ? "dark" : "light"}
                onThemeChange={(t) => setTheme(t)}
                className="p-1.5 rounded-lg text-[#8C7B70] hover:text-[#C25E38] dark:hover:text-[#E06D43] shrink-0"
              />
            </div>
          </AnimatedSidebarFooter>
          <AnimatedSidebarRail />
        </AnimatedSidebar>

        {/* MAIN DIALOGUE CORE */}
        <AnimatedSidebarInset className="flex-1 h-full flex flex-col relative bg-[#FAF7F2] dark:bg-[#1A1816] overflow-hidden">
          
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-5 dark:opacity-10 pointer-events-none z-0"
            style={{ backgroundImage: "url('/assets/images/ChatBG/BG.png')" }}
          />

          {/* Full-width Scrollable Container: Mouse scrolling works anywhere on the window */}
          <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide w-full h-full">
            <div className="px-4 sm:px-8 py-8 space-y-6 flex flex-col w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto min-h-full">

            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 opacity-60 my-auto">
                <span className="text-4xl font-serif text-[#C25E38] dark:text-[#E06D43]">ॐ</span>
                <h3 className="font-serif text-lg font-semibold text-[#2D2622] dark:text-[#F5F2EB]">NityaGeeta Multi-Model Dialogue</h3>
                <p className="text-xs text-[#8C7B70] dark:text-[#A89F91] max-w-sm">
                  Ground your questions in authentic scripture retrieved across 4 canonical Gita resources & evaluated in parallel across 5 AI models.
                </p>
              </div>
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
                                    2. Live Web Resources ({msg.web_citations?.length || msg.citations?.filter(c => c.type === "web" || c.url)?.length || 0})
                                  </span>
                                </button>
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
                                          key={cIdx}
                                          onClick={() => setActiveCandidateTab(cIdx)}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all flex items-center gap-1.5 ${
                                            isActive
                                              ? "bg-[#C25E38] dark:bg-[#E06D43] text-white shadow-sm"
                                              : "bg-[#F4EFE6] dark:bg-[#12100F] text-[#5C4F45] dark:text-[#D4C7B8] border border-[#E6DDD0] dark:border-[#2D2825]"
                                          }`}
                                        >
                                          <span>{cand.model_name}</span>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {msg.candidates && msg.candidates[activeCandidateTab] && (
                                    <div className="p-4 rounded-xl bg-[#F4EFE6]/80 dark:bg-[#12100F]/80 border border-[#E6DDD0] dark:border-[#2D2825] space-y-3">
                                      <div className="flex items-center justify-between text-xs font-mono font-bold text-[#8C7B70]">
                                        <span>Model Perspective: {msg.candidates[activeCandidateTab].model_name}</span>
                                        {msg.scorecards && msg.scorecards[activeCandidateTab] && (
                                          <span className="text-[#C25E38] dark:text-[#E06D43]">
                                            Score: {msg.scorecards[activeCandidateTab].score}/100
                                          </span>
                                        )}
                                      </div>

                                      <div className="max-h-60 overflow-y-auto scrollbar-hide p-3 rounded-lg bg-white/40 dark:bg-black/40 border border-[#E6DDD0]/40 dark:border-[#2D2825]/40">
                                        <FormattedChatMessage content={msg.candidates[activeCandidateTab].response} />
                                      </div>

                                    </div>
                                  )}
                                </div>
                              )}

                              {/* TAB 2 CONTENT: LIVE WEB SEARCH RESOURCES ONLY */}
                              {thinkingTab === "resources" && (
                                <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
                                  {msg.citations?.filter(c => c.type === "web" || c.url)?.length === 0 ? (
                                    <p className="text-xs text-[#8C7B70] italic">No live web citations for this query.</p>
                                  ) : (
                                    msg.citations?.filter(c => c.type === "web" || c.url)?.map((cit, idx) => {
                                      const domain = cit.url ? new URL(cit.url).hostname.replace("www.", "") : cit.source || "Web";
                                      return (
                                        <div key={idx} className="p-3 rounded-lg bg-[#F4EFE6]/60 dark:bg-[#12100F]/60 border border-[#E6DDD0]/60 dark:border-[#2D2825]/60 text-xs space-y-1.5 transition-all hover:border-[#C25E38]/40">
                                          <div className="flex items-center justify-between font-mono font-bold text-[#8C7B70] dark:text-[#A89F91]">
                                            <span className="flex items-center gap-1.5">
                                              <Globe className="w-3.5 h-3.5 text-[#C25E38]" />
                                              {domain}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#C25E38]/10 text-[#C25E38]">Live Web</span>
                                          </div>

                                          <div className="space-y-1">
                                            {cit.url ? (
                                              <a
                                                href={cit.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-sans font-semibold text-[#2D2622] dark:text-[#F5F2EB] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors flex items-center gap-1"
                                              >
                                                <span>{cit.title || domain}</span>
                                                <ExternalLink className="w-3 h-3 inline-block shrink-0" />
                                              </a>
                                            ) : (
                                              <p className="font-sans font-semibold text-[#2D2622] dark:text-[#F5F2EB]">{cit.title || cit.source}</p>
                                            )}
                                            {cit.snippet && (
                                              <p className="font-sans text-[#5C4F45] dark:text-[#D4C7B8] text-xs leading-relaxed">{cit.snippet}</p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}


                            </div>
                          )}
                        </div>
                      )}

                      {/* MAIN SYNTHESIZED GURU RESPONSE (PARSED MARKDOWN & SHLOKA CALLOUTS) */}
                      <FormattedChatMessage content={msg.text} />



                      {/* PERPLEXITY-STYLE AVATAR GROUP / SOURCES BUBBLE AT THE BOTTOM */}
                      {msg.citations && msg.citations.length > 0 && (
                        <SourcesBubble citations={msg.citations} />
                      )}

                    </div>
                  )}

                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start w-full">
                <div className="bg-[#F4EFE6]/40 dark:bg-[#12100F]/40 border-l-[3px] border-[#C25E38] dark:border-[#E06D43] p-4 rounded-r-2xl rounded-bl-none flex items-center space-x-3 text-[#8C7B70] dark:text-[#A89F91]">
                  <ReasoningText variant="cascade" interval={1800} />
                </div>
              </div>
            )}
          </div>
        </div>

          {/* Fixed Bottom Input Bar (Disabled when loading) */}

          <div className="relative z-10 w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-8 pb-6 pt-2 flex flex-col gap-3">
            {renderInputBox(false)}
          </div>
        </AnimatedSidebarInset>
      </div>
    </AnimatedSidebarProvider>
  );
}
