"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { 
  ShieldAlert, Trash2, Pin, CheckCircle2, XCircle, 
  MessageSquare, Search, Eye, ThumbsUp, AlertTriangle, 
  Clock, ArrowRight, Loader2, ArrowLeft, ArrowUpRight, 
  Edit, PlusCircle, Save, X 
} from "lucide-react";

export default function ForumManager({ darkMode = false }: { darkMode?: boolean }) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'reports' | 'threads'>('reports');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved' | 'reviewed'>('all');

  // Detail drawer / modal
  const [selectedThread, setSelectedThread] = useState<any | null>(null);
  const [threadComments, setThreadComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Editor mode state
  const [editorMode, setEditorMode] = useState(false);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [threadType, setThreadType] = useState("standard");
  const [difficulty, setDifficulty] = useState("medium");
  const [selSeg, setSelSeg] = useState("");
  const [selGrp, setSelGrp] = useState("");
  const [selSub, setSelSub] = useState("");
  const [linkedQuestionId, setLinkedQuestionId] = useState("");

  // Dropdown lists
  const [segmentsList, setSegmentsList] = useState<any[]>([]);
  const [groupsList, setGroupsList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [questionsList, setQuestionsList] = useState<any[]>([]);

  // Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forum_moderation_reports")
        .select(`
          *,
          reporter:reporter_id(full_name),
          thread:thread_id(id, title, content),
          comment:comment_id(id, content, thread_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err: any) {
      console.error("Error fetching moderation reports:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch threads
  const fetchThreads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forum_threads")
        .select(`
          *,
          author:profiles!forum_threads_author_id_fkey(id, full_name, gamification_rank),
          segment:segments(title),
          group:groups(title),
          subject:subjects(title),
          forum_comments(id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setThreads(data || []);
    } catch (err: any) {
      console.error("Error fetching forum threads:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch taxonomy and question bank for the editor
  const fetchEditorDropdowns = async () => {
    try {
      const [sRes, gRes, subRes, qRes] = await Promise.all([
        supabase.from("segments").select("id, title").order("id"),
        supabase.from("groups").select("id, title, segment_id").order("id"),
        supabase.from("subjects").select("id, title, group_id").order("id"),
        supabase.from("question_bank").select("id, question_text").order("created_at", { ascending: false })
      ]);

      if (sRes.data) setSegmentsList(sRes.data);
      if (gRes.data) setGroupsList(gRes.data);
      if (subRes.data) setSubjectsList(subRes.data);
      if (qRes.data) setQuestionsList(qRes.data);
    } catch (err: any) {
      console.error("Error fetching editor dropdown lists:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    } else {
      fetchThreads();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchEditorDropdowns();
  }, []);

  // Reset form
  const resetForm = () => {
    setTitle("");
    setContent("");
    setThreadType("standard");
    setDifficulty("medium");
    setSelSeg("");
    setSelGrp("");
    setSelSub("");
    setLinkedQuestionId("");
    setEditingThreadId(null);
  };

  // Save thread
  const handleSaveThread = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required.");
      return;
    }
    
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const payload: any = {
        title: title.trim(),
        content: content.trim(),
        thread_type: threadType,
        difficulty: difficulty || null,
        segment_id: selSeg ? Number(selSeg) : null,
        group_id: selGrp ? Number(selGrp) : null,
        subject_id: selSub ? Number(selSub) : null,
        updated_at: new Date().toISOString()
      };

      let threadId = editingThreadId;

      if (editingThreadId) {
        // Update
        const { error } = await supabase
          .from("forum_threads")
          .update(payload)
          .eq("id", editingThreadId);
        if (error) throw error;
      } else {
        // Insert
        payload.author_id = user.id;
        const { data, error } = await supabase
          .from("forum_threads")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        threadId = data.id;
      }

      // Handle linked question mapping if question_post
      if (threadType === "question_post" && linkedQuestionId) {
        // Delete any existing maps first to avoid UNIQUE conflict
        await supabase
          .from("forum_thread_questions")
          .delete()
          .eq("thread_id", threadId);

        // Insert mapping
        const { error: mapError } = await supabase
          .from("forum_thread_questions")
          .insert({
            thread_id: threadId,
            question_bank_id: linkedQuestionId,
            order_index: 0
          });
        if (mapError) throw mapError;
      } else {
        // Clear mapping if not question_post or no question selected
        await supabase
          .from("forum_thread_questions")
          .delete()
          .eq("thread_id", threadId);
      }

      alert("Saved Successfully!");
      setEditorMode(false);
      resetForm();
      fetchThreads();
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Edit Thread Trigger
  const handleEditThread = async (thread: any) => {
    setEditingThreadId(thread.id);
    setTitle(thread.title);
    setContent(thread.content);
    setThreadType(thread.thread_type);
    setDifficulty(thread.difficulty || "medium");
    setSelSeg(thread.segment_id ? String(thread.segment_id) : "");
    setSelGrp(thread.group_id ? String(thread.group_id) : "");
    setSelSub(thread.subject_id ? String(thread.subject_id) : "");
    
    // Prefill linked question mapping if type is question_post
    if (thread.thread_type === "question_post") {
      const { data: qData } = await supabase
        .from("forum_thread_questions")
        .select("question_bank_id")
        .eq("thread_id", thread.id)
        .limit(1);
      if (qData && qData.length > 0) {
        setLinkedQuestionId(qData[0].question_bank_id);
      } else {
        setLinkedQuestionId("");
      }
    } else {
      setLinkedQuestionId("");
    }
    
    setEditorMode(true);
  };

  // Actions for reports
  const updateReportStatus = async (reportId: string, status: 'reviewed' | 'resolved') => {
    try {
      const { error } = await supabase
        .from("forum_moderation_reports")
        .update({ status })
        .eq("id", reportId);

      if (error) throw error;
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Delete thread
  const deleteThread = async (threadId: string, associatedReportId?: string) => {
    if (!confirm("Are you sure you want to delete this thread? This will permanently delete all comments and attempts related to it.")) return;
    
    try {
      const { error } = await supabase
        .from("forum_threads")
        .delete()
        .eq("id", threadId);

      if (error) throw error;
      
      setThreads(prev => prev.filter(t => t.id !== threadId));
      
      if (associatedReportId) {
        setReports(prev => prev.filter(r => r.id !== associatedReportId));
      } else {
        fetchReports(); 
      }
      
      if (selectedThread?.id === threadId) {
        setSelectedThread(null);
      }
    } catch (err: any) {
      alert("Error deleting thread: " + err.message);
    }
  };

  // Delete comment
  const deleteComment = async (commentId: string, threadId: string, associatedReportId?: string) => {
    if (!confirm("Are you sure you want to delete this comment? Nested replies will also be removed.")) return;

    try {
      const { error } = await supabase
        .from("forum_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      setThreadComments(prev => prev.filter(c => c.id !== commentId));
      
      setThreads(prev => prev.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            forum_comments: (t.forum_comments || []).filter((c: any) => c.id !== commentId)
          };
        }
        return t;
      }));

      if (associatedReportId) {
        setReports(prev => prev.filter(r => r.id !== associatedReportId));
      }
    } catch (err: any) {
      alert("Error deleting comment: " + err.message);
    }
  };

  // Toggle thread pin
  const togglePin = async (threadId: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from("forum_threads")
        .update({ is_pinned: !currentPinned })
        .eq("id", threadId);

      if (error) throw error;

      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, is_pinned: !currentPinned } : t));
    } catch (err: any) {
      alert("Error updating thread pin status: " + err.message);
    }
  };

  // Open Thread Replies Drawer
  const openRepliesDrawer = async (thread: any) => {
    setSelectedThread(thread);
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("forum_comments")
        .select(`
          *,
          author:profiles!forum_comments_author_id_fkey(id, full_name, gamification_rank)
        `)
        .eq("thread_id", thread.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setThreadComments(data || []);
    } catch (err: any) {
      console.error("Error loading comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Filter lists based on hierarchy selection
  const filteredGroups = selSeg 
    ? groupsList.filter(g => g.segment_id === Number(selSeg))
    : [];

  const filteredSubjects = selGrp
    ? subjectsList.filter(s => s.group_id === Number(selGrp))
    : [];

  // Filtering reports
  const filteredReports = reports.filter(r => {
    if (reportFilter !== 'all' && r.status !== reportFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchReporter = r.reporter?.full_name?.toLowerCase().includes(query);
      const matchReason = r.reason?.toLowerCase().includes(query);
      const matchThread = r.thread?.title?.toLowerCase().includes(query);
      const matchComment = r.comment?.content?.toLowerCase().includes(query);
      return matchReporter || matchReason || matchThread || matchComment;
    }
    return true;
  });

  // Filtering threads
  const filteredThreads = threads.filter(t => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(query);
      const matchContent = t.content?.toLowerCase().includes(query);
      const matchAuthor = t.author?.full_name?.toLowerCase().includes(query);
      const matchSegment = t.segment?.title?.toLowerCase().includes(query);
      return matchTitle || matchContent || matchAuthor || matchSegment;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600"/> Forum Moderator
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">moderate flagged posts, manage student discussions, pin announcements, and edit threads.</p>
        </div>

        {/* Tab Switcher */}
        {!editorMode && (
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <button
              onClick={() => { setActiveTab('reports'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> flagged reports
            </button>
            <button
              onClick={() => { setActiveTab('threads'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'threads' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> discussions
            </button>
          </div>
        )}
      </div>

      {editorMode ? (
        /* CREATE / EDIT THREAD EDITOR */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 animate-in zoom-in-95 duration-200">
          
          <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              {editingThreadId ? "Edit Thread Details" : "Create New Forum Thread"}
            </h3>
            <button
              onClick={() => { setEditorMode(false); resetForm(); }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thread Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter discussion title..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100 text-sm font-semibold transition-all"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thread Type</label>
              <select 
                value={threadType}
                onChange={(e) => setThreadType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all"
              >
                <option value="standard">Standard Discussion</option>
                <option value="question_post">MCQ / Practice Question</option>
                <option value="study_strategy">Study Strategy</option>
                <option value="tutor_announcement">Tutor Announcement</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Difficulty Level</label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Segment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Curriculum Segment</label>
              <select 
                value={selSeg}
                onChange={(e) => { setSelSeg(e.target.value); setSelGrp(""); setSelSub(""); }}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all"
              >
                <option value="">None / General</option>
                {segmentsList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>

            {/* Group */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject Group</label>
              <select 
                value={selGrp}
                onChange={(e) => { setSelGrp(e.target.value); setSelSub(""); }}
                disabled={!selSeg}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all disabled:opacity-50"
              >
                <option value="">None / General</option>
                {filteredGroups.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</label>
              <select 
                value={selSub}
                onChange={(e) => setSelSub(e.target.value)}
                disabled={!selGrp}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all disabled:opacity-50"
              >
                <option value="">None / General</option>
                {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>

            {/* Conditional Question Bank Link */}
            {threadType === "question_post" && (
              <div className="space-y-2 animate-in slide-in-from-top duration-300">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Link Question from Bank</label>
                <select 
                  value={linkedQuestionId}
                  onChange={(e) => setLinkedQuestionId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all"
                >
                  <option value="">Select Question...</option>
                  {questionsList.map(q => {
                    const cleanQ = q.question_text?.replace(/<[^>]+>/g, '').substring(0, 80) + '...';
                    return <option key={q.id} value={q.id}>{cleanQ}</option>;
                  })}
                </select>
              </div>
            )}

            {/* Content Textarea */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Post Body / Content</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="Write discussion content or HTML..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 text-sm leading-relaxed font-semibold transition-all font-sans resize-y"
              />
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-150 dark:border-slate-800 pt-4">
            <button
              onClick={() => { setEditorMode(false); resetForm(); }}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveThread}
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all hover:bg-indigo-500 flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Thread
            </button>
          </div>

        </div>
      ) : (
        <>
          {/* FILTER & ADD BAR */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder={activeTab === 'reports' ? "search reports..." : "search discussions..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-250 transition-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
              {activeTab === 'reports' ? (
                <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                  {['all', 'pending', 'resolved', 'reviewed'].map((f: any) => (
                    <button
                      key={f}
                      onClick={() => setReportFilter(f)}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        reportFilter === f ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-855'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => { resetForm(); setEditorMode(true); }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  <PlusCircle className="w-4.5 h-4.5" /> Add New Thread
                </button>
              )}
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
            {loading ? (
              <div className="p-16 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
                <span>gathering records...</span>
              </div>
            ) : activeTab === 'reports' ? (
              /* REPORTS PANEL */
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredReports.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 dark:text-slate-500">
                    <CheckCircle2 className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                    <p className="font-semibold">no pending flagged reports found.</p>
                  </div>
                ) : (
                  filteredReports.map((report) => {
                    const isComment = !!report.comment_id;
                    const targetText = isComment ? report.comment?.content : report.thread?.content;
                    const cleanSnippet = targetText ? targetText.replace(/<[^>]+>/g, '').substring(0, 180) + '...' : '';

                    return (
                      <div key={report.id} className="p-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/20 flex flex-col lg:flex-row gap-6 justify-between items-start">
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                              report.status === 'pending' 
                                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                                : report.status === 'resolved'
                                  ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                  : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                            }`}>
                              {report.status}
                            </span>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                              isComment ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'
                            }`}>
                              {isComment ? 'flagged reply' : 'flagged discussion'}
                            </span>

                            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(report.created_at).toLocaleDateString()}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200">
                              {isComment ? 'Reply in: ' : ''}
                              <span className="text-slate-900 dark:text-white font-extrabold">
                                {report.thread?.title || 'deleted discussion'}
                              </span>
                            </h4>
                            
                            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 italic bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800/50">
                              "{cleanSnippet}"
                            </p>
                          </div>

                          <div className="text-xs space-y-1">
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Report Details</p>
                            <p className="text-rose-500 dark:text-rose-400 font-semibold bg-rose-500/5 px-2.5 py-1.5 rounded-lg border border-rose-500/10 w-fit">
                              Reason: {report.reason}
                            </p>
                            <p className="text-slate-500 mt-1">
                              Reporter: <span className="font-bold text-slate-700 dark:text-slate-350">{report.reporter?.full_name || 'Community Member'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex lg:flex-col gap-2 shrink-0">
                          {report.thread_id && (
                            <Link
                              href={`/forum/thread/${report.thread_id}`}
                              target="_blank"
                              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all"
                            >
                              view on board <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {report.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateReportStatus(report.id, 'reviewed')}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all"
                              >
                                dismiss report
                              </button>
                              
                              <button
                                onClick={() => {
                                  if (isComment) {
                                    deleteComment(report.comment_id, report.comment?.thread_id, report.id);
                                  } else {
                                    deleteThread(report.thread_id, report.id);
                                  }
                                }}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold border border-rose-200 dark:border-rose-900/30 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> delete offending {isComment ? 'reply' : 'discussion'}
                              </button>
                            </>
                          )}

                          {report.status !== 'resolved' && report.status !== 'pending' && (
                            <button
                              onClick={() => updateReportStatus(report.id, 'resolved')}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-600 hover:text-white text-green-600 dark:text-green-400 rounded-lg text-xs font-bold border border-green-500/20 transition-all"
                            >
                              resolve report
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* ALL THREADS PANEL */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs font-bold">
                    <tr>
                      <th className="px-6 py-4">discussion</th>
                      <th className="px-6 py-4">author</th>
                      <th className="px-6 py-4">category</th>
                      <th className="px-6 py-4 text-center">metrics</th>
                      <th className="px-6 py-4 text-center">pin</th>
                      <th className="px-6 py-4 text-right">actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {filteredThreads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-400 dark:text-slate-500">
                          no discussions found.
                        </td>
                      </tr>
                    ) : (
                      filteredThreads.map((thread) => {
                        const commentsCount = thread.forum_comments?.length || 0;
                        
                        return (
                          <tr key={thread.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors border-b border-slate-100 dark:border-slate-800">
                            
                            <td className="px-6 py-4 max-w-sm">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-2">
                                  {thread.thread_type.replace('_', ' ')}
                                </span>
                                {thread.difficulty && (
                                  <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase">
                                    {thread.difficulty}
                                  </span>
                                )}
                                <div className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug">
                                  {thread.title}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-xs">
                              <div className="font-bold text-slate-700 dark:text-slate-350">
                                {thread.author?.full_name || 'Community Member'}
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500">
                                Rank: {thread.author?.gamification_rank || 'scholar'}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {thread.segment?.title || 'general'}
                              {thread.group?.title && ` › ${thread.group.title}`}
                            </td>

                            <td className="px-6 py-4 text-xs text-center font-bold">
                              <div className="flex items-center justify-center gap-3.5 text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1" title="Upvotes">
                                  <ThumbsUp className="w-3.5 h-3.5" /> {thread.upvotes}
                                </span>
                                <span className="flex items-center gap-1" title="Replies">
                                  <MessageSquare className="w-3.5 h-3.5" /> {commentsCount}
                                </span>
                                <span className="flex items-center gap-1" title="Views">
                                  <Eye className="w-3.5 h-3.5" /> {thread.views}
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => togglePin(thread.id, thread.is_pinned)}
                                className={`p-2 rounded-xl transition-all ${
                                  thread.is_pinned 
                                    ? 'bg-indigo-500 text-white shadow-md' 
                                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                                title={thread.is_pinned ? "Unpin thread" : "Pin thread"}
                              >
                                <Pin className={`w-4 h-4 ${thread.is_pinned ? 'fill-current' : ''}`} />
                              </button>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1 flex-wrap">
                                <button
                                  onClick={() => handleEditThread(thread)}
                                  className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold border border-transparent transition-colors flex items-center gap-1"
                                >
                                  <Edit className="w-3 h-3" /> Edit
                                </button>
                                <button
                                  onClick={() => openRepliesDrawer(thread)}
                                  className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                                >
                                  replies
                                </button>
                                <button
                                  onClick={() => deleteThread(thread.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                                  title="Delete thread"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* SLIDE-OVER DRAWER MODAL FOR REPLIES MODERATION */}
      {selectedThread && (
        <div className="fixed inset-0 z-[2000] flex justify-end bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
          
          <div className="flex-1" onClick={() => setSelectedThread(null)} />

          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-350">
            
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedThread(null)}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-500"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">thread moderation</h3>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">replies & comments manager</p>
                </div>
              </div>
              
              <Link 
                href={`/forum/thread/${selectedThread.id}`}
                target="_blank"
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline"
              >
                open thread <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/10 border-b border-slate-200 dark:border-slate-800/50">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">{selectedThread.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: selectedThread.content }}></p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {loadingComments ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-500" />
                  <span>loading comments...</span>
                </div>
              ) : threadComments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <p>this thread has no comments yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {threadComments.map((comment) => (
                    <div 
                      key={comment.id}
                      className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-855 dark:text-slate-200 text-xs">
                            {comment.author?.full_name || 'Community Member'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-350 text-xs leading-relaxed break-words font-medium">
                          {comment.content}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteComment(comment.id, selectedThread.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors self-start"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedThread(null)}
                className="px-6 py-2.5 bg-slate-900 dark:bg-slate-855 text-white hover:bg-slate-855 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
