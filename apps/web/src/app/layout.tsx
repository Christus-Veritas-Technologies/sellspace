import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/700.css";
import "@fontsource-variable/dm-sans";
import type { Metadata } from "next";

import "../index.css";
import SiteHeader from "@/components/header";
import { Footer } from "@/components/footer";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "Sellspace — Zimbabwe's marketplace built on trust",
  description: "Buy and sell anything in Zimbabwe. Sellspace is a modern, peer-to-peer marketplace.",
  icons: {
    icon: "/favicon.png",
    apple: "/icon.png",
  },
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
            <Footer />
        </Providers>
      </body>
    </html>
  );
}
