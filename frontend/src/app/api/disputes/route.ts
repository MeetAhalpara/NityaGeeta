import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { citationId, title, chapter, verse, page, source, reason, explanation, email } = body;

    if (!explanation || typeof explanation !== "string" || !explanation.trim()) {
      return NextResponse.json(
        { success: false, error: "Explanation details are required." },
        { status: 400 }
      );
    }

    // Generate unique NityaGeeta Governance Ticket ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const disputeId = `NG-DISPUTE-${randomSuffix}`;

    const timestamp = new Date().toISOString();

    const auditRecord = {
      disputeId,
      citationId: citationId || "unknown",
      title: title || "Unknown Citation",
      shlokaRef: { chapter, verse, page },
      source: source || "Vedic Library",
      reason: reason || "general_dispute",
      explanation: explanation.trim(),
      userEmail: email || null,
      status: "pending_review",
      createdAt: timestamp,
    };

    console.log("[NityaGeeta Governance Audit] New Citation Dispute Logged:", auditRecord);

    return NextResponse.json(
      {
        success: true,
        disputeId,
        message: "Dispute audit ticket logged successfully.",
        timestamp,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[API /api/disputes Error]:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error processing governance dispute." },
      { status: 500 }
    );
  }
}
