"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@sellspace/ui/components/sonner";

import { env } from "@sellspace/env/web";
import { AuthDialogProvider } from "@/contexts/auth-dialog-context";
import { useNotifications } from "@/lib/use-notifications";
import { ThemeProvider } from "./theme-provider";

function NotificationManager() {
  useNotifications();
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <AuthDialogProvider>
            <NotificationManager />
            {children}
          </AuthDialogProvider>
          <Toaster richColors />
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
