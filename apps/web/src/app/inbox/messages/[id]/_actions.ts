"use server";

import { cookies } from "next/headers";

import { env } from "@sellspace/env/web";

const BASE = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");

export async function sendMessage(threadId: string, body: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ss_access_token")?.value;

  if (!token) throw new Error("You must be signed in.");

  const res = await fetch(`${BASE}/api/messages/threads/${threadId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ body }),
  });

  const data = (await res.json()) as { error?: string; message?: unknown };
  if (!res.ok) throw new Error(data.error ?? "Failed to send message.");

  return data;
}
