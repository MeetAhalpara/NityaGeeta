"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Send, Plus, Trash2, History, Globe, Layers,
  ChevronDown, ChevronUp, ExternalLink, Library,
} from "lucide-react";
import {
  AnimatedSidebarProvider, AnimatedSidebar, AnimatedSidebarHeader,
  AnimatedSidebarContent, AnimatedSidebarFooter, AnimatedSidebarMenu,
  AnimatedSidebarMenuItem, AnimatedSidebarMenuButton, AnimatedSidebarInset,
  AnimatedSidebarTrigger, AnimatedSidebarRail,
} from "@/components/motion/animated-sidebar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { ReasoningText } from "@/components/agents/loading-states/reasoning-text";
import { SourcesBubble } from "@/components/ui/avatar-group";
import { FormattedChatMessage } from "@/components/ui/formatted-chat-message";
import {
  ConversationSession, Message,
  loadAllSessions, upsertSession, deleteSession,
  generateSessionId, cleanMarkdownText, sendChatMessage,
} from "@/lib/session-store";

export default function SessionThreadPage() {
  const { theme, setTheme } = useTheme();
  const { data: authSession, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationSession[]>([]);
  const [expandedThinkingId, setExpandedThinkingId] = useState<string | null>(null);
  const [thinkingTab, setThinkingTab] = useState<"models" | "resources">("models");
  const [activeCandidateTab, setActiveCandidateTab] = useState(0);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialSentRef = useRef(false);

  // Auth guard
  useEffect(() => {
    if (status === "unauthenticated") router.push("/signup");
  }, [status, router]);

  // Load all sessions + restore this thread
  useEffect(() => {
    const all = loadAllSessions();
    setConversations(all);
    const current = all.find((s) => s.id === sessionId);
    if (current) setMessages(current.messages);
  }, [sessionId]);

  // Auto-send the initial question from ?q= param (only once)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && messages.length === 0 && !initialSentRef.current) {
      initialSentRef.current = true;
      handleSend(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#FAF7F2] dark:bg-[#1A1816]">
        <div className="w-10 h-10 border-4 border-[#C25E38]/20 dark:border-[#E06D43]/20 border-t-[#C25E38] dark:border-t-[#E06D43] rounded-full animate-spin" />
      </div>
    );
  }
  if (status === "unauthenticated") return null;

  const persistMessages = (msgs: Message[], title?: string) => {
    const all = loadAllSessions();
    const existing = all.find((s) => s.id === sessionId);
    const updated: ConversationSession = {
      id: sessionId,
      title: title ?? existing?.title ?? "Dialogue Session",
      updatedAt: Date.now(),
      messages: msgs,
    };
    upsertSession(updated);
    setConversations(loadAllSessions());
  };

  const handleSend = async (textToSend?: string) => {
    if (loading) return;
    const text = (textToSend ?? query).trim();
    if (!text) return;
    if (!textToSend) setQuery("");
    setLoading(true);

    const userMsg: Message = { id: Date.now().toString(), sender: "user", text };
    const next = [...messages, userMsg];
    setMessages(next);
    persistMessages(next, text.slice(0, 40) + (text.length > 40 ? "…" : ""));

    try {
      const data = await sendChatMessage(text);
      if (data) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: cleanMarkdownText(data.answer),
          winning_model: data.winning_model,
          best_score: data.best_score,
          reasoning: data.reasoning,
          scorecards: data.scorecards ?? [],
          candidates: data.candidates ?? [],
          citations: data.citations ?? [],
        };
        const final = [...next, botMsg];
        setMessages(final);
        setActiveCandidateTab(0);
        persistMessages(final);
      } else {
        const errMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "The NityaGeeta server is currently offline. Start the API with:\n\n```\nuvicorn api.main:app --host 0.0.0.0 --port 8000 --reload\n```",
        };
        const final = [...next, errMsg];
        setMessages(final);
        persistMessages(final);
      }
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "Something went wrong reaching the server. Please try again.",
      };
      setMessages([...next, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const createNewThread = () => {
    if (loading) return;
    router.push("/app");
  };

  const openThread = (s: ConversationSession) => {
    if (loading) return;
    router.push(`/app/search/${s.id}`);
  };

  const removeThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    const updated = deleteSession(id);
    setConversations(updated);
    if (id === sessionId) router.push("/app");
  };

  const userName = authSession?.user?.name ?? "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <AnimatedSidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-screen overflow-hidden bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB]">

        {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
        <AnimatedSidebar side="left" variant="sidebar" collapsible="icon">
          <AnimatedSidebarHeader>
            <div className="w-full flex items-center justify-start px-2.5 py-1">
              <img src="/assets/images/icons/NG2.png" alt="NityaGeeta" className="w-8 h-8 object-contain select-none shrink-0" />
            </div>
          </AnimatedSidebarHeader>

          <AnimatedSidebarContent className="px-1.5 py-2 space-y-2">
            <div className="w-full flex items-center justify-start">
              <AnimatedSidebarTrigger showLabel={false} />
            </div>

            <AnimatedSidebarMenu>
              <AnimatedSidebarMenuItem className="w-full">
                <AnimatedSidebarMenuButton
                  onClick={createNewThread}
                  disabled={loading}
                  icon={<Plus className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />}
                >
                  New Dialogue
                </AnimatedSidebarMenuButton>
              </AnimatedSidebarMenuItem>

              <AnimatedSidebarMenuItem className="w-full">
                <AnimatedSidebarMenuButton
                  onClick={() => router.push("/app/library")}
                  icon={<Library className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />}
                >
                  Library
                </AnimatedSidebarMenuButton>
              </AnimatedSidebarMenuItem>

              <AnimatedSidebarMenuItem className="w-full">
                <AnimatedSidebarMenuButton
                  onClick={() => setShowHistoryMenu((p) => !p)}
                  isActive={showHistoryMenu}
                  icon={<History className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />}
                >
                  Recent
                </AnimatedSidebarMenuButton>
              </AnimatedSidebarMenuItem>
            </AnimatedSidebarMenu>

            {showHistoryMenu && (
              <div className="mt-2 space-y-1 px-1 pt-1 border-t border-[#E6DDD0]/40 dark:border-[#2D2825]/40 max-h-60 overflow-y-auto scrollbar-hide">
                {conversations.length === 0 ? (
                  <p className="px-2 py-1.5 text-[11px] text-[#8C7B70] italic">No history yet.</p>
                ) : (
                  conversations.slice(0, 12).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openThread(item)}
                      className={`group w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                        item.id === sessionId
                          ? "bg-[#C25E38]/10 text-[#C25E38] dark:text-[#E06D43] font-bold"
                          : "text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF]/50 dark:hover:bg-[#2C2824]/50"
                      }`}
                    >
                      <span className="truncate pr-1">{item.title}</span>
                      <button
                        onClick={(e) => removeThread(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 transition-all shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </AnimatedSidebarContent>

          <AnimatedSidebarFooter>
            <div className="flex items-center gap-3 p-1">
              {authSession?.user?.image ? (
                <img src={authSession.user.image} alt={userName} className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C25E38] to-[#E06D43] flex items-center justify-center text-white font-bold text-xs shrink-0">
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

        {/* ── MAIN THREAD ──────────────────────────────────────────────────── */}
        <AnimatedSidebarInset className="flex-1 h-full flex flex-col relative bg-[#FAF7F2] dark:bg-[#1A1816] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-5 dark:opacity-10 pointer-events-none z-0"
            style={{ backgroundImage: "url('/assets/images/ChatBG/BG.png')" }}
          />

          {/* Messages */}
          <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide w-full h-full">
            <div className="px-4 sm:px-8 py-8 space-y-6 flex flex-col w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto min-h-full">

              {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.sender === "user" ? (
                    <div className="max-w-[80%] bg-[#EFE9DF] dark:bg-[#2C2824] rounded-2xl rounded-tr-none px-5 py-3.5 shadow-sm border border-[#E6DDD0]/40 dark:border-[#3C3630]/40">
                      <p className="text-sm sm:text-base leading-relaxed font-sans">{msg.text}</p>
                    </div>
                  ) : (
                    <div className="w-full bg-[#F4EFE6]/40 dark:bg-[#12100F]/40 border-l-[3px] border-[#C25E38] dark:border-[#E06D43] rounded-r-2xl rounded-bl-none p-6 space-y-5 shadow-sm">

                      {/* Thinking toggle */}
                      {(msg.candidates?.length ?? 0) > 0 && (
                        <div className="border-b border-[#E6DDD0]/60 dark:border-[#2D2825]/60 pb-2">
                          <button
                            onClick={() => setExpandedThinkingId((p) => (p === msg.id ? null : msg.id))}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8C7B70] hover:text-[#C25E38] transition-colors"
                          >
                            <span>NityaGeeta&apos;s analysis is provided below</span>
                            {expandedThinkingId === msg.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {expandedThinkingId === msg.id && (
                            <div className="mt-3 p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#E6DDD0] dark:border-[#2D2825] space-y-4">
                              {/* Tab bar */}
                              <div className="flex items-center gap-3 border-b border-[#E6DDD0]/60 dark:border-[#2D2825]/60 pb-2">
                                <button
                                  onClick={() => setThinkingTab("models")}
                                  className={`flex items-center gap-1.5 text-xs font-semibold transition-all ${thinkingTab === "models" ? "text-[#C25E38] dark:text-[#E06D43] border-b-2 border-[#C25E38] pb-1" : "text-[#8C7B70] hover:text-[#2D2622]"}`}
                                >
                                  <Layers className="w-3.5 h-3.5" />
                                  Multiple Brain Perspectives
                                </button>
                                <button
                                  onClick={() => setThinkingTab("resources")}
                                  className={`flex items-center gap-1.5 text-xs font-semibold transition-all ${thinkingTab === "resources" ? "text-[#C25E38] dark:text-[#E06D43] border-b-2 border-[#C25E38] pb-1" : "text-[#8C7B70] hover:text-[#2D2622]"}`}
                                >
                                  <Globe className="w-3.5 h-3.5" />
                                  Live Web Resources ({msg.citations?.filter((c) => c.type === "web" || c.url).length ?? 0})
                                </button>
                              </div>

                              {/* Models tab */}
                              {thinkingTab === "models" && (
                                <div className="space-y-3">
                                  {msg.reasoning && (
                                    <div className="p-3 rounded-lg bg-[#C25E38]/8 dark:bg-[#E06D43]/12 border border-[#C25E38]/20 text-xs">
                                      <span className="font-bold text-[#C25E38] dark:text-[#E06D43] uppercase tracking-wider block mb-1">Synthesized Reasoning</span>
                                      <p className="leading-relaxed">{msg.reasoning}</p>
                                    </div>
                                  )}
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {msg.candidates?.map((cand, cIdx) => (
                                      <button
                                        key={cIdx}
                                        onClick={() => setActiveCandidateTab(cIdx)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                          activeCandidateTab === cIdx
                                            ? "bg-[#C25E38] dark:bg-[#E06D43] text-white shadow-sm"
                                            : "bg-[#F4EFE6] dark:bg-[#12100F] text-[#5C4F45] dark:text-[#D4C7B8] border border-[#E6DDD0] dark:border-[#2D2825]"
                                        }`}
                                      >
                                        {cand.model_name}
                                      </button>
                                    ))}
                                  </div>
                                  {msg.candidates?.[activeCandidateTab] && (
                                    <div className="p-4 rounded-xl bg-[#F4EFE6]/80 dark:bg-[#12100F]/80 border border-[#E6DDD0] dark:border-[#2D2825] space-y-3">
                                      <div className="flex items-center justify-between text-xs font-mono font-bold text-[#8C7B70]">
                                        <span>{msg.candidates[activeCandidateTab].model_name}</span>
                                        {msg.scorecards?.[activeCandidateTab] && (
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

                              {/* Resources tab */}
                              {thinkingTab === "resources" && (
                                <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
                                  {!msg.citations?.some((c) => c.type === "web" || c.url) ? (
                                    <p className="text-xs text-[#8C7B70] italic">No live web citations for this query.</p>
                                  ) : (
                                    msg.citations?.filter((c) => c.type === "web" || c.url).map((cit, idx) => {
                                      const domain = cit.url ? new URL(cit.url).hostname.replace("www.", "") : cit.source ?? "Web";
                                      return (
                                        <div key={idx} className="p-3 rounded-lg bg-[#F4EFE6]/60 dark:bg-[#12100F]/60 border border-[#E6DDD0]/60 dark:border-[#2D2825]/60 text-xs space-y-1.5">
                                          <div className="flex items-center justify-between font-mono font-bold text-[#8C7B70]">
                                            <span className="flex items-center gap-1.5">
                                              <Globe className="w-3.5 h-3.5 text-[#C25E38]" />
                                              {domain}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#C25E38]/10 text-[#C25E38]">Live Web</span>
                                          </div>
                                          {cit.url ? (
                                            <a href={cit.url} target="_blank" rel="noopener noreferrer"
                                              className="font-semibold hover:text-[#C25E38] transition-colors flex items-center gap-1">
                                              {cit.title ?? domain} <ExternalLink className="w-3 h-3" />
                                            </a>
                                          ) : (
                                            <p className="font-semibold">{cit.title ?? cit.source}</p>
                                          )}
                                          {cit.snippet && <p className="text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">{cit.snippet}</p>}
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

                      <FormattedChatMessage content={msg.text} />
                      {msg.citations && msg.citations.length > 0 && <SourcesBubble citations={msg.citations} />}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start w-full">
                  <div className="bg-[#F4EFE6]/40 dark:bg-[#12100F]/40 border-l-[3px] border-[#C25E38] dark:border-[#E06D43] p-4 rounded-r-2xl rounded-bl-none flex items-center space-x-3 text-[#8C7B70]">
                    <ReasoningText variant="cascade" interval={1800} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input bar */}
          <div className="relative z-10 w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-8 pb-6 pt-2">
            <div className="relative flex items-center bg-[#F4EFE6] dark:bg-[#12100F] border border-[#E6DDD0] dark:border-[#2D2825] rounded-full px-3 py-1.5 transition-all focus-within:border-[#C25E38] dark:focus-within:border-[#E06D43] shadow-sm">
              <span className="text-lg text-[#8C7B70] opacity-60 pl-2 select-none">ॐ</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                placeholder={loading ? "NityaGeeta is contemplating your question…" : "Ask a follow-up question…"}
                disabled={loading}
                className="flex-1 bg-transparent px-4 py-2.5 text-sm sm:text-base focus:outline-none text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !query.trim()}
                className="w-9 h-9 rounded-full bg-[#C25E38] dark:bg-[#E06D43] text-white flex items-center justify-center hover:scale-105 disabled:opacity-40 shrink-0 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </AnimatedSidebarInset>
      </div>
    </AnimatedSidebarProvider>
  );
}
