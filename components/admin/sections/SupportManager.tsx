"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  FileText, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  Calendar,
  MessageSquare,
  Bookmark
} from "lucide-react";

type SupportTab = 'exams' | 'sheets' | 'reports';

export default function SupportManager({ darkMode = false }: { darkMode?: boolean }) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<SupportTab>('exams');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let query;
      if (activeTab === 'exams') {
        query = supabase
          .from('exam_requests')
          .select('*, student:student_id(full_name, email)')
          .order('created_at', { ascending: false });
      } else if (activeTab === 'sheets') {
        query = supabase
          .from('lecture_sheet_requests')
          .select('*, student:user_id(full_name, email)')
          .order('created_at', { ascending: false });
      } else {
        query = supabase
          .from('user_question_reports')
          .select('*, student:user_id(full_name, email), question:question_id(question_text)')
          .order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (data) setItems(data);
    } catch (err) {
      console.error("Error fetching support items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleUpdateStatus = async (id: any, status: string, table: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from(table)
        .update({ status })
        .eq('id', id);
      
      if (!error) {
        setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
        setSelectedItem(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'resolved':
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'rejected':
        return 'bg-rose-100 text-rose-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm w-fit">
        <button 
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'exams' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <HelpCircle size={18} /> Exam Requests
        </button>
        <button 
          onClick={() => setActiveTab('sheets')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'sheets' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <FileText size={18} /> Sheet Requests
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <AlertTriangle size={18} /> Question Reports
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-24">
            <Loader2 size={40} className="animate-spin text-indigo-600 mb-4" />
            <p className="text-slate-500 font-bold">Synchronizing mailbox...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">All Caught Up!</h3>
            <p className="text-slate-500 mt-2">No pending student requests in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-700">
                <tr>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-wider">Student & Subject</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-wider">Details</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusColor(item.status)} font-black text-lg`}>
                          {(item.student?.full_name || 'A').charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 dark:text-white">{item.student?.full_name || 'Anonymous'}</p>
                          <p className="text-sm text-slate-500">{(activeTab === 'exams' ? item.subject : item.topic) || (activeTab === 'reports' ? 'Question Bug' : 'N/A')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-md">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        {activeTab === 'exams' && (
                          <>
                            <span className="text-xs text-slate-400 font-bold">• {item.segment}</span>
                            {item.priority && (
                              <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                item.priority === 'urgent' ? 'bg-rose-500 text-white' : 
                                item.priority === 'high' ? 'bg-amber-500 text-white' : 'bg-slate-400 text-white'
                              }`}>
                                {item.priority}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                        {item.details || item.comment || item.reason || (activeTab === 'reports' ? item.question?.question_text : 'No additional details provided.')}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock size={14} />
                        <span className="text-sm font-bold">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedItem(item)}
                        className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-xs font-black hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95"
                      >
                        REVIEW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20">
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Support Request Review</h3>
                  <p className="text-slate-500 mt-1 font-bold">Priority Resolution Desk</p>
                </div>
                <button onClick={() => setSelectedItem(null)} className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 mb-8 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-white">{selectedItem.student?.full_name}</p>
                    <p className="text-xs text-slate-500 font-bold">{selectedItem.student?.email}</p>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                  "{selectedItem.details || selectedItem.comment || selectedItem.reason || selectedItem.question?.question_text}"
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handleUpdateStatus(selectedItem.id, activeTab === 'reports' ? 'resolved' : 'approved', activeTab === 'exams' ? 'exam_requests' : (activeTab === 'sheets' ? 'lecture_sheet_requests' : 'user_question_reports'))}
                  disabled={actionLoading}
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {activeTab === 'reports' ? 'MARK RESOLVED' : 'APPROVE REQUEST'}
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedItem.id, activeTab === 'reports' ? 'pending' : 'rejected', activeTab === 'exams' ? 'exam_requests' : (activeTab === 'sheets' ? 'lecture_sheet_requests' : 'user_question_reports'))}
                  disabled={actionLoading}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white py-4 rounded-2xl font-black text-sm hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  {activeTab === 'reports' ? 'UNRESOLVED' : 'REJECT'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal placeholder icons to avoid missing import errors if they exist in context but not standard lucide
const User = ({ size, color, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
