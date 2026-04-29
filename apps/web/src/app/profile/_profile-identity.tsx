"use client";

import { useState } from "react";
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

  return (
    <div className="bg-white rounded-[14px] border border-[#E2E2DC] p-6 shadow-[0_1px_3px_rgba(26,26,24,0.06)]">
      <div className="flex items-center gap-5">
        <AvatarUpload
          displayName={displayName ?? ""}
          currentUrl={avatarUrl}
          onSuccess={(url) => setAvatarUrl(url)}
        />
        <div className="flex-1 min-w-0">
          <h1
            className="text-[24px] font-[700] text-[#1A1A18] truncate"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {displayName ?? "Your Profile"}
          </h1>
          <p className="text-[13px] text-[#8A8A82] mt-0.5">{email}</p>
          {city && (
            <p className="text-[13px] text-[#8A8A82]">📍 {city}</p>
          )}
          <p className="text-[12px] text-[#8A8A82] mt-0.5">Member since {memberYear}</p>
        </div>
      </div>

      <div className="flex gap-8 mt-5 pt-5 border-t border-[#E2E2DC]">
        <div className="text-center">
          <p
            className="text-[22px] font-[700] text-[#1A1A18]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {listingCount}
          </p>
          <p className="text-[12px] text-[#8A8A82]">
            {listingCount === 1 ? "Listing" : "Listings"}
          </p>
        </div>
        {reviewCount > 0 && (
          <>
            <div className="w-px bg-[#E2E2DC]" />
            <div className="text-center">
              <p
                className="text-[22px] font-[700] text-[#1A1A18]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {averageRating?.toFixed(1) ?? "—"}{" "}
                <span className="text-[#F4A61D]">★</span>
              </p>
              <p className="text-[12px] text-[#8A8A82]">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
