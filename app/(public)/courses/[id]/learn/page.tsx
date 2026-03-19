import { notFound, redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { checkEnrollmentStatus, getCourseProgress } from "@/app/actions/enrollment";
import CoursePlayer from "@/components/courses/CoursePlayer";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

// --- HELPER: Detect ID vs Slug ---
function getQueryColumn(param: string) {
  const isNumeric = /^\d+$/.test(param);
  return isNumeric ? 'id' : 'slug';
}

export default async function CourseLearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const column = getQueryColumn(id);

  // 1. Fetch Course
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq(column, id)
    .single();

  if (!course) return notFound();

  // 2. Check Enrollment (Security)
  const { enrolled } = await checkEnrollmentStatus(course.id);
  
  if (!enrolled) {
    // If not enrolled, redirect back to course overview
    redirect(`/courses/${id}`);
  }

  // 3. Fetch Curriculum & Progress
  const { data: lessonsData } = await supabase
    .from('course_lessons')
    .select('*, course_contents(*)')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true });

  const lessons = lessonsData?.map(l => ({
    ...l,
    course_contents: l.course_contents?.sort((a: any, b: any) => a.order_index - b.order_index)
  })) || [];

  const progress = await getCourseProgress(course.id);

  return (
    <div className="fixed inset-0 bg-white z-[9999]">
      <CoursePlayer 
        course={course} 
        lessons={lessons} 
        initialProgress={progress} 
      />
    </div>
  );
}
