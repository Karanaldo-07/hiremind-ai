import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://hiremind-ai-api.onrender.com";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ detail: "No resume file was provided." }, { status: 400 });
    }

    const upstream = await fetch(`${API_URL}/api/v1/resumes/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ detail: "Unable to reach the resume analysis service." }, { status: 502 });
  }
}
