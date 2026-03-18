'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { 
  FileText, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Plus, 
  ExternalLink, 
  Users,
  Trash2,
  Calendar,
  Layers,
  Filter
} from "lucide-react";

interface LectureSheetManagerProps {
  segments: any[];
  groups: any[];
  subjects: any[];
}

const LectureSheetManager: React.FC<LectureSheetManagerProps> = ({ segments, groups, subjects }) => {
  const [activeView, setActiveView] = useState<'requests' | 'sheets'>('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [sheets, setSheets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch Logic
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeView === 'requests') {
        const { data, error } = await supabase
          .from('lecture_sheet_requests')
          .select('*, profiles(full_name, email), segments(title), groups(title), subjects(title)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setRequests(data || []);
      } else {
        const { data, error } = await supabase
          .from('lecture_sheets')
          .select('*, segments(title), groups(title), subjects(title)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setSheets(data || []);
      }
    } catch (err) {
      console.error("Error fetching lecture sheet data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeView]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Status Update
  const updateRequestStatus = async (requestId: string, newStatus: string, adminComment?: string, adminDeadline?: string) => {
    try {
      const updateData: any = { status: newStatus, updated_at: new Date().toISOString() };
      if (adminComment) updateData.admin_response = adminComment;
      if (adminDeadline) updateData.admin_deadline = adminDeadline;

      const { error } = await supabase
        .from('lecture_sheet_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Error updating request status:", err);
    }
  };

  const handleDeleteSheet = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lecture sheet?")) return;
    try {
      const { error } = await supabase.from('lecture_sheets').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Error deleting sheet:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            Lecture Sheet System
          </h2>
          <p className="text-sm text-slate-500 font-medium">Manage student requests and repository</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveView('requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'requests' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <MessageSquare className="w-4 h-4" />
            Requests {requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveView('sheets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'sheets' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FileText className="w-4 h-4" />
            All Sheets
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by topic, student, or subject..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <select 
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="taking_time">Taking Time</option>
            <option value="published">Published</option>
          </select>
          {activeView === 'sheets' && (
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-indigo-100">
              <Plus className="w-4 h-4" />
              New Sheet
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeView === 'requests' ? (
            requests.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
                <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No requests found yet.</p>
              </div>
            ) : (
              requests.filter(r => {
                const matchesSearch = r.topic.toLowerCase().includes(searchTerm.toLowerCase()) || (r.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
                return matchesSearch && matchesStatus;
              }).map((req) => (
                <div key={req.id} className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-all group">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          req.status === 'taking_time' ? 'bg-indigo-100 text-indigo-700' :
                          req.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {req.status}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {req.topic}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                        <span className="bg-slate-50 px-2 py-1 rounded-md">{req.segments?.title}</span>
                        {req.groups?.title && <span className="bg-slate-50 px-2 py-1 rounded-md">{req.groups.title}</span>}
                        <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">{req.subjects?.title}</span>
                      </div>

                      <p className="text-sm text-slate-600 italic">"{req.comment}"</p>
                      
                      <div className="pt-2 flex items-center gap-4 text-xs font-medium text-slate-400">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Requested by: {req.profiles?.full_name || 'Unknown User'}</span>
                        {req.user_deadline && (
                          <span className={`flex items-center gap-1 font-bold ${new Date(req.user_deadline) < new Date() ? 'text-red-500' : 'text-slate-500'}`}>
                            <Clock className="w-3 h-3" /> 
                            Student Deadline: {new Date(req.user_deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="md:w-64 flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                      {req.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateRequestStatus(req.id, 'taking_time', 'I am working on this. Will be ready soon.', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())}
                            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 rounded-xl text-xs font-bold transition-all"
                          >
                            Accept & Taking Time
                          </button>
                          <button 
                            className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 rounded-xl text-xs font-bold transition-all"
                          >
                            Set Custom Deadline
                          </button>
                        </>
                      )}
                      
                      {req.status === 'taking_time' && (
                        <div className="space-y-2">
                           <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                              <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Your Deadline</p>
                              <p className="text-sm font-black text-indigo-700">{req.admin_deadline ? new Date(req.admin_deadline).toLocaleDateString() : 'Not Set'}</p>
                           </div>
                           <button 
                             onClick={() => setActiveView('sheets')}
                             className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-md"
                           >
                              Publish Sheet
                           </button>
                        </div>
                      )}

                      {req.status === 'published' && (
                        <div className="flex flex-col items-center text-center py-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                          <p className="text-xs font-bold text-slate-500 italic">This request is fulfilled</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sheets.length === 0 ? (
                <div className="col-span-full bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
                  <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No lecture sheets published yet.</p>
                </div>
              ) : (
                sheets.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase())).map((sheet) => (
                  <div key={sheet.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group">
                    <div className="h-40 bg-slate-100 relative overflow-hidden">
                       {sheet.thumbnail_url ? (
                         <img src={sheet.thumbnail_url} alt={sheet.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-12 h-12 text-slate-300" />
                         </div>
                       )}
                       <div className="absolute top-2 right-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg backdrop-blur-md bg-white/80 ${sheet.is_published ? 'text-emerald-600' : 'text-amber-600'}`}>
                             {sheet.is_published ? 'Published' : 'Draft'}
                          </span>
                       </div>
                    </div>
                    <div className="p-5">
                       <h3 className="font-bold text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                         {sheet.title}
                       </h3>
                       <div className="flex items-center gap-2 mb-4">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">{sheet.subjects?.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${sheet.access_type === 'public' ? 'text-blue-600 bg-blue-50' : 'text-purple-600 bg-purple-50'}`}>
                             {sheet.access_type}
                          </span>
                       </div>
                       <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                          <div className="flex gap-2">
                             <button onClick={() => window.open(sheet.file_url, '_blank')} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-all">
                                <ExternalLink className="w-4 h-4" />
                             </button>
                             <button className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-all">
                                <Users className="w-4 h-4" />
                             </button>
                          </div>
                          <button 
                            onClick={() => handleDeleteSheet(sheet.id)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LectureSheetManager;
