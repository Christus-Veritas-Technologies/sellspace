"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { clearSession, SESSION_QUERY_KEY } from "@/lib/session-client";

export default function LogoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    clearSession()
      .catch(() => undefined)
      .finally(() => {
        queryClient.setQueryData(SESSION_QUERY_KEY, {
          isAuthenticated: false,
          user: null,
        });
        void queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
        router.replace("/login");
      });
  }, [queryClient, router]);

  return (
    <div className="text-center py-4">
      <p className="text-[14px]" style={{ color: "var(--ss-text-muted)" }}>
        Signing you out…
      </p>
    </div>
  );
}
