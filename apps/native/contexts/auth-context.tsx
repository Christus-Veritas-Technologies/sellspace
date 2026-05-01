import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { tokenStorage } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthContextValue = {
  isSignedIn: boolean | null;
  signIn: (accessToken: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    tokenStorage.getAccessToken().then((token) => {
      setIsSignedIn(!!token);
    });
  }, []);

  const signIn = useCallback(async (accessToken: string, refreshToken: string) => {
    await tokenStorage.setTokens(accessToken, refreshToken);
    setIsSignedIn(true);
  }, []);

  const signOut = useCallback(async () => {
    await tokenStorage.clearTokens();
    setIsSignedIn(false);
  }, []);

  // Render nothing while loading the token from secure store
  if (isSignedIn === null) return null;

  return (
    <AuthContext.Provider value={{ isSignedIn, signIn, signOut }}>
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
