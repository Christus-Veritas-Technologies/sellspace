import { listingsClient, type Listing } from "@/lib/listings";
import { HomeListingsBrowser } from "./_home-listings-browser";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  let listings: Listing[] = [];
  try {
    const feed = await listingsClient.getListings({ limit: 24 });
    listings = feed.listings;
  } catch {
    listings = [];
  }

  return (
    <main className="bg-[#F2F2EF] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8 space-y-10">
        <HomeListingsBrowser listings={listings} />
      </div>
    </main>
  );
}

