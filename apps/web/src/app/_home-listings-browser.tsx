"use client";

import { useState } from "react";

import {
  Briefcase09Icon,
  Car01Icon,
  CpuIcon,
  FlowerIcon,
  FootballIcon,
  GridIcon,
  KitchenUtensilsIcon,
  Leaf01Icon,
  SmartPhone01Icon,
  Sofa03Icon,
  TShirtIcon,
} from "hugeicons-react";

import { ListingCard } from "@sellspace/ui/components/listing-card";
import { cn } from "@sellspace/ui/lib/utils";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPrimaryListingImage } from "@/lib/listing-images";
import type { Category, Listing } from "@/lib/listings";

type HomeListingsBrowserProps = {
  listings: Listing[];
};

const ALL_CATEGORY = "ALL";

const categories = [
  { label: "All", icon: GridIcon, value: ALL_CATEGORY },
  { label: "Electronics", icon: CpuIcon, value: "ELECTRONICS" },
  { label: "Phones", icon: SmartPhone01Icon, value: "PHONES_TABLETS" },
  { label: "Vehicles", icon: Car01Icon, value: "VEHICLES" },
  { label: "Furniture", icon: Sofa03Icon, value: "FURNITURE" },
  { label: "Clothing", icon: TShirtIcon, value: "CLOTHING" },
  { label: "Sports", icon: FootballIcon, value: "SPORTS_OUTDOORS" },
  { label: "Home & Garden", icon: FlowerIcon, value: "HOME_GARDEN" },
  { label: "Books", icon: Leaf01Icon, value: "BOOKS_EDUCATION" },
  { label: "Food & Drink", icon: KitchenUtensilsIcon, value: "FOOD_BEVERAGES" },
  { label: "Services", icon: Briefcase09Icon, value: "SERVICES" },
] as const satisfies ReadonlyArray<{
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  value: Category | typeof ALL_CATEGORY;
}>;

function getFilteredListings(listings: Listing[], activeCategory: Category | typeof ALL_CATEGORY) {
  if (activeCategory === ALL_CATEGORY) {
    return listings;
  }

  return listings.filter((listing) => listing.category === activeCategory);
}

export function HomeListingsBrowser({ listings }: HomeListingsBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<Category | typeof ALL_CATEGORY>(ALL_CATEGORY);
  const filteredListings = getFilteredListings(listings, activeCategory);
  const activeCategoryLabel = categories.find((category) => category.value === activeCategory)?.label ?? "All";

  return (
    <Tabs
      defaultValue={ALL_CATEGORY}
      value={activeCategory}
      onValueChange={(value) => setActiveCategory(value as Category | typeof ALL_CATEGORY)}
      className="space-y-10"
    >
      <section>
        <h2
          className="text-[22px] font-[600] text-[#1A1A18] mb-5"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Browse categories
        </h2>

        <TabsList className="grid h-auto w-full grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-3 bg-transparent p-0">
          {categories.map(({ label, icon: Icon, value }) => (
            <TabsTrigger
              key={value}
              value={value}
              aria-label={`Filter listings by ${label}`}
              className={cn(
                "group flex min-h-[96px] flex-col items-center gap-2 rounded-[10px] border border-[#E2E2DC]",
                "bg-white px-2 py-4 text-[#4A4A45] transition-colors",
                "hover:border-[#E8621A] hover:bg-[#FFF8F4]",
                "data-[state=active]:border-[#E8621A] data-[state=active]:bg-[#FFF8F4] data-[state=active]:text-[#E8621A]",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F2EF] transition-colors",
                  "group-hover:bg-[#E8621A]/10 group-data-[state=active]:bg-[#E8621A]/10",
                )}
              >
                <Icon size={20} color="currentColor" />
              </div>
              <span className="text-center text-[12px] font-[500] leading-tight">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2
              className="text-[22px] font-[600] text-[#1A1A18]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Just Listed
            </h2>
            <p className="mt-1 text-[13px] text-[#8A8A82]">
              {activeCategory === ALL_CATEGORY ? "Showing all categories" : `Showing ${activeCategoryLabel}`}
            </p>
          </div>
          <a
            href="/search"
            className="text-[14px] font-[500] text-[#E8621A] transition-colors hover:text-[#C9521A]"
          >
            See all →
          </a>
        </div>

        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                image={getPrimaryListingImage(listing.images)}
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
          <div className="rounded-[10px] border border-[#E2E2DC] bg-[#FAFAF8] py-16 text-center text-[14px] text-[#8A8A82]">
            No listings in {activeCategoryLabel} yet.
          </div>
        )}
      </section>
    </Tabs>
  );
}