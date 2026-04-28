import * as SecureStore from "expo-secure-store";
import { env } from "@sellspace/env/native";

const ACCESS_TOKEN_KEY = "ss_access_token";
const REFRESH_TOKEN_KEY = "ss_refresh_token";

// ─── Token storage ────────────────────────────────────────────────────────────

export const tokenStorage = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),

  setTokens: async (accessToken: string, refreshToken: string) => {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },

  clearTokens: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};

// ─── API client ───────────────────────────────────────────────────────────────

const BASE = env.EXPO_PUBLIC_SERVER_URL.replace(/\/$/, "");

export type VerifyOtpResult = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; displayName: string };
};

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Something went wrong.");
  }

  return data as T;
}

export const authApi = {
  requestOtp: (email: string) =>
    post<{ message: string }>("/api/auth/request-otp", { email }),

  verifyOtp: (email: string, otp: string) =>
    post<VerifyOtpResult>("/api/auth/verify-otp", { email, otp }),

  refresh: (refreshToken: string) =>
    post<{ accessToken: string }>("/api/auth/refresh", { refreshToken }),
};
