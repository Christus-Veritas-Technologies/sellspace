import { NextResponse } from "next/server";

import { fetchWithSessionAuth } from "@/lib/server-session";

export async function POST(req: Request): Promise<NextResponse> {
  const formData = await req.formData();
  const response = await fetchWithSessionAuth("/api/uploads/listing", {
    method: "POST",
    body: formData,
  });

  if (!response) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await response.json() as { images?: { id: string; url: string; order: number }[]; error?: string };
  return NextResponse.json(data, { status: response.status });
}