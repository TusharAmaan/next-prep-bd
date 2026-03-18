'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { 
  FileText, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ExternalLink,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  Printer,
  Save
} from "lucide-react";

interface StudentLectureSheetsProps {
  user: any;
}

const StudentLectureSheets: React.FC<StudentLectureSheetsProps> = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'available' | 'my-requests'>('available');
  const [availableSheets, setAvailableSheets] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Request Form State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    segment_id: '',
    group_id: '',
    subject_id: '',
    topic: '',
    comment: '',
    user_deadline: ''
  });

  const [existingSuggestions, setExistingSuggestions] = useState<any[]>([]);

  // Fetch Hierarchy
  useEffect(() => {
    const fetchSegments = async () => {
      const { data } = await supabase.from('segments').select('*').order('title');
      setSegments(data || []);
    };
    fetchSegments();
  }, []);

  const fetchGroups = async (segId: string) => {
    const { data } = await supabase.from('groups').select('*').eq('segment_id', segId).order('title');
    setGroups(data || []);
    setFormData(prev => ({ ...prev, group_id: '', subject_id: '' }));
  };

  const fetchSubjects = async (grpId: string) => {
    const { data } = await supabase.from('subjects').select('*').eq('group_id', grpId).order('title');
    setSubjects(data || []);
    setFormData(prev => ({ ...prev, subject_id: '' }));
  };

  // Fetch Available & Requests
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Requests
      const { data: reqData } = await supabase
        .from('lecture_sheet_requests')
        .select('*, segments(title), groups(title), subjects(title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setMyRequests(reqData || []);

      // 2. Fetch Available Sheets (Public OR Manually Granted)
      // First, get manual access IDs
      const { data: accessData } = await supabase
        .from('lecture_sheet_access')
        .select('lecture_sheet_id')
        .eq('user_id', user.id);
      
      const manualIds = (accessData || []).map(a => a.lecture_sheet_id);

      // Fetch sheets that are public OR in manualIds
      let query = supabase
        .from('lecture_sheets')
        .select('*, segments(title), groups(title), subjects(title)')
        .eq('is_published', true);
      
      const { data: sheetsData } = await query;
      
      // Filter by access_type and manual access (Professional Handling)
      const eligible = (sheetsData || []).filter(s => {
        if (s.access_type === 'public') return true;
        if (manualIds.includes(s.id)) return true;
        // Batch restricted logic
        if (s.access_type === 'restricted' && user.batch && s.allowed_batches?.includes(user.batch)) return true;
        return false;
      });
      
      setAvailableSheets(eligible);
    } catch (err) {
      console.error("Error fetching student sheets:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user.id, user.batch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Smart Search Logic
  useEffect(() => {
    if (formData.subject_id && formData.topic.length > 2) {
      const suggestions = availableSheets.filter(s => 
        s.subject_id === parseInt(formData.subject_id) && 
        s.title.toLowerCase().includes(formData.topic.toLowerCase())
      );
      setExistingSuggestions(suggestions);
    } else {
      setExistingSuggestions([]);
    }
  }, [formData.topic, formData.subject_id, availableSheets]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject_id || !formData.topic) return;

    try {
      const { error } = await supabase.from('lecture_sheet_requests').insert([{
        user_id: user.id,
        segment_id: parseInt(formData.segment_id),
        group_id: formData.group_id ? parseInt(formData.group_id) : null,
        subject_id: parseInt(formData.subject_id),
        topic: formData.topic,
        comment: formData.comment,
        user_deadline: formData.user_deadline || null
      }]);

      if (error) throw error;
      setShowRequestModal(false);
      setFormData({ segment_id: '', group_id: '', subject_id: '', topic: '', comment: '', user_deadline: '' });
      fetchData();
    } catch (err) {
      console.error("Error submitting request:", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex bg-slate-100 p-1 rounded-2xl">
           <button 
             onClick={() => setActiveSubTab('available')}
             className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'available' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Available Sheets
           </button>
           <button 
             onClick={() => setActiveSubTab('my-requests')}
             className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'my-requests' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
           >
             My Requests
           </button>
        </div>
        
        <button 
          onClick={() => setShowRequestModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Request Lecture Sheet
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activeSubTab === 'available' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableSheets.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                  <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900">No sheets available for you yet.</h3>
                  <p className="text-slate-500 mt-2 max-w-sm mx-auto">Requests sheets for your subjects to build your personal library.</p>
                </div>
              ) : (
                availableSheets.map((sheet) => (
                  <div key={sheet.id} className="bg-white rounded-[2.5rem] p-4 border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full shadow-sm">
                    <div className="h-44 bg-slate-50 rounded-[1.8rem] mb-5 relative overflow-hidden flex items-center justify-center">
                       {sheet.thumbnail_url ? (
                         <img src={sheet.thumbnail_url} alt={sheet.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       ) : (
                         <div className="p-8 bg-indigo-50 rounded-2xl">
                            <FileText className="w-12 h-12 text-indigo-300" />
                         </div>
                       )}
                       <div className="absolute top-3 left-3 flex gap-2">
                          <span className="bg-white/90 backdrop-blur-md text-[10px] font-black uppercase px-2 py-1 rounded-lg text-indigo-600 border border-white shadow-sm">
                            {sheet.subjects?.title}
                          </span>
                       </div>
                    </div>
                    
                    <div className="px-2 flex-1">
                       <h3 className="text-lg font-black text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600">{sheet.title}</h3>
                       <p className="text-sm text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">{sheet.description || "Comprehensive concept sheet."}</p>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-3 pb-2 px-2">
                       <button className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-slate-800 transition-colors">
                          <Printer className="w-4 h-4" /> PRINT
                       </button>
                       <button 
                         onClick={() => window.open(sheet.file_url, '_blank')}
                         className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
                       >
                          <Download className="w-4 h-4" /> OPEN
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                  <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900">You haven't requested any sheets yet.</h3>
                  <p className="text-slate-500 mt-2">Need material for a specific topic? Just ask!</p>
                </div>
              ) : (
                myRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-lg transition-all shadow-sm">
                    <div className="space-y-2">
                       <div className="flex items-center gap-3 mb-1">
                          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                             req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                             req.status === 'taking_time' ? 'bg-indigo-100 text-indigo-700' :
                             req.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                             'bg-slate-100 text-slate-700'
                          }`}>
                            {req.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">{new Date(req.created_at).toLocaleDateString()}</span>
                       </div>
                       <h3 className="text-xl font-black text-slate-900">{req.topic}</h3>
                       <div className="flex gap-4 text-xs font-bold text-slate-400">
                          <span className="bg-slate-50 px-2 py-0.5 rounded uppercase">{req.subjects?.title}</span>
                          {req.admin_deadline && (
                            <span className="text-indigo-600 flex items-center gap-1">
                               <Clock className="w-3.5 h-3.5" /> Est. Completion: {new Date(req.admin_deadline).toLocaleDateString()}
                            </span>
                          )}
                       </div>
                    </div>

                    <div className="w-full md:w-auto h-px md:h-12 border-t md:border-l border-slate-100 hidden md:block"></div>

                    <div className="flex flex-col gap-2 w-full md:w-64">
                       {req.admin_response && (
                         <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Admin Response</p>
                            <p className="text-xs text-slate-600 italic leading-relaxed">"{req.admin_response}"</p>
                         </div>
                       )}
                       {req.status === 'published' && req.linked_sheet_id && (
                         <button 
                           onClick={() => setActiveSubTab('available')}
                           className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                         >
                            <CheckCircle2 className="w-4 h-4" /> VIEW PUBLISHED SHEET
                         </button>
                       )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar relative">
              <button 
                onClick={() => setShowRequestModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors"
                type="button"
              >
                 <Plus className="w-6 h-6 rotate-45" />
              </button>

              <div className="mb-8">
                 <h2 className="text-3xl font-black text-slate-900">Ask for Lecture Sheet</h2>
                 <p className="text-slate-500 mt-2">Need something special? Tell us what you need and our experts will prepare it.</p>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase ml-1">Academic Segment</label>
                       <select 
                         required
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all"
                         value={formData.segment_id}
                         onChange={(e) => { setFormData(prev => ({ ...prev, segment_id: e.target.value })); fetchGroups(e.target.value); }}
                       >
                         <option value="">Select Segment</option>
                         {segments.map(seg => <option key={seg.id} value={seg.id}>{seg.title}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase ml-1">Group (Optional)</label>
                       <select 
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all disabled:opacity-50"
                         disabled={!formData.segment_id}
                         value={formData.group_id}
                         onChange={(e) => { setFormData(prev => ({ ...prev, group_id: e.target.value })); fetchSubjects(e.target.value); }}
                       >
                         <option value="">Select Group</option>
                         {groups.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1">Subject</label>
                    <select 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all disabled:opacity-50"
                      disabled={!formData.group_id && !formData.segment_id}
                      value={formData.subject_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject_id: e.target.value }))}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                 </div>

                 <div className="space-y-2 relative">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1">Specific Topic / Sheet Title</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g., Vector Component Analysis"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all"
                      value={formData.topic}
                      onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    />
                    
                    {/* Smart Suggestion UI */}
                    {existingSuggestions.length > 0 && (
                      <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-indigo-600 rounded-2xl p-4 shadow-xl z-[6000] border border-indigo-500 animate-in slide-in-from-top-2">
                         <div className="flex items-center gap-2 mb-3">
                            <HelpCircle className="w-4 h-4 text-white" />
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Wait, we might have this already!</p>
                         </div>
                         <div className="space-y-2">
                            {existingSuggestions.map(s => (
                              <div key={s.id} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl border border-white/5 flex items-center justify-between transition-colors">
                                 <span className="text-sm font-bold text-white line-clamp-1">{s.title}</span>
                                 <button onClick={() => { setShowRequestModal(false); setActiveSubTab('available'); }} type="button" className="text-[10px] font-black uppercase text-indigo-100 bg-white/10 px-2 py-1 rounded hover:bg-indigo-300 hover:text-white transition-all">VIEW SHEET</button>
                              </div>
                            ))}
                         </div>
                         <p className="text-[10px] text-indigo-200 mt-3 italic">If these aren't what you need, please continue with your request.</p>
                      </div>
                    )}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase ml-1">Comment / Specific Instructions</label>
                       <textarea 
                         rows={3}
                         placeholder="e.g., Include previous year BUET questions in the sheet."
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all resize-none"
                         value={formData.comment}
                         onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase ml-1">Need it by (Deadline)</label>
                       <input 
                         type="date"
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all shadow-inner"
                         value={formData.user_deadline}
                         onChange={(e) => setFormData(prev => ({ ...prev, user_deadline: e.target.value }))}
                       />
                       <p className="text-[10px] text-slate-400 font-medium italic mt-1 ml-1">We will try our best to meet your deadline.</p>
                    </div>
                 </div>

                 <div className="pt-4 grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowRequestModal(false)}
                      className="w-full py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                      type="submit"
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-200 active:scale-95"
                    >
                       SUBMIT REQUEST
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default StudentLectureSheets;
