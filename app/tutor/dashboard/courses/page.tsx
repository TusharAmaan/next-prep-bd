"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, Plus, Layout, Edit, Trash2, 
  CheckCircle, AlertCircle, Clock, Loader2, BookOpen
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CourseManagerPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // --- FETCH DATA ---
  const fetchCourses = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        const { data } = await supabase
          .from('courses')
          .select('*')
          .eq('tutor_id', user.id)
          .order('created_at', { ascending: false });
        setCourses(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // --- ACTIONS ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will strictly delete the course.")) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (!error) {
        setCourses(prev => prev.filter(c => c.id !== id));
    } else {
        alert(error.message);
    }
  };

  // --- FILTERING ---
  const filtered = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <Layout className="w-6 h-6 text-indigo-600"/> Course Manager
            </h1>
            <p className="text-slate-500 text-sm mt-1">
                You have <span className="font-bold text-slate-900">{courses.length}</span> courses in your catalog.
            </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input 
                    className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Search courses..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <Link 
                href="/tutor/dashboard/courses/create" 
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4"/> Create New
            </Link>
        </div>
      </div>

      {/* COURSE GRID */}
      {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin"/></div>
      ) : filtered.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
              <p className="font-bold text-slate-500 text-lg">No courses found.</p>
              <p className="text-sm text-slate-400 mb-6">Get started by creating your first curriculum.</p>
              <Link href="/tutor/dashboard/courses/create" className="text-indigo-600 font-bold text-sm hover:underline">Create Now &rarr;</Link>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course) => (
                  <div key={course.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col h-full">
                      
                      {/* Thumbnail & Badge */}
                      <div className="h-48 bg-slate-100 relative overflow-hidden">
                          {course.thumbnail_url ? (
                              <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300"><Layout className="w-12 h-12 opacity-20"/></div>
                          )}
                          <div className="absolute top-3 right-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm border backdrop-blur-md ${
                                  course.status === 'approved' ? 'bg-white/90 text-green-700 border-green-200' :
                                  course.status === 'rejected' ? 'bg-white/90 text-red-700 border-red-200' :
                                  'bg-white/90 text-amber-700 border-amber-200'
                              }`}>
                                  {course.status === 'approved' && <CheckCircle className="w-3 h-3"/>}
                                  {course.status === 'rejected' && <AlertCircle className="w-3 h-3"/>}
                                  {course.status === 'pending' && <Clock className="w-3 h-3"/>}
                                  {course.status}
                              </span>
                          </div>
                      </div>

                      {/* Details */}
                      <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1" title={course.title}>{course.title}</h3>
                          <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-4">
                              <span>{course.duration || "0h"} Duration</span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">৳{course.price}</span>
                          </div>

                          {/* Admin Feedback (if rejected) */}
                          {course.status === 'rejected' && course.admin_feedback && (
                              <div className="bg-red-50 p-3 rounded-lg text-xs text-red-600 mb-4 border border-red-100">
                                  <span className="font-bold flex items-center gap-1 mb-1"><AlertCircle className="w-3 h-3"/> Needs Changes:</span>
                                  {course.admin_feedback}
                              </div>
                          )}

                          {/* Action Buttons */}
                          <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3">
                              <Link 
                                  href={`/tutor/dashboard/courses/create?id=${course.id}`} // <--- SMART EDIT LINK
                                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                              >
                                  <Edit className="w-3 h-3"/> Edit Course
                              </Link>
                              <button 
                                  onClick={() => handleDelete(course.id)} 
                                  className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                  title="Delete"
                              >
                                  <Trash2 className="w-4 h-4"/>
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}