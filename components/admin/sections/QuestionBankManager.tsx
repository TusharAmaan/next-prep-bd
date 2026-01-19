"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Plus, Trash2, Save, CheckCircle, 
  ChevronDown, ChevronRight, FileText, 
  HelpCircle, BookOpen, AlertCircle,
  Search, Filter, X, ChevronLeft, Edit3,
  MoreHorizontal, LayoutGrid, List as ListIcon,
  Tag, Layers, Hash
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
}

// --- CUSTOM MODAL COMPONENT ---
function CustomModal({ isOpen, type, message, onConfirm, onCancel }: { 
  isOpen: boolean; 
  type: 'success' | 'error' | 'confirm'; 
  message: string; 
  onConfirm?: () => void; 
  onCancel?: () => void; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100">
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
          type === 'success' ? 'bg-green-100 text-green-600' : 
          type === 'error' ? 'bg-red-100 text-red-600' : 
          'bg-amber-100 text-amber-600'
        }`}>
          {type === 'success' && <CheckCircle size={24} />}
          {type === 'error' && <AlertCircle size={24} />}
          {type === 'confirm' && <HelpCircle size={24} />}
        </div>
        
        <h3 className={`text-lg font-bold mb-2 ${
          type === 'success' ? 'text-green-700' : 
          type === 'error' ? 'text-red-700' : 
          'text-slate-800'
        }`}>
          {type === 'success' ? 'Success!' : type === 'error' ? 'Error' : 'Confirm Action'}
        </h3>
        
        <p className="text-slate-600 mb-6 text-sm">{message}</p>
        
        <div className="flex gap-3 justify-center">
          {type === 'confirm' ? (
            <>
              <button onClick={onCancel} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50 text-sm">Cancel</button>
              <button onClick={onConfirm} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 text-sm">Confirm</button>
            </>
          ) : (
            <button onClick={onCancel} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 text-sm">Okay</button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- TAG INPUT COMPONENT ---
const TagInput = ({ value, onChange, suggestions }: { value: string, onChange: (val: string) => void, suggestions: string[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s !== value);

    return (
        <div className="relative">
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <div className="pl-3 text-slate-400"><Tag size={16}/></div>
                <input 
                    className="w-full p-2.5 text-sm outline-none font-medium text-slate-700 placeholder:text-slate-400"
                    placeholder="e.g. Algebra, Newton's Laws..."
                    value={value}
                    onChange={e => { onChange(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                />
            </div>
            {isOpen && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
                    {filtered.map(tag => (
                        <button 
                            key={tag} 
                            onClick={() => onChange(tag)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function QuestionBankManager() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [questions, setQuestions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For filter sidebar

  // --- MODAL STATE ---
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'confirm';
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'success', message: '' });

  const showModal = (type: 'success' | 'error' | 'confirm', message: string, onConfirm?: () => void) => {
    setModalState({ isOpen: true, type, message, onConfirm });
  };
  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  // --- FILTER & PAGINATION STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSegment, setFilterSegment] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterTopic, setFilterTopic] = useState(""); // Powerful Topic Filter
  const [filterType, setFilterType] = useState<string>("all"); // MCQ/Descriptive etc.
  
  const [itemsPerPage, setItemsPerPage] = useState(20); // Default to 20 for density
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // --- DROPDOWN DATA ---
  const [segments, setSegments] = useState<any[]>([]);
  const [filterGroupsList, setFilterGroupsList] = useState<any[]>([]);
  const [filterSubjectsList, setFilterSubjectsList] = useState<any[]>([]);
  const [uniqueTags, setUniqueTags] = useState<string[]>([]);

  // Creation Dropdowns
  const [createGroupsList, setCreateGroupsList] = useState<any[]>([]);
  const [createSubjectsList, setCreateSubjectsList] = useState<any[]>([]);

  // --- FORM STATE ---
  const [selSegment, setSelSegment] = useState<string>('');
  const [selGroup, setSelGroup] = useState<string>('');
  const [selSubject, setSelSubject] = useState<string>('');
  const [topicTag, setTopicTag] = useState('');
  
  const [qType, setQType] = useState<QuestionType>('mcq'); 
  const [subQType, setSubQType] = useState<QuestionType>('mcq');
  
  const [passageText, setPassageText] = useState(''); 
  const [qText, setQText] = useState('');             
  
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState<Option[]>([
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
  ]);

  // --- SUB-QUESTION STATE ---
  const [subQuestions, setSubQuestions] = useState<Question[]>([]);
  const [isAddingSub, setIsAddingSub] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => { 
      fetchSegments(); 
      fetchUniqueTags(); 
  }, []);
  
  useEffect(() => { 
      fetchQuestions(); 
  }, [page, itemsPerPage, filterSegment, filterGroup, filterSubject, filterTopic, filterType, searchQuery]);

  // --- FETCHERS ---
  const fetchQuestions = async () => {
    setLoading(true);
    let query = supabase.from('question_bank').select('*, subjects(title)', { count: 'exact' }).is('parent_id', null).order('created_at', { ascending: false });
    
    if (filterSegment) query = query.eq('segment_id', filterSegment);
    if (filterGroup) query = query.eq('group_id', filterGroup);
    if (filterSubject) query = query.eq('subject_id', filterSubject);
    if (filterTopic) query = query.eq('topic_tag', filterTopic);
    if (filterType !== 'all') query = query.eq('question_type', filterType);
    
    if (searchQuery) query = query.or(`question_text.ilike.%${searchQuery}%,topic_tag.ilike.%${searchQuery}%`);
    
    const from = page * itemsPerPage;
    const to = from + itemsPerPage - 1;
    
    query = query.range(from, to);
    const { data, count, error } = await query;
    if (!error) { 
        setQuestions(data || []); 
        setTotalCount(count || 0);
        setHasMore((count || 0) > to + 1); 
    }
    setLoading(false);
  };

  const fetchSegments = async () => { const { data } = await supabase.from('segments').select('id, title'); if (data) setSegments(data); };
  
  const fetchUniqueTags = async () => {
      const { data } = await supabase.from('question_bank').select('topic_tag').not('topic_tag', 'is', null);
      if (data) {
          const tags = Array.from(new Set(data.map(item => item.topic_tag).filter(Boolean)));
          setUniqueTags(tags as string[]);
      }
  };

  const loadGroups = async (segId: string, setFn: Function) => { const { data } = await supabase.from('groups').select('id, title').eq('segment_id', segId); setFn(data || []); };
  const loadSubjects = async (grpId: string, setFn: Function) => { const { data } = await supabase.from('subjects').select('id, title').eq('group_id', grpId); setFn(data || []); };

  // --- HANDLERS ---
  const handleFilterSegmentChange = (val: string) => { setFilterSegment(val); setFilterGroup(''); setFilterSubject(''); setPage(0); if(val) loadGroups(val, setFilterGroupsList); };
  const handleFilterGroupChange = (val: string) => { setFilterGroup(val); setFilterSubject(''); setPage(0); if(val) loadSubjects(val, setFilterSubjectsList); };
  const handleCreateSegmentChange = (val: string) => { setSelSegment(val); setSelGroup(''); setSelSubject(''); if(val) loadGroups(val, setCreateGroupsList); };
  const handleCreateGroupChange = (val: string) => { setSelGroup(val); setSelSubject(''); if(val) loadSubjects(val, setCreateSubjectsList); };

  const handleEdit = async (q: any) => {
    setEditingId(q.id);
    setLoading(true);
    setSelSegment(q.segment_id ? String(q.segment_id) : '');
    if(q.segment_id) await loadGroups(q.segment_id, setCreateGroupsList);
    setSelGroup(q.group_id ? String(q.group_id) : '');
    if(q.group_id) await loadSubjects(q.group_id, setCreateSubjectsList);
    setSelSubject(q.subject_id ? String(q.subject_id) : '');
    setTopicTag(q.topic_tag || '');
    setQType(q.question_type);

    if (q.question_type === 'passage') {
        setPassageText(q.question_text);
        const { data: subs } = await supabase.from('question_bank').select(`*, options:question_options(*)`).eq('parent_id', q.id).order('created_at', { ascending: true });
        const formattedSubs: Question[] = (subs || []).map((s: any) => ({
            id: s.id, question_text: s.question_text, question_type: s.question_type, marks: s.marks, explanation: s.explanation || '', options: s.options || []
        }));
        setSubQuestions(formattedSubs);
    } else {
        setQText(q.question_text);
        setMarks(q.marks);
        setExplanation(q.explanation || '');
        if (q.question_type === 'mcq') {
            const { data: opts } = await supabase.from('question_options').select('*').eq('question_id', q.id).order('order_index');
            setOptions(opts || []);
        }
    }
    setLoading(false);
    setView('create');
  };

  const handleDelete = (id: string) => {
    showModal('confirm', "Are you sure you want to delete this question? This cannot be undone.", async () => {
        setLoading(true);
        const { error } = await supabase.from('question_bank').delete().eq('id', id);
        
        if (error) {
            showModal('error', "Failed to delete question: " + error.message);
        } else {
            setQuestions(questions.filter(q => q.id !== id));
            showModal('success', "Question deleted successfully.");
            fetchUniqueTags(); 
        }
        setLoading(false);
        closeModal();
    });
  };

  const handleAddSubQuestion = () => {
    if (!qText) return showModal('error', "Please enter a question.");
    
    const newSub: Question = {
      question_text: qText,
      question_type: subQType, 
      marks: marks,
      explanation: explanation,
      options: subQType === 'mcq' ? [...options] : []
    };
    
    setSubQuestions([...subQuestions, newSub]);
    setQText('');
    setExplanation('');
    setOptions([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]);
    setIsAddingSub(false); 
  };

  const handleSaveToBank = async () => {
    const mainContent = qType === 'passage' ? passageText : qText;
    if (!mainContent && !isAddingSub) return showModal('error', "Please enter content text.");
    
    setLoading(true);
    try {
        let parentId = editingId;
        const payload = {
            segment_id: selSegment ? Number(selSegment) : null,
            group_id: selGroup ? Number(selGroup) : null,
            subject_id: selSubject ? Number(selSubject) : null,
            topic_tag: topicTag,
            question_type: qType,
            question_text: mainContent,
            marks: qType === 'passage' ? 0 : marks, 
            explanation: qType === 'passage' ? '' : explanation
        };

        if (editingId) {
            const { error } = await supabase.from('question_bank').update(payload).eq('id', editingId);
            if (error) throw error;
        } else {
            const { data, error } = await supabase.from('question_bank').insert(payload).select().single();
            if (error) throw error;
            parentId = data.id;
        }

        if (qType === 'mcq' && parentId) {
            if (editingId) await supabase.from('question_options').delete().eq('question_id', editingId);
            const opts = options.map((o, i) => ({ question_id: parentId, option_text: o.option_text, is_correct: o.is_correct, order_index: i }));
            await supabase.from('question_options').insert(opts);
        }

        if (qType === 'passage' && parentId && subQuestions.length > 0) {
            if (editingId) {
                const { data: children } = await supabase.from('question_bank').select('id').eq('parent_id', editingId);
                const childIds = children?.map(c => c.id) || [];
                if(childIds.length) await supabase.from('question_bank').delete().in('id', childIds);
            }
            for (const sub of subQuestions) {
                const { data: subQ, error: subError } = await supabase.from('question_bank').insert({
                        parent_id: parentId,
                        question_text: sub.question_text,
                        question_type: sub.question_type,
                        marks: sub.marks,
                        explanation: sub.explanation,
                        segment_id: selSegment ? Number(selSegment) : null,
                        group_id: selGroup ? Number(selGroup) : null,
                        subject_id: selSubject ? Number(selSubject) : null,
                    }).select().single();
                if (subError) throw subError;
                if (sub.question_type === 'mcq' && sub.options) {
                    const subOpts = sub.options.map((o, i) => ({ question_id: subQ.id, option_text: o.option_text, is_correct: o.is_correct, order_index: i }));
                    await supabase.from('question_options').insert(subOpts);
                }
            }
        }
        
        showModal('success', editingId ? "Question updated!" : "Saved to Question Bank!", () => {
            resetAll();
            closeModal(); 
            setView('list'); 
            fetchQuestions(); 
            fetchUniqueTags(); 
        });

    } catch (err: any) {
        showModal('error', err.message);
    } finally {
        setLoading(false);
    }
  };

  const resetAll = () => {
    setEditingId(null);
    setQText('');
    setPassageText('');
    setExplanation('');
    setOptions([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]);
    setSubQuestions([]);
    setIsAddingSub(false);
    setQType('mcq');
    setSubQType('mcq');
  };

  // --- RENDER FORM HELPER (With Rich Text Editor & Auto Height) ---
  const renderQuestionForm = (isSub: boolean = false) => (
    <div className={`space-y-6 ${isSub ? 'bg-indigo-50/50 p-6 rounded-xl border border-indigo-100' : ''}`}>
       
       {/* 1. TYPE SELECTOR */}
       <div className="flex justify-between items-center">
          {(!isSub || view === 'create') && (
             <div className="flex bg-slate-100 p-1 rounded-lg">
                {!isSub && (
                    <button onClick={() => setQType('passage')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${qType === 'passage' ? 'bg-white shadow text-purple-700' : 'text-slate-500'}`}>Passage</button>
                )}
                <button onClick={() => setQType('mcq')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${qType === 'mcq' ? 'bg-white shadow text-indigo-700' : 'text-slate-500'}`}>MCQ</button>
                <button onClick={() => setQType('descriptive')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${qType === 'descriptive' ? 'bg-white shadow text-indigo-700' : 'text-slate-500'}`}>Descriptive</button>
             </div>
          )}
          
          {/* Topic Tag in Editor */}
          {!isSub && (
              <div className="w-64">
                  <TagInput value={topicTag} onChange={setTopicTag} suggestions={uniqueTags} />
              </div>
          )}
       </div>

       {/* 2. QUESTION EDITOR */}
       <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
             {qType === 'passage' && !isSub ? 'Passage Content' : 'Question Content'}
          </label>
          <div className="min-h-[150px] border border-slate-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-shadow"> 
              {qType === 'passage' && !isSub ? (
                 <RichTextEditor key="passage-main" initialValue={passageText} onChange={setPassageText} />
              ) : (
                 <RichTextEditor key={isSub ? "sub-q-editor" : "main-q-editor"} initialValue={qText} onChange={setQText} />
              )}
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Marks */}
          {(qType !== 'passage' || isSub) && (
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Marks</label>
                  <input 
                    type="number" 
                    value={marks} 
                    onChange={e => setMarks(Number(e.target.value))} 
                    className="w-full border border-slate-200 p-2.5 rounded-lg text-sm font-bold text-center focus:ring-2 focus:ring-indigo-100 outline-none" 
                  />
              </div>
          )}
       </div>

       {/* 3. MCQ OPTIONS */}
       {qType === 'mcq' && (
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
             <label className="text-xs font-bold uppercase text-slate-400">Answer Options</label>
             <div className="grid grid-cols-1 gap-3">
                 {options.map((opt, i) => (
                    <div key={i} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                       <button onClick={() => {
                           const newOpts = [...options]; newOpts.forEach(o => o.is_correct = false); newOpts[i].is_correct = true; setOptions(newOpts);
                         }} className={`p-2 rounded-lg border transition ${opt.is_correct ? 'bg-green-100 border-green-400 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                          <CheckCircle size={18} />
                       </button>
                       <input value={opt.option_text} onChange={(e) => { const newOpts = [...options]; newOpts[i].option_text = e.target.value; setOptions(newOpts); }} className="flex-1 border-none outline-none bg-transparent text-sm font-medium" placeholder={`Option ${i+1}`} />
                       <button onClick={() => { const newOpts = [...options]; newOpts.splice(i, 1); setOptions(newOpts); }} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                    </div>
                 ))}
             </div>
             <button onClick={() => setOptions([...options, { option_text: '', is_correct: false }])} className="text-xs font-bold text-indigo-600 flex items-center gap-1 mt-2 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"><Plus size={14}/> Add Option</button>
          </div>
       )}

       {/* 4. EXPLANATION */}
       {(qType !== 'passage' || isSub) && (
          <div className="space-y-2">
             <label className="block text-xs font-bold text-slate-500 uppercase">Explanation (Optional)</label>
             <div className="min-h-[100px] border border-slate-200 rounded-xl bg-white overflow-hidden">
                <RichTextEditor initialValue={explanation} onChange={setExplanation} />
             </div>
          </div>
       )}

       {/* 5. SUB-QUESTION ACTIONS */}
       {isSub && (
          <div className="flex justify-end gap-2 pt-4 border-t border-indigo-200">
             <button onClick={() => setIsAddingSub(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors text-xs">Cancel</button>
             <button onClick={handleAddSubQuestion} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-all text-xs">Add to Passage</button>
          </div>
       )}
    </div>
  );

  // --- RENDER COMPONENT ---
  return (
    <div className="flex flex-col h-full">
       <CustomModal isOpen={modalState.isOpen} type={modalState.type} message={modalState.message} onConfirm={modalState.onConfirm} onCancel={closeModal} />

       {/* HEADER BAR */}
       <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200">
          <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Question Bank</h2>
              <p className="text-xs font-medium text-slate-500 mt-1">
                  {totalCount} Questions • {page + 1} of {Math.ceil(totalCount / itemsPerPage) || 1} Pages
              </p>
          </div>
          {view === 'list' ? (
             <div className="flex gap-3">
                 <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                     <Filter size={16}/> {isSidebarOpen ? 'Hide Filters' : 'Show Filters'}
                 </button>
                 <button onClick={() => { resetAll(); setView('create'); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 flex items-center gap-2 transition-transform active:scale-95 text-sm">
                    <Plus size={18}/> New Question
                 </button>
             </div>
          ) : (
             <button onClick={() => { setView('list'); resetAll(); }} className="text-slate-500 font-bold hover:text-slate-800 text-sm flex items-center gap-1"><ChevronLeft size={16}/> Back to List</button>
          )}
       </div>

       {/* CREATE VIEW */}
       {view === 'create' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4">
             <div className="bg-slate-50 p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Segment</label>
                    <select className="w-full border p-2 rounded-lg text-sm bg-white" onChange={e => handleCreateSegmentChange(e.target.value)} value={selSegment}><option value="">Select Segment...</option>{segments.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Group</label>
                    <select className="w-full border p-2 rounded-lg text-sm bg-white" onChange={e => handleCreateGroupChange(e.target.value)} disabled={!selSegment} value={selGroup}><option value="">Select Group...</option>{createGroupsList.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}</select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Subject</label>
                    <select className="w-full border p-2 rounded-lg text-sm bg-white" onChange={e => setSelSubject(e.target.value)} disabled={!selGroup} value={selSubject}><option value="">Select Subject...</option>{createSubjectsList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
                </div>
             </div>

             <div className="p-8 max-w-5xl mx-auto">
                {/* Main Form */}
                {!isAddingSub && renderQuestionForm(false)}

                {/* Passage Sub-Questions */}
                {qType === 'passage' && (
                   <div className="mt-8 border-t border-slate-100 pt-8">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><BookOpen size={20} className="text-purple-600"/>Passage Questions</h3>
                          {!isAddingSub && (
                             <button onClick={() => { 
                                 setIsAddingSub(true); 
                                 setQType('mcq'); 
                                 setQText(''); 
                                 setExplanation('');
                                 setOptions([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]); 
                             }} className="px-4 py-2 border-2 border-dashed border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 flex items-center gap-2 text-xs transition-colors"><Plus size={16}/> Add Question</button>
                          )}
                      </div>
                      
                      <div className="space-y-3 mb-6">
                         {subQuestions.length === 0 && !isAddingSub && <div className="text-center p-8 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm italic">No questions added to this passage yet.</div>}
                         {subQuestions.map((sq, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex justify-between items-start hover:shadow-md transition-shadow group">
                               <div className="flex gap-3">
                                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500">{idx + 1}</span>
                                  <div>
                                     <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${sq.question_type === 'mcq' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{sq.question_type}</span>
                                     <p className="font-bold text-slate-800 mt-1 line-clamp-1 text-sm" dangerouslySetInnerHTML={{__html: sq.question_text}}></p>
                                  </div>
                               </div>
                               <button onClick={() => { 
                                  showModal('confirm', "Delete this sub-question?", () => {
                                     const newSub = [...subQuestions]; newSub.splice(idx, 1); setSubQuestions(newSub); closeModal();
                                  });
                               }} className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={16}/></button>
                            </div>
                         ))}
                      </div>

                      {isAddingSub && (
                         <div className="animate-in fade-in slide-in-from-bottom-4 bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100">
                            <h4 className="font-bold text-indigo-900 mb-4 px-2">New Sub-Question</h4>
                            {renderQuestionForm(true)}
                         </div>
                      )}
                   </div>
                )}
             </div>
             
             <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-between items-center sticky bottom-0 z-10">
                <div className="text-xs text-slate-400 font-medium italic">
                    {editingId ? `Editing Question ID: ${editingId}` : "Drafting New Question"}
                </div>
                <button onClick={handleSaveToBank} disabled={loading || isAddingSub} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95 text-sm flex items-center gap-2">
                   {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18}/>}
                   {editingId ? "Update Question" : "Save to Bank"}
                </button>
             </div>
          </div>
       )}

       {/* LIST VIEW (Data Grid) */}
       {view === 'list' && (
          <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]">
             
             {/* FILTERS SIDEBAR */}
             {isSidebarOpen && (
                 <div className="w-full md:w-64 flex-shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm p-4 overflow-y-auto space-y-6 animate-in slide-in-from-left-4 h-full">
                     <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Hierarchy</h3>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500">Segment</label>
                                <select className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-slate-50 focus:bg-white outline-none" value={filterSegment} onChange={(e) => handleFilterSegmentChange(e.target.value)}><option value="">All Segments</option>{segments.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500">Group</label>
                                <select className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-slate-50 focus:bg-white outline-none" value={filterGroup} onChange={(e) => handleFilterGroupChange(e.target.value)} disabled={!filterSegment}><option value="">All Groups</option>{filterGroupsList.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}</select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500">Subject</label>
                                <select className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-slate-50 focus:bg-white outline-none" value={filterSubject} onChange={(e) => { setFilterSubject(e.target.value); setPage(0); }} disabled={!filterGroup}><option value="">All Subjects</option>{filterSubjectsList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
                            </div>
                        </div>
                     </div>

                     <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Attributes</h3>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500">Topic</label>
                                <select className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-slate-50 focus:bg-white outline-none" value={filterTopic} onChange={(e) => { setFilterTopic(e.target.value); setPage(0); }}>
                                    <option value="">All Topics</option>
                                    {uniqueTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500">Type</label>
                                <select className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-slate-50 focus:bg-white outline-none" value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(0); }}>
                                    <option value="all">All Types</option>
                                    <option value="mcq">MCQ</option>
                                    <option value="passage">Passage</option>
                                    <option value="descriptive">Descriptive</option>
                                </select>
                            </div>
                        </div>
                     </div>

                     <button onClick={() => { setFilterSegment(''); setFilterGroup(''); setFilterSubject(''); setFilterTopic(''); setSearchQuery(''); setFilterType('all'); }} className="w-full py-2 text-xs font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                        Reset Filters
                     </button>
                 </div>
             )}

             {/* MAIN TABLE AREA */}
             <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-full">
                 {/* Toolbar */}
                 <div className="p-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none bg-white" placeholder="Search question text..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                        <select 
                            className="border border-slate-200 rounded-lg px-2 py-2 text-xs bg-white outline-none font-medium text-slate-600"
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(0); }}
                        >
                            <option value={20}>20 Rows</option>
                            <option value={50}>50 Rows</option>
                            <option value={100}>100 Rows</option>
                        </select>
                    </div>
                 </div>

                 {/* Table */}
                 <div className="flex-1 overflow-auto relative">
                     <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                           <tr>
                              <th className="px-4 py-3 border-b border-slate-200 font-bold text-slate-500 text-xs uppercase w-10">#</th>
                              <th className="px-4 py-3 border-b border-slate-200 font-bold text-slate-500 text-xs uppercase w-[50%]">Question</th>
                              <th className="px-4 py-3 border-b border-slate-200 font-bold text-slate-500 text-xs uppercase">Topic</th>
                              <th className="px-4 py-3 border-b border-slate-200 font-bold text-slate-500 text-xs uppercase">Type</th>
                              <th className="px-4 py-3 border-b border-slate-200 font-bold text-slate-500 text-xs uppercase">Subject</th>
                              <th className="px-4 py-3 border-b border-slate-200 font-bold text-slate-500 text-xs uppercase text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {loading ? (
                              <tr><td colSpan={6} className="p-20 text-center text-slate-400">Loading data...</td></tr>
                           ) : questions.length === 0 ? (
                              <tr><td colSpan={6} className="p-20 text-center text-slate-400 flex flex-col items-center"><LayoutGrid size={48} className="mb-4 opacity-20"/>No questions match your criteria.</td></tr>
                           ) : (
                              questions.map((q, i) => (
                                 <tr key={q.id} className="hover:bg-indigo-50/30 transition-colors group">
                                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">{page * itemsPerPage + i + 1}</td>
                                    <td className="px-4 py-3">
                                       <div className="font-medium text-slate-800 line-clamp-2 text-sm leading-relaxed" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                                    </td>
                                    <td className="px-4 py-3">
                                       {q.topic_tag ? (
                                           <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                               {q.topic_tag}
                                           </span>
                                       ) : <span className="text-slate-300 text-xs">-</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                       <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                           q.question_type === 'passage' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                           q.question_type === 'mcq' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                           'bg-amber-50 text-amber-700 border-amber-100'
                                       }`}>
                                           {q.question_type}
                                       </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500 font-medium truncate max-w-[150px]" title={q.subjects?.title}>
                                        {q.subjects?.title || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(q)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit"><Edit3 size={16}/></button>
                                            <button onClick={() => handleDelete(q.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                 </tr>
                              ))
                           )}
                        </tbody>
                     </table>
                 </div>

                 {/* Pagination Footer */}
                 <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">Page {page + 1}</span>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Previous</button>
                        <button onClick={() => setPage(p => p + 1)} disabled={!hasMore || loading} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Next</button>
                    </div>
                 </div>
             </div>
          </div>
       )}

    </div>
  );
}