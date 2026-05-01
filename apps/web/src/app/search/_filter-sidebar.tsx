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
    <aside className="w-full lg:w-[240px] lg:shrink-0">
      <div className="rounded-[14px] border border-[#E2E2DC] bg-white p-4 shadow-[0_1px_3px_rgba(26,26,24,0.06)] sm:p-5 lg:sticky lg:top-6">

        {/* Branding */}
        <Link href="/" className="mb-4 hidden items-center justify-center group lg:flex">
          <Image
            src="/favicon.png"
            alt="Sellspace"
            width={32}
            height={32}
            unoptimized
            className="rounded-lg group-hover:opacity-80 transition-opacity"
          />
        </Link>
        <div className="mb-4 hidden h-px bg-[#E2E2DC] lg:block" />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {/* Sort */}
          <div>
            <label className="mb-2 block text-[11px] font-[700] uppercase tracking-wide text-[#8A8A82]">
              Sort by
            </label>
            <select
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
              className="h-9 w-full rounded-[8px] border border-[#E2E2DC] bg-[#F2F2EF] px-2 text-[13px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="mb-2 block text-[11px] font-[700] uppercase tracking-wide text-[#8A8A82]">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="e.g. Harare"
              className="h-9 w-full rounded-[8px] border border-[#E2E2DC] bg-[#F2F2EF] px-3 text-[13px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A]"
            />
          </div>

          {/* Condition */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-2 block text-[11px] font-[700] uppercase tracking-wide text-[#8A8A82]">
              Condition
            </label>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-1">
              {CONDITION_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => update("condition", condition === o.value ? "" : o.value)}
                  className={`rounded-[8px] border px-3 py-2 text-left text-[13px] font-[500] leading-[1.25] transition-colors
                    ${condition === o.value
                      ? "border-[#0D3B2E] bg-[#0D3B2E] text-[#FAFAF8]"
                      : "border-[#E2E2DC] bg-white text-[#4A4A45] hover:bg-[#F2F2EF]"
                    }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-2 block text-[11px] font-[700] uppercase tracking-wide text-[#8A8A82]">
              Price (USD)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={minPrice}
                onChange={(e) => update("minPrice", e.target.value)}
                placeholder="Min"
                className="h-9 w-full rounded-[8px] border border-[#E2E2DC] bg-[#F2F2EF] px-3 text-[13px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A]"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={maxPrice}
                onChange={(e) => update("maxPrice", e.target.value)}
                placeholder="Max"
                className="h-9 w-full rounded-[8px] border border-[#E2E2DC] bg-[#F2F2EF] px-3 text-[13px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A]"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
