"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, ExternalLink, Search, User, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export function Navbar({ activePage = "" }: { activePage?: string }) {
  const { data: session, status } = useSession();
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<"geeta" | "veducation" | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { scrollY } = useScroll();
  const navPadding = useTransform(scrollY, [0, 150], ["1.25rem", "0.6rem"]);
  const logoScale = useTransform(scrollY, [0, 150], [1, 0.9]);
  const navLinkScale = useTransform(scrollY, [0, 150], [1, 0.93]);

  return (
    <header className={`sticky-header-fixed liquid-glass shadow-lg transition-all duration-200 z-[999] ${resourcesOpen ? "!border-b-transparent" : "liquid-border-shimmer"}`}>
      <motion.div
        style={{ paddingTop: navPadding, paddingBottom: navPadding }}
        className="max-w-7xl mx-auto px-6 flex items-center justify-between font-sans"
      >
        {/* LEFT SIDE: Brand Name */}
        <Link href="/" className="flex items-center group shrink-0">
          <motion.span
            style={{ scale: logoScale, originX: 0 }}
            className="text-2xl font-bold tracking-tight text-[#2D2622] dark:text-[#F5F2EB] font-serif hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors"
          >
            NityaGeeta
          </motion.span>
        </Link>

        {/* MIDDLE: Navigation links with Resources Flyout Menu */}
        <motion.div
          style={{ scale: navLinkScale, originX: 0.5 }}
          className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#5C4F45] dark:text-[#D4C7B8] font-sans"
        >
          {/* Resources Multi-Level Dropdown */}
          <div
            className="relative py-2"
            onMouseEnter={() => {
              setResourcesOpen(true);
              if (!activeSubMenu) setActiveSubMenu("geeta");
            }}
            onMouseLeave={() => {
              setResourcesOpen(false);
            }}
          >
            <button
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className="flex items-center gap-1.5 hover:text-[#C25E38] dark:hover:text-[#E06D43] transition py-1 focus:outline-none cursor-pointer font-semibold"
            >
              <span>Resources</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${resourcesOpen ? "rotate-180 text-[#C25E38] dark:text-[#E06D43]" : ""}`} />
            </button>

            {resourcesOpen && (
              <div className="absolute top-full -left-4 pt-1 z-[100] font-sans">
                <div className="flex items-start">
                  {/* Level 1: Main Categories List */}
                  <div className="w-56 rounded-2xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] p-2 space-y-1">
                    <div
                      onMouseEnter={() => setActiveSubMenu("geeta")}
                      onClick={() => setActiveSubMenu("geeta")}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                        activeSubMenu === "geeta"
                          ? "bg-[#EFE9DF] dark:bg-[#2A2521] text-[#C25E38] dark:text-[#E06D43] font-bold"
                          : "text-[#2D2622] dark:text-[#F5F2EB] hover:bg-[#EFE9DF]/60 dark:hover:bg-[#2A2521]/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span>Geeta Resources</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition ${activeSubMenu === "geeta" ? "text-[#C25E38] dark:text-[#E06D43] translate-x-0.5" : "text-[#8C7B70] dark:text-[#A89F91]"}`} />
                    </div>

                    <div
                      onMouseEnter={() => setActiveSubMenu("veducation")}
                      onClick={() => setActiveSubMenu("veducation")}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                        activeSubMenu === "veducation"
                          ? "bg-[#EFE9DF] dark:bg-[#2A2521] text-[#C25E38] dark:text-[#E06D43] font-bold"
                          : "text-[#2D2622] dark:text-[#F5F2EB] hover:bg-[#EFE9DF]/60 dark:hover:bg-[#2A2521]/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span>Veducation Resources</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition ${activeSubMenu === "veducation" ? "text-[#C25E38] dark:text-[#E06D43] translate-x-0.5" : "text-[#8C7B70] dark:text-[#A89F91]"}`} />
                    </div>
                  </div>

                  {/* Level 2 Flyout Sub-menu Panel */}
                  {activeSubMenu && (
                    <div className="ml-2 w-80 sm:w-96 rounded-2xl bg-[#FAF7F2] dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] p-4 animate-in fade-in slide-in-from-left-2 duration-150">
                      {activeSubMenu === "geeta" && (
                        <div className="space-y-2">
                          <div className="px-2 py-1 text-xs font-bold uppercase tracking-widest text-[#C25E38] dark:text-[#E06D43] border-b border-[#E8E1D7] dark:border-[#38332E] flex items-center justify-between">
                            <span>Geeta Editions</span>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#C25E38]/10 text-[#C25E38] dark:bg-[#E06D43]/15 dark:text-[#E06D43] font-bold whitespace-nowrap shrink-0">
                              4 Books
                            </span>
                          </div>
                          <div className="space-y-1.5 pt-1">
                            <a
                              href="https://dn720006.ca.archive.org/0/items/shreemed-bhagwat-gita-20220406_20220406_0356/%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A5%80%E0%A4%AE%E0%A4%A6%E0%A5%8D%E0%A4%AD%E0%A4%97%E0%A4%B5%E0%A4%A4%E0%A4%97%E0%A5%80%E0%A4%A4%E0%A4%BE.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start justify-between p-2.5 rounded-xl hover:bg-[#EFE9DF] dark:hover:bg-[#2A2521] transition group border border-transparent hover:border-[#DFD5C6] dark:hover:border-[#38332E]"
                            >
                              <div>
                                <div className="font-bold text-xs text-[#2D2622] dark:text-[#F5F2EB] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition">
                                  Srimad Bhagavad Gita
                                </div>
                                <div className="text-[11px] text-[#5C4F45] dark:text-[#A89F91]">
                                  Gita Press Gorakhpur
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-[#8C7B70] dark:text-[#A89F91] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] shrink-0 mt-0.5 transition" />
                            </a>

                            <a
                              href="https://dn760103.eu.archive.org/0/items/sargeant-w.-the-bhagavat-gita/Sargeant%2C%20W.%20-%20the-bhagavat-gita.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start justify-between p-2.5 rounded-xl hover:bg-[#EFE9DF] dark:hover:bg-[#2A2521] transition group border border-transparent hover:border-[#DFD5C6] dark:hover:border-[#38332E]"
                            >
                              <div>
                                <div className="font-bold text-xs text-[#2D2622] dark:text-[#F5F2EB] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition">
                                  The Bhagavad Gita
                                </div>
                                <div className="text-[11px] text-[#5C4F45] dark:text-[#A89F91]">
                                  Winthrop Sargeant (Word-for-Word)
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-[#8C7B70] dark:text-[#A89F91] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] shrink-0 mt-0.5 transition" />
                            </a>

                            <a
                              href="https://dn760108.eu.archive.org/0/items/gita-sadhak-sanjevani-english/Gita-Sadhak-Sanjevani-English.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start justify-between p-2.5 rounded-xl hover:bg-[#EFE9DF] dark:hover:bg-[#2A2521] transition group border border-transparent hover:border-[#DFD5C6] dark:hover:border-[#38332E]"
                            >
                              <div>
                                <div className="font-bold text-xs text-[#2D2622] dark:text-[#F5F2EB] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition">
                                  Gita Sadhak Sanjeevani
                                </div>
                                <div className="text-[11px] text-[#5C4F45] dark:text-[#A89F91]">
                                  Swami Ramsukhdas (English)
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-[#8C7B70] dark:text-[#A89F91] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] shrink-0 mt-0.5 transition" />
                            </a>

                            <a
                              href="https://dn760101.eu.archive.org/0/items/Bhagavad-Gita.with.the.Commentary.of.Sri.Shankaracharya/Bhagavad-Gita.with.the.Commentary.of.Sri.Shankaracharya.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start justify-between p-2.5 rounded-xl hover:bg-[#EFE9DF] dark:hover:bg-[#2A2521] transition group border border-transparent hover:border-[#DFD5C6] dark:hover:border-[#38332E]"
                            >
                              <div>
                                <div className="font-bold text-xs text-[#2D2622] dark:text-[#F5F2EB] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition">
                                  Bhagavad Gita Commentary
                                </div>
                                <div className="text-[11px] text-[#5C4F45] dark:text-[#A89F91]">
                                  Sri Shankaracharya Bhashya
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-[#8C7B70] dark:text-[#A89F91] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] shrink-0 mt-0.5 transition" />
                            </a>
                          </div>
                        </div>
                      )}

                      {activeSubMenu === "veducation" && (
                        <div className="space-y-2">
                          <div className="px-2 py-1 text-xs font-bold uppercase tracking-widest text-[#C25E38] dark:text-[#E06D43] border-b border-[#E8E1D7] dark:border-[#38332E] flex items-center justify-between">
                            <span>Veducation Books</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C25E38]/10 text-[#C25E38] dark:bg-[#E06D43]/20 dark:text-[#E06D43]">
                              3 Books
                            </span>
                          </div>
                          <div className="space-y-1.5 pt-1">
                            <a
                              href="https://dn760103.eu.archive.org/0/items/boss-basics-of-sanatan-sanskriti-the-eternal-knowledge-from-veducation-compressed/BOSS%20Basics%20of%20Sanatan%20Sanskriti%20The%20eternal%20knowledge%20from%20Veducation_compressed.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start justify-between p-2.5 rounded-xl hover:bg-[#EFE9DF] dark:hover:bg-[#2A2521] transition group border border-transparent hover:border-[#DFD5C6] dark:hover:border-[#38332E]"
                            >
                              <div>
                                <div className="font-bold text-xs text-[#2D2622] dark:text-[#F5F2EB] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition">
                                  BOSS (Sanatan Sanskriti)
                                </div>
                                <div className="text-[11px] text-[#5C4F45] dark:text-[#A89F91]">
                                  Veducation English Edition
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-[#8C7B70] dark:text-[#A89F91] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] shrink-0 mt-0.5 transition" />
                            </a>

                            <a
                              href="https://dn721907.ca.archive.org/0/items/vedic-dincharya/vedic%20dincharya.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start justify-between p-2.5 rounded-xl hover:bg-[#EFE9DF] dark:hover:bg-[#332E2A] transition group border border-transparent hover:border-[#DFD5C6] dark:hover:border-[#38332E]"
                            >
                              <div>
                                <div className="font-bold text-xs text-[#2D2622] dark:text-[#F5F2EB] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition">
                                  Vedic Dincharya
                                </div>
                                <div className="text-[11px] text-[#5C4F45] dark:text-[#A89F91]">
                                  Daily Shastric Routine Guide
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-[#8C7B70] dark:text-[#A89F91] group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] shrink-0 mt-0.5 transition" />
                            </a>

                            <div className="flex items-start justify-between p-2.5 rounded-xl bg-[#EFE9DF]/40 dark:bg-[#2A2521]/40 border border-[#DFD5C6]/60 dark:border-[#38332E]/60 transition">
                              <div>
                                <div className="font-bold text-xs text-[#2D2622] dark:text-[#F5F2EB]">
                                  Brahmacharya: Action Book
                                </div>
                                <div className="text-[11px] text-[#6B5E55] dark:text-[#A89F91] italic font-medium">
                                  From the local resources
                                </div>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[#C25E38]/15 text-[#C25E38] dark:bg-[#E06D43]/20 dark:text-[#E06D43] font-mono font-semibold">
                                Local
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Link href="/#how-it-works" className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition">
            How It Works
          </Link>
          <Link href="/chat" className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition">
            Geeta AI
          </Link>
          <Link href="/#support" className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition">
            Contact Us
          </Link>
          <Link href="/#sources" className="hover:text-[#C25E38] dark:hover:text-[#E06D43] transition">
            Sources
          </Link>
        </motion.div>

        {/* RIGHT SIDE: Search, Animated Theme Toggle, Auth buttons */}
        <div className="flex items-center space-x-3 font-sans">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2.5 rounded-xl text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF] dark:hover:bg-[#262320] transition border border-transparent hover:border-[#DFD5C6] dark:hover:border-[#38332E]"
            aria-label="Search"
            title="Search Gita Verses"
          >
            <Search className="w-4 h-4" />
          </button>

          <AnimatedThemeToggler duration={350} />

          {session?.user ? (
            /* ── Authenticated: Profile Button with Dropdown ── */
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 pr-4 rounded-xl border border-[#C25E38]/30 dark:border-[#E06D43]/40 bg-[#FAF7F2] dark:bg-[#262320] hover:border-[#C25E38]/60 dark:hover:border-[#E06D43]/60 transition shadow-sm"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "Profile"}
                    className="w-7 h-7 rounded-full border border-[#C25E38]/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#C25E38] flex items-center justify-center text-white text-xs font-bold">
                    {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="text-xs font-semibold text-[#2D2622] dark:text-[#F5F2EB]">
                  Profile
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#8C7B70] dark:text-[#A89F91] transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#E8E1D7] dark:border-[#38332E] shadow-2xl backdrop-blur-xl overflow-hidden z-50"
                  >
                    {/* User Info */}
                    <div className="p-4 border-b border-[#E8E1D7] dark:border-[#38332E]">
                      <div className="flex items-center gap-3">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || "Profile"}
                            className="w-10 h-10 rounded-full border-2 border-[#C25E38]/30"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#C25E38] flex items-center justify-center text-white text-sm font-bold">
                            {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#2D2622] dark:text-[#F5F2EB] truncate">
                            {session.user.name}
                          </p>
                          <p className="text-[11px] text-[#8C7B70] dark:text-[#A89F91] truncate font-mono">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF] dark:hover:bg-[#332E2A] transition"
                      >
                        <User className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </Link>

                      <Link
                        href="/chat"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF] dark:hover:bg-[#332E2A] transition"
                      >
                        <Search className="w-4 h-4" />
                        <span>Geeta AI Chat</span>
                      </Link>

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Not Authenticated: Sign In / Create Account buttons ── */
            activePage === "signin" ? (
              <Link href="/signup">
                <InteractiveHoverButton
                  text="Create Account"
                  icon={<User className="w-4 h-4" />}
                  className="p-2.5 px-5 font-sans text-xs border-[#C25E38]/30 dark:border-[#E06D43]/40"
                />
              </Link>
            ) : (
              <Link href="/signin">
                <InteractiveHoverButton
                  text="Sign In"
                  icon={<User className="w-4 h-4" />}
                  className="p-2.5 px-6 font-sans text-xs border-[#C25E38]/30 dark:border-[#E06D43]/40"
                />
              </Link>
            )
          )}
        </div>
      </motion.div>

      {/* Quick Search Overlay Input */}
      {searchOpen && (
        <div className="border-t border-[#E8E1D7] dark:border-[#38332E] bg-[#FAF7F2]/95 dark:bg-[#262320]/95 backdrop-blur-xl px-6 py-3 transition-all">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Search className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
            <input
              type="text"
              autoFocus
              placeholder="Search Bhagavad Gita verses, topics (e.g. 'Karma', 'Chapter 2 Verse 47')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] dark:placeholder-[#A89F91] focus:outline-none"
            />
            <Link
              href={`/chat?q=${encodeURIComponent(searchQuery)}`}
              className="px-3.5 py-1.5 rounded-lg bg-[#C25E38] dark:bg-[#E06D43] text-white text-xs font-semibold shrink-0"
            >
              Search AI
            </Link>
            <button
              onClick={() => setSearchOpen(false)}
              className="text-xs text-[#8C7B70] dark:text-[#A89F91] hover:text-[#2D2622] dark:hover:text-[#F5F2EB]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
