import { env } from "@sellspace/env/native";
import { authApi, tokenStorage } from "./auth";

const BASE = env.EXPO_PUBLIC_SERVER_URL;

async function authorizedFetch(path: string, init: RequestInit): Promise<Response> {
  const makeHeaders = (token: string | null) => {
    const headers = new Headers(init.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  };

  const accessToken = await tokenStorage.getAccessToken();
  let res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: makeHeaders(accessToken),
  });

  if (res.status !== 401) {
    return res;
  }

  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return res;
  }

  try {
    const refresh = await authApi.refresh(refreshToken);
    await tokenStorage.setTokens(refresh.accessToken, refreshToken);

    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: makeHeaders(refresh.accessToken),
    });
  } catch {
    return res;
  }

  return res;
}

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
  const uploadBlob = blob.type ? blob : new Blob([blob], { type: mimeType });
  formData.append("file", uploadBlob, fileName);

  const res = await authorizedFetch("/api/uploads/profile", {
    method: "POST",
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

  const res = await authorizedFetch("/api/uploads/listing", {
    method: "POST",
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
  const res = await authorizedFetch(`/api/uploads/listing/${imageId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageId }),
  });

  if (!res.ok) {
    const error = (await res.json()) as { error?: string };
    throw new Error(error.error ?? "Delete failed");
  }
}
