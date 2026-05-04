import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";

import { listingsClient } from "@/lib/listings";
import { ListingForm } from "@/components/listing-form";
import { env } from "@sellspace/env/web";

export default async function EditListingPage({
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

  // Verification: User must be signed in and be the owner
  const cookieStore = await cookies();
  const token = cookieStore.get("ss_access_token")?.value;

  if (!token) {
    redirect("/auth");
  }

  try {
    const BASE = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");
    const meRes = await fetch(`${BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!meRes.ok) {
        redirect("/auth");
    }

    const meData = (await meRes.json()) as { user: { id: string } };
    if (meData.user.id !== listing.seller.id) {
       // Not authorized to edit this listing
       redirect(`/listings/${id}`);
    }
  } catch (err) {
    console.error("Auth check failed:", err);
    redirect(`/listings/${id}`);
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] pb-20">
      <div className="max-w-[1000px] mx-auto px-4 md:px-6">
        <header className="pt-8 pb-10 border-b border-[#E2E2DC] mb-10">
          <h1 className="text-[32px] font-[800] tracking-[-0.02em] text-[#1A1A18] mb-2">
            Edit Listing
          </h1>
          <p className="text-[#8A8A82] text-[16px]">
            Update your item details or price.
          </p>
        </header>

        <div className="max-w-[640px]">
          <ListingForm 
            initialData={{
                id: listing.id,
                title: listing.title,
                description: listing.description,
                price: listing.price,
                condition: listing.condition,
                category: listing.category,
                city: listing.city,
                latitude: listing.latitude,
                longitude: listing.longitude,
            }} 
          />
        </div>
      </div>
    </main>
  );
}
