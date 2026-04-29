"use client";

import { useCallback, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";

export function GoogleSignInButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (idToken: string) => authClient.callbackGoogle(idToken),
    onSuccess: async (data) => {
      // Store tokens in httpOnly cookies via the session API route
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      });
      const redirect = searchParams.get("redirect") ?? "/";
      router.replace(redirect);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSuccess = useCallback((credentialResponse: CredentialResponse) => {
    setError("");
    if (credentialResponse.credential) {
      console.log("Google sign-in successful, token received, sending to backend...");
      mutation.mutate(credentialResponse.credential);
    } else {
      setError("No credential received from Google. Please try again.");
    }
  }, [mutation]);

  const handleError = useCallback(() => {
    setError("Failed to sign in with Google. Please try again.");
  }, []);

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-center" style={{ color: "var(--destructive)" }}>
          {error}
        </p>
      )}

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          locale="en"
        />
      </div>

      {mutation.isPending && (
        <p className="text-xs text-center" style={{ color: "var(--ss-text-muted)" }}>
          Signing in…
        </p>
      )}

      <div
        className="flex items-center gap-3 my-4"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
        <span className="text-xs" style={{ color: "var(--ss-text-muted)" }}>
          or
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
      </div>
    </div>
  );
}
