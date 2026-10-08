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

const IP_V4_REGEX = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
const IP_V6_REGEX = /^[0-9a-fA-F:]+$/;

function isValidIp(ip: string): boolean {
  if (!ip || ip.length > 45) return false;
  return IP_V4_REGEX.test(ip) || IP_V6_REGEX.test(ip);
}

function getTrustedClientIp(request: Request): string {
  const headers = request.headers;
  // 1. Cloudflare connecting IP
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp && isValidIp(cfIp.trim())) return cfIp.trim();

  // 2. Reverse proxy real IP
  const realIp = headers.get("x-real-ip");
  if (realIp && isValidIp(realIp.trim())) return realIp.trim();

  // 3. Fallback to rightmost entry of x-forwarded-for (nearest trusted proxy)
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0 && isValidIp(parts[parts.length - 1])) {
      return parts[parts.length - 1];
    }
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
  publicUrl?: string;
}

function detectImageMime(buffer: Buffer): { mime: string; ext: string } | null {
  if (buffer.length < 12) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mime: "image/png", ext: "png" };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }

  // GIF: GIF87a or GIF89a
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return { mime: "image/gif", ext: "gif" };
  }

  // WebP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { mime: "image/webp", ext: "webp" };
  }

  return null;
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
  let ticketUploadsDir: string | null = null;
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
    const topicLabel =
      category === "other" && otherCategory?.trim()
        ? `Other: ${otherCategory.trim()}`
        : VALID_CATEGORIES[category] || "General Inquiry";

    // 2. Rate Limiting Check
    const WINDOW_10_MIN = 10 * 60 * 1000;
    const isLocal = clientIp === "127.0.0.1" || clientIp === "::1" || clientIp.startsWith("192.168.");

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

    // Ticket Reference ID & Timestamp
    const ticketId = `NG-MSG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const timestamp = new Date().toUTCString();

    // Secure origin construction (strictly from configured environment or fixed production domain)
    const configuredOrigin =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "production" ? "https://nityageeta.tech" : undefined);

    // Stage all files in memory and inspect magic bytes BEFORE writing to disk
    interface PreValidatedFile {
      buffer: Buffer;
      originalName: string;
      size: number;
      mime: string;
      ext: string;
    }
    const preValidatedFiles: PreValidatedFile[] = [];

    for (const file of rawFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: `Attachment "${file.name}" exceeds the 5MB file size limit.` },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const detected = detectImageMime(buffer);

      if (!detected) {
        return NextResponse.json(
          { success: false, error: `File "${file.name}" is not a valid image. Only PNG, JPG, WEBP, and GIF images are supported.` },
          { status: 400 }
        );
      }

      preValidatedFiles.push({
        buffer,
        originalName: file.name,
        size: file.size,
        mime: detected.mime,
        ext: detected.ext,
      });
    }

    // Persist verified files outside public directory in private storage
    const attachments: ProcessedAttachment[] = [];
    const privateUploadsBase = path.join(process.cwd(), "private_uploads", "contact");
    ticketUploadsDir = path.join(privateUploadsBase, ticketId);

    if (preValidatedFiles.length > 0) {
      fs.mkdirSync(ticketUploadsDir, { recursive: true });
    }

    let fileIdx = 0;
    for (const item of preValidatedFiles) {
      const randomToken = Math.random().toString(36).substring(2, 8);
      // Collision-free filename derived strictly from validated extension
      const storedFilename = `${ticketId}_att_${fileIdx + 1}_${randomToken}.${item.ext}`;
      const filePath = path.join(ticketUploadsDir, storedFilename);

      fs.writeFileSync(filePath, item.buffer);

      const contentId = `evidence_${fileIdx + 1}_${ticketId}@nityageeta.tech`;
      const publicUrl = configuredOrigin
        ? `${configuredOrigin}/api/contact/download?ticketId=${encodeURIComponent(ticketId)}&file=${encodeURIComponent(storedFilename)}`
        : undefined;

      attachments.push({
        filename: storedFilename,
        buffer: item.buffer,
        contentType: item.mime,
        size: item.size,
        contentId,
        publicUrl,
      });
      fileIdx++;
    }

    const BRAND_LOGO_URL = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "https://nityageeta.tech/images/optimized-logo.png";

    // Sanitized values for HTML email templates
    const safeName = escapeHtml(trimmedName);
    const safeTopicLabel = escapeHtml(topicLabel);
    const safeMessage = escapeHtml(trimmedMessage);

    // 4. Generate Email Messages
    // A) Customer Confirmation Email
    const userSubject = `NityaGeeta | Received: Inquiry regarding "${topicLabel}" [Ref: ${ticketId}]`;
    const userText = `Namaste ${trimmedName},

