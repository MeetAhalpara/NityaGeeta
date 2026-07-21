"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Calendar, Save, Check, ChevronRight,
  ShieldCheck, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

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
  const [activeSection, setActiveSection] = useState<"personal" | "contact" | "spiritual">("personal");

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Load existing profile or pre-fill from Google session
  useEffect(() => {
    if (!session?.user) return;

    const storageKey = `nityageeta_profile_${session.user.email}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      setProfile(JSON.parse(stored));
      setIsFirstTime(false);
    } else {
      // First-time user: pre-fill from Google data
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
      setIsFirstTime(true);
    }
  }, [session]);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    if (!session?.user?.email) return;
    setIsSaving(true);

    const updated = {
      ...profile,
      isProfileComplete: true,
      updatedAt: new Date().toISOString(),
    };

    const storageKey = `nityageeta_profile_${session.user.email}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setProfile(updated);

    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setIsFirstTime(false);

      setTimeout(() => setSaved(false), 2500);
    }, 500);
  };

  if (status === "loading" || !session) {
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
              {sections.map((sec) => (
                <button
                  key={sec.key}
                  onClick={() => setActiveSection(sec.key)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeSection === sec.key
                      ? "bg-[#C25E38]/15 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] border border-[#C25E38]/20 dark:border-[#E06D43]/30"
                      : "text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF] dark:hover:bg-[#332E2A] border border-transparent"
                  }`}
                >
                  <sec.icon className="w-4 h-4" />
                  <span>{sec.label}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform ${activeSection === sec.key ? "rotate-90" : ""}`} />
                </button>
              ))}
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
                      <InputField
                        label="Age"
                        icon={<Calendar className="w-4 h-4" />}
                        type="text"
                        inputMode="numeric"
                        value={profile.age}
                        onChange={(v) => {
                          // Only allow digits, enforce 18-100 range
                          const cleaned = v.replace(/[^0-9]/g, "").slice(0, 3);
                          const num = parseInt(cleaned, 10);
                          if (cleaned === "" || (num >= 0 && num <= 100)) {
                            handleChange("age", cleaned);
                          }
                        }}
                        placeholder="18 – 100"
                        sublabel="Must be 18–100"
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
                      <InputField
                        label="Mobile Number"
                        icon={<Phone className="w-4 h-4" />}
                        type="tel"
                        value={profile.mobile}
                        onChange={(v) => handleChange("mobile", v)}
                        placeholder="+1 (555) 000-0000"
                      />
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
            <div className="mt-8 pt-6 border-t border-[#DFD5C6]/60 dark:border-[#38332E]/60 flex items-center justify-between gap-4">
              {/* Section Step Indicators */}
              <div className="flex items-center gap-1.5">
                {sections.map((sec) => (
                  <button
                    key={sec.key}
                    onClick={() => setActiveSection(sec.key)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      activeSection === sec.key
                        ? "bg-[#C25E38] dark:bg-[#E06D43] scale-110"
                        : "bg-[#DFD5C6] dark:bg-[#38332E] hover:bg-[#C25E38]/40"
                    }`}
                    title={sec.label}
                  />
                ))}
              </div>

              {/* Save Button */}
              <InteractiveHoverButton
                type="button"
                onClick={handleSave}
                text={
                  isSaving
                    ? "Saving..."
                    : saved
                    ? "Saved!"
                    : isFirstTime
                    ? "Save & Complete Profile"
                    : "Save Changes"
                }
                icon={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                className={`px-6 py-3 text-xs font-sans font-bold shadow-lg ${
                  saved
                    ? "shadow-emerald-500/20 border-emerald-500/40"
                    : "shadow-[#C25E38]/20"
                }`}
              />
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
