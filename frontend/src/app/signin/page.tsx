"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { GoogleButton } from "@/components/ui/google-button";

function SignInFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notice, setNotice] = useState<string | null>(null);

  // Pre-load target routes for fast switching
  useEffect(() => {
    router.prefetch("/app");
    router.prefetch("/signup");
    router.prefetch("/");
  }, [router]);

  // Redirect authenticated users with existing accounts to home
  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "authenticated" && session?.user?.email) {
      // Check if user exists flag is set (from Google OAuth)
      const userExists = (session.user as Record<string, unknown>)._exists;
      if (userExists) {
        router.replace("/");
        return;
      }

      // Check localStorage for completed profile
      const storageKey = `nityageeta_profile_${session.user.email}`;
      const stored = localStorage.getItem(storageKey);
      const profile = stored ? JSON.parse(stored) : null;
      
      if (profile?.isProfileComplete) {
        router.replace("/");
        return;
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    const noticeParam = searchParams.get("notice");

    if (noticeParam === "new-account") {
      setNotice("Welcome! Sign in with Google to get started.");
    } else if (noticeParam === "existing-account") {
      setNotice("Welcome back! Sign in with Google to continue.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB] flex flex-col font-sans selection:bg-[#C25E38]/20 dark:selection:bg-[#E06D43]/30 transition-colors duration-300 relative overflow-hidden">
      {/* Shared Unified Navbar */}
      <Navbar activePage="signin" />

      {/* Decorative Ambient Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#C25E38]/10 to-[#E06D43]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-28 sm:pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="max-w-4xl lg:max-w-5xl w-full rounded-3xl bg-[#FAF7F2]/95 dark:bg-[#262320]/95 border border-[#E8E1D7] dark:border-[#38332E] shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[540px] relative z-10"
        >
          {/* LEFT COLUMN: Feature & Brand Showcase Panel */}
          <div className="p-8 lg:p-12 bg-gradient-to-br from-[#C25E38]/10 via-[#E06D43]/5 to-transparent border-b lg:border-b-0 lg:border-r border-[#E8E1D7] dark:border-[#38332E] flex flex-col justify-between relative">
            <div>
              {/* Back Link */}
              <Link
                href="/"
                className="inline-flex items-center text-xs font-semibold text-[#8C7B70] dark:text-[#A89F91] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition mb-8 gap-1.5 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Home</span>
              </Link>

              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-[#C25E38]/15 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] text-xs font-bold font-mono tracking-wider">
                  CONTINUE YOUR PATH
                </span>
                <h1 className="text-3xl lg:text-4xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] leading-tight">
                  Pick up right where you left off.
                </h1>
                <p className="text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                  Your conversations, reflections, and saved verses are waiting. Step back in — your journey through the Gita is still unfolding.
                </p>
              </div>
            </div>

            {/* Continuity Reminders */}
            <div className="mt-8 pt-6 border-t border-[#DFD5C6]/60 dark:border-[#38332E]/60 space-y-3 text-xs text-[#6B5E55] dark:text-[#A89F91]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43] shrink-0 mt-0.5" />
                <span>Your AI conversations are saved and ready to continue</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43] shrink-0 mt-0.5" />
                <span>Bookmarked verses and insights are exactly as you left them</span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43] shrink-0 mt-0.5" />
                <span>Your profile and preferences are preserved across all devices</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sign In Form Panel */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#2D2622] dark:text-[#F5F2EB] font-serif">
                Welcome Back
              </h2>
              <p className="text-xs text-[#8C7B70] dark:text-[#A89F91] mt-1">
                Sign in with your Google account to continue your journey.
              </p>
            </div>

            {notice && (
              <div className="mb-5 rounded-2xl border border-[#C25E38]/25 bg-[#C25E38]/10 px-4 py-3 text-xs text-[#5C4F45] dark:text-[#F5F2EB]">
                {notice}
              </div>
            )}

            {/* Google Sign In Button - Morphs from G to "Continue with Google" on hover */}
            <GoogleButton callbackUrl="http://localhost:1870" className="w-full" />

            <div className="mt-8 pt-6 border-t border-[#DFD5C6]/60 dark:border-[#38332E]/60 text-center">
              <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8]">
                New to NityaGeeta?{" "}
                <Link href="/signup" prefetch={true} className="text-[#C25E38] dark:text-[#E06D43] font-bold hover:underline">
                  Create an Account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1816] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#C25E38] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignInFormContent />
    </Suspense>
  );
}
