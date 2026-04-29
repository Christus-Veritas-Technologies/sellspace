"use client";

import { useRef, useState, useTransition } from "react";
import { uploadListingImages, deleteListingImage } from "@/lib/uploads";

export interface ListingImageItem {
  id: string;
  url: string;
  order: number;
}

export function ListingImageUpload({
  listingId,
  images,
  onImagesChange,
}: {
  listingId: string;
  images: ListingImageItem[];
  onImagesChange: (images: ListingImageItem[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, startUpload] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.currentTarget.files || []);
    if (files.length === 0) return;

    // Validate total images
    if (images.length + files.length > 10) {
      setError("Maximum 10 images per listing");
      return;
    }

    // Validate each file
    for (const file of files) {
      if (file.size > 5242880) {
        setError("Each file must be smaller than 5MB");
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Files must be JPEG, PNG, or WebP");
        return;
      }
    }

    setError("");
    startUpload(async () => {
      try {
        const result = await uploadListingImages(listingId, files);
        onImagesChange([...images, ...result.images]);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  function handleDeleteImage(imageId: string) {
    startDelete(async () => {
      try {
        await deleteListingImage(imageId);
        onImagesChange(images.filter((img) => img.id !== imageId));
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[13px] font-[600] text-[#1A1A18] mb-2">
          Images <span className="text-[#E8621A]">*</span>
          <span className="text-[#8A8A82] font-[400]"> ({images.length}/10)</span>
        </label>

        {/* File input */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={uploading || images.length >= 10}
          className="hidden"
        />

        {/* Upload button */}
        {images.length < 10 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || deleting}
            className="w-full h-11 px-4 rounded-[10px] border-2 border-dashed border-[#E2E2DC] bg-[#FAFAF8]
                       text-[14px] font-[600] text-[#1A1A18] hover:bg-[#F2F2EF] transition-colors disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "+ Add images"}
          </button>
        )}
      </div>

      {error && (
        <p className="text-[12px] text-[#DC2626]">{error}</p>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square rounded-[8px] overflow-hidden border border-[#E2E2DC] group"
            >
              <img src={img.url} alt="Listing" className="w-full h-full object-cover" />

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDeleteImage(img.id)}
                disabled={deleting}
                className="absolute inset-0 w-full h-full bg-black/50 opacity-0 group-hover:opacity-100
                           transition-opacity flex items-center justify-center text-white text-2xl font-[700]
                           hover:bg-black/70 disabled:opacity-60"
                aria-label="Delete image"
              >
                ×
              </button>

              {/* Primary badge */}
              {img.order === 0 && (
                <div className="absolute top-1 left-1 bg-[#0D3B2E] text-white text-[10px] font-[700] px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
