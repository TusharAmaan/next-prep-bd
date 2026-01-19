"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, Plus, Trash2, Printer, ChevronRight, 
  Filter, FileText, ArrowRight, Save
} from "lucide-react";
import { useReactToPrint } from "react-to-print";

// --- TYPES ---
interface Question {
  id: string;
  question_text: string;
  question_type: string;
  marks: number;
  options?: any[];
  explanation?: string;
  parent_id?: string;
}

export default function QuestionBuilder() {
  // --- STATE: FILTERS ---
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [selSeg, setSelSeg] = useState("");
  const [selGrp, setSelGrp] = useState("");
  const [selSub, setSelSub] = useState("");
  const [search, setSearch] = useState("");

  // --- STATE: QUESTIONS ---
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  // --- STATE: PAPER DETAILS ---
  const [paperTitle, setPaperTitle] = useState("Weekly Class Test");
  const [instituteName, setInstituteName] = useState("NextPrep Model Test");
  const [duration, setDuration] = useState("45 Minutes");
  const [totalMarks, setTotalMarks] = useState(0);

  // --- REFS ---
  const printRef = useRef<HTMLDivElement>(null);

  // --- LOAD FILTERS ---
  useEffect(() => {
    const fetchSegments = async () => {
      const { data } = await supabase.from('segments').select('id, title');
      setSegments(data || []);
    };
    fetchSegments();
  }, []);

  const fetchGroups = async (segId: string) => {
    const { data } = await supabase.from('groups').select('id, title').eq('segment_id', segId);
    setGroups(data || []);
  };

  const fetchSubjects = async (grpId: string) => {
    const { data } = await supabase.from('subjects').select('id, title').eq('group_id', grpId);
    setSubjects(data || []);
  };

  // --- SEARCH QUESTIONS ---
  const searchQuestions = async () => {
    setLoading(true);
    let query = supabase
      .from('question_bank')
      .select('id, question_text, question_type, marks, options(id, option_text)')
      .is('parent_id', null) // Only main questions
      .order('created_at', { ascending: false });

    if (selSeg) query = query.eq('segment_id', selSeg);
    if (selGrp) query = query.eq('group_id', selGrp);
    if (selSub) query = query.eq('subject_id', selSub);
    if (search) query = query.ilike('question_text', `%${search}%`);

    const { data } = await query.limit(50);
    setAvailableQuestions(data || []);
    setLoading(false);
  };

  // --- HANDLERS ---
  const addToPaper = (q: Question) => {
    if (selectedQuestions.find(i => i.id === q.id)) return; // No duplicates
    setSelectedQuestions([...selectedQuestions, q]);
    setTotalMarks(prev => prev + (q.marks || 1));
  };

  const removeFromPaper = (id: string, marks: number) => {
    setSelectedQuestions(prev => prev.filter(q => q.id !== id));
    setTotalMarks(prev => Math.max(0, prev - (marks || 1)));
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${paperTitle.replace(/\s+/g, '-')}-ExamPaper`,
  });

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 animate-in fade-in">
      
      {/* === LEFT PANE: QUESTION BANK SHOP === */}
      <div className="w-full md:w-5/12 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
        
        {/* Header Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Filter className="w-4 h-4"/> Question Bank
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
                <select className="p-2 rounded-lg text-xs border border-slate-200 bg-white" onChange={(e) => { setSelSeg(e.target.value); fetchGroups(e.target.value); }}>
                    <option value="">All Segments</option>
                    {segments.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                <select className="p-2 rounded-lg text-xs border border-slate-200 bg-white" onChange={(e) => { setSelGrp(e.target.value); fetchSubjects(e.target.value); }} disabled={!selSeg}>
                    <option value="">All Groups</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
                <select className="p-2 rounded-lg text-xs border border-slate-200 bg-white" onChange={(e) => setSelSub(e.target.value)} disabled={!selGrp}>
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2 text-slate-400 w-4 h-4" />
                    <input 
                        className="w-full pl-8 pr-4 py-1.5 rounded-lg border border-slate-200 text-sm" 
                        placeholder="Search topic or keyword..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchQuestions()}
                    />
                </div>
                <button onClick={searchQuestions} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700">Find</button>
            </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 bg-slate-50/50 custom-scrollbar">
            {loading ? <div className="text-center p-8 text-slate-400 text-sm">Searching...</div> : 
             availableQuestions.length === 0 ? <div className="text-center p-8 text-slate-400 text-sm">No questions found. Try filtering.</div> :
             availableQuestions.map(q => (
                <div key={q.id} className="bg-white p-3 mb-2 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group relative cursor-pointer" onClick={() => addToPaper(q)}>
                    <div className="pr-8">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-1 flex gap-2">
                            <span>{q.question_type}</span> • <span>{q.marks} Marks</span>
                        </div>
                        <div className="text-sm font-medium text-slate-800 line-clamp-2" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                    </div>
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-50 text-indigo-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4"/>
                    </button>
                </div>
             ))
            }
        </div>
      </div>

      {/* === RIGHT PANE: THE PAPER PREVIEW === */}
      <div className="w-full md:w-7/12 flex flex-col h-full">
        
        {/* Actions Header */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4 flex justify-between items-center">
            <div>
                <h2 className="font-bold text-slate-800">Exam Paper Builder</h2>
                <p className="text-xs text-slate-500">{selectedQuestions.length} Questions Selected</p>
            </div>
            <button 
                onClick={() => handlePrint()} 
                disabled={selectedQuestions.length === 0}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:shadow-none"
            >
                <Printer className="w-4 h-4"/> Download PDF
            </button>
        </div>

        {/* Paper Canvas (The Printable Area) */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-inner overflow-y-auto custom-scrollbar p-8 relative">
            
            {/* --- PRINTABLE CONTENT START --- */}
            <div ref={printRef} className="bg-white min-h-full print:p-8 print:w-full">
                
                {/* Paper Header (Editable Inputs visible on screen, Text on print) */}
                <div className="text-center border-b-2 border-black pb-6 mb-8">
                    <input 
                        value={instituteName} 
                        onChange={(e) => setInstituteName(e.target.value)}
                        className="w-full text-center text-2xl font-black text-black border-none outline-none focus:bg-slate-50 placeholder:text-slate-300 mb-2 print:hidden" 
                        placeholder="Enter Institute Name"
                    />
                    <h1 className="hidden print:block text-3xl font-black text-black mb-2 uppercase">{instituteName}</h1>

                    <input 
                        value={paperTitle} 
                        onChange={(e) => setPaperTitle(e.target.value)}
                        className="w-full text-center text-lg font-bold text-slate-600 border-none outline-none focus:bg-slate-50 placeholder:text-slate-300 print:hidden" 
                        placeholder="Enter Exam Name"
                    />
                    <h2 className="hidden print:block text-xl font-bold text-black mb-4">{paperTitle}</h2>

                    <div className="flex justify-between text-sm font-bold text-black mt-4 px-4">
                        <div className="flex gap-2 items-center">
                            <span>Time:</span>
                            <input value={duration} onChange={e => setDuration(e.target.value)} className="w-24 border-b border-black text-center outline-none print:hidden"/>
                            <span className="hidden print:inline">{duration}</span>
                        </div>
                        <div>Total Marks: {totalMarks}</div>
                    </div>
                </div>

                {/* Questions List */}
                {selectedQuestions.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl print:hidden">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3"/>
                        <p className="text-slate-400 font-bold">Your paper is empty.</p>
                        <p className="text-xs text-slate-400">Add questions from the left panel.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {selectedQuestions.map((q, idx) => (
                            <div key={q.id} className="relative group break-inside-avoid">
                                <div className="flex gap-4">
                                    <span className="font-bold text-black">{idx + 1}.</span>
                                    <div className="flex-1">
                                        {/* Question Text */}
                                        <div 
                                            className="text-black font-medium [&_p]:mb-1 [&_img]:max-w-[200px] [&_img]:h-auto"
                                            dangerouslySetInnerHTML={{__html: q.question_text}}
                                        ></div>
                                        
                                        {/* Options (if MCQ) */}
                                        {q.question_type === 'mcq' && q.options && (
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 pl-2">
                                                {q.options.map((opt, i) => (
                                                    <div key={i} className="flex gap-2 items-center text-sm text-black">
                                                        <div className="w-4 h-4 rounded-full border border-black flex items-center justify-center text-[10px] font-bold">
                                                            {String.fromCharCode(65 + i)}
                                                        </div>
                                                        <span>{opt.option_text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Marks Display */}
                                        <div className="text-right mt-1">
                                            <span className="text-xs font-bold text-black border border-black px-2 py-0.5 rounded">
                                                {q.marks}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Remove Button (Hidden on Print) */}
                                <button 
                                    onClick={() => removeFromPaper(q.id, q.marks)}
                                    className="absolute -right-2 -top-2 bg-red-100 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden hover:bg-red-200"
                                    title="Remove Question"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Print Footer */}
                <div className="hidden print:block mt-12 pt-4 border-t border-black text-center text-xs">
                    Generated by <b>{instituteName}</b> using NextPrepBD Platform.
                </div>
            </div>
            {/* --- PRINTABLE CONTENT END --- */}

        </div>
      </div>
    </div>
  );
}