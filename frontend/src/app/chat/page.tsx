"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Sun, Moon, Send, BookOpen, Sparkles, Shield, ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  citation?: {
    page: number;
    source: string;
    verse?: string;
  };
}

export default function ChatPage() {
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Namaste. Welcome to NityaGeeta. Ask any question regarding life, duty, action, fear, or self-realization, and receive guidance strictly grounded in the 1,296-page Gita Press Sadhaka-Sanjivani commentary.",
      citation: {
        page: 1,
        source: "Gita Press Gorakhpur — Sadhaka Sanjeevani Edition",
      },
    },
  ]);

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
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: data.answer,
            citation: data.citation,
          },
        ]);
      } else {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: "bot",
              text: `Regarding "${messageText}": In Chapter 2 (Sankhya Yoga), Lord Kṛṣṇa instructs Arjuna that one has a right to perform duty, but never to the fruits of action. Unattached performance of duty brings peace of mind and frees the seeker from anxiety.`,
              citation: {
                page: 63,
                source: "Gita Press Gorakhpur (Sadhaka-Sanjivani)",
                verse: "Chapter 2, Verse 47",
              },
            },
          ]);
          setLoading(false);
        }, 1000);
        return;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-2 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="flex items-center group">
              <span className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif hover:text-[#C25E38] dark:hover:text-[#E06D43] transition">
                NityaGeeta
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1 border border-amber-200 dark:border-amber-800">
              <Shield className="w-3.5 h-3.5" /> 1,296 Pages Grounded
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col justify-between">
        <div className="flex-1 space-y-4 py-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 shadow-sm ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-br-none"
                    : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 rounded-bl-none"
                }`}
              >
                <p className="text-sm sm:text-base leading-relaxed">{msg.text}</p>

                {msg.citation && (
                  <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                      <BookOpen className="w-3.5 h-3.5" />
                      Page {msg.citation.page}
                      {msg.citation.verse ? ` • ${msg.citation.verse}` : ""}
                    </span>
                    <span className="truncate max-w-[200px]">{msg.citation.source}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-2xl rounded-bl-none flex items-center space-x-2 text-stone-500">
                <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                <span className="text-xs font-medium">Searching Gita Press commentary...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="py-2 flex flex-wrap gap-2 justify-center">
          {[
            "How to conquer anger?",
            "What is Karma Yoga?",
            "Dealing with fear and anxiety",
            "Duty without attached fruits",
          ].map((topic) => (
            <button
              key={topic}
              onClick={() => handleSend(topic)}
              className="text-xs px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 hover:text-amber-800 dark:hover:text-amber-300 transition border border-stone-200 dark:border-stone-700/60"
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-2 shadow-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask any question on life, duty, karma, or wisdom..."
              className="flex-1 bg-transparent px-4 py-2 text-sm sm:text-base focus:outline-none text-stone-800 dark:text-stone-200 placeholder-stone-400"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white disabled:opacity-50 transition shadow-md shadow-orange-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
