"use client";

import { useState, useTransition } from "react";

import { leaveReview, makeOffer, reportListing, startMessageThread, toggleSave } from "./_actions";

// ─── Offer modal ──────────────────────────────────────────────────────────────

function OfferModal({
  listingId,
  listingPrice,
  onClose,
}: {
  listingId: string;
  listingPrice: number;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cents = Math.round(parseFloat(amount) * 100);
    if (!cents || isNaN(cents) || cents < 1) {
      setError("Enter a valid offer amount.");
      return;
    }
    startTransition(async () => {
      try {
        await makeOffer(listingId, cents);
        setSuccess(true);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-[#FAFAF8] rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
        {success ? (
          <div className="text-center py-4">
            <p className="text-[18px] font-[700] text-[#0D3B2E]" style={{ fontFamily: "'Fraunces', serif" }}>
              Offer sent!
            </p>
            <p className="text-[13px] text-[#8A8A82] mt-1">The seller has been notified.</p>
            <button
              onClick={onClose}
              className="mt-5 w-full h-11 rounded-[10px] bg-[#0D3B2E] text-[#FAFAF8] text-[14px] font-[600]"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
                Make an Offer
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EFEFEB] text-[#8A8A82] text-xl leading-none"
              >
                ×
              </button>
            </div>

            <p className="text-[13px] text-[#8A8A82] mb-4">
              Asking price:{" "}
              <span className="font-[600] text-[#1A1A18]">
                ${(listingPrice / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </p>

            <form onSubmit={handleSubmit}>
              <label className="block text-[13px] font-[600] text-[#1A1A18] mb-1.5">
                Your offer (USD)
              </label>
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A82] text-[14px]">$</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-11 pl-7 pr-3 rounded-[10px] border border-[#E2E2DC]
                             bg-[#EFEFEB] text-[#1A1A18] text-[14px] focus:outline-none
                             focus:border-[#E8621A]"
                  placeholder="0.00"
                  autoFocus
                  disabled={pending}
                />
              </div>

              {error && <p className="text-[13px] text-[#DC2626] mb-3">{error}</p>}

              <button
                type="submit"
                disabled={pending}
                className="w-full h-11 rounded-[10px] bg-[#E8621A] text-white text-[14px]
                           font-[600] hover:bg-[#C9521A] transition-colors disabled:opacity-60"
              >
                {pending ? "Sending…" : "Send Offer"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Message modal ────────────────────────────────────────────────────────────

function MessageModal({
  listingId,
  onClose,
}: {
  listingId: string;
  onClose: () => void;
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!body.trim()) {
      setError("Message cannot be empty.");
      return;
    }
    startTransition(async () => {
      try {
        await startMessageThread(listingId, body.trim());
        setSuccess(true);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-[#FAFAF8] rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
        {success ? (
          <div className="text-center py-4">
            <p className="text-[18px] font-[700] text-[#0D3B2E]" style={{ fontFamily: "'Fraunces', serif" }}>
              Message sent!
            </p>
            <p className="text-[13px] text-[#8A8A82] mt-1">The seller will reply soon.</p>
            <button
              onClick={onClose}
              className="mt-5 w-full h-11 rounded-[10px] bg-[#0D3B2E] text-[#FAFAF8] text-[14px] font-[600]"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
                Message Seller
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EFEFEB] text-[#8A8A82] text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="block text-[13px] font-[600] text-[#1A1A18] mb-1.5">
                Your message
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={2000}
                className="w-full rounded-[10px] border border-[#E2E2DC] bg-[#EFEFEB]
                           p-3 text-[14px] text-[#1A1A18] resize-none focus:outline-none
                           focus:border-[#E8621A] mb-4"
                placeholder="Hi, is this still available?"
                autoFocus
                disabled={pending}
              />

              {error && <p className="text-[13px] text-[#DC2626] mb-3">{error}</p>}

              <button
                type="submit"
                disabled={pending}
                className="w-full h-11 rounded-[10px] border border-[#E2E2DC] bg-white
                           text-[#1A1A18] text-[14px] font-[600] hover:bg-[#F2F2EF]
                           transition-colors disabled:opacity-60"
              >
                {pending ? "Sending…" : "Send Message"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Report modal ─────────────────────────────────────────────────────────────

function ReportModal({
  listingId,
  onClose,
}: {
  listingId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!reason.trim()) {
      setError("Please describe the reason for reporting.");
      return;
    }
    startTransition(async () => {
      try {
        await reportListing(listingId, reason.trim());
        setSuccess(true);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-[#FAFAF8] rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
        {success ? (
          <div className="text-center py-4">
            <p className="text-[18px] font-[700] text-[#0D3B2E]" style={{ fontFamily: "'Fraunces', serif" }}>
              Report submitted
            </p>
            <p className="text-[13px] text-[#8A8A82] mt-1">Thank you. Our team will review it.</p>
            <button onClick={onClose} className="mt-5 w-full h-11 rounded-[10px] bg-[#0D3B2E] text-[#FAFAF8] text-[14px] font-[600]">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
                Report Listing
              </h2>
              <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EFEFEB] text-[#8A8A82] text-xl leading-none">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="block text-[13px] font-[600] text-[#1A1A18] mb-1.5">
                Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full rounded-[10px] border border-[#E2E2DC] bg-[#EFEFEB] p-3 text-[14px] text-[#1A1A18] resize-none focus:outline-none focus:border-[#E8621A] mb-4"
                placeholder="Describe why this listing should be removed…"
                autoFocus
                disabled={pending}
              />
              {error && <p className="text-[13px] text-[#DC2626] mb-3">{error}</p>}
              <button
                type="submit"
                disabled={pending}
                className="w-full h-11 rounded-[10px] bg-[#DC2626] text-white text-[14px] font-[600] hover:bg-[#B91C1C] transition-colors disabled:opacity-60"
              >
                {pending ? "Submitting…" : "Submit Report"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Review modal ─────────────────────────────────────────────────────────────

function ReviewModal({
  sellerId,
  onClose,
}: {
  sellerId: string;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }
    startTransition(async () => {
      try {
        await leaveReview(sellerId, rating, comment.trim() || undefined);
        setSuccess(true);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-[#FAFAF8] rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
        {success ? (
          <div className="text-center py-4">
            <p className="text-[18px] font-[700] text-[#0D3B2E]" style={{ fontFamily: "'Fraunces', serif" }}>
              Review submitted!
            </p>
            <p className="text-[13px] text-[#8A8A82] mt-1">Thank you for your feedback.</p>
            <button onClick={onClose} className="mt-5 w-full h-11 rounded-[10px] bg-[#0D3B2E] text-[#FAFAF8] text-[14px] font-[600]">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
                Rate Seller
              </h2>
              <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EFEFEB] text-[#8A8A82] text-xl leading-none">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Star picker */}
              <label className="block text-[13px] font-[600] text-[#1A1A18] mb-2">
                Rating
              </label>
              <div className="flex gap-1 mb-4" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHover(s)}
                    className="text-[28px] leading-none transition-colors"
                    style={{ color: s <= (hover || rating) ? "#F4A61D" : "#E2E2DC" }}
                    aria-label={`${s} star${s > 1 ? "s" : ""}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <label className="block text-[13px] font-[600] text-[#1A1A18] mb-1.5">
                Comment <span className="text-[#8A8A82] font-[400]">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full rounded-[10px] border border-[#E2E2DC] bg-[#EFEFEB] p-3 text-[14px] text-[#1A1A18] resize-none focus:outline-none focus:border-[#E8621A] mb-4"
                placeholder="Share your experience with this seller…"
                disabled={pending}
              />
              {error && <p className="text-[13px] text-[#DC2626] mb-3">{error}</p>}
              <button
                type="submit"
                disabled={pending}
                className="w-full h-11 rounded-[10px] bg-[#E8621A] text-white text-[14px] font-[600] hover:bg-[#C9521A] transition-colors disabled:opacity-60"
              >
                {pending ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ActionButtons({
  listingId,
  listingPrice,
  sellerId,
  savedInitial,
}: {
  listingId: string;
  listingPrice: number;
  sellerId: string;
  savedInitial: boolean;
}) {
  const [modal, setModal] = useState<"offer" | "message" | "report" | "review" | null>(null);
  const [saved, setSaved] = useState(savedInitial);
  const [savePending, startSaveTransition] = useTransition();

  function handleSaveToggle() {
    const next = !saved;
    setSaved(next);
    startSaveTransition(async () => {
      try {
        await toggleSave(listingId, next);
      } catch {
        setSaved(!next);
      }
    });
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setModal("offer")}
          className="w-full h-11 rounded-[10px] bg-[#E8621A] text-white text-[15px]
                     font-[600] hover:bg-[#C9521A] transition-colors"
        >
          Make an Offer
        </button>
        <button
          onClick={() => setModal("message")}
          className="w-full h-11 rounded-[10px] border border-[#E2E2DC] bg-white
                     text-[#1A1A18] text-[15px] font-[600] hover:bg-[#F2F2EF]
                     transition-colors"
        >
          Message Seller
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleSaveToggle}
            disabled={savePending}
            className={`flex-1 h-10 rounded-[10px] border text-[14px] font-[600] transition-colors disabled:opacity-60
              ${saved
                ? "border-[#E8621A] bg-[#FFF3ED] text-[#E8621A] hover:bg-[#FFE8D9]"
                : "border-[#E2E2DC] bg-white text-[#4A4A45] hover:bg-[#F2F2EF]"
              }`}
          >
            {saved ? "✦ Saved" : "Save"}
          </button>
          <button
            onClick={() => setModal("review")}
            className="flex-1 h-10 rounded-[10px] border border-[#E2E2DC] bg-white
                       text-[14px] font-[600] text-[#4A4A45] hover:bg-[#F2F2EF] transition-colors"
          >
            Rate Seller
          </button>
        </div>
      </div>

      <button
        onClick={() => setModal("report")}
        className="mt-3 w-full text-center text-[12px] text-[#8A8A82] hover:text-[#DC2626] transition-colors"
      >
        Report this listing
      </button>

      {modal === "offer" && (
        <OfferModal
          listingId={listingId}
          listingPrice={listingPrice}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "message" && (
        <MessageModal
          listingId={listingId}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "report" && (
        <ReportModal
          listingId={listingId}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "review" && (
        <ReviewModal
          sellerId={sellerId}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

