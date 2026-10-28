import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, Playfair_Display, Rozha_One, Cinzel } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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

const devanagariFont = Rozha_One({
  weight: "400",
  subsets: ["latin", "devanagari"],
  variable: "--font-devanagari",
  display: "swap",
});

const cinzelFont = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NityaGeeta - Eternal Wisdom of the Bhagavad Gita",
  description: "AI-powered spiritual guidance grounded in authenticated Bhagavad Gita commentaries.",
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-PHTNG299";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sansFont.variable} ${serifFont.variable} ${devanagariFont.variable} ${cinzelFont.variable}`} suppressHydrationWarning>
      <head>
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased bg-background text-foreground transition-colors duration-300 font-sans" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
