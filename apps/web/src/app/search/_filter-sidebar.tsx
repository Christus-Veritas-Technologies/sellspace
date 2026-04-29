"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

const CONDITION_OPTIONS = [
  { value: "BRAND_NEW", label: "Brand New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "FOR_PARTS", label: "For Parts" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "oldest", label: "Oldest first" },
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function FilterSidebar() {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const condition = params.get("condition") ?? "";
  const sort = params.get("sort") ?? "newest";
  const minPrice = params.get("minPrice") ?? "";
  const maxPrice = params.get("maxPrice") ?? "";
  const city = params.get("city") ?? "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete("page");
    startTransition(() => {
      router.push(`/search?${next.toString()}`);
    });
  }

  function clearAll() {
    const next = new URLSearchParams();
    const q = params.get("q");
    if (q) next.set("q", q);
    startTransition(() => {
      router.push(`/search?${next.toString()}`);
    });
  }

  const hasActiveFilters = !!(condition || minPrice || maxPrice || city || (sort && sort !== "newest"));

  return (
    <aside className="w-[220px] shrink-0">
      <div className="bg-white rounded-[14px] border border-[#E2E2DC] p-5 shadow-[0_1px_3px_rgba(26,26,24,0.06)] sticky top-6">

        {/* Branding */}
        <Link href="/" className="flex items-center justify-center mb-4 group">
          <Image
            src="/favicon.png"
            alt="Sellspace"
            width={32}
            height={32}
            className="rounded-lg group-hover:opacity-80 transition-opacity"
          />
        </Link>
        <div className="h-px bg-[#E2E2DC] mb-4" />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
            Filters
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-[12px] text-[#E8621A] hover:underline font-[500]"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="mb-5">
          <label className="block text-[11px] font-[700] text-[#8A8A82] uppercase tracking-wide mb-2">
            Sort by
          </label>
          <select
            value={sort}
            onChange={(e) => update("sort", e.target.value)}
            className="w-full h-9 rounded-[8px] border border-[#E2E2DC] bg-[#F2F2EF] text-[13px] text-[#1A1A18] px-2 focus:outline-none focus:border-[#E8621A]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Condition */}
        <div className="mb-5">
          <label className="block text-[11px] font-[700] text-[#8A8A82] uppercase tracking-wide mb-2">
            Condition
          </label>
          <div className="flex flex-col gap-1.5">
            {CONDITION_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => update("condition", condition === o.value ? "" : o.value)}
                className={`text-left px-3 py-1.5 rounded-[8px] text-[13px] font-[500] border transition-colors
                  ${condition === o.value
                    ? "bg-[#0D3B2E] text-[#FAFAF8] border-[#0D3B2E]"
                    : "bg-white text-[#4A4A45] border-[#E2E2DC] hover:bg-[#F2F2EF]"
                  }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div className="mb-5">
          <label className="block text-[11px] font-[700] text-[#8A8A82] uppercase tracking-wide mb-2">
            Price (USD)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={minPrice}
              onChange={(e) => update("minPrice", e.target.value)}
              placeholder="Min"
              className="w-full h-9 px-3 rounded-[8px] border border-[#E2E2DC] bg-[#F2F2EF] text-[13px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A]"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
              placeholder="Max"
              className="w-full h-9 px-3 rounded-[8px] border border-[#E2E2DC] bg-[#F2F2EF] text-[13px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A]"
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-[11px] font-[700] text-[#8A8A82] uppercase tracking-wide mb-2">
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="e.g. Harare"
            className="w-full h-9 px-3 rounded-[8px] border border-[#E2E2DC] bg-[#F2F2EF] text-[13px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A]"
          />
        </div>
      </div>
    </aside>
  );
}
