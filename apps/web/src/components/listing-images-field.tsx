"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { createCroppedListingImageFile } from "@/lib/crop-image";

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DEFAULT_CROP = { x: 0, y: 0 };
const MAX_IMAGE_COUNT = 10;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function getSelectionError(existingCount: number, files: File[]) {
  if (existingCount + files.length > MAX_IMAGE_COUNT) {
    return "Maximum 10 images per listing.";
  }

  for (const file of files) {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return "Each image must be under 5MB.";
    }

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      return "Only JPEG, PNG, and WebP images are allowed.";
    }
  }

  return "";
}

export function ListingImagesField({
  files,
  onChange,
  disabled = false,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [croppedBatch, setCroppedBatch] = useState<File[]>([]);
  const [cropIndex, setCropIndex] = useState(0);
  const [crop, setCrop] = useState(DEFAULT_CROP);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(null);

  const currentFile = cropQueue[cropIndex] ?? null;

  useEffect(() => {
    const nextPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(nextPreviewUrls);

    return () => {
      nextPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  useEffect(() => {
    if (!currentFile) {
      setCurrentPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(currentFile);
    setCurrentPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [currentFile]);

  function resetCropState() {
    setCropQueue([]);
    setCroppedBatch([]);
    setCropIndex(0);
    setCrop(DEFAULT_CROP);
    setZoom(1);
    setCroppedAreaPixels(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.currentTarget.files || []);
    if (nextFiles.length === 0) {
      return;
    }

    const nextError = getSelectionError(files.length, nextFiles);
    if (nextError) {
      setError(nextError);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    setError("");
    setCropQueue(nextFiles);
    setCroppedBatch([]);
    setCropIndex(0);
    setCrop(DEFAULT_CROP);
    setZoom(1);
    setCroppedAreaPixels(null);
  }

  function handleCropComplete(_: Area, pixels: Area) {
    setCroppedAreaPixels(pixels);
  }

  async function handleSaveCrop() {
    if (!currentFile || !currentPreviewUrl || !croppedAreaPixels) {
      return;
    }

    try {
      const croppedFile = await createCroppedListingImageFile(
        currentPreviewUrl,
        croppedAreaPixels,
        currentFile.name,
      );
      const nextBatch = [...croppedBatch, croppedFile];

      if (cropIndex >= cropQueue.length - 1) {
        onChange([...files, ...nextBatch]);
        resetCropState();
        return;
      }

      setCroppedBatch(nextBatch);
      setCropIndex((current) => current + 1);
      setCrop(DEFAULT_CROP);
      setZoom(1);
      setCroppedAreaPixels(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function handleRemoveImage(index: number) {
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
    setError("");
  }

  const cropStep = cropIndex + 1;

  return (
    <div>
      <p className="mb-2 text-[12px] text-[#8A8A82]">
        Upload up to 10 images. Each image is cropped to 1:1 before upload. Leave this blank to use the Sellspace icon.
      </p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled || files.length >= MAX_IMAGE_COUNT || cropQueue.length > 0}
        className="hidden"
      />

      {files.length < MAX_IMAGE_COUNT && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || cropQueue.length > 0}
          className="mb-3 h-11 w-full rounded-[10px] border-2 border-dashed border-[#E2E2DC] bg-[#FAFAF8] px-4 text-[14px] font-[600] text-[#1A1A18] transition-colors hover:bg-[#F2F2EF] disabled:opacity-60"
        >
          Select images ({files.length}/{MAX_IMAGE_COUNT})
        </button>
      )}

      {error && <p className="mb-2 text-[12px] text-[#DC2626]">{error}</p>}

      {previewUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previewUrls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative h-20 w-20 overflow-hidden rounded-[8px] border border-[#E2E2DC]"
            >
              <img src={url} alt="Selected listing" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                disabled={disabled}
                className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/50 text-xl text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-60"
                aria-label="Remove image"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {currentFile && currentPreviewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-4 sm:items-center sm:pb-0"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              resetCropState();
            }
          }}
        >
          <div className="w-full max-w-lg rounded-[16px] bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[18px] font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
                  Crop product image
                </h2>
                <p className="mt-1 text-[13px] text-[#8A8A82]">
                  Image {cropStep} of {cropQueue.length}. Crop this image to a square before upload.
                </p>
              </div>
              <button
                type="button"
                onClick={resetCropState}
                className="rounded-full bg-[#EFEFEB] px-3 py-1 text-[12px] font-[600] text-[#1A1A18]"
              >
                Cancel
              </button>
            </div>

            <div className="relative h-[280px] overflow-hidden rounded-[14px] bg-[#1A1A18] sm:h-[320px]">
              <Cropper
                image={currentPreviewUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[12px] font-[600] text-[#4A4A45]">
                <span>Zoom</span>
                <span>{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full accent-[#E8621A]"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={resetCropState}
                className="flex-1 rounded-[10px] border border-[#E2E2DC] py-2.5 text-[14px] font-[600] text-[#1A1A18] transition-colors hover:bg-[#EFEFEB]"
              >
                Cancel batch
              </button>
              <button
                type="button"
                onClick={handleSaveCrop}
                disabled={!croppedAreaPixels}
                className="flex-1 rounded-[10px] bg-[#0D3B2E] py-2.5 text-[14px] font-[600] text-[#FAFAF8] transition-colors hover:bg-[#0A2E24] disabled:opacity-60"
              >
                {cropStep >= cropQueue.length ? "Use image" : "Use and continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}