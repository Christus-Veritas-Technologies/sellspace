"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useRef } from "react";

interface ListingMapProps {
  lat: number;
  lng: number;
  label?: string;
  height?: number;
}

export function ListingMap({ lat, lng, label, height = 240 }: ListingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamic import to ensure SSR safety
    import("leaflet").then((L) => {
      if (!containerRef.current || mapRef.current) return;

      // Fix default icon path issue with bundlers
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(
        [lat, lng],
        15,
      );
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng]).addTo(map);
      if (label) marker.bindPopup(label).openPopup();
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className="rounded-[10px] overflow-hidden border border-[#E2E2DC]">
      <div ref={containerRef} style={{ height }} className="w-full" />
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-[500]
                   text-[#E8621A] bg-white border-t border-[#E2E2DC]
                   hover:bg-[#FFF5F0] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none" />
        </svg>
        Open in Google Maps
      </a>
    </div>
  );
}
