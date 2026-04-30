import { randomInt } from "node:crypto";
import { randomBytes } from "node:crypto";

/**
 * Generates a cryptographically secure 6-digit OTP string.
 * Always returns exactly 6 characters, zero-padded.
 */
export function generateOtp(): string {
  return randomInt(0, 999999).toString().padStart(6, "0");
}

/**
 * Generates a secure magic link token (base64-encoded 32 bytes).
 * Suitable for single-use authentication links.
 */
export function generateMagicLinkToken(): string {
  return randomBytes(32).toString("base64url");
}
