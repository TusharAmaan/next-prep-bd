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
import RichTextEditor from "@/components/admin/sections/RichTextEditor";
import MathRenderer from "@/components/shared/MathRenderer";

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
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [createdThreadId, setCreatedThreadId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [threadType, setThreadType] = useState("standard");
  const [difficulty, setDifficulty] = useState("medium");
  const [selSeg, setSelSeg] = useState("");
  const [selGrp, setSelGrp] = useState("");
  const [selSub, setSelSub] = useState("");
  const [linkedQuestionId, setLinkedQuestionId] = useState("");

  // New Form states for Tagging, SEO, and Multiple Linked Questions builder
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoTags, setSeoTags] = useState<string[]>([]);
  const [isSeoTitleEdited, setIsSeoTitleEdited] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState<any[]>([]);
  const [linkedQuestions, setLinkedQuestions] = useState<any[]>([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  // Link Question Modal Search / Filter states
  const [modalSearch, setModalSearch] = useState("");
  const [modalTypeFilter, setModalTypeFilter] = useState("all");
  const [modalDifficultyFilter, setModalDifficultyFilter] = useState("all");
  const [modalSegmentFilter, setModalSegmentFilter] = useState("all");
  const [modalGroupFilter, setModalGroupFilter] = useState("all");
  const [modalSubjectFilter, setModalSubjectFilter] = useState("all");

  const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const DS_OPTIONS = [
    "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
    "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
    "BOTH statements (1) and (2) TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
    "EACH statement ALONE is sufficient.",
    "Statements (1) and (2) TOGETHER are NOT sufficient."
  ];
  const isDataSufficiency = seoTags.some(tag => tag.toLowerCase() === 'data sufficiency');

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
        supabase.from("question_bank").select("id, question_text, question_type, difficulty, explanation, segment_id, group_id, subject_id").order("created_at", { ascending: false })
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

  const linkedQuestionsTypesKey = linkedQuestions.map(q => `${q.id}-${q.question_type}`).join(',');

  useEffect(() => {
    if (isDataSufficiency) {
      setLinkedQuestions(prev => {
        let changed = false;
        const updated = prev.map(q => {
          if (q.question_type?.toLowerCase() === 'mcq' || q.question_type === 'MCQ') {
            const currentOptions = q.options || [];
            const needsUpdate = currentOptions.length !== 5 || currentOptions.some((opt: any, idx: number) => opt.option_text !== DS_OPTIONS[idx]);
            if (needsUpdate) {
              changed = true;
              const newOptions = DS_OPTIONS.map((dsText, idx) => {
                const existing = currentOptions[idx];
                return {
                  id: existing?.id,
                  option_text: dsText,
                  is_correct: existing ? !!existing.is_correct : (idx === 0)
                };
              });
              return { ...q, options: newOptions };
            }
          }
          return q;
        });
        return changed ? updated : prev;
      });
    }
  }, [isDataSufficiency, seoTags, linkedQuestionsTypesKey]);

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
    setSeoTitle("");
    setSeoDescription("");
    setSeoTags([]);
    setIsSeoTitleEdited(false);
    setTagInput("");
    setTagSuggestions([]);
    setLinkedQuestions([]);
    setEditingThreadId(null);
    setModalSearch("");
    setModalTypeFilter("all");
    setModalDifficultyFilter("all");
    setModalSegmentFilter("all");
    setModalGroupFilter("all");
    setModalSubjectFilter("all");
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
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        seo_tags: seoTags,
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

      // Handle linked tags mapping
      if (seoTags && seoTags.length > 0) {
        const tagIds: number[] = [];
        for (const tName of seoTags) {
          const { data: existingTag } = await supabase
            .from("forum_tags")
            .select("id")
            .eq("name", tName.trim())
            .maybeSingle();
            
          if (existingTag) {
            tagIds.push(existingTag.id);
          } else {
            const { data: newTag, error: tagErr } = await supabase
              .from("forum_tags")
              .insert({ name: tName.trim() })
              .select("id")
              .single();
            if (!tagErr && newTag) {
              tagIds.push(newTag.id);
            }
          }
        }
        
        await supabase
          .from("forum_thread_tags")
          .delete()
          .eq("thread_id", threadId);
          
        if (tagIds.length > 0) {
          const tagMappings = tagIds.map(tid => ({
            thread_id: threadId,
            tag_id: tid
          }));
          await supabase
            .from("forum_thread_tags")
            .insert(tagMappings);
        }
      } else {
        await supabase
          .from("forum_thread_tags")
          .delete()
          .eq("thread_id", threadId);
      }

      // Handle multiple linked questions mapping (via builder list)
      if ((threadType === "question_post" || threadType === "reading_comprehension") && linkedQuestions.length > 0) {
        
        const finalQuestionIds: string[] = [];

        for (const q of linkedQuestions) {
          const isInline = String(q.id).startsWith("inline-");
          
          if (isInline) {
            // Save inline question to bank
            const { data: newQ, error: qErr } = await supabase
              .from("question_bank")
              .insert({
                question_text: q.question_text,
                question_type: q.question_type,
                explanation: q.explanation || null,
                difficulty: difficulty || 'medium',
                segment_id: selSeg ? Number(selSeg) : null,
                group_id: selGrp ? Number(selGrp) : null,
                subject_id: selSub ? Number(selSub) : null
              })
              .select("id")
              .single();
              
            if (qErr) throw qErr;

            // Save MCQ options if applicable
            if (q.question_type === "mcq" && q.options && q.options.length > 0) {
              const optPayloads = q.options.map((opt: any, index: number) => ({
                question_id: newQ.id,
                option_text: opt.option_text,
                is_correct: !!opt.is_correct,
                order_index: index
              }));
              const { error: optErr } = await supabase
                .from("question_options")
                .insert(optPayloads);
              if (optErr) throw optErr;
            }
            finalQuestionIds.push(newQ.id);
          } else {
            // Existing question from bank: update it if edited
            await supabase
              .from("question_bank")
              .update({
                question_text: q.question_text,
                explanation: q.explanation || null
              })
              .eq("id", q.id);

            // Re-insert option correctness if MCQ
            if (q.question_type === "mcq" && q.options) {
              for (const opt of q.options) {
                if (opt.id) {
                  await supabase
                    .from("question_options")
                    .update({
                      option_text: opt.option_text,
                      is_correct: !!opt.is_correct
                    })
                    .eq("id", opt.id);
                }
              }
            }
            finalQuestionIds.push(q.id);
          }
        }

        // Delete any existing mappings
        await supabase
          .from("forum_thread_questions")
          .delete()
          .eq("thread_id", threadId);

        // Insert new mappings
        const mappings = finalQuestionIds.map((qid, index) => ({
          thread_id: threadId,
          question_bank_id: qid,
          order_index: index
        }));
        
        const { error: mapError } = await supabase
          .from("forum_thread_questions")
          .insert(mappings);
        if (mapError) throw mapError;

      } else {
        // Clear mapping if not question/passage type
        await supabase
          .from("forum_thread_questions")
          .delete()
          .eq("thread_id", threadId);
      }

      setCreatedThreadId(threadId);
      setShowSuccessToast(true);
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
    setSeoTitle(thread.seo_title || "");
    setSeoDescription(thread.seo_description || "");
    setSeoTags(thread.seo_tags || []);
    setIsSeoTitleEdited(!!thread.seo_title);
    
    // Fetch linked questions mappings for both MCQ and Reading Comprehension
    try {
      const { data: qData } = await supabase
        .from("forum_thread_questions")
        .select("question_bank_id")
        .eq("thread_id", thread.id)
        .order("order_index", { ascending: true });
        
      if (qData && qData.length > 0) {
        const qIds = qData.map((q: any) => q.question_bank_id);
        const { data: questions } = await supabase
          .from("question_bank")
          .select("id, question_text, explanation, question_type")
          .in("id", qIds);
          
        const { data: allOptions } = await supabase
          .from("question_options")
          .select("id, question_id, option_text, is_correct")
          .in("question_id", qIds)
          .order("order_index", { ascending: true });
        
        if (questions) {
          const merged = questions.map((q: any) => {
            const options = allOptions ? allOptions.filter((opt: any) => opt.question_id === q.id) : [];
            return {
              id: q.id,
              question_text: q.question_text,
              explanation: q.explanation,
              question_type: q.question_type,
              options: options.map(o => ({ id: o.id, option_text: o.option_text, is_correct: o.is_correct }))
            };
          });
          const sorted = qIds.map(qid => merged.find(m => m.id === qid)).filter(Boolean);
          setLinkedQuestions(sorted);
        }
      } else {
        setLinkedQuestions([]);
      }
    } catch (err) {
      console.error("Error loading linked questions for edit:", err);
      setLinkedQuestions([]);
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

  // Filter questions for the search popup modal
  const filteredModalQuestions = questionsList.filter((q: any) => {
    if (modalTypeFilter !== 'all' && q.question_type?.toLowerCase() !== modalTypeFilter.toLowerCase()) return false;
    if (modalDifficultyFilter !== 'all' && q.difficulty?.toLowerCase() !== modalDifficultyFilter.toLowerCase()) return false;
    if (modalSegmentFilter !== 'all' && q.segment_id !== Number(modalSegmentFilter)) return false;
    if (modalGroupFilter !== 'all' && q.group_id !== Number(modalGroupFilter)) return false;
    if (modalSubjectFilter !== 'all' && q.subject_id !== Number(modalSubjectFilter)) return false;
    if (modalSearch.trim()) {
      return q.question_text?.toLowerCase().includes(modalSearch.toLowerCase());
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
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Moderate Flagged Posts, Manage Student Discussions, Pin Announcements, and Edit Threads.</p>
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
              <AlertTriangle className="w-4 h-4" /> Flagged Reports
            </button>
            <button
              onClick={() => { setActiveTab('threads'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'threads' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Discussions
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
                onChange={(e) => {
                  const val = e.target.value;
                  setTitle(val);
                  if (!isSeoTitleEdited) {
                    setSeoTitle(val);
                  }
                }}
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
                <option value="reading_comprehension">Reading Comprehension</option>
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

            {/* Topic tag system (YouTube Video Tag Style suggestions) */}
            <div className="md:col-span-2 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Topic Tags (Press Enter or comma to add)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {seoTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-800">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setSeoTags(prev => prev.filter(t => t !== tag))}
                      className="text-indigo-400 hover:text-indigo-650 focus:outline-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={tagInput}
                  onChange={async (e) => {
                    const prefix = e.target.value;
                    setTagInput(prefix);
                    if (prefix.trim().length > 0) {
                      const { data } = await supabase
                        .from('forum_tags')
                        .select('name')
                        .ilike('name', `%${prefix}%`)
                        .limit(5);
                      setTagSuggestions(data || []);
                    } else {
                      setTagSuggestions([]);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const cleanTag = tagInput.trim();
                      if (cleanTag && !seoTags.includes(cleanTag)) {
                        setSeoTags(prev => [...prev, cleanTag]);
                        setTagInput("");
                        setTagSuggestions([]);
                      }
                    }
                  }}
                  placeholder="Type topic tag (e.g. Data Sufficiency) and press Enter..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100 text-sm font-semibold transition-all"
                />
                
                {tagSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-[200] max-h-40 overflow-y-auto">
                    {tagSuggestions.map(sugg => (
                      <button
                        key={sugg.name}
                        type="button"
                        onClick={() => {
                          if (!seoTags.includes(sugg.name)) {
                            setSeoTags(prev => [...prev, sugg.name]);
                          }
                          setTagInput("");
                          setTagSuggestions([]);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-855 transition-colors"
                      >
                        {sugg.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Question Builder & Question Bank Popup Link */}


            {/* SEO / Metadata Section */}
            <div className="md:col-span-2 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Metadata & SEO Settings</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Meta Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => {
                      setSeoTitle(e.target.value);
                      setIsSeoTitleEdited(true);
                    }}
                    placeholder="Enter Meta Title..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-855 dark:text-slate-100 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Meta Keywords (Comma separated)</label>
                  <input
                    type="text"
                    value={seoTags.join(", ")}
                    onChange={(e) => {
                      const tagsArray = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                      setSeoTags(tagsArray);
                    }}
                    placeholder="tag1, tag2, tag3"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-855 dark:text-slate-100 text-xs font-semibold"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Meta Description</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Enter Meta Description..."
                    rows={2}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-855 dark:text-slate-100 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Post Body / Content</label>
              <RichTextEditor content={content} onChange={setContent} darkMode={darkMode} />
            </div>

            {/* Dynamic Question Builder & Question Bank Popup Link */}
            {(threadType === 'question_post' || threadType === 'reading_comprehension') && (
              <div className="md:col-span-2 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Linked Questions</label>
                  {(threadType !== 'question_post' || linkedQuestions.length === 0) && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowQuestionModal(true)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition-all"
                      >
                        Link Question from Bank
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newQ = {
                            id: `inline-${Date.now()}-${Math.random()}`,
                            question_text: threadType === 'question_post' ? title : "New practice question text...",
                            question_type: "mcq",
                            explanation: "",
                            options: isDataSufficiency
                              ? DS_OPTIONS.map((dsText, dsIdx) => ({
                                  option_text: dsText,
                                  is_correct: dsIdx === 0
                                }))
                              : [
                                  { option_text: "Option A text", is_correct: true },
                                  { option_text: "Option B text", is_correct: false },
                                  { option_text: "Option C text", is_correct: false },
                                  { option_text: "Option D text", is_correct: false },
                                  { option_text: "Option E text", is_correct: false }
                                ]
                          };
                          setLinkedQuestions(prev => [...prev, newQ]);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100/60 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-all"
                      >
                        Create Question Inline
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {linkedQuestions.map((q, idx) => (
                    <div key={q.id} className="p-5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl space-y-4 text-left relative">
                      <button
                        type="button"
                        onClick={() => setLinkedQuestions(prev => prev.filter(l => l.id !== q.id))}
                        className="absolute top-4 right-4 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-650"
                        title="Remove question"
                      >
                        <Trash2 className="w-4.5 h-4.5 text-rose-500" />
                      </button>

                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-slate-700 dark:text-slate-300 text-xs">Question {idx + 1}</span>
                        <select
                          value={q.question_type}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLinkedQuestions(prev => prev.map(l => l.id === q.id ? { ...l, question_type: val } : l));
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-lg"
                        >
                          <option value="mcq">MCQ Choice Question</option>
                          <option value="descriptive">Descriptive Question</option>
                        </select>
                      </div>

                      {/* Hide question content and explanation if it is a single question_post thread type */}
                      {threadType !== 'question_post' && (
                        <>
                          {/* Question Text */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-450 uppercase">Question Content</label>
                            <textarea
                              value={q.question_text}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLinkedQuestions(prev => prev.map(l => l.id === q.id ? { ...l, question_text: val } : l));
                              }}
                              className="w-full p-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-250 font-semibold"
                              rows={2}
                            />
                          </div>

                          {/* Explanation */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-450 uppercase">Explanation / Reference</label>
                            <textarea
                              value={q.explanation || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLinkedQuestions(prev => prev.map(l => l.id === q.id ? { ...l, explanation: val } : l));
                              }}
                              className="w-full p-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-250 font-semibold"
                              rows={2}
                              placeholder="Provide explanation details here..."
                            />
                          </div>
                        </>
                      )}

                      {/* Options (MCQ only) */}
                      {(q.question_type?.toLowerCase() === "mcq" || q.question_type === "MCQ") && (
                        <div className="space-y-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
                            {isDataSufficiency ? "Data Sufficiency Choices (Select correct option)" : "Choices (Check correct one)"}
                          </label>
                          {q.options?.map((opt: any, optIdx: number) => (
                            <div key={optIdx} className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={!!opt.is_correct}
                                onChange={() => {
                                  const updatedOpts = q.options.map((o: any, oi: number) => ({
                                    ...o,
                                    is_correct: oi === optIdx
                                  }));
                                  setLinkedQuestions(prev => prev.map(l => l.id === q.id ? { ...l, options: updatedOpts } : l));
                                }}
                                className="w-4 h-4 text-indigo-650 shrink-0"
                              />
                              {isDataSufficiency ? (
                                <div className="flex-1 p-2.5 text-xs bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-700 dark:text-slate-350 font-semibold shadow-sm">
                                  <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">{OPTION_LETTERS[optIdx]}:</span>
                                  {opt.option_text}
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  value={opt.option_text}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updatedOpts = q.options.map((o: any, oi: number) => 
                                      oi === optIdx ? { ...o, option_text: val } : o
                                    );
                                    setLinkedQuestions(prev => prev.map(l => l.id === q.id ? { ...l, options: updatedOpts } : l));
                                  }}
                                  placeholder={`Option ${OPTION_LETTERS[optIdx]}`}
                                  className="flex-1 p-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-lg outline-none focus:border-indigo-500"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {linkedQuestions.length === 0 && (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 font-semibold">
                      No questions linked yet. Click above to select from bank or write new ones.
                    </div>
                  )}
                </div>
              </div>
            )}

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
                placeholder={activeTab === 'reports' ? "Search Reports..." : "Search Discussions..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-250 transition-all"
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
                      {f.charAt(0).toUpperCase() + f.slice(1)}
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
                <span>Gathering Records...</span>
              </div>
            ) : activeTab === 'reports' ? (
              /* REPORTS PANEL */
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredReports.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 dark:text-slate-500">
                    <CheckCircle2 className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                    <p className="font-semibold">No Pending Flagged Reports Found.</p>
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
                              {isComment ? 'Flagged Reply' : 'Flagged Discussion'}
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
                                {report.thread?.title || 'Deleted Discussion'}
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
                              View on Board <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {report.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateReportStatus(report.id, 'reviewed')}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all"
                              >
                                Dismiss Report
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
                                <Trash2 className="w-3.5 h-3.5" /> Delete Offending {isComment ? 'Reply' : 'Discussion'}
                              </button>
                            </>
                          )}

                          {report.status !== 'resolved' && report.status !== 'pending' && (
                            <button
                              onClick={() => updateReportStatus(report.id, 'resolved')}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-600 hover:text-white text-green-600 dark:text-green-400 rounded-lg text-xs font-bold border border-green-500/20 transition-all"
                            >
                              Resolve Report
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
                      <th className="px-6 py-4">Discussion</th>
                      <th className="px-6 py-4">Author</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-center">Metrics</th>
                      <th className="px-6 py-4 text-center">Pin</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {filteredThreads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-400 dark:text-slate-500">
                          No Discussions Found.
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
                                  Replies
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
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Thread Moderation</h3>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Replies & Comments Manager</p>
                </div>
              </div>
              
              <Link 
                href={`/forum/thread/${selectedThread.id}`}
                target="_blank"
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline"
              >
                Open Thread <ArrowUpRight className="w-3.5 h-3.5" />
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
                  <span>Loading Comments...</span>
                </div>
              ) : threadComments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <p>This Thread Has No Comments Yet.</p>
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

      {/* Success Modal Toast Popup */}
      {showSuccessToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1C1F26] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-sm w-full text-center space-y-5 animate-scale-up">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
              ✓
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Saved Successfully!
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                The forum discussion thread has been successfully published/updated on the discussion board.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              {createdThreadId && (
                <Link
                  href={`/forum/thread/${createdThreadId}`}
                  target="_blank"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
                >
                  View Discussion on Board <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
              <button
                onClick={() => {
                  setShowSuccessToast(false);
                  setCreatedThreadId(null);
                }}
                className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LINK QUESTION FROM BANK MODAL */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1C1F26] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-4xl w-full flex flex-col max-h-[85vh] animate-scale-up text-left">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Link Question from Bank
              </h3>
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search question bank..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-855 dark:text-slate-100 font-semibold"
                />
              </div>
              <select
                value={modalTypeFilter}
                onChange={(e) => setModalTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <option value="all">All Types</option>
                <option value="mcq">MCQ Choice Question</option>
                <option value="descriptive">Descriptive Question</option>
              </select>
              <select
                value={modalDifficultyFilter}
                onChange={(e) => setModalDifficultyFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            {/* Question List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredModalQuestions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
                  No matching questions found in the bank.
                </div>
              ) : (
                filteredModalQuestions.map((q: any) => {
                  const cleanText = q.question_text?.replace(/<[^>]+>/g, '').substring(0, 220) + '...';
                  const isLinked = linkedQuestions.some(l => l.id === q.id);
                  
                  return (
                    <div 
                      key={q.id}
                      className="p-4 bg-slate-50 dark:bg-slate-800/35 rounded-2xl border border-slate-150/50 dark:border-slate-800/80 flex justify-between gap-4 items-center hover:border-indigo-500/30 transition-all"
                    >
                      <div className="space-y-1 text-left flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded uppercase">
                            {q.question_type}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 rounded uppercase">
                            {q.difficulty || 'medium'}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-250 text-xs leading-relaxed font-semibold line-clamp-2">
                          {cleanText}
                        </p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={async () => {
                          if (isLinked) {
                            setLinkedQuestions(prev => prev.filter(l => l.id !== q.id));
                          } else {
                            // Fetch options if MCQ to prefill builder
                            let qOptions: any[] = [];
                            if (q.question_type?.toLowerCase() === 'mcq') {
                              const { data: optData } = await supabase
                                .from("question_options")
                                .select("id, option_text, is_correct")
                                .eq("question_id", q.id)
                                .order("order_index", { ascending: true });
                              if (optData) qOptions = optData;
                            }
                            setLinkedQuestions(prev => [...prev, { ...q, options: qOptions }]);

                            // Auto-populate post body content with the GMAT question text
                            if (threadType === 'question_post') {
                              setContent(q.question_text || "");
                              if (!title.trim()) {
                                const cleanTitle = (q.question_text || "").replace(/<[^>]+>/g, '').substring(0, 100);
                                setTitle(cleanTitle);
                              }
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isLinked 
                            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm' 
                            : 'bg-indigo-650 hover:bg-indigo-700 text-white shadow-sm'
                        }`}
                      >
                        {isLinked ? 'Unlink' : 'Link Question'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="border-t border-slate-150 dark:border-slate-800 pt-4 mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-850 rounded-xl text-xs font-bold transition-all"
              >
                Close Question Bank
              </button>
            </div>
          </div>
        </div>
      )}

      <MathRenderer />
    </div>
  );
}
