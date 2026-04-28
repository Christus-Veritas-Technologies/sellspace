import {
  BriefcaseIcon,
  Car01Icon,
  Cpu01Icon,
  FlowerIcon,
  Football01Icon,
  GridIcon,
  Leaf01Icon,
  SmartPhone01Icon,
  SofaIcon,
  TShirtIcon,
  UtensilsIcon,
} from "hugeicons-react";

import { ListingCard } from "@sellspace/ui/components/listing-card";

import { listingsClient } from "@/lib/listings";

// ─── Category browser config ──────────────────────────────────────────────────

const CATEGORIES = [
  { label: "All", href: "/", icon: GridIcon, value: null },
  { label: "Electronics", href: "/?category=ELECTRONICS", icon: Cpu01Icon, value: "ELECTRONICS" },
  { label: "Phones", href: "/?category=PHONES_TABLETS", icon: SmartPhone01Icon, value: "PHONES_TABLETS" },
  { label: "Vehicles", href: "/?category=VEHICLES", icon: Car01Icon, value: "VEHICLES" },
  { label: "Furniture", href: "/?category=FURNITURE", icon: SofaIcon, value: "FURNITURE" },
  { label: "Clothing", href: "/?category=CLOTHING", icon: TShirtIcon, value: "CLOTHING" },
  { label: "Sports", href: "/?category=SPORTS_OUTDOORS", icon: Football01Icon, value: "SPORTS_OUTDOORS" },
  { label: "Home & Garden", href: "/?category=HOME_GARDEN", icon: FlowerIcon, value: "HOME_GARDEN" },
  { label: "Books", href: "/?category=BOOKS_EDUCATION", icon: Leaf01Icon, value: "BOOKS_EDUCATION" },
  { label: "Food & Drink", href: "/?category=FOOD_BEVERAGES", icon: UtensilsIcon, value: "FOOD_BEVERAGES" },
  { label: "Services", href: "/?category=SERVICES", icon: BriefcaseIcon, value: "SERVICES" },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  let feed;
  try {
    feed = await listingsClient.getListings({ limit: 24 });
  } catch {
    feed = null;
  }

  return (
    <main className="bg-[#F2F2EF] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8 space-y-10">

        {/* ── Category browser ──────────────────────────────────────── */}
        <section>
          <h2
            className="text-[22px] font-[600] text-[#1A1A18] mb-5"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Browse categories
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-3">
            {CATEGORIES.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="flex flex-col items-center gap-2 py-4 px-2 rounded-[10px]
                           bg-white border border-[#E2E2DC] hover:border-[#E8621A]
                           hover:bg-[#FFF8F4] transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-full bg-[#F2F2EF] flex items-center justify-center
                                group-hover:bg-[#E8621A]/10 transition-colors"
                >
                  <Icon size={20} color="#4A4A45" />
                </div>
                <span className="text-[12px] font-[500] text-[#4A4A45] text-center leading-tight">
                  {label}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ── Just Listed ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-[22px] font-[600] text-[#1A1A18]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Just Listed
            </h2>
            <a
              href="/listings"
              className="text-[14px] font-[500] text-[#E8621A] hover:text-[#C9521A] transition-colors"
            >
              See all →
            </a>
          </div>

          {feed && feed.listings.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {feed.listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  image={listing.images[0]?.url ?? "/placeholder.jpg"}
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
            <div className="text-center py-16 text-[#8A8A82] text-[14px]">
              No listings yet — be the first to sell something!
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

