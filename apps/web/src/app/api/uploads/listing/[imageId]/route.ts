import { NextResponse } from "next/server";

import { fetchWithSessionAuth } from "@/lib/server-session";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ imageId: string }> },
): Promise<NextResponse> {
  const { imageId } = await params;
  const body = await req.json() as { imageId: string };

  const response = await fetchWithSessionAuth(`/api/uploads/listing/${imageId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await response.json() as { success?: boolean; error?: string };
  return NextResponse.json(data, { status: response.status });
}