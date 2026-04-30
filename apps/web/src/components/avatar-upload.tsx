"use client";

import { useRef, useState, useTransition } from "react";
import { Camera01Icon } from "hugeicons-react";
import { uploadProfilePicture } from "@/lib/uploads";
import { Avatar } from "@/components/avatar";

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
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#E8621A] text-white
                     hover:bg-[#C9521A] transition-colors disabled:opacity-60 flex items-center justify-center"
          aria-label="Upload avatar"
        >
          <Camera01Icon size={14} color="#FFFFFF" />
        </button>
      </div>

      {error && <p className="text-[13px] text-[#DC2626] text-center">{error}</p>}
      {uploading && <p className="text-[13px] text-[#8A8A82]">Uploading...</p>}
    </div>
  );
}
