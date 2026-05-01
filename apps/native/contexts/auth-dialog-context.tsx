import { createContext, useCallback, useContext, useState } from "react";

import { AuthBottomSheet } from "@/components/auth-bottom-sheet";

// ─── Types ─────────────────────────────────────────────────────────────────────

type AuthDialogContextValue = {
  openAuthDialog: () => void;
};

// ─── Context ───────────────────────────────────────────────────────────────────

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openAuthDialog = useCallback(() => setOpen(true), []);

  return (
    <AuthDialogContext.Provider value={{ openAuthDialog }}>
      {children}
      <AuthBottomSheet visible={open} onClose={() => setOpen(false)} />
    </AuthDialogContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAuthDialog() {
  const ctx = useContext(AuthDialogContext);
  if (!ctx) throw new Error("useAuthDialog must be used within AuthDialogProvider");
  return ctx;
}
