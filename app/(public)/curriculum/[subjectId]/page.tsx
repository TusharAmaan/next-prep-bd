import { supabase } from "@/lib/supabaseClient";
import SubjectHierarchyClient from "./SubjectHierarchyClient";
import { Metadata } from 'next';
import { getBreadcrumbSchema } from "@/lib/seo-utils";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ subjectId: string }> }): Promise<Metadata> {
  const { subjectId } = await params;

  const { data: subData } = await supabase
    .from('subjects')
    .select('*, groups(title, segments(title))')
    .eq('id', subjectId)
    .single();

  if (!subData) {
    return { title: 'Subject Not Found' };
  }

  return {
    title: `${subData.title} Curriculum & Lesson Plans - NextPrepBD`,
    description: `Explore the comprehensive ${subData.title} curriculum for ${subData.groups?.title} (${subData.groups?.segments?.title}). Access lesson plans, textbooks, and interactive assessments on NextPrepBD.`,
    alternates: {
      canonical: `/curriculum/${subjectId}`,
    },
    openGraph: {
      title: `${subData.title} Curriculum - NextPrepBD`,
      description: `Complete syllabus and strategic lesson plans for ${subData.title}. Master your exams with NextPrepBD.`,
      url: `https://nextprepbd.com/curriculum/${subjectId}`,
    },
  };
}

export default async function SubjectHierarchyPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params;

  // 1. Fetch Subject Info
  const { data: subData } = await supabase
    .from('subjects')
    .select('*, groups(title, segments(title))')
    .eq('id', subjectId)
    .single();
  
  if (!subData) return notFound();

  // Increment view count (Server-side)
  await supabase.from('subjects').update({ view_count: (subData.view_count || 0) + 1 }).eq('id', subjectId);

  // 2. Fetch Initial Units (Bengali by default)
  const { data: unitsData } = await supabase
    .from('lesson_plan_units')
    .select(`
      *,
      lesson_plan_lessons (
        *,
        lesson_plan_contents (*)
      )
    `)
    .eq('subject_id', subjectId)
    .eq('version', 'bn')
    .order('order_index');
  
  const units = unitsData || [];

  // 3. Fetch Related Books
  const { data: booksData } = await supabase
    .from('lesson_plan_subject_books')
    .select('*')
    .eq('subject_id', subjectId)
    .order('order_index');
  const relatedBooks = booksData || [];

  // 4. Fetch Other Subjects in same group
  let otherSubjects: any[] = [];
  if (subData?.group_id) {
    const { data: others } = await supabase
      .from('subjects')
      .select('id, title')
      .eq('group_id', subData.group_id)
      .neq('id', subjectId)
      .limit(5);
    otherSubjects = others || [];
  }

  // 5. Fetch Linked Courses
  const { data: coursesData } = await supabase
    .from('lesson_plan_subject_courses')
    .select(`
      course_id,
      courses (*)
    `)
    .eq('subject_id', subjectId)
    .order('order_index');
  
  const linkedCourses = coursesData?.map(item => item.courses) || [];

  const currentUrl = `https://nextprepbd.com/curriculum/${subjectId}`;
  const breadcrumbItems = [
    { name: "Home", item: "https://nextprepbd.com" },
    { name: "Curriculum", item: "https://nextprepbd.com/curriculum" },
    { name: subData.title, item: currentUrl }
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
            <SubjectHierarchyClient 
                subjectId={subjectId}
                initialSubject={subData}
                initialUnits={units}
                initialRelatedBooks={relatedBooks}
                initialLinkedCourses={linkedCourses}
                initialOtherSubjects={otherSubjects}
            />
        </section>
      </div>
    </>
  );
}
