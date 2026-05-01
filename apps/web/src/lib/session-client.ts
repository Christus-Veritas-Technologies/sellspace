"use client";

export const SESSION_QUERY_KEY = ["session"] as const;

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
};

export type SessionState = {
  isAuthenticated: boolean;
  user: SessionUser | null;
};

function readSessionHint(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((cookie) => cookie.trim().startsWith("ss_has_session="));
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json() as { error?: string };
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function getOptimisticSessionState(): SessionState {
  return {
    isAuthenticated: readSessionHint(),
    user: null,
  };
}

export async function fetchSession(): Promise<SessionState> {
  const res = await fetch("/api/auth/session", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Unable to load session."));
  }

  const data = await res.json() as SessionState;
  return {
    isAuthenticated: data.isAuthenticated,
    user: data.user,
  };
}

export async function persistSession(tokens: { accessToken: string; refreshToken: string }): Promise<void> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(tokens),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Unable to save session."));
  }
}

export async function clearSession(): Promise<void> {
  const res = await fetch("/api/auth/session", {
    method: "DELETE",
    credentials: "same-origin",
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Unable to clear session."));
  }
}