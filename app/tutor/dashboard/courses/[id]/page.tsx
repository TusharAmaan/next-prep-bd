import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CourseEditor from '@/components/dashboard/CourseEditor'; 

export default async function TutorCourseManage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. FIX: Explicitly handle the 'null' user case
  if (!user) {
    redirect('/login');
  }

  // 2. Fetch Course & Verify Ownership
  const { data: course, error } = await supabase
    .from('courses')
    .select('*, course_modules(*, course_lessons(*))') // Updated to use the new tables we made
    .eq('id', params.id)
    .single();

  if (error || !course) {
    return <div className="p-8 text-center">Course not found</div>;
  }

  // 3. Strict Ownership Check
  // Since we did the "if (!user)" check above, TypeScript knows 'user.id' is safe here
  if (course.tutor_id !== user.id) {
    return <div className="p-8 text-red-500">Unauthorized: You do not own this course.</div>;
  }

  return (
    <div className="h-[calc(100vh-64px)]">
      <CourseEditor 
        initialData={course} 
        userId={user.id}
        role="tutor" 
      />
    </div>
  );
}