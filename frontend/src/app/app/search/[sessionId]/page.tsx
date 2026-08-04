/**
 * /app/search/[sessionId]/page.tsx
 *
 * Perplexity-style session URL route.
 * Renders the exact same AppMainPage layout — the URL just changes.
 * AppMainPage reads the sessionId from usePathname() on mount and
 * restores the correct conversation automatically.
 */
import AppMainPage from "../../page";

export default function SessionPage() {
  return <AppMainPage />;
}
