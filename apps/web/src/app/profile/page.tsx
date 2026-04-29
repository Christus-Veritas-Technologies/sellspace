import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Shield01Icon, Settings01Icon, LogoutCircle02Icon } from "hugeicons-react";

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
      <div className="max-w-[1000px] mx-auto px-6 py-8 space-y-8">

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

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/sell"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#E8621A] text-white rounded-[10px] font-[600] text-[14px] hover:bg-[#C9521A] transition-colors"
          >
            List Item
          </Link>
          <Link
            href="/saved"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#E2E2DC] text-[#1A1A18] rounded-[10px] font-[600] text-[14px] hover:bg-[#EFEFEB] transition-colors"
          >
            Saved Items
          </Link>
          <Link
            href="/inbox"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#E2E2DC] text-[#1A1A18] rounded-[10px] font-[600] text-[14px] hover:bg-[#EFEFEB] transition-colors"
          >
            Messages
          </Link>
          <Link
            href="/logout"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#FEE2E2] text-[#DC2626] rounded-[10px] font-[600] text-[14px] hover:bg-[#FEE2E2] transition-colors"
          >
            <LogoutCircle02Icon size={16} />
            Log out
          </Link>
        </div>

        {/* Account info section */}
        <div className="bg-white rounded-[14px] border border-[#E2E2DC] p-6 shadow-[0_1px_3px_rgba(26,26,24,0.06)]">
          <div className="flex items-center gap-2 mb-4">
            <Shield01Icon size={20} color="#0D3B2E" />
            <h3 className="text-[16px] font-[700] text-[#1A1A18]">Account Information</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#E2E2DC]">
              <span className="text-[14px] text-[#4A4A45]">Email</span>
              <span className="text-[14px] font-[500] text-[#1A1A18]">{user.email}</span>
            </div>
            {user.city && (
              <div className="flex justify-between items-center py-2 border-b border-[#E2E2DC]">
                <span className="text-[14px] text-[#4A4A45]">City</span>
                <span className="text-[14px] font-[500] text-[#1A1A18]">{user.city}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-[#E2E2DC]">
              <span className="text-[14px] text-[#4A4A45]">Member Since</span>
              <span className="text-[14px] font-[500] text-[#1A1A18]">
                {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[14px] text-[#4A4A45]">Status</span>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-[#DCFCE7] rounded-full">
                <Shield01Icon size={14} color="#16A34A" />
                <span className="text-[12px] font-[600] text-[#16A34A]">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active listings */}
        {listings.length > 0 && (
          <section>
            <h2 className="text-[20px] font-[700] text-[#1A1A18] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Active Listings ({listingCount})
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
        {listings.length === 0 && (
          <div className="bg-white rounded-[14px] border border-[#E2E2DC] p-8 text-center">
            <p className="text-[14px] text-[#8A8A82] mb-4">You haven't listed any items yet.</p>
            <Link
              href="/sell"
              className="inline-block px-6 py-2.5 bg-[#E8621A] text-white rounded-[10px] font-[600] text-[14px] hover:bg-[#C9521A] transition-colors"
            >
              Create Your First Listing
            </Link>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section>
            <h2 className="text-[20px] font-[700] text-[#1A1A18] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Reviews ({reviewCount})
            </h2>
            <div className="space-y-3" style={{ maxHeight: "600px", overflowY: "auto" }}>
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
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i} className="text-[#F4A61D]">★</span>
                      ))}
                      {Array.from({ length: 5 - review.rating }).map((_, i) => (
                        <span key={`empty-${i}`} className="text-[#E2E2DC]">★</span>
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-[13px] text-[#4A4A45] leading-relaxed mb-2">{review.comment}</p>
                  )}
                  <p className="text-[11px] text-[#8A8A82]">
                    {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
