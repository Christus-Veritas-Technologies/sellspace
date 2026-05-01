import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { Calendar01Icon, Home13Icon, StarIcon, ShoppingBag01Icon } from "hugeicons-react";

import { env } from "@sellspace/env/web";
import { ListingCard } from "@sellspace/ui/components/listing-card";
import { Avatar } from "@/components/avatar";
import { getPrimaryListingImage } from "@/lib/listing-images";
import { formatMembershipDuration } from "@/lib/member-duration";
import { PrivateProfile } from "../_private-profile";

const BASE = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Pass auth token if available so the owner can always view their own profile
  const cookieStore = await cookies();
  const token = cookieStore.get("ss_access_token")?.value;

  const res = await fetch(`${BASE}/api/users/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });

  if (res.status === 404) notFound();

  if (res.status === 403) {
    const data = (await res.json()) as { isPrivate: boolean };
    if (data.isPrivate) {
      return (
        <main className="bg-[#F2F2EF] min-h-screen">
          <div className="max-w-[720px] mx-auto px-4">
            <PrivateProfile />
          </div>
        </main>
      );
    }
    notFound();
  }

  if (!res.ok) notFound();

  const data = (await res.json()) as {
    user: {
      id: string;
      displayName: string;
      avatarUrl: string | null;
      city: string | null;
      isPrivate: boolean;
      createdAt: string;
    };
    listings: {
      id: string;
      title: string;
      price: number;
      condition: string;
      category: string;
      city: string | null;
      images: { url: string }[];
    }[];
    listingCount: number;
    reviews: {
      id: string;
      rating: number;
      comment: string | null;
      createdAt: string;
      reviewer: { id: string; displayName: string | null; avatarUrl: string | null };
    }[];
    averageRating: number | null;
    reviewCount: number;
  };

  const { user, listings, listingCount, reviews, reviewCount, averageRating } = data;
  const memberDuration = formatMembershipDuration(user.createdAt);

  return (
    <main className="bg-[#F2F2EF] min-h-screen">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Identity card */}
        <div className="bg-white rounded-[14px] border border-[#E2E2DC] shadow-[0_1px_3px_rgba(26,26,24,0.06)]">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <Avatar name={user.displayName} avatarUrl={user.avatarUrl} size={96} className="border-4 border-[#E2E2DC]" />
              <div className="flex-1 min-w-0">
                <h1
                  className="text-2xl sm:text-3xl font-[700] text-[#1A1A18] leading-tight"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {user.displayName}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  {user.city && (
                    <span className="flex items-center gap-1 text-[13px] text-[#8A8A82]">
                      <Home13Icon size={13} />
                      {user.city}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[13px] text-[#8A8A82]">
                    <Calendar01Icon size={13} />
                    Member for {memberDuration}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#E2E2DC] border-t border-[#E2E2DC]">
            <div className="py-4 text-center">
              <div className="text-2xl font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
                {listingCount}
              </div>
              <p className="text-[12px] text-[#8A8A82] mt-0.5">
                {listingCount === 1 ? "Active Listing" : "Active Listings"}
              </p>
            </div>
            <div className="py-4 text-center">
              {reviewCount > 0 ? (
                <>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
                      {averageRating?.toFixed(1)}
                    </span>
                    <StarIcon size={16} color="#F4A61D" fill="#F4A61D" />
                  </div>
                  <p className="text-[12px] text-[#8A8A82] mt-0.5">{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-[700] text-[#8A8A82]" style={{ fontFamily: "'Fraunces', serif" }}>—</div>
                  <p className="text-[12px] text-[#8A8A82] mt-0.5">No reviews yet</p>
                </>
              )}
            </div>
            <div className="py-4 text-center">
              <div className="text-2xl font-[700] text-[#0D3B2E]" style={{ fontFamily: "'Fraunces', serif" }}>100%</div>
              <p className="text-[12px] text-[#8A8A82] mt-0.5">Verified</p>
            </div>
          </div>
        </div>

        {/* Listings */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag01Icon size={16} color="#1A1A18" />
            <h2 className="text-[18px] font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
              Active Listings ({listingCount})
            </h2>
          </div>
          {listings.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3 sm:gap-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  image={getPrimaryListingImage(listing.images)}
                  condition={listing.condition as never}
                  category={listing.category as never}
                  title={listing.title}
                  sellerName={user.displayName}
                  city={listing.city ?? user.city ?? "Zimbabwe"}
                  price={listing.price}
                  href={`/listings/${listing.id}`}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-[14px] text-[#8A8A82]">No active listings.</div>
          )}
        </section>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <StarIcon size={16} color="#1A1A18" />
              <h2 className="text-[18px] font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
                Reviews ({reviewCount})
              </h2>
            </div>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-[12px] border border-[#E2E2DC] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={review.reviewer.displayName} avatarUrl={review.reviewer.avatarUrl} size={32} />
                      <span className="text-[14px] font-[600] text-[#1A1A18]">{review.reviewer.displayName ?? "User"}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} size={13} color={i < review.rating ? "#F4A61D" : "#E2E2DC"} fill={i < review.rating ? "#F4A61D" : "#E2E2DC"} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-[13px] text-[#4A4A45] leading-relaxed">{review.comment}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
