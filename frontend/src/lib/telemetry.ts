/**
 * NityaGeeta Client Telemetry & Attention Tracker
 * Measures scripture reading dwell time, scroll velocity, and contemplative interactions.
 * Uses IntersectionObserver and sendBeacon with zero UI blocking.
 */

export interface TelemetryEvent {
  user_id?: string;
  event_type: "reading_dwell" | "gloss_click" | "commentary_expand" | "shloka_hover";
  shloka_id?: string;
  chapter?: number;
  verse?: number;
  dwell_ms: number;
  interactions?: string[];
  scroll_velocity?: number;
}

class TelemetryClient {
  private queue: TelemetryEvent[] = [];
  private flushIntervalMs = 5000;
  private timer: ReturnType<typeof setInterval> | null = null;
  private endpoint = "/api/telemetry-proxy"; // Next.js proxy route or direct backend

  constructor() {
    if (typeof window !== "undefined") {
      this.timer = setInterval(() => this.flush(), this.flushIntervalMs);
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.flush();
        }
      });
      window.addEventListener("beforeunload", () => this.flush());
    }
  }

  public recordEvent(event: TelemetryEvent) {
    this.queue.push(event);
    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  public flush() {
    if (this.queue.length === 0 || typeof window === "undefined") return;

    const batch = [...this.queue];
    this.queue = [];

    const payload = JSON.stringify({ events: batch });

    // Use sendBeacon for silent exit telemetry or fetch with keepalive
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const targetUrl = `${apiUrl}/api/v1/telemetry/stream`;

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        const success = navigator.sendBeacon(targetUrl, blob);
        if (!success) {
          fetch(targetUrl, {
            method: "POST",
            body: payload,
            headers: { "Content-Type": "application/json" },
            keepalive: true,
          }).catch(() => {});
        }
      } else {
        fetch(targetUrl, {
          method: "POST",
          body: payload,
          headers: { "Content-Type": "application/json" },
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Telemetry should never crash the user experience
    }
  }

  /**
   * Attaches an IntersectionObserver to observe visible verses on screen.
   */
  public createObserver(
    onDwellRecorded?: (shlokaId: string, dwellMs: number) => void
  ): IntersectionObserver | null {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return null;
    }

    const enterTimes = new Map<string, number>();

    return new IntersectionObserver(
      (entries) => {
        const now = performance.now();
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const shlokaId = target.dataset.shlokaId || target.id;
          const chapter = target.dataset.chapter ? parseInt(target.dataset.chapter) : undefined;
          const verse = target.dataset.verse ? parseInt(target.dataset.verse) : undefined;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Verse is 50%+ visible: start dwell clock
            enterTimes.set(shlokaId, now);
          } else if (enterTimes.has(shlokaId)) {
            // Verse scrolled out: record dwell
            const startTime = enterTimes.get(shlokaId)!;
            enterTimes.delete(shlokaId);
            const dwellMs = Math.round(now - startTime);

            // Filter out rapid skimming (< 1 second)
            if (dwellMs >= 1000) {
              this.recordEvent({
                event_type: "reading_dwell",
                shloka_id: shlokaId,
                chapter,
                verse,
                dwell_ms: dwellMs,
              });
              if (onDwellRecorded) {
                onDwellRecorded(shlokaId, dwellMs);
              }
            }
          }
        });
      },
      { threshold: [0.5] }
    );
  }
}

export const telemetry = new TelemetryClient();
