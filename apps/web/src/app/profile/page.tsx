import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutCircle02Icon, Tag01Icon } from "hugeicons-react";

import { env } from "@sellspace/env/web";
import { ListingCard } from "@sellspace/ui/components/listing-card";
import { ProfileIdentity } from "./_profile-identity";
import { ProfileTabs } from "./_profile-tabs";

const BASE = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ss_access_token")?.value;
  if (!token) redirect("/login");

  const res = await fetch(`${BASE}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) redirect("/login");

  const data = (await res.json()) as {
    user: {
      id: string;
      displayName: string | null;
      email: string;
      city: string | null;
      avatarUrl: string | null;
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

  const { user, listings, listingCount, reviews, averageRating, reviewCount } = data;

  return (
    <main className="bg-[#F2F2EF] min-h-screen">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        <ProfileIdentity
          userId={user.id}
          displayName={user.displayName}
          email={user.email}
          city={user.city}
          avatarUrl={user.avatarUrl}
          memberSince={user.createdAt}
          listingCount={listingCount}
          reviewCount={reviewCount}
          averageRating={averageRating}
          isPrivate={user.isPrivate}
          token={token}
        />

        <div className="flex flex-wrap gap-3">
          <Link
            href="/sell"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E8621A] text-white rounded-[10px] font-[600] text-[14px] hover:bg-[#C9521A] transition-colors"
          >
            <Tag01Icon size={16} />
            List an Item
          </Link>
          <Link
            href="/logout"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#FEE2E2] text-[#DC2626] rounded-[10px] font-[600] text-[14px] hover:bg-[#FEE2E2] transition-colors"
          >
            <LogoutCircle02Icon size={16} />
            Log out
          </Link>
        </div>

        <ProfileTabs
          token={token}
          userId={user.id}
          listings={listings}
          listingCount={listingCount}
          reviews={reviews}
          reviewCount={reviewCount}
          userDisplayName={user.displayName}
          userCity={user.city}
        />
      </div>
    </main>
  );
}

