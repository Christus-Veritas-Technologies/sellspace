"use client";

import { useEffect, useState } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.error("App Error:", error);
  }, [error]);

  return (
    <main className="bg-[#F2F2EF] min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--ss-surface-2)" }}
          >
            <svg
              className="w-16 h-16"
              style={{ color: "var(--destructive)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0 0v2m-6-9h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2v-11a2 2 0 012-2z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-8">
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
          >
            Something went wrong
          </h1>
          <p
            className="text-base"
            style={{ color: "var(--ss-text-secondary)" }}
          >
            {isClient && error.message ? (
              <>We encountered an error: &quot;{error.message}&quot;</>
            ) : (
              <>An unexpected error occurred. Please try again.</>
            )}
          </p>
          {error.digest && (
            <p
              className="text-xs font-mono mt-2 p-2 rounded"
              style={{
                backgroundColor: "var(--ss-surface-2)",
                color: "var(--ss-text-muted)",
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-[10px] font-semibold text-center transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--accent-foreground)",
            }}
          >
            Try again
          </button>
          <a
            href="/"
            className="block w-full py-3 px-4 rounded-[10px] font-semibold text-center transition-colors border"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
              backgroundColor: "transparent",
            }}
          >
            Go home
          </a>
        </div>

        {/* Support */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--ss-text-muted)" }}>
            Still having issues?{" "}
            <a
              href="mailto:support@sellspace.co.zw"
              className="font-semibold hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
