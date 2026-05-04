"use client";

import dynamic from "next/dynamic";

const ListingMap = dynamic(
  () => import("@/components/listing-map").then((m) => m.ListingMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[240px] rounded-[10px] bg-[#F2F2EF] border border-[#E2E2DC] animate-pulse" />
    ),
  },
);

export function ListingMapClient({
  lat,
  lng,
  label,
  height,
}: {
  lat: number;
  lng: number;
  label?: string;
  height?: number;
}) {
  return <ListingMap lat={lat} lng={lng} label={label} height={height} />;
}
