import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navigation/Navbar";
import { VenueProvider } from "@/context/VenueContext";
import Script from "next/script";

import { validateEnv } from "@/lib/env";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Validate required environment variables on startup
if (typeof window === "undefined") {
  validateEnv();
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "CrowdSense | AI-Powered Crowd Safety Intelligence",
    template: "%s | CrowdSense"
  },
  description: "Real-time crowd density intelligence for live events. Powered by Google Maps and Gemini AI vision. Identify hazards, optimize flow, and ensure attendee safety with advanced spatial analytics.",
  keywords: ["crowd safety", "AI venue analysis", "spatial intelligence", "event safety", "Gemini AI", "Google Maps analytics"],
  authors: [{ name: "CrowdSense Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://crowdsense.events",
    siteName: "CrowdSense",
    title: "CrowdSense | AI-Powered Crowd Safety Intelligence",
    description: "Next-gen spatial intelligence for venue safety and crowd management.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CrowdSense Dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CrowdSense | AI-Powered Crowd Safety",
    description: "Real-time crowd density intelligence for safe events.",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <VenueProvider>
          <Navbar />
          <div className="pt-16">
            {children}
          </div>
        </VenueProvider>
        <Script
          id="google-maps-api"
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=maps,visualization,marker`}
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
