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
  GraduationCap
} from "lucide-react";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { toast } from "sonner";

interface LessonPlanManagerProps {
  subjects: any[];
}

export default function LessonPlanManager({ subjects: initialSubjects }: LessonPlanManagerProps) {
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  
  // Independent Hierarchy State
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
  
  // Expanded state for tree
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

  // Version filter
  const [versionFilter, setVersionFilter] = useState<'en' | 'bn'>('bn');

  // Clone Modal
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState('');
  const [allSubjects, setAllSubjects] = useState<any[]>([]);

  useEffect(() => {
    if (isCloneModalOpen) {
      const fetchAll = async () => {
        const { data } = await supabase.from('subjects').select('id, title, groups(title, segments(title))').order('id');
        setAllSubjects(data || []);
      };
      fetchAll();
    }
  }, [isCloneModalOpen]);

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
       // 1. Insert Unit
       const { data: newUnit, error: ue } = await supabase.from('lesson_plan_units').insert([{
         subject_id: unit.subject_id,
         title: unit.title,
         order_index: unit.order_index,
         version: targetVersion
       }]).select().single();
       if (ue) throw ue;

       // 2. Loop Lessons
       for (const lesson of unit.lesson_plan_lessons || []) {
          const { data: newLesson, error: le } = await supabase.from('lesson_plan_lessons').insert([{
             unit_id: newUnit.id,
             title: lesson.title,
             order_index: lesson.order_index,
             version: targetVersion
          }]).select().single();
          if (le) throw le;

          // 3. Loop Contents
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
    setIsLoading(true);
    setIsCloneModalOpen(false);
    try {
      // Fetch source subjects unit and lessons for the current version
      const { data: sourceUnits } = await supabase.from('lesson_plan_units').select(`
        *,
        lesson_plan_lessons (*)
      `).eq('subject_id', cloneSourceId).eq('version', versionFilter).order('order_index');

      if (!sourceUnits || sourceUnits.length === 0) {
         toast.error("Source subject has no units to clone in this version.");
         setIsLoading(false);
         return;
      }

      for (const su of sourceUnits) {
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
      toast.success("Structure cloned successfully!");
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
  const [contentBody, setContentBody] = useState('');
  
  const handleSaveContent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const type = formData.get('type') as string;
    const orderIndex = parseInt(formData.get('order_index') as string || '0');

    try {
      if (editingContent) {
        const { error } = await supabase
          .from('lesson_plan_contents')
          .update({ title, type, content_body: contentBody, order_index: orderIndex })
          .eq('id', editingContent.id);
        if (error) throw error;
        toast.success("Content updated");
      } else {
        const { error } = await supabase
          .from('lesson_plan_contents')
          .insert([{ 
            title, 
            type, 
            content_body: contentBody, 
            order_index: orderIndex, 
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
          .insert([{ title, subtitle, url, order_index: orderIndex, subject_id: selectedSubject.id }]);
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
    if (!confirm("Remove this related book?")) return;
    const { error } = await supabase.from('lesson_plan_subject_books').delete().eq('id', id);
    if (!error) {
      toast.success("Book removed");
      fetchBooks();
    }
  };

  // --- Handlers for Courses ---
  const fetchLinkedCourses = useCallback(async () => {
    if (!selectedSubject) return;
    setIsCoursesLoading(true);
    const { data } = await supabase
      .from('lesson_plan_subject_courses')
      .select('*, courses(*)')
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Lesson Plan Explorer
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Manage curriculum hierarchy and content</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <select 
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
            value={selectedSegmentId}
            onChange={(e) => {
              setSelectedSegmentId(e.target.value);
              setSelectedGroupId('');
              setSelectedSubject(null);
            }}
          >
            <option value="">Select Segment</option>
            {segments.map((seg: any) => (
              <option key={seg.id} value={seg.id}>{seg.title}</option>
            ))}
          </select>

          <select 
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
            value={selectedGroupId}
            onChange={(e) => {
              setSelectedGroupId(e.target.value);
              setSelectedSubject(null);
            }}
          >
            <option value="">Select Group</option>
            {groups.map((gr: any) => (
              <option key={gr.id} value={gr.id}>{gr.title}</option>
            ))}
          </select>

          <select 
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
            value={selectedSubject?.id || ''}
            onChange={(e) => {
              const sub = subjects.find(s => s.id.toString() === e.target.value);
              setSelectedSubject(sub);
            }}
            disabled={!selectedGroupId || isHierarchyLoading}
          >
            <option value="">Select Subject</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
             <button 
                onClick={() => setVersionFilter('bn')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${versionFilter === 'bn' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
             >
                BN
             </button>
             <button 
                onClick={() => setVersionFilter('en')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${versionFilter === 'en' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
             >
                EN
             </button>
          </div>
        </div>
      </div>

      {!selectedSubject ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-20 text-center border border-dashed border-slate-200 dark:border-slate-700">
          <Book className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Get Started</h3>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2 max-w-sm mx-auto">Select a subject from the list to start building or managing its lesson plan.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50/50 flex-wrap gap-4">
            <div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedSubject.title} Planning</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest">{versionFilter === 'en' ? 'English' : 'Bengali'} Version</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { setEditingBook(null); setIsBookModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:bg-slate-700 transition-all text-nowrap"
              >
                <Book className="w-4 h-4" /> RELATED BOOKS
              </button>
              <button 
                onClick={() => { setIsCourseModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-xl text-sm font-bold hover:bg-indigo-100 dark:bg-indigo-900/50 transition-all text-nowrap"
              >
                <GraduationCap className="w-4 h-4" /> RELATED COURSES
              </button>
              <button 
                onClick={() => { setIsCloneModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:bg-slate-700 transition-all text-nowrap"
              >
                <Download className="w-4 h-4" /> CLONE INDEX
              </button>
              <button 
                onClick={() => { setEditingUnit(null); setIsUnitModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100 text-nowrap"
              >
                <Plus className="w-4 h-4" /> ADD UNIT
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {units.length === 0 && (
              <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium">No units found in this version.</div>
            )}
            
            {units.map((unit) => (
              <div key={unit.id} className="group/unit">
                {/* Unit Header */}
                <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:bg-slate-800/50 transition-all">
                  <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleUnit(unit.id)}>
                    {expandedUnits[unit.id] ? <ChevronDown className="w-5 h-5 text-indigo-600" /> : <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
                    <div className="flex items-center gap-3">
                       <span className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black">{unit.order_index}</span>
                       <h4 className="font-bold text-slate-900 dark:text-white">{unit.title}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover/unit:opacity-100 transition-all">
                    <button 
                      onClick={() => handleDuplicateUnitToOtherVersion(unit)}
                      className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all" title={`Duplicate to ${unit.version === 'bn' ? 'EN' : 'BN'}`}
                    >
                      <Globe className="w-3.5 h-3.5" /> To {unit.version === 'bn' ? 'EN' : 'BN'}
                    </button>
                    <button 
                      onClick={() => { setParentUnit(unit); setEditingLesson(null); setIsLessonModalOpen(true); }}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Add Lesson"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setEditingUnit(unit); setIsUnitModalOpen(true); }}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lessons */}
                {expandedUnits[unit.id] && (
                  <div className="bg-slate-50 dark:bg-slate-800/50/30 pl-12 pr-6 py-2 space-y-2">
                    {unit.lesson_plan_lessons?.length === 0 && (
                      <div className="py-4 text-xs font-bold text-slate-300 uppercase tracking-widest text-center">No lessons added</div>
                    )}
                    {unit.lesson_plan_lessons?.sort((a:any, b:any) => a.order_index - b.order_index).map((lesson: any) => (
                      <div key={lesson.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden group/lesson">
                        <div className="px-4 py-3 flex items-center justify-between hover:bg-indigo-50/20 transition-all">
                          <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleLesson(lesson.id)}>
                             {expandedLessons[lesson.id] ? <ChevronDown className="w-4 h-4 text-indigo-500" /> : <ChevronRight className="w-4 h-4 text-slate-300" />}
                             <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight">Lesson {lesson.order_index}:</span>
                             <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{lesson.title}</h5>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-all">
                             <button 
                                onClick={() => { setParentLesson(lesson); setEditingContent(null); setContentBody(''); setIsContentModalOpen(true); }}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md" title="Add Content"
                             >
                                <Plus className="w-3.5 h-3.5" />
                             </button>
                             <button 
                                onClick={() => { setEditingLesson(lesson); setIsLessonModalOpen(true); }}
                                className="p-1 text-slate-400 dark:text-slate-500 hover:text-indigo-600 rounded-md"
                             >
                                <Edit className="w-3.5 h-3.5" />
                             </button>
                             <button 
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded-md"
                             >
                                <Trash2 className="w-3.5 h-3.5" />
                             </button>
                          </div>
                        </div>

                        {/* Contents */}
                        {expandedLessons[lesson.id] && (
                          <div className="bg-indigo-50/5 p-4 border-t border-slate-50 flex flex-wrap gap-3">
                             {lesson.lesson_plan_contents?.length === 0 && (
                                <p className="text-[10px] font-bold text-slate-300 uppercase w-full text-center py-2">No components added yet</p>
                             )}
                             {lesson.lesson_plan_contents?.sort((a: any, b: any) => a.order_index - b.order_index).map((content: any) => (
                               <div key={content.id} className="flex-1 min-w-[200px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl hover:border-indigo-300 transition-all relative group/item shadow-sm">
                                  <div className="flex items-center gap-3">
                                      {content.type === 'passage' ? <FileText className="w-4 h-4 text-blue-500" /> : (content.type === 'exercise' ? <HelpCircle className="w-4 h-4 text-orange-500" /> : <LinkIcon className="w-4 h-4 text-purple-500" />)}
                                      <div className="min-w-0 flex-1">
                                         <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase leading-none mb-1">{content.type}</p>
                                         <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{content.title}</p>
                                      </div>
                                  </div>
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-all bg-white dark:bg-slate-900/90 backdrop-blur rounded p-1 shadow-sm border border-slate-100 dark:border-slate-800">
                                     <button 
                                       onClick={() => { setEditingContent(content); setContentBody(content.content_body || ''); setIsContentModalOpen(true); }}
                                       className="p-1 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-indigo-600"
                                     >
                                        <Edit className="w-3.5 h-3.5" />
                                     </button>
                                     <button 
                                       onClick={() => handleDeleteContent(content.id)}
                                       className="p-1 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-red-500"
                                     >
                                        <Trash2 className="w-3.5 h-3.5" />
                                     </button>
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

      {/* --- MODALS --- */}

      {/* Unit Modal */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">{editingUnit ? 'Edit Unit' : 'New Unit'}</h3>
            <form onSubmit={handleSaveUnit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Title</label>
                <input 
                  name="title" 
                  defaultValue={editingUnit?.title} 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                  placeholder="e.g. Unit 1: Introduction"
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Order Index</label>
                <input 
                  name="order_index" 
                  type="number"
                  defaultValue={editingUnit?.order_index || 0} 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                  required 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsUnitModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 dark:text-slate-500 rounded-2xl font-black uppercase text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-indigo-100">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">{editingLesson ? 'Edit Lesson' : 'New Lesson'}</h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Under Unit: {parentUnit?.title || 'Current'}</p>
            <form onSubmit={handleSaveLesson} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Title</label>
                <input 
                  name="title" 
                  defaultValue={editingLesson?.title} 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Order Index</label>
                <input 
                  name="order_index" 
                  type="number"
                  defaultValue={editingLesson?.order_index || 0} 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                  required 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsLessonModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 dark:text-slate-500 rounded-2xl font-black uppercase text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-indigo-100">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Related Books Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-8 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
               <div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Related Books</h3>
                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Subject: {selectedSubject?.title}</p>
               </div>
               <button onClick={() => { setIsBookModalOpen(false); setEditingBook(null); }} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Form */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">{editingBook ? 'Edit Book' : 'Add New Book link'}</h4>
                <form onSubmit={handleSaveBook} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Title *</label>
                      <input name="title" defaultValue={editingBook?.title || ''} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 font-bold" placeholder="e.g. HSC Physics 1st Paper" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Subtitle / Type</label>
                      <input name="subtitle" defaultValue={editingBook?.subtitle || ''} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500" placeholder="e.g. NCTB BOARD TEXTBOOK" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">URL Link</label>
                      <input name="url" defaultValue={editingBook?.url || ''} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500" placeholder="https://" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Order Index</label>
                      <input name="order_index" type="number" defaultValue={editingBook?.order_index || 0} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    {editingBook && <button type="button" onClick={() => setEditingBook(null)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 dark:text-slate-500 rounded-lg font-bold text-xs">Cancel Edit</button>}
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs">{editingBook ? 'Save Changes' : 'Add Book'}</button>
                  </div>
                </form>
              </div>

              {/* List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Current Books Linked ({books.length})</h4>
                {isBooksLoading ? <div className="text-center text-slate-400 dark:text-slate-500 py-4 text-xs font-bold">Loading...</div> : null}
                {books.length === 0 && !isBooksLoading ? <div className="text-center text-slate-400 dark:text-slate-500 py-8 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold">No books linked yet</div> : null}
                {books.map(book => (
                  <div key={book.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-200 transition-all shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                         <Book className="w-4 h-4"/>
                       </div>
                       <div className="min-w-0">
                         <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{book.title}</p>
                         {book.subtitle && <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold truncate">{book.subtitle}</p>}
                       </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setEditingBook(book)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:bg-slate-800/50 rounded-md transition-colors"><Edit className="w-4 h-4"/></button>
                      <button onClick={() => handleDeleteBook(book.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Modal */}
      {isContentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col my-auto h-auto max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
               <div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{editingContent ? 'Edit Content' : 'New Component'}</h3>
                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Lesson: {parentLesson?.title || 'Current'}</p>
               </div>
               <button onClick={() => setIsContentModalOpen(false)} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSaveContent} className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2 space-y-2">
                   <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Component Title</label>
                   <input 
                     name="title" 
                     defaultValue={editingContent?.title} 
                     className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                     required 
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Type</label>
                   <select 
                     name="type" 
                     defaultValue={editingContent?.type || 'passage'}
                     className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                   >
                      <option value="passage">Passage/Content</option>
                      <option value="exercise">Exercise/Question</option>
                      <option value="link">Resource Link</option>
                   </select>
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Actual Content (Rich Text)</label>
                <div className="min-h-[400px]">
                  <RichTextEditor 
                    initialValue={editingContent?.content_body || ""} 
                    onChange={setContentBody} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Order Index</label>
                  <input 
                    name="order_index" 
                    type="number"
                    defaultValue={editingContent?.order_index || 0} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" 
                    required 
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsContentModalOpen(false)} className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 dark:text-slate-500 rounded-2xl font-black uppercase text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
                   <Save className="w-4 h-4" /> SAVE COMPONENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clone Structure Modal */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Clone Structure</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-6">Import the Units and Lessons index from another subject into <strong>{selectedSubject?.title}</strong> ({versionFilter.toUpperCase()}). Contents inside lessons will not be copied.</p>
            <form onSubmit={handleCloneStructure} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Source Subject</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
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
              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsCloneModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 dark:text-slate-500 rounded-2xl font-black uppercase text-xs">Cancel</button>
                <button type="submit" disabled={!cloneSourceId} className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-indigo-100 disabled:opacity-50">Clone Index</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Related Courses Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-8 shadow-2xl max-h-[90vh] flex flex-col border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6 shrink-0">
               <div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Related Courses</h3>
                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Subject: {selectedSubject?.title}</p>
               </div>
               <button onClick={() => { setIsCourseModalOpen(false); }} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Link Form */}
              <div className="bg-indigo-50/30 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
                <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest mb-4">Link Expert Course</h4>
                <form onSubmit={handleLinkCourse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Select Published Course *</label>
                      <select name="course_id" className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" required>
                         <option value="">-- Select Course --</option>
                         {availableCourses.map(c => (
                           <option key={c.id} value={c.id}>{c.title} ({c.instructor_name})</option>
                         ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Display Order</label>
                      <input name="order_index" type="number" defaultValue={0} className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="w-full md:w-auto px-10 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Link Course</button>
                  </div>
                </form>
              </div>

              {/* Linked List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Currently Linked Courses ({linkedCourses.length})</h4>
                {isCoursesLoading ? <div className="text-center text-slate-400 py-10 text-xs font-bold bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-2xl">Loading courses...</div> : null}
                {linkedCourses.length === 0 && !isCoursesLoading ? <div className="text-center text-slate-400 py-12 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold uppercase tracking-widest">No expert courses linked to this subject.</div> : null}
                {linkedCourses.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-300 transition-all shadow-sm group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
                          <GraduationCap className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.courses?.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{item.courses?.instructor_name} • Order: {item.order_index}</p>
                       </div>
                    </div>
                    <button onClick={() => handleUnlinkCourse(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                       <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
               <button onClick={() => setIsCourseModalOpen(false)} className="px-10 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
