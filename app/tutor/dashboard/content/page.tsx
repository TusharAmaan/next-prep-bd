"use client";
import { useEffect, useState } from "react";
// FIX: Import 'supabase' directly
import { supabase } from "@/lib/supabaseClient"; 
import Link from "next/link";
import { 
  Search, Filter, Eye, Clock, Edit3, 
  MoreVertical, AlertCircle, CheckCircle2, Clock3 
} from "lucide-react";
import RejectionModal from "@/components/tutor/RejectionModal";

export default function MyContentPage() {
  const [activeTab, setActiveTab] = useState('all'); 
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRejection, setSelectedRejection] = useState<string | null>(null);

  // Note: We use the imported 'supabase' object directly now.

  useEffect(() => {
    fetchContent();
  }, [activeTab]);

  const fetchContent = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase
      .from('resources')
      .select('id, title, type, status, views, created_at, admin_feedback, subjects(title)')
      .eq('author_id', user?.id)
      .order('created_at', { ascending: false });

    if (activeTab !== 'all') {
      query = query.eq('status', activeTab);
    }

    const { data } = await query;
    setResources(data || []);
    setLoading(false);
  };

  const getReadTime = (type: string) => {
    return type === 'video' ? '15m' : '3m'; 
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Content Manager</h1>
          <p className="text-slate-500 text-sm">Track performance and manage your submissions.</p>
        </div>
        <Link href="/tutor/dashboard/create" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all">
          + Upload New Content
        </Link>
      </div>

      {/* TABS */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 inline-flex">
        {['all', 'approved', 'pending', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
              activeTab === tab 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">Content Title</th>
              <th className="px-6 py-4">Performance</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading content...</td></tr>
            ) : resources.length === 0 ? (
               <tr><td colSpan={4} className="p-8 text-center text-slate-400">No content found in this category.</td></tr>
            ) : (
              resources.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 group transition-colors">
                  <td className="px-6 py-4">
                    <div className="max-w-sm">
                      <p className="font-bold text-slate-900 text-sm truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded capitalize">{item.type}</span>
                        <span className="text-[10px] text-slate-400 font-medium">• {item.subjects?.title || 'General'}</span>
                        <span className="text-[10px] text-slate-400 font-medium">• {new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                      <div className="flex items-center gap-1" title="Total Views">
                        <Eye className="w-4 h-4 text-indigo-400" />
                        {item.views || 0}
                      </div>
                      <div className="flex items-center gap-1" title="Est. Read/Watch Time">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        {getReadTime(item.type)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === 'approved' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3"/> Live</span>}
                    {item.status === 'pending' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><Clock3 className="w-3 h-3"/> Reviewing</span>}
                    {item.status === 'rejected' && (
                      <button 
                        onClick={() => setSelectedRejection(item.admin_feedback || "No reason provided.")}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        <AlertCircle className="w-3 h-3"/> Rejected (Why?)
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/tutor/dashboard/edit/${item.id}`} className="text-slate-400 hover:text-indigo-600 transition-colors">
                      <Edit3 className="w-4 h-4 inline-block" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedRejection && (
        <RejectionModal 
          reason={selectedRejection} 
          onClose={() => setSelectedRejection(null)} 
        />
      )}

    </div>
  );
}