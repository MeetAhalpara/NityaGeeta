"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Phone, Mail, MapPin, Calendar, Save, ArrowRight, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

interface ProfileData {
  firstName: string;
  middleName: string;
  lastName: string;
  mobile: string;
  email: string;
  age: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  spiritualInterest: string;
  preferredLanguage: string;
}

export default function ProfileSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    firstName: "",
    middleName: "",
    lastName: "",
    mobile: "",
    email: "",
    age: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    spiritualInterest: "",
    preferredLanguage: "English",
  });

  // Pre-fill from Google session data
  useEffect(() => {
    if (session?.user) {
      const nameParts = (session.user.name || "").split(" ");
      setProfile((prev) => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : "",
        middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "",
        email: session.user?.email || "",
      }));
    }
  }, [session]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const updateField = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Save to localStorage (will be replaced with backend API later)
    setTimeout(() => {
      const profilePayload = {
        ...profile,
        googleId: (session?.user as Record<string, unknown>)?.id || "",
        googleImage: session?.user?.image || "",
        setupCompleted: true,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("nityageeta_profile", JSON.stringify(profilePayload));
      setIsSaving(false);
      setSaved(true);

      // Redirect to homepage after save
      setTimeout(() => {
        router.push("/");
      }, 1200);
    }, 600);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1816] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#C25E38] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB] flex flex-col font-sans selection:bg-[#C25E38]/20 dark:selection:bg-[#E06D43]/30 transition-colors duration-300 relative overflow-hidden">
      <Navbar />

      {/* Decorative Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#C25E38]/8 to-[#E06D43]/4 rounded-full blur-3xl pointer-events-none -z-10" />

      <main className="flex-1 flex items-start justify-center p-4 sm:p-8 pt-28 sm:pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="max-w-3xl w-full"
        >
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "Profile"}
                  className="w-20 h-20 rounded-full border-3 border-[#C25E38]/40 shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#C25E38] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#C25E38]/15 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] text-xs font-bold font-mono tracking-wider mb-3">
              COMPLETE YOUR PROFILE
            </span>
            <h1 className="text-3xl font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB]">
              Welcome, {session?.user?.name?.split(" ")[0] || "Seeker"}
            </h1>
            <p className="text-sm text-[#5C4F45] dark:text-[#D4C7B8] mt-2 max-w-md mx-auto">
              Set up your spiritual profile. Fields marked with * are required. You can update these anytime from your Profile.
            </p>
          </div>

          {/* Profile Form Card */}
          <form onSubmit={handleSave}>
            <div className="rounded-3xl bg-[#FAF7F2]/95 dark:bg-[#262320]/95 border border-[#E8E1D7] dark:border-[#38332E] shadow-2xl backdrop-blur-xl overflow-hidden">

              {/* Section: Personal Information */}
              <div className="p-6 sm:p-8 border-b border-[#E8E1D7] dark:border-[#38332E]">
                <h2 className="text-lg font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] mb-5 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43]" />
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      placeholder="Arjuna"
                      className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl px-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition"
                    />
                  </div>

                  {/* Middle Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                      Middle Name <span className="text-[#8C7B70] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={profile.middleName}
                      onChange={(e) => updateField("middleName", e.target.value)}
                      placeholder="Kumar"
                      className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl px-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      placeholder="Pandava"
                      className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl px-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* Age */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C25E38] dark:text-[#E06D43]" />
                        Age
                      </label>
                      <span className="text-[10px] text-[#8C7B70] dark:text-[#A89F91] font-medium">Must be 18–100</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={profile.age}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                        const num = parseInt(cleaned, 10);
                        if (cleaned === "" || (num >= 0 && num <= 100)) {
                          updateField("age", cleaned);
                        }
                      }}
                      placeholder="18 – 100"
                      className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl px-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  {/* Preferred Language */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                      Preferred Language
                    </label>
                    <select
                      value={profile.preferredLanguage}
                      onChange={(e) => updateField("preferredLanguage", e.target.value)}
                      className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl px-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Sanskrit">Sanskrit</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Marathi">Marathi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Contact Information */}
              <div className="p-6 sm:p-8 border-b border-[#E8E1D7] dark:border-[#38332E]">
                <h2 className="text-lg font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] mb-5 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43]" />
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email (Pre-filled from Google, read-only) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#C25E38] dark:text-[#E06D43]" />
                      Email Address
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C25E38]/15 text-[#C25E38] dark:bg-[#E06D43]/20 dark:text-[#E06D43] font-mono">
                        Google
                      </span>
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      readOnly
                      className="w-full bg-[#EFE9DF]/40 dark:bg-[#1C1917]/60 border border-[#DFD5C6] dark:border-[#38332E] rounded-xl px-4 py-3 text-xs text-[#5C4F45] dark:text-[#A89F91] font-mono cursor-not-allowed"
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#C25E38] dark:text-[#E06D43]" />
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={profile.mobile}
                      onChange={(e) => updateField("mobile", e.target.value)}
                      placeholder="+1 (613) 555-0123"
                      className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl px-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Address */}
              <div className="p-6 sm:p-8 border-b border-[#E8E1D7] dark:border-[#38332E]">
                <h2 className="text-lg font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43]" />
                  Address <span className="text-xs font-normal text-[#8C7B70]">(Optional)</span>
                </h2>

                <div className="space-y-4">
                  {/* Street Address */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="1385 Woodroffe Ave"
                      className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl px-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* City */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        value={profile.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="Ottawa"
                        className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl px-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition"
                      />
                    </div>

                    {/* State/Province */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                        Province / State
                      </label>
                      <input
                        type="text"
                        value={profile.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        placeholder="Ontario"
                        className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl px-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        value={profile.country}
                        onChange={(e) => updateField("country", e.target.value)}
                        placeholder="Canada"
                        className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl px-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition"
                      />
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={profile.postalCode}
                        onChange={(e) => updateField("postalCode", e.target.value)}
                        placeholder="K2G 1V8"
                        className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl px-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Spiritual Interests */}
              <div className="p-6 sm:p-8 border-b border-[#E8E1D7] dark:border-[#38332E]">
                <h2 className="text-lg font-bold font-serif text-[#2D2622] dark:text-[#F5F2EB] mb-5">
                  Spiritual Interest <span className="text-xs font-normal text-[#8C7B70]">(Optional)</span>
                </h2>
                <textarea
                  value={profile.spiritualInterest}
                  onChange={(e) => updateField("spiritualInterest", e.target.value)}
                  placeholder="Tell us about your spiritual journey, what draws you to the Bhagavad Gita, or any specific topics you'd like to explore (e.g., Karma Yoga, Dharma, Meditation, Vedantic Philosophy)..."
                  rows={3}
                  className="w-full bg-[#EFE9DF]/60 dark:bg-[#1C1917] border border-[#DFD5C6] dark:border-[#38332E] rounded-xl px-4 py-3 text-xs text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] focus:outline-none focus:border-[#C25E38] dark:focus:border-[#E06D43] transition resize-none"
                />
              </div>

              {/* Save Section */}
              <div className="p-6 sm:p-8 flex items-center justify-between">
                <p className="text-[11px] text-[#8C7B70] dark:text-[#A89F91]">
                  You can update your profile anytime from the Profile dropdown.
                </p>

                {saved ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-bold"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Profile Saved! Redirecting...</span>
                  </motion.div>
                ) : (
                  <InteractiveHoverButton
                    type="submit"
                    text={isSaving ? "Saving..." : "Save Profile"}
                    icon={<ArrowRight className="w-4 h-4" />}
                    className="py-3 px-8 text-xs font-sans font-bold shadow-lg shadow-[#C25E38]/20"
                  />
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
