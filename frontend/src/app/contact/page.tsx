"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Send,
  Upload,
  X,
  Shield,
  BookOpen,
  HelpCircle,
  FileText,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Image as ImageIcon
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

const CATEGORIES = [
  { id: "ai_feedback", label: "AI Dialogue Feedback & Prompt Grounding" },
  { id: "verse_correction", label: "Sanskrit Verse / OCR Typo Correction" },
  { id: "commentary_insight", label: "Share Commentary Insights / Traditional Bhashya" },
  { id: "bug_report", label: "UI Glitch or Technical Bug Report" },
  { id: "report_misuse", label: "Report Misuse / Misinterpretation" },
  { id: "other", label: "Other Inquiry" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "ai_feedback",
    otherCategory: "",
    message: "",
  });

  const [emailError, setEmailError] = useState<string>("");
  const [emailTouched, setEmailTouched] = useState<boolean>(false);
  const [suggestedDomain, setSuggestedDomain] = useState<string>("");

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [uploadedImages, setUploadedImages] = useState<
    { id: string; file: File; preview: string; name: string }[]
  >([]);
  const [uploadError, setUploadError] = useState<string>("");
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [mounted, setMounted] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when modal is open (identical to PDF viewer)
  useEffect(() => {
    if (activeLightboxImage) {
      document.body.style.overflow = "hidden";
      setZoomScale(1);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeLightboxImage]);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveLightboxImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Common email provider typo detection map
  const DOMAIN_TYPO_MAP: Record<string, string> = {
    "outmail.com": "outlook.com",
    "outlok.com": "outlook.com",
    "outloo.com": "outlook.com",
    "gamil.com": "gmail.com",
    "gmai.com": "gmail.com",
    "gmial.com": "gmail.com",
    "gmaill.com": "gmail.com",
    "hotmial.com": "hotmail.com",
    "hotmai.com": "hotmail.com",
    "yaho.com": "yahoo.com",
    "yahooo.com": "yahoo.com",
    "icoud.com": "icloud.com",
    "icloud.co": "icloud.com",
  };

  const POPULAR_PROVIDERS = ["@gmail.com", "@outlook.com", "@hotmail.com", "@yahoo.com", "@icloud.com"];

  // Email format validator requiring @ and domain with valid TLD (.com, .org, .edu, etc.)
  const validateEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/;
    return regex.test(email.trim());
  };

  const checkEmailTypo = (email: string) => {
    const parts = email.split("@");
    if (parts.length === 2) {
      const user = parts[0];
      const domain = parts[1].toLowerCase().trim();
      if (DOMAIN_TYPO_MAP[domain]) {
        setSuggestedDomain(`${user}@${DOMAIN_TYPO_MAP[domain]}`);
        return;
      }
    }
    setSuggestedDomain("");
  };

  const handleEmailChange = (val: string) => {
    setFormData((prev) => ({ ...prev, email: val }));
    checkEmailTypo(val);

    if (emailTouched) {
      if (!val.trim()) {
        setEmailError("Email address is required.");
      } else if (!validateEmail(val)) {
        setEmailError("Please enter a valid email address (e.g. name@gmail.com, name@outlook.com).");
      } else {
        setEmailError("");
      }
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    checkEmailTypo(formData.email);
    if (!formData.email.trim()) {
      setEmailError("Email address is required.");
    } else if (!validateEmail(formData.email)) {
      setEmailError("Please enter a valid email address (e.g. name@gmail.com, name@outlook.com).");
    } else {
      setEmailError("");
    }
  };

  const applySuggestedEmail = (suggested: string) => {
    setFormData((prev) => ({ ...prev, email: suggested }));
    setSuggestedDomain("");
    setEmailError("");
  };

  const applyProviderChip = (providerSuffix: string) => {
    const current = formData.email.trim();
    const prefix = current ? current.replace(/@.*$/, "") : "name";
    const fullEmail = `${prefix}${providerSuffix}`;
    setFormData((prev) => ({ ...prev, email: fullEmail }));
    setSuggestedDomain("");
    setEmailError("");
  };

  // Strictly accept only image files (PNG, JPG, WEBP, GIF)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Filter strictly for image mime types
    const validImageFiles = files.filter((file) => file.type.startsWith("image/"));
    const hasNonImages = files.some((file) => !file.type.startsWith("image/"));

    if (hasNonImages) {
      setUploadError("Only screenshot images (PNG, JPG, WEBP, GIF) are allowed. PDFs are not supported.");
    }

    if (validImageFiles.length === 0) {
      e.target.value = "";
      return;
    }

    const remainingSlots = 5 - uploadedImages.length;
    if (remainingSlots <= 0) {
      setUploadError("Maximum limit of 5 screenshots reached.");
      e.target.value = "";
      return;
    }

    const newImages = validImageFiles.slice(0, remainingSlots).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setUploadedImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const handleRemoveImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      setEmailTouched(true);
      setEmailError("Please enter a valid email address (e.g. name@gmail.com or name@outlook.com).");
      return;
    }
    if (!formData.message.trim()) return;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", category: "ai_feedback", otherCategory: "", message: "" });
      setEmailError("");
      setEmailTouched(false);
      setUploadedImages([]);
      setUploadError("");
    }, 5000);
  };

  const selectedCategoryLabel =
    CATEGORIES.find((c) => c.id === formData.category)?.label || "Select Category";

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB] transition-colors duration-300 flex flex-col font-sans selection:bg-[#C25E38]/20">
      <ScrollProgress />
      <Navbar activePage="contact" />

      {/* Main Container with generous pt-32 sm:pt-36 to ensure the top orange badge is fully visible */}
      <main className="flex-1 max-w-4xl mx-auto px-6 pt-32 sm:pt-36 pb-16 w-full">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] text-xs font-bold uppercase tracking-wider font-sans mb-4">
            <MessageSquare className="w-3.5 h-3.5" /> Sacred Feedback & Collaboration
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-normal text-[#2D2622] dark:text-[#F5F2EB] tracking-tight">
            Contact Us & <span className="text-[#C25E38] dark:text-[#E06D43]">Submit Feedback</span>
          </h1>
          <p className="mt-3.5 text-[#6B5E55] dark:text-[#D4C7B8] text-sm sm:text-base leading-relaxed">
            NityaGeeta is built with reverence for canonical Sanskrit traditions and algorithmic transparency. Whether you noticed a nuance in commentary, discovered a glitch, or want to contribute bhashyas, your input directly shapes this project.
          </p>
        </div>

        {/* 1. Contact Form Card (Primary Action - Form First) */}
        <div className="bg-[#FAF7F2] dark:bg-[#201D1A] p-6 sm:p-10 rounded-3xl border border-[#DFD5C6] dark:border-[#38332E] shadow-lg mb-10">
          <div className="w-full">
            <h2 className="text-2xl font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB] mb-2 flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-[#C25E38] dark:text-[#E06D43]" />
              Submit Your Message or Bug Report
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5E55] dark:text-[#A89F91] mb-8">
              Fill out the details below and attach screenshots of the program or text to help us improve.
            </p>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/50 text-center font-sans">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                <h4 className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mb-1">Feedback Received!</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Thank you for contributing to the accuracy and integrity of NityaGeeta. Our team will review your report and apply updates accordingly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6 font-sans text-sm">
                {/* Name & Email Straight Aligned Side-by-Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                  <div>
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8]">
                        Your Name
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-12 px-4 rounded-2xl bg-[#EFE9DF] dark:bg-[#1A1816] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] dark:placeholder-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#C25E38] dark:focus:ring-[#E06D43] transition"
                    />
                  </div>

                  <div>
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8]">
                        Email Address
                      </label>
                      <span className="text-[11px] text-[#8C7B70] dark:text-[#A89F91]">
                        (e.g. @gmail, @outlook, @hotmail)
                      </span>
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="name@gmail.com"
                      value={formData.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={handleEmailBlur}
                      className={`w-full h-12 px-4 rounded-2xl bg-[#EFE9DF] dark:bg-[#1A1816] border text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] dark:placeholder-[#A89F91] focus:outline-none focus:ring-2 transition ${
                        emailError
                          ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                          : suggestedDomain
                          ? "border-amber-500 dark:border-amber-500 focus:ring-amber-500"
                          : "border-[#DFD5C6] dark:border-[#38332E] focus:ring-[#C25E38] dark:focus:ring-[#E06D43]"
                      }`}
                    />

                    {/* Smart Typo Suggestion Banner */}
                    {suggestedDomain && (
                      <div className="flex items-center justify-between p-2 mt-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 text-xs text-amber-900 dark:text-amber-200">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          Did you mean <strong className="underline font-mono">{suggestedDomain}</strong>?
                        </span>
                        <button
                          type="button"
                          onClick={() => applySuggestedEmail(suggestedDomain)}
                          className="px-2.5 py-1 rounded-lg bg-[#C25E38] text-white text-[11px] font-bold hover:brightness-110 active:scale-95 transition cursor-pointer border-0"
                        >
                          Apply Fix
                        </button>
                      </div>
                    )}

                    {/* Email Format Error */}
                    {emailError && !suggestedDomain && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{emailError}</span>
                      </div>
                    )}

                    {/* Quick Domain Completion Chips (Appears when text is typed without @, disappears once selected/has @) */}
                    <AnimatePresence>
                      {formData.email.trim().length > 0 && !formData.email.includes("@") && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -4, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex flex-wrap items-center gap-1.5 mt-2.5 overflow-hidden"
                        >
                          <span className="text-[10px] font-medium text-[#8C7B70] dark:text-[#A89F91]">
                            Quick fill:
                          </span>
                          {POPULAR_PROVIDERS.map((provider) => (
                            <button
                              key={provider}
                              type="button"
                              onClick={() => applyProviderChip(provider)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-[#EFE9DF] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-[#5C4F45] dark:text-[#D4C7B8] hover:border-[#C25E38] hover:text-[#C25E38] dark:hover:text-[#E06D43] hover:bg-[#FAF7F2] transition active:scale-95 cursor-pointer shadow-xs"
                            >
                              {provider}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Custom Smooth Rounded Topic / Category Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                    Topic / Category
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      className="w-full h-12 px-4 rounded-2xl bg-[#EFE9DF] dark:bg-[#1A1816] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] text-left text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#C25E38] dark:focus:ring-[#E06D43] transition cursor-pointer hover:border-[#C25E38]/50"
                    >
                      <span className="truncate">{selectedCategoryLabel}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#C25E38] dark:text-[#E06D43] transition-transform duration-200 shrink-0 ${
                          isCategoryOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Smooth Rounded Animated Dropdown Menu */}
                    <AnimatePresence>
                      {isCategoryOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 4, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute z-50 left-0 right-0 p-2 rounded-2xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DFD5C6] dark:border-[#38332E] shadow-2xl space-y-1"
                        >
                          {CATEGORIES.map((cat) => {
                            const isSelected = formData.category === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, category: cat.id });
                                  setIsCategoryOpen(false);
                                }}
                                className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-medium transition flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? "bg-[#C25E38] text-white font-semibold shadow-xs"
                                    : "text-[#5C4F45] dark:text-[#D4C7B8] hover:bg-[#EFE9DF] dark:hover:bg-[#2A2622] hover:text-[#C25E38] dark:hover:text-[#E06D43]"
                                }`}
                              >
                                <span>{cat.label}</span>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence mode="wait">
                    {formData.category === "other" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="pt-3 pb-0.5"
                      >
                        <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                          Please describe other category
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Please describe other category..."
                          value={formData.otherCategory}
                          onChange={(e) => setFormData({ ...formData, otherCategory: e.target.value })}
                          className="w-full h-12 px-4 rounded-2xl bg-[#EFE9DF] dark:bg-[#1A1816] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] dark:placeholder-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#C25E38] dark:focus:ring-[#E06D43] transition"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8] mb-1.5">
                    Message / Feedback Details
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe your issue, suggested verse clarification, or commentary recommendation in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-[#EFE9DF] dark:bg-[#1A1816] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] placeholder-[#8C7B70] dark:placeholder-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#C25E38] dark:focus:ring-[#E06D43] transition resize-none text-sm"
                  />
                </div>

                {/* Screenshot Upload Dropzone (Strictly Images Only) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#5C4F45] dark:text-[#D4C7B8]">
                      Attach Screenshots (Images Only)
                    </label>
                    <span className="text-[11px] font-mono text-[#8C7B70] dark:text-[#A89F91]">
                      {uploadedImages.length}/5 images
                    </span>
                  </div>

                  {uploadedImages.length < 5 && (
                    <label
                      htmlFor="contact-page-images"
                      className="flex flex-col items-center justify-center p-5 sm:p-6 border-2 border-dashed border-[#DFD5C6] dark:border-[#38332E] hover:border-[#C25E38] dark:hover:border-[#E06D43] bg-[#EFE9DF]/40 dark:bg-[#1A1816] rounded-2xl cursor-pointer transition text-center group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#C25E38]/10 dark:bg-[#E06D43]/20 text-[#C25E38] dark:text-[#E06D43] flex items-center justify-center mb-2 group-hover:scale-110 transition">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-[#2D2622] dark:text-[#F5F2EB]">
                        Click to upload screenshots or drag & drop images
                      </p>
                      <p className="text-[11px] text-[#8C7B70] dark:text-[#A89F91] mt-1">
                        Only image files allowed (PNG, JPG, WEBP, GIF • Max 10MB each • PDFs not supported)
                      </p>
                      <input
                        id="contact-page-images"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}

                  {uploadError && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Clean Visual Image Thumbnails (Images Only, Click to Pop-Up Lightbox) */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[11px] text-[#8C7B70] dark:text-[#A89F91] mb-2">
                        Click any image to view full size in viewer:
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {uploadedImages.map((img) => (
                          <div
                            key={img.id}
                            onClick={() => setActiveLightboxImage(img.preview)}
                            className="aspect-square relative group rounded-2xl overflow-hidden border-2 border-[#DFD5C6] dark:border-[#38332E] hover:border-[#C25E38] dark:hover:border-[#E06D43] bg-[#EFE9DF] dark:bg-[#1A1816] cursor-pointer shadow-sm transition hover:shadow-md"
                          >
                            <img
                              src={img.preview}
                              alt="Screenshot preview"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            {/* Hover overlay with zoom icon */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-5 h-5 text-white" />
                            </div>

                            {/* Delete cross button */}
                            <button
                              type="button"
                              onClick={(e) => handleRemoveImage(img.id, e)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-md transition flex items-center justify-center cursor-pointer border-0 p-0 z-10 active:scale-90"
                              title="Remove image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <InteractiveHoverButton
                  type="submit"
                  text="Submit Feedback"
                  icon={<Send className="w-4 h-4" />}
                  className="w-full py-4 text-sm font-sans font-bold shadow-lg mt-6"
                />
              </form>
            )}
          </div>
        </div>

        {/* 2. Why this page is here Note Box (Supporting Context Underneath) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#201D1A] border border-[#DFD5C6] dark:border-[#38332E] shadow-sm">
          <h3 className="text-lg font-serif font-bold text-[#2D2622] dark:text-[#F5F2EB] mb-2.5 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43]" />
            Why This Feedback & Verification Portal Exists
          </h3>
          <p className="text-xs sm:text-sm text-[#5C4F45] dark:text-[#A89F91] leading-relaxed mb-6">
            Unlike generic AI wrappers that operate as closed commercial black boxes, NityaGeeta maintains open scholarly peer-review. The platform relies on readers, scholars, and daily practitioners to help audit OCR transcripts, verify multi-agent debate synthesis, and report interface anomalies.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
            <div className="p-4 rounded-2xl bg-[#EFE9DF]/60 dark:bg-[#262320] border border-[#DFD5C6]/80 dark:border-[#38332E]">
              <div className="font-bold text-[#2D2622] dark:text-[#F5F2EB] text-sm mb-1 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                Verse & OCR Accuracy
              </div>
              <p className="text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                Found a typo in a Sanskrit shloka, transliteration, or translation? Submissions are cross-checked with physical Gita Press editions and patched in the corpus database within 24 hours.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#EFE9DF]/60 dark:bg-[#262320] border border-[#DFD5C6]/80 dark:border-[#38332E]">
              <div className="font-bold text-[#2D2622] dark:text-[#F5F2EB] text-sm mb-1 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43]" />
                Attach Screenshots
              </div>
              <p className="text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                Attach up to 5 screenshots directly in the form above. Visual captures of glitches, formatting, or citations enable immediate reproduction and resolution.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#EFE9DF]/60 dark:bg-[#262320] border border-[#DFD5C6]/80 dark:border-[#38332E]">
              <div className="font-bold text-[#2D2622] dark:text-[#F5F2EB] text-sm mb-1">
                Commentary Contributions
              </div>
              <p className="text-[#6B5E55] dark:text-[#A89F91] leading-relaxed">
                Have insights from traditional sampradayas (Advaita, Vishishtadvaita, Dvaita, Shuddhadvaita) or wish to share authentic reference texts? Archival scholarly contributions are warmly welcomed.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Embedded In-App Image Viewer Modal (Matches PDF Opener Layout & Behavior) */}
      {mounted && createPortal(
        <AnimatePresence>
          {activeLightboxImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6"
              onClick={() => setActiveLightboxImage(null)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#FAF7F2] dark:bg-[#1A1816] rounded-2xl sm:rounded-3xl border border-[#DFD5C6] dark:border-white/20 shadow-2xl w-[96vw] max-w-[1200px] h-[90vh] sm:h-[92vh] flex flex-col overflow-hidden"
              >
                {/* Theme-Adaptive Top Header */}
                <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 bg-[#FAF7F2] dark:bg-[#201C19] border-b border-[#E8E1D7] dark:border-white/10 text-[#2D2622] dark:text-[#F5F2EB] font-sans shrink-0">
                  <div className="flex items-center gap-2.5 truncate max-w-md sm:max-w-xl">
                    <ImageIcon className="w-5 h-5 text-[#C25E38] dark:text-[#E06D43] shrink-0" />
                    <div>
                      <h3 className="text-sm sm:text-base font-bold font-serif truncate text-[#2D2622] dark:text-[#F5F2EB]">
                        Screenshot Attachment Viewer
                      </h3>
                      <div className="text-[10px] text-[#8C7B70] dark:text-[#A89F91] font-mono">
                        High-Resolution Preview • Scroll or Zoom to inspect details
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Zoom In */}
                    <button
                      type="button"
                      onClick={() => setZoomScale((prev) => Math.min(prev + 0.25, 3))}
                      className="p-1.5 sm:p-2 rounded-xl bg-[#EFE9DF] dark:bg-white/10 hover:bg-[#C25E38] dark:hover:bg-[#E06D43] text-[#2D2622] dark:text-white hover:text-white transition cursor-pointer flex items-center justify-center"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>
                    {/* Zoom Out */}
                    <button
                      type="button"
                      onClick={() => setZoomScale((prev) => Math.max(prev - 0.25, 0.5))}
                      className="p-1.5 sm:p-2 rounded-xl bg-[#EFE9DF] dark:bg-white/10 hover:bg-[#C25E38] dark:hover:bg-[#E06D43] text-[#2D2622] dark:text-white hover:text-white transition cursor-pointer flex items-center justify-center"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>
                    {/* Reset Zoom */}
                    <button
                      type="button"
                      onClick={() => setZoomScale(1)}
                      className="p-1.5 sm:p-2 rounded-xl bg-[#EFE9DF] dark:bg-white/10 hover:bg-[#C25E38] dark:hover:bg-[#E06D43] text-[#2D2622] dark:text-white hover:text-white transition cursor-pointer flex items-center justify-center text-xs font-mono"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>

                    <div className="h-5 w-px bg-[#DFD5C6] dark:bg-white/10 mx-1" />

                    {/* Theme-Adaptive Icon-Only Close Button */}
                    <button
                      type="button"
                      onClick={() => setActiveLightboxImage(null)}
                      className="p-1.5 sm:p-2 rounded-xl bg-[#EFE9DF] dark:bg-white/10 hover:bg-[#C25E38] dark:hover:bg-[#E06D43] text-[#2D2622] dark:text-white hover:text-white transition cursor-pointer flex items-center justify-center"
                      aria-label="Close Viewer"
                      title="Close Viewer (Esc)"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* Centered Scrollable Image Canvas Body */}
                <div className="flex-1 w-full h-full overflow-auto bg-[#FAF7F2] dark:bg-[#121110] flex items-center justify-center p-4 sm:p-8">
                  <div
                    style={{ transform: `scale(${zoomScale})`, transformOrigin: "center center" }}
                    className="transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
                  >
                    <img
                      src={activeLightboxImage}
                      alt="Screenshot detail view"
                      className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl border border-[#DFD5C6] dark:border-white/10 select-none"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <Footer />
    </div>
  );
}
