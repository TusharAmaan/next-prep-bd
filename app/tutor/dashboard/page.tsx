"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { 
  FileText, CheckCircle, Clock, AlertTriangle, 
  Plus, Hammer, Layout, ArrowRight, Loader2, Sparkles, TrendingUp
} from "lucide-react";
import BadgeDisplay from "@/components/tutor/BadgeDisplay"; // <--- Import

export default function TutorDashboard() {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Fetch BOTH resources and courses for a complete overview
      const [resData, courseData] = await Promise.all([
          supabase.from("resources").select("status, title, created_at, type, admin_feedback").eq("author_id", user.id).order("created_at", { ascending: false }).limit(5),
          supabase.from("courses").select("status, title, created_at, admin_feedback").eq("tutor_id", user.id).order("created_at", { ascending: false }).limit(5)
      ]);

      const allItems = [...(resData.data || []), ...(courseData.data || [])].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      const pendingCount = allItems.filter(r => r.status === 'pending').length;
      const approvedCount = allItems.filter(r => r.status === 'approved').length;
      const rejectedCount = allItems.filter(r => r.status === 'rejected').length;

      setStats({ pending: pendingCount, approved: approvedCount, rejected: rejectedCount });
      setRecent(allItems.slice(0, 5));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600"/></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      
      {/* 1. HERO SECTION (Vibrant Gradient) */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-900 p-8 rounded-3xl shadow-xl relative overflow-hidden text-white flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-indigo-200 font-bold uppercase tracking-widest text-xs">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Instructor Dashboard
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
                Welcome, {user?.user_metadata?.full_name?.split(' ')[0] || "Tutor"}!
            </h1>
            <p className="text-indigo-100 text-lg max-w-xl leading-relaxed">
                Ready to inspire? You have <strong className="text-yellow-300">{stats.pending} items</strong> pending review.
            </p>
        </div>
        
        <div className="flex gap-4 relative z-10 w-full md:w-auto">
            <Link href="/tutor/dashboard/create" className="group flex-1 md:flex-none bg-white text-indigo-900 px-6 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3">
                <div className="bg-indigo-100 p-1.5 rounded-lg group-hover:bg-indigo-200 transition-colors"><Plus className="w-5 h-5"/></div>
                <span>Create New</span>
            </Link>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
    </div>

      {/* 2. MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: ANALYTICS & TOOLS */}
          <div className="space-y-8 xl:col-span-1">
              
              {/* Analytics Cards (Vibrant) */}
              <div className="grid grid-cols-1 gap-4">
                  {/* Approved Card */}
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden group">
                      <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><CheckCircle className="w-24 h-24"/></div>
                      <div className="relative z-10">
                          <p className="text-emerald-100 font-bold text-xs uppercase tracking-wider mb-1">Total Published</p>
                          <h3 className="text-4xl font-black">{stats.approved}</h3>
                          <div className="mt-4 flex items-center gap-2 text-sm font-medium bg-white/10 w-fit px-3 py-1 rounded-lg">
                              <TrendingUp className="w-4 h-4"/> Content Live
                          </div>
                      </div>
                  </div>

                  {/* Pending Card */}
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-200 relative overflow-hidden group">
                      <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Clock className="w-24 h-24"/></div>
                      <div className="relative z-10">
                          <p className="text-orange-100 font-bold text-xs uppercase tracking-wider mb-1">In Review</p>
                          <h3 className="text-4xl font-black">{stats.pending}</h3>
                          <div className="mt-4 flex items-center gap-2 text-sm font-medium bg-white/10 w-fit px-3 py-1 rounded-lg">
                              Awaiting Approval
                          </div>
                      </div>
                  </div>
              </div>

              {/* --- NEW: BADGE SECTION --- */}
              {user && <BadgeDisplay userId={user.id} />}

              {/* Tools Section */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Tools</h3>
                  <div className="space-y-3">
                      <Link href="/tutor/dashboard/question-builder" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-200 hover:bg-purple-50 hover:shadow-md transition-all group">
                          <div className="w-12 h-12 bg-white text-purple-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><Hammer className="w-6 h-6"/></div>
                          <div>
                              <h4 className="font-bold text-slate-800">Question Builder</h4>
                              <p className="text-xs text-slate-500 mt-0.5">Generate exam papers</p>
                          </div>
                      </Link>
                      <Link href="/tutor/dashboard/courses" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 hover:shadow-md transition-all group">
                          <div className="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><Layout className="w-6 h-6"/></div>
                          <div>
                              <h4 className="font-bold text-slate-800">Course Manager</h4>
                              <p className="text-xs text-slate-500 mt-0.5">Manage curriculum</p>
                          </div>
                      </Link>
                  </div>
              </div>
          </div>

          {/* RIGHT COLUMN: RECENT ACTIVITY */}
          <div className="xl:col-span-2">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-slate-400"/> Recent Activity
                      </h3>
                      <Link href="/tutor/dashboard/content" className="text-xs font-bold bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                          View Full Library
                      </Link>
                  </div>
                  
                  <div className="flex-1 overflow-x-auto">
                      {recent.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><Sparkles className="w-8 h-8 opacity-30"/></div>
                              <p>No activity recorded yet.</p>
                          </div>
                      ) : (
                          <table className="w-full text-left text-sm">
                              <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase">
                                  <tr>
                                      <th className="px-6 py-4">Title</th>
                                      <th className="px-6 py-4">Type</th>
                                      <th className="px-6 py-4 text-right">Status</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                  {recent.map((item, i) => (
                                      <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                                          <td className="px-6 py-4">
                                              <p className="font-bold text-slate-800 truncate max-w-[200px] lg:max-w-sm">{item.title}</p>
                                              {item.status === 'rejected' && item.admin_feedback && (
                                                  <div className="text-[10px] text-red-500 mt-1 flex items-center gap-1 bg-red-50 w-fit px-2 py-0.5 rounded border border-red-100">
                                                      <AlertTriangle className="w-3 h-3"/> {item.admin_feedback}
                                                  </div>
                                              )}
                                          </td>
                                          <td className="px-6 py-4">
                                              <span className="bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase shadow-sm">
                                                  {item.type || 'Course'}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm ${
                                                  item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                  item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                  'bg-amber-100 text-amber-700'
                                              }`}>
                                                  {item.status}
                                              </span>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}