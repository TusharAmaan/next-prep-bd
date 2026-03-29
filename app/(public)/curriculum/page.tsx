import { supabase } from "@/lib/supabaseClient";
import CurriculumClient from "./CurriculumClient";
import { Metadata } from 'next';
import { getBreadcrumbSchema } from "@/lib/seo-utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comprehensive Curriculum & Lesson Plans - NextPrepBD",
  description: "Explore our professionally curated curriculum and structured lesson plans for SSC, HSC, and Admission candidates. Track your progress and master every subject with NextPrepBD.",
  alternates: {
    canonical: "/curriculum",
  },
};

export default async function CurriculumPage() {
  const [segRes, grpRes, subRes] = await Promise.all([
    supabase.from('segments').select('*').order('id'),
    supabase.from('groups').select('*').order('id'),
    supabase.from('subjects').select(`
      *,
      groups (
        id,
        title,
        segment_id,
        segments (id, title)
      )
    `).order('id')
  ]);

  const segments = segRes.data || [];
  const groups = grpRes.data || [];
  const subjects = subRes.data || [];

  const breadcrumbItems = [
    { name: "Home", item: "https://nextprepbd.com" },
    { name: "Curriculum", item: "https://nextprepbd.com/curriculum" }
  ];
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 transition-colors duration-300">
        <section className="max-w-7xl mx-auto px-6 lg:px-8">
            <CurriculumClient 
                initialSegments={segments}
                initialGroups={groups}
                initialSubjects={subjects}
            />
        </section>
      </div>
    </>
  );
}
