"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Mail, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = "/chat";
    }, 600);
  };

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
                  NITYAGEETA PLATFORM
                </span>
                <h1 className="text-3xl lg:text-4xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] leading-tight">
                  Welcome Back Seekers
                </h1>
                <p className="text-xs sm:text-sm text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed">
                  Sign in to access your saved Bhagavad Gita research, bookmarked Sanskrit verses, and personal AI conversations.
                </p>
              </div>
            </div>

            {/* Grounding Highlights */}
            <div className="mt-8 pt-6 border-t border-[#DFD5C6]/60 dark:border-[#38332E]/60 space-y-3 text-xs text-[#6B5E55] dark:text-[#A89F91]">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43] shrink-0 mt-0.5" />
                <span>Layer 1 Ground Truth: Gita Press 1923 Canonical Sanskrit Text</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43] shrink-0 mt-0.5" />
                <span>Layer 2 Grammatical Breakdown by Winthrop Sargeant</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43] shrink-0 mt-0.5" />
                <span>Layer 3 Practical Exegesis by Swami Ramsukhdas</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sign In Form Panel */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#2D2622] dark:text-[#F5F2EB] font-serif">
                Sign In
              </h2>
              <p className="text-xs text-[#8C7B70] dark:text-[#A89F91] mt-1">
                Enter your credentials or continue with Google.
              </p>
            </div>

            {/* Real Google Sign In via NextAuth */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#EFE9DF] dark:bg-[#332E2A] border border-[#DFD5C6] dark:border-[#38332E] text-xs font-bold text-[#2D2622] dark:text-[#F5F2EB] hover:border-[#C25E38]/40 dark:hover:border-[#E06D43]/40 hover:shadow-md transition shadow-sm mb-6"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.9c-.4-.7-.6-1.5-.6-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-[#DFD5C6] dark:border-[#38332E] w-full" />
              <span className="bg-[#FAF7F2] dark:bg-[#262320] px-3 text-[11px] text-[#8C7B70] dark:text-[#A89F91] font-semibold uppercase tracking-wider absolute">
                Or With Email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C7B70] dark:text-[#A89F91] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="arjuna@nityageeta.org"
                    className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl pl-10 pr-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8]">
                    Password
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Password reset instructions will be sent to your email.");
                    }}
                    className="text-[11px] text-[#C25E38] dark:text-[#E06D43] font-semibold hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C7B70] dark:text-[#A89F91] absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl pl-10 pr-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-[#5C4F45] dark:text-[#D4C7B8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#DFD5C6] dark:border-[#38332E] text-[#C25E38] focus:ring-[#C25E38] dark:bg-[#1C1917]"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <InteractiveHoverButton
                  type="submit"
                  text={isLoading ? "Signing In..." : "Sign In to Account"}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="w-full py-3.5 text-xs font-sans font-bold shadow-lg shadow-[#C25E38]/20"
                />
              </div>
            </form>

            <div className="mt-8 pt-4 border-t border-[#DFD5C6]/60 dark:border-[#38332E]/60 text-center">
              <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8]">
                Don't have an account?{" "}
                <Link href="/signup" className="text-[#C25E38] dark:text-[#E06D43] font-bold hover:underline">
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
