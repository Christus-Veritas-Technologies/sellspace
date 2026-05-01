"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Camera01Icon } from "hugeicons-react";
import { uploadProfilePicture } from "@/lib/uploads";
import { createCroppedAvatarFile } from "@/lib/crop-image";
import { Avatar } from "@/components/avatar";

const DEFAULT_CROP = { x: 0, y: 0 };

export function AvatarUpload({
  displayName,
  currentUrl,
  onSuccess,
}: {
  displayName: string;
  currentUrl: string | null;
  onSuccess: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, startUpload] = useTransition();
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState(DEFAULT_CROP);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  function resetEditor() {
    setSelectedFile(null);
    setCrop(DEFAULT_CROP);
    setZoom(1);
    setCroppedAreaPixels(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (!files?.[0]) return;

    const file = files[0];

    if (file.size > 2097152) {
      setError("File must be smaller than 2MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("File must be JPEG, PNG, or WebP");
      return;
    }

    setError("");
    setSelectedFile(file);
  }

  function handleCropComplete(_: Area, pixels: Area) {
    setCroppedAreaPixels(pixels);
  }

  function handleSaveCrop() {
    if (!selectedFile || !previewUrl || !croppedAreaPixels) return;

    setError("");
    startUpload(async () => {
      try {
        const croppedFile = await createCroppedAvatarFile(previewUrl, croppedAreaPixels, selectedFile.name);
        const result = await uploadProfilePicture(croppedFile);
        onSuccess(result.avatarUrl);
        resetEditor();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar name={displayName} avatarUrl={currentUrl} size={96} className="border-4 border-[#E2E2DC]" />

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="hidden"
            aria-label="Upload profile picture"
          />

          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#E8621A] text-white transition-colors hover:bg-[#C9521A] disabled:opacity-60"
            aria-label="Upload avatar"
          >
            <Camera01Icon size={14} color="#FFFFFF" />
          </button>
        </div>

        {error && <p className="text-center text-[13px] text-[#DC2626]">{error}</p>}
        {uploading && <p className="text-[13px] text-[#8A8A82]">Uploading...</p>}
      </div>

      {selectedFile && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-4 sm:items-center sm:pb-0"
          onClick={(event) => {
            if (event.target === event.currentTarget && !uploading) {
              resetEditor();
            }
          }}
        >
          <div className="w-full max-w-lg rounded-[16px] bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[18px] font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
                  Adjust your profile photo
                </h2>
                <p className="mt-1 text-[13px] text-[#8A8A82]">
                  Crop the image to a square. We&apos;ll save it at 512 x 512.
                </p>
              </div>
              <button
                type="button"
                onClick={resetEditor}
                disabled={uploading}
                className="rounded-full bg-[#EFEFEB] px-3 py-1 text-[12px] font-[600] text-[#1A1A18] disabled:opacity-60"
              >
                Cancel
              </button>
            </div>

            <div className="relative h-[280px] overflow-hidden rounded-[14px] bg-[#1A1A18] sm:h-[320px]">
              <Cropper
                image={previewUrl}
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
                onClick={resetEditor}
                disabled={uploading}
                className="flex-1 rounded-[10px] border border-[#E2E2DC] py-2.5 text-[14px] font-[600] text-[#1A1A18] transition-colors hover:bg-[#EFEFEB] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCrop}
                disabled={uploading || !croppedAreaPixels}
                className="flex-1 rounded-[10px] bg-[#0D3B2E] py-2.5 text-[14px] font-[600] text-[#FAFAF8] transition-colors hover:bg-[#0A2E24] disabled:opacity-60"
              >
                {uploading ? "Saving..." : "Use this photo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
