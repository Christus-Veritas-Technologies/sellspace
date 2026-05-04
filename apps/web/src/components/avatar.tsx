"use client";

import { useState } from "react";

interface AvatarProps {
  name: string | null;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}

function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

export function Avatar({ name, avatarUrl, size = 40, className = "" }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const abbr = initials(name);

  const style = {
    width: size,
    height: size,
    minWidth: size,
    borderRadius: "50%",
  } as React.CSSProperties;

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? "User avatar"}
        width={size}
        height={size}
        className={`object-cover rounded-full shrink-0 ${className}`}
        style={style}
        onError={() => setImgError(true)}
      />
    );
  }

  const fontSize = Math.max(10, Math.round(size * 0.36));

  return (
    <div
      role="img"
      aria-label={name ?? "User avatar"}
      className={`flex items-center justify-center shrink-0 bg-[#0D3B2E] rounded-full ${className}`}
      style={style}
    >
      <span
        className="font-bold text-[#FAFAF8] select-none leading-none"
        style={{ fontSize }}
      >
        {abbr}
      </span>
    </div>
  );
}
