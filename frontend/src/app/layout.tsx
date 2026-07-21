import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SmoothCursor } from "../components/SmoothCursor";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serifFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NityaGeeta - Eternal Wisdom of the Bhagavad Gita",
  description: "AI-powered spiritual guidance grounded in authenticated Bhagavad Gita commentaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sansFont.variable} ${serifFont.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-background text-foreground transition-colors duration-300 font-sans" suppressHydrationWarning>
        <Providers>
          <SmoothCursor />
          {children}
        </Providers>
      </body>
    </html>
  );
}
