/**
 * Reference Implementation: Next.js In-Memory Sliding-Window Rate Limiter & 1MB Body Guard
 * Source: frontend/src/middleware.ts
 */

import { NextRequest, NextResponse } from "next/server";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const ipLimiters = new Map<string, RateLimitBucket>();
const MAX_CONTENT_LENGTH_BYTES = 1024 * 1024; // 1 MB limit

// Automated 5-minute cleanup of expired IP buckets
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of ipLimiters.entries()) {
    if (now > bucket.resetAt) {
      ipLimiters.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Memory Exhaustion / Payload Size Guard
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_CONTENT_LENGTH_BYTES) {
    return new NextResponse(
      JSON.stringify({
        error: "Payload Too Large",
        message: "Request body exceeds maximum permitted limit of 1 MB.",
      }),
      { status: 413, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Route-Tiered Rate Limiting
  if (pathname.startsWith("/api/")) {
    const clientIp = getClientIp(request);
    const now = Date.now();
    const windowMs = 60 * 1000;

    let maxRequests = 60;
    if (pathname.startsWith("/api/auth/")) {
      maxRequests = 20; // Stricter for auth/login to prevent brute force
    } else if (pathname.startsWith("/api/pdf-proxy")) {
      maxRequests = 180; // Accommodates rapid chunk range requests
    }

    const key = `${clientIp}:${pathname.startsWith("/api/auth/") ? "auth" : pathname.startsWith("/api/pdf-proxy") ? "pdf" : "api"}`;
    let bucket = ipLimiters.get(key);

    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 1, resetAt: now + windowMs };
      ipLimiters.set(key, bucket);
    } else {
      bucket.count += 1;
    }

    const remaining = Math.max(0, maxRequests - bucket.count);
    const resetSeconds = Math.ceil((bucket.resetAt - now) / 1000);

    if (bucket.count > maxRequests) {
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please wait before retrying.",
          retryAfter: resetSeconds,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": resetSeconds.toString(),
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetSeconds.toString(),
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", resetSeconds.toString());
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
