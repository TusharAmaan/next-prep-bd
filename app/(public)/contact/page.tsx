import React from 'react';
import { Metadata } from 'next';
import ContactContent from './ContactContent';

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with NextPrepBD. We are here to help you with your educational resources and master your milestones.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact NextPrepBD",
    "description": "Contact information for NextPrepBD's educational support team.",
    "url": "https://nextprepbd.com/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "NextPrepBD",
      "logo": "https://nextprepbd.com/icon.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+880 1619663933",
        "contactType": "customer service",
        "email": "nextprepbd@gmail.com"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans pt-28 pb-20 flex items-center justify-center transition-colors duration-300">
        <ContactContent />
      </div>
    </>
  );
}