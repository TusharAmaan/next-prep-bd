"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Plus, Trash2, Save, CheckCircle, 
  ChevronDown, ChevronRight, FileText, 
  HelpCircle, BookOpen, AlertCircle,
  Search, Filter, X, ChevronLeft, Edit3 
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
              <button 
                onClick={onCancel}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50 text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 text-sm"
              >
                Confirm
              </button>
            </>
          ) : (
            <button 
              onClick={onCancel} // Reuse onCancel to close success/error alerts
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 text-sm"
            >
              Okay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 10;

export default function QuestionBankManager() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [questions, setQuestions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

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
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // --- DROPDOWN DATA ---
  const [segments, setSegments] = useState<any[]>([]);
  const [filterGroupsList, setFilterGroupsList] = useState<any[]>([]);
  const [filterSubjectsList, setFilterSubjectsList] = useState<any[]>([]);
  const [createGroupsList, setCreateGroupsList] = useState<any[]>([]);
  const [createSubjectsList, setCreateSubjectsList] = useState<any[]>([]);

  // --- FORM STATE ---
  const [selSegment, setSelSegment] = useState<string>('');
  const [selGroup, setSelGroup] = useState<string>('');
  const [selSubject, setSelSubject] = useState<string>('');
  const [topicTag, setTopicTag] = useState('');
  
  const [qType, setQType] = useState<QuestionType>('mcq');
  
  // *** FIX #2 & #3: SEPARATE STATE ***
  const [passageText, setPassageText] = useState(''); // Holds the Story
  const [qText, setQText] = useState('');             // Holds the Question Text
  
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
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [page, filterSegment, filterGroup, filterSubject, searchQuery]);

  // --- FETCHERS ---
  const fetchQuestions = async () => {
    setLoading(true);
    let query = supabase
      .from('question_bank')
      .select('*, subjects(title)', { count: 'exact' })
      .is('parent_id', null) 
      .order('created_at', { ascending: false });

    if (filterSegment) query = query.eq('segment_id', filterSegment);
    if (filterGroup) query = query.eq('group_id', filterGroup);
    if (filterSubject) query = query.eq('subject_id', filterSubject);
    if (searchQuery) query = query.or(`question_text.ilike.%${searchQuery}%,topic_tag.ilike.%${searchQuery}%`);

    const from = page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (!error) {
        setQuestions(data || []);
        setHasMore((count || 0) > to + 1);
    }
    setLoading(false);
  };

  const fetchSegments = async () => {
    const { data } = await supabase.from('segments').select('id, title');
    if (data) setSegments(data);
  };

  // Helper for cascading dropdowns
  const loadGroups = async (segId: string, setFn: Function) => {
    const { data } = await supabase.from('groups').select('id, title').eq('segment_id', segId);
    setFn(data || []);
  };
  const loadSubjects = async (grpId: string, setFn: Function) => {
    const { data } = await supabase.from('subjects').select('id, title').eq('group_id', grpId);
    setFn(data || []);
  };

  // --- HANDLERS ---
  const handleFilterSegmentChange = (val: string) => {
    setFilterSegment(val); setFilterGroup(''); setFilterSubject(''); setPage(0);
    if(val) loadGroups(val, setFilterGroupsList); 
  };
  const handleFilterGroupChange = (val: string) => {
    setFilterGroup(val); setFilterSubject(''); setPage(0);
    if(val) loadSubjects(val, setFilterSubjectsList);
  };

  const handleCreateSegmentChange = (val: string) => {
    setSelSegment(val); setSelGroup(''); setSelSubject('');
    if(val) loadGroups(val, setCreateGroupsList);
  };
  const handleCreateGroupChange = (val: string) => {
    setSelGroup(val); setSelSubject('');
    if(val) loadSubjects(val, setCreateSubjectsList);
  };

  // --- *** FIX #1: EDIT HANDLER *** ---
  const handleEdit = async (q: any) => {
    setEditingId(q.id);
    setLoading(true);
    
    // 1. Populate Basic Fields
    setSelSegment(q.segment_id ? String(q.segment_id) : '');
    if(q.segment_id) await loadGroups(q.segment_id, setCreateGroupsList);
    
    setSelGroup(q.group_id ? String(q.group_id) : '');
    if(q.group_id) await loadSubjects(q.group_id, setCreateSubjectsList);
    
    setSelSubject(q.subject_id ? String(q.subject_id) : '');
    setTopicTag(q.topic_tag || '');
    setQType(q.question_type);

    // 2. Populate Content based on Type
    if (q.question_type === 'passage') {
        setPassageText(q.question_text);
        
        // Fetch sub-questions
        const { data: subs } = await supabase
            .from('question_bank')
            .select(`*, options:question_options(*)`)
            .eq('parent_id', q.id)
            .order('created_at', { ascending: true });
            
        // Map DB structure to UI structure
        const formattedSubs: Question[] = (subs || []).map((s: any) => ({
            id: s.id,
            question_text: s.question_text,
            question_type: s.question_type,
            marks: s.marks,
            explanation: s.explanation || '',
            options: s.options || []
        }));
        setSubQuestions(formattedSubs);
    } else {
        // Standard Question
        setQText(q.question_text);
        setMarks(q.marks);
        setExplanation(q.explanation || '');
        
        if (q.question_type === 'mcq') {
            const { data: opts } = await supabase
                .from('question_options')
                .select('*')
                .eq('question_id', q.id)
                .order('order_index');
            setOptions(opts || []);
        }
    }
    
    setLoading(false);
    setView('create');
  };

  // --- SUB-QUESTION LOGIC ---
  const handleAddSubQuestion = () => {
    const newSub: Question = {
      question_text: qText,
      question_type: qType === 'passage' ? 'mcq' : qType, // Fallback if type not switched
      marks: marks,
      explanation: explanation,
      options: (qType === 'mcq' || (qType === 'passage' && options.length > 0)) ? [...options] : []
    };
    
    setSubQuestions([...subQuestions, newSub]);
    
    // Reset Question Form, NOT Passage Form
    setQText('');
    setExplanation('');
    setOptions([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]);
    setIsAddingSub(false); 
  };

  // --- SAVE HANDLER ---
  const handleSaveToBank = async () => {
    // Validate
    const mainContent = qType === 'passage' ? passageText : qText;
    if (!mainContent && !isAddingSub) {
        showModal('error', "Please enter content text.");
        return;
    }
    
    setLoading(true);

    try {
        let parentId = editingId;

        // A. Insert/Update Parent
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

        // B. Handle Options (for standalone MCQ)
        if (qType === 'mcq' && parentId) {
            // Delete old options if editing
            if (editingId) await supabase.from('question_options').delete().eq('question_id', editingId);
            
            const opts = options.map((o, i) => ({
                question_id: parentId,
                option_text: o.option_text,
                is_correct: o.is_correct,
                order_index: i
            }));
            await supabase.from('question_options').insert(opts);
        }

        // C. Handle Sub-Questions (for Passage)
        if (qType === 'passage' && parentId && subQuestions.length > 0) {
            // If editing, we might want a smarter diff, but simple approach:
            // Delete all old sub-questions and re-insert (easiest for consistency)
            // CAUTION: This changes IDs. For a production app, update existing IDs.
            // For now, let's delete old children to avoid dupes.
            if (editingId) {
                // Get IDs of children to delete
                const { data: children } = await supabase.from('question_bank').select('id').eq('parent_id', editingId);
                const childIds = children?.map(c => c.id) || [];
                if(childIds.length) await supabase.from('question_bank').delete().in('id', childIds);
            }

            for (const sub of subQuestions) {
                const { data: subQ, error: subError } = await supabase
                    .from('question_bank')
                    .insert({
                        parent_id: parentId,
                        question_text: sub.question_text,
                        question_type: sub.question_type,
                        marks: sub.marks,
                        explanation: sub.explanation,
                        // Inherit hierarchy
                        segment_id: selSegment ? Number(selSegment) : null,
                        group_id: selGroup ? Number(selGroup) : null,
                        subject_id: selSubject ? Number(selSubject) : null,
                    }).select().single();

                if (subError) throw subError;

                if (sub.question_type === 'mcq' && sub.options) {
                    const subOpts = sub.options.map((o, i) => ({
                        question_id: subQ.id,
                        option_text: o.option_text,
                        is_correct: o.is_correct,
                        order_index: i
                    }));
                    await supabase.from('question_options').insert(subOpts);
                }
            }
        }

        showModal('success', editingId ? "Question updated!" : "Saved to Question Bank!", () => {
            resetAll();
            fetchQuestions();
            setView('list');
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
  };

  // --- RENDER FORM HELPER ---
  const renderQuestionForm = (isSub: boolean = false) => (
    <div className={`space-y-6 ${isSub ? 'bg-indigo-50/50 p-4 rounded-xl border border-indigo-100' : ''}`}>
       
       {/* A. Type Selector */}
       <div className="flex gap-3">
          {(!isSub || view === 'create') && (
             <div className="flex bg-slate-100 p-1 rounded-lg">
                {!isSub && (
                    <button onClick={() => setQType('passage')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${qType === 'passage' ? 'bg-white shadow text-purple-700' : 'text-slate-500'}`}>Passage</button>
                )}
                <button onClick={() => setQType('mcq')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${qType === 'mcq' ? 'bg-white shadow text-indigo-700' : 'text-slate-500'}`}>MCQ</button>
                <button onClick={() => setQType('descriptive')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${qType === 'descriptive' ? 'bg-white shadow text-indigo-700' : 'text-slate-500'}`}>Descriptive</button>
             </div>
          )}
       </div>

       {/* B. Text Editor - KEY FIX #3: Unique Keys */}
       <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
             {qType === 'passage' && !isSub ? 'Passage / Story Text' : 'Question Text'}
          </label>
          {qType === 'passage' && !isSub ? (
             <RichTextEditor 
                key="passage-editor" // Unique Key
                initialValue={passageText} 
                onChange={setPassageText} 
             />
          ) : (
             <RichTextEditor 
                key={isSub ? "sub-q-editor" : "main-q-editor"} // Unique Key
                initialValue={qText} 
                onChange={setQText} 
             />
          )}
       </div>

       {/* C. MCQ Options */}
       {qType === 'mcq' && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
             <label className="text-xs font-bold uppercase text-slate-400">Answer Options</label>
             {options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                   <button onClick={() => {
                        const newOpts = [...options]; newOpts.forEach(o => o.is_correct = false); newOpts[i].is_correct = true; setOptions(newOpts);
                      }} className={`p-2 rounded-lg border transition ${opt.is_correct ? 'bg-green-100 border-green-400 text-green-700' : 'bg-white border-slate-200 text-slate-300'}`}>
                      <CheckCircle size={20} />
                   </button>
                   <input value={opt.option_text} onChange={(e) => { const newOpts = [...options]; newOpts[i].option_text = e.target.value; setOptions(newOpts); }} className="flex-1 border p-2 rounded-lg text-sm" placeholder={`Option ${i+1}`} />
                   <button onClick={() => { const newOpts = [...options]; newOpts.splice(i, 1); setOptions(newOpts); }} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
             ))}
             <button onClick={() => setOptions([...options, { option_text: '', is_correct: false }])} className="text-xs font-bold text-indigo-600 flex items-center gap-1"><Plus size={14}/> Add Option</button>
          </div>
       )}

       {/* D. Marks & Explanation */}
       {(qType !== 'passage' || isSub) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Marks</label><input type="number" value={marks} onChange={e => setMarks(Number(e.target.value))} className="w-full border p-2 rounded-lg" /></div>
             <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Explanation</label><input value={explanation} onChange={e => setExplanation(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="Shown after student answers..." /></div>
          </div>
       )}

       {/* E. Sub Actions */}
       {isSub && (
          <div className="flex justify-end gap-2">
             <button onClick={() => setIsAddingSub(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
             <button onClick={handleAddSubQuestion} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700">Add Question</button>
          </div>
       )}
    </div>
  );

  return (
    <div className="space-y-6">
       
       <CustomModal 
          isOpen={modalState.isOpen} 
          type={modalState.type} 
          message={modalState.message} 
          onConfirm={modalState.onConfirm}
          onCancel={closeModal}
       />

       {/* HEADER */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Question Bank</h2>
            <p className="text-sm text-slate-500">Manage {questions.length}+ questions</p>
          </div>
          {view === 'list' ? (
             <button onClick={() => { resetAll(); setView('create'); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 flex items-center gap-2 transition-transform active:scale-95">
                <Plus size={20}/> Create New
             </button>
          ) : (
             <button onClick={() => { setView('list'); resetAll(); }} className="text-slate-500 font-bold hover:text-slate-800">Cancel</button>
          )}
       </div>

       {/* CREATE VIEW */}
       {view === 'create' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
             <div className="bg-slate-50 p-6 grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-slate-100">
                <select className="border p-2 rounded-lg text-sm" onChange={e => handleCreateSegmentChange(e.target.value)} value={selSegment}>
                   <option value="">Select Segment...</option>
                   {segments.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                <select className="border p-2 rounded-lg text-sm" onChange={e => handleCreateGroupChange(e.target.value)} disabled={!selSegment} value={selGroup}>
                   <option value="">Select Group...</option>
                   {createGroupsList.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
                <select className="border p-2 rounded-lg text-sm" onChange={e => setSelSubject(e.target.value)} disabled={!selGroup} value={selSubject}>
                   <option value="">Select Subject...</option>
                   {createSubjectsList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                <input placeholder="Topic Tag (e.g. Algebra)" className="border p-2 rounded-lg text-sm" value={topicTag} onChange={e => setTopicTag(e.target.value)} />
             </div>

             <div className="p-6">
                {/* Main Form: Hide if adding sub-question to avoid confusion, OR show as read-only context */}
                {!isAddingSub && renderQuestionForm(false)}

                {/* Passage Sub-Questions Section */}
                {qType === 'passage' && (
                   <div className="mt-8 border-t pt-8">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><BookOpen size={20} className="text-purple-600"/>Passage Questions</h3>
                      
                      <div className="space-y-3 mb-6">
                         {subQuestions.length === 0 && !isAddingSub && <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">No questions added yet.</div>}
                         {subQuestions.map((sq, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex justify-between items-start">
                               <div>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${sq.question_type === 'mcq' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{sq.question_type}</span>
                                  <p className="font-bold text-slate-800 mt-1 line-clamp-1" dangerouslySetInnerHTML={{__html: sq.question_text}}></p>
                               </div>
                               <button onClick={() => { 
                                   showModal('confirm', "Delete this sub-question?", () => {
                                      const newSub = [...subQuestions]; newSub.splice(idx, 1); setSubQuestions(newSub); closeModal();
                                   });
                               }} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                            </div>
                         ))}
                      </div>

                      {/* Add Sub-Question Wrapper */}
                      {isAddingSub ? (
                         <div className="bg-slate-50 p-6 rounded-2xl border border-indigo-100 shadow-inner">
                            <h4 className="font-bold text-indigo-900 mb-4">New Sub-Question</h4>
                            {renderQuestionForm(true)}
                         </div>
                      ) : (
                         <button onClick={() => { 
                             setIsAddingSub(true); 
                             // Reset Sub-Question Form State
                             setQType('mcq'); 
                             setQText(''); 
                             setExplanation('');
                             setOptions([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]); 
                         }} className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 flex justify-center items-center gap-2"><Plus size={18}/> Add Question to Passage</button>
                      )}
                   </div>
                )}
             </div>
             
             {/* Footer Actions */}
             <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end">
                <button onClick={handleSaveToBank} disabled={loading || isAddingSub} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 disabled:opacity-50 disabled:shadow-none">
                    {loading ? "Saving..." : (editingId ? "Update Question" : "Save to Question Bank")}
                </button>
             </div>
          </div>
       )}

       {/* LIST VIEW */}
       {view === 'list' && (
          <div className="space-y-4">
             {/* [Filter Bar code remains same as before...] */}
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                    <input className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none" placeholder="Search text or topic..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                {/* [Dropdowns code remains same...] */}
                <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                    <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white outline-none min-w-[140px]" value={filterSegment} onChange={(e) => handleFilterSegmentChange(e.target.value)}>
                        <option value="">All Segments</option>
                        {segments.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                    {/* ... other selects ... */}
                </div>
             </div>

             <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold">
                       <tr><th className="px-6 py-4">Content</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Subject</th><th className="px-6 py-4 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {loading ? (
                          <tr><td colSpan={4} className="p-12 text-center text-slate-400">Loading questions...</td></tr>
                       ) : questions.length === 0 ? (
                          <tr><td colSpan={4} className="p-12 text-center text-slate-400"><p className="font-bold text-slate-600 mb-1">No questions found.</p><p className="text-xs">Try adjusting your filters.</p></td></tr>
                       ) : (
                          questions.map((q) => (
                             <tr key={q.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 max-w-lg">
                                   <div className="font-bold text-slate-800 line-clamp-1" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                                   <div className="flex gap-2 mt-1.5">
                                       {q.topic_tag && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{q.topic_tag}</span>}
                                       {q.question_type === 'passage' && <span className="text-[10px] bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded text-purple-600 flex items-center gap-1"><BookOpen size={10} /> Reading Passage</span>}
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${q.question_type === 'passage' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{q.question_type}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{q.subjects?.title || '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleEdit(q)} // *** FIX #1: ADDED CLICK HANDLER ***
                                        className="text-indigo-600 font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                                    >
                                        <Edit3 size={14} /> Edit
                                    </button>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
             </div>

             {/* Pagination */}
             <div className="flex justify-between items-center px-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading} className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-indigo-600 disabled:opacity-50"><ChevronLeft size={16} /> Previous</button>
                <span className="text-xs font-medium text-slate-400">Page {page + 1}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={!hasMore || loading} className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-indigo-600 disabled:opacity-50">Next <ChevronRight size={16} /></button>
             </div>
          </div>
       )}

    </div>
  );
}