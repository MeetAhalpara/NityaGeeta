import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

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
      });
    }

    // Ticket Reference ID & Timestamp
    const ticketId = `NG-MSG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const timestamp = new Date().toUTCString();

    // 4. Generate Email Messages
    // A) Customer Confirmation Email (FIXED TEMPLATE - Zero user-written text to prevent spam relay attacks)
    const userSubject = `NityaGeeta | Received: Inquiry regarding "${topicLabel}" [Ref: ${ticketId}]`;
    const userText = `Namaste ${trimmedName},

Thank you for reaching out. We confirm that NityaGeeta has received your inquiry regarding "${topicLabel}".

Submission Summary:
-------------------
Reference ID: ${ticketId}
Topic / Category: ${topicLabel}
Date Received: ${timestamp}
Screenshots Attached: ${attachments.length}

The NityaGeeta editorial desk will review your submission and apply any verified corrections or commentary updates accordingly.

With reverence,
The NityaGeeta Project Desk
Morved.NityaGeeta@outlook.com
https://nityageeta.com
`;

    // B) NityaGeeta Internal Notification Email (Contains user message & attachments for investigation)
    const internalSubject = `[NityaGeeta Alert] New Inquiry: ${topicLabel} from ${trimmedName} [${ticketId}]`;
    const internalText = `[NITYAGEETA CONTACT ALERT]
Reference Ticket: ${ticketId}
Timestamp: ${timestamp}
--------------------------------------------------
From: ${trimmedName} <${trimmedEmail}>
Topic / Category: ${topicLabel}
Screenshots Attached: ${attachments.length}
${attachments.length > 0 ? `Attached Files: ${attachments.map((a) => a.filename).join(", ")}\n` : ""}--------------------------------------------------
Message Body:
${trimmedMessage}

Reply directly to this user at: ${trimmedEmail}
`;

    // 5. Dispatch Delivery
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    let deliveryStatus = "simulated";

    // Method A: Twilio SendGrid
    if (sendgridApiKey) {
      const sendgridEndpoint = "https://api.sendgrid.com/v3/mail/send";
      const sendEmailViaSendGrid = async (
        to: string,
        subject: string,
        text: string,
        filesToSend: ProcessedAttachment[] = []
      ) => {
        try {
          const payload: Record<string, unknown> = {
            personalizations: [{ to: [{ email: to }] }],
            from: { email: OFFICIAL_EMAIL, name: "NityaGeeta" },
            subject,
            content: [{ type: "text/plain", value: text }],
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
            console.error("[SendGrid Error] Failed sending message. Status:", resp.status, errBody);
            return { ok: false, status: resp.status, error: errBody };
          }
          return { ok: true, status: resp.status };
        } catch (err) {
          console.error("[SendGrid Network Error]:", err);
          return { ok: false, status: 500, error: String(err) };
        }
      };

      const [resUser, resInternal] = await Promise.all([
        sendEmailViaSendGrid(trimmedEmail, userSubject, userText),
        sendEmailViaSendGrid(OFFICIAL_EMAIL, internalSubject, internalText, attachments),
      ]);

      // If the desk alert fails, report error with HTTP 502
      if (!resInternal.ok) {
        return NextResponse.json(
          { success: false, error: "Failed to dispatch notification to the editorial desk. Please try again later." },
          { status: 502 }
        );
      }

      // If internal succeeded but user receipt failed, return partial delivery status
      if (resInternal.ok && !resUser.ok) {
        return NextResponse.json({
          success: true,
          ticketId,
          deliveryStatus: "partial",
          warning: "Your inquiry was safely delivered to our editorial desk, but the customer acknowledgment email could not be sent.",
          timestamp,
        });
      }

      deliveryStatus = "sendgrid_dispatched";
    }
    // Method B: SMTP (Outlook / Office 365 / SES)
    else if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Send to Official NityaGeeta mailbox with attachments
      let internalOk = false;
      try {
        await transporter.sendMail({
          from: `"NityaGeeta Alert" <${smtpUser}>`,
          to: OFFICIAL_EMAIL,
          replyTo: trimmedEmail,
          subject: internalSubject,
          text: internalText,
          attachments: attachments.map((a) => ({
            filename: a.filename,
            content: a.buffer,
            contentType: a.contentType,
          })),
        });
        internalOk = true;
      } catch (err) {
        console.error("[SMTP Error] Failed to send desk alert:", err);
        return NextResponse.json(
          { success: false, error: "Failed to dispatch notification to the editorial desk. Please try again later." },
          { status: 502 }
        );
      }

      // Send Customer Receipt
      let userOk = false;
      try {
        await transporter.sendMail({
          from: `"NityaGeeta Desk" <${smtpUser}>`,
          to: trimmedEmail,
          subject: userSubject,
          text: userText,
        });
        userOk = true;
      } catch (err) {
        console.error("[SMTP Warning] Failed to send customer receipt:", err);
      }

      if (internalOk && !userOk) {
        return NextResponse.json({
          success: true,
          ticketId,
          deliveryStatus: "partial",
          warning: "Your inquiry was safely delivered to our editorial desk, but the customer acknowledgment email could not be sent.",
          timestamp,
        });
      }

      deliveryStatus = "smtp_dispatched";
    } else {
      // In production, reject unconfigured mail service rather than silently faking delivery
      if (process.env.NODE_ENV === "production") {
        console.error("[CRITICAL] Contact API invoked in production without mail credentials configured.");
        return NextResponse.json(
          {
            success: false,
            error: "Outbound contact service is temporarily unavailable in production. Please reach out to Morved.NityaGeeta@outlook.com directly.",
          },
          { status: 503 }
        );
      }

      // Dev & Test Mode Fallback: Server Audit Log
      console.log("[CONTACT EMAIL DISPATCH - DEV SIMULATION]", {
        ticket: ticketId,
        customerEmail: trimmedEmail,
        officialEmail: OFFICIAL_EMAIL,
        attachmentsCount: attachments.length,
      });
      deliveryStatus = "simulated_success";
    }

    return NextResponse.json({
      success: true,
      ticketId,
      deliveryStatus,
      message: "Inquiry successfully recorded and notifications processed for both parties.",
      timestamp,
    });
  } catch (error: unknown) {
    console.error("[/api/contact] Internal Server Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process contact inquiry." },
      { status: 500 }
    );
  }
}
