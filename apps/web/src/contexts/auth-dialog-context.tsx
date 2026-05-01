"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { AuthDialog } from "@/components/auth-dialog";

// ─── Context ─────────────────────────────────────────────────────────────────

type AuthDialogContextValue = {
  openAuthDialog: () => void;
};

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openAuthDialog = useCallback(() => setOpen(true), []);

  return (
    <AuthDialogContext.Provider value={{ openAuthDialog }}>
      {children}
      <AuthDialog open={open} onOpenChange={setOpen} />
    </AuthDialogContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuthDialog() {
  const ctx = useContext(AuthDialogContext);
  if (!ctx) throw new Error("useAuthDialog must be used within AuthDialogProvider");
  return ctx;
}
