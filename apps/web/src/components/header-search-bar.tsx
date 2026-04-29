"use client";

import { Search01Icon } from "hugeicons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeaderSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/search");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-[560px]">
      <Search01Icon
        size={16}
        color="#8A8A82"
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search listings…"
        className="w-full h-10 pl-9 pr-4 rounded-full bg-white text-[14px]
                   text-[#1A1A18] placeholder:text-[#8A8A82] border-0 outline-none
                   focus:ring-2 focus:ring-[#E8621A]/60"
      />
    </form>
  );
}
