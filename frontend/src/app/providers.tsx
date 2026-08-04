"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { SmoothCursor } from "../components/SmoothCursor";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} basePath="/api/auth">
      <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <SmoothCursor />
        {children}
      </NextThemesProvider>
    </SessionProvider>
  );
}

