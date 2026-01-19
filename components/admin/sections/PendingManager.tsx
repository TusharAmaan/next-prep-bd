"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  CheckCircle, XCircle, Search, 
  FileText, Video, BookOpen, HelpCircle, Layers, AlertTriangle, Eye, Loader2
} from "lucide-react";

export default function PendingManager() {
  const supabase = createClient();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'resources' | 'courses'>('resources');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // New Error State
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Review Modal State
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [feedback, setFeedback] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // --- FETCH DATA ---
  const fetchPending = async () => {
    setLoading(true);
    setErrorMsg(null);
    
    try {
        let result;
        
        if (activeTab === 'courses') {
            // Courses Query
            result = await supabase
                .from('courses')
                .select('*, tutor:tutor_id(email, full_name)') // Fetch tutor details
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
        } else {
            // Resources Query
            // Note: We use !inner on joins if we wanted to enforce existence, but here standard join is fine.
            result = await supabase
                .from('resources')
                .select(`
                    *, 
                    author:author_id(email, full_name), 
                    subjects(title), 
                    segments(title)
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
        }

        if (result.error) throw result.error;
        
        console.log("Fetched Pending Items:", result.data); // Debug log
        setItems(result.data || []);

    } catch (err: any) {
        console.error("Error fetching pending items:", err);
        setErrorMsg(err.message || "Failed to load data. Check RLS policies.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [activeTab]);

  // --- ACTIONS ---
  const handleReview = async () => {
    if (!selectedItem || !actionType) return;
    
    const table = activeTab === 'courses' ? 'courses' : 'resources';
    const status = actionType === 'approve' ? 'approved' : 'rejected';

    const updateData: any = { 
        status,
        rejected_at: actionType === 'reject' ? new Date().toISOString() : null 
    };
    
    if (actionType === 'reject') {
        updateData.admin_feedback = feedback;
    }

    const { error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', selectedItem.id);

    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      setSelectedItem(null);
      setFeedback('');
      setActionType(null);
      fetchPending(); // Refresh list immediately
    }
  };

  // --- FILTERING LOGIC ---
  const filteredItems = items.filter(item => {
    const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video size={16} className="text-blue-500"/>;
      case 'pdf': return <FileText size={16} className="text-red-500"/>;
      case 'question': return <HelpCircle size={16} className="text-orange-500"/>;
      case 'blog': return <BookOpen size={16} className="text-emerald-500"/>;
      default: return <Layers size={16} className="text-indigo-500"/>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
           <button 
             onClick={() => setActiveTab('resources')}
             className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'resources' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
           >
             <FileText size={16}/> Resources
           </button>
           <button 
             onClick={() => setActiveTab('courses')}
             className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'courses' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
           >
             <Layers size={16}/> Courses
           </button>
        </div>

        {/* FILTERS */}
        <div className="flex gap-2">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
             <input 
               placeholder="Search title..." 
               className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           {activeTab === 'resources' && (
             <select 
               className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
               value={filterType}
               onChange={(e) => setFilterType(e.target.value)}
             >
               <option value="all">All Types</option>
               <option value="pdf">PDFs</option>
               <option value="video">Videos</option>
               <option value="blog">Blogs</option>
               <option value="question">Questions</option>
             </select>
           )}
        </div>
      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {errorMsg}
          </div>
      )}

      {/* TABLE */}
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
                 <tr><td colSpan={5} className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/>Loading pending items...</td></tr>
               ) : filteredItems.length === 0 ? (
                 <tr><td colSpan={5} className="p-12 text-center text-slate-400">No items waiting for review.</td></tr>
               ) : (
                 filteredItems.map((item) => (
                   <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 max-w-xs truncate">
                        {item.title}
                        {item.subjects?.title && <div className="text-[10px] text-slate-400 font-normal">{item.subjects.title}</div>}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="font-bold">{activeTab === 'courses' ? item.tutor?.full_name : item.author?.full_name || 'Unknown'}</div>
                        <div className="text-xs text-slate-400">{activeTab === 'courses' ? item.tutor?.email : item.author?.email}</div>
                      </td>
                      <td className="px-6 py-4 capitalize flex items-center gap-2">
                        {getIcon(item.type || 'course')}
                        {item.type || 'Course'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => setSelectedItem(item)}
                           className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-indigo-200"
                         >
                           Review
                         </button>
                      </td>
                   </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>

      {/* --- REVIEW MODAL --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95">
              
              {/* Modal Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-slate-800">Review Submission</h3>
                 <button onClick={() => { setSelectedItem(null); setActionType(null); }} className="text-slate-400 hover:text-slate-700">
                   Close
                 </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                 
                 {/* 1. Item Details */}
                 <div className="space-y-4">
                    <div>
                       <label className="text-xs font-bold text-slate-400 uppercase">Title</label>
                       <p className="text-lg font-bold text-slate-900">{selectedItem.title}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs font-bold text-slate-400 uppercase">Type</label>
                          <p className="font-medium capitalize">{selectedItem.type || 'Course'}</p>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-400 uppercase">Submitted On</label>
                          <p className="font-medium">{new Date(selectedItem.created_at).toLocaleDateString()}</p>
                       </div>
                    </div>

                    {/* Preview Links */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                       <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Content Preview</label>
                       
                       {/* Blog/Question Body Preview */}
                       {(selectedItem.type === 'blog' || selectedItem.type === 'question') && selectedItem.content_body && (
                         <div className="prose prose-sm max-w-none max-h-40 overflow-y-auto bg-white p-3 rounded border border-slate-100 mb-3 text-slate-600" dangerouslySetInnerHTML={{__html: selectedItem.content_body}} />
                       )}

                       {/* Course Description Preview */}
                       {activeTab === 'courses' && selectedItem.description && (
                         <div className="prose prose-sm max-w-none max-h-40 overflow-y-auto bg-white p-3 rounded border border-slate-100 mb-3 text-slate-600" dangerouslySetInnerHTML={{__html: selectedItem.description}} />
                       )}

                       <div className="flex flex-wrap gap-2">
                          {selectedItem.video_url && (
                            <a href={selectedItem.video_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 border border-blue-200">
                               <Video size={14}/> Open Video Link
                            </a>
                          )}
                          {(selectedItem.pdf_url || selectedItem.content_url) && (
                            <a href={selectedItem.pdf_url || selectedItem.content_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 border border-red-200">
                               <FileText size={14}/> View File / Link
                            </a>
                          )}
                          {/* Course Preview Link */}
                          {activeTab === 'courses' && (
                             <a href={`/courses/${selectedItem.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 border border-indigo-200">
                                <Eye size={14}/> View Full Course Page
                             </a>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* 2. Action Area */}
                 <div className="border-t border-slate-100 pt-6">
                    {!actionType ? (
                       <div className="flex gap-4">
                          <button 
                            onClick={() => setActionType('approve')}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all"
                          >
                             <CheckCircle size={18}/> Approve Content
                          </button>
                          <button 
                            onClick={() => setActionType('reject')}
                            className="flex-1 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                          >
                             <XCircle size={18}/> Reject
                          </button>
                       </div>
                    ) : (
                       <div className="animate-in slide-in-from-bottom-2 fade-in">
                          {actionType === 'approve' ? (
                             <div className="text-center space-y-4">
                                <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                   <CheckCircle size={24}/>
                                </div>
                                <h4 className="font-bold text-slate-800">Confirm Approval?</h4>
                                <p className="text-sm text-slate-500">This content will become live immediately.</p>
                                <div className="flex gap-2 justify-center mt-4">
                                   <button onClick={() => setActionType(null)} className="px-4 py-2 text-slate-500 font-bold text-sm">Cancel</button>
                                   <button onClick={handleReview} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700">Confirm Publish</button>
                                </div>
                             </div>
                          ) : (
                             <div className="space-y-4">
                                <h4 className="font-bold text-red-600 flex items-center gap-2">
                                   <AlertTriangle size={18}/> Rejection Reason
                                </h4>
                                <textarea 
                                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                                  rows={3}
                                  placeholder="Please explain why this content was rejected so the tutor can fix it..."
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                   <button onClick={() => setActionType(null)} className="px-4 py-2 text-slate-500 font-bold text-sm">Cancel</button>
                                   <button 
                                     onClick={handleReview} 
                                     disabled={!feedback.trim()}
                                     className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 disabled:opacity-50"
                                   >
                                      Confirm Rejection
                                   </button>
                                </div>
                             </div>
                          )}
                       </div>
                    )}
                 </div>

              </div>
           </div>
        </div>
      )}

    </div>
  );
}