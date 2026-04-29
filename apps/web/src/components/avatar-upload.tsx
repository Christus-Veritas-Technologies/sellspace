"use client";

import { useRef, useState, useTransition } from "react";
import { uploadProfilePicture } from "@/lib/uploads";

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

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (!files?.[0]) return;

    const file = files[0];

    // Validate size
    if (file.size > 2097152) {
      setError("File must be smaller than 2MB");
      return;
    }

    // Validate type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("File must be JPEG, PNG, or WebP");
      return;
    }

    setError("");
    startUpload(async () => {
      try {
        const result = await uploadProfilePicture(file);
        onSuccess(result.avatarUrl);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Avatar display */}
        <div
          className="w-24 h-24 rounded-full bg-[#0D3B2E] flex items-center justify-center shrink-0 border-4 border-[#E2E2DC]"
        >
          {currentUrl ? (
            <img src={currentUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
          ) : (
            <span className="text-[20px] font-[700] text-[#FAFAF8]">{initials}</span>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
        />

        {/* Upload button overlay */}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#E8621A] text-white text-[14px] font-[700]
                     hover:bg-[#C9521A] transition-colors disabled:opacity-60 flex items-center justify-center"
          aria-label="Upload avatar"
        >
          📷
        </button>
      </div>

      {error && (
        <p className="text-[13px] text-[#DC2626] text-center">{error}</p>
      )}

      {uploading && (
        <p className="text-[13px] text-[#8A8A82]">Uploading...</p>
      )}
    </div>
  );
}
