import { supabase } from "@/lib/supabaseClient";
import CurriculumWizard from "./CurriculumWizard";
import { Metadata } from 'next';
import { getBreadcrumbSchema } from "@/lib/seo-utils";

export const revalidate = 600; // Cache curriculum for 10 minutes

export const metadata: Metadata = {
  title: "Academic Curriculum Explorer & Syllabus Navigator - NextPrepBD",
  description: "Browse the official academic curriculum and syllabus framework for SSC, HSC, and University Admission. Select your stage, group, and subject to access structured lessons directly.",
  keywords: [
    "NCTB Curriculum BD",
    "SSC Syllabus 2026",
    "HSC Curriculum Bangladesh",
    "University Admission Syllabus",
    "NextPrepBD Curriculum",
    "Science Curriculum BD",
    "Class 9-10 Syllabus",
    "HSC Science Syllabus"
  ],
  alternates: {
    canonical: "/curriculum",
  },
  openGraph: {
    title: "Academic Curriculum Explorer | NextPrepBD",
    description: "Explore structured academic curriculum and syllabus standards for SSC, HSC, and University Admission candidates.",
    url: "https://nextprepbd.com/curriculum",
    siteName: "NextPrepBD",
    locale: "en_US",
    type: "website",
  },
};

export default async function CurriculumPage() {
  const [segRes, grpRes, subRes] = await Promise.all([
    supabase.from('segments').select('id, title, slug, icon_url').order('id'),
    supabase.from('groups').select('id, title, slug, segment_id').order('id'),
    supabase.from('subjects').select(`
      id,
      title,
      slug,
      group_id,
      segment_id,
      icon_url,
      view_count,
      groups (
        id,
        title,
        slug,
        segment_id,
        segments (id, title, slug)
      )
    `).order('id')
  ]);

  const segments = segRes.data || [];
  const groups = grpRes.data || [];
  const subjects = subRes.data || [];

  // Enhanced Breadcrumb Structured Data
  const breadcrumbItems = [
    { name: "Home", item: "https://nextprepbd.com" },
    { name: "Curriculum", item: "https://nextprepbd.com/curriculum" }
  ];
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  // Schema.org Course / EducationalOccupationalProgram catalog schema for Google indexing
  const curriculumCatalogSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    "name": "NextPrepBD Academic Curriculum Framework",
    "description": "Standardized academic curriculum and syllabus framework for Bangladeshi students preparing for SSC, HSC, and University Admissions.",
    "url": "https://nextprepbd.com/curriculum",
    "provider": {
      "@type": "EducationalOrganization",
      "name": "NextPrepBD",
      "url": "https://nextprepbd.com"
    },
    "hasCourse": subjects.map((sub: any) => {
      const segSlug = sub.groups?.segments?.slug;
      const grpSlug = sub.groups?.slug;
      const subUrl = segSlug && grpSlug
        ? `https://nextprepbd.com/resources/${segSlug}/${grpSlug}/${sub.slug || sub.id}`
        : `https://nextprepbd.com/curriculum`;

      return {
        "@type": "Course",
        "name": `${sub.title} Curriculum`,
        "description": `Comprehensive curriculum and syllabus module for ${sub.title} under ${sub.groups?.title || "National"} program (${sub.groups?.segments?.title || "Academic"}).`,
        "url": subUrl,
        "educationalCredentialAwarded": sub.groups?.segments?.title || "National Curriculum (NCTB)",
        "inLanguage": "bn-BD",
        "provider": {
          "@type": "Organization",
          "name": "NextPrepBD",
          "sameAs": "https://nextprepbd.com"
        }
      };
    })
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, curriculumCatalogSchema]) }}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <CurriculumWizard 
          initialSegments={segments}
          initialGroups={groups}
          initialSubjects={subjects}
        />
      </div>
    </>
  );
}
