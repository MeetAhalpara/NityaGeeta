"use client";

import Link from "next/link";
import { Shield, Lock, EyeOff, Trash2, CheckCircle2, ArrowLeft, Mail } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB] flex flex-col font-serif selection:bg-[#C25E38]/20 dark:selection:bg-[#E06D43]/30 transition-colors duration-300">
      <ScrollProgress className="fixed top-0 left-0 right-0 z-[10000]" />
      <Navbar activePage="privacy" />

      {/* Hero Header */}
      <section className="pt-32 pb-14 px-6 max-w-4xl mx-auto w-full text-center font-sans">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] text-xs font-bold uppercase tracking-wider mb-4">
          <Shield className="w-4 h-4" /> Sacred Trust & Data Protection
        </div>

        <h1 className="text-4xl sm:text-5xl font-normal leading-tight text-[#2D2622] dark:text-[#F5F2EB] mb-4 font-serif">
          Our Sacred <span className="text-[#C25E38] dark:text-[#E06D43] font-medium italic">Privacy Pledge</span>
        </h1>

        <p className="text-base text-[#5C4F45] dark:text-[#D4C7B8] leading-relaxed max-w-2xl mx-auto">
          Spiritual reflection requires total confidentiality. NityaGeeta is engineered with a strict zero-ads, zero data-brokering philosophy.
        </p>
        <p className="text-xs text-[#8C7B70] dark:text-[#A89F91] mt-2 font-mono">
          Effective Date: August 2026 • Version 1.2
        </p>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pb-24 w-full flex-1 font-sans text-sm leading-relaxed text-[#5C4F45] dark:text-[#D4C7B8] space-y-10">
        
        {/* Core Pillars Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] text-center shadow-sm">
            <EyeOff className="w-6 h-6 text-[#C25E38] dark:text-[#E06D43] mx-auto mb-2" />
            <h3 className="font-bold text-sm text-[#2D2622] dark:text-[#F5F2EB] mb-1">100% Ad-Free</h3>
            <p className="text-xs text-[#8C7B70] dark:text-[#A89F91]">Zero commercial banner ads, tracking pixels, or marketing ad networks.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] text-center shadow-sm">
            <Lock className="w-6 h-6 text-[#C25E38] dark:text-[#E06D43] mx-auto mb-2" />
            <h3 className="font-bold text-sm text-[#2D2622] dark:text-[#F5F2EB] mb-1">Zero Data Selling</h3>
            <p className="text-xs text-[#8C7B70] dark:text-[#A89F91]">Your spiritual queries, reflections, and chats are never sold to third parties.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] text-center shadow-sm">
            <Trash2 className="w-6 h-6 text-[#C25E38] dark:text-[#E06D43] mx-auto mb-2" />
            <h3 className="font-bold text-sm text-[#2D2622] dark:text-[#F5F2EB] mb-1">Complete User Control</h3>
            <p className="text-xs text-[#8C7B70] dark:text-[#A89F91]">Delete your conversation history or account permanently at any moment.</p>
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-3 p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] shadow-sm">
          <h2 className="text-xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
            1. Information We Collect
          </h2>
          <p>
            We collect only the minimal information strictly required to authenticate you and preserve your personal study sessions:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#5C4F45] dark:text-[#D4C7B8]">
            <li><strong>Authentication Data:</strong> When signing in via Google OAuth, we receive your name, email address, and profile avatar URL via NextAuth.js. We never receive or store your Google password.</li>
            <li><strong>Session & Chat History:</strong> Your prompts, questions, and AI-synthesized responses are saved in your local browser cache (localStorage) and mirrored to our secure PostgreSQL database to allow seamless cross-device synchronization.</li>
            <li><strong>Technical Telemetry:</strong> Minimal error telemetry (such as API latency and error codes) to diagnose server crashes and maintain platform reliability.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] shadow-sm">
          <h2 className="text-xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
            2. How We Use Your Information
          </h2>
          <p>
            Your information is used strictly to fulfill the sacred and educational mission of NityaGeeta:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#5C4F45] dark:text-[#D4C7B8]">
            <li>To match your questions against our in-memory 700 Bhagavad Gita Sanskrit verses and 5 classical commentary bhashyas.</li>
            <li>To dispatch parallel inference requests across our 5 AI models (Groq 70B, Gemini 2.0, OpenRouter MoA) in stateless API calls.</li>
            <li>To maintain your personal dialogue history and profile bookmarks.</li>
            <li><strong>We NEVER use your private spiritual inquiries to train public AI foundational models without explicit consent.</strong></li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] shadow-sm">
          <h2 className="text-xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
            3. AI Inference & Third-Party APIs
          </h2>
          <p>
            When you ask a question in NityaGeeta Dialogue, our backend sends the query along with retrieved Sanskrit shlokas to our enterprise API providers (such as Groq, Google Gemini, and OpenRouter). These calls are governed by enterprise zero-data-retention agreements where API inputs are processed transiently and not retained to train third-party public models.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] shadow-sm">
          <h2 className="text-xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
            4. Data Security & Storage
          </h2>
          <p>
            All network communication between your browser, our Next.js frontend, and our FastAPI Python backend is encrypted using TLS/SSL (HTTPS). Session data in PostgreSQL is protected by role-based access controls and encrypted at rest.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] shadow-sm">
          <h2 className="text-xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
            5. Your Rights & Account Deletion
          </h2>
          <p>
            You have total sovereignty over your personal data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#5C4F45] dark:text-[#D4C7B8]">
            <li><strong>Clear Chat History:</strong> You can delete any individual conversation or wipe all history directly from the sidebar.</li>
            <li><strong>Delete Account:</strong> You can request permanent removal of your account and all associated records by contacting us.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#EFE9DF] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-center space-y-3">
          <h3 className="text-base font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
            Questions About Our Privacy Practices?
          </h3>
          <p className="text-xs text-[#5C4F45] dark:text-[#D4C7B8]">
            If you have questions, feedback, or concerns regarding your privacy or data protection, please reach out directly:
          </p>
          <div className="pt-2">
            <Link
              href="/#support"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white text-xs font-bold hover:opacity-90 transition shadow-md"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Privacy Team</span>
            </Link>
          </div>
        </section>

      </main>

      {/* Universal Global Footer */}
      <Footer />
    </div>
  );
}
