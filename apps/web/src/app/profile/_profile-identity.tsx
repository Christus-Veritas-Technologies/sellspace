"use client";

import { useState } from "react";
import { Calendar01Icon, HomeIcon, StarIcon } from "hugeicons-react";
import { AvatarUpload } from "@/components/avatar-upload";

interface Props {
  displayName: string | null;
  email: string;
  city: string | null;
  avatarUrl: string | null;
  memberYear: number;
  listingCount: number;
  reviewCount: number;
  averageRating: number | null;
}

export function ProfileIdentity({
  displayName,
  email,
  city,
  avatarUrl: initialAvatarUrl,
  memberYear,
  listingCount,
  reviewCount,
  averageRating,
}: Props) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const currentYear = new Date().getFullYear();
  const memberYears = currentYear - memberYear;

  return (
    <div className="bg-white rounded-[14px] border border-[#E2E2DC] p-6 shadow-[0_1px_3px_rgba(26,26,24,0.06)]">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <AvatarUpload
          displayName={displayName ?? ""}
          currentUrl={avatarUrl}
          onSuccess={(url) => setAvatarUrl(url)}
        />
        <div className="flex-1 min-w-0">
          <h1
            className="text-[28px] font-[700] text-[#1A1A18] truncate"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {displayName ?? "Your Profile"}
          </h1>
          <p className="text-[14px] text-[#4A4A45] mt-1">{email}</p>
          {city && (
            <p className="text-[13px] text-[#8A8A82] mt-1 flex items-center gap-1">
              <HomeIcon size={14} />
              {city}
            </p>
          )}
          <p className="text-[13px] text-[#8A8A82] mt-1 flex items-center gap-1">
            <Calendar01Icon size={14} />
            Member for {memberYears} {memberYears === 1 ? "year" : "years"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#E2E2DC]">
        <div className="text-center">
          <div
            className="text-[28px] font-[700] text-[#1A1A18]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {listingCount}
          </div>
          <p className="text-[12px] text-[#8A8A82] mt-1">
            {listingCount === 1 ? "Active Listing" : "Active Listings"}
          </p>
        </div>
        {reviewCount > 0 && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span
                className="text-[28px] font-[700] text-[#1A1A18]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {averageRating?.toFixed(1) ?? "—"}
              </span>
              <StarIcon size={20} color="#F4A61D" fill="#F4A61D" />
            </div>
            <p className="text-[12px] text-[#8A8A82] mt-1">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </p>
          </div>
        )}
        <div className="text-center">
          <div
            className="text-[28px] font-[700] text-[#0D3B2E]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            100%
          </div>
          <p className="text-[12px] text-[#8A8A82] mt-1">Verified</p>
        </div>
      </div>
    </div>
  );
}
