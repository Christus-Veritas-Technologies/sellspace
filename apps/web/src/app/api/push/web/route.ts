import { NextResponse } from "next/server";

import { fetchWithSessionAuth } from "@/lib/server-session";

export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.json() as unknown;

  const response = await fetchWithSessionAuth("/api/push/web", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await response.json() as { ok?: boolean; error?: string };
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(): Promise<NextResponse> {
  const response = await fetchWithSessionAuth("/api/push/web", {
    method: "DELETE",
  });

  if (!response) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await response.json() as { ok?: boolean; error?: string };
  return NextResponse.json(data, { status: response.status });
}
