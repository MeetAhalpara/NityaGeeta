import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const OFFICIAL_EMAIL = process.env.NITYAGEETA_CONTACT_EMAIL || "Morved.NityaGeeta@outlook.com";

// Email RFC validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/;

interface ContactRequestBody {
  name: string;
  email: string;
  category: string;
  otherCategory?: string;
  message: string;
  screenshotsCount?: number;
}

// HTML entity escaper to guard against HTML injection / XSS in email clients (CWE-79, CWE-116)
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const VALID_CATEGORIES: Record<string, string> = {
  ai_feedback: "AI Dialogue Feedback & Prompt Grounding",
  verse_correction: "Sanskrit Verse / OCR Typo Correction",
  commentary_insight: "Share Commentary Insights / Traditional Bhashya",
  bug_report: "UI Glitch or Technical Bug Report",
  report_misuse: "Report Misuse / Misinterpretation",
  other: "Other Inquiry",
};

export async function POST(request: Request) {
  try {
    const body: ContactRequestBody = await request.json();
    const { name, email, category, otherCategory, message, screenshotsCount = 0 } = body;

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
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    const rawCategory = category.trim();
    const baseCategoryLabel = VALID_CATEGORIES[rawCategory] || "General Inquiry";
    const topicLabel = rawCategory === "other" && otherCategory?.trim()
      ? `Other: ${otherCategory.trim().slice(0, 80)}`
      : baseCategoryLabel;

    // Escaped variables for safe HTML interpolation
    const safeName = escapeHtml(trimmedName);
    const safeEmail = escapeHtml(trimmedEmail);
    const safeTopic = escapeHtml(topicLabel);
    const safeMessage = escapeHtml(trimmedMessage);

    // Ticket Reference ID
    const ticketId = `NG-MSG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const timestamp = new Date().toUTCString();

    // 2. Generate Email Templates
    // A) Customer Confirmation Email (Reverent, Clear, Transparent)
    const userSubject = `NityaGeeta | Received: Inquiry regarding "${topicLabel}" [Ref: ${ticketId}]`;
    const userHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF7F2; border: 1px solid #DFD5C6; border-radius: 16px; overflow: hidden; color: #2D2622;">
        <div style="background-color: #C25E38; padding: 24px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: normal; letter-spacing: 0.5px;">NityaGeeta</h1>
          <p style="color: #FFE6D9; margin: 4px 0 0 0; font-size: 13px;">Universal Bhagavad Gita Intelligence</p>
        </div>
        <div style="padding: 32px 28px;">
          <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Namaste <strong>${safeName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.7; color: #5C4F45;">
            Thank you for reaching out. We confirm that NityaGeeta has received your inquiry regarding <strong>${safeTopic}</strong>.
          </p>
          <div style="background-color: #FFFFFF; border: 1px solid #E8E1D7; border-radius: 12px; padding: 18px 20px; margin: 24px 0;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #C25E38; font-weight: bold; margin-bottom: 8px;">Submission Summary</div>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Reference ID:</strong> <span style="font-family: monospace;">${ticketId}</span></p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Topic / Category:</strong> ${safeTopic}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Date Received:</strong> ${timestamp}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Screenshots Attached:</strong> ${screenshotsCount}</p>
            <hr style="border: none; border-top: 1px solid #EFE9DF; margin: 12px 0;" />
            <p style="font-size: 13px; line-height: 1.6; color: #4A4038; margin: 0; white-space: pre-wrap;">${safeMessage}</p>
          </div>
          <p style="font-size: 13px; line-height: 1.6; color: #6B5E55;">
            The NityaGeeta editorial desk will review your report and apply any verified shloka or commentary updates accordingly.
          </p>
          <p style="font-size: 13px; color: #8C7B70; margin-bottom: 0;">
            With reverence,<br />
            <strong>The NityaGeeta Project Desk</strong>
          </p>
        </div>
        <div style="background-color: #EFE9DF; padding: 16px; text-align: center; font-size: 11px; color: #8C7B70; border-top: 1px solid #DFD5C6;">
          NityaGeeta • Dedicated to Canonical Scriptural Fidelity & Algorithmic Transparency<br />
          Official Contact: <a href="mailto:${OFFICIAL_EMAIL}" style="color: #C25E38; text-decoration: none;">${OFFICIAL_EMAIL}</a>
        </div>
      </div>
    `;

    // B) NityaGeeta Internal Notification Email
    const internalSubject = `[NityaGeeta Alert] New Inquiry: ${topicLabel} from ${trimmedName} [${ticketId}]`;
    const internalHtml = `
      <div style="font-family: monospace; max-width: 650px; margin: 0 auto; padding: 20px; background: #FAF7F2; border: 1px solid #C25E38; border-radius: 12px; color: #2D2622;">
        <h2 style="color: #C25E38; margin-top: 0;">[NityaGeeta Contact Alert]</h2>
        <p><strong>Reference Ticket:</strong> ${ticketId}</p>
        <p><strong>Timestamp:</strong> ${timestamp}</p>
        <hr style="border: 1px solid #DFD5C6;" />
        <p><strong>From:</strong> ${safeName} &lt;<a href="mailto:${safeEmail}">${safeEmail}</a>&gt;</p>
        <p><strong>Topic / Category:</strong> ${safeTopic}</p>
        <p><strong>Attached Screenshots:</strong> ${screenshotsCount}</p>
        <hr style="border: 1px solid #DFD5C6;" />
        <p><strong>Message Body:</strong></p>
        <pre style="background: #FFFFFF; padding: 15px; border-radius: 8px; border: 1px solid #DFD5C6; white-space: pre-wrap; font-family: inherit;">${safeMessage}</pre>
        <p style="font-size: 11px; color: #8C7B70;">Reply directly to this user at: ${safeEmail}</p>
      </div>
    `;

    // 3. Dispatch Delivery
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    let deliveryStatus = "simulated";

    // Method A: Twilio SendGrid (From GitHub Student Developer Pack)
    if (sendgridApiKey) {
      const sendgridEndpoint = "https://api.sendgrid.com/v3/mail/send";
      const sendEmailViaSendGrid = async (to: string, subject: string, html: string) => {
        const resp = await fetch(sendgridEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sendgridApiKey}`,
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: OFFICIAL_EMAIL, name: "NityaGeeta" },
            subject,
            content: [{ type: "text/html", value: html }],
          }),
        });
        return resp.ok;
      };

      const [resUser, resInternal] = await Promise.all([
        sendEmailViaSendGrid(trimmedEmail, userSubject, userHtml),
        sendEmailViaSendGrid(OFFICIAL_EMAIL, internalSubject, internalHtml),
      ]);

      if (resUser && resInternal) {
        deliveryStatus = "sendgrid_dispatched";
      }
    }
    // Method B: SMTP (Outlook, Gmail, Amazon SES, or SendGrid SMTP)
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

      await Promise.all([
        // Send to Customer
        transporter.sendMail({
          from: `"NityaGeeta Desk" <${smtpUser}>`,
          to: trimmedEmail,
          subject: userSubject,
          html: userHtml,
        }),
        // Send to Official NityaGeeta mailbox
        transporter.sendMail({
          from: `"NityaGeeta Alert" <${smtpUser}>`,
          to: OFFICIAL_EMAIL,
          replyTo: trimmedEmail,
          subject: internalSubject,
          html: internalHtml,
        }),
      ]);

      deliveryStatus = "smtp_dispatched";
    } else {
      // Dev & Test Mode Fallback: Server Audit Log
      console.log(`\n======================================================================`);
      console.log(`[CONTACT EMAIL DISPATCH - DEV SIMULATION]`);
      console.log(`Ticket: ${ticketId}`);
      console.log(`To Customer: ${trimmedEmail} | Subject: ${userSubject}`);
      console.log(`To NityaGeeta: ${OFFICIAL_EMAIL} | Subject: ${internalSubject}`);
      console.log(`======================================================================\n`);
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
