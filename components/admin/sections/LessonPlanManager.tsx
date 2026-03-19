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
} from "lucide-react";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { toast } from "sonner";

interface LessonPlanManagerProps {
  subjects: any[];
}

export default function LessonPlanManager({ subjects }: LessonPlanManagerProps) {
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [units, setUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Derived options for dropdowns
  const segments = useMemo(() => {
    const map = new Map();
    subjects.forEach(s => {
      if (s.groups?.segments) map.set(s.groups.segments.id, s.groups.segments);
    });
    return Array.from(map.values());
  }, [subjects]);

  const groups = useMemo(() => {
    const map = new Map();
    subjects.forEach(s => {
       if (s.groups && (!selectedSegmentId || s.groups.segments?.id?.toString() === selectedSegmentId)) {
          map.set(s.groups.id, s.groups);
       }
    });
    return Array.from(map.values());
  }, [subjects, selectedSegmentId]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      const matchSeg = !selectedSegmentId || s.groups?.segments?.id?.toString() === selectedSegmentId;
      const matchGr = !selectedGroupId || s.groups?.id?.toString() === selectedGroupId;
      return matchSeg && matchGr;
    });
  }, [subjects, selectedSegmentId, selectedGroupId]);

  
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

  // Version filter
  const [versionFilter, setVersionFilter] = useState<'en' | 'bn'>('bn');

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Lesson Plan Explorer
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage curriculum hierarchy and content</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <select 
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
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
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
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
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
            value={selectedSubject?.id || ''}
            onChange={(e) => {
              const sub = subjects.find(s => s.id.toString() === e.target.value);
              setSelectedSubject(sub);
            }}
          >
            <option value="">Select Subject</option>
            {filteredSubjects.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>

          <div className="flex p-1 bg-slate-100 rounded-xl">
             <button 
                onClick={() => setVersionFilter('bn')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${versionFilter === 'bn' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                BN
             </button>
             <button 
                onClick={() => setVersionFilter('en')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${versionFilter === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                EN
             </button>
          </div>
        </div>
      </div>

      {!selectedSubject ? (
        <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-200">
          <Book className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">Get Started</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">Select a subject from the list to start building or managing its lesson plan.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
               <h3 className="text-lg font-bold text-slate-900">{selectedSubject.title} Planning</h3>
               <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{versionFilter === 'en' ? 'English' : 'Bengali'} Version</p>
            </div>
            <button 
              onClick={() => { setEditingUnit(null); setIsUnitModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
            >
              <Plus className="w-4 h-4" /> ADD UNIT
            </button>
          </div>

          <div className="divide-y divide-slate-50">
            {units.length === 0 && (
              <div className="p-12 text-center text-slate-400 font-medium">No units found in this version.</div>
            )}
            
            {units.map((unit) => (
              <div key={unit.id} className="group/unit">
                {/* Unit Header */}
                <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleUnit(unit.id)}>
                    {expandedUnits[unit.id] ? <ChevronDown className="w-5 h-5 text-indigo-600" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                    <div className="flex items-center gap-3">
                       <span className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black">{unit.order_index}</span>
                       <h4 className="font-bold text-slate-900">{unit.title}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover/unit:opacity-100 transition-all">
                    <button 
                      onClick={() => { setParentUnit(unit); setEditingLesson(null); setIsLessonModalOpen(true); }}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Add Lesson"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setEditingUnit(unit); setIsUnitModalOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lessons */}
                {expandedUnits[unit.id] && (
                  <div className="bg-slate-50/30 pl-12 pr-6 py-2 space-y-2">
                    {unit.lesson_plan_lessons?.length === 0 && (
                      <div className="py-4 text-xs font-bold text-slate-300 uppercase tracking-widest text-center">No lessons added</div>
                    )}
                    {unit.lesson_plan_lessons?.sort((a:any, b:any) => a.order_index - b.order_index).map((lesson: any) => (
                      <div key={lesson.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden group/lesson">
                        <div className="px-4 py-3 flex items-center justify-between hover:bg-indigo-50/20 transition-all">
                          <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleLesson(lesson.id)}>
                             {expandedLessons[lesson.id] ? <ChevronDown className="w-4 h-4 text-indigo-500" /> : <ChevronRight className="w-4 h-4 text-slate-300" />}
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Lesson {lesson.order_index}:</span>
                             <h5 className="font-bold text-slate-800 text-sm">{lesson.title}</h5>
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
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                             >
                                <Edit className="w-3.5 h-3.5" />
                             </button>
                             <button 
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="p-1 text-slate-400 hover:text-red-500 rounded-md"
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
                               <div key={content.id} className="flex-1 min-w-[200px] bg-white border border-slate-200 p-3 rounded-xl hover:border-indigo-300 transition-all relative group/item shadow-sm">
                                  <div className="flex items-center gap-3">
                                      {content.type === 'passage' ? <FileText className="w-4 h-4 text-blue-500" /> : (content.type === 'exercise' ? <HelpCircle className="w-4 h-4 text-orange-500" /> : <LinkIcon className="w-4 h-4 text-purple-500" />)}
                                      <div className="min-w-0 flex-1">
                                         <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{content.type}</p>
                                         <p className="text-xs font-bold text-slate-800 truncate">{content.title}</p>
                                      </div>
                                  </div>
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-all bg-white/90 backdrop-blur rounded p-1 shadow-sm border border-slate-100">
                                     <button 
                                       onClick={() => { setEditingContent(content); setContentBody(content.content_body || ''); setIsContentModalOpen(true); }}
                                       className="p-1 text-slate-500 hover:text-indigo-600"
                                     >
                                        <Edit className="w-3.5 h-3.5" />
                                     </button>
                                     <button 
                                       onClick={() => handleDeleteContent(content.id)}
                                       className="p-1 text-slate-500 hover:text-red-500"
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
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-6">{editingUnit ? 'Edit Unit' : 'New Unit'}</h3>
            <form onSubmit={handleSaveUnit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Title</label>
                <input 
                  name="title" 
                  defaultValue={editingUnit?.title} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                  required 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsUnitModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-indigo-100">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-6">{editingLesson ? 'Edit Lesson' : 'New Lesson'}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Under Unit: {parentUnit?.title || 'Current'}</p>
            <form onSubmit={handleSaveLesson} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Title</label>
                <input 
                  name="title" 
                  defaultValue={editingLesson?.title} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Order Index</label>
                <input 
                  name="order_index" 
                  type="number"
                  defaultValue={editingLesson?.order_index || 0} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                  required 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsLessonModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-indigo-100">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Modal */}
      {isContentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col my-auto h-auto max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
               <div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{editingContent ? 'Edit Content' : 'New Component'}</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lesson: {parentLesson?.title || 'Current'}</p>
               </div>
               <button onClick={() => setIsContentModalOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSaveContent} className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2 space-y-2">
                   <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Component Title</label>
                   <input 
                     name="title" 
                     defaultValue={editingContent?.title} 
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                     required 
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Type</label>
                   <select 
                     name="type" 
                     defaultValue={editingContent?.type || 'passage'}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" 
                    required 
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsContentModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
                   <Save className="w-4 h-4" /> SAVE COMPONENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
