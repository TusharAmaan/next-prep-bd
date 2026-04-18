// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import ScrollToTop from "@/components/ScrollToTop";
import { GoogleAnalytics } from "@next/third-parties/google";

// 1) Fonts
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Noto_Serif_Bengali } from "next/font/google";

import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { getOrganizationSchema } from "@/lib/seo-utils";

const bangla = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
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
    "The ultimate study companion for Bangladeshi students. Download SSC, HSC, and University Admission notes, question banks, and suggestions for free.",
  keywords: [
    "SSC Suggestion 2026",
    "HSC Notes BD",
    "University Admission Question Bank",
    "Job Preparation BD",
    "Class 9-10 Notes",
    "Education Board Result",
    "NextPrepBD",
    "Education Portal Bangladesh"
  ],
  authors: [{ name: "NextPrepBD Team" }],
  creator: "NextPrepBD",
  publisher: "NextPrepBD",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NextPrepBD | Master Your Exams",
    description: "Access thousands of free notes, video classes, and exam routines. Master your milestone with NextPrepBD.",
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
    description: "Free notes, questions, and suggestions for SSC/HSC students. Join 15k+ students today.",
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
      className={`${GeistSans.variable} ${GeistMono.variable} ${bangla.variable}`}
    >
      <head>
        {/* Combined SEO Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify([
              getOrganizationSchema(),
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "NextPrepBD",
                url: "https://nextprepbd.com",
                potentialAction: {
                  "@type": "SearchAction",
                  target: "https://nextprepbd.com/search?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              }
            ]) 
          }}
        />
        {/* Prevent FOUC: apply dark class before paint */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const t = localStorage.getItem('theme');
            if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            }
          } catch(e) {}
        `}} />
      </head>
      <body className={`${GeistSans.className} antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
        <ThemeProvider>
          {/* MathJax Configuration (Deferred) */}
          <Script id="mathjax-config" strategy="lazyOnload">
            {`
              window.MathJax = {
                tex: {
                  inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                  displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                  processEscapes: true,
                },
                options: {
                  ignoreHtmlClass: 'tex2jax_ignore',
                  processHtmlClass: 'tex2jax_process'
                }
              };
            `}
          </Script>
          <Script
            id="mathjax-script"
            src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
            strategy="lazyOnload"
          />

          {/* AdSense (Lazy) */}
          <Script
            id="adsbygoogle-init"
            strategy="lazyOnload"
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3105440348785747"
            crossOrigin="anonymous"
          />

          <Header />
          <main className="min-h-screen">
             {children}
          </main>
          <Toaster position="top-right" />
          <Footer />
          <Analytics mode={'production'} />
          <SpeedInsights />
          <ScrollToTop />
          <GoogleAnalytics gaId="G-9BGK82JB2D" />
        </ThemeProvider>
      </body>
    </html>
  );
}