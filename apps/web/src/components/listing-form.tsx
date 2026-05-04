"use client";

import dynamic from "next/dynamic";
import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";

import { createListing, updateListing } from "@/app/sell/_actions";
import { ListingImagesField } from "@/components/listing-images-field";
import { uploadListingImages } from "@/lib/uploads";

const MapPicker = dynamic(() => import("@/components/map-picker").then((m) => m.MapPicker), {
  ssr: false,
  loading: () => <div className="h-[240px] rounded-[10px] bg-[#F2F2EF] border border-[#E2E2DC] animate-pulse" />,
});

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "PHONES_TABLETS", label: "Phones & Tablets" },
  { value: "VEHICLES", label: "Vehicles" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "CLOTHING", label: "Clothing" },
  { value: "SPORTS_OUTDOORS", label: "Sports & Outdoors" },
  { value: "HOME_GARDEN", label: "Home & Garden" },
  { value: "BOOKS_EDUCATION", label: "Books & Education" },
  { value: "FOOD_BEVERAGES", label: "Food & Beverages" },
  { value: "SERVICES", label: "Services" },
  { value: "OTHER", label: "Other" },
] as const;

const CONDITIONS = [
  { value: "BRAND_NEW", label: "Brand New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "FOR_PARTS", label: "For Parts / Not Working" },
] as const;

// ─── Field components ─────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[13px] font-[600] text-[#1A1A18] mb-1.5">
      {children}
      {required && <span className="text-[#E8621A] ml-0.5">*</span>}
    </label>
  );
}

const inputCls =
  "w-full h-11 px-4 rounded-[10px] border border-[#E2E2DC] bg-[#F2F2EF] text-[14px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A] disabled:opacity-60";

const selectCls =
  "w-full h-11 px-4 rounded-[10px] border border-[#E2E2DC] bg-[#F2F2EF] text-[14px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A] disabled:opacity-60";

// ─── Shared Listing Form ─────────────────────────────────────────────────────

interface ListingFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string;
    price: number;
    condition: string;
    category: string;
    city: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
}

export function ListingForm({ initialData }: ListingFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(initialData ? (initialData.price / 100).toString() : "");
  const [condition, setCondition] = useState(initialData?.condition ?? "LIKE_NEW");
  const [category, setCategory] = useState(initialData?.category ?? "ELECTRONICS");
  const [city, setCity] = useState(initialData?.city ?? "");
  const [lat, setLat] = useState<number | null>(initialData?.latitude ?? null);
  const [lng, setLng] = useState<number | null>(initialData?.longitude ?? null);
  const [locationError, setLocationError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const handleGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported.");
      return;
    }
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => setLocationError("Could not get location. Please allow access or click on the map."),
      { timeout: 10000 },
    );
  }, []);

  function validate() {
    const errs: Record<string, string> = {};
    if (title.trim().length < 3) errs.title = "Title must be at least 3 characters.";
    if (description.trim().length < 10) errs.description = "Description must be at least 10 characters.";
    const cents = Math.round(parseFloat(price) * 100);
    if (!price || isNaN(cents) || cents < 1) errs.price = "Enter a valid price.";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const cents = Math.round(parseFloat(price) * 100);

    startTransition(async () => {
      try {
        const payload = {
          title: title.trim(),
          description: description.trim(),
          price: cents,
          condition,
          category,
          city: city.trim() || undefined,
          latitude: lat ?? undefined,
          longitude: lng ?? undefined,
        };

        let listingId = initialData?.id;

        if (isEditing && initialData) {
          await updateListing(initialData.id, payload);
          // router.refresh(); // Ensure layout/page updates
        } else {
          const listing = await createListing(payload);
          listingId = listing.id;
        }

        if (selectedFiles.length > 0 && listingId) {
          await uploadListingImages(listingId, selectedFiles);
        }

        router.push(`/listings/${listingId}`);
      } catch (err) {
        setErrors({
          form:
            err instanceof Error
              ? err.message
              : typeof err === "object" && err !== null
                ? JSON.stringify(err)
                : String(err),
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {errors.form && (
        <div className="p-3 rounded-[10px] bg-[#FEE2E2] text-[13px] text-[#DC2626]">
          {errors.form}
        </div>
      )}

      {/* Title */}
      <div>
        <Label required>Title</Label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="e.g. iPhone 14 Pro 256GB Space Black"
          disabled={pending}
          className={inputCls}
        />
        {errors.title && <p className="text-[12px] text-[#DC2626] mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <Label required>Description</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          maxLength={5000}
          placeholder="Describe the item — condition, included accessories, reason for selling…"
          disabled={pending}
          className="w-full px-4 py-3 rounded-[10px] border border-[#E2E2DC] bg-[#F2F2EF] text-[14px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A] resize-y disabled:opacity-60"
        />
        {errors.description && <p className="text-[12px] text-[#DC2626] mt-1">{errors.description}</p>}
      </div>

      {/* Price */}
      <div>
        <Label required>Price (USD)</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A82] text-[14px]">$</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            disabled={pending}
            className="w-full h-11 pl-8 pr-4 rounded-[10px] border border-[#E2E2DC] bg-[#F2F2EF] text-[14px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A] disabled:opacity-60"
          />
        </div>
        {errors.price && <p className="text-[12px] text-[#DC2626] mt-1">{errors.price}</p>}
      </div>

      {/* Condition + Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Condition</Label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)} disabled={pending} className={selectCls}>
            {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <Label required>Category</Label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={pending} className={selectCls}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* City */}
      <div>
        <Label>City</Label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Harare"
          maxLength={100}
          disabled={pending}
          className={inputCls}
        />
      </div>

      {/* Location pin */}
      <div>
        <Label>Pin Location</Label>
        {lat !== null && lng !== null ? (
          <div className="space-y-2">
            <MapPicker
              lat={lat}
              lng={lng}
              onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }}
              height={240}
            />
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-[#8A8A82]">
                {lat.toFixed(5)}, {lng.toFixed(5)} · Drag pin or click map to adjust
              </p>
              <button
                type="button"
                onClick={() => { setLat(null); setLng(null); }}
                className="text-[12px] text-[#DC2626] hover:underline"
              >
                Remove pin
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-[10px] border border-dashed border-[#E2E2DC] bg-[#F2F2EF]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A82" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <p className="flex-1 text-[13px] text-[#8A8A82]">No location pinned yet</p>
            <button
              type="button"
              onClick={handleGPS}
              disabled={pending}
              className="px-3 py-1.5 rounded-[8px] bg-[#E8621A] text-white text-[13px] font-[600]
                         hover:bg-[#C9521A] transition-colors disabled:opacity-60"
            >
              Use my GPS
            </button>
          </div>
        )}
        {locationError && <p className="text-[12px] text-[#DC2626] mt-1">{locationError}</p>}
      </div>

      {/* Images - Hidden while editing for now to simplify, or allow adding more */}
      {!isEditing && (
        <div>
          <Label>Images</Label>
          <ListingImagesField
            files={selectedFiles}
            onChange={setSelectedFiles}
            disabled={pending}
          />
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="w-full h-12 rounded-[10px] bg-[#E8621A] text-white text-[15px] font-[700]
                   hover:bg-[#C9521A] transition-colors disabled:opacity-60"
      >
        {pending 
          ? (isEditing ? "Saving…" : "Creating…") 
          : (isEditing ? "Save Changes" : "Create Listing")}
      </button>
    </form>
  );
}
