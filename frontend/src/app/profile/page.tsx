"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Save, Check, ChevronRight,
  ShieldCheck, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { lookupAccountByEmail, updateGoogleProfile } from "@/lib/auth-api";
import { AgePicker } from "@/components/ui/age-picker";
import { DiaTextReveal } from "@/components/ui/dia-text-reveal";

interface ProfileData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobile: string;
  age: string;
  gender: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  spiritualInterest: string;
  profileImage: string;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_PROFILE: ProfileData = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  mobile: "",
  age: "",
  gender: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  spiritualInterest: "",
  profileImage: "",
  isProfileComplete: false,
  createdAt: "",
  updatedAt: "",
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"personal" | "contact" | "spiritual">("personal");

  // Pre-load primary routes for instant page switching
  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/app");
    router.prefetch("/signin");
    router.prefetch("/signup");
  }, [router]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Show loading state while checking authentication
  const [isChecking, setIsChecking] = useState(true);

  // Step 0: Check authentication
  useEffect(() => {
    if (status === "loading") return;
    
    // Not authenticated - redirect to signin
    if (status === "unauthenticated") {
      router.replace("/signin");
      return;
    }
    
    // Authenticated - allow user to view/edit their profile
    if (status === "authenticated" && session?.user?.email) {
      setIsChecking(false);
    }
  }, [status, session, router]);

  // Step 1: Pre-fill profile immediately from localStorage / session — no network wait.
  useEffect(() => {
    if (!session?.user?.email) return;

    const storageKey = `nityageeta_profile_${session.user.email}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      setProfile(JSON.parse(stored));
    } else {
      const googleName = session.user.name || "";
      const nameParts = googleName.split(" ");
      setProfile({
        ...DEFAULT_PROFILE,
        firstName: nameParts[0] || "",
        lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : "",
        middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "",
        email: session.user.email || "",
        profileImage: session.user.image || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [session?.user?.email, session?.user?.name, session?.user?.image]);

  // Step 2: Check DB in background to register user in PostgreSQL if new.
  useEffect(() => {
    if (!session?.user?.email) return;
    if (status !== "authenticated") return;

    let cancelled = false;

    const checkAndLoadUser = async () => {
      // Check if localStorage has profile
      const storageKey = `nityageeta_profile_${session.user.email}`;
      const stored = localStorage.getItem(storageKey);
      const storedProfile = stored ? JSON.parse(stored) : null;

      try {
        const result = await lookupAccountByEmail(session.user.email);
        if (cancelled) return;

        if (result.exists || storedProfile?.isProfileComplete) {
          setIsFirstTime(false);
          setNotice(null);
        } else {
          // Genuinely first time without any stored profile or DB entry
          setIsFirstTime(false); // keep standard Edit Profile view
          setNotice(null);
        }
      } catch (error) {
        if (cancelled) return;
        setNotice(null);
      }
    };

    void checkAndLoadUser();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.email, status]);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!session?.user?.email) return;

    if (isFirstTime && !password.trim()) {
      setNotice("Password is mandatory for credentials authentication later.");
      return;
    }

    setIsSaving(true);
    setNotice(null);

    try {
      if (isFirstTime) {
        await updateGoogleProfile({
          email: session.user.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          password: password.trim(),
          age: profile.age || undefined,
          preferredLanguage: "English",
        });
      }

      const updated = {
        ...profile,
        isProfileComplete: true,
        updatedAt: new Date().toISOString(),
      };

      const storageKey = `nityageeta_profile_${session.user.email}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setProfile(updated);

      setSaved(true);
      setIsFirstTime(false);

      // Auto-reset the saved state after 4 s so the button returns to normal
      setTimeout(() => setSaved(false), 4000);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to update profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || !session || isChecking) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1816] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#C25E38] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sections = [
    { key: "personal" as const, label: "Personal Details", icon: User },
    { key: "contact" as const, label: "Contact & Address", icon: MapPin },
    { key: "spiritual" as const, label: "Spiritual Profile", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB] flex flex-col font-sans selection:bg-[#C25E38]/20 dark:selection:bg-[#E06D43]/30 transition-colors duration-300 relative overflow-hidden">
      <Navbar activePage="profile" />

      {/* Decorative Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#C25E38]/8 to-[#E06D43]/4 rounded-full blur-3xl pointer-events-none -z-10" />

      <main className="flex-1 flex items-start justify-center p-4 sm:p-8 pt-28 sm:pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-4xl lg:max-w-5xl w-full rounded-3xl bg-[#FAF7F2]/95 dark:bg-[#262320]/95 border border-[#E8E1D7] dark:border-[#38332E] shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-[600px] relative z-10"
        >
          {/* LEFT SIDEBAR: Profile Summary & Section Navigation */}
          <div className="p-6 lg:p-8 bg-gradient-to-br from-[#C25E38]/10 via-[#E06D43]/5 to-transparent border-b lg:border-b-0 lg:border-r border-[#E8E1D7] dark:border-[#38332E] flex flex-col">
            {/* Back Link */}
            <Link
              href="/"
              className="inline-flex items-center text-xs font-semibold text-[#8C7B70] dark:text-[#A89F91] hover:text-[#C25E38] dark:hover:text-[#E06D43] transition mb-6 gap-1.5 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>

            {/* User Avatar & Name */}
            <div className="flex flex-col items-center text-center mb-8">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-3 border-[#C25E38]/30 shadow-lg mb-3"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C25E38] to-[#E06D43] flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-3">
                  {profile.firstName?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <h2 className="font-bold text-base text-[#2D2622] dark:text-[#F5F2EB] font-serif">
                {profile.firstName || "Your"} {profile.lastName || "Profile"}
              </h2>
              <p className="text-[11px] text-[#8C7B70] dark:text-[#A89F91] font-mono mt-0.5">
                {profile.email}
              </p>

              {isFirstTime && (
                <span className="mt-3 inline-block px-3 py-1 rounded-full bg-[#C25E38]/15 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] text-[10px] font-bold font-mono tracking-wider">
                  COMPLETE YOUR PROFILE
                </span>
              )}

              {profile.isProfileComplete && !isFirstTime && (
                <span className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold font-mono tracking-wider">
                  <Check className="w-3 h-3" />
                  PROFILE COMPLETE
                </span>
              )}
            </div>

            {/* Section Navigation */}
            <nav className="space-y-1.5 flex-1">
              {sections.map((sec) => {
                const isActive = activeSection === sec.key;
                return (
                  <button
                    key={sec.key}
                    onClick={() => setActiveSection(sec.key)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? "bg-[#C25E38]/15 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] border border-[#C25E38]/20 dark:border-[#E06D43]/30"
                        : "text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF] dark:hover:bg-[#332E2A] border border-transparent"
                    }`}
                  >
                    <sec.icon className="w-4 h-4" />
                    <span>{sec.label}</span>
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          key="arrow"
                          className="ml-auto"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* RIGHT PANEL: Form Content */}
          <div className="p-6 lg:p-10 flex flex-col">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#2D2622] dark:text-[#F5F2EB] font-serif">
                {isFirstTime ? "Welcome! Set Up Your Profile" : "Edit Your Profile"}
              </h1>
              <p className="text-xs text-[#8C7B70] dark:text-[#A89F91] mt-1">
                {isFirstTime
                  ? "We've pre-filled details from your Google account. Review and add any additional information."
                  : "Update your personal details, contact information, and spiritual preferences."}
              </p>
            </div>

            {notice && (
              <div className="mb-6 rounded-2xl border border-[#C25E38]/25 bg-[#C25E38]/10 px-4 py-2.5 text-xs text-[#5C4F45] dark:text-[#F5F2EB]">
                {notice}
              </div>
            )}

            {/* Form Sections */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="flex-1 space-y-5"
              >
                {/* ── Personal Details ── */}
                {activeSection === "personal" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <InputField
                        label="First Name"
                        icon={<User className="w-4 h-4" />}
                        value={profile.firstName}
                        onChange={(v) => handleChange("firstName", v)}
                        placeholder="Arjuna"
                        required
                      />
                      <InputField
                        label="Middle Name"
                        value={profile.middleName}
                        onChange={(v) => handleChange("middleName", v)}
                        placeholder="(Optional)"
                        sublabel="Optional"
                      />
                      <InputField
                        label="Last Name"
                        value={profile.lastName}
                        onChange={(v) => handleChange("lastName", v)}
                        placeholder="Pandava"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Age — scroll drum picker */}
                      <AgePicker
                        value={profile.age}
                        onChange={(v) => handleChange("age", v)}
                      />
                      <div>
                        <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                          Gender
                        </label>
                        <select
                          value={profile.gender}
                          onChange={(e) => handleChange("gender", e.target.value)}
                          className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl px-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition appearance-none cursor-pointer"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="non-binary">Non-Binary</option>
                          <option value="prefer-not-to-say">Prefer Not to Say</option>
                        </select>
                      </div>
                    </div>

                    {isFirstTime && (
                      <div className="grid grid-cols-1 gap-4 pt-2">
                        <InputField
                          label="Password"
                          type="password"
                          required
                          value={password}
                          onChange={(v) => setPassword(v)}
                          placeholder="Create a password for manual login later"
                          sublabel="Mandatory"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* ── Contact & Address ── */}
                {activeSection === "contact" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        label="Email Address"
                        icon={<Mail className="w-4 h-4" />}
                        type="email"
                        value={profile.email}
                        onChange={(v) => handleChange("email", v)}
                        placeholder="arjuna@nityageeta.org"
                        disabled
                        sublabel="From Google"
                      />
                      {/* Mobile — digits only, auto-formats to (XXX)-XXX-XXXX */}
                      <div>
                        <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                          Mobile Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-[#8C7B70] dark:text-[#A89F91] absolute left-3.5 top-3.5" />
                          <input
                            type="tel"
                            inputMode="numeric"
                            value={profile.mobile}
                            onChange={(e) => {
                              // Strip everything except digits
                              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                              // Build (XXX)-XXX-XXXX progressively
                              let formatted = "";
                              if (digits.length === 0) {
                                formatted = "";
                              } else if (digits.length <= 3) {
                                formatted = `(${digits}`;
                              } else if (digits.length <= 6) {
                                formatted = `(${digits.slice(0, 3)})-${digits.slice(3)}`;
                              } else {
                                formatted = `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`;
                              }
                              handleChange("mobile", formatted);
                            }}
                            placeholder="(XXX)-XXX-XXXX"
                            className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl pl-10 pr-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition font-mono tracking-wider"
                          />
                        </div>
                      </div>
                    </div>

                    <InputField
                      label="Address Line 1"
                      icon={<MapPin className="w-4 h-4" />}
                      value={profile.addressLine1}
                      onChange={(v) => handleChange("addressLine1", v)}
                      placeholder="123 Dharma Street"
                    />
                    <InputField
                      label="Address Line 2"
                      value={profile.addressLine2}
                      onChange={(v) => handleChange("addressLine2", v)}
                      placeholder="Apt 4B (Optional)"
                      sublabel="Optional"
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <InputField
                        label="City"
                        value={profile.city}
                        onChange={(v) => handleChange("city", v)}
                        placeholder="Ottawa"
                      />
                      <InputField
                        label="State / Province"
                        value={profile.state}
                        onChange={(v) => handleChange("state", v)}
                        placeholder="Ontario"
                      />
                      <InputField
                        label="Country"
                        value={profile.country}
                        onChange={(v) => handleChange("country", v)}
                        placeholder="Canada"
                      />
                      <InputField
                        label="Postal Code"
                        value={profile.postalCode}
                        onChange={(v) => handleChange("postalCode", v)}
                        placeholder="K1A 0B1"
                      />
                    </div>
                  </>
                )}

                {/* ── Spiritual Profile ── */}
                {activeSection === "spiritual" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                        Primary Spiritual Interest
                      </label>
                      <select
                        value={profile.spiritualInterest}
                        onChange={(e) => handleChange("spiritualInterest", e.target.value)}
                        className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl px-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition appearance-none cursor-pointer"
                      >
                        <option value="">Select Your Interest</option>
                        <option value="bhagavad-gita-study">Bhagavad Gita Study</option>
                        <option value="meditation-yoga">Meditation & Yoga</option>
                        <option value="vedic-philosophy">Vedic Philosophy</option>
                        <option value="sanskrit-learning">Sanskrit Learning</option>
                        <option value="daily-sadhana">Daily Sadhana Practice</option>
                        <option value="karma-yoga">Karma Yoga (Action Path)</option>
                        <option value="bhakti-yoga">Bhakti Yoga (Devotion Path)</option>
                        <option value="jnana-yoga">Jnana Yoga (Knowledge Path)</option>
                        <option value="general-curiosity">General Curiosity</option>
                      </select>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#C25E38]/8 dark:bg-[#E06D43]/8 border border-[#C25E38]/15 dark:border-[#E06D43]/20">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-[#2D2622] dark:text-[#F5F2EB]">
                            Your Data is Sacred
                          </p>
                          <p className="text-[11px] text-[#5C4F45] dark:text-[#D4C7B8] mt-1 leading-relaxed">
                            NityaGeeta respects your privacy. Your profile data is stored locally on your device and is never shared with third parties. We use it only to personalize your Bhagavad Gita study experience.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Save Button & Section Navigation */}
            <div className="mt-8 pt-6 border-t border-[#DFD5C6]/60 dark:border-[#38332E]/60 flex items-center justify-end gap-4">

              {/* Save area — shows success animation when saved, button otherwise */}
              <AnimatePresence mode="wait">
                {saved ? (
                  <motion.div
                    key="saved-msg"
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-400/40 bg-emerald-50 dark:bg-emerald-900/20 text-sm font-sans font-semibold"
                  >
                    <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span className="text-emerald-700 dark:text-emerald-300">
                      <DiaTextReveal
                        text={isFirstTime ? "Profile complete!" : "Changes saved!"}
                        duration={1.2}
                        startOnView={false}
                        once={false}
                        colors={["#34d399", "#10b981", "#6ee7b7", "#a7f3d0", "#059669"]}
                        textColor="rgb(4 120 87)"
                        className="font-sans font-semibold text-sm"
                      />
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="save-btn"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <InteractiveHoverButton
                      type="button"
                      onClick={handleSave}
                      text={
                        isSaving
                          ? "Saving..."
                          : isFirstTime
                          ? "Save & Complete Profile"
                          : "Save Changes"
                      }
                      icon={<Save className="w-4 h-4" />}
                      className="px-6 py-3 text-xs font-sans font-bold shadow-lg shadow-[#C25E38]/20"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

/* ── Reusable Input Field Component ── */
function InputField({
  label,
  icon,
  value,
  onChange,
  placeholder = "",
  type = "text",
  inputMode,
  required = false,
  disabled = false,
  sublabel,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  required?: boolean;
  disabled?: boolean;
  sublabel?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8]">
          {label}
          {required && <span className="text-[#C25E38] ml-0.5">*</span>}
        </label>
        {sublabel && (
          <span className="text-[10px] text-[#8C7B70] dark:text-[#A89F91] font-medium">
            {sublabel}
          </span>
        )}
      </div>
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-3.5 text-[#8C7B70] dark:text-[#A89F91]">
            {icon}
          </div>
        )}
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl ${
            icon ? "pl-10" : "pl-4"
          } pr-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          } [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        />
      </div>
    </div>
  );
}
