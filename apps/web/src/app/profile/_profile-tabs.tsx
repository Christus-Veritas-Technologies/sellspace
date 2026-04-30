"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag01Icon, Bookmark01Icon, Message01Icon, StarIcon, ShoppingBag01Icon } from "hugeicons-react";
import { ListingCard } from "@sellspace/ui/components/listing-card";
import { Avatar } from "@/components/avatar";
import { SavedTab } from "./_saved-tab";
import { MessagesTab } from "./_messages-tab";

interface Listing {
  id: string;
  title: string;
  price: number;
  condition: string;
  category: string;
  city: string | null;
  images: { url: string }[];
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { id: string; displayName: string | null; avatarUrl: string | null };
}

interface Props {
  token: string;
  userId: string;
  listings: Listing[];
  listingCount: number;
  reviews: Review[];
  reviewCount: number;
  userDisplayName: string | null;
  userCity: string | null;
}

type Tab = "listings" | "saved" | "messages";

const TABS: { id: Tab; label: string; icon: typeof Tag01Icon }[] = [
  { id: "listings", label: "Listings", icon: Tag01Icon },
  { id: "saved", label: "Saved", icon: Bookmark01Icon },
  { id: "messages", label: "Messages", icon: Message01Icon },
];

export function ProfileTabs(props: Props) {
  const { token, userId, listings, listingCount, reviews, reviewCount, userDisplayName, userCity } = props;
  const [tab, setTab] = useState<Tab>("listings");

  return (
    <div className="bg-white rounded-[14px] border border-[#E2E2DC] shadow-[0_1px_3px_rgba(26,26,24,0.06)] overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[#E2E2DC]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[13px] sm:text-[14px] font-[600] transition-colors border-b-2
              ${tab === id
                ? "border-[#E8621A] text-[#E8621A] bg-[#FAFAF8]"
                : "border-transparent text-[#8A8A82] hover:text-[#1A1A18] hover:bg-[#FAFAF8]"
              }`}
          >
            <Icon size={15} />
            <span className="hidden xs:inline sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="p-4 sm:p-6">
        {tab === "listings" && (
          <ListingsPanel
            listings={listings}
            listingCount={listingCount}
            reviews={reviews}
            reviewCount={reviewCount}
            userDisplayName={userDisplayName}
            userCity={userCity}
          />
        )}
        {tab === "saved" && <SavedTab token={token} />}
        {tab === "messages" && <MessagesTab token={token} userId={userId} />}
      </div>
    </div>
  );
}

function ListingsPanel({
  listings,
  listingCount,
  reviews,
  reviewCount,
  userDisplayName,
  userCity,
}: {
  listings: Listing[];
  listingCount: number;
  reviews: Review[];
  reviewCount: number;
  userDisplayName: string | null;
  userCity: string | null;
}) {
  return (
    <div className="space-y-8">
      {/* Listings */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Tag01Icon size={16} color="#1A1A18" />
          <h2 className="text-[16px] sm:text-[18px] font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
            Active Listings ({listingCount})
          </h2>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3 sm:gap-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                image={listing.images[0]?.url ?? "/placeholder.jpg"}
                condition={listing.condition as never}
                category={listing.category as never}
                title={listing.title}
                sellerName={userDisplayName ?? "You"}
                city={listing.city ?? userCity ?? "Zimbabwe"}
                price={listing.price}
                href={`/listings/${listing.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center gap-3 text-center">
            <ShoppingBag01Icon size={36} color="#C8C8C0" />
            <p className="text-[14px] text-[#8A8A82]">You haven't listed any items yet.</p>
            <Link
              href="/sell"
              className="inline-block px-5 py-2 bg-[#E8621A] text-white rounded-[10px] font-[600] text-[14px] hover:bg-[#C9521A] transition-colors"
            >
              Create Your First Listing
            </Link>
          </div>
        )}
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <StarIcon size={16} color="#1A1A18" />
            <h2 className="text-[16px] sm:text-[18px] font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
              Reviews ({reviewCount})
            </h2>
          </div>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#FAFAF8] rounded-[12px] border border-[#E2E2DC] p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={review.reviewer.displayName} avatarUrl={review.reviewer.avatarUrl} size={32} />
                    <span className="text-[14px] font-[600] text-[#1A1A18]">
                      {review.reviewer.displayName ?? "User"}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        size={13}
                        color={i < review.rating ? "#F4A61D" : "#E2E2DC"}
                        fill={i < review.rating ? "#F4A61D" : "#E2E2DC"}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-[13px] text-[#4A4A45] leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
