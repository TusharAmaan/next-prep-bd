"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, Plus, Trash2, Printer, Filter, 
  FileText, Crown, Settings, GripVertical, 
  Download, RefreshCw, XCircle, CheckCircle,
  ChevronDown, ChevronRight, LayoutGrid, Layers, Building2, Lock
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Editor } from "@tinymce/tinymce-react";

// --- TYPES ---
interface Question {
  id: string;
  question_text: string;
  question_type: string;
  marks: number;
  topic_tag?: string;
  options?: any[];
}

interface UserProfile {
  role: 'tutor' | 'institute';
  subscription_plan: 'free' | 'trial' | 'pro';
  institute_name?: string;
  avatar_url?: string; // Logo URL
}

export default function QuestionBuilder() {
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
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Paper Settings
  const [paperTitle, setPaperTitle] = useState("Monthly Assessment");
  const [instituteName, setInstituteName] = useState("NextPrep Model Test"); 
  const [instituteLogo, setInstituteLogo] = useState<string | null>(null);
  const [duration, setDuration] = useState("45 Mins");
  const [totalMarks, setTotalMarks] = useState(0);
  const [instructions, setInstructions] = useState("<ul><li>Answer all questions.</li><li>No electronic devices allowed.</li></ul>");
  
  const printRef = useRef<HTMLDivElement>(null);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const init = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: prof } = await supabase.from('profiles').select('role, subscription_plan, institute_name, avatar_url').eq('id', user.id).single();
            setProfile(prof);
            
            // LOGIC: Institute Name & Logo
            if (prof && prof.role === 'institute') {
                setInstituteName(prof.institute_name || "Institute Name");
                setInstituteLogo(prof.avatar_url || null);
            } else {
                setInstituteName("NextPrep Model Test"); // Enforced for Tutors
                setInstituteLogo(null); // No Logo for Tutors
            }
        }

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
      .select('id, question_text, question_type, marks, topic_tag, options:question_options(option_text)')
      .order('created_at', { ascending: false });

    if (selSeg) query = query.eq('segment_id', selSeg);
    if (selGrp) query = query.eq('group_id', selGrp);
    if (selSub) query = query.eq('subject_id', selSub);
    if (search) query = query.ilike('question_text', `%${search}%`);

    const { data } = await query.limit(50);
    if (data) setAvailableQuestions(data);
    setLoading(false);
  };

  const addToPaper = (q: Question) => {
    if (selectedQuestions.some(item => item.id === q.id)) return;
    // Add question with original marks initially
    setSelectedQuestions(prev => [...prev, { ...q }]); 
    setTotalMarks(prev => prev + (q.marks || 1));
  };

  const removeFromPaper = (id: string, currentMarks: number) => {
    setSelectedQuestions(prev => prev.filter(q => q.id !== id));
    setTotalMarks(prev => Math.max(0, prev - (currentMarks || 1)));
  };

  // NEW: Update Marks for a specific question (Pro Feature)
  const updateQuestionMarks = (id: string, newMarks: number) => {
      setSelectedQuestions(prev => prev.map(q => {
          if (q.id === id) {
              return { ...q, marks: newMarks };
          }
          return q;
      }));
      // Recalculate Total
      const newTotal = selectedQuestions.reduce((sum, q) => sum + (q.id === id ? newMarks : q.marks), 0);
      setTotalMarks(newTotal);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: paperTitle,
  });

  // --- ACCESS CONTROL ---
  const isPro = profile?.subscription_plan === 'pro' || profile?.subscription_plan === 'trial';
  const isInstitute = profile?.role === 'institute';

  // Tutors can edit layout/headings/marks IF they are Pro.
  // Institutes can do that PLUS edit Branding.
  const canEditHeadings = isPro; 
  const canEditBranding = isPro && isInstitute;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-slate-50 overflow-hidden">
      
      {/* LEFT PANE (Filters) - Same as before */}
      <div className={`absolute inset-0 z-50 bg-white lg:static lg:w-[400px] flex flex-col border-r border-slate-200 transition-transform duration-300 ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg">
                <LayoutGrid className="w-5 h-5 text-indigo-600"/> Question Bank
            </h3>
            <button onClick={() => setIsMobileFilterOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600"><XCircle/></button>
        </div>

        <div className="p-4 space-y-4 border-b border-slate-100 bg-slate-50/50 overflow-y-auto max-h-[40vh]">
            <div className="space-y-3">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hierarchy</label>
                    <select className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 bg-white" onChange={e => { setSelSeg(e.target.value); loadGroups(e.target.value); }}><option value="">Select Segment...</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                    <select className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 bg-white" onChange={e => { setSelGrp(e.target.value); loadSubjects(e.target.value); }} disabled={!selSeg}><option value="">Select Group...</option>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                    <select className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 bg-white" onChange={e => setSelSub(e.target.value)} disabled={!selGrp}><option value="">Select Subject...</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                </div>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400"/>
                <input className="w-full pl-10 p-2.5 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Search question text..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={searchQuestions} className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex justify-center items-center gap-2">
                <Search className="w-4 h-4"/> Find Questions
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-100">
            {loading ? <div className="p-10 text-center text-xs text-slate-400 font-bold">Loading...</div> : availableQuestions.map(q => {
                const isAdded = selectedQuestions.some(sq => sq.id === q.id);
                return (
                    <div key={q.id} onClick={() => !isAdded && addToPaper(q)} className={`p-4 rounded-xl border transition-all cursor-pointer group relative ${isAdded ? 'bg-indigo-50 border-indigo-200 opacity-60' : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">{q.question_type}</span>
                            <span className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">{q.marks} Marks</span>
                        </div>
                        <div className="text-sm text-slate-700 line-clamp-2 font-medium" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                        {!isAdded ? <div className="absolute top-3 right-3 text-indigo-600 opacity-0 group-hover:opacity-100 bg-indigo-50 p-1.5 rounded-lg"><Plus className="w-4 h-4"/></div> : <div className="absolute top-3 right-3 text-emerald-500"><CheckCircle className="w-5 h-5"/></div>}
                    </div>
                );
            })}
        </div>
      </div>

      {/* RIGHT PANE (Canvas) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap justify-between items-center gap-4 shadow-sm z-10">
            <div className="flex items-center gap-6">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Composition</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-slate-800">{selectedQuestions.length} Questions</span>
                        <span className="text-sm font-bold text-slate-500">• {totalMarks} Marks</span>
                    </div>
                </div>
                {!isPro && (
                    <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 px-3 py-1.5 rounded-full">
                        <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-600"/>
                        <span className="text-[10px] font-black text-amber-800 uppercase tracking-wide">Customize Paper</span>
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                <button onClick={() => setSelectedQuestions([])} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-5 h-5"/></button>
                <button onClick={() => handlePrint()} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-slate-200 hover:-translate-y-0.5">
                    <Printer className="w-4 h-4"/> Print / PDF
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-100 flex justify-center">
            <div ref={printRef} className="bg-white shadow-2xl min-h-[297mm] w-[210mm] p-[20mm] relative print:shadow-none print:w-full print:h-auto print:p-0 print:m-0">
                
                {/* 1. Header Section */}
                <div className="text-center border-b-2 border-black pb-6 mb-8">
                    {/* LOGO (Institutes Only) */}
                    {isInstitute && instituteLogo && (
                        <div className="mb-4 flex justify-center">
                            <img src={instituteLogo} alt="Logo" className="h-16 object-contain" />
                        </div>
                    )}

                    {/* INSTITUTE NAME (Locked for Tutors) */}
                    <div className="relative group">
                        <input 
                            className={`w-full text-center text-4xl font-black mb-3 border-none outline-none placeholder:text-slate-300 print:placeholder:text-transparent bg-transparent ${!canEditBranding ? 'cursor-not-allowed text-slate-700' : ''}`} 
                            value={instituteName} 
                            onChange={e => canEditBranding && setInstituteName(e.target.value)} 
                            placeholder="Institute Name"
                            disabled={!canEditBranding} 
                        />
                        {!canEditBranding && (
                            <div className="absolute top-0 right-0 hidden group-hover:flex items-center gap-1 bg-black text-white text-[10px] px-2 py-1 rounded z-20">
                                {isInstitute ? <Crown className="w-3 h-3"/> : <Lock className="w-3 h-3"/>}
                                {isInstitute ? "Upgrade to Edit" : "Institute Only"}
                            </div>
                        )}
                    </div>
                    
                    {!isInstitute && <p className="text-[10px] text-slate-400 mb-4 font-mono tracking-widest uppercase">Powered by NextPrep</p>}

                    {/* EXAM TITLE (Editable for Pro) */}
                    <input 
                        className={`w-full text-center text-xl font-bold mb-6 border-none outline-none placeholder:text-slate-300 print:placeholder:text-transparent bg-transparent focus:bg-slate-50 rounded ${!canEditHeadings ? 'cursor-not-allowed' : ''}`}
                        value={paperTitle} 
                        onChange={e => canEditHeadings && setPaperTitle(e.target.value)} 
                        placeholder="Exam Name / Subject"
                        disabled={!canEditHeadings}
                        title={!canEditHeadings ? "Upgrade to customize" : ""}
                    />
                    
                    {/* TIME & MARKS (Editable for Pro) */}
                    <div className="flex justify-between font-bold text-sm uppercase border-t-2 border-slate-100 pt-4">
                        <div className="flex gap-2 items-center">
                            <span className="text-slate-500">Time:</span>
                            <input 
                                className={`w-24 font-black outline-none border-b border-transparent focus:border-black bg-transparent text-black ${!canEditHeadings ? 'cursor-not-allowed' : ''}`} 
                                value={duration} 
                                onChange={e => canEditHeadings && setDuration(e.target.value)} 
                                disabled={!canEditHeadings}
                            />
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="text-slate-500">Marks:</span>
                            <span className="font-black text-black">{totalMarks}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Instructions */}
                <div className="mb-10 text-sm text-slate-800 bg-slate-50/50 p-4 rounded-xl border border-slate-100 print:border-none print:p-0 print:bg-transparent group relative">
                    <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest print:hidden">Instructions</div>
                    {!canEditHeadings && (
                        <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black text-white text-xs px-3 py-1 rounded font-bold flex items-center gap-1"><Crown className="w-3 h-3"/> Pro Feature</span>
                        </div>
                    )}
                    <Editor
                        apiKey="koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1"
                        value={instructions}
                        onEditorChange={(c) => canEditHeadings && setInstructions(c)}
                        disabled={!canEditHeadings}
                        init={{
                            height: 120,
                            menubar: false,
                            statusbar: false,
                            plugins: ['lists'],
                            toolbar: 'bold italic | bullist numlist',
                            content_style: 'body { font-family:Inter,sans-serif; font-size:13px; margin:0; background:transparent; }'
                        }}
                    />
                </div>

                {/* 3. Questions Render */}
                {selectedQuestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-slate-100 rounded-3xl print:hidden">
                        <FileText className="w-10 h-10 text-slate-300 mb-2"/>
                        <p className="text-slate-400 font-bold text-lg">Your canvas is empty</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {selectedQuestions.map((q, idx) => (
                            <div key={q.id} className="relative group break-inside-avoid pl-2 hover:bg-slate-50/50 rounded-lg -ml-2 p-2 transition-colors">
                                <div className="flex gap-4 items-start">
                                    <span className="font-bold text-lg text-slate-400 w-6">{idx + 1}.</span>
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900 text-base mb-3 leading-relaxed [&_p]:inline" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                                        {q.question_type === 'mcq' && q.options && (
                                            <div className="grid grid-cols-2 gap-x-12 gap-y-3 pl-1 mt-3">
                                                {q.options.map((opt: any, i: number) => (
                                                    <div key={i} className="flex gap-3 text-sm items-start">
                                                        <span className="font-bold text-slate-500">({String.fromCharCode(97 + i)})</span> 
                                                        <span className="text-slate-800">{opt.option_text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Editable Marks (Pro Only) */}
                                    <div className="font-bold text-sm min-w-[3rem] text-right">
                                        {canEditHeadings ? (
                                            <input 
                                                className="w-10 text-right bg-slate-100 px-1 py-0.5 rounded border border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none"
                                                type="number"
                                                value={q.marks}
                                                onChange={(e) => updateQuestionMarks(q.id, Number(e.target.value))}
                                            />
                                        ) : (
                                            <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">{q.marks}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="absolute -left-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                    <button onClick={() => removeFromPaper(q.id, q.marks)} className="p-2 bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-lg shadow-sm"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 4. Footer */}
                <div className="mt-20 pt-6 border-t-2 border-slate-900 flex justify-between items-end">
                    <div className="text-center w-full">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Good Luck</p>
                        {/* Watermark Logic */}
                        {!isPro && (
                            <p className="text-[10px] text-slate-300 mt-2 font-mono">Created with NextPrep</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}