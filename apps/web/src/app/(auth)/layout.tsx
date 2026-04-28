import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}
          >
            sell<span style={{ color: "var(--accent)" }}>space</span>
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--ss-text-muted)" }}>
            Zimbabwe&apos;s marketplace built on trust
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-[14px] border p-6"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-modal)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
