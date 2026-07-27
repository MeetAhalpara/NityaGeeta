"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

interface GoogleButtonProps {
  callbackUrl?: string;
  className?: string;
  source?: "signup" | "signin";
  onExistingUser?: () => void;
}

export function GoogleButton({ callbackUrl = "http://localhost:1870", className, source, onExistingUser }: GoogleButtonProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleClick = async () => {
    // If this is a signup flow, we need to check user existence AFTER OAuth completes
    // The NextAuth signIn callback will handle this check and redirect accordingly
    
    // Construct the final callback URL
    let finalCallbackUrl = callbackUrl;
    
    if (source === "signup") {
      // If callbackUrl already ends with /profile, don't add it again
      const baseUrl = callbackUrl.replace(/\/profile$/, "");
      finalCallbackUrl = `${baseUrl}/profile?source=signup`;
    }
    
    setIsChecking(true);
    
    try {
      // Initiate Google OAuth - the signIn callback in NextAuth will check user existence
      await signIn("google", { callbackUrl: finalCallbackUrl });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isChecking}
      className={cn(
        "relative flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl",
        "bg-[#EFE9DF] dark:bg-[#332E2A]",
        "border border-[#DFD5C6] dark:border-[#38332E]",
        "text-sm font-bold text-[#2D2622] dark:text-[#F5F2EB]",
        "hover:border-[#C25E38]/50 dark:hover:border-[#E06D43]/50",
        "hover:shadow-md transition-all duration-300 shadow-sm",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {isChecking ? (
        <div className="w-4 h-4 border-2 border-[#C25E38] border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        <>
          {/* Official Google "G" Logo */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48" aria-hidden>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.37-.76-2.84-.76-4.59s.27-3.22.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
        </>
      )}

      <span>{isChecking ? "Checking..." : "Continue with Google"}</span>
    </button>
  );
}
