import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MIME_MAP: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawTicketId = searchParams.get("ticketId");
    const rawFilename = searchParams.get("file");

    if (!rawTicketId || !rawFilename) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Defensive path sanitization preventing path traversal
    const safeTicketId = path.basename(rawTicketId).replace(/[^a-zA-Z0-9_-]/g, "");
    const safeFilename = path.basename(rawFilename).replace(/[^a-zA-Z0-9._-]/g, "");

    if (!safeTicketId || !safeFilename) {
      return NextResponse.json({ error: "Invalid path parameters" }, { status: 400 });
    }

    const ext = safeFilename.split(".").pop()?.toLowerCase() || "";
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    const baseUploadsDir = path.join(process.cwd(), "private_uploads", "contact");
    const filePath = path.join(baseUploadsDir, safeTicketId, safeFilename);

    // Verify resolved path resides strictly within base directory
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(baseUploadsDir))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(resolvedPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[Attachment Download Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
