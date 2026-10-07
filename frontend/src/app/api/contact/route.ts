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

    // Ticket Reference ID
    const ticketId = `NG-MSG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const timestamp = new Date().toUTCString();

    // 2. Generate Email Messages (Plain text format to guarantee zero XSS / HTML injection vectors)
    // A) Customer Confirmation Email (Reverent, Clear, Transparent)
    const userSubject = `NityaGeeta | Received: Inquiry regarding "${topicLabel}" [Ref: ${ticketId}]`;
    const userText = `Namaste ${trimmedName},

Thank you for reaching out. We confirm that NityaGeeta has received your inquiry regarding "${topicLabel}".

Submission Summary:
-------------------
Reference ID: ${ticketId}
Topic / Category: ${topicLabel}
Date Received: ${timestamp}
Screenshots Attached: ${screenshotsCount}

Message:
${trimmedMessage}

---------------------------------------------------
The NityaGeeta editorial desk will review your report and apply any verified shloka or commentary updates accordingly.

With reverence,
The NityaGeeta Project Desk
Morved.NityaGeeta@outlook.com
https://nityageeta.com
`;

    // B) NityaGeeta Internal Notification Email
    const internalSubject = `[NityaGeeta Alert] New Inquiry: ${topicLabel} from ${trimmedName} [${ticketId}]`;
    const internalText = `[NITYAGEETA CONTACT ALERT]
Reference Ticket: ${ticketId}
Timestamp: ${timestamp}
--------------------------------------------------
From: ${trimmedName} <${trimmedEmail}>
Topic / Category: ${topicLabel}
Attached Screenshots: ${screenshotsCount}
--------------------------------------------------
Message Body:
${trimmedMessage}

Reply directly to this user at: ${trimmedEmail}
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
      const sendEmailViaSendGrid = async (to: string, subject: string, text: string) => {
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
            content: [{ type: "text/plain", value: text }],
          }),
        });
        return resp.ok;
      };

      const [resUser, resInternal] = await Promise.all([
        sendEmailViaSendGrid(trimmedEmail, userSubject, userText),
        sendEmailViaSendGrid(OFFICIAL_EMAIL, internalSubject, internalText),
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
          text: userText,
        }),
        // Send to Official NityaGeeta mailbox
        transporter.sendMail({
          from: `"NityaGeeta Alert" <${smtpUser}>`,
          to: OFFICIAL_EMAIL,
          replyTo: trimmedEmail,
          subject: internalSubject,
          text: internalText,
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
