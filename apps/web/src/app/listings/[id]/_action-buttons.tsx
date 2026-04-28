"use client";

// ─── Action buttons (need client for onClick) ─────────────────────────────────

export function ActionButtons() {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => alert("Coming soon")}
        className="w-full h-11 rounded-[10px] bg-[#E8621A] text-white text-[15px]
                   font-[600] hover:bg-[#C9521A] transition-colors"
      >
        Make an Offer
      </button>
      <button
        onClick={() => alert("Coming soon")}
        className="w-full h-11 rounded-[10px] border border-[#E2E2DC] bg-white
                   text-[#1A1A18] text-[15px] font-[600] hover:bg-[#F2F2EF]
                   transition-colors"
      >
        Message Seller
      </button>
    </div>
  );
}
