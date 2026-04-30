"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark01Icon, ShoppingBag01Icon } from "hugeicons-react";
import { profileApi, type SavedListing } from "@/lib/profile-api";
import { Avatar } from "@/components/avatar";

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function SavedTab({ token }: { token: string }) {
  const [items, setItems] = useState<SavedListing[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    profileApi
      .getSaved(token)
      .then((d) => setItems(d.saved))
      .catch(() => setError(true));
  }, [token]);

  if (items === null && !error) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#EFEFEB] rounded-[10px] h-52 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-[14px] text-[#8A8A82]">
        Couldn't load saved items.
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="py-10 flex flex-col items-center gap-3 text-center">
        <Bookmark01Icon size={36} color="#C8C8C0" />
        <p className="text-[14px] text-[#8A8A82]">You haven't saved any items yet.</p>
        <Link
          href="/"
          className="text-[13px] font-[600] text-[#E8621A] hover:underline"
        >
          Browse listings
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/listings/${item.id}`}
          className="group bg-white rounded-[12px] border border-[#E2E2DC] overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="aspect-square bg-[#EFEFEB] relative overflow-hidden">
            {item.images[0] ? (
              <img
                src={item.images[0].url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag01Icon size={32} color="#C8C8C0" />
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="text-[13px] font-[600] text-[#1A1A18] line-clamp-2 leading-snug">{item.title}</p>
            <p className="text-[14px] font-[700] text-[#E8621A] mt-1">{formatPrice(item.price)}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Avatar name={item.seller.displayName} avatarUrl={item.seller.avatarUrl} size={18} />
              <span className="text-[12px] text-[#8A8A82] truncate">{item.seller.displayName}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
