import { NextRequest, NextResponse } from "next/server";

// In-memory chunk cache for fast range request reuse and zero socket congestion
interface CacheEntry {
  buffer: ArrayBuffer;
  headers: Record<string, string>;
  status: number;
  timestamp: number;
}

const CHUNK_CACHE = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE_BYTES = 64 * 1024 * 1024; // 64 MB max in-memory cache
let currentCacheSizeBytes = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

const TRUSTED_STORAGE_ORIGIN = "https://storage.googleapis.com";
const TRUSTED_NITYA_ORIGIN = "https://nityageeta.com";
const TRUSTED_HOSTS = new Set(["storage.googleapis.com", "nityageeta.com"]);

async function fetchWithTimeout(
  url: string,
  headers: Record<string, string>,
  clientSignal?: AbortSignal | null,
  timeoutMs = 18000,
  method = "GET"
): Promise<Response> {
  if (clientSignal?.aborted) {
    throw new Error("Client aborted");
  }

  // Enforce outbound destination boundary via parsed hostname (prevents SSRF & substring bypass)
  try {
    const targetParsed = new URL(url);
    const isTrustedProtocol = targetParsed.protocol === "https:";
    const isTrustedHost = TRUSTED_HOSTS.has(targetParsed.hostname.toLowerCase());
    const isTrustedPort = targetParsed.port === "" || targetParsed.port === "443";
    if (!isTrustedProtocol || !isTrustedHost || !isTrustedPort) {
      throw new Error("Unauthorized outbound destination");
    }
  } catch {
    throw new Error("Unauthorized outbound destination");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const onAbort = () => controller.abort();
  if (clientSignal) {
    clientSignal.addEventListener("abort", onAbort, { once: true });
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
    if (clientSignal) {
      clientSignal.removeEventListener("abort", onAbort);
    }
  }
}

/**
 * Resolves and reconstructs a safe upstream URL.
 * Strictly binds the outbound target to trusted, server-controlled origins
 * and sanitizes the pathname to prevent path traversal, ensuring no user-controlled
 * host is ever passed to outbound fetch (eliminates SSRF CWE-918).
 */
function getSafeUpstreamUrl(urlStr: string): string | null {
  const validation = validateSafePdfUrl(urlStr);
  if (!validation.valid) {
    return null;
  }

  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();

    let safeOrigin = "";
    let safePath = parsed.pathname;

    if (hostname === "storage.googleapis.com") {
      safeOrigin = TRUSTED_STORAGE_ORIGIN;
    } else if (hostname.endsWith(".storage.googleapis.com")) {
      const bucket = hostname.slice(0, -".storage.googleapis.com".length);
      if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket)) {
        return null;
      }
      safeOrigin = TRUSTED_STORAGE_ORIGIN;
      safePath = `/${bucket}${parsed.pathname}`;
    } else if (hostname === "nityageeta.com" || hostname.endsWith(".nityageeta.com")) {
      safeOrigin = TRUSTED_NITYA_ORIGIN;
    } else {
      return null;
    }

    // Path traversal mitigation: strictly reject any traversal attempts
    if (safePath.includes("..") || safePath.includes("%2e") || safePath.includes("%2E")) {
      return null;
    }
    const cleanPath = safePath.replace(/\/+/g, "/");
    const targetUrl = new URL(cleanPath, safeOrigin);
    if (parsed.search) {
      targetUrl.search = parsed.search;
    }

    return targetUrl.toString();
  } catch {
    return null;
  }
}

/**
 * Strict SSRF protection and URL validation.
 * Ensures the target URL:
 * 1. Uses strictly https: protocol.
 * 2. Matches trusted domains (storage.googleapis.com or nityageeta.com).
 * 3. Does not resolve to private/local/metadata IP addresses.
 */
