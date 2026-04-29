"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/session", { method: "DELETE" }).finally(() => {
      router.replace("/auth/login");
    });
  }, [router]);

  return (
    <div className="text-center py-4">
      <p className="text-[14px]" style={{ color: "var(--ss-text-muted)" }}>
        Signing you out…
      </p>
    </div>
  );
}
