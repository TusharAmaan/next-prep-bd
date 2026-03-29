import React from 'react';
import { Metadata } from 'next';
import RefundContent from './RefundContent';

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Review our refund policy for courses and digital resources on NextPrepBD.",
  alternates: {
    canonical: "/refund-policy",
  },
};

export default function RefundPolicyPage() {
  const lastUpdated = "March 29, 2026";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Refund Policy - NextPrepBD",
    "description": "Information regarding refunds for digital and course-based products on NextPrepBD.",
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
          <RefundContent lastUpdated={lastUpdated} />
        </main>
      </div>
    </>
  );
}