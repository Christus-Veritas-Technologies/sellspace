"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MessageThread {
  id: string;
  listing: { id: string; title: string; images: { url: string }[] };
  otherUser: { id: string; displayName: string | null };
  lastMessage: { body: string; createdAt: string } | null;
  unreadCount: number;
}

interface OfferThread {
  id: string;
  listing: { id: string; title: string; images: { url: string }[] };
  counterpart: { id: string; displayName: string | null };
  latestAmount: number;
  status: string;
  createdAt: string;
}

function formatRelative(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// ─── Component ───────────────────────────────────────────────────────────────

export function InboxClient({
  threads,
  offers,
}: {
  threads: MessageThread[];
  offers: OfferThread[];
}) {
  const [tab, setTab] = useState<"messages" | "offers">("messages");

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-[#E2E2DC] mb-6">
        {(["messages", "offers"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-[14px] font-[600] capitalize border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-[#E8621A] text-[#E8621A]"
                : "border-transparent text-[#8A8A82] hover:text-[#1A1A18]"
            }`}
          >
            {t}
            {t === "messages" && threads.length > 0 && (
              <span className="ml-1.5 text-[11px] bg-[#E8621A] text-white rounded-full px-1.5 py-0.5">
                {threads.length}
              </span>
            )}
            {t === "offers" && offers.length > 0 && (
              <span className="ml-1.5 text-[11px] bg-[#0D3B2E] text-white rounded-full px-1.5 py-0.5">
                {offers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Messages tab */}
      {tab === "messages" && (
        <div className="space-y-2">
          {threads.length === 0 ? (
            <p className="text-center py-16 text-[#8A8A82] text-[14px]">No messages yet.</p>
          ) : (
            threads.map((thread) => (
              <a
                key={thread.id}
                href={`/inbox/messages/${thread.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-[12px] border border-[#E2E2DC]
                           hover:border-[#E8621A] transition-colors group"
              >
                {/* Listing thumb */}
                <div className="w-14 h-14 rounded-[8px] overflow-hidden bg-[#EFEFEB] shrink-0">
                  {thread.listing.images[0]?.url ? (
                    <img src={thread.listing.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#EFEFEB]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-[600] text-[#1A1A18] truncate">
                    {thread.otherUser.displayName ?? "User"}
                  </p>
                  <p className="text-[12px] text-[#8A8A82] truncate">{thread.listing.title}</p>
                  {thread.lastMessage && (
                    <p className="text-[12px] text-[#4A4A45] truncate mt-0.5">
                      {thread.lastMessage.body}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  {thread.lastMessage && (
                    <p className="text-[11px] text-[#8A8A82]">{formatRelative(thread.lastMessage.createdAt)}</p>
                  )}
                  {thread.unreadCount > 0 && (
                    <span className="inline-block mt-1 w-5 h-5 rounded-full bg-[#E8621A] text-white text-[10px] font-[700] flex items-center justify-center">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
              </a>
            ))
          )}
        </div>
      )}

      {/* Offers tab */}
      {tab === "offers" && (
        <div className="space-y-2">
          {offers.length === 0 ? (
            <p className="text-center py-16 text-[#8A8A82] text-[14px]">No offers yet.</p>
          ) : (
            offers.map((offer) => {
              const statusConfig: Record<string, { label: string; className: string }> = {
                PENDING: { label: "Pending", className: "bg-[#F4A61D] text-[#1A1A18]" },
                ACCEPTED: { label: "Accepted", className: "bg-[#0D3B2E] text-[#FAFAF8]" },
                DECLINED: { label: "Declined", className: "bg-[#FEE2E2] text-[#DC2626]" },
                CANCELLED: { label: "Cancelled", className: "bg-[#EFEFEB] text-[#4A4A45]" },
              };
              const sc = statusConfig[offer.status] ?? statusConfig.PENDING;

              return (
                <a
                  key={offer.id}
                  href={`/inbox/offers/${offer.id}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-[12px] border border-[#E2E2DC]
                             hover:border-[#E8621A] transition-colors"
                >
                  <div className="w-14 h-14 rounded-[8px] overflow-hidden bg-[#EFEFEB] shrink-0">
                    {offer.listing.images[0]?.url ? (
                      <img src={offer.listing.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#EFEFEB]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-[600] text-[#1A1A18] truncate">{offer.listing.title}</p>
                    <p className="text-[12px] text-[#8A8A82] truncate">
                      {offer.counterpart.displayName ?? "User"}
                    </p>
                    <p className="text-[13px] font-[700] text-[#E8621A] mt-0.5">
                      ${(offer.latestAmount / 100).toFixed(2)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className={`text-[11px] font-[600] px-2 py-1 rounded-[6px] ${sc.className}`}>
                      {sc.label}
                    </span>
                    <p className="text-[11px] text-[#8A8A82] mt-1">{formatRelative(offer.createdAt)}</p>
                  </div>
                </a>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
