"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { 
  FileText, CheckCircle, Clock, AlertTriangle, 
  Plus, Hammer, Layout, ArrowRight, Loader2, Sparkles
} from "lucide-react";

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
      
      {/* 1. HERO SECTION */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl relative overflow-hidden text-white flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="relative z-10 space-y-2">
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
                Welcome back, <span className="text-indigo-400">{user?.user_metadata?.full_name?.split(' ')[0] || "Tutor"}</span>
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse"/>
            </h1>
            <p className="text-slate-300 text-lg font-medium">
                You have <span className="text-white font-bold bg-white/20 px-2 py-0.5 rounded">{stats.pending}</span> items waiting for admin review.
            </p>
        </div>
        
        <div className="flex gap-4 relative z-10 w-full md:w-auto">
            <Link href="/tutor/dashboard/create" className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-900/50 transition-all flex items-center justify-center gap-2 active:scale-95">
                <Plus className="w-5 h-5"/> Post Content
            </Link>
        </div>

        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
      </div>

      {/* 2. DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* STATS & TOOLS */}
          <div className="space-y-6 lg:col-span-1">
              
              {/* Status Overview */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Analytics</h3>
                  <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle className="w-5 h-5"/></div>
                          <span className="font-bold text-slate-700">Published</span>
                      </div>
                      <span className="text-2xl font-black text-emerald-700">{stats.approved}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Clock className="w-5 h-5"/></div>
                          <span className="font-bold text-slate-700">Pending</span>
                      </div>
                      <span className="text-2xl font-black text-amber-700">{stats.pending}</span>
                  </div>
              </div>

              {/* Quick Tools */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tools</h3>
                  <Link href="/tutor/dashboard/question-builder" className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-all group">
                      <div className="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:scale-110 transition-transform"><Hammer className="w-5 h-5"/></div>
                      <div>
                          <h4 className="font-bold text-slate-800">Question Builder</h4>
                          <p className="text-xs text-slate-500">Create & print exam papers.</p>
                      </div>
                  </Link>
                  <Link href="/tutor/dashboard/courses" className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><Layout className="w-5 h-5"/></div>
                      <div>
                          <h4 className="font-bold text-slate-800">Course Manager</h4>
                          <p className="text-xs text-slate-500">Organize your lessons.</p>
                      </div>
                  </Link>
              </div>
          </div>

          {/* RECENT ACTIVITY TABLE */}
          <div className="lg:col-span-2 flex flex-col">
              <div className="flex justify-between items-end mb-4 px-2">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h3>
                  <Link href="/tutor/dashboard/content" className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">View Library <ArrowRight className="w-3 h-3"/></Link>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                  {recent.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                          <FileText className="w-12 h-12 mb-3 opacity-20"/>
                          <p className="font-bold">No activity yet.</p>
                          <p className="text-sm mb-6">Start by creating your first resource.</p>
                          <Link href="/tutor/dashboard/create" className="text-xs font-bold bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 text-slate-600">Create Now</Link>
                      </div>
                  ) : (
                      <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                                  <tr>
                                      <th className="px-6 py-4">Title</th>
                                      <th className="px-6 py-4">Type</th>
                                      <th className="px-6 py-4 text-right">Status</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                  {recent.map((item, i) => (
                                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                          <td className="px-6 py-4">
                                              <p className="font-bold text-slate-800 truncate max-w-[180px] sm:max-w-xs">{item.title}</p>
                                              {item.status === 'rejected' && item.admin_feedback && (
                                                  <div className="text-[10px] text-red-500 mt-1 flex items-center gap-1 bg-red-50 w-fit px-2 py-0.5 rounded">
                                                      <AlertTriangle className="w-3 h-3"/> {item.admin_feedback}
                                                  </div>
                                              )}
                                          </td>
                                          <td className="px-6 py-4">
                                              <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                                                  {item.type || 'Course'}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                                  item.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-100' :
                                                  item.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                  'bg-amber-50 text-amber-700 border border-amber-100'
                                              }`}>
                                                  {item.status}
                                              </span>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  )}
              </div>
          </div>
      </div>

    </div>
  );
}