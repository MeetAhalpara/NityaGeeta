/**
 * Reference Implementation: Strict SSRF Protection & Host Whitelist Validator
 * Source: frontend/src/app/api/pdf-proxy/route.ts
 */

export function validateSafePdfUrl(urlStr: string): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(urlStr);

    // 1. Only HTTPS allowed
    if (parsed.protocol !== "https:") {
      return { valid: false, reason: "Insecure or invalid protocol. Only HTTPS is allowed." };
    }

    const hostname = parsed.hostname.toLowerCase();

    // 2. Reject localhost, loopback, and metadata IP references
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

    // Check for private IPv4 patterns (10.x, 172.16-31.x, 192.168.x, 169.254.x)
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

    // 3. Strict hostname whitelist: storage.googleapis.com or nityageeta.com
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
