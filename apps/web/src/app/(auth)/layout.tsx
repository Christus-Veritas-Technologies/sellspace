import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="flex justify-center mb-4">
            <Image
              src="/icon.png"
              alt="Sellspace"
              width={80}
              height={80}
              priority
              className="rounded-full"
            />
          </Link>
          <h1
            className="text-2xl font-bold tracking-tight"
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
