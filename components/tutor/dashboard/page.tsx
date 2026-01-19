"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { FileText, Clock, CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import Link from "next/link";

export default function TutorDashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    total: 0,
    courses: 0
  });
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Resources Stats
      const { data: resources } = await supabase
        .from("resources")
        .select("status, title, created_at, type")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      // 2. Fetch Courses Stats
      const { count: courseCount } = await supabase
        .from("courses")
        .select("*", { count: 'exact', head: true })
        .eq("tutor_id", user.id);

      if (resources) {
        const pending = resources.filter(r => r.status === 'pending').length;
        const approved = resources.filter(r => r.status === 'approved').length;
        
        setStats({
          pending,
          approved,
          total: resources.length,
          courses: courseCount || 0
        });
        setRecentItems(resources.slice(0, 5));
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-black text-slate-900">Welcome Back, Tutor!</h1>
            <p className="text-slate-500">Here is the status of your content submissions.</p>
        </div>
        <Link href="/tutor/dashboard/create" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
            + Create New Content
        </Link>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</p>
                    <h3 className="text-2xl font-black text-slate-800">{stats.pending}</h3>
                </div>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Published</p>
                    <h3 className="text-2xl font-black text-slate-800">{stats.approved}</h3>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Resources</p>
                    <h3 className="text-2xl font-black text-slate-800">{stats.total}</h3>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Courses</p>
                    <h3 className="text-2xl font-black text-slate-800">{stats.courses}</h3>
                </div>
            </div>
        </div>
      </div>

      {/* RECENT UPLOADS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">Recent Uploads</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400">
                    <tr>
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {recentItems.length > 0 ? recentItems.map((item: any) => (
                        <tr key={item.title + item.created_at} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-800">{item.title}</td>
                            <td className="px-6 py-4"><span className="uppercase text-[10px] bg-slate-100 px-2 py-1 rounded font-bold">{item.type}</span></td>
                            <td className="px-6 py-4">{new Date(item.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                    item.status === 'approved' 
                                        ? 'bg-green-100 text-green-700' 
                                        : item.status === 'rejected'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {item.status === 'pending' && <Clock className="w-3 h-3" />}
                                    {item.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                                    {item.status === 'rejected' && <AlertCircle className="w-3 h-3" />}
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-400 italic">You haven't uploaded anything yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
}