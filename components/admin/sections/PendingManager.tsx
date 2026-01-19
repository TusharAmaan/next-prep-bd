"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  CheckCircle, XCircle, Search, 
  FileText, Video, BookOpen, HelpCircle, Layers, AlertTriangle, Loader2
} from "lucide-react";

export default function PendingManager() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'resources' | 'courses'>('resources');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Review Modal State
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [feedback, setFeedback] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
        let result;
        
        if (activeTab === 'courses') {
            // Fetch courses where status is pending AND tutor is NOT an admin
            result = await supabase
                .from('courses')
                .select('*, tutor:tutor_id!inner(email, role, full_name)') 
                .eq('status', 'pending')
                .neq('tutor.role', 'admin') // Exclude Admin posts
                .order('created_at', { ascending: false });
        } else {
            // Fetch resources where status is pending AND author is NOT an admin
            result = await supabase
                .from('resources')
                .select(`*, author:author_id!inner(email, role, full_name), subjects(title)`)
                .eq('status', 'pending')
                .neq('author.role', 'admin') // Exclude Admin posts
                .order('created_at', { ascending: false });
        }

        // Client-side filter as backup (in case Supabase join filtering is tricky)
        const filteredData = (result.data || []).filter((item: any) => {
            const role = activeTab === 'courses' ? item.tutor?.role : item.author?.role;
            return role !== 'admin';
        });

        setItems(filteredData);

    } catch (err: any) {
        console.error("Error fetching pending items:", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [activeTab]);

  const handleReview = async () => {
    if (!selectedItem || !actionType) return;
    
    const table = activeTab === 'courses' ? 'courses' : 'resources';
    const status = actionType === 'approve' ? 'approved' : 'rejected';

    const updateData: any = { 
        status,
        rejected_at: actionType === 'reject' ? new Date().toISOString() : null,
        admin_feedback: actionType === 'reject' ? feedback : null
    };

    const { error } = await supabase.from(table).update(updateData).eq('id', selectedItem.id);

    if (!error) {
      setSelectedItem(null);
      setFeedback('');
      setActionType(null);
      fetchPending(); 
    } else {
      alert("Error: " + error.message);
    }
  };

  // --- RENDER TABLE (Simplified for brevity, logic is the same) ---
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
           <button onClick={() => setActiveTab('resources')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'resources' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}><FileText size={16}/> Resources</button>
           <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'courses' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}><Layers size={16}/> Courses</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold">
               <tr>
                 <th className="px-6 py-4">Title</th>
                 <th className="px-6 py-4">Submitted By</th>
                 <th className="px-6 py-4">Type</th>
                 <th className="px-6 py-4">Date</th>
                 <th className="px-6 py-4 text-right">Review</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {loading ? (
                 <tr><td colSpan={5} className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/>Loading...</td></tr>
               ) : items.length === 0 ? (
                 <tr><td colSpan={5} className="p-12 text-center text-slate-400">All caught up! No pending items.</td></tr>
               ) : (
                 items.map((item) => (
                   <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{item.title}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="font-bold">{activeTab === 'courses' ? item.tutor?.full_name : item.author?.full_name}</div>
                        <div className="text-xs text-slate-400">{activeTab === 'courses' ? item.tutor?.email : item.author?.email}</div>
                      </td>
                      <td className="px-6 py-4 capitalize"><span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold">{item.type || 'Course'}</span></td>
                      <td className="px-6 py-4 text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={() => setSelectedItem(item)} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700">Review</button>
                      </td>
                   </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>

      {/* MODAL LOGIC (Kept same as before, simplified here for space) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                <h3 className="text-xl font-bold mb-4">Review: {selectedItem.title}</h3>
                
                {!actionType ? (
                    <div className="flex gap-3">
                        <button onClick={() => setActionType('approve')} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold">Approve</button>
                        <button onClick={() => setActionType('reject')} className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-bold">Reject</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {actionType === 'reject' && (
                            <textarea 
                                className="w-full border p-3 rounded-lg" 
                                placeholder="Reason for rejection..."
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                            />
                        )}
                        <button onClick={handleReview} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold">Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}</button>
                    </div>
                )}
                <button onClick={() => {setSelectedItem(null); setActionType(null)}} className="mt-4 text-slate-400 text-sm w-full">Cancel</button>
            </div>
        </div>
      )}
    </div>
  );
}