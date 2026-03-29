import React from 'react';
import { Metadata } from 'next';
import PrivacyContent from './PrivacyContent';

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read our privacy policy to understand how NextPrepBD collects, uses, and protects your personal data.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "March 29, 2026";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - NextPrepBD",
    "description": "Information about how NextPrepBD handles user data and privacy.",
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
          <PrivacyContent lastUpdated={lastUpdated} />
        </main>
      </div>
    </>
  );
}