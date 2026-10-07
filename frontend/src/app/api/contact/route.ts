import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const OFFICIAL_EMAIL = process.env.NITYAGEETA_CONTACT_EMAIL || "Morved.NityaGeeta@outlook.com";

// Email RFC validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/;

const VALID_CATEGORIES: Record<string, string> = {
  ai_feedback: "AI Dialogue Feedback & Prompt Grounding",
  verse_correction: "Sanskrit Verse / OCR Typo Correction",
  commentary_insight: "Share Commentary Insights / Traditional Bhashya",
  bug_report: "UI Glitch or Technical Bug Report",
  report_misuse: "Report Misuse / Misinterpretation",
  other: "Other Inquiry",
};

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per file
const MAX_TOTAL_FILES = 5;

// ==============================================================================
// RATE LIMITING & ABUSE GUARDS (In-Memory with IP & Email Buckets)
// ==============================================================================
interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const ipSubmissions = new Map<string, RateLimitBucket>();
const emailSubmissions = new Map<string, RateLimitBucket>();

// Periodic pruning of stale rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of ipSubmissions.entries()) {
    if (now > bucket.resetAt) ipSubmissions.delete(key);
  }
  for (const [key, bucket] of emailSubmissions.entries()) {
    if (now > bucket.resetAt) emailSubmissions.delete(key);
  }
}, 5 * 60 * 1000);

function getTrustedClientIp(request: Request): string {
  const headers = request.headers;
  // 1. Cloudflare connecting IP
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  // 2. Reverse proxy real IP
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // 3. Fallback to rightmost entry of x-forwarded-for (nearest trusted proxy)
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  return "127.0.0.1";
}

function checkRateLimit(key: string, limitMap: Map<string, RateLimitBucket>, maxAllowed: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = limitMap.get(key);

  if (!bucket || now > bucket.resetAt) {
    limitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= maxAllowed) {
    return false;
  }

  bucket.count += 1;
  return true;
}

