"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { 
  FileText, CheckCircle, Clock, AlertTriangle, 
  Plus, Hammer, Layout, ArrowRight, Loader2 
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

      const { data: resources } = await supabase
        .from("resources")
        .select("status, title, created_at, type, admin_feedback")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (resources) {
        setStats({
          pending: resources.filter(r => r.status === 'pending').length,
          approved: resources.filter(r => r.status === 'approved').length,
          rejected: resources.filter(r => r.status === 'rejected').length,
        });
        setRecent(resources.slice(0, 5));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600"/></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      
      {/* 1. HERO GREETING */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                Hello, <span className="text-indigo-600">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span> 👋
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
                You have <span className="font-bold text-amber-500">{stats.pending} items</span> pending review.
            </p>
        </div>
        <div className="flex gap-3 relative z-10">
            <Link href="/tutor/dashboard/create" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 hover:shadow-xl transition-all flex items-center gap-2">
                <Plus className="w-5 h-5"/> Create Content
            </Link>
        </div>
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-[100px] -z-0" />
      </div>

      {/* 2. STATS & QUICK TOOLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Status Cards */}
          <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Content Status</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 text-green-700 rounded-lg"><CheckCircle className="w-5 h-5"/></div>
                          <span className="font-bold text-slate-600">Approved</span>
                      </div>
                      <span className="text-2xl font-black text-slate-800">{stats.approved}</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><Clock className="w-5 h-5"/></div>
                          <span className="font-bold text-slate-600">Pending</span>
                      </div>
                      <span className="text-2xl font-black text-slate-800">{stats.pending}</span>
                  </div>
              </div>
          </div>

          {/* Tool Grid */}
          <div className="lg:col-span-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Instructor Tools</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/tutor/dashboard/question-builder" className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group">
                      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Hammer className="w-6 h-6"/>
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg">Question Builder</h4>
                      <p className="text-sm text-slate-500 mt-1">Generate PDF exam papers from the question bank.</p>
                  </Link>
                  
                  <Link href="/tutor/dashboard/courses" className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all group">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Layout className="w-6 h-6"/>
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg">My Courses</h4>
                      <p className="text-sm text-slate-500 mt-1">Manage curriculum, lessons, and pricing.</p>
                  </Link>
              </div>
          </div>
      </div>

      {/* 3. RECENT ACTIVITY */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Recent Activity</h3>
              <Link href="/tutor/dashboard/content" className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">View All <ArrowRight className="w-3 h-3"/></Link>
          </div>
          <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                  <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4 text-right">Status</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                  {recent.length === 0 ? (
                      <tr><td colSpan={3} className="p-8 text-center text-slate-400 italic">No activity yet.</td></tr>
                  ) : recent.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                              <p className="font-bold text-slate-800 truncate max-w-[200px]">{item.title}</p>
                              {item.status === 'rejected' && item.admin_feedback && (
                                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {item.admin_feedback}</p>
                              )}
                          </td>
                          <td className="px-6 py-4 capitalize text-slate-500">{item.type}</td>
                          <td className="px-6 py-4 text-right">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                  item.status === 'approved' ? 'bg-green-50 text-green-700' :
                                  item.status === 'rejected' ? 'bg-red-50 text-red-700' :
                                  'bg-amber-50 text-amber-700'
                              }`}>
                                  {item.status}
                              </span>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

    </div>
  );
}