"use client";

import { Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [inputError, setInputError] = useState("");

  const mutation = useMutation({
    mutationFn: () => authClient.requestOtp(email),
    onSuccess: () => {
      const redirect = searchParams.get("redirect") ?? "";
      const params = new URLSearchParams({ email });
      if (redirect) params.set("redirect", redirect);
      router.push(`/auth/verify?${params.toString()}` as never);
    },
    onError: (err: Error) => {
      setInputError(err.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInputError("");

    if (!email.trim()) {
      setInputError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInputError("Enter a valid email address.");
      return;
    }

    mutation.mutate();
  }

  return (
    <>
      <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--foreground)" }}>
        Sign in to Sellspace
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--ss-text-muted)" }}>
        Enter your email and we&apos;ll send you a sign-in code.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
          Email address
        </label>
        <input
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={mutation.isPending}
          className="w-full rounded-[10px] border px-3.5 py-2.5 text-sm outline-none transition-colors"
          style={{
            borderColor: inputError ? "var(--destructive)" : "var(--border)",
            backgroundColor: "var(--ss-surface-2)",
            color: "var(--foreground)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ring)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = inputError ? "var(--destructive)" : "var(--border)")}
        />

        {inputError && (
          <p className="mt-1.5 text-xs" style={{ color: "var(--destructive)" }}>
            {inputError}
          </p>
        )}

        {mutation.error && !inputError && (
          <p className="mt-1.5 text-xs" style={{ color: "var(--destructive)" }}>
            {mutation.error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-4 w-full rounded-[10px] px-5 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60"
          style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
        >
          {mutation.isPending ? "Sending code…" : "Continue with email"}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

