import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@sellspace/env/server";

// ─── R2 Client ────────────────────────────────────────────────────────────────

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

/**
 * Upload a file to Cloudflare R2 and return the public URL
 */
export async function uploadToR2(info: UploadInfo): Promise<string> {
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
