import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@sellspace/env/web";

import { InboxClient } from "./_inbox-client";

const BASE = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");

export default async function InboxPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ss_access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const headers = { Authorization: `Bearer ${token}` };

  const [threadsRes, offersRes] = await Promise.allSettled([
    fetch(`${BASE}/api/messages/threads`, { headers, cache: "no-store" }),
    fetch(`${BASE}/api/offers`, { headers, cache: "no-store" }),
  ]);

  const threads =
    threadsRes.status === "fulfilled" && threadsRes.value.ok
      ? ((await threadsRes.value.json()) as { threads: unknown[] }).threads ?? []
      : [];

  const offers =
    offersRes.status === "fulfilled" && offersRes.value.ok
      ? ((await offersRes.value.json()) as { offers: unknown[] }).offers ?? []
      : [];

  return (
    <main className="bg-[#F2F2EF] min-h-screen">
      <div className="max-w-[680px] mx-auto px-6 py-8">
        <h1
          className="text-[28px] font-[700] text-[#1A1A18] mb-6"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Inbox
        </h1>
        <InboxClient
          threads={threads as Parameters<typeof InboxClient>[0]["threads"]}
          offers={offers as Parameters<typeof InboxClient>[0]["offers"]}
        />
      </div>
    </main>
  );
}
