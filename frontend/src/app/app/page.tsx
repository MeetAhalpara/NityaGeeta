"use client";

import { useState, useEffect, useRef } from "react";
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

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

      // No session in URL (e.g. /app after clicking +) — reset to blank if not submitting
      if (!urlSessionId && !loading) {
        setActiveSessionId(null);
        setMessages([]);
        setQuery("");
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
        updateSessionState(errMessages, messageText, targetSessionId);
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
      updateSessionState(errMessages, messageText, targetSessionId);
    } finally {
      setLoading(false);
    }
  };

  const userName = session?.user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();
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
        <AnimatedSidebar side="left" variant="sidebar" collapsible="icon">
          <AnimatedSidebarHeader>
            <div className="w-full flex items-center justify-start px-2.5 py-1">
              <Link href="/" title="Go to NityaGeeta Home">
                <img
                  src="/assets/images/icons/NG3.png"
                  alt="NityaGeeta Logo"
                  className="w-8 h-8 object-contain select-none shrink-0 cursor-pointer hover:scale-105 transition-transform"
                />
              </Link>
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
                  onSelect={createNewDialogue}
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
                  closeOnSelect={false}
                  icon={<History className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />}
                >
                  <div className="flex items-center justify-between w-full pr-1">
                    <span>Recent</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[#8C7B70] transition-transform duration-200 ${showHistoryMenu ? "rotate-180" : ""}`} />
                  </div>
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

          <AnimatedSidebarFooter className="relative">
            {/* Animated Profile Dropdown Menu */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute bottom-14 left-2 z-50 min-w-[200px] group-data-[state=collapsed]/sidebar:hidden rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E6DDD0] dark:border-[#38332E] shadow-2xl p-1.5 space-y-1 text-xs"
                >
                  <div className="px-3 py-2 border-b border-[#E6DDD0]/60 dark:border-[#38332E]/60 mb-1">
                    <p className="font-bold text-[#2D2622] dark:text-[#F5F2EB] truncate">{userName}</p>
                    <p className="text-[10px] text-[#8C7B70] dark:text-[#A89F91] truncate font-mono">{session?.user?.email || "Seeker Account"}</p>
                  </div>

                  <button
                    onClick={() => { setShowProfileMenu(false); router.push("/"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF] dark:hover:bg-[#332E2A] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-all font-medium"
                  >
                    <Home className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                    <span>Home</span>
                  </button>

                  <button
                    onClick={() => { setShowProfileMenu(false); router.push("/#resources"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF] dark:hover:bg-[#332E2A] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-all font-medium"
                  >
                    <BookOpen className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                    <span>Resources</span>
                  </button>

                  <button
                    onClick={() => { setShowProfileMenu(false); router.push("/profile"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF] dark:hover:bg-[#332E2A] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-all font-medium"
                  >
                    <User className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => { setShowProfileMenu(false); router.push("/#support"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF] dark:hover:bg-[#332E2A] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-all font-medium"
                  >
                    <HelpCircle className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                    <span>Support</span>
                  </button>

                  <div className="pt-1 border-t border-[#E6DDD0]/60 dark:border-[#38332E]/60">
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2 p-1 w-full">
              <div
                onClick={(e) => {
                  if (e.currentTarget.closest('[data-state="collapsed"]')) return;
                  setShowProfileMenu((p) => !p);
                }}
                title="Account Menu"
                className="flex items-center gap-2.5 p-1 rounded-xl cursor-pointer hover:bg-[#EFE9DF]/60 dark:hover:bg-[#2C2824]/60 transition-all group min-w-0 flex-1"
              >
                {session?.user?.image && !imageError ? (
                  <img
                    src={session.user.image}
                    alt={userName}
                    onError={() => setImageError(true)}
                    className="w-7 h-7 rounded-full object-cover shrink-0 select-none shadow-sm group-hover:ring-2 group-hover:ring-[#C25E38]/50 transition-all"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C25E38] to-[#E06D43] flex items-center justify-center text-white font-bold text-[11px] shrink-0 select-none shadow-sm group-hover:ring-2 group-hover:ring-[#C25E38]/50 transition-all">
                    {userInitial}
                  </div>
                )}
                <div className="group-data-[state=collapsed]/sidebar:hidden truncate text-xs font-semibold group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition-colors flex-1">
                  {userName}
                </div>
                <ChevronUp className="group-data-[state=collapsed]/sidebar:hidden w-3.5 h-3.5 text-[#8C7B70] shrink-0" />
              </div>
              <AnimatedThemeToggler
                theme={theme === "dark" ? "dark" : "light"}
                onThemeChange={(t) => setTheme(t)}
                className="group-data-[state=collapsed]/sidebar:hidden p-1.5 rounded-lg text-[#8C7B70] hover:text-[#C25E38] dark:hover:text-[#E06D43] shrink-0"
              />
            </div>
          </AnimatedSidebarFooter>
          <AnimatedSidebarRail />
        </AnimatedSidebar>

        {/* MAIN DIALOGUE CORE WITH RADIAL CONTEXT MENU */}
        <RadialContextMenu menuItems={radialMenuItems}>
          <AnimatedSidebarInset className="flex-1 h-full flex flex-col relative bg-[#FAF7F2] dark:bg-[#1A1816] overflow-hidden">
            
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-5 dark:opacity-10 pointer-events-none z-0"
              style={{ backgroundImage: "url('/assets/images/ChatBG/BG.png')" }}
            />

            {/* Full-width Scrollable Container: Mouse scrolling works anywhere on the window */}
            <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide w-full h-full">
              <div className="px-4 sm:px-8 py-8 space-y-6 flex flex-col w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto min-h-full">

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
                                          const domain = cit.url ? new URL(cit.url).hostname.replace('www.', '') : (cit.source || 'Web Resource');
                                          return (
                                            <a
                                              key={cIdx}
                                              href={cit.url || "#"}
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
