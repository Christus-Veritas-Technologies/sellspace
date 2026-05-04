"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";

import { ListingCard } from "@sellspace/ui/components/listing-card";

import { getPrimaryListingImage } from "@/lib/listing-images";
import { browserGetListings } from "@/lib/listings";
import type { Category, Condition } from "@/lib/listings";

const PAGE_LIMIT = 15;

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-[10px] overflow-hidden border border-[#E2E2DC] bg-white animate-pulse">
      <div className="bg-[#E2E2DC] aspect-[4/3] w-full" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-[#E2E2DC] rounded w-1/3" />
        <div className="h-4 bg-[#E2E2DC] rounded w-4/5" />
        <div className="h-4 bg-[#E2E2DC] rounded w-2/3" />
        <div className="h-5 bg-[#E2E2DC] rounded w-1/3 mt-1" />
      </div>
    </div>
  );
}

// ─── Search results ───────────────────────────────────────────────────────────

export function SearchResults() {
  const params = useSearchParams();

  const q = params.get("q") ?? undefined;
  const category = (params.get("category") ?? undefined) as Category | undefined;
  const condition = (params.get("condition") ?? undefined) as Condition | undefined;
  const sort = (params.get("sort") ?? "newest") as "newest" | "oldest" | "price_asc" | "price_desc";
  const city = params.get("city") ?? undefined;
  const minDollars = params.get("minPrice") ?? undefined;
  const maxDollars = params.get("maxPrice") ?? undefined;
  const minPrice = minDollars ? Math.round(parseFloat(minDollars) * 100) : undefined;
  const maxPrice = maxDollars ? Math.round(parseFloat(maxDollars) * 100) : undefined;

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mobileQ, setMobileQ] = useState(q ?? "");
  useEffect(() => { setMobileQ(q ?? ""); }, [q]);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["search", { q, category, condition, sort, city, minPrice, maxPrice }],
    queryFn: ({ pageParam }) =>
      browserGetListings({ q, category, condition, sort, city, minPrice, maxPrice, page: pageParam as number, limit: PAGE_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    staleTime: 30_000,
  });

  // Sentinel-based infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const listings = data?.pages.flatMap((p) => p.listings) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <>
      {/* Heading */}
      <div className="mb-6 sm:mb-7">
        <h1
          className="mb-1 text-[24px] font-[700] text-[#1A1A18] sm:text-[28px]"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {q ? `Results for "${q}"` : "Browse listings"}
        </h1>
        <p className="text-[13px] text-[#8A8A82]">
          {isLoading
            ? "Loading…"
            : total > 0
              ? `${total} listing${total === 1 ? "" : "s"} found`
              : "No listings found"}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const next = new URLSearchParams(params.toString());
            if (mobileQ.trim()) next.set("q", mobileQ.trim()); else next.delete("q");
            next.delete("page");
            startTransition(() => { router.push(`/search?${next.toString()}`); });
          }}
          className="mt-3 lg:hidden"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={mobileQ}
              onChange={(e) => setMobileQ(e.target.value)}
              placeholder="Search listings\u2026"
              className="h-9 flex-1 rounded-[8px] border border-[#E2E2DC] bg-[#F2F2EF] px-3 text-[13px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A]"
            />
            <button
              type="submit"
              disabled={isPending}
              className="h-9 px-4 rounded-[8px] bg-[#0D3B2E] text-[#FAFAF8] text-[13px] font-[600] disabled:opacity-60 flex items-center gap-1.5"
            >
              {isPending && (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-[#FAFAF8] border-t-transparent animate-spin" />
              )}
              {isPending ? "Searching\u2026" : "Search"}
            </button>
          </div>
        </form>      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] sm:gap-4">
          {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] sm:gap-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                image={getPrimaryListingImage(listing.images)}
                condition={listing.condition}
                category={listing.category}
                title={listing.title}
                sellerName={listing.seller.displayName ?? "Seller"}
                city={listing.seller.city ?? listing.city ?? "Zimbabwe"}
                price={listing.price}
                href={`/listings/${listing.id}`}
              />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="mt-8 flex h-12 items-center justify-center">
            {isFetchingNextPage && (
              <div className="h-6 w-6 rounded-full border-2 border-[#E8621A] border-t-transparent animate-spin" />
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center sm:py-24">
          <p className="text-[17px] font-[600] text-[#1A1A18] mb-2">Nothing found</p>
          <p className="text-[14px] text-[#8A8A82] mb-5">Try adjusting your filters or search term.</p>
          <Link
            href="/search"
            className="px-5 py-2.5 rounded-[10px] bg-[#0D3B2E] text-[#FAFAF8] text-[14px] font-[600] hover:bg-[#0A2E24] transition-colors"
          >
            Clear filters
          </Link>
        </div>
      )}
    </>
  );
}
