import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@sellspace/env/web";
import { ListingCard } from "@sellspace/ui/components/listing-card";
import { ProfileIdentity } from "./_profile-identity";

const BASE = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ss_access_token")?.value;

  if (!token) redirect("/login");

  const headers = { Authorization: `Bearer ${token}` };

  const res = await fetch(`${BASE}/api/users/me`, { headers, cache: "no-store" });

  if (!res.ok) redirect("/login");

  const data = (await res.json()) as {
    user: {
      id: string;
      displayName: string | null;
      email: string;
      city: string | null;
      avatarUrl: string | null;
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
      reviewer: { id: string; displayName: string | null };
    }[];
    averageRating: number | null;
    reviewCount: number;
  };

  const { user, listings, listingCount, reviews, averageRating, reviewCount } = data;
  const memberYear = new Date(user.createdAt).getFullYear();

  return (
    <main className="bg-[#F2F2EF] min-h-screen">
      <div className="max-w-[860px] mx-auto px-6 py-8 space-y-8">

        {/* Identity card */}
        <ProfileIdentity
          displayName={user.displayName}
          email={user.email}
          city={user.city}
          avatarUrl={user.avatarUrl}
          memberYear={memberYear}
          listingCount={listingCount}
          reviewCount={reviewCount}
          averageRating={averageRating}
        />

        {/* Active listings */}
        {listings.length > 0 && (
          <section>
            <h2 className="text-[18px] font-[700] text-[#1A1A18] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Active Listings
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  image={listing.images[0]?.url ?? "/placeholder.jpg"}
                  condition={listing.condition as never}
                  category={listing.category as never}
                  title={listing.title}
                  sellerName={user.displayName ?? "You"}
                  city={listing.city ?? user.city ?? "Zimbabwe"}
                  price={listing.price}
                  href={`/listings/${listing.id}`}
                />
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section>
            <h2 className="text-[18px] font-[700] text-[#1A1A18] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Reviews
            </h2>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-[12px] border border-[#E2E2DC] p-4 shadow-[0_1px_3px_rgba(26,26,24,0.04)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#0D3B2E] flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-[700] text-[#FAFAF8]">
                          {initials(review.reviewer.displayName)}
                        </span>
                      </div>
                      <span className="text-[14px] font-[600] text-[#1A1A18]">
                        {review.reviewer.displayName ?? "User"}
                      </span>
                    </div>
                    <span className="text-[13px] text-[#F4A61D]">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                  </div>
                  {review.comment && (
                    <p className="text-[13px] text-[#4A4A45] leading-relaxed">{review.comment}</p>
                  )}
                  <p className="text-[11px] text-[#8A8A82] mt-1.5">
                    {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Account actions */}
        <div className="flex justify-end">
          <Link
            href="/logout"
            className="px-5 py-2.5 rounded-[10px] border border-[#FEE2E2] bg-white text-[#DC2626]
                       text-[14px] font-[600] hover:bg-[#FEE2E2] transition-colors"
          >
            Log out
          </Link>
        </div>

      </div>
    </main>
  );
}
