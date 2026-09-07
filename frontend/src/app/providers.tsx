"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { SmoothCursor } from "../components/SmoothCursor";
import { GlobalRadialContextMenu } from "../components/GlobalRadialContextMenu";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
      refetchInterval={0}
      basePath="/api/auth"
    >
      <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <SmoothCursor />
        <GlobalRadialContextMenu>
          {children}
        </GlobalRadialContextMenu>
      </NextThemesProvider>
    </SessionProvider>
  );
}

