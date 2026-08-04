/**
 * session-store.ts
 * Shared localStorage helpers for NityaGeeta conversation sessions.
 * Used by /app (home), /app/search/[sessionId] (thread), and /app/library (history).
 */

export interface CitationItem {
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

export interface ScorecardItem {
  model_name: string;
  score: number;
  groundedness_score?: number;
  citation_score?: number;
  clarity_score?: number;
  feedback?: string;
}

export interface CandidateItem {
  model_name: string;
  response: string;
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  winning_model?: string;
  best_score?: number;
  reasoning?: string;
  scorecards?: ScorecardItem[];
  candidates?: CandidateItem[];
  citations?: CitationItem[];
}

export interface ConversationSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
}

export const STORAGE_KEY = "nityageeta_chat_history";

export function loadAllSessions(): ConversationSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConversationSession[]) : [];
  } catch {
    return [];
  }
}

export function saveAllSessions(sessions: ConversationSession[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error("Failed to save sessions:", e);
  }
}

export function getSession(sessionId: string): ConversationSession | null {
  const all = loadAllSessions();
  return all.find((s) => s.id === sessionId) ?? null;
}

export function upsertSession(session: ConversationSession): void {
  const all = loadAllSessions();
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    all[idx] = session;
  } else {
    all.unshift(session);
  }
  saveAllSessions(all);
}

export function deleteSession(sessionId: string): ConversationSession[] {
  const updated = loadAllSessions().filter((s) => s.id !== sessionId);
  saveAllSessions(updated);
  return updated;
}

export function generateSessionId(): string {
  // UUID v4 style
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function cleanMarkdownText(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/^###\s+/gm, "")
    .replace(/###/g, "")
    .replace(/\$/g, "")
    .replace(/Not applicable in this context\./gi, "")
    .replace(/Although the provided scripture context does not contain direct information.*?\./gi, "")
    .trim();
}

export async function sendChatMessage(question: string): Promise<{
  answer: string;
  winning_model?: string;
  best_score?: number;
  reasoning?: string;
  scorecards?: ScorecardItem[];
  candidates?: CandidateItem[];
  citations?: CitationItem[];
} | null> {
  const apiBase = process.env.NEXT_PUBLIC_AUTH_API_BASE || "http://localhost:8000";
  const body = JSON.stringify({ question });
  const headers = { "Content-Type": "application/json" };

  let res = await fetch(`${apiBase}/api/v1/chat`, { method: "POST", headers, body }).catch(() => null);
  if (!res || !res.ok) {
    res = await fetch("http://127.0.0.1:8000/api/v1/chat", { method: "POST", headers, body }).catch(() => null);
  }
  if (!res || !res.ok) return null;
  return res.json();
}
