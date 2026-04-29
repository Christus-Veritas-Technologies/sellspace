import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t mt-16" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
      <div className="px-5 md:px-10 py-12">
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <Image
                src="/favicon.png"
                alt="Sellspace"
                width={40}
                height={40}
                unoptimized
                className="rounded-full"
              />
              <span
                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700 }}
                className="text-[18px] leading-none"
              >
                sell<span style={{ color: "var(--accent)" }}>space</span>
              </span>
            </Link>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Zimbabwe&apos;s marketplace built on trust
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3
              className="font-semibold text-sm mb-4"
              style={{ color: "var(--foreground)" }}
            >
              Browse
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/search"
                  className="hover:underline"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  All listings
                </Link>
              </li>
              <li>
                <Link
                  href="/search?category=ELECTRONICS"
                  className="hover:underline"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  href="/search?category=VEHICLES"
                  className="hover:underline"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Vehicles
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3
              className="font-semibold text-sm mb-4"
              style={{ color: "var(--foreground)" }}
            >
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:underline"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Help center
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:underline"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Safety tips
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:underline"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Contact us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3
              className="font-semibold text-sm mb-4"
              style={{ color: "var(--foreground)" }}
            >
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:underline"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Terms of service
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:underline"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:underline"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderColor: "var(--border)", borderTop: "1px solid" }} className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
          <p>&copy; {currentYear} Sellspace. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/" className="hover:underline">
              Twitter
            </Link>
            <Link href="/" className="hover:underline">
              Instagram
            </Link>
            <Link href="/" className="hover:underline">
              Facebook
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
