import { Suspense } from "react";
import Link from "next/link";

import { ListingCard } from "@sellspace/ui/components/listing-card";

import { getPrimaryListingImage } from "@/lib/listing-images";
import { listingsClient } from "@/lib/listings";
import type { Category, Condition } from "@/lib/listings";

import { FilterSidebar } from "./_filter-sidebar";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  function str(key: string) {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  }

  const q = str("q");
  const category = str("category") as Category | undefined;
  const condition = str("condition") as Condition | undefined;
  const sort = str("sort") as "newest" | "oldest" | "price_asc" | "price_desc" | undefined;
  const city = str("city");
  const minDollars = str("minPrice");
  const maxDollars = str("maxPrice");
  const minPrice = minDollars ? Math.round(parseFloat(minDollars) * 100) : undefined;
  const maxPrice = maxDollars ? Math.round(parseFloat(maxDollars) * 100) : undefined;

  let feed;
  try {
    feed = await listingsClient.getListings({
      q,
      category,
      condition,
      sort: sort ?? "newest",
      minPrice,
      maxPrice,
      city,
      limit: 48,
    });
  } catch {
    feed = null;
  }

  const listings = feed?.listings ?? [];
  const total = feed?.total ?? 0;

  return (
    <main className="bg-[#F2F2EF] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-6 sm:px-6 sm:py-8 md:px-10">

        {/* Heading row */}
        <div className="mb-6 sm:mb-7">
          <h1
            className="mb-1 text-[24px] font-[700] text-[#1A1A18] sm:text-[28px]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {q ? `Results for "${q}"` : "Browse listings"}
          </h1>
          <p className="text-[13px] text-[#8A8A82]">
            {total > 0 ? `${total} listing${total === 1 ? "" : "s"} found` : "No listings found"}
          </p>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
          {/* Filter sidebar */}
          <Suspense>
            <FilterSidebar />
          </Suspense>

          {/* Results grid */}
          <div className="flex-1 min-w-0">
            {listings.length > 0 ? (
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
          </div>
        </div>

      </div>
    </main>
  );
}
