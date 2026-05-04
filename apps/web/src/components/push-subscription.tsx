"use client";

import { useEffect } from "react";

import { env } from "@sellspace/env/web";

// ─── Helper: convert VAPID base64 public key to Uint8Array ───────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PushSubscription() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return; // Browser does not support push
    }

    void (async () => {
      try {
        // Register (or reuse existing) service worker
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Don't ask yet if already denied
        if (Notification.permission === "denied") return;

        // Request permission (browser may prompt or return cached answer)
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // Subscribe to push (or reuse existing subscription)
        const existing = await registration.pushManager.getSubscription();
        const subscription =
          existing ??
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            ),
          }));

        // Persist subscription to server (idempotent — safe to re-send)
        await fetch("/api/push/web", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        });
      } catch {
        // Non-fatal — push is best-effort
      }
    })();

    // Unsubscribe on unmount (sign-out) by removing the subscription from the server
    return () => {
      void (async () => {
        try {
          const reg = await navigator.serviceWorker.getRegistration("/");
          if (!reg) return;
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            await sub.unsubscribe();
            await fetch("/api/push/web", { method: "DELETE" });
          }
        } catch {
          // Ignore cleanup errors
        }
      })();
    };
  }, []);

  return null;
}
