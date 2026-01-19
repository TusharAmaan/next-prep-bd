"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, Plus, Trash2, Printer, Filter, 
  FileText, Crown, Settings, GripVertical, 
  Download, RefreshCw, XCircle, CheckCircle
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Editor } from "@tinymce/tinymce-react";

// --- TYPES ---
interface Question {
  id: string;
  question_text: string;
  question_type: string;
  marks: number;
  options?: any[];
}

interface UserProfile {
  subscription_plan: 'free' | 'trial' | 'pro';
  institute_name?: string;
}

export default function QuestionBuilder() {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Data
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  
  // Filters
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selSeg, setSelSeg] = useState("");
  const [selGrp, setSelGrp] = useState("");
  const [selSub, setSelSub] = useState("");
  const [search, setSearch] = useState("");

  // Paper Settings
  const [paperTitle, setPaperTitle] = useState("Monthly Assessment");
  const [instituteName, setInstituteName] = useState("NextPrep Model Test"); // Default
  const [duration, setDuration] = useState("45 Mins");
  const [totalMarks, setTotalMarks] = useState(0);
  const [instructions, setInstructions] = useState("<ul><li>Answer all questions.</li><li>No electronic devices allowed.</li></ul>");
  
  // Pro Features State
  const [showWatermark, setShowWatermark] = useState(true);
  const [paperSize, setPaperSize] = useState("A4");

  const printRef = useRef<HTMLDivElement>(null);

  // --- 1. INITIAL LOAD (Auth & Segments) ---
  useEffect(() => {
    const init = async () => {
        // Get User Plan
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: prof } = await supabase.from('profiles').select('subscription_plan, institute_name').eq('id', user.id).single();
            setProfile(prof);
            // Auto-fill institute name for Pro users
            if (prof && (prof.subscription_plan === 'pro' || prof.subscription_plan === 'trial') && prof.institute_name) {
                setInstituteName(prof.institute_name);
            }
        }

        // Load Segments
        const { data } = await supabase.from('segments').select('id, title');
        setSegments(data || []);
    };
    init();
  }, []);

  // --- 2. LOGIC ---
  const loadGroups = async (segId: string) => {
    const { data } = await supabase.from('groups').select('id, title').eq('segment_id', segId);
    setGroups(data || []);
  };
  const loadSubjects = async (grpId: string) => {
    const { data } = await supabase.from('subjects').select('id, title').eq('group_id', grpId);
    setSubjects(data || []);
  };

  const searchQuestions = async () => {
    setLoading(true);
    let query = supabase
      .from('question_bank')
      .select('id, question_text, question_type, marks, options:question_options(option_text)')
      .order('created_at', { ascending: false });

    if (selSeg) query = query.eq('segment_id', selSeg);
    if (selGrp) query = query.eq('group_id', selGrp);
    if (selSub) query = query.eq('subject_id', selSub);
    if (search) query = query.ilike('question_text', `%${search}%`);

    const { data, error } = await query.limit(50);
    if (data) setAvailableQuestions(data);
    setLoading(false);
  };

  const addToPaper = (q: Question) => {
    if (selectedQuestions.some(item => item.id === q.id)) return;
    setSelectedQuestions(prev => [...prev, q]);
    setTotalMarks(prev => prev + (q.marks || 1));
  };

  const removeFromPaper = (id: string, marks: number) => {
    setSelectedQuestions(prev => prev.filter(q => q.id !== id));
    setTotalMarks(prev => Math.max(0, prev - (marks || 1)));
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: paperTitle,
  });

  const isPro = profile?.subscription_plan === 'pro' || profile?.subscription_plan === 'trial';

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-6 p-4 md:p-6 bg-slate-50">
      
      {/* === LEFT PANE: QUESTION FINDER === */}
      <div className="w-full lg:w-4/12 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
        
        {/* Search Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg">
                    <Filter className="w-5 h-5 text-indigo-600"/> Question Finder
                </h3>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                    {availableQuestions.length} Found
                </span>
            </div>
            
            <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                    <select className="p-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 outline-none focus:border-indigo-500" onChange={e => { setSelSeg(e.target.value); loadGroups(e.target.value); }}><option value="">Segment</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                    <select className="p-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 outline-none focus:border-indigo-500" onChange={e => { setSelGrp(e.target.value); loadSubjects(e.target.value); }}><option value="">Group</option>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                    <select className="p-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 outline-none focus:border-indigo-500" onChange={e => setSelSub(e.target.value)}><option value="">Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400"/>
                        <input className="w-full pl-9 p-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Keywords..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button onClick={searchQuestions} className="bg-indigo-600 text-white px-4 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">Search</button>
                </div>
            </div>
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold">Fetching questions...</span>
                </div>
            ) : availableQuestions.length === 0 ? (
                <div className="text-center p-8 text-slate-400 text-sm font-medium">Use filters to find questions.</div>
            ) : (
                availableQuestions.map(q => {
                    const isAdded = selectedQuestions.some(sq => sq.id === q.id);
                    return (
                        <div 
                            key={q.id} 
                            onClick={() => !isAdded && addToPaper(q)} 
                            className={`p-4 rounded-xl border transition-all cursor-pointer group relative ${isAdded ? 'bg-indigo-50 border-indigo-200 opacity-50 cursor-not-allowed' : 'bg-white border-slate-100 hover:border-indigo-400 hover:shadow-md'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${q.question_type === 'mcq' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{q.question_type}</span>
                                <span className="text-xs font-bold text-slate-900 border border-slate-200 px-2 py-0.5 rounded">{q.marks} Marks</span>
                            </div>
                            <div className="text-sm text-slate-700 line-clamp-3" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                            
                            {!isAdded && (
                                <div className="absolute top-3 right-3 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 p-1.5 rounded-lg">
                                    <Plus className="w-4 h-4"/>
                                </div>
                            )}
                            {isAdded && (
                                <div className="absolute top-3 right-3 text-indigo-400">
                                    <CheckCircle className="w-5 h-5"/>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
      </div>

      {/* === RIGHT PANE: PAPER SETTINGS & PREVIEW === */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center gap-4">
            <div className="flex items-center gap-4 overflow-x-auto">
                <div>
                    <h3 className="font-black text-slate-800 text-lg">Exam Preview</h3>
                    <p className="text-xs font-bold text-slate-500">{selectedQuestions.length} Questions • {totalMarks} Total Marks</p>
                </div>
                
                {/* PRO Controls */}
                {!isPro && (
                    <div className="hidden md:flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">
                        <Crown className="w-4 h-4 text-amber-500 fill-amber-500"/>
                        <span className="text-xs font-bold text-amber-700">Upgrade to Remove Branding</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <button onClick={() => setSelectedQuestions([])} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Clear All">
                    <Trash2 className="w-5 h-5"/>
                </button>
                <button onClick={() => handlePrint()} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-slate-200">
                    <Printer className="w-4 h-4"/> Print Paper
                </button>
            </div>
        </div>

        {/* Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-200/50 flex justify-center">
            
            {/* The A4 Page */}
            <div 
                ref={printRef} 
                className="bg-white shadow-xl min-h-[297mm] w-[210mm] p-[15mm] relative print:shadow-none print:w-full print:h-auto"
            >
                {/* 1. Header Section */}
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                    {/* Institute Name (Editable only for Pro) */}
                    <input 
                        className={`w-full text-center text-3xl font-black mb-2 border-none outline-none placeholder:text-slate-300 print:placeholder:text-transparent bg-transparent ${!isPro ? 'cursor-not-allowed text-slate-500' : ''}`} 
                        value={instituteName} 
                        onChange={e => isPro && setInstituteName(e.target.value)} 
                        placeholder="Institute Name"
                        disabled={!isPro}
                        title={!isPro ? "Upgrade to customize this" : ""}
                    />
                    {!isPro && <p className="text-[10px] text-slate-400 mb-2">(Powered by NextPrep)</p>}

                    <input 
                        className="w-full text-center text-xl font-bold mb-4 border-none outline-none placeholder:text-slate-300 print:placeholder:text-transparent bg-transparent" 
                        value={paperTitle} 
                        onChange={e => setPaperTitle(e.target.value)} 
                        placeholder="Exam Name / Subject"
                    />
                    
                    <div className="flex justify-between font-bold text-sm uppercase border-t border-slate-200 pt-3 mt-2">
                        <div className="flex gap-2">
                            <span>Time:</span>
                            <input className="w-20 font-normal outline-none border-b border-slate-300 focus:border-black bg-transparent" value={duration} onChange={e => setDuration(e.target.value)} />
                        </div>
                        <div>Total Marks: {totalMarks}</div>
                    </div>
                </div>

                {/* 2. Instructions (TinyMCE) */}
                <div className="mb-8 text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100 print:border-none print:p-0 print:bg-transparent">
                    <p className="font-bold text-xs uppercase text-slate-400 mb-1 print:hidden">Instructions (Click to Edit):</p>
                    <Editor
                        apiKey="koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1" // Your TinyMCE API Key
                        value={instructions}
                        onEditorChange={(content) => setInstructions(content)}
                        init={{
                            height: 150,
                            menubar: false,
                            statusbar: false,
                            plugins: ['lists'],
                            toolbar: 'bold italic | bullist numlist',
                            content_style: 'body { font-family:Inter,sans-serif; font-size:12px; margin:0; }'
                        }}
                    />
                </div>

                {/* 3. Questions Render */}
                {selectedQuestions.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl print:hidden opacity-50">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-2"/>
                        <p className="text-slate-400 font-bold">Add questions from the left panel</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {selectedQuestions.map((q, idx) => (
                            <div key={q.id} className="relative group break-inside-avoid">
                                <div className="flex gap-4 items-start">
                                    <span className="font-bold text-lg">{idx + 1}.</span>
                                    <div className="flex-1">
                                        {/* Question Text */}
                                        <div 
                                            className="font-medium text-slate-900 text-base mb-3 [&_p]:inline" 
                                            dangerouslySetInnerHTML={{__html: q.question_text}}
                                        ></div>
                                        
                                        {/* Options Grid (If MCQ) */}
                                        {q.question_type === 'mcq' && q.options && (
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 pl-2">
                                                {q.options.map((opt: any, i: number) => (
                                                    <div key={i} className="flex gap-2 text-sm items-center">
                                                        <span className="font-bold">({String.fromCharCode(97 + i)})</span> 
                                                        <span>{opt.option_text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="font-bold text-sm min-w-[2rem] text-right">[{q.marks}]</div>
                                </div>

                                {/* Remove Button (Hidden in Print) */}
                                <button 
                                    onClick={() => removeFromPaper(q.id, q.marks)} 
                                    className="absolute -left-10 top-0 text-red-400 opacity-0 group-hover:opacity-100 print:hidden p-1.5 hover:bg-red-50 rounded-full transition-all"
                                    title="Remove Question"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* 4. Footer Watermark */}
                {showWatermark && !isPro && (
                    <div className="mt-12 pt-4 border-t border-slate-200 text-center text-xs text-slate-400 font-medium">
                        Generated by <span className="font-bold text-indigo-600">NextPrep</span> Question Builder
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}