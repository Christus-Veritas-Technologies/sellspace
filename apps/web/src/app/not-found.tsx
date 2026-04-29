import Link from "next/link";

export const metadata = {
  title: "Page Not Found — Sellspace",
};

export default function NotFound() {
  return (
    <main className="bg-[#F2F2EF] min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Illustration placeholder */}
        <div className="mb-8 flex justify-center">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--ss-surface-2)" }}
          >
            <span
              className="text-6xl font-bold"
              style={{ color: "var(--accent)" }}
            >
              404
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-8">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
          >
            Page not found
          </h1>
          <p
            className="text-base"
            style={{ color: "var(--ss-text-secondary)" }}
          >
            The page you&apos;re looking for doesn&apos;t exist. It might have been moved or removed.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full py-3 px-4 rounded-[10px] font-semibold text-center transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--accent-foreground)",
            }}
          >
            Return to home
          </Link>
          <Link
            href="/search"
            className="block w-full py-3 px-4 rounded-[10px] font-semibold text-center transition-colors border"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
              backgroundColor: "transparent",
            }}
          >
            Browse listings
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--ss-text-muted)" }}>
            Need help?{" "}
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
