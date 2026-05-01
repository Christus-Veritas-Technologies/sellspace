"use client";

import { useCallback, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { persistSession, SESSION_QUERY_KEY, type SessionUser } from "@/lib/session-client";

export function GoogleSignInButton({ onSuccess: onSuccessProp }: { onSuccess?: () => void } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (idToken: string) => authClient.callbackGoogle(idToken),
    onSuccess: async (data) => {
      try {
        await persistSession({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });

        queryClient.setQueryData(SESSION_QUERY_KEY, {
          isAuthenticated: true,
          user: data.user as SessionUser,
        });
        void queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });

        if (onSuccessProp) {
          onSuccessProp();
        } else {
          const redirect = searchParams.get("redirect") ?? "/";
          router.replace(redirect);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to save session.");
      }
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
