"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { GoogleButton } from "@/components/ui/google-button";

function SignUpContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [notice, setNotice] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  // ── Guard: if user already has a completed account, redirect to home ──
  useEffect(() => {
    if (status === "loading") return;

    // Case 1: already authenticated via NextAuth — has an active session
    if (session?.user?.email) {
      // Check if user exists flag is set (from Google OAuth)
      const userExists = (session.user as Record<string, unknown>)._exists;
      if (userExists) {
        router.replace("/");
        return;
      }

      const storageKey = `nityageeta_profile_${session.user.email}`;
      const stored     = localStorage.getItem(storageKey);
      const profile    = stored ? JSON.parse(stored) : null;

      if (profile?.isProfileComplete) {
        setNotice("Seems like you already used this. Try signing in.");
        setTimeout(() => {
          router.replace(`/signin?notice=existing-account&email=${encodeURIComponent(session.user.email!)}`);
        }, 1800);
        setChecked(true);
        return;
      }
    }

    // Case 2: arrived from signin page with an existing-account notice
    const noticeParam = searchParams.get("notice");
    if (noticeParam === "existing-account") {
      setNotice("Seems like you already used this. Try signing in.");
    } else if (noticeParam === "new-account") {
      setNotice("Seems like you're new here — start from here.");
    }

    setChecked(true);
  }, [session, status, router, searchParams]);

  // Don't render the form until the guard has run
  if (!checked && status === "loading") {
    return (
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1816] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#C25E38] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB] flex flex-col font-sans selection:bg-[#C25E38]/20 dark:selection:bg-[#E06D43]/30 transition-colors duration-300 relative overflow-hidden">
      <Navbar activePage="signup" />

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#C25E38]/10 to-[#E06D43]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-28 sm:pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="max-w-4xl lg:max-w-5xl w-full rounded-3xl bg-[#FAF7F2]/95 dark:bg-[#262320]/95 border border-[#E8E1D7] dark:border-[#38332E] shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[480px] relative z-10"
        >
          {/* LEFT — benefits panel */}
          <div className="p-8 lg:p-12 bg-gradient-to-br from-[#C25E38]/10 via-[#E06D43]/5 to-transparent border-b lg:border-b-0 lg:border-r border-[#E8E1D7] dark:border-[#38332E] flex flex-col justify-between relative">
            <div>
              <Link
                href="/"
                className="inline-flex items-center text-xs font-semibold text-[#8C7B70] dark:text-[#A89F91] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition mb-8 gap-1.5 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>

              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-[#C25E38]/15 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] text-xs font-bold font-mono tracking-wider">
                  FREE ACCOUNT
                </span>
                <h1 className="text-3xl lg:text-4xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] leading-tight">
                  Everything you need to go deeper.
                </h1>
                <p className="text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                  A free account gives you the full NityaGeeta experience — your own space to explore, ask, and reflect on the Gita at your own pace.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#DFD5C6]/60 dark:border-[#38332E]/60 space-y-3 text-xs text-[#6B5E55] dark:text-[#A89F91]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43] shrink-0 mt-0.5" />
                <span><span className="font-semibold text-[#2D2622] dark:text-[#F5F2EB]">Chat with the AI</span> — ask any question, get verse-grounded answers from authentic commentaries</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43] shrink-0 mt-0.5" />
                <span><span className="font-semibold text-[#2D2622] dark:text-[#F5F2EB]">Conversation history</span> — every session is saved so you can pick up any thread, any time</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43] shrink-0 mt-0.5" />
                <span><span className="font-semibold text-[#2D2622] dark:text-[#F5F2EB]">Bookmarks & library</span> — save verses, chapters, and commentary notes to your personal collection</span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43] shrink-0 mt-0.5" />
                <span><span className="font-semibold text-[#2D2622] dark:text-[#F5F2EB]">Your own profile</span> — set your name, spiritual preferences, and keep everything in one place</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Google-only sign-up */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#2D2622] dark:text-[#F5F2EB] font-serif">
                Create your free account
              </h2>
              <p className="text-xs text-[#8C7B70] dark:text-[#A89F91] mt-1.5 leading-relaxed">
                Sign up with your Google account. It only takes a moment — we'll walk you through the rest after.
              </p>
            </div>

            {notice && (
              <div className="mb-6 rounded-2xl border border-[#C25E38]/25 bg-[#C25E38]/10 px-4 py-3 text-xs text-[#5C4F45] dark:text-[#F5F2EB]">
                {notice}
              </div>
            )}

            {/* Google sign-up — uses shared GoogleButton component */}
            <GoogleButton callbackUrl="http://localhost:1870/profile" source="signup" className="w-full" />

            {/* Why Google only */}
            <p className="mt-4 text-[11px] text-[#8C7B70] dark:text-[#A89F91] text-center leading-relaxed">
              We use Google to verify your identity — no passwords to remember at sign-up.
              <br />
              You can set a manual login password after your account is created.
            </p>

            <div className="mt-8 pt-6 border-t border-[#DFD5C6]/60 dark:border-[#38332E]/60 text-center">
              <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8]">
                Already have an account?{" "}
                <Link href="/signin" className="text-[#C25E38] dark:text-[#E06D43] font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1816] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#C25E38] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
