import React from 'react';
import { Metadata } from 'next';
import TermsContent from './TermsContent';

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the Terms of Service for NextPrepBD. Understand the guidelines and rules for using our platform.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  const lastUpdated = "March 29, 2026";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Service - NextPrepBD",
    "description": "The legal terms and conditions for using NextPrepBD.",
    "publisher": {
      "@type": "Organization",
      "name": "NextPrepBD",
      "logo": "https://nextprepbd.com/icon.png"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-white dark:bg-slate-950 font-sans transition-colors duration-300 selection:bg-indigo-100 dark:selection:bg-indigo-900/30 selection:text-indigo-900 dark:selection:text-indigo-200">
        <main className="pt-32 pb-20 px-6">
          <TermsContent lastUpdated={lastUpdated} />
        </main>
      </div>
    </>
  );
}