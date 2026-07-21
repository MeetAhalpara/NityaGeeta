"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Shield, Lock, ArrowRight } from "lucide-react";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: { name: string; email: string; picture: string }) => void;
}

export function GoogleAuthModal({ isOpen, onClose, onSuccess }: GoogleAuthModalProps) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const defaultAccounts = [
    {
      name: "Arjuna Pandava",
      email: "arjuna@gmail.com",
      picture: "https://api.dicebear.com/7.x/bottts/svg?seed=Arjuna",
      sub: "Verified Google Account",
    },
    {
      name: "Spiritual Seeker",
      email: "seeker.nitya@gmail.com",
      picture: "https://api.dicebear.com/7.x/bottts/svg?seed=Seeker",
      sub: "Google Workspace Account",
    },
  ];

  const handleSelectAndSignIn = (account: { name: string; email: string; picture: string }) => {
    setSelectedAccount(account.email);
    setIsAuthenticating(true);

    setTimeout(() => {
      const userObj = {
        name: account.name,
        email: account.email,
        picture: account.picture,
        provider: "google",
        loggedInAt: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("nityageeta_user", JSON.stringify(userObj));
      }

      if (onSuccess) {
        onSuccess(userObj);
      } else {
        window.location.href = "/chat";
      }
    }, 700);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    const nameFromEmail = customEmail.split("@")[0];
    const capitalizedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

    handleSelectAndSignIn({
      name: capitalizedName,
      email: customEmail,
      picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${customEmail}`,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E1B18] text-gray-900 dark:text-gray-100 shadow-2xl border border-gray-200 dark:border-[#38332E] overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-gray-100 dark:border-[#38332E] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                    Sign in with Google
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    to continue to <strong className="text-[#C25E38] dark:text-[#E06D43]">NityaGeeta Platform</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2A2521] text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4">
              {isAuthenticating ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-10 h-10 border-3 border-[#C25E38] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Authenticating with Google...
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Redirecting to your NityaGeeta spiritual workspace.
                  </p>
                </div>
              ) : !useCustom ? (
                <>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Choose an account
                  </p>

                  <div className="space-y-2">
                    {defaultAccounts.map((acc) => (
                      <button
                        key={acc.email}
                        onClick={() => handleSelectAndSignIn(acc)}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-[#38332E] hover:border-[#C25E38]/60 dark:hover:border-[#E06D43]/60 bg-gray-50/50 dark:bg-[#262320]/60 hover:bg-white dark:hover:bg-[#262320] transition group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={acc.picture}
                            alt={acc.name}
                            className="w-9 h-9 rounded-full bg-[#C25E38]/10 border border-[#C25E38]/20 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition">
                              {acc.name}
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                              {acc.email}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#C25E38] dark:group-hover:text-[#E06D43] transition group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setUseCustom(true)}
                    className="w-full text-center text-xs font-semibold text-[#C25E38] dark:text-[#E06D43] hover:underline pt-2"
                  >
                    Use another Google account
                  </button>
                </>
              ) : (
                <form onSubmit={handleCustomSubmit} className="space-y-3">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Enter your Google email address:
                  </p>

                  <input
                    type="email"
                    required
                    autoFocus
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-gray-50 dark:bg-[#1C1917] border border-gray-300 dark:border-[#38332E] rounded-xl px-4 py-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-[#C25E38]"
                  />

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setUseCustom(false)}
                      className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-[#38332E] text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2521]"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-[#C25E38] text-white text-xs font-bold hover:opacity-90 transition"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-[#181513] border-t border-gray-100 dark:border-[#38332E] text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#C25E38]" />
                <span>Protected by Google Security</span>
              </div>
              <span>Terms & Privacy</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
