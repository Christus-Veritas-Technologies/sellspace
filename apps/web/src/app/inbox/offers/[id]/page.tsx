import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { env } from "@sellspace/env/web";

import { OfferClient } from "./_offer-client";

const BASE = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");

export default async function OfferThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("ss_access_token")?.value;
  if (!token) redirect("/login");

  const headers = { Authorization: `Bearer ${token}` };

  const [threadRes, meRes] = await Promise.all([
    fetch(`${BASE}/api/offers/${id}`, { headers, cache: "no-store" }),
    fetch(`${BASE}/api/users/me`, { headers, cache: "no-store" }),
  ]);

  if (!threadRes.ok) notFound();

  const { thread } = (await threadRes.json()) as {
    thread: {
      id: string;
      status: string;
      listing: { id: string; title: string; price: number; images: { url: string }[] };
      buyer: { id: string; displayName: string | null };
      seller: { id: string; displayName: string | null };
      messages: {
        id: string;
        amount: number;
        type: "OFFER" | "COUNTER" | "ACCEPT" | "DECLINE";
        createdAt: string;
        sender: { id: string; displayName: string | null };
      }[];
    };
  };

  const meData = meRes.ok ? (await meRes.json()) as { user: { id: string } } : null;
  const currentUserId = meData?.user.id ?? "";
  const isSeller = thread.seller.id === currentUserId;
  const otherUser = isSeller ? thread.buyer : thread.seller;

  return (
    <main className="bg-[#F2F2EF] min-h-screen">
      <div className="max-w-[680px] mx-auto px-6 py-8">

        {/* Back + title */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/inbox"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#E2E2DC]
                       hover:bg-[#F2F2EF] transition-colors shrink-0"
            aria-label="Back to inbox"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div className="min-w-0">
            <p className="text-[16px] font-[700] text-[#1A1A18] truncate">
              Offer with {otherUser.displayName ?? "User"}
            </p>
            <Link
              href={`/listings/${thread.listing.id}`}
              className="text-[12px] text-[#8A8A82] hover:text-[#E8621A] transition-colors truncate block"
            >
              {thread.listing.title}
            </Link>
          </div>
        </div>

        {/* Listing card */}
        <div className="bg-white rounded-[12px] border border-[#E2E2DC] p-4 flex gap-3 mb-5
                        shadow-[0_1px_3px_rgba(26,26,24,0.06)]">
          <div className="w-14 h-14 rounded-[8px] overflow-hidden bg-[#EFEFEB] shrink-0">
            {thread.listing.images[0]?.url ? (
              <img src={thread.listing.images[0].url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#EFEFEB]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-[600] text-[#1A1A18] truncate">{thread.listing.title}</p>
            <p className="text-[13px] text-[#E8621A] font-[700]">
              Asking ${(thread.listing.price / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Offer thread */}
        <div className="bg-white rounded-[14px] border border-[#E2E2DC] p-5
                        shadow-[0_1px_3px_rgba(26,26,24,0.06)]">
          <OfferClient
            threadId={thread.id}
            currentUserId={currentUserId}
            isSeller={isSeller}
            initialStatus={thread.status}
            initialMessages={thread.messages}
          />
        </div>

      </div>
    </main>
  );
}
