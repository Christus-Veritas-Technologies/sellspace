import { env } from "@sellspace/env/web";

const BASE_URL = env.NEXT_PUBLIC_SERVER_URL;

async function getAccessToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/token");
    if (res.ok) {
      const data = (await res.json()) as { token: string };
      return data.token;
    }
  } catch {
    // Not authenticated
  }
  return null;
}

export interface UploadProfileResult {
  avatarUrl: string;
}

/**
 * Upload a profile picture to the server
 */
export async function uploadProfilePicture(file: File): Promise<UploadProfileResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/api/uploads/profile`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = (await res.json()) as { error?: string };
    throw new Error(error.error ?? "Upload failed");
  }

  return (await res.json()) as UploadProfileResult;
}

export interface UploadListingResult {
  images: { id: string; url: string; order: number }[];
}

/**
 * Upload listing images to the server
 */
export async function uploadListingImages(
  listingId: string,
  files: File[],
): Promise<UploadListingResult> {
  const formData = new FormData();
  formData.append("listingId", listingId);
  files.forEach((file) => formData.append("files", file));

  const res = await fetch(`${BASE_URL}/api/uploads/listing`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = (await res.json()) as { error?: string };
    throw new Error(error.error ?? "Upload failed");
  }

  return (await res.json()) as UploadListingResult;
}

/**
 * Delete a listing image
 */
export async function deleteListingImage(imageId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/uploads/listing/${imageId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageId }),
  });

  if (!res.ok) {
    const error = (await res.json()) as { error?: string };
    throw new Error(error.error ?? "Delete failed");
  }
}

/**
 * Get file input validation for image uploads
 */
export const imageInputConfig = {
  accept: "image/jpeg,image/png,image/webp",
  multiple: true,
};
