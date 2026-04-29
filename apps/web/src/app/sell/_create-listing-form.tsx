"use client";

import { useTransition, useState } from "react";

import { createListing } from "./_actions";

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

// ─── Create listing form ──────────────────────────────────────────────────────

export function CreateListingForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("LIKE_NEW");
  const [category, setCategory] = useState("ELECTRONICS");
  const [city, setCity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function addImage() {
    const url = imageUrl.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      setErrors((e) => ({ ...e, imageUrl: "Must be a valid URL." }));
      return;
    }
    if (imageUrls.length >= 10) {
      setErrors((e) => ({ ...e, imageUrl: "Maximum 10 images." }));
      return;
    }
    setImageUrls((prev) => [...prev, url]);
    setImageUrl("");
    setErrors((e) => ({ ...e, imageUrl: "" }));
  }

  function removeImage(i: number) {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (title.trim().length < 3) errs.title = "Title must be at least 3 characters.";
    if (description.trim().length < 10) errs.description = "Description must be at least 10 characters.";
    const cents = Math.round(parseFloat(price) * 100);
    if (!price || isNaN(cents) || cents < 1) errs.price = "Enter a valid price.";
    if (imageUrls.length < 1) errs.imageUrl = "Add at least one image URL.";
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
        await createListing({
          title: title.trim(),
          description: description.trim(),
          price: cents,
          condition,
          category,
          city: city.trim() || undefined,
          imageUrls,
        });
      } catch (err) {
        setErrors({ form: (err as Error).message });
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

      {/* Image URLs */}
      <div>
        <Label required>Images</Label>
        <p className="text-[12px] text-[#8A8A82] mb-2">Paste a direct image URL (e.g. from Imgur or Cloudinary). Up to 10.</p>

        <div className="flex gap-2 mb-3">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); }}}
            placeholder="https://example.com/image.jpg"
            disabled={pending}
            className="flex-1 h-11 px-4 rounded-[10px] border border-[#E2E2DC] bg-[#F2F2EF] text-[14px] text-[#1A1A18] focus:outline-none focus:border-[#E8621A] disabled:opacity-60"
          />
          <button
            type="button"
            onClick={addImage}
            disabled={pending}
            className="h-11 px-4 rounded-[10px] border border-[#E2E2DC] bg-white text-[14px] font-[600] text-[#1A1A18] hover:bg-[#F2F2EF] transition-colors disabled:opacity-60"
          >
            Add
          </button>
        </div>

        {errors.imageUrl && <p className="text-[12px] text-[#DC2626] mb-2">{errors.imageUrl}</p>}

        {imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-[8px] overflow-hidden border border-[#E2E2DC] group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 w-full h-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xl"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="w-full h-12 rounded-[10px] bg-[#E8621A] text-white text-[15px] font-[700]
                   hover:bg-[#C9521A] transition-colors disabled:opacity-60"
      >
        {pending ? "Publishing…" : "Publish Listing"}
      </button>
    </form>
  );
}
