'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
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
  Filter,
  X,
  Upload,
  Link as LinkIcon,
  Edit,
  Globe,
  Lock
} from "lucide-react";

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// --- Custom Modal Component (Internal) ---
const CustomConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", type = "danger" }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95">
        <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-6 ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'}`}>
           <AlertCircle size={28} />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-8 text-sm font-medium leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-6 py-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-black hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all">CANCEL</button>
          <button onClick={onConfirm} className={`flex-1 px-6 py-3.5 ${type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'} text-white rounded-2xl text-sm font-black transition-all shadow-lg`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [editingSheet, setEditingSheet] = useState<any>(null);
  
  // Local Hierarchy State (To be robust)
  const [localSegments, setLocalSegments] = useState<any[]>(segments || []);
  const [localGroups, setLocalGroups] = useState<any[]>([]);
  const [localSubjects, setLocalSubjects] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    segment_id: '',
    group_id: '',
    subject_id: '',
    access_type: 'public',
    file_url: '',
    thumbnail_url: ''
  });

  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [selectedSheetForAccess, setSelectedSheetForAccess] = useState<any>(null);
  const [targetUserEmail, setTargetUserEmail] = useState('');
  const [grantedUsers, setGrantedUsers] = useState<any[]>([]);
  const [isSearchingUser, setIsSearchingUser] = useState(false);

  // Custom UI States
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void, type: 'danger' | 'primary'}>({
    isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'danger'
  });
  const [promptValue, setPromptValue] = useState('');

  // Fetch Hierarchy Helpers
  const fetchLocalGroups = async (segId: string) => {
    if (!segId) { setLocalGroups([]); return; }
    const { data } = await supabase.from('groups').select('*').eq('segment_id', segId).order('title');
    setLocalGroups(data || []);
  };

  const fetchLocalSubjects = async (grpId: string, segId?: string) => {
    if (!grpId && !segId) { setLocalSubjects([]); return; }
    let query = supabase.from('subjects').select('*');
    if (grpId) query = query.eq('group_id', grpId);
    else if (segId) query = query.eq('segment_id', segId);
    
    const { data } = await query.order('title');
    setLocalSubjects(data || []);
  };

  // Fetch Logic
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Refresh segments if prop is empty
      if (localSegments.length === 0) {
        const { data: sData } = await supabase.from('segments').select('*').order('title');
        setLocalSegments(sData || []);
      }

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
    setConfirmModal({
      isOpen: true,
      title: "Delete Sheet?",
      message: "This action cannot be undone. All user access logs for this sheet will also be removed.",
      type: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('lecture_sheets').delete().eq('id', id);
          if (error) throw error;
          fetchData();
          toast.success("Sheet deleted successfully");
        } catch (err) {
          console.error("Error deleting sheet:", err);
          toast.error("Failed to delete sheet");
        }
        setConfirmModal(p => ({ ...p, isOpen: false }));
      }
    });
  };

  const handleOpenAccessModal = async (sheet: any) => {
    setSelectedSheetForAccess(sheet);
    setIsAccessModalOpen(true);
    fetchGrantedUsers(sheet.id);
  };

  const fetchGrantedUsers = async (sheetId: string) => {
    const { data, error } = await supabase
      .from('lecture_sheet_access')
      .select('*, profiles(full_name, email)')
      .eq('lecture_sheet_id', sheetId);
    if (!error) setGrantedUsers(data || []);
  };

  const handleGrantAccess = async () => {
    if (!targetUserEmail) return;
    setIsSearchingUser(true);
    try {
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('email', targetUserEmail)
        .single();
      
      if (pError || !profile) {
        alert("User not found with this email.");
        return;
      }

      const { error: aError } = await supabase
        .from('lecture_sheet_access')
        .insert([{
          lecture_sheet_id: selectedSheetForAccess.id,
          user_id: profile.id
        }]);
      
      if (aError) {
        if (aError.code === '23505') alert("User already has access.");
        else throw aError;
      } else {
        setTargetUserEmail('');
        fetchGrantedUsers(selectedSheetForAccess.id);
      }
    } catch (err) {
      console.error("Error granting access:", err);
    } finally {
      setIsSearchingUser(false);
    }
  };

  const handleRevokeAccess = async (accessId: string) => {
    const { error } = await supabase
      .from('lecture_sheet_access')
      .delete()
      .eq('id', accessId);
    if (!error) fetchGrantedUsers(selectedSheetForAccess.id);
  };

  const handleOpenAddModal = () => {
    setEditingSheet(null);
    setSelectedRequest(null);
    setLocalGroups([]);
    setLocalSubjects([]);
    setFormData({
      title: '',
      description: '',
      segment_id: '',
      group_id: '',
      subject_id: '',
      access_type: 'public',
      file_url: '',
      thumbnail_url: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenPublishModal = (req: any) => {
    setSelectedRequest(req);
    setEditingSheet(null);
    
    // Pre-fetch hierarchy for the modal
    if (req.segment_id) fetchLocalGroups(req.segment_id.toString());
    if (req.group_id) fetchLocalSubjects(req.group_id.toString());
    else if (req.segment_id) fetchLocalSubjects('', req.segment_id.toString());

    setFormData({
      title: req.topic,
      description: req.comment || '',
      segment_id: req.segment_id?.toString() || '',
      group_id: req.group_id?.toString() || '',
      subject_id: req.subject_id?.toString() || '',
      access_type: 'public',
      file_url: '',
      thumbnail_url: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = slugify(formData.title);
      const sheetData: any = {
        ...formData,
        slug,
        is_published: true,
        updated_at: new Date().toISOString()
      };

      if (editingSheet) {
        const { error } = await supabase
          .from('lecture_sheets')
          .update(sheetData)
          .eq('id', editingSheet.id);
        if (error) throw error;
        toast.success("Sheet updated successfully");
      } else {
        sheetData.created_at = new Date().toISOString();
        const { error } = await supabase
          .from('lecture_sheets')
          .insert([sheetData]);
        if (error) throw error;
        toast.success("Lecture sheet published successfully");
      }

      // If published from a request, update the request status
      if (selectedRequest) {
        await supabase
          .from('lecture_sheet_requests')
          .update({ status: 'published', updated_at: new Date().toISOString() })
          .eq('id', selectedRequest.id);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Error saving sheet:", err);
      toast.error(err.message || "Failed to save sheet.");
    }
  };

  return (
    <div className="space-y-6 bg-slate-50 dark:bg-slate-900/50 min-h-screen p-1">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            Lecture Sheet System
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Manage student requests and repository</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setActiveView('requests')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${activeView === 'requests' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
          >
            <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Requests {requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="bg-red-500 text-white text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveView('sheets')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${activeView === 'sheets' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
          >
            <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
            All Sheets
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by topic, student, or subject..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 ml-2" />
          <select 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="taking_time">Taking Time</option>
            <option value="published">Published</option>
          </select>
          {activeView === 'sheets' && (
            <button 
              onClick={handleOpenAddModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-indigo-100"
            >
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
              <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">No requests found yet.</p>
              </div>
            ) : (
              requests.filter(r => {
                const matchesSearch = r.topic.toLowerCase().includes(searchTerm.toLowerCase()) || (r.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
                return matchesSearch && matchesStatus;
              }).map((req) => (
                <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all group">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          req.status === 'taking_time' ? 'bg-indigo-100 text-indigo-700' :
                          req.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {req.status}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {req.topic}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500">
                        <span className="bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">{req.segments?.title}</span>
                        {req.groups?.title && <span className="bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">{req.groups.title}</span>}
                        <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">{req.subjects?.title}</span>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500 italic">"{req.comment}"</p>
                      
                      <div className="pt-2 flex items-center gap-4 text-xs font-medium text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Requested by: {req.profiles?.full_name || 'Unknown User'}</span>
                        {req.user_deadline && (
                          <span className={`flex items-center gap-1 font-bold ${new Date(req.user_deadline) < new Date() ? 'text-red-500' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500'}`}>
                            <Clock className="w-3 h-3" /> 
                            Student Deadline: {new Date(req.user_deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="md:w-64 flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                      {req.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateRequestStatus(req.id, 'taking_time', 'I am working on this. Will be ready soon.', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())}
                            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-3 rounded-xl text-xs font-bold transition-all"
                          >
                            Accept & Taking Time
                          </button>
                          <button 
                            onClick={() => {
                              const comment = prompt("Reason for rejection?");
                              if (comment) updateRequestStatus(req.id, 'rejected', comment);
                            }}
                            className="w-full border border-red-200 hover:bg-red-50 text-red-600 py-3 rounded-xl text-xs font-bold transition-all"
                          >
                            Reject & Cancel
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
                             onClick={() => {
                               // Load hierarchy for the modal
                               if (req.segment_id) fetchLocalGroups(req.segment_id.toString());
                               if (req.group_id) fetchLocalSubjects(req.group_id.toString());
                               else if (req.segment_id) fetchLocalSubjects('', req.segment_id.toString());
                               handleOpenPublishModal(req);
                             }}
                             className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md"
                           >
                              Publish Sheet
                           </button>
                           <button 
                             onClick={() => {
                               const comment = prompt("Reason for cancellation?");
                               if (comment) updateRequestStatus(req.id, 'rejected', comment);
                             }}
                             className="w-full border border-red-100 hover:bg-red-50 text-red-400 py-2 rounded-xl text-[10px] font-bold transition-all"
                           >
                              Cancel Request
                           </button>
                        </div>
                      )}

                      {req.status === 'published' && (
                        <div className="flex flex-col items-center text-center py-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 italic">This request is fulfilled</p>
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
                <div className="col-span-full bg-white dark:bg-slate-900 p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                  <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">No lecture sheets published yet.</p>
                </div>
              ) : (
                sheets.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase())).map((sheet) => (
                  <div key={sheet.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all group">
                    <div className="h-40 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                       {sheet.thumbnail_url ? (
                         <img src={sheet.thumbnail_url} alt={sheet.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-12 h-12 text-slate-300" />
                         </div>
                       )}
                       <div className="absolute top-2 right-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg backdrop-blur-md bg-white dark:bg-slate-900/80 ${sheet.is_published ? 'text-emerald-600' : 'text-amber-600'}`}>
                             {sheet.is_published ? 'Published' : 'Draft'}
                          </span>
                       </div>
                    </div>
                    <div className="p-5">
                       <h3 className="font-bold text-slate-900 dark:text-white mb-2 truncate group-hover:text-indigo-600 transition-colors">
                         {sheet.title}
                       </h3>
                       <div className="flex items-center gap-2 mb-4">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded uppercase">{sheet.subjects?.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${sheet.access_type === 'public' ? 'text-blue-600 bg-blue-50' : 'text-purple-600 bg-purple-50'}`}>
                             {sheet.access_type}
                          </span>
                       </div>
                       <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                           <div className="flex gap-2">
                              <button onClick={() => window.open(sheet.file_url, '_blank')} className="p-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 dark:text-slate-500 transition-all" title="View File">
                                 <ExternalLink className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleOpenAccessModal(sheet)}
                                className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-600 transition-all"
                                title="Manage Access"
                              >
                                 <Users className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => { 
                                  // Pre-fetch hierarchy for editing
                                  if (sheet.segment_id) fetchLocalGroups(sheet.segment_id.toString());
                                  if (sheet.group_id) fetchLocalSubjects(sheet.group_id.toString());
                                  else if (sheet.segment_id) fetchLocalSubjects('', sheet.segment_id.toString());

                                  setEditingSheet(sheet); 
                                  setFormData({ 
                                    title: sheet.title, 
                                    description: sheet.description || '', 
                                    segment_id: sheet.segment_id?.toString() || '', 
                                    group_id: sheet.group_id?.toString() || '', 
                                    subject_id: sheet.subject_id?.toString() || '',
                                    access_type: sheet.access_type,
                                    file_url: sheet.file_url,
                                    thumbnail_url: sheet.thumbnail_url || ''
                                  }); 
                                  setIsModalOpen(true); 
                                }} 
                                className="p-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 dark:text-slate-500 transition-all"
                                title="Edit Sheet"
                              >
                                 <Edit className="w-4 h-4" />
                              </button>
                           </div>
                           <button 
                             onClick={() => handleDeleteSheet(sheet.id)}
                             className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                             title="Delete Sheet"
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
      {/* MODAL SYSTEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <form onSubmit={handleSaveSheet} className="p-8 space-y-6">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {editingSheet ? 'Edit Lecture Sheet' : selectedRequest ? 'Publish from Request' : 'Create New Lecture Sheet'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Fill in the details for the students</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Sheet Title</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Enter descriptive title"
                    className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 dark:text-slate-100"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2 text-left">
                   <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Segment</label>
                   <select 
                     required
                     className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 dark:text-slate-100"
                     value={formData.segment_id}
                     onChange={(e) => {
                       const segId = e.target.value;
                       setFormData({...formData, segment_id: segId, group_id: '', subject_id: ''});
                       fetchLocalGroups(segId);
                       fetchLocalSubjects('', segId);
                     }}
                   >
                     <option value="">Select Segment</option>
                     {localSegments.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                   </select>
                </div>

                <div className="space-y-2 text-left">
                   <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Group (Optional)</label>
                   <select 
                     className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 dark:text-slate-100"
                     value={formData.group_id}
                     onChange={(e) => {
                       const grpId = e.target.value;
                       setFormData({...formData, group_id: grpId, subject_id: ''});
                       if (grpId) fetchLocalSubjects(grpId);
                       else fetchLocalSubjects('', formData.segment_id);
                     }}
                   >
                     <option value="">Select Group</option>
                     {localGroups.map(g => (
                       <option key={g.id} value={g.id}>{g.title}</option>
                     ))}
                   </select>
                </div>

                <div className="col-span-full md:col-span-1 space-y-2 text-left">
                   <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Subject</label>
                   <select 
                     required
                     className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 dark:text-slate-100"
                     value={formData.subject_id}
                     onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                   >
                     <option value="">Select Subject</option>
                     {localSubjects.map(s => (
                       <option key={s.id} value={s.id}>{s.title}</option>
                     ))}
                   </select>
                </div>

                <div className="col-span-full space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">File URL / Link</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                    <input 
                      required
                      type="url" 
                      placeholder="Google Drive link or PDF URL"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 dark:text-slate-100"
                      value={formData.file_url}
                      onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 pl-1">Ensure the link is accessible and shared with "Anyone with the link"</p>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Access Type</label>
                   <select 
                     className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 dark:text-slate-100 uppercase text-xs"
                     value={formData.access_type}
                     onChange={(e) => setFormData({...formData, access_type: e.target.value})}
                   >
                     <option value="public">Public (Everyone)</option>
                     <option value="restricted">Restricted (Batch/Manual)</option>
                   </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Thumbnail (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Image URL"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 dark:text-slate-100"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-4 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 dark:text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 dark:bg-slate-800 transition-all"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  {editingSheet ? 'UPDATE' : selectedRequest ? 'PUBLISH NOW' : 'CREATE SHEET'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Access Management Modal */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h2 className="text-xl font-black text-slate-900 dark:text-white">Manage Manual Access</h2>
                   <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium mt-1">{selectedSheetForAccess?.title}</p>
                </div>
                <button onClick={() => setIsAccessModalOpen(false)} className="text-slate-300 hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Grant Access (User Email)</label>
                   <div className="flex gap-2">
                      <input 
                        type="email" 
                        placeholder="student@example.com"
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 dark:text-white"
                        value={targetUserEmail}
                        onChange={(e) => setTargetUserEmail(e.target.value)}
                      />
                      <button 
                        onClick={handleGrantAccess}
                        disabled={isSearchingUser}
                        className="px-6 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all text-xs uppercase"
                      >
                         {isSearchingUser ? '...' : 'Grant'}
                      </button>
                   </div>
                </div>

                <div className="space-y-3">
                   <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest pl-1">Users with Access</h3>
                   <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                      {grantedUsers.length === 0 ? (
                        <p className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">No manual access granted yet.</p>
                      ) : (
                        grantedUsers.map(access => (
                          <div key={access.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl group">
                             <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{access.profiles?.full_name}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500">{access.profiles?.email}</p>
                             </div>
                             <button 
                               onClick={() => handleRevokeAccess(access.id)}
                               className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                <button 
                  onClick={() => setIsAccessModalOpen(false)}
                  className="w-full py-4 bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 dark:shadow-none"
                >
                   Close
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Global Confirmation Modal */}
      <CustomConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
        type={confirmModal.type}
      />
    </div>
  );
};

export default LectureSheetManager;
