import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Video, FileText, HelpCircle, GripVertical } from 'lucide-react';

export default async function CourseManagerPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // 1. Fetch Course with Modules & Lessons
  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      course_modules (
        id, title, order_index,
        course_lessons (
          id, title, lesson_type, order_index, is_free_preview
        )
      )
    `)
    .eq('id', params.id)
    .single();

  // 2. Handle Errors
  if (error || !course) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-red-600">Course Not Found</h2>
        <p className="text-gray-500 mb-4">It may have been deleted or you don't have permission.</p>
        <Link href="/tutor/dashboard/courses" className="text-indigo-600 underline">Back to Courses</Link>
      </div>
    );
  }

  // 3. Security Check
  if (course.tutor_id !== user.id) {
    return <div className="p-12 text-red-600">Unauthorized Access</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 border-b pb-6">
        <div className="flex items-center gap-4">
          <Link href="/tutor/dashboard/content" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={20} className="text-gray-600"/>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                course.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {course.status}
              </span>
              <span className="text-sm text-gray-500">• {course.price || 'Free'}</span>
            </div>
          </div>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-sm">
          Submit for Review
        </button>
      </div>

      {/* DRAG & DROP EDITOR AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Curriculum Structure */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex justify-between items-center">
              <div>
                <h3 className="font-bold text-indigo-900">Course Curriculum</h3>
                <p className="text-xs text-indigo-600">Organize your lessons into modules.</p>
              </div>
              <button className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-200 hover:bg-indigo-50 shadow-sm">
                + Add Module
              </button>
           </div>

           {/* Module List */}
           {course.course_modules?.sort((a:any,b:any) => a.order_index - b.order_index).map((module: any) => (
             <div key={module.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center group">
                   <div className="flex items-center gap-2">
                     <GripVertical size={16} className="text-gray-400 cursor-grab"/>
                     <span className="font-bold text-gray-700 text-sm">{module.title}</span>
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-xs text-gray-500 hover:text-indigo-600 font-medium">Edit</button>
                      <button className="text-xs text-gray-500 hover:text-red-600 font-medium">Delete</button>
                   </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                   {module.course_lessons?.sort((a:any,b:any) => a.order_index - b.order_index).map((lesson: any) => (
                      <div key={lesson.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                         <div className="flex items-center gap-3">
                            {lesson.lesson_type === 'video' && <Video size={16} className="text-blue-500"/>}
                            {lesson.lesson_type === 'pdf' && <FileText size={16} className="text-red-500"/>}
                            {lesson.lesson_type === 'quiz' && <HelpCircle size={16} className="text-orange-500"/>}
                            <span className="text-sm text-gray-600 font-medium">{lesson.title}</span>
                         </div>
                         <button className="text-xs bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 text-gray-500">
                           Edit Content
                         </button>
                      </div>
                   ))}
                   <button className="w-full py-2 text-xs text-indigo-600 font-bold hover:bg-indigo-50 transition flex items-center justify-center gap-1">
                      <PlusCircle size={14} /> Add Lesson
                   </button>
                </div>
             </div>
           ))}

           {(!course.course_modules || course.course_modules.length === 0) && (
             <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
               <p className="text-gray-400 mb-4">No modules added yet.</p>
               <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold">
                 Create First Module
               </button>
             </div>
           )}
        </div>

        {/* Right: Settings */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Course Settings</h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Thumbnail</label>
                    <div className="h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden relative group cursor-pointer">
                       {course.thumbnail_url ? (
                         <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-xs text-gray-400">Upload Image</span>
                       )}
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Price</label>
                    <input 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold"
                      defaultValue={course.price}
                    />
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}