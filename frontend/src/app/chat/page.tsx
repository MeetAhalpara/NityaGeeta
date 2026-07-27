"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sun, Moon, Send, BookOpen, Sparkles, Shield, ArrowLeft, X } from "lucide-react";

interface Citation {
  page: number;
  source: string;
  verse?: string;
  sanskrit?: string;
  translation?: string;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  citation?: Citation;
}

export default function ChatPage() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Namaste. Welcome to NityaGeeta. Ask any question regarding life, duty, action, fear, or self-realization, and receive guidance strictly grounded in the 1,296-page Gita Press Sadhaka-Sanjivani commentary.",
      citation: {
        page: 1,
        source: "Gita Press Gorakhpur — Sadhaka Sanjeevani Edition",
        verse: "Introductory Note",
        sanskrit: "नारायणं नमस्कृत्य नरं चैव नरोत्तमम्।\nदेवीं सरस्वतीं व्यासं ततो जयमुदीरयेत्॥",
        translation: "Before reciting the Gita, which is the means of conquest, one should offer respectful obeisances unto the Lord, Nara-Narayana, the supreme human being, mother Sarasvati, and Srila Vyasadeva."
      },
    },
  ]);

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

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || query;
    if (!messageText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: messageText,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setQuery("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: messageText }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: data.answer,
          citation: data.citation,
        };
        setMessages((prev) => [...prev, botMsg]);
        
        if (data.citation) {
          setExpandedCitationId(botMsg.id);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: "Connection failure: Unable to communicate with the NityaGeeta API.",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCitation = (msgId: string) => {
    setExpandedCitationId((prev) => (prev === msgId ? null : msgId));
  };

  const userName = session?.user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB] transition-colors duration-200">
      <aside className="w-60 h-full bg-[#F4EFE6] dark:bg-[#12100F] border-r border-[#E6DDD0] dark:border-[#2D2825] flex flex-col p-6 shrink-0">
        <div className="mb-8">
          <h1 className="font-serif text-xl font-bold tracking-tight">NityaGeeta</h1>
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8C7B70] dark:text-[#A89F91] mt-1">Eternal Wisdom Engine</div>
        </div>
        <div className="flex-1">
          <ul className="space-y-1.5">
            <li><a href="#" className="flex items-center px-3 py-2 text-xs font-semibold text-[#C25E38] dark:text-[#E06D43] bg-[#C25E38]/8 dark:bg-[#E06D43]/12 border-l-2 border-[#C25E38] dark:border-[#E06D43] rounded-lg">Geeta AI</a></li>
          </ul>
        </div>
        <div className="border-t border-[#E6DDD0] dark:border-[#2D2825] pt-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C25E38] to-[#E06D43] flex items-center justify-center text-white font-bold text-xs">{userInitial}</div>
          <div className="flex-1 truncate text-xs font-semibold">{userName}</div>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-1.5 rounded-lg bg-[#E6DDD0]/40 dark:bg-[#2D2825]/40 text-[#8C7B70] hover:text-[#C25E38] dark:hover:text-[#E06D43]">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 h-full flex flex-col relative">
        <header className="border-b border-[#E6DDD0] dark:border-[#2D2825] bg-[#FAF7F2]/80 dark:bg-[#1A1816]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="w-full px-6 py-3 flex items-center justify-between">
            <Link href="/" className="p-2 rounded-lg text-[#8C7B70] hover:text-[#2D2622] dark:hover:text-[#F5F2EB] hover:bg-[#E6DDD0]/40"><ArrowLeft className="w-4 h-4" /></Link>
            <div className="text-[10px] px-2.5 py-1 rounded-full bg-[#C25E38]/8 dark:bg-[#E06D43]/12 text-[#C25E38] dark:text-[#E06D43] font-semibold flex items-center gap-1 border border-[#C25E38]/20 dark:border-[#E06D43]/20">
              <Shield className="w-3 h-3" /> 1,296 Pages Grounded
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 flex flex-col w-full max-w-3xl mx-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "user" ? (
                <div className="max-w-[75%] bg-[#EFE9DF] dark:bg-[#2C2824] rounded-2xl rounded-tr-none px-4 py-3 shadow-sm border border-[#E6DDD0]/40 dark:border-[#3C3630]/40">
                  <p className="text-sm sm:text-base leading-relaxed text-[#2D2622] dark:text-[#F5F2EB] font-sans">{msg.text}</p>
                </div>
              ) : (
                <div className="w-full max-w-[85%] bg-[#F4EFE6]/30 dark:bg-[#12100F]/30 border-l-[3px] border-[#C25E38] dark:border-[#E06D43] rounded-r-2xl rounded-bl-none p-5">
                  <div className="text-sm sm:text-base leading-relaxed text-[#5C4F45] dark:text-[#D4C7B8] font-sans whitespace-pre-wrap">{msg.text}</div>
                  {msg.citation && (
                    <>
                      <button onClick={() => toggleCitation(msg.id)} className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#C25E38] dark:text-[#E06D43] bg-[#C25E38]/8 dark:bg-[#E06D43]/12 border border-[#C25E38]/20 dark:border-[#E06D43]/20 rounded-lg hover:bg-[#C25E38] dark:hover:bg-[#E06D43] hover:text-white transition-all">
                        <BookOpen className="w-3.5 h-3.5" />
                        {expandedCitationId === msg.id ? "Hide Scripture Context" : `Show Scripture Context (Page ${msg.citation.page})`}
                      </button>
                      {expandedCitationId === msg.id && (
                        <div className="mt-4 p-4 rounded-xl bg-[#FAF7F2]/60 dark:bg-[#1C1917]/60 border border-[#E6DDD0] dark:border-[#2D2825] space-y-4">
                          {msg.citation.sanskrit && <div className="font-sans text-sm sm:text-base leading-relaxed text-[#2D2622] dark:text-[#F5F2EB] border-l-2 border-[#C25E38] dark:border-[#E06D43] pl-3 whitespace-pre-wrap">{msg.citation.sanskrit}</div>}
                          {msg.citation.translation && <div className="font-serif text-xs italic leading-relaxed text-[#5C4F45] dark:text-[#D4C7B8] pl-3">"{msg.citation.translation}"</div>}
                          <div className="text-[10px] text-[#8C7B70] dark:text-[#A89F91] font-mono flex justify-between items-center pt-2 border-t border-[#E6DDD0]/50 dark:border-[#2D2825]/50">
                            <span>Source: {msg.citation.source}</span>
                            <span className="font-semibold text-[#C25E38] dark:text-[#E06D43]">{msg.citation.verse || "Commentary"}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start w-full">
              <div className="bg-[#F4EFE6]/30 dark:bg-[#12100F]/30 border-l-[3px] border-[#C25E38] dark:border-[#E06D43] p-4 rounded-r-2xl rounded-bl-none flex items-center space-x-2 text-[#8C7B70] dark:text-[#A89F91]">
                <Sparkles className="w-4 h-4 animate-spin text-[#C25E38] dark:border-[#E06D43]" />
                <span className="text-xs font-medium font-sans">Searching Gita Press commentary...</span>
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-3xl mx-auto px-6 pb-8 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 justify-center py-1">
            {["How to conquer anger?", "What is Karma Yoga?", "Dealing with fear", "Duty without fruits"].map((topic) => (
              <button key={topic} onClick={() => handleSend(topic)} className="text-xs px-3 py-1.5 rounded-full bg-[#EFE9DF]/80 dark:bg-[#2C2824]/80 text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#C25E38]/10 hover:text-[#C25E38] transition border border-[#E6DDD0] dark:border-[#2D2825]/80">{topic}</button>
            ))}
          </div>
          <div className="relative flex items-center bg-[#F4EFE6] dark:bg-[#12100F] border border-[#E6DDD0] dark:border-[#2D2825] rounded-2xl px-2 py-1 transition-all focus-within:border-[#C25E38] dark:focus-within:border-[#E06D43]">
            <span className="font-sans text-lg text-[#8C7B70] opacity-50 pl-3">ॐ</span>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()} placeholder="Ask NityaGeeta AI..." className="flex-1 bg-transparent px-4 py-3 text-sm sm:text-base focus:outline-none" disabled={loading} />
            <button onClick={() => handleSend()} disabled={loading || !query.trim()} className="w-9 h-9 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white flex items-center justify-center hover:scale-105 disabled:opacity-50"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      </main>
    </div>
  );
}
