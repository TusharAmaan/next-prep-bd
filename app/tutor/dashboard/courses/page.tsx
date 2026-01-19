"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Edit, Trash2, Eye, Layout, CheckCircle, AlertCircle, Clock, 
  Search, Filter, Loader2, Plus 
} from "lucide-react";
import Link from "next/link";

export default function TutorCoursesList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // --- FETCH DATA ---
  const fetchCourses = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch ONLY courses by this tutor
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('tutor_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) console.error(error);
    else setItems(data || []);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (!error) setItems(prev => prev.filter(item => item.id !== id));
    else alert(error.message);
  };

  const filteredItems = items.filter(item => item.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <Layout className="w-6 h-6 text-emerald-600"/> My Courses
            </h2>
            <p className="text-slate-500 text-sm mt-1">Manage your curriculum and pricing.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input 
                    className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="Search courses..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            {/* Note: In a real app, you might want a separate "Create Course" page, 
                but for now we re-use the main editor or you can point to a new route if you make one.
                If you use the main editor, ensure it defaults to 'course' type. 
            */}
            <button 
                onClick={() => alert("To create a course, go to 'Create Content' and select 'Course' tab (if enabled) or ask Admin to enable Course Creation Mode.")} 
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4"/> New Course
            </button>
        </div>
      </div>

      {/* GRID VIEW (Better for Courses than Table) */}
      {loading ? (
          <div className="py-20 flex justify-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin"/></div>
      ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
              <Layout className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
              <p className="font-bold text-slate-500">No courses found.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                      {/* Thumbnail Area */}
                      <div className="h-40 bg-slate-100 relative">
                          {item.thumbnail_url ? (
                              <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover"/>
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400"><Layout className="w-10 h-10 opacity-20"/></div>
                          )}
                          <div className="absolute top-3 right-3">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                                  item.status === 'approved' ? 'bg-white text-green-700' :
                                  item.status === 'rejected' ? 'bg-white text-red-700' :
                                  'bg-white text-amber-700'
                              }`}>
                                  {item.status === 'approved' && <CheckCircle className="w-3 h-3"/>}
                                  {item.status === 'pending' && <Clock className="w-3 h-3"/>}
                                  {item.status}
                              </span>
                          </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                          <h3 className="font-bold text-slate-900 text-lg line-clamp-1 mb-1">{item.title}</h3>
                          <div className="flex justify-between items-center text-xs text-slate-500 mb-4">
                              <span>{item.duration || "0h"} Duration</span>
                              <span className="font-bold text-slate-900">৳{item.price}</span>
                          </div>

                          {/* Admin Feedback (If Rejected) */}
                          {item.status === 'rejected' && item.admin_feedback && (
                              <div className="bg-red-50 p-3 rounded-lg text-xs text-red-600 mb-4 border border-red-100">
                                  <span className="font-bold block mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Admin Feedback:</span>
                                  {item.admin_feedback}
                              </div>
                          )}

                          <div className="flex gap-2 border-t border-slate-100 pt-4 mt-auto">
                              <Link href={`/courses/${item.slug}`} target="_blank" className="flex-1 py-2 text-center text-xs font-bold text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                  Preview
                              </Link>
                              <button onClick={() => handleDelete(item.id)} className="px-3 py-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
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