import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from '@next/third-parties/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. PROFESSIONAL SEO METADATA (The "Courstika" Look)
export const metadata: Metadata = {
  metadataBase: new URL("https://nextprepbd.com"),

  // Dynamic Title Template
  title: {
    default: "NextPrepBD | Bangladesh's Largest Education Portal",
    template: "%s | NextPrepBD", 
  },
  
  // Rich Description for Google Results
  description: "Download free SSC, HSC, and University Admission notes, question banks, and suggestions. The ultimate study companion for Bangladeshi students.",
  
  // Keywords for Search Ranking
  keywords: ["SSC Suggestion 2026", "HSC Notes BD", "University Admission Question Bank", "Job Preparation BD", "Class 9-10 Notes", "Education Board Result"],

  // Canonical URL (Essential for SEO)
  alternates: {
    canonical: "/",
  },

  // Social Media Cards (Facebook/LinkedIn)
  openGraph: {
    title: "NextPrepBD | Master Your Exams",
    description: "Access thousands of free notes, video classes, and exam routines.",
    url: "https://nextprepbd.com",
    siteName: "NextPrepBD",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png", // Make sure to add this image to your 'public' folder!
        width: 1200,
        height: 630,
        alt: "NextPrepBD Education Platform",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "NextPrepBD | Bangladesh's #1 Education Portal",
    description: "Free notes, questions, and suggestions for SSC/HSC students.",
    images: ["/og-image.png"],
  },

  // AdSense Verification
  other: {
    "google-adsense-account": "ca-pub-3105440348785747",
  },
};
// 2. Setup the Bangla Font
const bangla = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400", "700"], // Regular and Bold
  variable: "--font-bangla",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bangla.variable} antialiased`}
      >
        {/* 2. JSON-LD SCRIPT (This helps get the Sitelinks/Search Box on Google) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "NextPrepBD",
              "url": "https://nextprepbd.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://nextprepbd.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />

        <Header />
        {children}
        <Footer />

        {/* 3. CORRECT COMPONENT PLACEMENT (Must be inside body) */}
        <SpeedInsights />
      </body>
      
      {/* Analytics can stay in html or body, usually fine here */}
      <GoogleAnalytics gaId="G-9BGK82JB2D" />
    </html>
  );
}