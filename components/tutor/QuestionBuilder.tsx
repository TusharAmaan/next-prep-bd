"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, Plus, Trash2, Printer, Filter, FileText } from "lucide-react";
import { useReactToPrint } from "react-to-print";

// --- TYPES ---
interface Question {
  id: string;
  question_text: string;
  question_type: string;
  marks: number;
  options?: any[];
}

export default function QuestionBuilder() {
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [selSeg, setSelSeg] = useState("");
  const [selGrp, setSelGrp] = useState("");
  const [selSub, setSelSub] = useState("");
  const [search, setSearch] = useState("");

  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  // Paper Details
  const [paperTitle, setPaperTitle] = useState("Class Test");
  const [instituteName, setInstituteName] = useState("NextPrep Model Test");
  const [duration, setDuration] = useState("45 Mins");
  const [totalMarks, setTotalMarks] = useState(0);

  const printRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load (Segments)
  useEffect(() => {
    const loadSegments = async () => {
        const { data } = await supabase.from('segments').select('id, title');
        setSegments(data || []);
    };
    loadSegments();
  }, []);

  // 2. Cascading Dropdowns
  const loadGroups = async (segId: string) => {
    const { data } = await supabase.from('groups').select('id, title').eq('segment_id', segId);
    setGroups(data || []);
  };
  const loadSubjects = async (grpId: string) => {
    const { data } = await supabase.from('subjects').select('id, title').eq('group_id', grpId);
    setSubjects(data || []);
  };

  // 3. Search Questions
  const searchQuestions = async () => {
    setLoading(true);
    let query = supabase
      .from('question_bank')
      .select('id, question_text, question_type, marks, options:question_options(option_text)') // Fixed Join syntax
      .order('created_at', { ascending: false });

    if (selSeg) query = query.eq('segment_id', selSeg);
    if (selGrp) query = query.eq('group_id', selGrp);
    if (selSub) query = query.eq('subject_id', selSub);
    if (search) query = query.ilike('question_text', `%${search}%`);

    const { data, error } = await query.limit(50);
    
    if (error) console.error("Search error", error);
    else setAvailableQuestions(data || []);
    
    setLoading(false);
  };

  // 4. Add/Remove Logic
  const addToPaper = (q: Question) => {
    // Prevent duplicates
    if (selectedQuestions.some(item => item.id === q.id)) return;
    
    setSelectedQuestions(prev => [...prev, q]);
    setTotalMarks(prev => prev + (q.marks || 1));
  };

  const removeFromPaper = (id: string, marks: number) => {
    setSelectedQuestions(prev => prev.filter(q => q.id !== id));
    setTotalMarks(prev => Math.max(0, prev - (marks || 1)));
  };

  // 5. Print Handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: paperTitle,
  });

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 animate-in fade-in p-4">
      
      {/* === LEFT PANE: SHOP === */}
      <div className="w-full md:w-5/12 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
        <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Filter className="w-4 h-4"/> Question Bank</h3>
            <div className="grid grid-cols-3 gap-2">
                <select className="p-2 rounded border text-xs" onChange={e => { setSelSeg(e.target.value); loadGroups(e.target.value); }}><option value="">Segment</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                <select className="p-2 rounded border text-xs" onChange={e => { setSelGrp(e.target.value); loadSubjects(e.target.value); }}><option value="">Group</option>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                <select className="p-2 rounded border text-xs" onChange={e => setSelSub(e.target.value)}><option value="">Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
            </div>
            <div className="flex gap-2">
                <input className="flex-1 p-2 border rounded text-sm" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} />
                <button onClick={searchQuestions} className="bg-indigo-600 text-white px-4 rounded text-sm font-bold">Search</button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 bg-slate-50/50">
            {loading ? <div className="p-4 text-center text-slate-400">Loading...</div> : availableQuestions.map(q => (
                <div key={q.id} onClick={() => addToPaper(q)} className="bg-white p-3 mb-2 rounded-xl border border-slate-100 hover:border-indigo-500 cursor-pointer transition-all group relative">
                    <div className="text-xs font-bold text-slate-400 mb-1">{q.question_type} • {q.marks} Marks</div>
                    <div className="text-sm font-medium text-slate-800 line-clamp-2" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                    <div className="absolute top-2 right-2 bg-indigo-50 text-indigo-600 p-1 rounded opacity-0 group-hover:opacity-100"><Plus className="w-4 h-4"/></div>
                </div>
            ))}
        </div>
      </div>

      {/* === RIGHT PANE: PREVIEW & PRINT === */}
      <div className="w-full md:w-7/12 flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
            <div>
                <h3 className="font-bold text-slate-800">Exam Preview</h3>
                <p className="text-xs text-slate-500">{selectedQuestions.length} Questions • {totalMarks} Marks</p>
            </div>
            <button onClick={() => handlePrint()} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-700">
                <Printer className="w-4 h-4"/> Print PDF
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
            {/* PRINTABLE AREA */}
            <div ref={printRef} className="bg-white p-8 min-h-full w-full print:w-full print:p-0">
                
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <input className="w-full text-center text-2xl font-black mb-2 border-none outline-none placeholder:text-slate-300 print:placeholder:text-transparent" value={instituteName} onChange={e => setInstituteName(e.target.value)} placeholder="Institute Name"/>
                    <input className="w-full text-center text-lg font-bold mb-2 border-none outline-none placeholder:text-slate-300 print:placeholder:text-transparent" value={paperTitle} onChange={e => setPaperTitle(e.target.value)} placeholder="Exam Name"/>
                    <div className="flex justify-between font-bold text-sm px-4 mt-4">
                        <span>Time: {duration}</span>
                        <span>Total Marks: {totalMarks}</span>
                    </div>
                </div>

                {selectedQuestions.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl print:hidden">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2"/>
                        <p className="text-slate-400 font-bold">Paper is empty</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {selectedQuestions.map((q, idx) => (
                            <div key={q.id} className="relative group break-inside-avoid">
                                <div className="flex gap-4">
                                    <span className="font-bold">{idx + 1}.</span>
                                    <div className="flex-1">
                                        <div dangerouslySetInnerHTML={{__html: q.question_text}} className="font-medium text-black [&_p]:inline"></div>
                                        {/* Show options if MCQ */}
                                        {q.question_type === 'mcq' && q.options && (
                                            <div className="grid grid-cols-2 gap-2 mt-2 pl-2">
                                                {q.options.map((opt: any, i: number) => (
                                                    <div key={i} className="flex gap-2 text-sm">
                                                        <span className="font-bold">({String.fromCharCode(97 + i)})</span> {opt.option_text}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="font-bold text-xs border border-black px-2 py-0.5 rounded h-fit">{q.marks}</div>
                                </div>
                                <button onClick={() => removeFromPaper(q.id, q.marks)} className="absolute -left-8 top-0 text-red-500 opacity-0 group-hover:opacity-100 print:hidden p-1 hover:bg-red-50 rounded">
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}