interface ProcessedAttachment {
  filename: string;
  buffer: Buffer;
  contentType: string;
  size: number;
  contentId?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function POST(request: Request) {
  try {
    const clientIp = getTrustedClientIp(request);
    const contentTypeHeader = request.headers.get("content-type") || "";

    let name = "";
    let email = "";
    let category = "";
    let otherCategory: string | undefined = undefined;
    let message = "";
    let rawFiles: File[] = [];

    // Parse either multipart/form-data or application/json
    if (contentTypeHeader.includes("multipart/form-data")) {
      const formData = await request.formData();
      name = (formData.get("name") as string) || "";
      email = (formData.get("email") as string) || "";
      category = (formData.get("category") as string) || "";
      const otherCat = formData.get("otherCategory");
      if (typeof otherCat === "string") otherCategory = otherCat;
      message = (formData.get("message") as string) || "";
      const screenshots = formData.getAll("screenshots");
      for (const item of screenshots) {
        if (item && typeof item === "object" && "arrayBuffer" in item) {
          rawFiles.push(item as File);
        }
      }
    } else {
      const body = await request.json();
      name = body.name || "";
      email = body.email || "";
      category = body.category || "";
      otherCategory = body.otherCategory;
      message = body.message || "";
    }

    // 1. Defensive Input Validation
    if (!name || typeof name !== "string" || !name.trim() || name.length > 100) {
      return NextResponse.json(
        { success: false, error: "Name is required and must be 100 characters or fewer." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim()) || email.length > 150) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required (under 150 characters)." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim() || message.length > 3000) {
      return NextResponse.json(
        { success: false, error: "Message content is required and must be 3,000 characters or fewer." },
        { status: 400 }
      );
    }

    if (!category || typeof category !== "string" || category.length > 50) {
      return NextResponse.json(
        { success: false, error: "Valid category is required." },
        { status: 400 }
      );
    }

    if (otherCategory !== undefined && (typeof otherCategory !== "string" || otherCategory.length > 100)) {
      return NextResponse.json(
        { success: false, error: "Other category description must be 100 characters or fewer." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedMessage = message.trim();
    const rawCategory = category.trim();
    const baseCategoryLabel = VALID_CATEGORIES[rawCategory] || "General Inquiry";
    const topicLabel = rawCategory === "other" && otherCategory?.trim()
      ? `Other: ${otherCategory.trim().slice(0, 80)}`
      : baseCategoryLabel;

    // 2. Strict Rate Limiting (Per IP: 5 per 10min, Per Recipient Email: 3 per 10min)
    const isLocal = clientIp === "127.0.0.1" || clientIp === "::1" || clientIp === "localhost";
    const WINDOW_10_MIN = 10 * 60 * 1000;

    if (!isLocal) {
      if (!checkRateLimit(`ip:${clientIp}`, ipSubmissions, 5, WINDOW_10_MIN)) {
        return NextResponse.json(
          { success: false, error: "Too many contact submissions from your IP. Please wait 10 minutes before trying again." },
          { status: 429, headers: { "Retry-After": "600" } }
        );
      }

      if (!checkRateLimit(`email:${trimmedEmail}`, emailSubmissions, 3, WINDOW_10_MIN)) {
        return NextResponse.json(
          { success: false, error: "Too many messages sent to this email address recently. Please wait before submitting again." },
          { status: 429, headers: { "Retry-After": "600" } }
        );
      }
    }

    // 3. Process & Validate Screenshot Attachments
    if (rawFiles.length > MAX_TOTAL_FILES) {
      return NextResponse.json(
        { success: false, error: `Maximum of ${MAX_TOTAL_FILES} screenshots allowed per submission.` },
        { status: 400 }
      );
    }

    const attachments: ProcessedAttachment[] = [];
    for (const file of rawFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: `Attachment "${file.name}" exceeds the 5MB file size limit.` },
          { status: 400 }
        );
      }

      const mimeType = (file.type || "").toLowerCase();
      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return NextResponse.json(
          { success: false, error: `File type "${mimeType}" is not supported. Please upload PNG, JPG, WEBP, or GIF images.` },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      attachments.push({
        filename: file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "screenshot.png",
        buffer: Buffer.from(arrayBuffer),
        contentType: mimeType,
        size: file.size,
      });
    }

    const BRAND_LOGO_URL = "https://raw.githubusercontent.com/MeetAhalpara/NityaGeeta/feat/postman-collection-and-api-testing-suite/frontend/public/images/optimized-logo.png";

    // Ticket Reference ID & Timestamp
    const ticketId = `NG-MSG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const timestamp = new Date().toUTCString();

    // Sanitized values for HTML email templates
    const safeName = escapeHtml(trimmedName);
    const safeEmail = escapeHtml(trimmedEmail);
    const safeTopicLabel = escapeHtml(topicLabel);
    const safeMessage = escapeHtml(trimmedMessage);

    // 4. Generate Email Messages
    // A) Customer Confirmation Email (Apple-Inspired Steve Jobs Aesthetic)
    const userSubject = `NityaGeeta | Received: Inquiry regarding "${topicLabel}" [Ref: ${ticketId}]`;
    const userText = `Namaste ${trimmedName},

Thank you for reaching out to NityaGeeta. We confirm that your inquiry regarding "${topicLabel}" has been safely received and logged.

Submission Summary:
-------------------
Reference ID: ${ticketId}
Topic / Category: ${topicLabel}
Date Received: ${timestamp}
Screenshots Attached: ${attachments.length > 0 ? `${attachments.length} file(s)` : "None"}

The NityaGeeta editorial desk will review your submission and apply any verified commentary or manuscript corrections accordingly.

If you have additional details or screenshots to share, simply reply directly to this email.

With reverence,
NityaGeeta
NityaGeeta@outlook.com
`;

    const userHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NityaGeeta Inquiry Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1917; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F2; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Main Apple-Style Canvas Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #ECE6DB; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04); overflow: hidden;">
          
          <!-- Header with Seamless Floating Wordmark -->
          <tr>
            <td style="padding: 44px 44px 28px 44px; text-align: center; background-color: #FAF7F2; border-bottom: 1px solid #EFEAE1;">
              <img src="${BRAND_LOGO_URL}" alt="NityaGeeta" width="160" height="58" style="display: block; margin: 0 auto 14px auto; max-width: 170px; height: auto;" />
              <div style="font-size: 11px; color: #8C7E72; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600;">Timeless Wisdom &middot; Zero Hallucinations &middot; Pure Clarity</div>
            </td>
          </tr>

          <!-- Body Narrative -->
          <tr>
            <td style="padding: 38px 44px 28px 44px;">
              <div style="font-size: 19px; font-weight: 600; color: #1C1917; margin-bottom: 16px; letter-spacing: -0.01em;">
                Namaste ${safeName},
              </div>
              <div style="font-size: 15px; line-height: 1.68; color: #44403C; margin-bottom: 26px;">
                Thank you for reaching out. We confirm that NityaGeeta has received your inquiry regarding <strong style="color: #1C1917;">${safeTopicLabel}</strong>. Every insight, correction, and dialogue note helps ensure that the canonical scripture delivered on NityaGeeta remains uncompromised and authentic.
              </div>

              <!-- Spec Receipt Card (Apple Hardware / Order Style) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F2; border: 1px solid #EFEAE1; border-radius: 14px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 22px 26px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8C7E72;">Reference ID</td>
                        <td align="right" style="padding-bottom: 12px; font-size: 13px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 700; color: #C25E38;">${ticketId}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8C7E72;">Topic / Category</td>
                        <td align="right" style="padding-bottom: 12px; font-size: 14px; font-weight: 600; color: #1C1917;">${safeTopicLabel}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: ${attachments.length > 0 ? "12px" : "0"}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8C7E72;">Logged At</td>
                        <td align="right" style="padding-bottom: ${attachments.length > 0 ? "12px" : "0"}; font-size: 13px; color: #57534E;">${timestamp}</td>
                      </tr>
                      ${
                        attachments.length > 0
                          ? `<tr>
                        <td style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8C7E72;">Attached Evidence</td>
                        <td align="right" style="font-size: 13px; color: #1C1917; font-weight: 500;">${attachments.length} screenshot file${attachments.length > 1 ? "s" : ""}</td>
                      </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Quiet Editorial Notice (Apple Minimalist) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F2; border: 1px solid #EAE4D9; border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 16px 20px; font-size: 13px; line-height: 1.6; color: #6B5E55;">
                    The NityaGeeta editorial desk will review your submission and cross-verify with our canonical manuscript archives. If you have additional thoughts or context, simply reply directly to this email.
                  </td>
                </tr>
              </table>

              <!-- Sign-off Block -->
              <div style="border-top: 1px solid #EFEAE1; padding-top: 26px;">
                <div style="font-size: 13px; color: #8C7E72; margin-bottom: 6px;">With reverence,</div>
                <div style="font-size: 17px; font-weight: 700; color: #1C1917; margin-bottom: 4px;">NityaGeeta</div>
                <div>
                  <a href="mailto:Morved.NityaGeeta@outlook.com" style="font-size: 13px; color: #C25E38; text-decoration: none; font-weight: 500;">NityaGeeta@outlook.com</a>
                </div>
              </div>
            </td>
          </tr>

          <!-- Understated Minimal Footer -->
          <tr>
            <td style="padding: 24px 44px; background-color: #F8F5EE; border-top: 1px solid #ECE6DB; text-align: center;">
              <div style="font-size: 11px; color: #A89C90; letter-spacing: 0.04em; text-transform: uppercase;">
                &copy; 2026 NityaGeeta &middot; Sacred Scripture Grounding
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // B) NityaGeeta Internal Editorial Desk Alert (Apple Cupertino Draft Design with full User, Issue, Message, and Attached Files)
    const internalSubject = `[NityaGeeta Alert] New Inquiry: ${topicLabel} from ${trimmedName} [${ticketId}]`;
    const internalText = `[NITYAGEETA EDITORIAL DESK ALERT]
Reference Ticket: ${ticketId}
Timestamp: ${timestamp}
--------------------------------------------------
Submitter Name: ${trimmedName}
Submitter Email: ${trimmedEmail}
Topic / Category: ${topicLabel}
Client IP: ${clientIp}
Screenshots Attached: ${attachments.length} file(s)
${attachments.length > 0 ? `Attached Files: ${attachments.map((a) => `${a.filename} (${formatBytes(a.size)})`).join(", ")}\n` : ""}--------------------------------------------------
User Message:
${trimmedMessage}
--------------------------------------------------
Hit Reply in your email client to answer ${trimmedName} directly at: ${trimmedEmail}
`;

    const internalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NityaGeeta Editorial Desk Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1917; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F2; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Main Apple-Style Canvas Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #ECE6DB; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04); overflow: hidden;">
          
          <!-- Header with Seamless Floating Wordmark & Desk Badge -->
          <tr>
            <td style="padding: 40px 44px 26px 44px; text-align: center; background-color: #FAF7F2; border-bottom: 1px solid #EFEAE1;">
              <img src="${BRAND_LOGO_URL}" alt="NityaGeeta" width="160" height="58" style="display: block; margin: 0 auto 12px auto; max-width: 170px; height: auto;" />
              <div style="font-size: 11px; color: #C25E38; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700;">EDITORIAL DESK &middot; NEW INQUIRY DOSSIER</div>
            </td>
          </tr>

          <!-- Body Narrative -->
          <tr>
            <td style="padding: 36px 44px 28px 44px;">
              <div style="font-size: 20px; font-weight: 700; color: #1C1917; margin-bottom: 8px; letter-spacing: -0.01em;">
                New Inquiry: ${safeTopicLabel}
              </div>
              <div style="font-size: 14px; line-height: 1.6; color: #57534E; margin-bottom: 24px;">
                A reader has submitted an inquiry through the NityaGeeta contact and verification portal. Comprehensive submitter information, issue categorization, message content, and uploaded evidence files are compiled below.
              </div>

              <!-- Spec Receipt Card (Apple Hardware / Order Style) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F2; border: 1px solid #EFEAE1; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 22px 26px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8C7E72;">Reference ID</td>
                        <td align="right" style="padding-bottom: 12px; font-size: 13px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 700; color: #C25E38;">${ticketId}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8C7E72;">Submitter Name</td>
                        <td align="right" style="padding-bottom: 12px; font-size: 14px; font-weight: 600; color: #1C1917;">${safeName}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8C7E72;">Submitter Email</td>
                        <td align="right" style="padding-bottom: 12px; font-size: 13px; font-weight: 600;">
                          <a href="mailto:${safeEmail}" style="color: #C25E38; text-decoration: none;">${safeEmail}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8C7E72;">Issue Category</td>
                        <td align="right" style="padding-bottom: 12px; font-size: 13px; font-weight: 600; color: #1C1917;">${safeTopicLabel}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8C7E72;">Logged At</td>
                        <td align="right" style="padding-bottom: 12px; font-size: 13px; color: #57534E;">${timestamp}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8C7E72;">Client IP</td>
                        <td align="right" style="padding-bottom: 12px; font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #78716C;">${clientIp}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8C7E72;">Uploaded Files</td>
                        <td align="right" style="font-size: 13px; font-weight: 600; color: #1C1917;">${attachments.length} file${attachments.length === 1 ? "" : "s"}</td>
                      </tr>
                    </table>

                    ${
                      attachments.length > 0
                        ? `
                    <!-- Uploaded Files Breakdown -->
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #E0D7CB;">
                      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8C7E72; margin-bottom: 10px;">
                        Attached Files (${attachments.length}):
                      </div>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        ${attachments
                          .map(
                            (a, idx) => `
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #1C1917;">
                            <span style="display: inline-block; width: 22px; color: #C25E38; font-weight: 700;">#${idx + 1}</span>
                            <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 600;">${escapeHtml(a.filename)}</span>
                          </td>
                          <td align="right" style="padding: 6px 0; font-size: 12px; color: #78716C;">
                            ${formatBytes(a.size)}
                          </td>
                        </tr>`
                          )
                          .join("")}
                      </table>
                      <div style="font-size: 11px; color: #8C7E72; margin-top: 10px; font-style: italic;">
                        * All original uploaded file(s) are attached directly to this email for full inspection.
                      </div>
                    </div>`
                        : `
                    <div style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed #E0D7CB; font-size: 12px; color: #8C7E72;">
                      No screenshot files were attached with this submission.
                    </div>`
                    }
                  </td>
                </tr>
              </table>

              <!-- User Message Box -->
              <div style="margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8C7E72; margin-bottom: 8px;">
                  User Message & Feedback Details
                </div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F2; border: 1px solid #EAE4D9; border-radius: 12px;">
                  <tr>
                    <td style="padding: 20px; font-size: 15px; line-height: 1.68; color: #1C1917; white-space: pre-wrap; word-break: break-word;">
${safeMessage}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Quick Action / Reply Notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FFF9F5; border: 1px solid #F0D9CE; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 13px; font-weight: 700; color: #C25E38; margin-bottom: 4px;">Direct Response Action</div>
                    <div style="font-size: 13px; line-height: 1.5; color: #6B5E55;">
                      Hit <strong>Reply</strong> in Outlook to answer <strong>${safeName}</strong> directly at <a href="mailto:${safeEmail}" style="color: #C25E38; font-weight: 600; text-decoration: none;">${safeEmail}</a>.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Sign-off / Destination Block -->
              <div style="border-top: 1px solid #EFEAE1; padding-top: 24px;">
                <div style="font-size: 12px; color: #8C7E72; margin-bottom: 4px;">Automated Dossier Dispatched To:</div>
                <div style="font-size: 15px; font-weight: 700; color: #1C1917;">${OFFICIAL_EMAIL}</div>
                <div style="font-size: 12px; color: #A89C90; margin-top: 2px;">NityaGeeta Editorial Verification Pipeline</div>
              </div>
            </td>
          </tr>

          <!-- Understated Minimal Footer -->
          <tr>
            <td style="padding: 22px 44px; background-color: #F8F5EE; border-top: 1px solid #ECE6DB; text-align: center;">
              <div style="font-size: 11px; color: #A89C90; letter-spacing: 0.04em; text-transform: uppercase;">
                &copy; 2026 NityaGeeta &middot; Confidential Editorial Dispatch
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // 5. Dispatch Delivery
    const resendApiKey = process.env.RESEND_API_KEY;
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const noReplySender = process.env.NOREPLY_EMAIL || "NityaGeeta <onboarding@resend.dev>";

    let deliveryStatus = "simulated";

    // Helper for SMTP Delivery (Gmail / Outlook / Custom SMTP)
    const sendEmailViaSmtp = async (
      to: string,
      replyTo: string,
      subject: string,
      text: string,
      htmlContent: string,
      filesToSend: ProcessedAttachment[] = []
    ) => {
      if (!smtpHost || !smtpUser || !smtpPass) {
        return { ok: false, status: 500, error: "SMTP credentials not configured." };
      }
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"NityaGeeta" <${smtpUser}>`,
          to,
          replyTo,
          subject,
          text,
          html: htmlContent,
          attachments: filesToSend.map((a) => ({
            filename: a.filename,
            content: a.buffer,
            contentType: a.contentType,
          })),
        });

        return { ok: true, status: 200 };
      } catch (err: unknown) {
        console.error(`[SMTP Error] Delivery to ${to} failed:`, err);
        return { ok: false, status: 500, error: String(err) };
      }
    };

    let resUser: { ok: boolean; status?: number; error?: string } = { ok: false };
    let resInternal: { ok: boolean; status?: number; error?: string } = { ok: false };

    // Method A: Resend API
    if (resendApiKey) {
      const resendEndpoint = "https://api.resend.com/emails";
      const sendEmailViaResend = async (
        to: string,
        replyTo: string,
        subject: string,
        text: string,
        htmlContent: string,
        filesToSend: ProcessedAttachment[] = []
      ) => {
        try {
          const payload: Record<string, unknown> = {
            from: noReplySender,
            to: [to],
            reply_to: replyTo,
            subject,
            text,
            html: htmlContent,
          };

          if (filesToSend.length > 0) {
            payload.attachments = filesToSend.map((a) => {
              const item: Record<string, unknown> = {
                filename: a.filename,
                content: a.buffer.toString("base64"),
              };
              if (a.contentId) {
                item.contentId = a.contentId;
              }
              return item;
            });
          }

          const resp = await fetch(resendEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify(payload),
          });

          if (!resp.ok) {
            const errBody = await resp.text();
            console.error(`[Resend Error] Delivery to ${to} failed. Status:`, resp.status, errBody);
            return { ok: false, status: resp.status, error: errBody };
          }
          return { ok: true, status: resp.status };
        } catch (err) {
          console.error(`[Resend Network Error] Delivery to ${to} failed:`, err);
          return { ok: false, status: 500, error: String(err) };
        }
      };

      // 1. Send customer receipt strictly to trimmedEmail (0 attachments)
      resUser = await sendEmailViaResend(trimmedEmail, OFFICIAL_EMAIL, userSubject, userText, userHtml, []);

      // If Resend failed for user receipt, attempt SMTP fallback if configured
      if (!resUser.ok && smtpHost && smtpUser && smtpPass) {
        console.warn(`[Contact API] Resend failed for customer (${trimmedEmail}). Attempting SMTP fallback...`);
        const smtpAttempt = await sendEmailViaSmtp(trimmedEmail, OFFICIAL_EMAIL, userSubject, userText, userHtml, []);
        if (smtpAttempt.ok) {
          resUser = { ok: true, status: 200 };
        }
      }

      // 2. Send desk alert strictly to OFFICIAL_EMAIL (with ALL attachments)
      resInternal = await sendEmailViaResend(OFFICIAL_EMAIL, trimmedEmail, internalSubject, internalText, internalHtml, attachments);

      // If Resend failed for desk alert, attempt SMTP fallback if configured
      if (!resInternal.ok && smtpHost && smtpUser && smtpPass) {
        console.warn(`[Contact API] Resend failed for desk alert (${OFFICIAL_EMAIL}). Attempting SMTP fallback...`);
        const smtpAttempt = await sendEmailViaSmtp(OFFICIAL_EMAIL, trimmedEmail, internalSubject, internalText, internalHtml, attachments);
        if (smtpAttempt.ok) {
          resInternal = { ok: true, status: 200 };
        }
      }

      deliveryStatus = resUser.ok && resInternal.ok ? "resend_dispatched" : "attempted";
    }
    // Method B: SMTP Direct (when Resend is not configured)
    else if (smtpHost && smtpUser && smtpPass) {
      resUser = await sendEmailViaSmtp(trimmedEmail, OFFICIAL_EMAIL, userSubject, userText, userHtml, []);
      resInternal = await sendEmailViaSmtp(OFFICIAL_EMAIL, trimmedEmail, internalSubject, internalText, internalHtml, attachments);
      deliveryStatus = resUser.ok && resInternal.ok ? "smtp_dispatched" : "attempted";
    }
    // Method C: Twilio SendGrid
    else if (sendgridApiKey) {
      const sendgridEndpoint = "https://api.sendgrid.com/v3/mail/send";
      const sendEmailViaSendGrid = async (
        to: string,
        subject: string,
        text: string,
        htmlContent: string,
        filesToSend: ProcessedAttachment[] = []
      ) => {
        try {
          const payload: Record<string, unknown> = {
            personalizations: [{ to: [{ email: to }] }],
            from: { email: OFFICIAL_EMAIL, name: "NityaGeeta" },
            subject,
            content: [
              { type: "text/plain", value: text },
              { type: "text/html", value: htmlContent },
            ],
          };

          if (filesToSend.length > 0) {
            payload.attachments = filesToSend.map((a) => ({
              content: a.buffer.toString("base64"),
              type: a.contentType,
              filename: a.filename,
              disposition: "attachment",
            }));
          }

          const resp = await fetch(sendgridEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sendgridApiKey}`,
            },
            body: JSON.stringify(payload),
          });

          if (!resp.ok) {
            const errBody = await resp.text();
            console.error(`[SendGrid Error] Delivery to ${to} failed. Status:`, resp.status, errBody);
            return { ok: false, status: resp.status, error: errBody };
          }
          return { ok: true, status: resp.status };
        } catch (err) {
          console.error(`[SendGrid Network Error] Delivery to ${to} failed:`, err);
          return { ok: false, status: 500, error: String(err) };
        }
      };

      resUser = await sendEmailViaSendGrid(trimmedEmail, userSubject, userText, userHtml, []);
      resInternal = await sendEmailViaSendGrid(OFFICIAL_EMAIL, internalSubject, internalText, internalHtml, attachments);
      deliveryStatus = resUser.ok && resInternal.ok ? "sendgrid_dispatched" : "attempted";
    }

    // Evaluate Delivery Results
    if (resUser.ok && resInternal.ok) {
      return NextResponse.json({
        success: true,
        ticketId,
        deliveryStatus,
        message: "Inquiry successfully recorded and notifications sent to both parties.",
        timestamp,
      });
    }

    // If Desk Alert succeeded but User receipt failed
    if (resInternal.ok && !resUser.ok) {
      return NextResponse.json({
        success: true,
        ticketId,
        deliveryStatus: "partial",
        warning: `Your inquiry was delivered to our editorial desk (${OFFICIAL_EMAIL}), but confirmation to ${trimmedEmail} could not be sent.`,
        timestamp,
      });
    }

    // If User receipt succeeded but Desk alert failed
    if (resUser.ok && !resInternal.ok) {
      return NextResponse.json({
        success: true,
        ticketId,
        deliveryStatus: "user_receipt_dispatched",
        warning: `Customer receipt delivered to ${trimmedEmail}. Desk alert to ${OFFICIAL_EMAIL} is pending domain verification.`,
        timestamp,
      });
    }

    // Both failed
    const isSandboxError =
      resUser.error?.includes("only send testing emails") ||
      resInternal.error?.includes("only send testing emails");

    if (isSandboxError) {
      return NextResponse.json(
        {
          success: false,
          error: `Resend Sandbox Restriction: Resend's free tier currently only allows sending from onboarding@resend.dev to its registered account owner (meetahalpara1@gmail.com). To deliver emails to ${trimmedEmail} and ${OFFICIAL_EMAIL}, please either verify a custom domain on resend.com/domains or provide working Gmail SMTP credentials in .env.local.`,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Email delivery failed: ${resUser.error || resInternal.error || "Unknown mail service error."}`,
      },
      { status: 502 }
    );
  } catch (error: unknown) {
    console.error("[/api/contact] Internal Server Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process contact inquiry." },
      { status: 500 }
    );
  }
}
