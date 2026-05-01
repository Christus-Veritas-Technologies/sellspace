import type { Area } from "react-easy-crop";

const AVATAR_OUTPUT_SIZE = 512;
const LISTING_OUTPUT_SIZE = 1200;

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the selected image."));
    image.src = src;
  });
}

export async function createCroppedAvatarFile(
  imageSrc: string,
  cropAreaPixels: Area,
  originalFileName: string,
): Promise<File> {
  return createSquareCroppedFile(imageSrc, cropAreaPixels, originalFileName, {
    outputSize: AVATAR_OUTPUT_SIZE,
    fallbackBaseName: "avatar",
  });
}

export async function createCroppedListingImageFile(
  imageSrc: string,
  cropAreaPixels: Area,
  originalFileName: string,
): Promise<File> {
  return createSquareCroppedFile(imageSrc, cropAreaPixels, originalFileName, {
    outputSize: LISTING_OUTPUT_SIZE,
    fallbackBaseName: "listing-image",
  });
}

async function createSquareCroppedFile(
  imageSrc: string,
  cropAreaPixels: Area,
  originalFileName: string,
  options: {
    outputSize: number;
    fallbackBaseName: string;
  },
): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = options.outputSize;
  canvas.height = options.outputSize;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Image editing is not supported in this browser.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    cropAreaPixels.x,
    cropAreaPixels.y,
    cropAreaPixels.width,
    cropAreaPixels.height,
    0,
    0,
    options.outputSize,
    options.outputSize,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.9);
  });

  if (!blob) {
    throw new Error("Unable to prepare the cropped image.");
  }

  const baseName = originalFileName.replace(/\.[^.]+$/, "") || options.fallbackBaseName;
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}