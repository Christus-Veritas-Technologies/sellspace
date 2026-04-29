"use client";

import { Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";

const OTP_LENGTH = 6;

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const redirect = searchParams.get("redirect") ?? "/";

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [apiError, setApiError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const mutation = useMutation({
    mutationFn: (otp: string) => authClient.verifyOtp(email, otp),
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
      router.replace(redirect);
    },
    onError: (err: Error) => {
      setApiError(err.message);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    },
  });

  function handleDigitChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setApiError("");

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    const otp = next.join("");
    if (otp.length === OTP_LENGTH && !next.includes("")) {
      mutation.mutate(otp);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    setApiError("");

    const lastFilledIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastFilledIndex]?.focus();

    if (pasted.length === OTP_LENGTH) {
      mutation.mutate(pasted);
    }
  }

  return (
    <>
      <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--foreground)" }}>
        Enter your code
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--ss-text-muted)" }}>
        We sent a 6-digit code to{" "}
        <span className="font-semibold" style={{ color: "var(--foreground)" }}>
          {email || "your email"}
        </span>
        . It expires in 10 minutes.
      </p>

      {/* 6 digit inputs */}
      <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
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
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={mutation.isPending}
            className="w-11 h-12 text-center text-xl font-bold rounded-[10px] border outline-none transition-colors"
            style={{
              borderColor: apiError ? "var(--destructive)" : digit ? "var(--ring)" : "var(--border)",
              backgroundColor: "var(--ss-surface-2)",
              color: "var(--foreground)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ring)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = digit ? "var(--ring)" : "var(--border)")}
          />
        ))}
      </div>

      {apiError && (
        <p className="text-xs text-center mb-3" style={{ color: "var(--destructive)" }}>
          {apiError}
        </p>
      )}

      {mutation.isPending && (
        <p className="text-xs text-center mb-3" style={{ color: "var(--ss-text-muted)" }}>
          Verifying…
        </p>
      )}

      <button
        type="button"
        onClick={() => router.push(`/auth/login`)}
        className="w-full text-sm text-center"
        style={{ color: "var(--ss-text-muted)" }}
      >
        Wrong email?{" "}
        <span className="font-semibold" style={{ color: "var(--accent)" }}>
          Go back
        </span>
      </button>
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
