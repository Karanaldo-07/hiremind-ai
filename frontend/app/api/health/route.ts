import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://hiremind-ai-api.onrender.com";

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ status: "offline" }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "offline" }, { status: 502 });
  }
}
