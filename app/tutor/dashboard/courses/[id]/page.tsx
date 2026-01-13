import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Video, FileText, HelpCircle, GripVertical, Trash2 } from 'lucide-react';
import { notFound } from 'next/navigation';

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

  if (error || !course) return notFound();

  // 2. Strict Permission Check (Only the owner can edit)
  if (course.tutor_id !== user.id) {
    return <div className="p-12 text-center text-red-600 font-bold">Unauthorized Access</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/tutor/dashboard/courses" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={20} className="text-gray-600"/>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{course.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                course.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {course.status}
              </span>
              <span className="text-sm font-bold text-gray-500">• {course.price || 'Free'}</span>
            </div>
          </div>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
          Save & Submit for Review
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: CURRICULUM EDITOR */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex justify-between items-center">
              <div>
                <h3 className="font-bold text-indigo-900 text-lg">Curriculum</h3>
                <p className="text-sm text-indigo-600 font-medium">Add modules to organize lessons.</p>
              </div>
              <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold border border-indigo-200 hover:bg-indigo-50 shadow-sm transition">
                + Add Module
              </button>
           </div>

           {/* Module List */}
           {course.course_modules?.sort((a:any,b:any) => a.order_index - b.order_index).map((module: any) => (
             <div key={module.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center group">
                   <div className="flex items-center gap-3">
                     <GripVertical size={18} className="text-gray-400 cursor-grab"/>
                     <span className="font-bold text-gray-800">{module.title}</span>
                   </div>
                   <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-xs text-indigo-600 font-bold hover:underline">Edit Name</button>
                      <button className="text-gray-400 hover:text-red-600 transition"><Trash2 size={16}/></button>
                   </div>
                </div>
                
                <div className="divide-y divide-gray-100 bg-white">
                   {module.course_lessons?.sort((a:any,b:any) => a.order_index - b.order_index).map((lesson: any) => (
                      <div key={lesson.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                         <div className="flex items-center gap-3">
                            {lesson.lesson_type === 'video' && <Video size={16} className="text-blue-500"/>}
                            {lesson.lesson_type === 'pdf' && <FileText size={16} className="text-red-500"/>}
                            {lesson.lesson_type === 'quiz' && <HelpCircle size={16} className="text-orange-500"/>}
                            <span className="text-sm text-gray-700 font-medium">{lesson.title}</span>
                         </div>
                         <button className="text-xs font-bold border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition">
                           Edit Content
                         </button>
                      </div>
                   ))}
                   <button className="w-full py-3 text-xs text-indigo-600 font-bold hover:bg-indigo-50 transition flex items-center justify-center gap-2 uppercase tracking-wider">
                      <PlusCircle size={16} /> Add Lesson
                   </button>
                </div>
             </div>
           ))}

           {(!course.course_modules || course.course_modules.length === 0) && (
             <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
               <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <PlusCircle size={24} />
               </div>
               <p className="text-gray-500 font-medium mb-4">Your course is empty.</p>
               <button className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-black transition">
                 Create First Module
               </button>
             </div>
           )}
        </div>

        {/* RIGHT: COURSE SETTINGS */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 text-xs uppercase tracking-widest border-b pb-2">Course Settings</h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Thumbnail</label>
                    <div className="h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-indigo-300 transition">
                       {course.thumbnail_url ? (
                         <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                       ) : (
                         <div className="text-center">
                            <span className="text-xs font-bold text-gray-400 group-hover:text-indigo-500">Upload Image</span>
                         </div>
                       )}
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Price (৳)</label>
                    <input 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
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