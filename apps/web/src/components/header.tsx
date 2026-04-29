import {
  BookmarkAdd01Icon,
  Message01Icon,
  UserIcon,
} from "hugeicons-react";
import Link from "next/link";

import { HeaderSearchBar } from "./header-search-bar";

// ─── Sub nav category labels ─────────────────────────────────────────────────

const SUB_NAV_CATEGORIES = [
  "Electronics",
  "Phones",
  "Vehicles",
  "Furniture",
  "Clothing",
  "Sports",
  "Home & Garden",
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export default function SiteHeader() {
  return (
    <header>
      {/* ── Top bar ─────────────────────────────────── */}
      <div className="h-16 bg-[#0D3B2E] px-10 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="shrink-0 text-[24px] leading-none">
          <span
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700 }}
            className="text-[#FAFAF8]"
          >
            sell
          </span>
          <span
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700 }}
            className="text-[#E8621A]"
          >
            space
          </span>
        </Link>

        <HeaderSearchBar />

        {/* Right actions */}
        <nav className="ml-auto flex items-center gap-1">
          <Link
            href="/saved"
            aria-label="Saved"
            className="w-10 h-10 flex items-center justify-center rounded-full
                       text-white hover:bg-white/10 transition-colors"
          >
            <BookmarkAdd01Icon size={20} color="currentColor" />
          </Link>
          <Link
            href="/inbox"
            aria-label="Inbox"
            className="w-10 h-10 flex items-center justify-center rounded-full
                       text-white hover:bg-white/10 transition-colors"
          >
            <Message01Icon size={20} color="currentColor" />
          </Link>
          <Link
            href="/profile"
            aria-label="Profile"
            className="w-10 h-10 flex items-center justify-center rounded-full
                       text-white hover:bg-white/10 transition-colors"
          >
            <UserIcon size={20} color="currentColor" />
          </Link>
        </nav>
      </div>

      {/* ── Sub nav ─────────────────────────────────── */}
      <div className="h-11 bg-white border-b border-[#E2E2DC] px-10 flex items-center gap-1">
        <button
          className="flex items-center gap-1 px-3 h-8 rounded-md text-[14px] font-[500]
                     text-[#1A1A18] hover:bg-[#EFEFEB] transition-colors shrink-0"
        >
          Browse
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <div className="w-px h-5 bg-[#E2E2DC] mx-1" />
        {SUB_NAV_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/search?category=${encodeURIComponent(cat.toUpperCase().replace(/ & /g, "_").replace(/ /g, "_"))}`}
            className="px-3 h-8 flex items-center text-[13px] font-[400] text-[#4A4A45]
                       hover:bg-[#EFEFEB] rounded-md transition-colors whitespace-nowrap"
          >
            {cat}
          </Link>
        ))}
      </div>
    </header>
  );
}
