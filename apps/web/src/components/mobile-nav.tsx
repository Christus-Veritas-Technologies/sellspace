"use client";

import {
  BookmarkAdd01Icon,
  Cancel01Icon,
  Home01Icon,
  Menu01Icon,
  Message01Icon,
  UserIcon,
} from "hugeicons-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { HeaderSearchBar } from "./header-search-bar";

// ─── Constants ───────────────────────────────────────────────────────────────

const SUB_NAV_CATEGORIES = [
  "Electronics",
  "Phones",
  "Vehicles",
  "Furniture",
  "Clothing",
  "Sports",
  "Home & Garden",
] as const;

const NAV_LINKS = [
  { href: "/", label: "Home", Icon: Home01Icon },
  { href: "/saved", label: "Saved", Icon: BookmarkAdd01Icon },
  { href: "/inbox", label: "Inbox", Icon: Message01Icon },
  { href: "/profile", label: "Profile", Icon: UserIcon },
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger trigger — visible on mobile only */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="w-10 h-10 flex items-center justify-center rounded-full
                   text-white hover:bg-white/10 transition-colors"
      >
        <Menu01Icon size={22} color="currentColor" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-in panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={[
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-[#FAFAF8] shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Panel header */}
        <div className="h-16 bg-[#0D3B2E] px-4 flex items-center justify-between shrink-0">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2"
          >
            <Image
              src="/favicon.png"
              alt="Sellspace"
              width={32}
              height={32}              unoptimized              className="rounded-full"
            />
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-9 h-9 flex items-center justify-center rounded-full
                       text-white hover:bg-white/10 transition-colors"
          >
            <Cancel01Icon size={20} color="currentColor" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-[#E2E2DC] flex">
          <HeaderSearchBar />
        </div>

        {/* Nav links */}
        <nav className="px-3 py-2 border-b border-[#E2E2DC]">
          {NAV_LINKS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                         text-[14px] font-[500] text-[#1A1A18]
                         hover:bg-[#EFEFEB] transition-colors"
            >
              <Icon size={18} color="#4A4A45" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <p className="px-3 py-2 text-[11px] font-[600] tracking-widest text-[#8A8A82] uppercase">
            Browse by category
          </p>
          {SUB_NAV_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/search?category=${encodeURIComponent(cat.toUpperCase().replace(/ & /g, "_").replace(/ /g, "_"))}`}
              onClick={() => setOpen(false)}
              className="flex items-center px-3 py-2.5 rounded-lg
                         text-[14px] font-[400] text-[#4A4A45]
                         hover:bg-[#EFEFEB] hover:text-[#1A1A18] transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Sell CTA */}
        <div className="px-4 py-4 border-t border-[#E2E2DC]">
          <Link
            href="/sell"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-full h-10 rounded-lg
                       bg-[#E8621A] text-white text-[14px] font-[600]
                       hover:bg-[#C9521A] transition-colors"
          >
            + List an item
          </Link>
        </div>
      </div>
    </>
  );
}
