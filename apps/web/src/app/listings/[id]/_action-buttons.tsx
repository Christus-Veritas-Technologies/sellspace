"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthDialog } from "@/contexts/auth-dialog-context";
import { useSession } from "@/lib/use-session";
import { deleteListing, leaveReview, makeOffer, reportListing, startMessageThread, toggleSave, updateListing } from "./_actions";

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

// ─── Edit modal ───────────────────────────────────────────────────────────────

const CATEGORIES_EDIT = [
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "PHONES_TABLETS", label: "Phones & Tablets" },
  { value: "VEHICLES", label: "Vehicles" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "CLOTHING", label: "Clothing" },
  { value: "SPORTS_OUTDOORS", label: "Sports & Outdoors" },
  { value: "HOME_GARDEN", label: "Home & Garden" },
  { value: "BOOKS_EDUCATION", label: "Books & Education" },
  { value: "FOOD_BEVERAGES", label: "Food & Beverages" },
  { value: "SERVICES", label: "Services" },
  { value: "OTHER", label: "Other" },
];

const CONDITIONS_EDIT = [
  { value: "BRAND_NEW", label: "Brand New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "FOR_PARTS", label: "For Parts / Not Working" },
];

const iCls =
  "w-full h-10 px-3 rounded-[8px] border border-[#E2E2DC] bg-[#F2F2EF] text-[13px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A] disabled:opacity-60";

function EditModal({
  listingId,
  initial,
  onClose,
}: {
  listingId: string;
  initial: {
    title: string;
    description: string;
    price: number; // cents
    condition: string;
    category: string;
    city?: string;
    imageUrls: string[];
  };
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [price, setPrice] = useState(String(initial.price / 100));
  const [condition, setCondition] = useState(initial.condition);
  const [category, setCategory] = useState(initial.category);
  const [city, setCity] = useState(initial.city ?? "");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>(initial.imageUrls);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function addImage() {
    const url = imageUrlInput.trim();
    if (!url) return;
    try { new URL(url); } catch { setError("Invalid URL."); return; }
    if (imageUrls.length >= 10) { setError("Max 10 images."); return; }
    setImageUrls((p) => [...p, url]);
    setImageUrlInput("");
    setError("");
  }

  function removeImage(i: number) {
    setImageUrls((p) => p.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cents = Math.round(parseFloat(price) * 100);
    if (!title.trim() || title.trim().length < 3) { setError("Title must be at least 3 characters."); return; }
    if (description.trim().length < 10) { setError("Description must be at least 10 characters."); return; }
    if (!price || isNaN(cents) || cents < 1) { setError("Enter a valid price."); return; }
    if (imageUrls.length < 1) { setError("Add at least one image URL."); return; }

    startTransition(async () => {
      try {
        await updateListing(listingId, {
          title: title.trim(),
          description: description.trim(),
          price: cents,
          condition,
          category,
          city: city.trim() || undefined,
          imageUrls,
        });
        onClose();
        window.location.reload();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full sm:max-w-lg bg-[#FAFAF8] rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E2E2DC]">
          <h2 className="text-[18px] font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
            Edit Listing
          </h2>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EFEFEB] text-[#8A8A82] text-xl leading-none">×</button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12px] font-[600] text-[#1A1A18] mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} disabled={pending} className={iCls} />
          </div>
          <div>
            <label className="block text-[12px] font-[600] text-[#1A1A18] mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={5000} disabled={pending}
              className="w-full px-3 py-2 rounded-[8px] border border-[#E2E2DC] bg-[#F2F2EF] text-[13px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A] resize-y disabled:opacity-60" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-[600] text-[#1A1A18] mb-1">Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A82] text-[13px]">$</span>
                <input type="number" min="0.01" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} disabled={pending}
                  className="w-full h-10 pl-7 pr-3 rounded-[8px] border border-[#E2E2DC] bg-[#F2F2EF] text-[13px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A] disabled:opacity-60" />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-[600] text-[#1A1A18] mb-1">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} disabled={pending} className={iCls} placeholder="e.g. Harare" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-[600] text-[#1A1A18] mb-1">Condition</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} disabled={pending} className={iCls}>
                {CONDITIONS_EDIT.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-[600] text-[#1A1A18] mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={pending} className={iCls}>
                {CATEGORIES_EDIT.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          {/* Images */}
          <div>
            <label className="block text-[12px] font-[600] text-[#1A1A18] mb-1">Images (min 1, max 10)</label>
            <div className="flex gap-2 mb-2">
              <input type="url" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); }}}
                placeholder="https://example.com/image.jpg" disabled={pending}
                className="flex-1 h-10 px-3 rounded-[8px] border border-[#E2E2DC] bg-[#F2F2EF] text-[13px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A] disabled:opacity-60" />
              <button type="button" onClick={addImage} disabled={pending}
                className="h-10 px-3 rounded-[8px] border border-[#E2E2DC] bg-white text-[13px] font-[600] text-[#1A1A18] hover:bg-[#F2F2EF] transition-colors disabled:opacity-60">
                Add
              </button>
            </div>
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-[6px] overflow-hidden border border-[#E2E2DC] group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute inset-0 w-full h-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-lg"
                      aria-label="Remove">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-[12px] text-[#DC2626]">{error}</p>}
        </form>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-[#E2E2DC]">
          <button type="submit" form="" onClick={handleSubmit} disabled={pending}
            className="w-full h-11 rounded-[10px] bg-[#0D3B2E] text-[#FAFAF8] text-[14px] font-[600] hover:bg-[#0a2e23] transition-colors disabled:opacity-60">
            {pending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Owner buttons ────────────────────────────────────────────────────────────

export function OwnerButtons({
  listingId,
  initial,
}: {
  listingId: string;
  initial: {
    title: string;
    description: string;
    price: number;
    condition: string;
    category: string;
    city?: string;
    imageUrls: string[];
  };
}) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete() {
    setError("");
    startDeleteTransition(async () => {
      try {
        await deleteListing(listingId);
        router.push("/");
      } catch (err) {
        setError((err as Error).message);
        setConfirmDelete(false);
      }
    });
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link
          href={`/listings/${listingId}/edit`}
          className="w-full h-10 rounded-[10px] border border-[#0D3B2E] bg-white text-[#0D3B2E]
                     text-[14px] font-[600] flex items-center justify-center hover:bg-[#0D3B2E] hover:text-white transition-colors"
        >
          Edit Listing
        </Link>
        <button
          onClick={() => setConfirmDelete(true)}
          className="w-full h-10 rounded-[10px] border border-[#E2E2DC] bg-white text-[#DC2626]
                     text-[14px] font-[600] hover:bg-[#FEE2E2] transition-colors"
        >
          Delete Listing
        </button>
        {error && <p className="text-[12px] text-[#DC2626]">{error}</p>}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-[#FAFAF8] rounded-[16px] p-6 shadow-xl">
            <h2 className="text-[18px] font-[700] text-[#1A1A18] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>Delete listing?</h2>
            <p className="text-[13px] text-[#8A8A82] mb-5">This action cannot be undone. The listing will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} disabled={deleting}
                className="flex-1 h-11 rounded-[10px] border border-[#E2E2DC] bg-white text-[#1A1A18] text-[14px] font-[600] hover:bg-[#F2F2EF] transition-colors disabled:opacity-60">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 h-11 rounded-[10px] bg-[#DC2626] text-white text-[14px] font-[600] hover:bg-[#B91C1C] transition-colors disabled:opacity-60">
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
  const { isAuthenticated } = useSession();
  const { openAuthDialog } = useAuthDialog();

  function requireAuth(action: () => void) {
    if (!isAuthenticated) {
      openAuthDialog();
      return;
    }
    action();
  }

  function handleSaveToggle() {
    requireAuth(() => {
      const next = !saved;
      setSaved(next);
      startSaveTransition(async () => {
        try {
          await toggleSave(listingId, next);
        } catch {
          setSaved(!next);
        }
      });
    });
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => requireAuth(() => setModal("offer"))}
          className="w-full h-11 rounded-[10px] bg-[#E8621A] text-white text-[15px]
                     font-[600] hover:bg-[#C9521A] transition-colors"
        >
          Make an Offer
        </button>
        <button
          onClick={() => requireAuth(() => setModal("message"))}
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
            onClick={() => requireAuth(() => setModal("review"))}
            className="flex-1 h-10 rounded-[10px] border border-[#E2E2DC] bg-white
                       text-[14px] font-[600] text-[#4A4A45] hover:bg-[#F2F2EF] transition-colors"
          >
            Rate Seller
          </button>
        </div>
      </div>

      <button
        onClick={() => requireAuth(() => setModal("report"))}
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