Thank you for reaching out to NityaGeeta. We confirm that your inquiry regarding "${topicLabel}" has been safely received and logged.

Submission Summary:
-------------------
Reference ID: ${ticketId}
Topic / Category: ${topicLabel}
Date Received: ${timestamp}

Your Message:
"${trimmedMessage}"

Our editorial and technical team reviews all reader correspondence within 24 to 48 hours.

With reverence,
The NityaGeeta Editorial & Research Team
https://nityageeta.tech`;

    const userHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(userSubject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2D2622;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F2; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #DFD5C6; box-shadow: 0 4px 16px rgba(45, 38, 34, 0.04); overflow: hidden;">
          <tr>
            <td style="padding: 32px 32px 24px; border-bottom: 1px solid #F0E9DF;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <img src="${BRAND_LOGO_URL}" alt="NityaGeeta" width="36" height="36" style="display: block; border-radius: 8px;">
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(194, 94, 56, 0.1); color: #C25E38; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 999px;">
                      Received
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #1C1917; letter-spacing: -0.01em;">
                Inquiry Received
              </h1>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #57534E;">
                Namaste <strong>${safeName}</strong>, thank you for writing to NityaGeeta. Your submission regarding <strong>${safeTopicLabel}</strong> has been logged into our editorial registry.
              </p>
              <div style="background-color: #F8F5F0; border-radius: 12px; padding: 18px; margin-bottom: 24px; border: 1px solid #ECE4D8;">
                <table role="presentation" width="100%" style="font-size: 13px;">
                  <tr>
                    <td style="color: #78716C; padding-bottom: 8px;">Reference Ticket:</td>
                    <td align="right" style="font-weight: 700; font-family: monospace; color: #1C1917; padding-bottom: 8px;">${ticketId}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716C; padding-bottom: 8px;">Category:</td>
                    <td align="right" style="font-weight: 600; color: #1C1917; padding-bottom: 8px;">${safeTopicLabel}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716C;">Logged At:</td>
                    <td align="right" style="color: #57534E;">${timestamp}</td>
                  </tr>
                </table>
              </div>
              <div style="margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8C7E72; margin-bottom: 8px;">
                  Submitted Message:
                </div>
                <div style="background-color: #FFFFFF; border: 1px solid #E7DFD4; border-radius: 10px; padding: 14px; font-size: 13px; line-height: 1.6; color: #2D2622; white-space: pre-wrap;">
${safeMessage}
                </div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // B) Editorial Desk Notification Email
    const internalSubject = `[URGENT / DISPATCH] ${topicLabel} from ${trimmedName} [Ref: ${ticketId}]`;
    const internalText = `EDITORIAL DISPATCH NOTIFICATION
=================================
Ticket Reference: ${ticketId}
Category: ${topicLabel}
Sender Name: ${trimmedName}
Sender Email: ${trimmedEmail}
Client IP: ${clientIp}
Logged At: ${timestamp}
Attachments: ${attachments.length} file(s)

MESSAGE BODY:
-------------
${trimmedMessage}
`;

    const internalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(internalSubject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2D2622;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F2; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 640px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #DFD5C6;">
          <tr>
            <td style="padding: 24px 32px; background-color: #2D2622; color: #F5F2EB; border-radius: 20px 20px 0 0;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 700;">NityaGeeta Editorial Dispatch</h2>
              <div style="font-size: 12px; opacity: 0.8; font-family: monospace; margin-top: 4px;">TICKET: ${ticketId}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <table role="presentation" width="100%" style="font-size: 13px; margin-bottom: 24px;">
                <tr>
                  <td style="color: #78716C; padding-bottom: 8px;">From:</td>
                  <td align="right" style="font-weight: 600; color: #1C1917; padding-bottom: 8px;">${safeName} &lt;${escapeHtml(trimmedEmail)}&gt;</td>
                </tr>
                <tr>
                  <td style="color: #78716C; padding-bottom: 8px;">Category:</td>
                  <td align="right" style="font-weight: 600; color: #1C1917; padding-bottom: 8px;">${safeTopicLabel}</td>
                </tr>
                <tr>
                  <td style="color: #78716C; padding-bottom: 8px;">Client IP:</td>
                  <td align="right" style="font-family: monospace; color: #57534E; padding-bottom: 8px;">${escapeHtml(clientIp)}</td>
                </tr>
                <tr>
                  <td style="color: #78716C; padding-bottom: 8px;">Logged At:</td>
                  <td align="right" style="color: #57534E; padding-bottom: 8px;">${timestamp}</td>
                </tr>
                <tr>
                  <td style="color: #78716C;">Attachments:</td>
                  <td align="right" style="font-weight: 600; color: #1C1917;">${attachments.length} file(s)</td>
                </tr>
              </table>

              <div style="margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #8C7E72; margin-bottom: 8px;">Message:</div>
                <div style="background-color: #F8F5F0; border-radius: 10px; padding: 14px; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</div>
              </div>

              ${
                attachments.length > 0
                  ? `
              <div style="margin-top: 18px; padding-top: 18px; border-top: 1px dashed #E0D7CB;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #8C7E72; margin-bottom: 12px;">Attached Evidence Files:</div>
                ${attachments
                  .map(
                    (a, i) => `
                <div style="margin-bottom: 12px; padding: 10px; background-color: #F8F5F0; border-radius: 8px; font-size: 12px;">
                  <strong>File #${i + 1}:</strong> ${escapeHtml(a.filename)} (${formatBytes(a.size)})
                  ${a.publicUrl ? `<br><a href="${escapeHtml(a.publicUrl)}" style="color: #C25E38;">Download Attachment</a>` : ""}
                </div>`
                  )
                  .join("")}
              </div>`
                  : ""
              }
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // 5. Dispatch Logic via Configured Provider
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const resendApiKey = process.env.RESEND_API_KEY;
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    const noReplySender = process.env.RESEND_FROM || "NityaGeeta Dispatch <onboarding@resend.dev>";

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
          auth: { user: smtpUser, pass: smtpPass },
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
            cid: a.contentId,
            contentDisposition: "attachment",
          })),
        });

        return { ok: true, status: 200 };
      } catch (err: unknown) {
        console.error("[SMTP Error] Delivery failed:", err);
        return { ok: false, status: 500, error: String(err) };
      }
    };

    let resUser: { ok: boolean; status?: number; error?: string } = { ok: false };
    let resInternal: { ok: boolean; status?: number; error?: string } = { ok: false };
    let deliveryStatus = "pending";

    const isResendSandbox = noReplySender.includes("resend.dev");
    const canUseSmtp = Boolean(smtpHost && smtpUser && smtpPass);

    if (canUseSmtp && (isResendSandbox || !resendApiKey)) {
      // Send editorial desk alert FIRST
      resInternal = await sendEmailViaSmtp(OFFICIAL_EMAIL, trimmedEmail, internalSubject, internalText, internalHtml, attachments);
      if (resInternal.ok) {
        resUser = await sendEmailViaSmtp(trimmedEmail, OFFICIAL_EMAIL, userSubject, userText, userHtml, []);
        deliveryStatus = resUser.ok ? "smtp_dispatched" : "partial";
      }
    } else if (resendApiKey) {
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
              if (a.contentId) item.content_id = a.contentId;
              if (a.contentType) item.content_type = a.contentType;
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
            console.error("[Resend Error] Delivery failed. Status:", resp.status, errBody);
            return { ok: false, status: resp.status, error: errBody };
          }
          return { ok: true, status: resp.status };
        } catch (err) {
          console.error("[Resend Network Error] Delivery failed:", err);
          return { ok: false, status: 500, error: String(err) };
        }
      };

      // Send editorial desk alert FIRST
      resInternal = await sendEmailViaResend(OFFICIAL_EMAIL, trimmedEmail, internalSubject, internalText, internalHtml, attachments);
      if (!resInternal.ok && canUseSmtp) {
        console.warn("[Contact API] Resend failed for desk alert. Attempting SMTP fallback...");
        resInternal = await sendEmailViaSmtp(OFFICIAL_EMAIL, trimmedEmail, internalSubject, internalText, internalHtml, attachments);
      }

      if (resInternal.ok) {
        resUser = await sendEmailViaResend(trimmedEmail, OFFICIAL_EMAIL, userSubject, userText, userHtml, []);
        if (!resUser.ok && canUseSmtp) {
          resUser = await sendEmailViaSmtp(trimmedEmail, OFFICIAL_EMAIL, userSubject, userText, userHtml, []);
        }
        deliveryStatus = resUser.ok ? "resend_dispatched" : "partial";
      }
    } else if (sendgridApiKey) {
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
            console.error("[SendGrid Error] Delivery failed. Status:", resp.status, errBody);
            return { ok: false, status: resp.status, error: errBody };
          }
          return { ok: true, status: resp.status };
        } catch (err) {
          console.error("[SendGrid Network Error] Delivery failed:", err);
          return { ok: false, status: 500, error: String(err) };
        }
      };

      // Send editorial desk alert FIRST
      resInternal = await sendEmailViaSendGrid(OFFICIAL_EMAIL, internalSubject, internalText, internalHtml, attachments);
      if (resInternal.ok) {
        resUser = await sendEmailViaSendGrid(trimmedEmail, userSubject, userText, userHtml, []);
        deliveryStatus = resUser.ok ? "sendgrid_dispatched" : "partial";
      }
    } else {
      // Final fallback when no mail provider configured
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { success: false, error: "Unable to send your message right now, please try again later." },
          { status: 503 }
        );
      } else {
        console.log(`[Contact API Simulation] No mail provider configured. Simulated dispatch for ticket ${ticketId} from ${trimmedEmail}`);
        return NextResponse.json({
          success: true,
          ticketId,
          deliveryStatus: "simulated_success",
          message: "Inquiry successfully recorded (simulated dispatch).",
          timestamp,
        });
      }
    }

    // Evaluate Delivery Results
    if (resInternal.ok) {
      if (resUser.ok) {
        return NextResponse.json({
          success: true,
          ticketId,
          deliveryStatus,
          message: "Inquiry successfully recorded and notifications sent to both parties.",
          timestamp,
        });
      } else {
        return NextResponse.json({
          success: true,
          ticketId,
          deliveryStatus: "partial",
          warning: `Your inquiry was delivered to our editorial desk, but confirmation receipt could not be sent to your email.`,
          timestamp,
        });
      }
    }

    // Desk delivery failed: clean up staged files and return retryable error
    if (ticketUploadsDir && fs.existsSync(ticketUploadsDir)) {
      try {
        fs.rmSync(ticketUploadsDir, { recursive: true, force: true });
      } catch (rmErr) {
        console.error("[Attachment Cleanup Error]", rmErr);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unable to send your message right now, please try again later.",
      },
      { status: 502 }
    );
  } catch (error: unknown) {
    console.error("[/api/contact] Internal Server Error:", error);
    if (ticketUploadsDir && fs.existsSync(ticketUploadsDir)) {
      try {
        fs.rmSync(ticketUploadsDir, { recursive: true, force: true });
      } catch {
        // Ignore secondary cleanup error
      }
    }
    return NextResponse.json(
      { success: false, error: "Unable to send your message right now, please try again later." },
      { status: 500 }
    );
  }
}
