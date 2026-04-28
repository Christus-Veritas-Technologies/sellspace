import { randomInt } from "node:crypto";

/**
 * Generates a cryptographically secure 6-digit OTP string.
 * Always returns exactly 6 characters, zero-padded.
 */
export function generateOtp(): string {
  return randomInt(0, 999999).toString().padStart(6, "0");
}
