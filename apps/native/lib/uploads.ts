import { env } from "@sellspace/env/native";
import { tokenStorage } from "./auth";

const BASE = env.EXPO_PUBLIC_SERVER_URL;

/**
 * Upload a profile picture to the server
 */
export async function uploadProfilePictureNative(
  fileUri: string,
  fileName: string,
  mimeType: string,
): Promise<{ avatarUrl: string }> {
  const formData = new FormData();

  // Read file and append as blob
  const response = await fetch(fileUri);
  const blob = await response.blob();
  formData.append("file", blob, fileName);

  const token = await tokenStorage.getAccessToken();
  const res = await fetch(`${BASE}/api/uploads/profile`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const error = (await res.json()) as { error?: string };
    throw new Error(error.error ?? "Upload failed");
  }

  return (await res.json()) as { avatarUrl: string };
}

/**
 * Upload listing images to the server
 */
export async function uploadListingImagesNative(
  listingId: string,
  imageUris: string[],
  fileNames: string[],
): Promise<{ images: { id: string; url: string; order: number }[] }> {
  const formData = new FormData();
  formData.append("listingId", listingId);

  // Upload each image
  for (let i = 0; i < imageUris.length; i++) {
    const response = await fetch(imageUris[i]);
    const blob = await response.blob();
    formData.append("files", blob, fileNames[i]);
  }

  const token = await tokenStorage.getAccessToken();
  const res = await fetch(`${BASE}/api/uploads/listing`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const error = (await res.json()) as { error?: string };
    throw new Error(error.error ?? "Upload failed");
  }

  return (await res.json()) as { images: { id: string; url: string; order: number }[] };
}

/**
 * Delete a listing image
 */
export async function deleteListingImageNative(imageId: string): Promise<void> {
  const token = await tokenStorage.getAccessToken();
  const res = await fetch(`${BASE}/api/uploads/listing/${imageId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ imageId }),
  });

  if (!res.ok) {
    const error = (await res.json()) as { error?: string };
    throw new Error(error.error ?? "Delete failed");
  }
}
