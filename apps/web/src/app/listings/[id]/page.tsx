import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { env } from "@sellspace/env/web";
import { DEFAULT_LISTING_IMAGE_URL } from "@/lib/listing-images";
import { listingsClient } from "@/lib/listings";
import { ListingMapClient } from "@/components/listing-map-client";

import { ActionButtons, OwnerButtons } from "./_action-buttons";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CONDITION_CONFIG = {
  BRAND_NEW: { label: "Brand New", className: "bg-[#0D3B2E] text-[#FAFAF8]" },
  LIKE_NEW: { label: "Like New", className: "bg-[#E8621A] text-white" },
  GOOD: { label: "Good", className: "bg-[#F4A61D] text-[#1A1A18]" },
  FAIR: {
    label: "Fair",
    className: "bg-[#EFEFEB] text-[#4A4A45] border border-[#C8C8C0]",
  },
  FOR_PARTS: { label: "For Parts", className: "bg-[#FEE2E2] text-[#DC2626]" },
} as const;

const CATEGORY_LABELS: Record<string, string> = {
  ELECTRONICS: "Electronics",
  PHONES_TABLETS: "Phones & Tablets",
  VEHICLES: "Vehicles",
  FURNITURE: "Furniture",
  CLOTHING: "Clothing",
  SPORTS_OUTDOORS: "Sports & Outdoors",
  HOME_GARDEN: "Home & Garden",
  BOOKS_EDUCATION: "Books & Education",
  FOOD_BEVERAGES: "Food & Beverages",
  SERVICES: "Services",
  OTHER: "Other",
};

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let listing;
  try {
    listing = await listingsClient.getListing(id);
  } catch {
    notFound();
  }

  // Check saved state + ownership for the current user
  let savedInitial = false;
  let isOwner = false;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ss_access_token")?.value;
    if (token) {
      const BASE = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");
      const [savedRes, meRes] = await Promise.all([
        fetch(`${BASE}/api/saved`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
        fetch(`${BASE}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
      ]);
      if (savedRes.ok) {
        const savedData = (await savedRes.json()) as { saved: { listingId: string }[] };
        savedInitial = savedData.saved.some((s) => s.listingId === listing.id);
      }
      if (meRes.ok) {
        const meData = (await meRes.json()) as { user: { id: string } };
        isOwner = meData.user.id === listing.seller.id;
      }
    }
  } catch {
    // Not logged in or fetch failed — defaults stay false
  }

  const cond = CONDITION_CONFIG[listing.condition];
  const categoryLabel = CATEGORY_LABELS[listing.category] ?? listing.category;
  const mainImage = listing.images[0]?.url ?? DEFAULT_LISTING_IMAGE_URL;
  const extraImages = listing.images.slice(1);
  const memberYear = listing.seller.createdAt
    ? new Date(listing.seller.createdAt).getFullYear()
    : null;

  return (
    <main className="bg-[#F2F2EF] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#4A4A45]
                     hover:text-[#1A1A18] transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to listings
        </Link>

        {/* Two-column grid */}
        <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-10 space-y-8 lg:space-y-0">

          {/* ── Left: images ────────────────────────────────────────── */}
          <div>
            <div className="aspect-[16/9] rounded-[10px] overflow-hidden bg-[#EFEFEB]
                            border border-[#E2E2DC]">
              <img
                src={mainImage}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail strip */}
            {extraImages.length > 0 && (
              <div className="flex gap-2 mt-3">
                {listing.images.map((img) => (
                  <div
                    key={img.id}
                    className="w-16 h-16 rounded-[6px] overflow-hidden border border-[#E2E2DC] shrink-0"
                  >
                    <img
                      src={img.url}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Description (below images on all sizes) */}
            <div className="mt-8">
              <h2
                className="text-[20px] font-[600] text-[#1A1A18] mb-3"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Description
              </h2>
              <p className="text-[14px] text-[#4A4A45] leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            {/* Location map */}
            {listing.latitude != null && listing.longitude != null && (
              <div className="mt-8">
                <h2
                  className="text-[20px] font-[600] text-[#1A1A18] mb-3"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  Location
                </h2>
                <ListingMapClient
                  lat={listing.latitude}
                  lng={listing.longitude}
                  label={listing.title}
                />
              </div>
            )}
          </div>

          {/* ── Right: detail card ──────────────────────────────────── */}
          <div className="lg:sticky lg:top-6 self-start">
            <div className="bg-white rounded-[14px] border border-[#E2E2DC] p-6
                            shadow-[0_1px_3px_rgba(26,26,24,0.06)]">

              {/* Badges row */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`text-[11px] font-[600] px-2.5 py-1 rounded-[6px] leading-none ${cond.className}`}
                >
                  {cond.label}
                </span>
                <span className="text-[11px] font-[600] uppercase tracking-wide
                                 px-2.5 py-1 rounded-[6px] bg-[#EFEFEB] text-[#4A4A45]">
                  {categoryLabel}
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-[28px] font-[700] leading-[1.15] text-[#1A1A18] mb-3"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                {listing.title}
              </h1>

              {/* Price */}
              <p className="text-[24px] font-[700] text-[#E8621A] mb-5">
                ${(listing.price / 100).toFixed(2)}
              </p>

              {/* Seller row */}
              <div className="flex items-center gap-3 pb-5 border-b border-[#E2E2DC]">
                <div
                  className="w-10 h-10 rounded-full bg-[#0D3B2E] flex items-center
                             justify-center shrink-0"
                >
                  <span className="text-[13px] font-[700] text-[#FAFAF8]">
                    {initials(listing.seller.displayName)}
                  </span>
                </div>
                <div>
                  <p className="text-[14px] font-[600] text-[#1A1A18]">
                    {listing.seller.displayName ?? "Seller"}
                  </p>
                  <p className="text-[12px] text-[#8A8A82]">
                    {listing.seller.city ?? listing.city ?? "Zimbabwe"}
                    {memberYear ? ` · Member since ${memberYear}` : ""}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-5 pb-5 border-b border-[#E2E2DC]">
                {isOwner ? (
                  <OwnerButtons
                    listingId={listing.id}
                    initial={{
                      title: listing.title,
                      description: listing.description,
                      price: listing.price,
                      condition: listing.condition,
                      category: listing.category,
                      city: listing.seller.city ?? listing.city ?? undefined,
                      latitude: listing.latitude ?? undefined,
                      longitude: listing.longitude ?? undefined,
                      imageUrls: listing.images.map((img: { url: string }) => img.url),
                    }}
                  />
                ) : (
                  <ActionButtons
                    listingId={listing.id}
                    listingPrice={listing.price}
                    sellerId={listing.seller.id}
                    savedInitial={savedInitial}
                  />
                )}
              </div>

              {/* Details table */}
              <div className="pt-5 space-y-3">
                {[
                  ["Condition", cond.label],
                  ["Category", categoryLabel],
                  ["Location", listing.seller.city ?? listing.city ?? "Zimbabwe"],
                  ["Views", String(listing.views ?? 0)],
                  ["Listed", formatDate(listing.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-[12px] font-[600] text-[#8A8A82] uppercase tracking-wide">
                      {label}
                    </span>
                    <span className="text-[13px] text-[#1A1A18]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
