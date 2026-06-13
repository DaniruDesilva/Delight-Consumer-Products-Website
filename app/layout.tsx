import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import SiteWrapper from "@/components/SiteWrapper";
import { CartProvider } from "@/context/CartContext";
import { organizationSchema } from "@/lib/seo";
import Analytics from "@/components/Analytics";

// ─── Self-hosted fonts via next/font (no render-blocking external request) ───
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-heading",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-body",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://delightconsumerproducts.lk"),
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
  title: {
    default: "Delight Consumer Products | Nurtured by Nature",
    template: "%s | Delight Consumer Products",
  },
  description:
    "Premium aromatic solutions including incense sticks, air fresheners, and perfumes crafted in Sri Lanka. Quality you can trust, inspired by nature since 1995.",
  keywords: [
    "incense sticks",
    "air fresheners",
    "perfumes",
    "aromatic products",
    "Sri Lanka",
    "Delight Consumer Products",
    "sambrani",
    "candles",
    "wax matches",
  ],
  authors: [{ name: "Delight Consumer Products" }],
  creator: "Delight Consumer Products PVT LTD",
  publisher: "Delight Consumer Products PVT LTD",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.delightconsumerproducts.lk",
    siteName: "Delight Consumer Products",
    title: "Delight Consumer Products | Nurtured by Nature",
    description:
      "Premium aromatic solutions including incense sticks, air fresheners, and perfumes. Crafted in Sri Lanka since 2025.",
    images: [
      {
        url: "https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477142/delight_static/l3phgjchpgvmuxhdakp2.png",
        width: 220,
        height: 75,
        alt: "Delight Consumer Products Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Delight Consumer Products | Nurtured by Nature",
    description: "Premium aromatic solutions crafted in Sri Lanka since 2025.",
    images: ["https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477142/delight_static/l3phgjchpgvmuxhdakp2.png"],
  },
};

// Proper Next.js 16 viewport export (replaces metadata.viewport & metadata.themeColor)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#3A6B4C",
};

import { db } from "@/lib/db";
import SiteStatusBlocker from "@/components/SiteStatusBlocker";
import CustomCursor from "@/components/CustomCursor";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check global site status from SQLite (no latency overhead since it's local)
  let status = 'live';
  try {
    const statusRow = db.instance.prepare("SELECT setting_value FROM settings WHERE setting_key = 'site_status'").get() as any;
    if (statusRow?.setting_value) {
      status = statusRow.setting_value;
    }
  } catch (e) {}

  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* DNS prefetch for Cloudinary CDN */}
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        {/* Geo meta tags for local SEO — Balapitiya, Sri Lanka */}
        <meta name="geo.region" content="LK-3" />
        <meta name="geo.placename" content="Balapitiya, Southern Province, Sri Lanka" />
        <meta name="geo.position" content="6.4716167;80.0381623" />
        <meta name="ICBM" content="6.4716167, 80.0381623" />
        {/* Organization + WebSite JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
      </head>

      <body suppressHydrationWarning>
        <CustomCursor />
        <SiteStatusBlocker status={status}>
          <CartProvider>
            <SiteWrapper>{children}</SiteWrapper>
            <Analytics />
          </CartProvider>
        </SiteStatusBlocker>
      </body>
    </html>
  );
}
