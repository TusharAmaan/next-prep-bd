"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Search, Plus, Trash2, Filter, 
  FileText, Crown, Save, CheckCircle, 
  LayoutGrid, Layers, Loader2, ArrowLeft,
  ChevronDown, RefreshCw, XCircle, Eye, X, BookOpen, EyeOff
} from "lucide-react";
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

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPro, setIsPro] = useState(false);
  
  // Builder State
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [paperTitle, setPaperTitle] = useState("Monthly Assessment");
  const [instituteName, setInstituteName] = useState("Your Institute Name"); // Default changed
  const [duration, setDuration] = useState("45 Mins");
  const [totalMarks, setTotalMarks] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [instructions, setInstructions] = useState("<ul><li>Answer all questions.</li><li>No electronic devices allowed.</li></ul>");

  // Filter State
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  // RESTORED: All filter options
  const [filters, setFilters] = useState({ segment: "", group: "", subject: "", type: "", topic: "" });
  
  const [metaData, setMetaData] = useState<{
    segments: MetaItem[];
    groups: MetaItem[];
    subjects: MetaItem[];
  }>({ segments: [], groups: [], subjects: [] });

  // Popup State
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check Plan
        const { data: prof } = await supabase.from('profiles').select('subscription_plan, institute_name, role').eq('id', user.id).single();
        if (prof) {
            const hasAccess = prof.subscription_plan === 'pro' || prof.subscription_plan === 'trial';
            setIsPro(hasAccess);
            
            // Auto-fill Institute Name if set in profile
            if(prof.institute_name) setInstituteName(prof.institute_name);
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
    if (filters.topic) query = query.ilike('topic_tag', `%${filters.topic}%`); // RESTORED
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

  // --- 4. SAVE & COUNT LOGIC ---
  const handleSave = async () => {
    if (selectedQuestions.length === 0) return alert("Please add questions first!");
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Check Usage Limit (Client-side pre-check, enforcing on server recommended)
    // Note: We are counting "Exams Created" here implicitly by saving.
    // If you want to count "Questions Used", you'd sum them up.
    
    const payload = {
        user_id: user.id, // Fixed: user_id matches table schema
        title: paperTitle,
        institute_name: instituteName,
        duration: duration,
        total_marks: totalMarks,
        questions: selectedQuestions,
        settings: { instructions, showInstructions },
        // We set 'is_finalized' to true immediately if "Save" implies counting usage
        // Or keep it false if you have a separate "Finalize/Print" step that deducts credit.
        is_finalized: true 
    };

    const { error } = await supabase.from('exam_papers').insert(payload);

    if (error) {
        alert("Save Failed: " + error.message);
    } else {
        alert("Exam Saved! Redirecting to My Exams...");
        // 2. Redirect to My Exams List
        router.push("/tutor/dashboard/my-exams"); 
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex justify-between items-center shadow-sm z-30">
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
          
          {/* ACTION BUTTONS */}
          <div className="flex gap-3">
              <button 
                  onClick={handleSave} 
                  disabled={saving || selectedQuestions.length === 0} 
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
              >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                  Save & Exit
              </button>
          </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
          
          {/* === LEFT: DISCOVERY (30%) === */}
          <div className="w-96 bg-white border-r border-slate-200 flex flex-col z-20 hidden md:flex">
              
              {/* FILTERS HEADER */}
              <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
                  <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                      <input className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-all" placeholder="Search keywords..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchQuestions()}/>
                  </div>
                  
                  {/* HIERARCHY */}
                  <div className="grid grid-cols-2 gap-2">
                      <select className="text-xs border p-2 rounded bg-white" onChange={e => loadGroups(e.target.value)}><option value="">Segment</option>{metaData.segments.map((s:any)=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                      <select className="text-xs border p-2 rounded bg-white" onChange={e => loadSubjects(e.target.value)}><option value="">Group</option>{metaData.groups.map((g:any)=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                  </div>
                  <select className="w-full text-xs border p-2 rounded bg-white" onChange={e => setFilters({...filters, subject: e.target.value})}><option value="">Subject</option>{metaData.subjects.map((s:any)=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                  
                  {/* ADVANCED ATTRIBUTES (Restored) */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                      <select className="text-xs border p-2 rounded bg-white" onChange={e => setFilters({...filters, type: e.target.value})}>
                          <option value="">All Types</option>
                          <option value="mcq">MCQ</option>
                          <option value="passage">Passage</option>
                          <option value="descriptive">Creative</option>
                      </select>
                      <input className="text-xs border p-2 rounded bg-white" placeholder="Topic Tag..." onChange={e => setFilters({...filters, topic: e.target.value})} />
                  </div>

                  <button onClick={searchQuestions} className="w-full bg-slate-800 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-900 transition-all">Search Questions</button>
              </div>

              {/* QUESTIONS LIST */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-100">
                  {availableQuestions.map(q => {
                      const isAdded = selectedQuestions.some(sq => sq.id === q.id);
                      return (
                          <div key={q.id} className={`p-3 bg-white rounded-lg border transition-all hover:shadow-md group ${isAdded ? 'opacity-60 border-indigo-200' : 'border-slate-200'}`}>
                              <div className="flex justify-between items-start mb-2">
                                  <div className="flex gap-1">
                                      <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded uppercase text-slate-600">{q.question_type}</span>
                                      {q.topic_tag && <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 max-w-[80px] truncate">{q.topic_tag}</span>}
                                  </div>
                                  <span className="text-xs font-bold text-slate-900">{q.marks} Pts</span>
                              </div>
                              <div className="text-xs text-slate-700 line-clamp-2 mb-2" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                              
                              <div className="flex gap-2">
                                  {/* Quick View Button */}
                                  <button onClick={(e) => { e.stopPropagation(); setPreviewQuestion(q); }} className="flex-1 py-1.5 rounded bg-slate-50 text-slate-500 text-xs font-bold hover:bg-slate-100 flex items-center justify-center gap-1">
                                      <Eye className="w-3 h-3"/> View
                                  </button>
                                  
                                  {/* Add Button */}
                                  <button 
                                      onClick={() => !isAdded && addToPaper(q)} 
                                      className={`flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors ${isAdded ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                  >
                                      {isAdded ? <CheckCircle className="w-3 h-3"/> : <Plus className="w-3 h-3"/>}
                                      {isAdded ? "Added" : "Add"}
                                  </button>
                              </div>
                          </div>
                      );
                  })}
                  {availableQuestions.length === 0 && !loading && <div className="text-center py-10 text-slate-400 text-xs">No questions found. Try adjusting filters.</div>}
              </div>
          </div>

          {/* === RIGHT: CANVAS (70%) === */}
          <div className="flex-1 overflow-y-auto bg-slate-200 p-4 md:p-8 flex justify-center">
              
              {/* THE PAPER PREVIEW */}
              <div className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[20mm] relative">
                  
                  {/* 1. Header (Smaller & Clean) */}
                  <div className="text-center border-b-2 border-black pb-4 mb-6 group">
                      {/* Editable Institute Name */}
                      <input 
                          className={`w-full text-center text-3xl font-black mb-2 outline-none placeholder:text-slate-300 bg-transparent ${!isPro ? 'cursor-not-allowed text-slate-500' : 'text-slate-900'}`}
                          value={instituteName} 
                          onChange={e => isPro && setInstituteName(e.target.value)} 
                          disabled={!isPro} 
                          placeholder="Your Institute Name"
                      />
                      {!isPro && <p className="text-[10px] text-red-400 font-bold mb-1 print:hidden">Unlock Premium to customize Header</p>}

                      <input 
                          className="w-full text-center text-lg font-bold mb-4 outline-none bg-transparent" 
                          value={paperTitle} 
                          onChange={e => setPaperTitle(e.target.value)} 
                          placeholder="Exam Name / Subject"
                      />
                      
                      <div className="flex justify-between font-bold text-sm uppercase border-t-2 border-slate-100 pt-3 text-slate-800">
                          <div className="flex gap-2 items-center">
                              <span>Time:</span>
                              <input className="w-20 font-black outline-none border-b border-transparent focus:border-black bg-transparent text-black" value={duration} onChange={e => setDuration(e.target.value)} />
                          </div>
                          <div className="flex gap-2 items-center">
                              <span>Total Marks:</span>
                              <span className="font-black text-black">{totalMarks}</span> {/* Read-Only Calculated */}
                          </div>
                      </div>
                  </div>

                  {/* 2. Instructions (Fixed Visibility) */}
                  <div className="mb-8">
                      <div className="flex justify-between items-center mb-1 print:hidden">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instructions</span>
                          {/* Toggle Instructions */}
                          <button onClick={() => setShowInstructions(!showInstructions)} className="text-slate-400 hover:text-indigo-600">
                              {showInstructions ? <Eye className="w-3 h-3"/> : <EyeOff className="w-3 h-3"/>}
                          </button>
                      </div>
                      
                      {showInstructions && (
                          <div className="text-sm text-slate-800 leading-relaxed p-2 rounded border border-transparent hover:border-slate-100 transition-colors print:border-none print:p-0">
                              <Editor 
                                  apiKey="koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1"
                                  value={instructions} 
                                  onEditorChange={c => setInstructions(c)}
                                  init={{ 
                                      height: 80, 
                                      menubar: false, 
                                      toolbar: false, 
                                      statusbar: false,
                                      content_style: 'body { font-family:Inter,sans-serif; font-size:13px; margin:0; background:transparent; } p { margin: 0; }'
                                  }}
                              />
                          </div>
                      )}
                  </div>

                  {/* 3. Questions List */}
                  <div className="space-y-6">
                      {selectedQuestions.length === 0 ? (
                          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl">
                              <p className="text-slate-400 font-bold">Paper is Empty</p>
                              <p className="text-xs text-slate-400">Select questions from the left panel.</p>
                          </div>
                      ) : (
                          selectedQuestions.map((q, idx) => (
                              <div key={q.id} className="relative group pl-2 hover:bg-slate-50 transition-colors rounded -ml-2 p-1 break-inside-avoid">
                                  <div className="flex gap-3 items-start">
                                      <span className="font-bold text-lg w-6 flex-shrink-0 text-slate-900">{idx + 1}.</span>
                                      
                                      <div className="flex-1">
                                          <div className="font-medium text-slate-900 text-sm leading-relaxed [&_p]:inline" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                                          
                                          {/* MCQ Options Grid */}
                                          {q.question_type === 'mcq' && q.options && (
                                              <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
                                                  {q.options.map((opt:any, i:number) => (
                                                      <div key={i} className="flex gap-2 text-sm items-start">
                                                          <span className="font-bold text-slate-600">({String.fromCharCode(97 + i)})</span>
                                                          <span className="text-slate-800">{opt.option_text}</span>
                                                      </div>
                                                  ))}
                                              </div>
                                          )}
                                      </div>

                                      {/* Marks */}
                                      <div className="w-12 text-right">
                                          {/* PRO FEATURE: Editable Marks */}
                                          {isPro ? (
                                              <input 
                                                  type="number" 
                                                  className="w-8 text-right font-bold text-sm bg-slate-50 border border-slate-200 rounded px-1 focus:border-indigo-500 outline-none print:bg-transparent print:border-none"
                                                  value={q.marks}
                                                  onChange={(e) => updateMark(q.id, Number(e.target.value))}
                                              />
                                          ) : (
                                              <span className="font-bold text-sm text-slate-600">[{q.marks}]</span>
                                          )}
                                      </div>
                                  </div>

                                  {/* Delete Action */}
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
                  </div>
              </div>
          </div>
      </div>

      {/* === QUESTION PREVIEW MODAL === */}
      {previewQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded uppercase text-slate-600">{previewQuestion.question_type}</span>
                          <span className="ml-2 text-xs font-bold text-slate-400">{previewQuestion.marks} Marks</span>
                      </div>
                      <button onClick={() => setPreviewQuestion(null)} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="text-sm font-medium text-slate-800 mb-4" dangerouslySetInnerHTML={{__html: previewQuestion.question_text}}></div>
                  
                  {previewQuestion.options && (
                      <div className="space-y-2 bg-slate-50 p-4 rounded-xl">
                          {previewQuestion.options.map((opt:any, i:number) => (
                              <div key={i} className="flex gap-3 text-sm">
                                  <span className="font-bold text-slate-500">({String.fromCharCode(97 + i)})</span>
                                  <span>{opt.option_text}</span>
                              </div>
                          ))}
                      </div>
                  )}

                  <div className="mt-6 flex gap-3">
                      <button onClick={() => setPreviewQuestion(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold hover:bg-slate-50">Close</button>
                      <button onClick={() => { addToPaper(previewQuestion); setPreviewQuestion(null); }} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700">Add to Paper</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}