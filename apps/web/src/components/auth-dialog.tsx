"use client";

import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { persistSession, SESSION_QUERY_KEY, type SessionUser } from "@/lib/session-client";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "email" | "otp";

const OTP_LENGTH = 6;

// ─── Auth Dialog ──────────────────────────────────────────────────────────────

export function AuthDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const close = useCallback(() => {
    onOpenChange(false);
    // Reset state after close animation (brief timeout)
    setTimeout(() => {
      setStep("email");
      setEmail("");
      setEmailError("");
      setDigits(Array(OTP_LENGTH).fill(""));
      setOtpError("");
    }, 150);
  }, [onOpenChange]);

  const onAuthDone = useCallback(() => {
    router.refresh();
    close();
  }, [router, close]);

  // ── Step 1: request OTP ──────────────────────────────────────────────────

  const requestOtpMutation = useMutation({
    mutationFn: () => authClient.requestOtp(email.trim()),
    onSuccess: () => {
      setStep("otp");
    },
    onError: (err: Error) => {
      setEmailError(err.message);
    },
  });

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      return;
    }

    requestOtpMutation.mutate();
  }

  // ── Step 2: verify OTP ───────────────────────────────────────────────────

  const verifyOtpMutation = useMutation({
    mutationFn: (otp: string) => authClient.verifyOtp(email.trim(), otp),
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

        onAuthDone();
      } catch (err) {
        setOtpError(err instanceof Error ? err.message : "Unable to save session.");
      }
    },
    onError: (err: Error) => {
      setOtpError(err.message);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    },
  });

  function handleDigitChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setOtpError("");

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const otp = next.join("");
    if (otp.length === OTP_LENGTH && !next.includes("")) {
      verifyOtpMutation.mutate(otp);
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    setOtpError("");

    const lastFilledIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastFilledIndex]?.focus();

    if (pasted.length === OTP_LENGTH) {
      verifyOtpMutation.mutate(pasted);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        aria-hidden="true"
        onClick={close}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign in to Sellspace"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-8 shadow-2xl"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Close button */}
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-lg transition-colors hover:bg-[#EFEFEB]"
          style={{ color: "var(--ss-text-muted)" }}
        >
          ✕
        </button>

        {step === "email" && (
          <>
            <h2 className="mb-1 text-lg font-semibold" style={{ color: "var(--foreground)" }}>
              Sign in to Sellspace
            </h2>
            <p className="mb-6 text-sm" style={{ color: "var(--ss-text-muted)" }}>
              Enter your email and we&apos;ll send you a sign-in code.
            </p>

            <GoogleSignInButton onSuccess={onAuthDone} />

            <form onSubmit={handleEmailSubmit} noValidate>
              <label
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                placeholder="you@example.com"
                disabled={requestOtpMutation.isPending}
                className="w-full rounded-[10px] border px-3.5 py-2.5 text-sm outline-none transition-colors"
                style={{
                  borderColor: emailError ? "var(--destructive)" : "var(--border)",
                  backgroundColor: "var(--ss-surface-2)",
                  color: "var(--foreground)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ring)")}
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = emailError
                    ? "var(--destructive)"
                    : "var(--border)")
                }
              />
              {emailError && (
                <p className="mt-1.5 text-xs" style={{ color: "var(--destructive)" }}>
                  {emailError}
                </p>
              )}
              <button
                type="submit"
                disabled={requestOtpMutation.isPending}
                className="mt-4 w-full rounded-[10px] px-5 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60"
                style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
              >
                {requestOtpMutation.isPending ? "Sending code…" : "Continue with email"}
              </button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <h2 className="mb-1 text-lg font-semibold" style={{ color: "var(--foreground)" }}>
              Enter your code
            </h2>
            <p className="mb-6 text-sm" style={{ color: "var(--ss-text-muted)" }}>
              We sent a 6-digit code to{" "}
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                {email}
              </span>
              . It expires in 10 minutes.
            </p>

            <div className="mb-4 flex justify-center gap-2" onPaste={handleOtpPaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={verifyOtpMutation.isPending}
                  className="h-12 w-11 rounded-[10px] border text-center text-xl font-bold outline-none transition-colors"
                  style={{
                    borderColor: otpError
                      ? "var(--destructive)"
                      : digit
                      ? "var(--ring)"
                      : "var(--border)",
                    backgroundColor: "var(--ss-surface-2)",
                    color: "var(--foreground)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ring)")}
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = digit
                      ? "var(--ring)"
                      : "var(--border)")
                  }
                />
              ))}
            </div>

            {otpError && (
              <p className="mb-3 text-center text-xs" style={{ color: "var(--destructive)" }}>
                {otpError}
              </p>
            )}
            {verifyOtpMutation.isPending && (
              <p className="mb-3 text-center text-xs" style={{ color: "var(--ss-text-muted)" }}>
                Verifying…
              </p>
            )}

            <button
              type="button"
              onClick={() => { setStep("email"); setDigits(Array(OTP_LENGTH).fill("")); setOtpError(""); }}
              className="w-full text-center text-sm"
              style={{ color: "var(--ss-text-muted)" }}
            >
              Wrong email?{" "}
              <span className="font-semibold" style={{ color: "var(--accent)" }}>
                Go back
              </span>
            </button>
          </>
        )}
      </div>
    </>,
    document.body,
  );
}
