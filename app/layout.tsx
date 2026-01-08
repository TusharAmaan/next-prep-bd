// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import ScrollToTop from "@/components/ScrollToTop";
import { GoogleAnalytics } from "@next/third-parties/google";

// 1) Fonts - FIXED IMPORTS
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Noto_Serif_Bengali } from "next/font/google";


const bangla = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400", "700"],
  variable: "--font-bangla",
});

// 2) SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://nextprepbd.com"),
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  title: {
    default: "NextPrepBD | Bangladesh's Largest Education Portal",
    template: "%s | NextPrepBD",
  },
  description:
    "Download free SSC, HSC, and University Admission notes, question banks, and suggestions. The ultimate study companion for Bangladeshi students.",
  keywords: [
    "SSC Suggestion 2026",
    "HSC Notes BD",
    "University Admission Question Bank",
    "Job Preparation BD",
    "Class 9-10 Notes",
    "Education Board Result",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NextPrepBD | Master Your Exams",
    description: "Access thousands of free notes, video classes, and exam routines.",
    url: "https://nextprepbd.com",
    siteName: "NextPrepBD",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NextPrepBD Education Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NextPrepBD | Bangladesh's #1 Education Portal",
    description: "Free notes, questions, and suggestions for SSC/HSC students.",
    images: ["/og-image.png"],
  },
  other: {
    "google-adsense-account": "ca-pub-3105440348785747",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // FIXED: Use .variable directly from the imported objects
      className={`${GeistSans.variable} ${GeistMono.variable} ${bangla.variable}`}
    >
      {/* Global default font = Geist Sans */}
      <body className={`${GeistSans.className} antialiased`}>
        {/* AdSense */}
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3105440348785747"
          crossOrigin="anonymous"
        />

        {/* JSON-LD for sitelinks search box */}
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "NextPrepBD",
              url: "https://nextprepbd.com",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://nextprepbd.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        <Header />
        {children}
        <Footer />

        <SpeedInsights />
        <ScrollToTop />
        <GoogleAnalytics gaId="G-9BGK82JB2D" />
      </body>
    </html>
  );
}