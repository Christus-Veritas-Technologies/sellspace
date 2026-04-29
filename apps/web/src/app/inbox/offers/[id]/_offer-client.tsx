"use client";

import { useState, useTransition } from "react";

import { acceptOffer, counterOffer, declineOffer } from "./_actions";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OfferMessage {
  id: string;
  amount: number;
  type: "OFFER" | "COUNTER" | "ACCEPT" | "DECLINE";
  createdAt: string;
  sender: { id: string; displayName: string | null };
}

const TYPE_LABEL: Record<string, string> = {
  OFFER: "Offer",
  COUNTER: "Counter-offer",
  ACCEPT: "Accepted",
  DECLINE: "Declined",
};

function formatUSD(cents: number) {
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Offer row ────────────────────────────────────────────────────────────────

function OfferRow({ msg, isMe }: { msg: OfferMessage; isMe: boolean }) {
  const isResolution = msg.type === "ACCEPT" || msg.type === "DECLINE";
  const label = TYPE_LABEL[msg.type] ?? msg.type;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-[14px] px-4 py-3 ${
          isResolution
            ? msg.type === "ACCEPT"
              ? "bg-[#DCFCE7] border border-[#16A34A]/20"
              : "bg-[#FEE2E2] border border-[#DC2626]/20"
            : isMe
              ? "bg-[#0D3B2E]"
              : "bg-white border border-[#E2E2DC]"
        }`}
      >
        <p
          className={`text-[11px] font-[700] uppercase tracking-wide mb-1.5 ${
            isResolution
              ? msg.type === "ACCEPT" ? "text-[#16A34A]" : "text-[#DC2626]"
              : isMe ? "text-[rgba(250,250,248,0.6)]" : "text-[#8A8A82]"
          }`}
        >
          {label}
        </p>
        {msg.amount > 0 && (
          <p
            className={`text-[20px] font-[700] ${
              isResolution
                ? msg.type === "ACCEPT" ? "text-[#16A34A]" : "text-[#DC2626]"
                : isMe ? "text-[#FAFAF8]" : "text-[#1A1A18]"
            }`}
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {formatUSD(msg.amount)}
          </p>
        )}
        <p
          className={`text-[10px] mt-1.5 ${
            isResolution ? "text-[#8A8A82]" : isMe ? "text-[rgba(250,250,248,0.5)]" : "text-[#8A8A82]"
          }`}
        >
          {formatDate(msg.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function OfferClient({
  threadId,
  currentUserId,
  isSeller,
  initialStatus,
  initialMessages,
}: {
  threadId: string;
  currentUserId: string;
  isSeller: boolean;
  initialStatus: string;
  initialMessages: OfferMessage[];
}) {
  const [messages, setMessages] = useState<OfferMessage[]>(initialMessages);
  const [status, setStatus] = useState(initialStatus);
  const [counterVal, setCounterVal] = useState("");
  const [showCounter, setShowCounter] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const isResolved = status === "ACCEPTED" || status === "DECLINED" || status === "EXPIRED";

  function handleAction(action: "accept" | "decline" | "counter") {
    setError("");
    startTransition(async () => {
      try {
        let res;
        if (action === "counter") {
          const cents = Math.round(parseFloat(counterVal) * 100);
          if (!cents || isNaN(cents) || cents < 1) {
            setError("Enter a valid counter amount.");
            return;
          }
          res = (await counterOffer(threadId, cents)) as { thread: { status: string; messages: OfferMessage[] } };
        } else if (action === "accept") {
          res = (await acceptOffer(threadId)) as { thread: { status: string; messages: OfferMessage[] } };
        } else {
          res = (await declineOffer(threadId)) as { thread: { status: string; messages: OfferMessage[] } };
        }
        setMessages(res.thread.messages);
        setStatus(res.thread.status);
        setShowCounter(false);
        setCounterVal("");
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: { label: "Pending", className: "bg-[#FEF3C7] text-[#D97706]" },
    COUNTERED: { label: "Countered", className: "bg-[#EFEFEB] text-[#4A4A45]" },
    ACCEPTED: { label: "Accepted", className: "bg-[#DCFCE7] text-[#16A34A]" },
    DECLINED: { label: "Declined", className: "bg-[#FEE2E2] text-[#DC2626]" },
    EXPIRED: { label: "Expired", className: "bg-[#EFEFEB] text-[#8A8A82]" },
  };
  const sc = statusConfig[status] ?? statusConfig.PENDING;

  return (
    <div>
      {/* Status badge */}
      <div className="flex items-center gap-2 mb-5">
        <span className={`text-[11px] font-[700] px-2.5 py-1 rounded-[6px] ${sc.className}`}>
          {sc.label}
        </span>
      </div>

      {/* Offer history */}
      <div className="space-y-3 mb-6">
        {messages.map((msg) => (
          <OfferRow key={msg.id} msg={msg} isMe={msg.sender.id === currentUserId} />
        ))}
      </div>

      {/* Action area */}
      {!isResolved && (
        <div className="border-t border-[#E2E2DC] pt-4">
          {error && <p className="text-[13px] text-[#DC2626] mb-3">{error}</p>}

          {/* Counter input */}
          {showCounter && (
            <div className="mb-3 flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A82] text-[14px]">$</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={counterVal}
                  onChange={(e) => setCounterVal(e.target.value)}
                  placeholder="Enter counter amount"
                  disabled={pending}
                  className="w-full h-11 pl-7 pr-3 rounded-[10px] border border-[#E2E2DC] bg-[#EFEFEB]
                             text-[14px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A]"
                  autoFocus
                />
              </div>
              <button
                onClick={() => handleAction("counter")}
                disabled={pending}
                className="h-11 px-5 rounded-[10px] bg-[#0D3B2E] text-[#FAFAF8] text-[14px] font-[600]
                           hover:bg-[#0A2E24] transition-colors disabled:opacity-60"
              >
                {pending ? "Sending…" : "Send"}
              </button>
              <button
                onClick={() => { setShowCounter(false); setCounterVal(""); setError(""); }}
                disabled={pending}
                className="h-11 px-4 rounded-[10px] border border-[#E2E2DC] bg-white text-[#4A4A45]
                           text-[14px] hover:bg-[#F2F2EF] transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {/* Seller: accept + decline + counter */}
            {isSeller && !showCounter && (
              <>
                <button
                  onClick={() => handleAction("accept")}
                  disabled={pending}
                  className="h-10 px-5 rounded-[10px] bg-[#16A34A] text-white text-[14px] font-[600]
                             hover:bg-[#15803D] transition-colors disabled:opacity-60"
                >
                  Accept
                </button>
                <button
                  onClick={() => setShowCounter(true)}
                  disabled={pending}
                  className="h-10 px-5 rounded-[10px] bg-[#0D3B2E] text-[#FAFAF8] text-[14px] font-[600]
                             hover:bg-[#0A2E24] transition-colors disabled:opacity-60"
                >
                  Counter
                </button>
                <button
                  onClick={() => handleAction("decline")}
                  disabled={pending}
                  className="h-10 px-5 rounded-[10px] border border-[#FEE2E2] bg-white text-[#DC2626]
                             text-[14px] font-[600] hover:bg-[#FEE2E2] transition-colors disabled:opacity-60"
                >
                  Decline
                </button>
              </>
            )}

            {/* Buyer: can only cancel (decline) a pending non-countered offer */}
            {!isSeller && status === "PENDING" && !showCounter && (
              <button
                onClick={() => handleAction("decline")}
                disabled={pending}
                className="h-10 px-5 rounded-[10px] border border-[#FEE2E2] bg-white text-[#DC2626]
                           text-[14px] font-[600] hover:bg-[#FEE2E2] transition-colors disabled:opacity-60"
              >
                Cancel Offer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
