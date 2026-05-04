"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { DEFAULT_LISTING_IMAGE_URL } from "@/lib/listing-images";

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
  const router = useRouter();
  const [tab, setTab] = useState<"messages" | "offers">("messages");
  const [localThreads, setLocalThreads] = useState<MessageThread[]>(threads);
  const [localOffers] = useState<OfferThread[]>(offers);
  const wsRef = useRef<WebSocket | null>(null);

  // Sync server-rendered props when router.refresh() delivers new data
  useEffect(() => {
    setLocalThreads(threads);
  }, [threads]);

  // Derived badge counts
  const totalUnread = localThreads.reduce((sum, t) => sum + t.unreadCount, 0);
  const actionableOffers = localOffers.filter(
    (o) => o.status === "PENDING" || o.status === "COUNTERED",
  ).length;

  // WebSocket for real-time inbox updates + browser notifications
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    // Request notification permission once
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission();
    }

    async function connect() {
      if (destroyed) return;
      try {
        const res = await fetch("/api/auth/token");
        const { token } = (await res.json()) as { token: string | null };
        if (!token || destroyed) return;

        const wsBase = (process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:9999")
          .replace(/^https/, "wss")
          .replace(/^http/, "ws");

        ws = new WebSocket(`${wsBase}/ws?token=${encodeURIComponent(token)}`);
        wsRef.current = ws;

        ws.onmessage = (e) => {
          if (destroyed) return;
          let data: Record<string, unknown>;
          try {
            data = JSON.parse(e.data as string) as Record<string, unknown>;
          } catch {
            return;
          }

          if (data.event === "message" && typeof data.threadId === "string") {
            const msg = data.message as {
              body: string;
              createdAt: string;
              sender?: { displayName?: string | null };
            };

            setLocalThreads((prev) => {
              const idx = prev.findIndex((t) => t.id === data.threadId);
              if (idx === -1) {
                // Unknown thread — refresh to get it from server
                if (!destroyed) router.refresh();
                return prev;
              }
              return prev.map((t) =>
                t.id === data.threadId
                  ? {
                      ...t,
                      unreadCount: t.unreadCount + 1,
                      lastMessage: { body: msg.body, createdAt: msg.createdAt },
                    }
                  : t,
              );
            });

            // Browser notification when tab is not visible
            if (
              typeof Notification !== "undefined" &&
              Notification.permission === "granted" &&
              document.visibilityState !== "visible"
            ) {
              const sender =
                (msg.sender as { displayName?: string | null } | undefined)
                  ?.displayName ?? "Someone";
              new Notification(`new message from ${sender}`, {
                body: msg.body.slice(0, 100),
                icon: "/favicon.ico",
              });
            }
          }
        };

        ws.onclose = () => {
          wsRef.current = null;
          if (!destroyed) reconnectTimeout = setTimeout(connect, 3000);
        };
      } catch {
        if (!destroyed) reconnectTimeout = setTimeout(connect, 5000);
      }
    }

    void connect();

    return () => {
      destroyed = true;
      ws?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [router]);

  function handleThreadClick(threadId: string) {
    // Optimistically clear unread badge before navigation
    setLocalThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t)),
    );
    router.push(`/inbox/messages/${threadId}`);
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-[#E2E2DC] mb-6">
        {(["messages", "offers"] as const).map((t) => {
          const badgeCount = t === "messages" ? totalUnread : actionableOffers;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-[14px] font-[600] capitalize border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
                tab === t
                  ? "border-[#E8621A] text-[#E8621A]"
                  : "border-transparent text-[#8A8A82] hover:text-[#1A1A18]"
              }`}
            >
              {t}
              {badgeCount > 0 && (
                <div
                  className={`h-[18px] min-w-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-[700] text-white leading-none ${
                    t === "messages" ? "bg-[#E8621A]" : "bg-[#0D3B2E]"
                  }`}
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Messages tab */}
      {tab === "messages" && (
        <div className="space-y-2">
          {localThreads.length === 0 ? (
            <p className="text-center py-16 text-[#8A8A82] text-[14px]">No messages yet.</p>
          ) : (
            localThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => handleThreadClick(thread.id)}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-[12px] border border-[#E2E2DC]
                           hover:border-[#E8621A] transition-colors text-left"
              >
                {/* Listing thumb */}
                <div className="w-14 h-14 rounded-[8px] overflow-hidden bg-[#EFEFEB] shrink-0">
                  <img
                    src={thread.listing.images[0]?.url ?? DEFAULT_LISTING_IMAGE_URL}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-[600] text-[#1A1A18] truncate">
                    {thread.otherUser.displayName ?? "User"}
                  </p>
                  <p className="text-[12px] text-[#8A8A82] truncate">{thread.listing.title}</p>
                  {thread.lastMessage && (
                    <p
                      className={`text-[12px] truncate mt-0.5 ${
                        thread.unreadCount > 0
                          ? "text-[#1A1A18] font-[500]"
                          : "text-[#4A4A45]"
                      }`}
                    >
                      {thread.lastMessage.body}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right flex flex-col items-end gap-1">
                  {thread.lastMessage && (
                    <p className="text-[11px] text-[#8A8A82]">
                      {formatRelative(thread.lastMessage.createdAt)}
                    </p>
                  )}
                  {thread.unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-[#E8621A] text-white text-[10px] font-[700] flex items-center justify-center leading-none">
                      {thread.unreadCount > 9 ? "9+" : thread.unreadCount}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Offers tab */}
      {tab === "offers" && (
        <div className="space-y-2">
          {localOffers.length === 0 ? (
            <p className="text-center py-16 text-[#8A8A82] text-[14px]">No offers yet.</p>
          ) : (
            localOffers.map((offer) => {
              const statusConfig: Record<string, { label: string; className: string }> = {
                PENDING: { label: "Pending", className: "bg-[#F4A61D] text-[#1A1A18]" },
                COUNTERED: { label: "Countered", className: "bg-[#EFEFEB] text-[#4A4A45]" },
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
                    <img
                      src={offer.listing.images[0]?.url ?? DEFAULT_LISTING_IMAGE_URL}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-[600] text-[#1A1A18] truncate">
                      {offer.listing.title}
                    </p>
                    <p className="text-[12px] text-[#8A8A82] truncate">
                      {offer.counterpart.displayName ?? "User"}
                    </p>
                    <p className="text-[13px] font-[700] text-[#E8621A] mt-0.5">
                      ${(offer.latestAmount / 100).toFixed(2)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`text-[11px] font-[600] px-2 py-1 rounded-[6px] ${sc.className}`}
                    >
                      {sc.label}
                    </span>
                    <p className="text-[11px] text-[#8A8A82] mt-1">
                      {formatRelative(offer.createdAt)}
                    </p>
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
