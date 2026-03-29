import React from 'react';
import { Metadata } from 'next';
import FindTutorClient from './FindTutorClient';

export const metadata: Metadata = {
  title: "Find a Tutor",
  description: "Browse and connect with verified expert tutors in Bangladesh. Specialized mentorship for SSC, HSC, and University Admission tests.",
  alternates: {
    canonical: "/find-tutor",
  },
};

export default function FindTutorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Find a Tutor - NextPrepBD",
    "description": "Platform to find verified academic tutors and mentors in Bangladesh.",
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
      <main>
        <FindTutorClient />
      </main>
    </>
  );
}