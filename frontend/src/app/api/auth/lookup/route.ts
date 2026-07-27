import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  const body = await request.text();
  try {
    const res = await fetch(`${BACKEND}/api/v1/auth/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data ?? {}, { status: res.status });
  } catch {
    return NextResponse.json(
      { detail: "Backend service is unavailable. Please try again later." },
      { status: 503 }
    );
  }
}
