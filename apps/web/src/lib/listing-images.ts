export const DEFAULT_LISTING_IMAGE_URL = "/icon.png";

export function getPrimaryListingImage(images: Array<{ url: string }> | null | undefined) {
  return images?.[0]?.url ?? DEFAULT_LISTING_IMAGE_URL;
}