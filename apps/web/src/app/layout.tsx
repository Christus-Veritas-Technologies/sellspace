import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/700.css";
import "@fontsource-variable/dm-sans";
import type { Metadata } from "next";

import "../index.css";
import SiteHeader from "@/components/header";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "Sellspace — Zimbabwe's marketplace built on trust",
  description: "Buy and sell anything in Zimbabwe. Sellspace is a modern, peer-to-peer marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
            <SiteHeader />
            {children}
        </Providers>
      </body>
    </html>
  );
}
