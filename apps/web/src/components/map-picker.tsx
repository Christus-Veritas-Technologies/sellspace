"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useRef, useCallback } from "react";

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  height?: number;
}

export function MapPicker({ lat, lng, onChange, height = 240 }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      if (!containerRef.current || mapRef.current) return;

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

      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChangeRef.current(pos.lat, pos.lng);
      });

      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChangeRef.current(e.latlng.lat, e.latlng.lng);
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker when parent changes lat/lng externally (e.g. GPS snap)
  useEffect(() => {
    markerRef.current?.setLatLng([lat, lng]);
    mapRef.current?.setView([lat, lng], mapRef.current.getZoom());
  }, [lat, lng]);

  return (
    <div ref={containerRef} style={{ height }} className="w-full rounded-[10px] overflow-hidden border border-[#E2E2DC]" />
  );
}

export function useGPSLocation(onSuccess: (lat: number, lng: number) => void, onError?: (msg: string) => void) {
  return useCallback(() => {
    if (!navigator.geolocation) {
      onError?.("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onSuccess(pos.coords.latitude, pos.coords.longitude),
      () => onError?.("Could not get your location. Please allow location access."),
      { timeout: 10000 },
    );
  }, [onSuccess, onError]);
}
