import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { env } from "@sellspace/env/web";

import { getPrimaryListingImage } from "@/lib/listing-images";
import { SavedListingCardClient } from "./_listing-card-client";

const BASE = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");

export default async function SavedPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ss_access_token")?.value;

  if (!token) redirect("/login");

  const res = await fetch(`${BASE}/api/saved`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const saved = res.ok
    ? ((await res.json()) as {
        saved: {
          id: string;
          title: string;
          price: number;
          condition: string;
          category: string;
          city: string | null;
          seller: { displayName: string | null; city: string | null };
          images: { url: string }[];
          savedAt: string;
        }[];
      }).saved
    : [];

  return (
    <main className="bg-[#F2F2EF] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8">
        <h1
          className="text-[28px] font-[700] text-[#1A1A18] mb-6"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Saved Listings
        </h1>

        {saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[17px] font-[600] text-[#1A1A18] mb-2">Nothing saved yet</p>
            <p className="text-[14px] text-[#8A8A82] mb-5">
              Browse listings and tap Save to keep them here.
            </p>
            <Link
              href="/search"
              className="px-5 py-2.5 rounded-[10px] bg-[#0D3B2E] text-[#FAFAF8] text-[14px] font-[600] hover:bg-[#0A2E24] transition-colors"
            >
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {saved.map((item) => (
              <SavedListingCardClient
                key={item.id}
                id={item.id}
                image={getPrimaryListingImage(item.images)}
                condition={item.condition}
                category={item.category}
                title={item.title}
                sellerName={item.seller.displayName ?? "Seller"}
                city={item.seller.city ?? item.city ?? "Zimbabwe"}
                price={item.price}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
