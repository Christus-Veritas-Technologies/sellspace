import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { env } from "@sellspace/env/server";

// ─── R2 Client ────────────────────────────────────────────────────────────────

const LOCAL_UPLOAD_ROOT = fileURLToPath(new URL("../../uploads/", import.meta.url));

function hasPlaceholder(value: string): boolean {
  return value.includes("YOUR_");
}

const HAS_R2_CONFIG = ![
  env.R2_ACCOUNT_ID,
  env.R2_ACCESS_KEY_ID,
  env.R2_SECRET_ACCESS_KEY,
  env.R2_BUCKET_NAME,
  env.R2_PUBLIC_URL,
].some(hasPlaceholder);

export const r2Client = new S3Client({
  region: "auto",
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
});

// ─── Upload helpers ───────────────────────────────────────────────────────────

export interface UploadInfo {
  key: string;
  contentType: string;
  buffer: Buffer;
}

function sanitizeUploadKey(key: string): string | null {
  const normalized = key
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean);

  if (normalized.some((segment) => segment === "." || segment === "..")) {
    return null;
  }

  return normalized.join("/");
}

function localUploadPath(key: string): string | null {
  const sanitized = sanitizeUploadKey(key);
  if (!sanitized) return null;
  return join(LOCAL_UPLOAD_ROOT, ...sanitized.split("/"));
}

export function resolveLocalUploadPath(key: string): string | null {
  return localUploadPath(key);
}

/**
 * Upload a file to Cloudflare R2 and return the public URL
 */
export async function uploadToR2(info: UploadInfo, publicOrigin?: string): Promise<string> {
  if (!HAS_R2_CONFIG) {
    const filePath = localUploadPath(info.key);
    if (!filePath || !publicOrigin) {
      throw new Error("Local upload storage is not configured correctly.");
    }

    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, info.buffer);

    return `${publicOrigin.replace(/\/$/, "")}/uploads/${info.key}`;
  }

  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: info.key,
    Body: info.buffer,
    ContentType: info.contentType,
  });

  await r2Client.send(command);
  return `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${info.key}`;
}

/**
 * Delete a file from Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (!HAS_R2_CONFIG) {
    const filePath = localUploadPath(key);
    if (!filePath) return;

    try {
      await unlink(filePath);
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code !== "ENOENT") throw err;
    }
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Generate a unique key for uploads with timestamp
 */
export function generateR2Key(prefix: string, originalFileName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const ext = originalFileName.split(".").pop() || "bin";
  return `${prefix}/${timestamp}-${random}.${ext}`;
}

/**
 * Validate file size (default 5MB)
 */
export function validateFileSize(buffer: Buffer, maxBytes = 5242880): boolean {
  return buffer.length <= maxBytes;
}

/**
 * Validate file mimetype
 */
export function validateMimeType(mimeType: string, allowed: string[]): boolean {
  return allowed.includes(mimeType);
}