function validateSafePdfUrl(urlStr: string): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(urlStr);

    // 1. Only HTTPS allowed
    if (parsed.protocol !== "https:") {
      return { valid: false, reason: "Insecure or invalid protocol. Only HTTPS is allowed." };
    }

    const hostname = parsed.hostname.toLowerCase();

    // 2. Reject localhost and loopback/private IP references
    const blockedHosts = [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "169.254.169.254",
      "metadata.google.internal",
      "::1",
    ];
    if (blockedHosts.includes(hostname)) {
      return { valid: false, reason: "Target host is not permitted." };
    }

    // Check for private IPv4 patterns (10.x.x.x, 172.16-31.x.x, 192.168.x.x, 169.254.x.x)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Regex);
    if (ipMatch) {
      const first = parseInt(ipMatch[1], 10);
      const second = parseInt(ipMatch[2], 10);
      if (
        first === 10 ||
        (first === 172 && second >= 16 && second <= 31) ||
        (first === 192 && second === 168) ||
        first === 127 ||
        (first === 169 && second === 254) ||
        first === 0
      ) {
        return { valid: false, reason: "Private IP addresses are not permitted." };
      }
    }

    // 3. Strict hostname whitelist
    const isGcs = hostname === "storage.googleapis.com" || hostname.endsWith(".storage.googleapis.com");
    const isNitya = hostname === "nityageeta.com" || hostname.endsWith(".nityageeta.com");

    if (!isGcs && !isNitya) {
      return { valid: false, reason: "Host is not in the trusted scripture domain whitelist." };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Malformed URL format." };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get("url");

  if (!pdfUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  const urlValidation = validateSafePdfUrl(pdfUrl);
  if (!urlValidation.valid) {
    return new NextResponse(urlValidation.reason || "Forbidden target URL", { status: 403 });
  }

  const safeTargetUrl = getSafeUpstreamUrl(pdfUrl);
  if (!safeTargetUrl) {
    return new NextResponse("Forbidden target URL", { status: 403 });
  }

  try {
    const rangeHeader = request.headers.get("range");
    const cacheKey = `${safeTargetUrl}::${rangeHeader || "full"}`;

    // 1. Check in-memory chunk cache
    const cached = CHUNK_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      const responseHeaders = new Headers();
      Object.entries(cached.headers).forEach(([k, v]) => responseHeaders.set(k, v));
      responseHeaders.set("X-Cache", "HIT");
      return new NextResponse(cached.buffer.slice(0), {
        status: cached.status,
        headers: responseHeaders,
      });
    }

    // 2. Prepare headers for upstream GCS request
    const fetchHeaders: Record<string, string> = {
      "User-Agent": "NityaGeeta-Manuscript-Reader/1.0",
      Accept: "application/pdf, */*",
    };
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    // 3. Fetch from upstream with retry and timeout protection
    let upstreamResponse: Response | null = null;
    let lastError: any = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        upstreamResponse = await fetchWithTimeout(safeTargetUrl, fetchHeaders, request.signal, 18000);
        if (upstreamResponse.ok || upstreamResponse.status === 206) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        if (request.signal?.aborted) break;
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    if (!upstreamResponse || (!upstreamResponse.ok && upstreamResponse.status !== 206)) {
      if (request.signal?.aborted) {
        return new NextResponse(null, { status: 499 });
      }
      return new NextResponse(
        `Failed to fetch source PDF: ${upstreamResponse ? upstreamResponse.statusText : lastError?.message}`,
        { status: upstreamResponse ? upstreamResponse.status : 504 }
      );
    }

    // 4. Construct response headers
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", upstreamResponse.headers.get("content-type") || "application/pdf");
    responseHeaders.set("Content-Disposition", "inline");
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Range, Content-Type, Accept");
    responseHeaders.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
    responseHeaders.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");

    const contentLength = upstreamResponse.headers.get("content-length");
    if (contentLength) responseHeaders.set("Content-Length", contentLength);

    const contentRange = upstreamResponse.headers.get("content-range");
    if (contentRange) responseHeaders.set("Content-Range", contentRange);

    // 5. Read payload into an ArrayBuffer
    // Buffering eliminates "failed to pipe response" and "ECONNRESET" stream pipe breaks
    const arrayBuffer = await upstreamResponse.arrayBuffer();

    // 6. Cache small chunks (<= 4MB) in memory for instant reuse
    if (arrayBuffer.byteLength <= 4 * 1024 * 1024) {
      while (currentCacheSizeBytes + arrayBuffer.byteLength > MAX_CACHE_SIZE_BYTES && CHUNK_CACHE.size > 0) {
        const firstKey = CHUNK_CACHE.keys().next().value;
        if (!firstKey) break;
        const entry = CHUNK_CACHE.get(firstKey);
        if (entry) currentCacheSizeBytes -= entry.buffer.byteLength;
        CHUNK_CACHE.delete(firstKey);
      }

      CHUNK_CACHE.set(cacheKey, {
        buffer: arrayBuffer,
        headers: Object.fromEntries(responseHeaders.entries()),
        status: upstreamResponse.status,
        timestamp: Date.now(),
      });
      currentCacheSizeBytes += arrayBuffer.byteLength;
    }

    return new NextResponse(arrayBuffer, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    const isAborted =
      request.signal?.aborted ||
      error?.name === "AbortError" ||
      error?.message === "Client aborted" ||
      error?.code === "ECONNRESET" ||
      error?.cause?.code === "ECONNRESET";

    if (isAborted) {
      return new NextResponse(null, { status: 499 });
    }

    console.error("PDF Proxy Error:", error?.message || error);
    return new NextResponse(`Proxy error: ${error?.message || "Internal Error"}`, { status: 502 });
  }
}

export async function HEAD(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get("url");

  if (!pdfUrl) {
    return new NextResponse(null, { status: 400 });
  }

  const urlValidation = validateSafePdfUrl(pdfUrl);
  if (!urlValidation.valid) {
    return new NextResponse(null, { status: 403 });
  }

  const safeTargetUrl = getSafeUpstreamUrl(pdfUrl);
  if (!safeTargetUrl) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const upstreamResponse = await fetchWithTimeout(
      safeTargetUrl,
      { "User-Agent": "NityaGeeta-Manuscript-Reader/1.0" },
      request.signal,
      18000,
      "HEAD"
    );

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", upstreamResponse.headers.get("content-type") || "application/pdf");
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Range, Content-Type, Accept");
    responseHeaders.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");

    const contentLength = upstreamResponse.headers.get("content-length");
    if (contentLength) responseHeaders.set("Content-Length", contentLength);

    return new NextResponse(null, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
      "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
    },
  });
}
