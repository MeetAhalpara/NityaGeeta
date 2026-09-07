"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Lock,
  Loader2,
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PdfManuscriptReaderProps {
  url: string;
  title: string;
  className?: string;
}

function loadPdfJsScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return;
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const existingScript = document.querySelector('script[src*="pdf.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        resolve((window as any).pdfjsLib);
      });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(lib);
      } else {
        reject(new Error("pdfjsLib failed to initialize"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load PDF engine script"));
    document.head.appendChild(script);
  });
}

export function PdfManuscriptReader({ url, title, className = "" }: PdfManuscriptReaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>("1");
  const [scale, setScale] = useState<number>(1.2);
  const [fitWidth, setFitWidth] = useState<boolean>(true);
  const [rotation, setRotation] = useState<number>(0);
  const [loadingDoc, setLoadingDoc] = useState<boolean>(true);
  const [renderingPage, setRenderingPage] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const renderTaskRef = useRef<any>(null);

  // Load PDF Document via Browser PDF.js
  useEffect(() => {
    let isCancelled = false;
    setLoadingDoc(true);
    setErrorMessage(null);
    setCurrentPage(1);
    setPageInput("1");

    async function loadPdf() {
      try {
        const pdfjsLib = await loadPdfJsScript();
        const proxyUrl = url.startsWith("http")
          ? `/api/pdf-proxy?url=${encodeURIComponent(url)}`
          : url;

        let doc;
        try {
          const loadingTask = pdfjsLib.getDocument({
            url: proxyUrl,
            cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
            cMapPacked: true,
            rangeChunkSize: 1048576, // 1MB chunks for 4x fewer network roundtrips
            disableAutoFetch: true, // Only fetch pages currently viewed, preventing 112MB background network congestion
            disableStream: true, // Use strict HTTP 206 range requests
          });
          doc = await loadingTask.promise;
        } catch (proxyErr) {
          console.warn("Proxy chunked streaming attempt 1 failed, retrying with conservative parameters:", proxyErr);
          const fallbackTask = pdfjsLib.getDocument({
            url: proxyUrl,
            cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
            cMapPacked: true,
            disableAutoFetch: true,
          });
          doc = await fallbackTask.promise;
        }

        if (!isCancelled && doc) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setLoadingDoc(false);
        }
      } catch (err: any) {
        console.error("Error loading PDF:", err);
        if (!isCancelled) {
          setErrorMessage("Failed to load manuscript. Please check your internet connection.");
          setLoadingDoc(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [url]);

  // Render Current Page on Canvas
  const renderCurrentPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      setRenderingPage(true);

      // Cancel any ongoing render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      // Calculate viewport and scale
      let calculatedScale = scale;
      if (fitWidth && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 48; // padding
        const unscaledViewport = page.getViewport({ scale: 1, rotation });
        if (containerWidth > 200) {
          calculatedScale = containerWidth / unscaledViewport.width;
        }
      }

      const viewport = page.getViewport({ scale: calculatedScale, rotation });
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = viewport.width * pixelRatio;
      canvas.height = viewport.height * pixelRatio;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      setRenderingPage(false);
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.error("Error rendering PDF page:", err);
      }
      setRenderingPage(false);
    }
  }, [pdfDoc, currentPage, scale, fitWidth, rotation]);

  useEffect(() => {
    renderCurrentPage();
  }, [renderCurrentPage]);

  // Handle Page Changes
  const goToPage = (pageNum: number) => {
    if (pageNum < 1 || (numPages > 0 && pageNum > numPages)) return;
    setCurrentPage(pageNum);
    setPageInput(pageNum.toString());
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(pageInput, 10);
    if (!isNaN(val) && val >= 1 && val <= numPages) {
      goToPage(val);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  // Keyboard Shortcuts (Arrow keys for navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        goToPage(currentPage + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        goToPage(currentPage - 1);
      } else if (e.key === "+" || e.key === "=") {
        setFitWidth(false);
        setScale((s) => Math.min(3, s + 0.25));
      } else if (e.key === "-") {
        setFitWidth(false);
        setScale((s) => Math.max(0.5, s - 0.25));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, numPages]);

  return (
    <div className={`flex flex-col h-full bg-[#FAF7F2] dark:bg-[#1A1816] select-none ${className}`}>
      {/* ── MANUSCRIPT READER CONTROL BAR (ZERO DOWNLOAD) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5 bg-[#EFE9DF] dark:bg-[#201C19] border-b border-[#DFD5C6] dark:border-[#38332E] text-xs font-sans shrink-0 z-20">
        {/* Page Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage <= 1 || loadingDoc}
            className="p-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] disabled:opacity-30 hover:bg-[#C25E38]/10 dark:hover:bg-[#E06D43]/20 transition cursor-pointer disabled:cursor-not-allowed"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1 || loadingDoc}
            className="p-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] disabled:opacity-30 hover:bg-[#C25E38]/10 dark:hover:bg-[#E06D43]/20 transition cursor-pointer disabled:cursor-not-allowed"
            title="Previous Page (←)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Input Box */}
          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E]">
            <span className="text-[11px] text-[#8C7B70] dark:text-[#A89F91]">Page</span>
            <input
              type="text"
              inputMode="numeric"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => {
                const val = parseInt(pageInput, 10);
                if (!isNaN(val) && val >= 1 && val <= numPages) {
                  goToPage(val);
                } else {
                  setPageInput(currentPage.toString());
                }
              }}
              className="w-12 text-center text-xs font-bold font-mono bg-transparent border-0 outline-none text-[#C25E38] dark:text-[#E06D43]"
            />
            <span className="text-[11px] text-[#8C7B70] dark:text-[#A89F91] font-mono">
              / {numPages || "..."}
            </span>
          </form>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= numPages || loadingDoc}
            className="p-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] disabled:opacity-30 hover:bg-[#C25E38]/10 dark:hover:bg-[#E06D43]/20 transition cursor-pointer disabled:cursor-not-allowed"
            title="Next Page (→)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => goToPage(numPages)}
            disabled={currentPage >= numPages || loadingDoc}
            className="p-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] disabled:opacity-30 hover:bg-[#C25E38]/10 dark:hover:bg-[#E06D43]/20 transition cursor-pointer disabled:cursor-not-allowed"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>

          {/* Quick Skip Buttons */}
          <div className="hidden md:flex items-center gap-1 ml-1">
            <button
              onClick={() => goToPage(currentPage - 10)}
              disabled={currentPage <= 10 || loadingDoc}
              className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-[#FAF7F2] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-[#5C4F45] dark:text-[#D4C7B8] disabled:opacity-30 hover:text-[#C25E38] transition cursor-pointer"
            >
              -10
            </button>
            <button
              onClick={() => goToPage(currentPage + 10)}
              disabled={currentPage + 10 > numPages || loadingDoc}
              className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-[#FAF7F2] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-[#5C4F45] dark:text-[#D4C7B8] disabled:opacity-30 hover:text-[#C25E38] transition cursor-pointer"
            >
              +10
            </button>
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setFitWidth(false);
              setScale((s) => Math.max(0.5, s - 0.2));
            }}
            disabled={loadingDoc}
            className="p-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] hover:bg-[#C25E38]/10 dark:hover:bg-[#E06D43]/20 transition cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold px-2.5 py-1 min-w-[54px] text-center rounded-lg bg-[#FAF7F2] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB]">
            {fitWidth ? "Fit" : `${Math.round(scale * 100)}%`}
          </span>

          <button
            onClick={() => {
              setFitWidth(false);
              setScale((s) => Math.min(3, s + 0.2));
            }}
            disabled={loadingDoc}
            className="p-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] hover:bg-[#C25E38]/10 dark:hover:bg-[#E06D43]/20 transition cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setFitWidth(!fitWidth);
              if (!fitWidth) setScale(1.2);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              fitWidth
                ? "bg-[#C25E38] dark:bg-[#E06D43] text-white border-transparent shadow-sm"
                : "bg-[#FAF7F2] dark:bg-[#262320] border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] hover:border-[#C25E38]"
            }`}
            title="Toggle Fit to Screen Width"
          >
            Fit Width
          </button>

          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262320] border border-[#DFD5C6] dark:border-[#38332E] text-[#2D2622] dark:text-[#F5F2EB] hover:bg-[#C25E38]/10 dark:hover:bg-[#E06D43]/20 transition cursor-pointer"
            title="Rotate Page 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Security & Read-Only Protected Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C25E38]/10 dark:bg-[#E06D43]/20 border border-[#C25E38]/20 dark:border-[#E06D43]/30 text-[10px] font-mono font-bold text-[#C25E38] dark:text-[#E06D43]">
          <Lock className="w-3 h-3" />
          <span>Protected Read-Only Archive</span>
        </div>
      </div>

      {/* ── CANVAS VIEWPORT AREA ── */}
      <div
        ref={containerRef}
        onContextMenu={(e) => e.preventDefault()}
        className="relative flex-1 w-full h-full overflow-auto bg-[#33302C] dark:bg-[#12100E] flex items-start justify-center p-4 sm:p-6"
      >
        {/* ── CLEAN MINIMALIST APPLE/LINEAR GRADE LOADER ── */}
        <AnimatePresence>
          {loadingDoc && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB] p-6 gap-3.5 select-none"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-[#DFD5C6] dark:border-white/15 border-t-[#C25E38] dark:border-t-[#E06D43] animate-spin" />
                <BookOpen className="w-4 h-4 text-[#C25E38] dark:text-[#E06D43] absolute" />
              </div>
              <div className="text-center space-y-0.5">
                <div className="font-serif text-base font-semibold text-[#2D2622] dark:text-[#FAF7F2]">
                  Opening Sacred Archive
                </div>
                <p className="text-xs text-[#8C7B70] dark:text-[#A89F91] font-sans">
                  Parsing high-resolution pages for <span className="text-[#C25E38] dark:text-[#E06D43] font-medium">{title}</span>...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Rendering Spinner (Subtle Floating Pill) */}
        {renderingPage && !loadingDoc && (
          <div className="absolute top-8 right-8 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-sans backdrop-blur-md shadow-lg pointer-events-none animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E06D43]" />
            <span>Rendering Page {currentPage}...</span>
          </div>
        )}

        {/* Error Fallback */}
        {errorMessage && (
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-md my-auto">
            <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
            <p className="text-sm font-semibold text-white mb-2">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-[#C25E38] text-white text-xs font-bold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* The Real Canvas Render Element */}
        <canvas
          ref={canvasRef}
          className="shadow-2xl rounded-md bg-white transition-opacity duration-150"
          style={{ opacity: renderingPage ? 0.7 : 1 }}
        />
      </div>
    </div>
  );
}
