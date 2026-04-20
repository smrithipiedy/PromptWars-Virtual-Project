import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navigation/Navbar";
import { VenueProvider } from "@/context/VenueContext";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CrowdSense — AI-Powered Crowd Safety",
  description: "Real-time crowd density intelligence for live events. Powered by Google Maps and Gemini AI.",
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
