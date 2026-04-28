import { BookmarkIcon } from "hugeicons-react";
import * as React from "react";

import { cn } from "@sellspace/ui/lib/utils";

import { Card, CardContent } from "./card";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Condition = "BRAND_NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "FOR_PARTS";

export interface ListingCardProps {
  id: string;
  image: string;
  condition: Condition;
  category: string;
  title: string;
  sellerName: string;
  city: string;
  /** Price in cents */
  price: number;
  /** Original price in cents (shown struck-through) */
  originalPrice?: number;
  saved?: boolean;
  onSave?: () => void;
  currency?: string;
  href?: string;
}

// ─── Condition config ─────────────────────────────────────────────────────────

const conditionConfig: Record<Condition, { label: string; className: string }> =
  {
    BRAND_NEW: { label: "Brand New", className: "bg-[#0D3B2E] text-white" },
    LIKE_NEW: { label: "Like New", className: "bg-[#E8621A] text-white" },
    GOOD: { label: "Good", className: "bg-[#F4A61D] text-[#1A1A18]" },
    FAIR: {
      label: "Fair",
      className: "bg-[#EFEFEB] text-[#4A4A45] border border-[#C8C8C0]",
    },
    FOR_PARTS: { label: "For Parts", className: "bg-[#FEE2E2] text-[#DC2626]" },
  };

// ─── Component ────────────────────────────────────────────────────────────────

export function ListingCard({
  image,
  condition,
  category,
  title,
  sellerName,
  city,
  price,
  originalPrice,
  saved = false,
  onSave,
  href,
}: ListingCardProps) {
  const cond = conditionConfig[condition];

  const cardContent = (
    <Card
      className="group relative overflow-hidden border border-[#E2E2DC] bg-[#FAFAF8]
                 rounded-[10px] cursor-pointer p-0 gap-0
                 shadow-[0_1px_3px_rgba(26,26,24,0.06),0_1px_2px_rgba(26,26,24,0.04)]
                 hover:shadow-[0_4px_12px_rgba(26,26,24,0.10),0_2px_4px_rgba(26,26,24,0.06)]
                 transition-shadow duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#EFEFEB]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        {/* Condition badge */}
        <span
          className={cn(
            "absolute top-2 left-2 text-[11px] font-[600] px-2 py-1 rounded-[6px] leading-none",
            cond.className,
          )}
        >
          {cond.label}
        </span>
        {/* Bookmark */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSave?.();
          }}
          aria-label={saved ? "Remove from saved" : "Save listing"}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80
                     backdrop-blur-sm flex items-center justify-center
                     hover:bg-white transition-colors z-10"
        >
          <BookmarkIcon
            size={16}
            color={saved ? "#E8621A" : "#8A8A82"}
            fill={saved ? "#E8621A" : "none"}
          />
        </button>
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-1.5">
        <p className="text-[11px] font-[600] uppercase tracking-wide text-[#8A8A82]">
          {category.replace(/_/g, " ")}
        </p>
        <h3 className="text-[14px] font-[600] leading-[1.35] line-clamp-2 text-[#1A1A18]">
          {title}
        </h3>
        <p className="text-[12px] text-[#8A8A82]">
          {sellerName} · {city}
        </p>
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-[16px] font-[700] text-[#E8621A]">
            ${(price / 100).toFixed(2)}
          </span>
          {originalPrice !== undefined && (
            <span className="text-[13px] text-[#8A8A82] line-through">
              ${(originalPrice / 100).toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {cardContent}
      </a>
    );
  }

  return cardContent;
}
