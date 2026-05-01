import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { authApi, tokenStorage } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthContextValue = {
  isSignedIn: boolean | null;
  userId: string | null;
  signIn: (accessToken: string, refreshToken: string, userId: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Constants ────────────────────────────────────────────────────────────────

const USER_ID_KEY = "ss_user_id";

// ─── Provider ─────────────────────────────────────────────────────────────────

import * as SecureStore from "expo-secure-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      tokenStorage.getAccessToken(),
      SecureStore.getItemAsync(USER_ID_KEY)
    ]).then(([token, id]) => {
      setIsSignedIn(!!token);
      setUserId(id);
    });
  }, []);

  const signIn = useCallback(async (accessToken: string, refreshToken: string, id: string) => {
    await Promise.all([
      tokenStorage.setTokens(accessToken, refreshToken),
      SecureStore.setItemAsync(USER_ID_KEY, id)
    ]);
    setIsSignedIn(true);
    setUserId(id);
  }, []);

  const signOut = useCallback(async () => {
    await Promise.all([
      tokenStorage.clearTokens(),
      SecureStore.deleteItemAsync(USER_ID_KEY)
    ]);
    setIsSignedIn(false);
    setUserId(null);
  }, []);

  // Render nothing while loading the token from secure store
  if (isSignedIn === null) return null;

  return (
    <AuthContext.Provider value={{ isSignedIn, userId, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
