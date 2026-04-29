import { env } from "@sellspace/env/web";

const BASE = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");

export type ApiError = { error: string };

export type RequestOtpResponse = { message: string };
export type VerifyOtpResponse = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; displayName: string };
};
export type GoogleCallbackResponse = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; displayName: string; avatarUrl?: string };
};
export type RefreshResponse = { accessToken: string };

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as ApiError).error ?? "Something went wrong.");
  }

  return data as T;
}

export const authClient = {
  requestOtp: (email: string) =>
    apiFetch<RequestOtpResponse>("/api/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email: string, otp: string) =>
    apiFetch<VerifyOtpResponse>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),

  callbackGoogle: (idToken: string) =>
    apiFetch<GoogleCallbackResponse>("/api/auth/callback/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),

  refresh: (refreshToken: string) =>
    apiFetch<RefreshResponse>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
};
