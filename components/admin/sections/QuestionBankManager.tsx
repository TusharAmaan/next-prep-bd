"use client";

import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Plus, Trash2, Save, CheckCircle, 
  ChevronDown, ChevronRight, FileText, 
  HelpCircle, BookOpen, AlertCircle,
  Search, Filter, X, ChevronLeft, Edit3,
  List as ListIcon, Tag, LayoutGrid, MoreHorizontal, Layers,
  Loader2, ArrowRight
} from "lucide-react";
import RichTextEditor from "@/components/shared/RichTextEditor";

// --- TYPES ---
type QuestionType = 'mcq' | 'descriptive' | 'passage';

interface Option {
  id?: string; 
  option_text: string;
  is_correct: boolean;
}

interface Question {
  id?: string;
  question_text: string;
  question_type: QuestionType;
  marks: number;
  explanation: string;
  options: Option[];
  parent_id?: string;
  topic_tag?: string; 
  segment_id?: number;
  group_id?: number;
  subject_id?: number;
  subjects?: { title: string };
}

// --- 1. PROFESSIONAL MODAL ---
function CustomModal({ isOpen, type, message, onConfirm, onCancel }: { 
  isOpen: boolean; 
  type: 'success' | 'error' | 'confirm'; 
  message: string; 
  onConfirm?: () => void; 
  onCancel?: () => void; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-white/20 transform transition-all scale-100">
        <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
          type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
          type === 'error' ? 'bg-red-100 text-red-600' : 
          'bg-indigo-100 text-indigo-600'
        }`}>
          {type === 'success' && <CheckCircle size={28} />}
          {type === 'error' && <AlertCircle size={28} />}
          {type === 'confirm' && <HelpCircle size={28} />}
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Confirm'}
        </h3>
        
        <p className="text-slate-600 mb-8 text-sm leading-relaxed">{message}</p>
        
        <div className="flex gap-3 justify-center">
          {type === 'confirm' ? (
            <>
              <button onClick={onCancel} className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 text-sm transition-colors">Cancel</button>
              <button onClick={onConfirm} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 text-sm shadow-lg shadow-indigo-200 transition-all">Confirm</button>
            </>
          ) : (
            <button onClick={onCancel} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black text-sm shadow-lg transition-all">Okay</button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 2. MULTI TAG INPUT ---
const MultiTagInput = ({ value, onChange, suggestions }: { value: string, onChange: (val: string) => void, suggestions: string[] }) => {
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    
    const tags = useMemo(() => value ? value.split(',').map(t => t.trim()).filter(Boolean) : [], [value]);
    
    const filteredSuggestions = suggestions.filter(
        s => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
    );

    const addTag = (tag: string) => {
        if (!tags.includes(tag)) {
            const newTags = [...tags, tag];
            onChange(newTags.join(', '));
        }
        setInputValue("");
    };

    const removeTag = (tagToRemove: string) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        onChange(newTags.join(', '));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue) {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    return (
        <div className="relative group w-full">
            <div className={`flex flex-wrap items-center gap-2 border rounded-xl p-2.5 bg-white transition-all ${isFocused ? 'ring-2 ring-indigo-100 border-indigo-300' : 'border-slate-200'}`}>
                <Tag size={16} className="text-slate-400 mr-1"/>
                {tags.map(tag => (
                    <span key={tag} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 border border-indigo-100">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-indigo-900 rounded-full hover:bg-indigo-200 p-0.5"><X size={10}/></button>
                    </span>
                ))}
                <input 
                    className="flex-1 min-w-[120px] text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
                    placeholder={tags.length === 0 ? "Add tags..." : ""}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                />
            </div>
            {isFocused && (filteredSuggestions.length > 0 || (inputValue && !tags.includes(inputValue))) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50 py-1">
                    {inputValue && !filteredSuggestions.includes(inputValue) && (
                        <button onMouseDown={(e) => { e.preventDefault(); addTag(inputValue); }} className="w-full text-left px-4 py-2 text-sm text-indigo-600 bg-indigo-50 font-bold hover:bg-indigo-100 flex items-center gap-2">
                            <Plus size={14}/> Create "{inputValue}"
                        </button>
                    )}
                    {filteredSuggestions.map(tag => (
                        <button key={tag} onMouseDown={(e) => { e.preventDefault(); addTag(tag); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            {tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- 3. STABLE EDITOR ---
const StableEditor = memo(({ initialContent, onChange, uniqueKey }: { initialContent: string, onChange: (val: string) => void, uniqueKey: string }) => {
    return (
        <div className="prose-editor-wrapper min-h-[150px] bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-100 transition-shadow">
            <RichTextEditor key={uniqueKey} initialValue={initialContent} onChange={onChange} />
        </div>
    );
}, (prev, next) => prev.uniqueKey === next.uniqueKey); 
StableEditor.displayName = "StableEditor";

// --- 4. QUESTION FORM INTERNAL ---
const QuestionFormInternal = memo(({ 
    isSub, type, setType, content, setContent, marks, setMarks, 
    options, setOptions, explanation, setExplanation, 
    topicTag, setTopicTag, uniqueTags, dropdowns, createDropdowns, 
    mainForm, setMainForm, handleCreateSegmentChange, handleCreateGroupChange
}: any) => {
    return (
        <div className="flex flex-col h-full overflow-hidden px-6 pb-6">
            {!isSub && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-in fade-in slide-in-from-top-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Segment</label>
                        <select className="w-full border p-2 rounded-lg text-sm bg-slate-50 outline-none focus:border-indigo-500" value={mainForm.segment} onChange={e => { setMainForm((p:any) => ({...p, segment: e.target.value})); handleCreateSegmentChange(e.target.value); }}>
                            <option value="">Select...</option>{dropdowns.segments.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Group</label>
                        <select className="w-full border p-2 rounded-lg text-sm bg-slate-50 outline-none focus:border-indigo-500" value={mainForm.group} onChange={e => { setMainForm((p:any) => ({...p, group: e.target.value})); handleCreateGroupChange(e.target.value); }} disabled={!mainForm.segment}>
                            <option value="">Select...</option>{createDropdowns.groups.map((g:any) => <option key={g.id} value={g.id}>{g.title}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Subject</label>
                        <select className="w-full border p-2 rounded-lg text-sm bg-slate-50 outline-none focus:border-indigo-500" value={mainForm.subject} onChange={e => setMainForm((p:any) => ({...p, subject: e.target.value}))} disabled={!mainForm.group}>
                            <option value="">Select...</option>{createDropdowns.subjects.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Topic Tags</label>
                        <MultiTagInput value={topicTag} onChange={setTopicTag} suggestions={uniqueTags} />
                    </div>
                </div>
            )}

            <div className={`flex flex-col md:flex-row gap-6 ${type === 'passage' && !isSub ? 'h-full overflow-hidden' : ''}`}>
                <div className={`flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col ${type === 'passage' && !isSub ? 'md:w-1/2' : 'w-full'}`}>
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                        <div className="flex bg-slate-200 p-1 rounded-lg">
                            {(['mcq', 'descriptive', 'passage'] as const).map(t => (
                                (!isSub || t !== 'passage') && (
                                    <button key={t} onClick={() => setType(t)} className={`px-4 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${type === t ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>
                                )
                            ))}
                        </div>
                        {(type !== 'passage' || isSub) && (
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold uppercase text-slate-400">Marks</label>
                                <input type="number" value={marks} onChange={e => setMarks(Number(e.target.value))} className="w-16 border rounded-lg p-1.5 text-center font-bold text-sm outline-none focus:border-indigo-500"/>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        <StableEditor uniqueKey={isSub ? 'sub-editor' : 'main-editor'} initialContent={content} onChange={setContent} />

                        {type === 'mcq' && (
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                                <label className="text-xs font-bold uppercase text-slate-400">Options</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {options.map((opt:any, i:number) => (
                                        <div key={i} className="flex gap-3 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm group focus-within:border-indigo-300 transition-colors">
                                            <button onClick={() => { const n = [...options]; n.forEach(o => o.is_correct = false); n[i].is_correct = true; setOptions(n); }} className={`p-2.5 rounded-lg border transition-all ${opt.is_correct ? 'bg-emerald-100 border-emerald-400 text-emerald-700' : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'}`}>
                                                <CheckCircle size={18} />
                                            </button>
                                            <input className="flex-1 border-none outline-none bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-300" value={opt.option_text} onChange={e => { const n = [...options]; n[i].option_text = e.target.value; setOptions(n); }} placeholder={`Option ${i+1}`} />
                                            <button onClick={() => { const n = [...options]; n.splice(i,1); setOptions(n); }} className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setOptions([...options, {option_text:'', is_correct:false}])} className="text-xs font-bold text-indigo-600 flex items-center gap-1 mt-2 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors"><Plus size={14}/> Add Option</button>
                            </div>
                        )}

                        {(type !== 'passage' || isSub) && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400">Explanation</label>
                                <StableEditor uniqueKey={isSub ? 'sub-expl' : 'main-expl'} initialContent={explanation} onChange={setExplanation} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});
QuestionFormInternal.displayName = "QuestionFormInternal";

// --- MAIN COMPONENT ---
export default function QuestionBankManager() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // List State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ segment: "", group: "", subject: "", type: "all", topic: "" });
  const [pagination, setPagination] = useState({ page: 0, itemsPerPage: 20, total: 0 });

  // Modal
  const [modal, setModal] = useState<{ isOpen: boolean; type: any; message: string; onConfirm?: () => void }>({ isOpen: false, type: 'success', message: '' });
  const showModal = (type: any, message: string, onConfirm?: () => void) => setModal({ isOpen: true, type, message, onConfirm });
  const closeModal = () => setModal({ ...modal, isOpen: false });

  // Data
  const [dropdowns, setDropdowns] = useState<{ segments: any[], groups: any[], subjects: any[], tags: string[] }>({ segments: [], groups: [], subjects: [], tags: [] });
  const [createDropdowns, setCreateDropdowns] = useState<{ groups: any[], subjects: any[] }>({ groups: [], subjects: [] });
  // Filter Dropdowns
  const [filterGroupsList, setFilterGroupsList] = useState<any[]>([]);
  const [filterSubjectsList, setFilterSubjectsList] = useState<any[]>([]);

  // Main Form
  const [mainForm, setMainForm] = useState({
      segment: '', group: '', subject: '', tags: '',
      type: 'mcq' as QuestionType,
      text: '', 
      explanation: '',
      marks: 1
  });
  
  const [options, setOptions] = useState<Option[]>([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]);
  const [subQuestions, setSubQuestions] = useState<Question[]>([]);
  const [editingSubIndex, setEditingSubIndex] = useState<number | null>(null);
  
  const [subForm, setSubForm] = useState({ 
      isOpen: false, 
      type: 'mcq' as QuestionType, 
      text: '', 
      marks: 1, 
      explanation: '', 
      options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }] 
  });

  // Calculate hasMore
  const hasMore = (pagination.page + 1) * pagination.itemsPerPage < pagination.total;

  useEffect(() => {
      const loadInit = async () => {
          const { data: segs } = await supabase.from('segments').select('id, title');
          const { data: tagsData } = await supabase.from('question_bank').select('topic_tag').not('topic_tag', 'is', null);
          const uniqueTags = Array.from(new Set((tagsData || []).flatMap(d => (d.topic_tag || '').split(',').map((t: string) => t.trim()).filter(Boolean))));
          setDropdowns(prev => ({ ...prev, segments: segs || [], tags: uniqueTags }));
      };
      loadInit();
  }, []);

  const fetchQuestions = useCallback(async () => {
      setLoading(true);
      let query = supabase.from('question_bank').select('*, subjects(title)', { count: 'exact' }).is('parent_id', null).order('created_at', { ascending: false });
      
      if (filters.segment) query = query.eq('segment_id', filters.segment);
      if (filters.group) query = query.eq('group_id', filters.group);
      if (filters.subject) query = query.eq('subject_id', filters.subject);
      if (filters.type !== 'all') query = query.eq('question_type', filters.type);
      if (filters.topic) query = query.ilike('topic_tag', `%${filters.topic}%`);
      if (searchQuery) query = query.ilike('question_text', `%${searchQuery}%`);

      const from = pagination.page * pagination.itemsPerPage;
      const to = from + pagination.itemsPerPage - 1;
      query = query.range(from, to);

      const { data, count } = await query;
      if (data) {
          setQuestions(data);
          setPagination(prev => ({ ...prev, total: count || 0 }));
      }
      setLoading(false);
  }, [filters, searchQuery, pagination.page, pagination.itemsPerPage]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const loadGroups = async (segId: string, isFilter: boolean) => {
      const { data } = await supabase.from('groups').select('id, title').eq('segment_id', segId);
      if(isFilter) setFilterGroupsList(data || []);
      else setCreateDropdowns(prev => ({ ...prev, groups: data || [] }));
  };
  const loadSubjects = async (grpId: string, isFilter: boolean) => {
      const { data } = await supabase.from('subjects').select('id, title').eq('group_id', grpId);
      if(isFilter) setFilterSubjectsList(data || []);
      else setCreateDropdowns(prev => ({ ...prev, subjects: data || [] }));
  };

  // ... (Reset, Edit, Delete, Save Logic - Same as before, ensure no missing bracket) ...
  const handleReset = () => {
      setEditingId(null);
      setMainForm({ segment: '', group: '', subject: '', tags: '', type: 'mcq', text: '', explanation: '', marks: 1 });
      setOptions([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]);
      setSubQuestions([]);
      setSubForm({ isOpen: false, type: 'mcq', text: '', marks: 1, explanation: '', options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }] });
  };

  const handleEdit = async (q: any) => {
      setEditingId(q.id);
      setLoading(true);
      if(q.segment_id) await loadGroups(String(q.segment_id), false);
      if(q.group_id) await loadSubjects(String(q.group_id), false);
      setMainForm({
          segment: String(q.segment_id || ''), group: String(q.group_id || ''), subject: String(q.subject_id || ''), tags: q.topic_tag || '', type: q.question_type, text: q.question_text, explanation: q.explanation || '', marks: q.marks
      });
      if(q.question_type === 'mcq') {
          const { data } = await supabase.from('question_options').select('*').eq('question_id', q.id).order('order_index');
          setOptions(data || []);
      } else if (q.question_type === 'passage') {
          const { data } = await supabase.from('question_bank').select(`*, options:question_options(*)`).eq('parent_id', q.id).order('created_at', { ascending: true });
          const formatted = (data || []).map((s:any) => ({ ...s, options: s.options || [] }));
          setSubQuestions(formatted);
      }
      setLoading(false);
      setView('create');
  };

  const handleDelete = (id: string) => {
      showModal('confirm', "Delete this question?", async () => {
          setLoading(true);
          await supabase.from('question_bank').delete().eq('id', id);
          setQuestions(prev => prev.filter(q => q.id !== id));
          setLoading(false);
          closeModal();
      });
  };

  const openSubForm = (question?: Question, index?: number) => {
      if (question) {
          setSubForm({ isOpen: true, type: question.question_type, text: question.question_text, marks: question.marks, explanation: question.explanation, options: question.options && question.options.length ? question.options : [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }] });
          setEditingSubIndex(index !== undefined ? index : null);
      } else {
          setSubForm({ isOpen: true, type: 'mcq', text: '', marks: 1, explanation: '', options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }] });
          setEditingSubIndex(null);
      }
  };

  const saveSubQuestion = () => {
      if(!subForm.text) return;
      const newQ: Question = { question_text: subForm.text, question_type: subForm.type, marks: subForm.marks, explanation: subForm.explanation, options: subForm.type === 'mcq' ? [...subForm.options] : [] };
      if (editingSubIndex !== null) {
          const updated = [...subQuestions];
          updated[editingSubIndex] = { ...updated[editingSubIndex], ...newQ };
          setSubQuestions(updated);
      } else {
          setSubQuestions([...subQuestions, newQ]);
      }
      setSubForm(p => ({ ...p, isOpen: false }));
  };

  const handleSave = async () => {
      if(!mainForm.text) return showModal('error', 'Content text is required.');
      setLoading(true);
      try {
          const payload = {
              segment_id: mainForm.segment || null, group_id: mainForm.group || null, subject_id: mainForm.subject || null, topic_tag: mainForm.tags, question_type: mainForm.type, question_text: mainForm.text, marks: mainForm.type === 'passage' ? 0 : mainForm.marks, explanation: mainForm.explanation
          };
          let qId = editingId;
          if (qId) { await supabase.from('question_bank').update(payload).eq('id', qId); } 
          else { const { data } = await supabase.from('question_bank').insert(payload).select().single(); if(data) qId = data.id; }

          if (mainForm.type === 'mcq' && qId) {
              if (editingId) await supabase.from('question_options').delete().eq('question_id', qId);
              const opts = options.map((o, i) => ({ question_id: qId, option_text: o.option_text, is_correct: o.is_correct, order_index: i }));
              await supabase.from('question_options').insert(opts);
          }
          if (mainForm.type === 'passage' && qId) {
              if (editingId) {
                 const { data: old } = await supabase.from('question_bank').select('id').eq('parent_id', qId);
                 if(old?.length) await supabase.from('question_bank').delete().in('id', old.map(o=>o.id));
              }
              for (const sub of subQuestions) {
                  const { data: subQ } = await supabase.from('question_bank').insert({ parent_id: qId, question_text: sub.question_text, question_type: sub.question_type, marks: sub.marks, explanation: sub.explanation, segment_id: payload.segment_id, group_id: payload.group_id, subject_id: payload.subject_id }).select().single();
                  if(subQ && sub.question_type === 'mcq') {
                      const subOpts = sub.options.map((o, i) => ({ ...o, question_id: subQ.id, order_index: i }));
                      await supabase.from('question_options').insert(subOpts);
                  }
              }
          }
          showModal('success', 'Saved successfully!', () => { handleReset(); setView('list'); fetchQuestions(); closeModal(); });
      } catch (e: any) { showModal('error', e.message); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full font-sans text-slate-900 bg-slate-50/50">
       <CustomModal isOpen={modal.isOpen} type={modal.type} message={modal.message} onConfirm={modal.onConfirm} onCancel={closeModal} />

       {/* HEADER */}
       <div className="flex justify-between items-center mb-6 px-6 pt-6">
          <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Question Manager</h2>
              <p className="text-slate-500 text-xs font-medium mt-1">Manage, categorize, and organize your question bank.</p>
          </div>
          <div className="flex gap-3">
              {view === 'list' && <button onClick={() => { handleReset(); setView('create'); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 flex items-center gap-2 transition-all"><Plus size={18}/> New Question</button>}
              {view === 'create' && <button onClick={() => setView('list')} className="text-slate-500 font-bold hover:text-slate-800 text-sm flex items-center gap-1"><ChevronLeft size={16}/> Back to List</button>}
          </div>
       </div>

       {/* CREATE VIEW */}
       {view === 'create' && (
           <>
               <QuestionFormInternal
                   isSub={false} type={mainForm.type} setType={(t: QuestionType) => setMainForm(p => ({...p, type: t}))}
                   content={mainForm.text} setContent={(val: string) => setMainForm(p => ({...p, text: val}))}
                   marks={mainForm.marks} setMarks={(val: number) => setMainForm(p => ({...p, marks: val}))}
                   options={options} setOptions={setOptions}
                   explanation={mainForm.explanation} setExplanation={(val: string) => setMainForm(p => ({...p, explanation: val}))}
                   topicTag={mainForm.tags} setTopicTag={(val: string) => setMainForm(p => ({...p, tags: val}))}
                   uniqueTags={dropdowns.tags} dropdowns={dropdowns} createDropdowns={createDropdowns}
                   mainForm={mainForm} setMainForm={setMainForm}
                   handleCreateSegmentChange={(id: string) => loadGroups(id, false)}
                   handleCreateGroupChange={(id: string) => loadSubjects(id, false)}
               />
               {mainForm.type === 'passage' && (
                   <div className="flex-1 bg-slate-100 rounded-r-2xl border-l border-slate-200 flex flex-col md:w-1/2 overflow-hidden mx-6 mb-6">
                       <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white"><h3 className="font-bold text-slate-700 flex items-center gap-2"><Layers size={16}/> Questions ({subQuestions.length})</h3>{!subForm.isOpen && <button onClick={() => openSubForm()} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1"><Plus size={14}/> Add Question</button>}</div>
                       <div className="flex-1 overflow-y-auto p-4 space-y-4">
                           {!subForm.isOpen && subQuestions.map((sq, i) => (
                               <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group relative">
                                   <div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{sq.question_type} • {sq.marks} pts</span><div className="flex gap-2"><button onClick={() => openSubForm(sq, i)} className="text-slate-400 hover:text-indigo-600"><Edit3 size={14}/></button><button onClick={() => { const n = [...subQuestions]; n.splice(i, 1); setSubQuestions(n); }} className="text-slate-400 hover:text-red-600"><Trash2 size={14}/></button></div></div>
                                   <div className="text-sm text-slate-800 line-clamp-2" dangerouslySetInnerHTML={{__html: sq.question_text}}></div>
                               </div>
                           ))}
                           {subForm.isOpen && (
                               <div className="bg-white p-5 rounded-xl border-2 border-indigo-100 shadow-lg animate-in slide-in-from-bottom-2">
                                   <div className="flex justify-between mb-4"><div className="flex gap-2"><button onClick={() => setSubForm(p => ({...p, type: 'mcq'}))} className={`px-3 py-1 text-xs font-bold rounded border ${subForm.type === 'mcq' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-200'}`}>MCQ</button><button onClick={() => setSubForm(p => ({...p, type: 'descriptive'}))} className={`px-3 py-1 text-xs font-bold rounded border ${subForm.type === 'descriptive' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-200'}`}>Descriptive</button></div><button onClick={() => setSubForm(p => ({...p, isOpen: false}))}><X size={16} className="text-slate-400 hover:text-slate-600"/></button></div>
                                   <StableEditor uniqueKey={editingSubIndex !== null ? `sub-edit-${editingSubIndex}` : 'sub-new'} initialContent={subForm.text} onChange={val => setSubForm(p => ({...p, text: val}))} />
                                   <div className="mt-4 flex gap-4"><div className="flex-1"><label className="text-[10px] font-bold uppercase text-slate-400">Marks</label><input type="number" value={subForm.marks} onChange={e => setSubForm(p => ({...p, marks: Number(e.target.value)}))} className="w-full border rounded-lg p-2 text-sm font-bold mt-1"/></div></div>
                                   {subForm.type === 'mcq' && (<div className="mt-4 space-y-2">{subForm.options.map((opt, i) => (<div key={i} className="flex gap-2 items-center"><button onClick={() => { const n = [...subForm.options]; n.forEach(o => o.is_correct = false); n[i].is_correct = true; setSubForm(p => ({...p, options: n})); }} className={`p-1.5 rounded-full border ${opt.is_correct ? 'bg-green-500 text-white' : 'text-slate-300'}`}><CheckCircle size={14}/></button><input className="flex-1 border-b text-sm p-1 outline-none" value={opt.option_text} onChange={e => { const n = [...subForm.options]; n[i].option_text = e.target.value; setSubForm(p => ({...p, options: n})); }} placeholder={`Option ${i+1}`}/></div>))}<button onClick={() => setSubForm(p => ({...p, options: [...p.options, {option_text:'', is_correct:false}]}))} className="text-xs text-indigo-600 font-bold hover:underline">+ Option</button></div>)}
                                   <div className="mt-4 space-y-1"><label className="text-[10px] font-bold uppercase text-slate-400">Explanation</label><StableEditor uniqueKey={editingSubIndex !== null ? `sub-expl-${editingSubIndex}` : 'sub-expl-new'} initialContent={subForm.explanation} onChange={val => setSubForm(p => ({...p, explanation: val}))} /></div>
                                   <button onClick={saveSubQuestion} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 mt-4 shadow-md">{editingSubIndex !== null ? 'Update Question' : 'Add to Passage'}</button>
                               </div>
                           )}
                       </div>
                   </div>
               )}
               <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end sticky bottom-0 z-10"><button onClick={handleSave} disabled={loading} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg disabled:opacity-50 flex items-center gap-2">{loading ? <Loader2 className="animate-spin w-4 h-4"/> : <Save size={18}/>} Save Question</button></div>
           </>
       )}

       {/* LIST VIEW */}
       {view === 'list' && (
           <div className="flex flex-col md:flex-row gap-6 px-6 pb-6 overflow-hidden h-[calc(100vh-140px)]">
               {isSidebarOpen && (
                   <div className="w-64 flex-shrink-0 bg-white border border-slate-200 rounded-xl p-4 overflow-y-auto space-y-6 animate-in slide-in-from-left-4 h-full">
                       <div><h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Filters</h3><div className="space-y-3">
                              <select className="w-full border p-2 rounded-lg text-xs" value={filters.segment} onChange={e => { setFilters(p=>({...p, segment:e.target.value})); loadGroups(e.target.value, true); }}><option value="">All Segments</option>{dropdowns.segments.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
                              <select className="w-full border p-2 rounded-lg text-xs" value={filters.group} onChange={e => { setFilters(p=>({...p, group:e.target.value})); loadSubjects(e.target.value, true); }} disabled={!filters.segment}><option value="">All Groups</option>{filterGroupsList.map((g:any) => <option key={g.id} value={g.id}>{g.title}</option>)}</select>
                              <select className="w-full border p-2 rounded-lg text-xs" value={filters.subject} onChange={e => setFilters(p=>({...p, subject:e.target.value}))} disabled={!filters.group}><option value="">All Subjects</option>{filterSubjectsList.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
                              <select className="w-full border p-2 rounded-lg text-xs" value={filters.type} onChange={e => setFilters(p=>({...p, type:e.target.value}))}><option value="all">All Types</option><option value="mcq">MCQ</option><option value="passage">Passage</option><option value="descriptive">Descriptive</option></select>
                       </div></div>
                       <button onClick={() => { setFilters({segment:'',group:'',subject:'',type:'all',topic:''}); setSearchQuery(''); }} className="w-full py-2 text-xs font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Reset Filters</button>
                   </div>
               )}
               <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full">
                   <div className="p-3 border-b flex items-center gap-2 bg-slate-50/50"><Search className="w-4 h-4 text-slate-400 ml-2"/><input className="flex-1 bg-transparent text-sm outline-none" placeholder="Search questions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/></div>
                   <div className="flex-1 overflow-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 sticky top-0 z-10"><tr><th className="p-3 font-bold text-slate-500 text-xs uppercase w-12">#</th><th className="p-3 font-bold text-slate-500 text-xs uppercase">Question</th><th className="p-3 font-bold text-slate-500 text-xs uppercase w-32">Topic</th><th className="p-3 font-bold text-slate-500 text-xs uppercase w-24">Type</th><th className="p-3 font-bold text-slate-500 text-xs uppercase w-20 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{questions.map((q, i) => (<tr key={q.id} className="hover:bg-slate-50 group"><td className="p-3 text-xs text-slate-400 font-mono">{i + 1 + pagination.page * pagination.itemsPerPage}</td><td className="p-3"><div className="line-clamp-2 text-slate-800 font-medium" dangerouslySetInnerHTML={{__html: q.question_text}}/><div className="text-[10px] text-slate-400 mt-1">{q.subjects?.title}</div></td><td className="p-3"><div className="flex flex-wrap gap-1">{q.topic_tag?.split(',').slice(0, 2).map((t:string, idx:number) => <span key={idx} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{t}</span>)}</div></td><td className="p-3"><span className="text-[10px] uppercase font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{q.question_type}</span></td><td className="p-3 text-right"><div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleEdit(q)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Edit3 size={16}/></button><button onClick={() => handleDelete(q.id || '')} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={16}/></button></div></td></tr>))}</tbody></table></div>
                   <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs"><span className="text-slate-500">Page {pagination.page + 1}</span><div className="flex gap-2"><button onClick={() => setPagination(p => ({...p, page: Math.max(0, p.page - 1)}))} disabled={pagination.page === 0} className="px-3 py-1 bg-white border rounded disabled:opacity-50">Prev</button><button onClick={() => setPagination(p => ({...p, page: p.page + 1}))} disabled={!hasMore} className="px-3 py-1 bg-white border rounded disabled:opacity-50">Next</button></div></div>
               </div>
           </div>
       )}
    </div>
  );
}