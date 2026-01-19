"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Search, Plus, Trash2, Printer, Filter, 
  FileText, Crown, Save, CheckCircle, 
  LayoutGrid, Layers, Loader2, ArrowLeft,
  ChevronDown, RefreshCw, XCircle
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Editor } from "@tinymce/tinymce-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// --- TYPES ---
interface Question {
  id: string;
  question_text: string;
  question_type: string;
  marks: number;
  topic_tag?: string;
  options?: any[];
}

interface MetaItem {
  id: string | number;
  title: string;
}

export default function QuestionBuilder() {
  const supabase = createClient();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [instituteName, setInstituteName] = useState("NextPrep Model Test");
  
  // Builder State
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [paperTitle, setPaperTitle] = useState("Monthly Assessment");
  const [duration, setDuration] = useState("45 Mins");
  const [totalMarks, setTotalMarks] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [instructions, setInstructions] = useState("<ul><li>Answer all questions.</li><li>No electronic devices allowed.</li></ul>");

  // Filter State
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ segment: "", group: "", subject: "", type: "" });
  
  // FIX: Explicitly type the metaData state to prevent 'never[]' errors
  const [metaData, setMetaData] = useState<{
    segments: MetaItem[];
    groups: MetaItem[];
    subjects: MetaItem[];
  }>({ segments: [], groups: [], subjects: [] });

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check Plan
        const { data: prof } = await supabase.from('profiles').select('subscription_plan, institute_name, role').eq('id', user.id).single();
        if (prof) {
            // Debugging Plan Status
            console.log("User Plan:", prof.subscription_plan); 
            
            // Allow if 'pro' OR 'trial'
            const hasAccess = prof.subscription_plan === 'pro' || prof.subscription_plan === 'trial';
            setIsPro(hasAccess);
            
            if(prof.role === 'institute') setInstituteName(prof.institute_name || "Institute Name");
        }
      }
      
      // Load Segments
      const { data: segs } = await supabase.from('segments').select('id, title');
      setMetaData(prev => ({ ...prev, segments: segs || [] }));
    };
    init();
  }, []);

  // --- 2. FILTER LOGIC ---
  const loadGroups = async (segId: string) => {
    const { data } = await supabase.from('groups').select('id, title').eq('segment_id', segId);
    setMetaData(prev => ({ ...prev, groups: data || [] }));
    setFilters(prev => ({ ...prev, segment: segId, group: "", subject: "" }));
  };

  const loadSubjects = async (grpId: string) => {
    const { data } = await supabase.from('subjects').select('id, title').eq('group_id', grpId);
    setMetaData(prev => ({ ...prev, subjects: data || [] }));
    setFilters(prev => ({ ...prev, group: grpId, subject: "" }));
  };

  const searchQuestions = async () => {
    setLoading(true);
    let query = supabase
      .from('question_bank')
      .select('id, question_text, question_type, marks, topic_tag, options:question_options(option_text)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filters.segment) query = query.eq('segment_id', filters.segment);
    if (filters.group) query = query.eq('group_id', filters.group);
    if (filters.subject) query = query.eq('subject_id', filters.subject);
    if (filters.type) query = query.eq('question_type', filters.type);
    if (search) query = query.ilike('question_text', `%${search}%`);

    const { data } = await query;
    if (data) setAvailableQuestions(data);
    setLoading(false);
  };

  // --- 3. CANVAS ACTIONS ---
  const addToPaper = (q: Question) => {
    if (selectedQuestions.some(item => item.id === q.id)) return;
    const newQ = { ...q }; // Clone
    const newQuestions = [...selectedQuestions, newQ];
    setSelectedQuestions(newQuestions);
    recalcTotal(newQuestions);
  };

  const removeFromPaper = (id: string) => {
    const newQuestions = selectedQuestions.filter(q => q.id !== id);
    setSelectedQuestions(newQuestions);
    recalcTotal(newQuestions);
  };

  const updateMark = (id: string, newMark: number) => {
    const newQuestions = selectedQuestions.map(q => q.id === id ? { ...q, marks: newMark } : q);
    setSelectedQuestions(newQuestions);
    recalcTotal(newQuestions);
  };

  const recalcTotal = (questions: Question[]) => {
    const total = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    setTotalMarks(total);
  };

  // --- 4. REAL SAVE FUNCTION ---
  const handleSave = async () => {
    if (selectedQuestions.length === 0) return alert("Please add questions first!");
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
        tutor_id: user.id,
        title: paperTitle,
        institute_name: instituteName,
        duration: duration,
        total_marks: totalMarks,
        questions: selectedQuestions,
        settings: { instructions, showInstructions },
        is_finalized: false 
    };

    const { error } = await supabase.from('exams').insert(payload);

    if (error) {
        alert("Save Failed: " + error.message);
    } else {
        alert("Exam Saved Successfully!");
        router.push("/tutor/dashboard"); 
    }
    setSaving(false);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: paperTitle,
  });

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm z-30">
          <div className="flex items-center gap-4">
              <Link href="/tutor/dashboard" className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft className="w-5 h-5 text-slate-500"/></Link>
              <div>
                  <h1 className="text-lg font-black text-slate-800 flex items-center gap-2">Exam Composer</h1>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                      <span>{selectedQuestions.length} Questions</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{totalMarks} Total Marks</span>
                  </div>
              </div>
          </div>
          <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                  Save Exam
              </button>
              <button onClick={() => handlePrint()} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200" title="Quick Print Preview"><Printer className="w-5 h-5"/></button>
          </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
          
          {/* === LEFT: DISCOVERY (Filters + List) === */}
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-20">
              <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
                  <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                      <input className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-all" placeholder="Search topics..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchQuestions()}/>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                      <select className="text-xs border p-2 rounded bg-white" onChange={e => loadGroups(e.target.value)}><option value="">Segment</option>{metaData.segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                      <select className="text-xs border p-2 rounded bg-white" onChange={e => loadSubjects(e.target.value)}><option value="">Group</option>{metaData.groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                  </div>
                  <select className="w-full text-xs border p-2 rounded bg-white" onChange={e => setFilters({...filters, subject: e.target.value})}><option value="">Subject</option>{metaData.subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                  <button onClick={searchQuestions} className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold">Search Questions</button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-100">
                  {availableQuestions.map(q => {
                      const isAdded = selectedQuestions.some(sq => sq.id === q.id);
                      return (
                          <div key={q.id} onClick={() => !isAdded && addToPaper(q)} className={`p-3 bg-white rounded-lg border cursor-pointer transition-all hover:shadow-md ${isAdded ? 'opacity-50 border-indigo-200' : 'border-slate-200'}`}>
                              <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded uppercase">{q.question_type}</span>
                                  <span className="text-xs font-bold text-slate-600">{q.marks} Pts</span>
                              </div>
                              <div className="text-xs text-slate-700 line-clamp-2" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                              {isAdded && <div className="mt-2 text-[10px] font-bold text-indigo-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Added</div>}
                          </div>
                      );
                  })}
                  {availableQuestions.length === 0 && !loading && <div className="text-center py-10 text-slate-400 text-xs">No questions found.</div>}
              </div>
          </div>

          {/* === RIGHT: CANVAS (A4 Preview) === */}
          <div className="flex-1 overflow-y-auto bg-slate-200 p-8 flex justify-center">
              
              <div ref={printRef} className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[20mm] relative">
                  
                  {/* Header Edit Mode */}
                  <div className="text-center border-b-2 border-black pb-4 mb-6 group">
                      <input 
                          className={`w-full text-center text-3xl font-black mb-2 outline-none placeholder:text-slate-300 bg-transparent ${!isPro ? 'cursor-not-allowed' : ''}`}
                          value={instituteName} 
                          onChange={e => isPro && setInstituteName(e.target.value)} 
                          disabled={!isPro} 
                      />
                      {/* Alert for Free Users */}
                      {!isPro && <div className="text-[10px] text-red-500 font-bold mb-2 print:hidden">Upgrade to customize Institute Name</div>}

                      <input 
                          className="w-full text-center text-xl font-bold mb-4 outline-none bg-transparent" 
                          value={paperTitle} 
                          onChange={e => setPaperTitle(e.target.value)} 
                      />
                      <div className="flex justify-between font-bold text-sm uppercase border-t-2 border-slate-100 pt-3">
                          <div className="flex gap-2 items-center">
                              <span>Time:</span>
                              <input className="w-20 font-black outline-none border-b border-transparent focus:border-black bg-transparent text-black" value={duration} onChange={e => setDuration(e.target.value)} />
                          </div>
                          <div className="flex gap-2 items-center">
                              <span>Total Marks:</span>
                              <span className="font-black text-black">{totalMarks}</span>
                          </div>
                      </div>
                  </div>

                  {/* Instructions */}
                  <div className="mb-8">
                      {showInstructions && (
                          <div className="text-sm text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 print:border-none print:p-0 print:bg-transparent">
                              <Editor 
                                  apiKey="koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1"
                                  value={instructions} 
                                  onEditorChange={c => setInstructions(c)}
                                  init={{ 
                                      height: 100, 
                                      menubar: false, 
                                      toolbar: false, 
                                      statusbar: false,
                                      content_style: 'body { font-family:Inter,sans-serif; font-size:13px; margin:0; background:transparent; }'
                                  }}
                              />
                          </div>
                      )}
                  </div>

                  {/* Question List */}
                  <div className="space-y-6">
                      {selectedQuestions.length === 0 ? (
                          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl">
                              <p className="text-slate-400 font-bold">Canvas Empty</p>
                              <p className="text-xs text-slate-400">Add questions from left panel</p>
                          </div>
                      ) : (
                          selectedQuestions.map((q, idx) => (
                              <div key={q.id} className="relative group pl-2 hover:bg-slate-50 transition-colors rounded -ml-2 p-1 break-inside-avoid">
                                  <div className="flex gap-3 items-start">
                                      <span className="font-bold text-lg w-6 flex-shrink-0">{idx + 1}.</span>
                                      
                                      <div className="flex-1">
                                          <div className="font-medium text-slate-900 text-sm leading-relaxed [&_p]:inline" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                                          
                                          {/* Compact MCQ Grid */}
                                          {q.question_type === 'mcq' && q.options && (
                                              <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
                                                  {q.options.map((opt:any, i:number) => (
                                                      <div key={i} className="flex gap-2 text-sm items-start">
                                                          <span className="font-bold">({String.fromCharCode(97 + i)})</span>
                                                          <span>{opt.option_text}</span>
                                                      </div>
                                                  ))}
                                              </div>
                                          )}
                                      </div>

                                      {/* MARK EDITOR */}
                                      <div className="w-12 text-right">
                                          <input 
                                              type="number" 
                                              className="w-10 text-right font-bold text-sm bg-slate-50 px-1 rounded border border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none print:bg-transparent print:border-none"
                                              value={q.marks}
                                              onChange={(e) => updateMark(q.id, Number(e.target.value))}
                                          />
                                      </div>
                                  </div>

                                  {/* Delete Button */}
                                  <button 
                                      onClick={() => removeFromPaper(q.id)} 
                                      className="absolute -left-8 top-0 p-1.5 bg-white border border-red-100 text-red-500 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                                  >
                                      <Trash2 className="w-4 h-4"/>
                                  </button>
                              </div>
                          ))
                      )}
                  </div>

                  {/* Footer */}
                  <div className="mt-16 pt-6 border-t-2 border-slate-900 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Good Luck</p>
                      {!isPro && <p className="text-[8px] text-slate-300 mt-2 font-mono print:block">Generated by NextPrep</p>}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}