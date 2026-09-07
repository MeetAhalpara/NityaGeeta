"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, ExternalLink, User, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export function Navbar({ activePage = "" }: { activePage?: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Pre-load all primary routes in background for instant 0ms page switching
  useEffect(() => {
    router.prefetch("/app");
    router.prefetch("/sources");
    router.prefetch("/dilemmas");
    router.prefetch("/architecture");
    router.prefetch("/how-it-works");
    router.prefetch("/contact");
    router.prefetch("/signin");
    router.prefetch("/signup");
    router.prefetch("/profile");
    router.prefetch("/privacy");
    router.prefetch("/terms");
    router.prefetch("/");
  }, [router]);

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
    <header className="sticky-header-fixed liquid-glass shadow-lg transition-all duration-200 z-[999] liquid-border-shimmer">
      <motion.div
        style={{ paddingTop: navPadding, paddingBottom: navPadding }}
        className="max-w-7xl mx-auto px-6 flex items-center justify-between font-sans"
      >
        {/* LEFT SIDE: Brand Name */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center group shrink-0 bg-transparent border-0 p-0 cursor-pointer text-left"
        >
          <motion.span
            style={{ scale: logoScale, originX: 0 }}
            className="text-2xl font-bold tracking-tight text-text-primary font-serif hover:text-[#C25E38] dark:hover:text-[#E06D43] transition-colors"
          >
            NityaGeeta
          </motion.span>
        </button>

        {/* MIDDLE: Clean direct navigation buttons */}
        <motion.div
          style={{ scale: navLinkScale, originX: 0.5 }}
          className="hidden md:flex items-center space-x-7 text-sm font-medium text-[#5C4F45] dark:text-[#D4C7B8] font-sans"
        >
          <button
            onClick={() => router.push("/sources")}
            className={`hover:text-[#C25E38] dark:hover:text-[#E06D43] transition font-medium cursor-pointer bg-transparent border-0 p-0 ${
              activePage === "sources" ? "text-[#C25E38] dark:text-[#E06D43] font-bold" : ""
            }`}
          >
            Resources & Sources
          </button>

          <button
            onClick={() => router.push("/dilemmas")}
            className={`hover:text-[#C25E38] dark:hover:text-[#E06D43] transition font-medium cursor-pointer bg-transparent border-0 p-0 ${
              activePage === "dilemmas" ? "text-[#C25E38] dark:text-[#E06D43] font-bold" : ""
            }`}
          >
            Life Dilemmas
          </button>

          <button
            onClick={() => router.push("/architecture")}
            className={`hover:text-[#C25E38] dark:hover:text-[#E06D43] transition font-medium cursor-pointer bg-transparent border-0 p-0 ${
              activePage === "architecture" || activePage === "how-it-works"
                ? "text-[#C25E38] dark:text-[#E06D43] font-bold"
                : ""
            }`}
          >
            Thinking & Architecture
          </button>

          <button
            onClick={() => router.push("/app")}
            className={`hover:text-[#C25E38] dark:hover:text-[#E06D43] transition font-medium cursor-pointer bg-transparent border-0 p-0 ${
              activePage === "app" ? "text-[#C25E38] dark:text-[#E06D43] font-bold" : ""
            }`}
          >
            NityaGeeta Dialogue
          </button>

          <button
            onClick={() => router.push("/contact")}
            className={`hover:text-[#C25E38] dark:hover:text-[#E06D43] transition font-medium cursor-pointer bg-transparent border-0 p-0 ${
              activePage === "contact" ? "text-[#C25E38] dark:text-[#E06D43] font-bold" : ""
            }`}
          >
            Contact Us
          </button>
        </motion.div>

        {/* RIGHT SIDE: Animated Theme Toggle, Auth buttons */}
        <div className="flex items-center space-x-3 font-sans">
          <AnimatedThemeToggler />

          {session?.user ? (
            /* ── Authenticated: Profile Button with Dropdown ── */
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 pr-4 rounded-xl border border-saffron/30 dark:border-saffron-hover/40 bg-background hover:border-saffron/60 dark:hover:border-saffron-hover/60 transition shadow-sm cursor-pointer"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "Profile"}
                    className="w-7 h-7 rounded-full border border-saffron/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-saffron flex items-center justify-center text-white text-xs font-bold">
                    {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="text-xs font-semibold text-text-primary">
                  Profile
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown with Aceternity Notch Spring Physics */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)", transition: { duration: 0.12 } }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{ transformOrigin: "top right" }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-[#DFD5C6] dark:border-[#38332E] shadow-[0_20px_50px_rgba(0,0,0,0.35)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden z-50 p-1.5"
                  >
                    {/* User Info */}
                    <div className="p-3.5 border-b border-[#DFD5C6] dark:border-[#38332E] mb-1">
                      <div className="flex items-center gap-3">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || "Profile"}
                            className="w-10 h-10 rounded-full border-2 border-saffron/30"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-saffron flex items-center justify-center text-white text-sm font-bold">
                            {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text-primary truncate">
                            {session.user.name}
                          </p>
                          <p className="text-[11px] text-text-muted truncate font-mono">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items with Staggered Fade & Spring */}
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
                      }}
                      className="space-y-1 p-1"
                    >
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: -6, filter: "blur(4px)" },
                          visible: {
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)",
                            transition: { type: "spring", stiffness: 420, damping: 30 },
                          },
                        }}
                      >
                        <Link
                          href="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-[#EFE9DF] dark:hover:bg-[#2A2622] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition"
                        >
                          <User className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                          <span>Edit Profile</span>
                        </Link>
                      </motion.div>

                      <div className="pt-1 border-t border-[#DFD5C6] dark:border-[#38332E]">
                        <motion.button
                          variants={{
                            hidden: { opacity: 0, y: -6, filter: "blur(4px)" },
                            visible: {
                              opacity: 1,
                              y: 0,
                              filter: "blur(0px)",
                              transition: { type: "spring", stiffness: 420, damping: 30 },
                            },
                          }}
                          onClick={() => {
                            setProfileOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-error-text hover:bg-red-500/10 dark:hover:bg-red-500/15 transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </motion.button>
                      </div>
                    </motion.div>
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
                  className="p-2.5 px-5 font-sans text-xs border-saffron/30 dark:border-saffron-hover/40"
                />
              </Link>
            ) : (
              <Link href="/signin">
                <InteractiveHoverButton
                  text="Sign In"
                  icon={<User className="w-4 h-4" />}
                  className="p-2.5 px-6 font-sans text-xs border-saffron/30 dark:border-saffron-hover/40"
                />
              </Link>
            )
          )}
        </div>
      </motion.div>
    </header>
  );
}
