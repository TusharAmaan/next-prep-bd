"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Plus, Trash2, Save, CheckCircle, 
  ChevronDown, ChevronRight, FileText, 
  HelpCircle, BookOpen, AlertCircle,
  Search, Filter, X, ChevronLeft // Added icons for filters/pagination
} from "lucide-react";
import RichTextEditor from "@/components/shared/RichTextEditor";

// --- TYPES ---
type QuestionType = 'mcq' | 'descriptive' | 'passage';

interface Option {
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
  sub_questions?: Question[]; 
}

const ITEMS_PER_PAGE = 10; // Define pagination limit

export default function QuestionBankManager() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [questions, setQuestions] = useState<any[]>([]);

  // --- FILTER & PAGINATION STATE (NEW) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSegment, setFilterSegment] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // --- DROPDOWN DATA STATE ---
  const [segments, setSegments] = useState<any[]>([]);
  
  // Separate arrays for Filters vs Create Form to avoid conflicts
  const [filterGroupsList, setFilterGroupsList] = useState<any[]>([]);
  const [filterSubjectsList, setFilterSubjectsList] = useState<any[]>([]);
  
  const [createGroupsList, setCreateGroupsList] = useState<any[]>([]);
  const [createSubjectsList, setCreateSubjectsList] = useState<any[]>([]);

  // --- CREATE FORM STATE ---
  const [selSegment, setSelSegment] = useState<string>('');
  const [selGroup, setSelGroup] = useState<string>('');
  const [selSubject, setSelSubject] = useState<string>('');
  const [topicTag, setTopicTag] = useState('');
  
  const [qType, setQType] = useState<QuestionType>('mcq');
  const [qText, setQText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState<Option[]>([
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
  ]);

  // --- PASSAGE BUILDER STATE ---
  const [subQuestions, setSubQuestions] = useState<Question[]>([]);
  const [isAddingSub, setIsAddingSub] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchSegments();
  }, []);

  // Trigger fetch when filters or page changes
  useEffect(() => {
    fetchQuestions();
  }, [page, filterSegment, filterGroup, filterSubject, searchQuery]);

  // --- FETCHERS ---
  const fetchQuestions = async () => {
    setLoading(true);
    
    // 1. Base Query
    let query = supabase
      .from('question_bank')
      .select('*, subjects(title)', { count: 'exact' }) // Get count for pagination
      .is('parent_id', null) 
      .order('created_at', { ascending: false });

    // 2. Apply Filters
    if (filterSegment) query = query.eq('segment_id', filterSegment);
    if (filterGroup) query = query.eq('group_id', filterGroup);
    if (filterSubject) query = query.eq('subject_id', filterSubject);
    
    // 3. Apply Search (Text or Topic)
    if (searchQuery) {
        query = query.or(`question_text.ilike.%${searchQuery}%,topic_tag.ilike.%${searchQuery}%`);
    }

    // 4. Apply Pagination
    const from = page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    
    if (error) {
        console.error("Fetch error:", error);
    } else {
        setQuestions(data || []);
        setHasMore((count || 0) > to + 1);
    }
    setLoading(false);
  };

  const fetchSegments = async () => {
    const { data } = await supabase.from('segments').select('id, title');
    if (data) setSegments(data);
  };

  // --- CASCADING DROPDOWNS HELPERS ---
  const loadGroups = async (segId: string, setFn: Function) => {
    const { data } = await supabase.from('groups').select('id, title').eq('segment_id', segId);
    setFn(data || []);
  };

  const loadSubjects = async (grpId: string, setFn: Function) => {
    const { data } = await supabase.from('subjects').select('id, title').eq('group_id', grpId);
    setFn(data || []);
  };

  // --- HANDLERS FOR FILTERS ---
  const handleFilterSegmentChange = (val: string) => {
    setFilterSegment(val); setFilterGroup(''); setFilterSubject(''); setPage(0);
    if(val) loadGroups(val, setFilterGroupsList); 
  };
  const handleFilterGroupChange = (val: string) => {
    setFilterGroup(val); setFilterSubject(''); setPage(0);
    if(val) loadSubjects(val, setFilterSubjectsList);
  };

  // --- HANDLERS FOR CREATE FORM ---
  const handleCreateSegmentChange = (val: string) => {
    setSelSegment(val); setSelGroup(''); setSelSubject('');
    if(val) loadGroups(val, setCreateGroupsList);
  };
  const handleCreateGroupChange = (val: string) => {
    setSelGroup(val); setSelSubject('');
    if(val) loadSubjects(val, setCreateSubjectsList);
  };

  // --- SUB-QUESTION LOGIC ---
  const handleAddSubQuestion = () => {
    const newSub: Question = {
      question_text: qText,
      question_type: qType,
      marks: marks,
      explanation: explanation,
      options: qType === 'mcq' ? [...options] : []
    };
    setSubQuestions([...subQuestions, newSub]);
    setQText('');
    setExplanation('');
    setOptions([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]);
    setIsAddingSub(false); 
  };

  // --- MAIN SAVE HANDLER ---
  const handleSaveToBank = async () => {
    if (!qText && view === 'create' && !isAddingSub) return alert("Please enter question/passage text.");
    setLoading(true);

    try {
        const { data: parent, error: parentError } = await supabase
            .from('question_bank')
            .insert({
                segment_id: selSegment ? Number(selSegment) : null,
                group_id: selGroup ? Number(selGroup) : null,
                subject_id: selSubject ? Number(selSubject) : null,
                topic_tag: topicTag,
                question_type: qType === 'passage' ? 'passage' : qType,
                question_text: qText,
                marks: qType === 'passage' ? 0 : marks, 
                explanation: explanation
            })
            .select().single();

        if (parentError) throw parentError;

        if (qType === 'mcq') {
            const opts = options.map((o, i) => ({
                question_id: parent.id,
                option_text: o.option_text,
                is_correct: o.is_correct,
                order_index: i
            }));
            await supabase.from('question_options').insert(opts);
        }

        if (qType === 'passage' && subQuestions.length > 0) {
            for (const sub of subQuestions) {
                const { data: subQ, error: subError } = await supabase
                    .from('question_bank')
                    .insert({
                        parent_id: parent.id,
                        question_text: sub.question_text,
                        question_type: sub.question_type,
                        marks: sub.marks,
                        explanation: sub.explanation,
                        segment_id: selSegment ? Number(selSegment) : null,
                        group_id: selGroup ? Number(selGroup) : null,
                        subject_id: selSubject ? Number(selSubject) : null,
                    }).select().single();

                if (subError) throw subError;

                if (sub.question_type === 'mcq') {
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

        alert("Saved to Question Bank!");
        resetAll();
        fetchQuestions(); // Refresh list to see new item
        setView('list');

    } catch (err: any) {
        alert("Error: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const resetAll = () => {
    setQText('');
    setExplanation('');
    setOptions([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]);
    setSubQuestions([]);
    setIsAddingSub(false);
  };

  // --- RENDER FORM HELPER ---
  const renderQuestionForm = (isSub: boolean = false) => (
    <div className={`space-y-6 ${isSub ? 'bg-indigo-50/50 p-4 rounded-xl border border-indigo-100' : ''}`}>
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
       <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">{qType === 'passage' && !isSub ? 'Passage / Story Text' : 'Question Text'}</label>
          <RichTextEditor initialValue={qText} onChange={setQText} />
       </div>
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
       {(qType !== 'passage' || isSub) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Marks</label><input type="number" value={marks} onChange={e => setMarks(Number(e.target.value))} className="w-full border p-2 rounded-lg" /></div>
             <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Explanation</label><input value={explanation} onChange={e => setExplanation(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="Shown after student answers..." /></div>
          </div>
       )}
       {isSub && (
          <div className="flex justify-end gap-2">
             <button onClick={() => setIsAddingSub(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
             <button onClick={handleAddSubQuestion} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700">Add to Passage</button>
          </div>
       )}
    </div>
  );

  return (
    <div className="space-y-6">
       
       {/* HEADER & ACTIONS */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Question Bank</h2>
            <p className="text-sm text-slate-500">Manage {questions.length}+ questions</p>
          </div>
          {view === 'list' ? (
             <button onClick={() => setView('create')} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 flex items-center gap-2 transition-transform active:scale-95">
                <Plus size={20}/> Create New
             </button>
          ) : (
             <button onClick={() => { setView('list'); resetAll(); }} className="text-slate-500 font-bold hover:text-slate-800">Cancel</button>
          )}
       </div>

       {/* CREATE VIEW */}
       {view === 'create' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             {/* Use Create-specific handlers here */}
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
                {!isAddingSub && renderQuestionForm(false)}
                {qType === 'passage' && (
                   <div className="mt-8 border-t pt-8">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><BookOpen size={20} className="text-purple-600"/>Passage Questions</h3>
                      <div className="space-y-3 mb-6">
                         {subQuestions.length === 0 && !isAddingSub && <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">No questions added yet.</div>}
                         {subQuestions.map((sq, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex justify-between items-start">
                               <div>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${sq.question_type === 'mcq' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{sq.question_type}</span>
                                  <p className="font-bold text-slate-800 mt-1" dangerouslySetInnerHTML={{__html: sq.question_text}}></p>
                               </div>
                               <button onClick={() => { const newSub = [...subQuestions]; newSub.splice(idx, 1); setSubQuestions(newSub); }} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                            </div>
                         ))}
                      </div>
                      {isAddingSub ? (
                         <div className="bg-slate-50 p-6 rounded-2xl border border-indigo-100 shadow-inner">
                            <h4 className="font-bold text-indigo-900 mb-4">New Sub-Question</h4>
                            {renderQuestionForm(true)}
                         </div>
                      ) : (
                         <button onClick={() => { setIsAddingSub(true); setQType('mcq'); setQText(''); setOptions([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]); }} className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 flex justify-center items-center gap-2"><Plus size={18}/> Add Question to Passage</button>
                      )}
                   </div>
                )}
             </div>
             <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end">
                <button onClick={handleSaveToBank} disabled={loading || isAddingSub} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 disabled:opacity-50 disabled:shadow-none">{loading ? "Saving..." : "Save to Question Bank"}</button>
             </div>
          </div>
       )}

       {/* LIST VIEW (Enhanced with Filters & Pagination) */}
       {view === 'list' && (
          <div className="space-y-4">
             {/* FILTER BAR */}
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                    <input className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none" placeholder="Search text or topic..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                    <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white outline-none min-w-[140px]" value={filterSegment} onChange={(e) => handleFilterSegmentChange(e.target.value)}>
                        <option value="">All Segments</option>
                        {segments.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                    <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white outline-none min-w-[140px]" value={filterGroup} onChange={(e) => handleFilterGroupChange(e.target.value)} disabled={!filterSegment}>
                        <option value="">All Groups</option>
                        {filterGroupsList.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>
                    <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white outline-none min-w-[140px]" value={filterSubject} onChange={(e) => { setFilterSubject(e.target.value); setPage(0); }} disabled={!filterGroup}>
                        <option value="">All Subjects</option>
                        {filterSubjectsList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                    {(filterSegment || searchQuery) && (
                        <button onClick={() => { setFilterSegment(''); setFilterGroup(''); setFilterSubject(''); setSearchQuery(''); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Clear Filters"><X size={18} /></button>
                    )}
                </div>
             </div>

             {/* DATA TABLE */}
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
                                <td className="px-6 py-4 text-right"><button className="text-indigo-600 font-bold hover:underline">Edit</button></td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
             </div>

             {/* PAGINATION CONTROLS */}
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