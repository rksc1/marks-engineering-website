import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

import { FloatingActions } from "@/components/floating-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Industrial Fabrication in Bilaspur`,
    template: `%s | ${siteConfig.shortName}`
  },
  description: siteConfig.description,
  keywords: [
    "industrial fabrication Bilaspur",
    "structural fabrication Chhattisgarh",
    "warehouse shed fabrication",
    "ACP support structure",
    "mezzanine fabrication",
    "MS fabrication"
  ],
  openGraph: {
    title: `${siteConfig.name} | Industrial Fabrication in Bilaspur`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website"
  },
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <FloatingActions />
      </body>
    </html>
  );
}
