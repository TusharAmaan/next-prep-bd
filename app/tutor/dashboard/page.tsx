import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function TutorDashboard() {
  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Fetch ONLY this Tutor's courses
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('tutor_id', user.id) // <--- CRITICAL SECURITY SCOPE
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Link 
          href="/tutor/dashboard/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create New Course
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <div key={course.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <div className="h-32 bg-gray-100 mb-4 rounded-md flex items-center justify-center">
               {/* Replace with your Image component if thumbnail exists */}
               {course.thumbnail_url ? <img src={course.thumbnail_url} className="h-full object-cover"/> : <span className="text-gray-400">No Thumb</span>}
            </div>
            <h3 className="font-semibold text-lg">{course.title}</h3>
            <div className="flex justify-between mt-4">
              <span className={`text-xs px-2 py-1 rounded ${course.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {course.is_published ? 'Live' : 'Draft'}
              </span>
              <Link 
                href={`/tutor/dashboard/course/${course.id}`} 
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Manage Content &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}