'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit, 
  ChevronRight, 
  ChevronDown, 
  Save, 
  X, 
  Book,
  FileText,
  Link as LinkIcon,
  HelpCircle,
  Copy,
  Globe,
  Download,
  GraduationCap,
  Check,
  Eye,
  Sparkles,
  Layers,
  Search,
  Filter
} from "lucide-react";
import RichTextEditor from "@/components/shared/RichTextEditor";
import RichTextDisplay from "@/components/shared/RichTextDisplay";
import { toast } from "sonner";

interface LessonPlanManagerProps {
  subjects: any[];
  darkMode?: boolean;
}

interface ContentEditModalProps {
  isOpen: boolean;
  editingContent: any;
  parentLesson: any;
  onClose: () => void;
  onSave: (data: { title: string; type: string; order_index: number; content_body: string }) => void;
}

// Dedicated Isolated Content Modal component so inner editor changes never re-render or close parent modal
function ContentEditModal({ isOpen, editingContent, parentLesson, onClose, onSave }: ContentEditModalProps) {
  const [title, setTitle] = useState(editingContent?.title || '');
  const [type, setType] = useState(editingContent?.type || 'passage');
  const [orderIndex, setOrderIndex] = useState<number>(editingContent?.order_index || 0);
  const [body, setBody] = useState<string>(editingContent?.content_body || '');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    setTitle(editingContent?.title || '');
    setType(editingContent?.type || 'passage');
    setOrderIndex(editingContent?.order_index || 0);
    setBody(editingContent?.content_body || '');
  }, [editingContent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      type,
      order_index: Number(orderIndex),
      content_body: body
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Lesson: {parentLesson?.title || 'Current Lesson'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {editingContent ? 'Edit Content Component' : 'Create New Content Component'}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Switcher */}
            <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'editor' 
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Edit className="w-3.5 h-3.5" /> Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview' 
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Student View
              </button>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            
            {/* Meta Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Component Title</label>
                <input 
                  type="text"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Reading Passage 1: The Tiny Ant"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                  required 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Component Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="passage">Passage / Content</option>
                  <option value="exercise">Exercise / Question</option>
                  <option value="link">Resource Link</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Order Index</label>
                <input 
                  type="number"
                  value={orderIndex} 
                  onChange={(e) => setOrderIndex(parseInt(e.target.value || '0'))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                  required 
                />
              </div>
            </div>

            {/* Tab View: Editor vs Student Live Preview */}
            {activeTab === 'editor' ? (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Content Body (Rich Editor)</label>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <RichTextEditor 
                    initialValue={body} 
                    onChange={setBody} 
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Student Live Rendering (MathJax + Google Fonts)</label>
                <div className="p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner min-h-[450px]">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">{title || 'Untitled Component'}</h2>
                  <RichTextDisplay content={body} />
                </div>
              </div>
            )}

          </div>

          {/* Footer Bar */}
          <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
            <span className="text-xs text-slate-400 font-medium">All content and formatting stay safely open inside popup</span>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Component
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

export default function LessonPlanManager({ subjects: initialSubjects, darkMode = false }: LessonPlanManagerProps) {
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  
  // Hierarchy State
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isHierarchyLoading, setIsHierarchyLoading] = useState(false);

  const [units, setUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initial Fetch Segments
  useEffect(() => {
    const fetchSegments = async () => {
      setIsHierarchyLoading(true);
      const { data } = await supabase.from('segments').select('*').order('id');
      setSegments(data || []);
      setIsHierarchyLoading(false);
    };
    fetchSegments();
  }, []);

  // Fetch Groups when Segment changes
  useEffect(() => {
    if (!selectedSegmentId) {
      setGroups([]);
      setSubjects([]);
      return;
    }
    const fetchGroups = async () => {
      setIsHierarchyLoading(true);
      const { data } = await supabase.from('groups').select('*').eq('segment_id', selectedSegmentId).order('id');
      setGroups(data || []);
      setIsHierarchyLoading(false);
    };
    fetchGroups();
  }, [selectedSegmentId]);

  // Fetch Subjects when Group changes
  useEffect(() => {
    if (!selectedGroupId) {
      setSubjects([]);
      return;
    }
    const fetchSubjects = async () => {
      setIsHierarchyLoading(true);
      const { data } = await supabase.from('subjects').select('*').eq('group_id', selectedGroupId).order('id');
      setSubjects(data || []);
      setIsHierarchyLoading(false);
    };
    fetchSubjects();
  }, [selectedGroupId]);

  // Modal states
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  
  // Selection for operations
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [parentUnit, setParentUnit] = useState<any>(null);
  const [parentLesson, setParentLesson] = useState<any>(null);
  
  // Tree expanded state
  const [expandedUnits, setExpandedUnits] = useState<Record<number, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<number, boolean>>({});

  // Related Books Modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const [isBooksLoading, setIsBooksLoading] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);

  // Related Courses Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [linkedCourses, setLinkedCourses] = useState<any[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);

  // Version filter ('bn' or 'en')
  const [versionFilter, setVersionFilter] = useState<'en' | 'bn'>('bn');

  // Clone Modal
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState('');
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [cloneSourceUnits, setCloneSourceUnits] = useState<any[]>([]);
  const [selectedUnitsToClone, setSelectedUnitsToClone] = useState<Record<number, boolean>>({});
  const [isCloneFetching, setIsCloneFetching] = useState(false);

  useEffect(() => {
    if (isCloneModalOpen) {
      const fetchAll = async () => {
        const { data } = await supabase.from('subjects').select('id, title, groups(title, segments(title))').order('id');
        setAllSubjects(data || []);
      };
      fetchAll();
    } else {
      setCloneSourceId('');
      setCloneSourceUnits([]);
      setSelectedUnitsToClone({});
    }
  }, [isCloneModalOpen]);

  useEffect(() => {
    if (!cloneSourceId) {
      setCloneSourceUnits([]);
      setSelectedUnitsToClone({});
      return;
    }

    const fetchSourceUnits = async () => {
      setIsCloneFetching(true);
      const { data } = await supabase
        .from('lesson_plan_units')
        .select(`
          *,
          lesson_plan_lessons (*)
        `)
        .eq('subject_id', cloneSourceId)
        .eq('version', versionFilter)
        .order('order_index');
      
      setCloneSourceUnits(data || []);
      
      const initialSelection: Record<number, boolean> = {};
      (data || []).forEach((u: any) => {
        initialSelection[u.id] = true;
      });
      setSelectedUnitsToClone(initialSelection);
      setIsCloneFetching(false);
    };

    fetchSourceUnits();
  }, [cloneSourceId, versionFilter]);

  const fetchHierarchy = useCallback(async () => {
    if (!selectedSubject) return;
    setIsLoading(true);
    try {
      const { data: unitsData } = await supabase
        .from('lesson_plan_units')
        .select(`
          *,
          lesson_plan_lessons (
            *,
            lesson_plan_contents (*)
          )
        `)
        .eq('subject_id', selectedSubject.id)
        .eq('version', versionFilter)
        .order('order_index');
      
      setUnits(unitsData || []);
    } catch (error) {
      console.error("Error fetching lesson plan:", error);
      toast.error("Failed to load lesson plan");
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubject, versionFilter]);

  useEffect(() => {
    if (selectedSubject) {
      fetchHierarchy();
    }
  }, [selectedSubject, versionFilter, fetchHierarchy]);

  const toggleUnit = (id: number) => {
    setExpandedUnits(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLesson = (id: number) => {
    setExpandedLessons(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Handlers for Units ---
  const handleSaveUnit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const orderIndex = parseInt(formData.get('order_index') as string || '0');

    try {
      if (editingUnit) {
        const { error } = await supabase
          .from('lesson_plan_units')
          .update({ title, order_index: orderIndex })
          .eq('id', editingUnit.id);
        if (error) throw error;
        toast.success("Unit updated");
      } else {
        const { error } = await supabase
          .from('lesson_plan_units')
          .insert([{ title, order_index: orderIndex, subject_id: selectedSubject.id, version: versionFilter }]);
        if (error) throw error;
        toast.success("Unit created");
      }
      setIsUnitModalOpen(false);
      fetchHierarchy();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDeleteUnit = async (id: number) => {
    if (!confirm("Delete this unit and all its lessons?")) return;
    const { error } = await supabase.from('lesson_plan_units').delete().eq('id', id);
    if (!error) {
      toast.success("Unit deleted");
      fetchHierarchy();
    }
  };

  const handleDuplicateUnitToOtherVersion = async (unit: any) => {
    const targetVersion = unit.version === 'bn' ? 'en' : 'bn';
    if (!confirm(`Duplicate this unit and all its contents to the ${targetVersion.toUpperCase()} version?`)) return;
    setIsLoading(true);
    try {
       const { data: newUnit, error: ue } = await supabase.from('lesson_plan_units').insert([{
         subject_id: unit.subject_id,
         title: unit.title,
         order_index: unit.order_index,
         version: targetVersion
       }]).select().single();
       if (ue) throw ue;

       for (const lesson of unit.lesson_plan_lessons || []) {
          const { data: newLesson, error: le } = await supabase.from('lesson_plan_lessons').insert([{
             unit_id: newUnit.id,
             title: lesson.title,
             order_index: lesson.order_index,
             version: targetVersion
          }]).select().single();
          if (le) throw le;

          const contentsToInsert = (lesson.lesson_plan_contents || []).map((c: any) => ({
             lesson_id: newLesson.id,
             title: c.title,
             type: c.type,
             content_body: c.content_body,
             order_index: c.order_index,
             version: targetVersion
          }));

          if (contentsToInsert.length > 0) {
             const { error: ce } = await supabase.from('lesson_plan_contents').insert(contentsToInsert);
             if (ce) throw ce;
          }
       }
       toast.success(`Unit duplicated to ${targetVersion.toUpperCase()} successfully!`);
    } catch (e) {
       console.error(e);
       toast.error("Error duplicating unit");
    } finally {
       setIsLoading(false);
    }
  };

  const handleCloneStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneSourceId) return;
    
    const unitsToClone = cloneSourceUnits.filter(u => selectedUnitsToClone[u.id]);
    if (unitsToClone.length === 0) {
      toast.error("Please select at least one unit to clone.");
      return;
    }

    setIsLoading(true);
    setIsCloneModalOpen(false);
    try {
      for (const su of unitsToClone) {
         const { data: newUnit, error: ue } = await supabase.from('lesson_plan_units').insert([{
            subject_id: selectedSubject.id,
            title: su.title,
            order_index: su.order_index,
            version: versionFilter
         }]).select().single();
         if (ue) throw ue;

         const lessonsToInsert = (su.lesson_plan_lessons || []).map((sl: any) => ({
            unit_id: newUnit.id,
            title: sl.title,
            order_index: sl.order_index,
            version: versionFilter
         }));

         if (lessonsToInsert.length > 0) {
            const { error: le } = await supabase.from('lesson_plan_lessons').insert(lessonsToInsert);
            if (le) throw le;
         }
      }
      toast.success("Selected structure cloned successfully!");
      fetchHierarchy();
    } catch(e) {
      console.error(e);
      toast.error("Error cloning structure");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers for Lessons ---
  const handleSaveLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const orderIndex = parseInt(formData.get('order_index') as string || '0');

    try {
      if (editingLesson) {
        const { error } = await supabase
          .from('lesson_plan_lessons')
          .update({ title, order_index: orderIndex })
          .eq('id', editingLesson.id);
        if (error) throw error;
        toast.success("Lesson updated");
      } else {
        const { error } = await supabase
          .from('lesson_plan_lessons')
          .insert([{ title, order_index: orderIndex, unit_id: parentUnit.id, version: versionFilter }]);
        if (error) throw error;
        toast.success("Lesson created");
      }
      setIsLessonModalOpen(false);
      fetchHierarchy();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!confirm("Delete this lesson and its content?")) return;
    const { error } = await supabase.from('lesson_plan_lessons').delete().eq('id', id);
    if (!error) {
      toast.success("Lesson deleted");
      fetchHierarchy();
    }
  };

  // --- Handlers for Content ---
  const handleSaveContentModal = async (data: { title: string; type: string; order_index: number; content_body: string }) => {
    try {
      if (editingContent) {
        const { error } = await supabase
          .from('lesson_plan_contents')
          .update({ title: data.title, type: data.type, content_body: data.content_body, order_index: data.order_index })
          .eq('id', editingContent.id);
        if (error) throw error;
        toast.success("Content updated");
      } else {
        const { error } = await supabase
          .from('lesson_plan_contents')
          .insert([{ 
            title: data.title, 
            type: data.type, 
            content_body: data.content_body, 
            order_index: data.order_index, 
            lesson_id: parentLesson.id, 
            version: versionFilter 
          }]);
        if (error) throw error;
        toast.success("Content added");
      }
      setIsContentModalOpen(false);
      fetchHierarchy();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDeleteContent = async (id: number) => {
    if (!confirm("Delete this content item?")) return;
    const { error } = await supabase.from('lesson_plan_contents').delete().eq('id', id);
    if (!error) {
      toast.success("Content deleted");
      fetchHierarchy();
    }
  };

  // --- Handlers for Books ---
  const fetchBooks = useCallback(async () => {
    if (!selectedSubject) return;
    setIsBooksLoading(true);
    const { data } = await supabase
      .from('lesson_plan_subject_books')
      .select('*')
      .eq('subject_id', selectedSubject.id)
      .order('order_index');
    setBooks(data || []);
    setIsBooksLoading(false);
  }, [selectedSubject]);

  useEffect(() => {
    if (isBookModalOpen) {
      fetchBooks();
    }
  }, [isBookModalOpen, fetchBooks]);

  const handleSaveBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const url = formData.get('url') as string;
    const orderIndex = parseInt(formData.get('order_index') as string || '0');

    try {
      if (editingBook) {
        const { error } = await supabase
          .from('lesson_plan_subject_books')
          .update({ title, subtitle, url, order_index: orderIndex })
          .eq('id', editingBook.id);
        if (error) throw error;
        toast.success("Book updated");
      } else {
        const { error } = await supabase
          .from('lesson_plan_subject_books')
          .insert([{ subject_id: selectedSubject.id, title, subtitle, url, order_index: orderIndex }]);
        if (error) throw error;
        toast.success("Book added");
      }
      setEditingBook(null);
      fetchBooks();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (!confirm("Delete this book?")) return;
    const { error } = await supabase.from('lesson_plan_subject_books').delete().eq('id', id);
    if (!error) {
      toast.success("Book deleted");
      fetchBooks();
    }
  };

  // --- Handlers for Courses ---
  const fetchLinkedCourses = useCallback(async () => {
    if (!selectedSubject) return;
    setIsCoursesLoading(true);
    const { data } = await supabase
      .from('lesson_plan_subject_courses')
      .select(`
        id,
        order_index,
        courses (
          id,
          title,
          instructor_name,
          thumbnail_url
        )
      `)
      .eq('subject_id', selectedSubject.id)
      .order('order_index');
    setLinkedCourses(data || []);
    setIsCoursesLoading(false);
  }, [selectedSubject]);

  const fetchAvailableCourses = async () => {
    const { data } = await supabase.from('courses').select('id, title, instructor_name').eq('is_published', true);
    setAvailableCourses(data || []);
  };

  useEffect(() => {
    if (isCourseModalOpen) {
      fetchLinkedCourses();
      fetchAvailableCourses();
    }
  }, [isCourseModalOpen, fetchLinkedCourses]);

  const handleLinkCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const courseId = formData.get('course_id') as string;
    const orderIndex = parseInt(formData.get('order_index') as string || '0');

    if (!courseId) return toast.error("Select a course");

    try {
      const { error } = await supabase
        .from('lesson_plan_subject_courses')
        .insert([{ 
           subject_id: selectedSubject.id, 
           course_id: Number(courseId), 
           order_index: orderIndex 
        }]);
      
      if (error) {
        if (error.code === '23505') throw new Error("Course already linked to this subject");
        throw error;
      }
      toast.success("Course linked successfully");
      fetchLinkedCourses();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to link course");
    }
  };

  const handleUnlinkCourse = async (id: number) => {
    if (!confirm("Unlink this course?")) return;
    const { error } = await supabase.from('lesson_plan_subject_courses').delete().eq('id', id);
    if (!error) {
      toast.success("Course unlinked");
      fetchLinkedCourses();
    }
  };

  // Quick stats calculations
  const totalLessonsCount = useMemo(() => {
    return units.reduce((acc, u) => acc + (u.lesson_plan_lessons?.length || 0), 0);
  }, [units]);

  const totalContentsCount = useMemo(() => {
    return units.reduce((acc, u) => {
      return acc + (u.lesson_plan_lessons || []).reduce((lAcc: number, l: any) => lAcc + (l.lesson_plan_contents?.length || 0), 0);
    }, 0);
  }, [units]);

  return (
    <div className="space-y-6">
      
      {/* Top Explorer Filter Navigation Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              Curriculum & Lesson Plan Explorer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage academic hierarchy, lessons, and rich text components</p>
          </div>

          {/* Version Filter Pill Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <button 
              type="button"
              onClick={() => setVersionFilter('bn')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                versionFilter === 'bn' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md font-extrabold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> BENGALI (BN)
            </button>
            <button 
              type="button"
              onClick={() => setVersionFilter('en')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                versionFilter === 'en' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md font-extrabold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> ENGLISH (EN)
            </button>
          </div>
        </div>

        {/* Dropdown Hierarchy Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <select 
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
            value={selectedSegmentId}
            onChange={(e) => {
              setSelectedSegmentId(e.target.value);
              setSelectedGroupId('');
              setSelectedSubject(null);
            }}
          >
            <option value="">-- Select Segment --</option>
            {segments.map((seg: any) => (
              <option key={seg.id} value={seg.id}>{seg.title}</option>
            ))}
          </select>

          <select 
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 transition-all cursor-pointer disabled:opacity-50"
            value={selectedGroupId}
            onChange={(e) => {
              setSelectedGroupId(e.target.value);
              setSelectedSubject(null);
            }}
            disabled={!selectedSegmentId}
          >
            <option value="">-- Select Group --</option>
            {groups.map((gr: any) => (
              <option key={gr.id} value={gr.id}>{gr.title}</option>
            ))}
          </select>

          <select 
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 transition-all cursor-pointer disabled:opacity-50"
            value={selectedSubject?.id || ''}
            onChange={(e) => {
              const sub = subjects.find(s => s.id.toString() === e.target.value);
              setSelectedSubject(sub);
            }}
            disabled={!selectedGroupId || isHierarchyLoading}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedSubject ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-dashed border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Select a Subject to Begin</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
            Choose Segment, Group, and Subject above to view and manage units, lessons, and interactive text components.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          
          {/* Active Subject Control Bar & Statistics */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  {versionFilter === 'en' ? 'ENGLISH VERSION' : 'BENGALI VERSION'}
                </span>
                <span className="text-xs text-slate-400 font-semibold">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{units.length} Units</span>
                <span className="text-xs text-slate-400 font-semibold">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{totalLessonsCount} Lessons</span>
                <span className="text-xs text-slate-400 font-semibold">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{totalContentsCount} Components</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedSubject.title} Planning</h3>
            </div>

            {/* Action Toolbars */}
            <div className="flex flex-wrap gap-2">
              <button 
                type="button"
                onClick={() => { setEditingBook(null); setIsBookModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <Book className="w-4 h-4 text-slate-500" /> Related Books
              </button>
              <button 
                type="button"
                onClick={() => { setIsCourseModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" /> Related Courses
              </button>
              <button 
                type="button"
                onClick={() => { setIsCloneModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <Download className="w-4 h-4 text-slate-500" /> Clone Index
              </button>
              <button 
                type="button"
                onClick={() => { setEditingUnit(null); setIsUnitModalOpen(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" /> Add Unit
              </button>
            </div>
          </div>

          {/* Units Hierarchy Tree */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {units.length === 0 && !isLoading && (
              <div className="p-12 text-center text-slate-400 font-medium text-xs">
                No units created in this version yet. Click "Add Unit" above to get started.
              </div>
            )}

            {isLoading && (
              <div className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-wider animate-pulse">
                Loading lesson plan hierarchy...
              </div>
            )}
            
            {units.map((unit) => (
              <div key={unit.id} className="group/unit">
                
                {/* Unit Bar */}
                <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4 flex-1 cursor-pointer select-none" onClick={() => toggleUnit(unit.id)}>
                    {expandedUnits[unit.id] ? (
                      <ChevronDown className="w-5 h-5 text-indigo-600 dark:text-indigo-400 transition-transform" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                    <div className="flex items-center gap-3">
                       <span className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-extrabold shadow-inner">
                         {unit.order_index}
                       </span>
                       <div>
                         <h4 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">{unit.title}</h4>
                         <p className="text-[11px] text-slate-400 font-medium">{unit.lesson_plan_lessons?.length || 0} Lessons linked</p>
                       </div>
                    </div>
                  </div>

                  {/* Unit Action Bar */}
                  <div className="flex items-center gap-1.5 opacity-90 group-hover/unit:opacity-100 transition-all">
                    <button 
                      type="button"
                      onClick={() => handleDuplicateUnitToOtherVersion(unit)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition-all" 
                      title={`Duplicate to ${unit.version === 'bn' ? 'EN' : 'BN'}`}
                    >
                      <Globe className="w-3.5 h-3.5" /> Duplicate to {unit.version === 'bn' ? 'EN' : 'BN'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setParentUnit(unit); setEditingLesson(null); setIsLessonModalOpen(true); }}
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-all flex items-center gap-1 text-xs font-bold" 
                      title="Add Lesson"
                    >
                      <Plus className="w-4 h-4" /> Lesson
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setEditingUnit(unit); setIsUnitModalOpen(true); }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lessons Accordion List */}
                {expandedUnits[unit.id] && (
                  <div className="bg-slate-50/40 dark:bg-slate-950/40 pl-10 pr-6 py-4 space-y-3">
                    {unit.lesson_plan_lessons?.length === 0 && (
                      <div className="py-4 text-xs font-semibold text-slate-400 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        No lessons added yet under this unit. Click "+ Lesson" above to add one.
                      </div>
                    )}

                    {unit.lesson_plan_lessons?.sort((a:any, b:any) => a.order_index - b.order_index).map((lesson: any) => (
                      <div key={lesson.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden group/lesson shadow-sm">
                        
                        {/* Lesson Header */}
                        <div className="px-5 py-3.5 flex items-center justify-between hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all">
                          <div className="flex items-center gap-3 flex-1 cursor-pointer select-none" onClick={() => toggleLesson(lesson.id)}>
                             {expandedLessons[lesson.id] ? (
                               <ChevronDown className="w-4 h-4 text-indigo-500" />
                             ) : (
                               <ChevronRight className="w-4 h-4 text-slate-400" />
                             )}
                             <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-extrabold uppercase tracking-tight">
                               Lesson {lesson.order_index}
                             </span>
                             <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">{lesson.title}</h5>
                             <span className="text-[11px] text-slate-400 font-medium">({lesson.lesson_plan_contents?.length || 0} components)</span>
                          </div>

                          {/* Lesson Actions */}
                          <div className="flex items-center gap-1.5 opacity-90 group-hover/lesson:opacity-100 transition-all">
                             <button 
                                type="button"
                                onClick={() => { 
                                  setParentLesson(lesson); 
                                  setEditingContent(null); 
                                  setIsContentModalOpen(true); 
                                }}
                                className="px-3 py-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-all" 
                                title="Add Content Component"
                             >
                                <Plus className="w-3.5 h-3.5" /> Component
                             </button>
                             <button 
                                type="button"
                                onClick={() => { setEditingLesson(lesson); setIsLessonModalOpen(true); }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                             >
                                <Edit className="w-3.5 h-3.5" />
                             </button>
                             <button 
                                type="button"
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
                             >
                                <Trash2 className="w-3.5 h-3.5" />
                             </button>
                          </div>
                        </div>

                        {/* Content Cards Component Grid */}
                        {expandedLessons[lesson.id] && (
                          <div className="bg-slate-50/60 dark:bg-slate-950/60 p-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                             {lesson.lesson_plan_contents?.length === 0 && (
                                <p className="text-xs font-semibold text-slate-400 col-span-full text-center py-4">
                                  No content components added. Click "+ Component" to insert rich text passages, exercises, or links.
                                </p>
                             )}

                             {lesson.lesson_plan_contents?.sort((a: any, b: any) => a.order_index - b.order_index).map((content: any) => (
                               <div key={content.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all relative group/item shadow-sm flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-2">
                                        {content.type === 'passage' ? (
                                          <FileText className="w-4 h-4 text-indigo-500" />
                                        ) : content.type === 'exercise' ? (
                                          <HelpCircle className="w-4 h-4 text-amber-500" />
                                        ) : (
                                          <LinkIcon className="w-4 h-4 text-emerald-500" />
                                        )}
                                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                                          {content.type} • #{content.order_index}
                                        </span>
                                      </div>

                                      {/* Quick Edit/Delete Actions */}
                                      <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-100 dark:border-slate-700">
                                         <button 
                                           type="button"
                                           onClick={() => { 
                                             setParentLesson(lesson);
                                             setEditingContent(content); 
                                             setIsContentModalOpen(true); 
                                           }}
                                           className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                           title="Edit Component"
                                         >
                                            <Edit className="w-3.5 h-3.5" />
                                         </button>
                                         <button 
                                           type="button"
                                           onClick={() => handleDeleteContent(content.id)}
                                           className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                           title="Delete Component"
                                         >
                                            <Trash2 className="w-3.5 h-3.5" />
                                         </button>
                                      </div>
                                    </div>

                                    <h6 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1 truncate">{content.title}</h6>
                                    
                                    {/* Snippet preview */}
                                    <div className="text-xs text-slate-400 line-clamp-2 font-normal">
                                      {content.content_body ? content.content_body.replace(/<[^>]+>/g, '') : 'No body text'}
                                    </div>
                                  </div>
                               </div>
                             ))}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}

              </div>
            ))}
          </div>

        </div>
      )}

      {/* --- ISOLATED MODALS --- */}

      {/* Unit Modal */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">{editingUnit ? 'Edit Unit' : 'Create New Unit'}</h3>
            <form onSubmit={handleSaveUnit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Unit Title</label>
                <input 
                  name="title" 
                  defaultValue={editingUnit?.title} 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm" 
                  placeholder="e.g. Unit 1: Introduction"
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Order Index</label>
                <input 
                  name="order_index" 
                  type="number"
                  defaultValue={editingUnit?.order_index || 0} 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm" 
                  required 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsUnitModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/20">Save Unit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">{editingLesson ? 'Edit Lesson' : 'New Lesson'}</h3>
            <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mb-4">Under Unit: {parentUnit?.title || 'Current Unit'}</p>
            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Lesson Title</label>
                <input 
                  name="title" 
                  defaultValue={editingLesson?.title} 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm" 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Order Index</label>
                <input 
                  name="order_index" 
                  type="number"
                  defaultValue={editingLesson?.order_index || 0} 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm" 
                  required 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsLessonModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/20">Save Lesson</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISOLATED CONTENT EDIT MODAL */}
      <ContentEditModal
        isOpen={isContentModalOpen}
        editingContent={editingContent}
        parentLesson={parentLesson}
        onClose={() => setIsContentModalOpen(false)}
        onSave={handleSaveContentModal}
      />

      {/* Related Books Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
               <div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Related Books</h3>
                 <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Subject: {selectedSubject?.title}</p>
               </div>
               <button type="button" onClick={() => { setIsBookModalOpen(false); setEditingBook(null); }} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">{editingBook ? 'Edit Book' : 'Add New Book Link'}</h4>
                <form onSubmit={handleSaveBook} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title *</label>
                      <input name="title" defaultValue={editingBook?.title || ''} className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 font-semibold" placeholder="e.g. HSC Physics 1st Paper" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subtitle / Type</label>
                      <input name="subtitle" defaultValue={editingBook?.subtitle || ''} className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 font-medium" placeholder="e.g. NCTB BOARD TEXTBOOK" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">URL Link</label>
                      <input name="url" defaultValue={editingBook?.url || ''} className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 font-medium" placeholder="https://" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Order Index</label>
                      <input name="order_index" type="number" defaultValue={editingBook?.order_index || 0} className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 font-medium" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    {editingBook && <button type="button" onClick={() => setEditingBook(null)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-xs">Cancel Edit</button>}
                    <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs">{editingBook ? 'Save Changes' : 'Add Book'}</button>
                  </div>
                </form>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Current Books Linked ({books.length})</h4>
                {isBooksLoading ? <div className="text-center text-slate-400 py-4 text-xs font-bold">Loading...</div> : null}
                {books.length === 0 && !isBooksLoading ? <div className="text-center text-slate-400 py-6 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold">No books linked yet</div> : null}
                {books.map(book => (
                  <div key={book.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-200 transition-all shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                         <Book className="w-4 h-4"/>
                       </div>
                       <div className="min-w-0">
                         <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{book.title}</p>
                         {book.subtitle && <p className="text-[10px] text-slate-400 font-medium truncate">{book.subtitle}</p>}
                       </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => setEditingBook(book)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"><Edit className="w-4 h-4"/></button>
                      <button type="button" onClick={() => handleDeleteBook(book.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clone Structure Modal */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-3 shrink-0">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Clone Structure</h3>
              <button type="button" onClick={() => setIsCloneModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4 shrink-0">
              Import Units and Lessons index from another subject into <strong>{selectedSubject?.title}</strong> ({versionFilter.toUpperCase()}).
            </p>
            
            <form onSubmit={handleCloneStructure} className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Source Subject</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-xs text-slate-800 dark:text-white transition-all"
                  value={cloneSourceId}
                  onChange={(e) => setCloneSourceId(e.target.value)}
                  required
                >
                   <option value="">-- Select Source Subject --</option>
                   {allSubjects.map(sub => (
                      <option key={sub.id} value={sub.id}>
                         {sub.groups?.segments?.title && sub.groups?.title ? `${sub.groups.segments.title} > ${sub.groups.title} > ` : ''}{sub.title}
                      </option>
                   ))}
                </select>
              </div>

              {cloneSourceId && (
                <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Select Units to Clone</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        const allSelected = cloneSourceUnits.every(u => selectedUnitsToClone[u.id]);
                        const newSelection = { ...selectedUnitsToClone };
                        cloneSourceUnits.forEach(u => newSelection[u.id] = !allSelected);
                        setSelectedUnitsToClone(newSelection);
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Toggle All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {cloneSourceUnits.map(unit => (
                      <label key={unit.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl cursor-pointer hover:border-indigo-400 transition-all">
                        <input 
                          type="checkbox" 
                          checked={!!selectedUnitsToClone[unit.id]}
                          onChange={(e) => setSelectedUnitsToClone(prev => ({ ...prev, [unit.id]: e.target.checked }))}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{unit.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsCloneModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs">Cancel</button>
                <button type="submit" disabled={!cloneSourceId} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/20 disabled:opacity-50">Start Clone</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
