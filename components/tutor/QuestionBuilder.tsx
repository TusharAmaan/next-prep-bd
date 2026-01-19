"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, Plus, Trash2, Printer, Filter, 
  FileText, Crown, GripVertical, Save,
  XCircle, CheckCircle, LayoutGrid, 
  Layers, Clock, Hash, ChevronDown, Lock,
  Building2, Eye, EyeOff
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Editor } from "@tinymce/tinymce-react";
import { useRouter } from "next/navigation";

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
  avatar_url?: string;
}

export default function QuestionBuilder() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // --- STATE: Paper Content ---
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [paperTitle, setPaperTitle] = useState("Monthly Assessment");
  const [instituteName, setInstituteName] = useState("NextPrep Model Test");
  const [instituteLogo, setInstituteLogo] = useState<string | null>(null);
  const [duration, setDuration] = useState("45 Mins");
  const [totalMarks, setTotalMarks] = useState(0);
  
  // Instructions State
  const [showInstructions, setShowInstructions] = useState(true);
  const [instructions, setInstructions] = useState("<ul><li>Answer all questions.</li><li>No electronic devices allowed.</li></ul>");

  // --- STATE: Filters & Discovery ---
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // Filter Values
  const [selSeg, setSelSeg] = useState("");
  const [selGrp, setSelGrp] = useState("");
  const [selSub, setSelSub] = useState("");
  const [selTopic, setSelTopic] = useState("");
  const [selType, setSelType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  // --- ACCESS CONTROL CONSTANTS ---
  const isPro = profile?.subscription_plan === 'pro' || profile?.subscription_plan === 'trial';
  const isInstitute = profile?.role === 'institute';
  const canEditBranding = isPro && isInstitute; 
  const canRemoveWatermark = isPro;

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('role, subscription_plan, institute_name, avatar_url').eq('id', user.id).single();
        setProfile(prof);
        
        if (prof) {
            if (prof.role === 'institute') {
                setInstituteName(prof.institute_name || "Institute Name");
                setInstituteLogo(prof.avatar_url || null);
            } else {
                setInstituteName("NextPrep Model Test"); 
            }
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
    if (selType) query = query.eq('question_type', selType);
    if (selTopic) query = query.ilike('topic_tag', `%${selTopic}%`);
    if (searchQuery) query = query.ilike('question_text', `%${searchQuery}%`);

    const { data } = await query.limit(50);
    if (data) setAvailableQuestions(data);
    setLoading(false);
  };

  useEffect(() => { if(selSub) searchQuestions(); }, [selSub, selType]);

  const addToPaper = (q: Question) => {
    if (selectedQuestions.some(item => item.id === q.id)) return;
    const newQ = { ...q }; // Clone for custom marks
    setSelectedQuestions(prev => [...prev, newQ]);
    setTotalMarks(prev => prev + (newQ.marks || 1));
  };

  const removeFromPaper = (id: string, currentMarks: number) => {
    setSelectedQuestions(prev => prev.filter(q => q.id !== id));
    setTotalMarks(prev => Math.max(0, prev - (currentMarks || 1)));
  };

  const updateQuestionMarks = (id: string, newMarks: number) => {
    setSelectedQuestions(prev => prev.map(q => q.id === id ? { ...q, marks: newMarks } : q));
    setTimeout(() => {
        const total = selectedQuestions.reduce((sum, q) => sum + (q.id === id ? newMarks : q.marks), 0);
        setTotalMarks(total);
    }, 0);
  };

  // --- SAVE & PRINT LOGIC ---
  const handleSaveExam = async () => {
      if (selectedQuestions.length === 0) return alert("Canvas is empty!");
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const payload = {
          tutor_id: user.id,
          title: paperTitle || "Untitled Exam",
          institute_name: instituteName,
          duration: duration,
          total_marks: totalMarks,
          questions: selectedQuestions,
          settings: {
              instructions: instructions,
              showInstructions: showInstructions,
              showWatermark: !isPro
          }
      };

      const { data, error } = await supabase.from('exams').insert(payload).select().single();

      if (error) {
          alert("Failed to save: " + error.message);
      } else {
          // Navigate to "My Exams" page to finalize/print
          router.push(`/tutor/dashboard/my-exams/${data.id}`);
      }
      setSaving(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden font-sans">
      
      {/* HEADER Actions */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm z-20">
          <div className="flex items-center gap-4">
              <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <LayoutGrid className="w-6 h-6 text-indigo-600"/> Exam Composer
              </h1>
              <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
              <div className="hidden md:flex items-baseline gap-2">
                  <span className="text-sm font-bold text-slate-500">Total:</span>
                  <span className="text-lg font-black text-slate-800">{selectedQuestions.length} Qs</span>
                  <span className="text-sm font-bold text-slate-500 ml-2">Marks:</span>
                  <span className="text-lg font-black text-indigo-600">{totalMarks}</span>
              </div>
          </div>

          <div className="flex items-center gap-3">
              <button onClick={() => setSelectedQuestions([])} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                  Clear
              </button>
              <button 
                  onClick={handleSaveExam}
                  disabled={saving || selectedQuestions.length === 0}
                  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-slate-300 disabled:opacity-50 disabled:shadow-none"
              >
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-4 h-4"/>}
                  Save Exam
              </button>
          </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
          
          {/* === COL 1: FILTERS (20%) === */}
          <div className="w-64 bg-white border-r border-slate-200 flex flex-col overflow-y-auto hidden lg:flex">
              <div className="p-4 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Filters</h3>
                  <div className="space-y-3">
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Segment</label>
                          <select className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold bg-slate-50 focus:bg-white" onChange={e => { setSelSeg(e.target.value); loadGroups(e.target.value); }}><option value="">Any</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Group</label>
                          <select className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold bg-slate-50 focus:bg-white" onChange={e => { setSelGrp(e.target.value); loadSubjects(e.target.value); }} disabled={!selSeg}><option value="">Any</option>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Subject</label>
                          <select className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold bg-slate-50 focus:bg-white" onChange={e => setSelSub(e.target.value)} disabled={!selGrp}><option value="">Any</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                      </div>
                      <hr className="border-slate-100"/>
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Type</label>
                          <select className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold bg-slate-50 focus:bg-white" onChange={e => setSelType(e.target.value)}>
                              <option value="">All</option><option value="mcq">MCQ</option><option value="passage">Passage</option><option value="descriptive">Creative</option>
                          </select>
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Topic</label>
                          <input className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold bg-slate-50 focus:bg-white outline-none" placeholder="e.g. Algebra" onChange={e => setSelTopic(e.target.value)} />
                      </div>
                  </div>
              </div>
          </div>

          {/* === COL 2: LIST (30%) === */}
          <div className="w-full lg:w-96 bg-slate-50 border-r border-slate-200 flex flex-col">
              <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10">
                  <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                      <input 
                          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
                          placeholder="Search questions..." 
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && searchQuestions()}
                      />
                  </div>
                  <button onClick={searchQuestions} className="w-full mt-2 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all">
                      Find Questions
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {loading ? (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2"><div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div><span className="text-xs font-bold">Loading...</span></div>
                  ) : availableQuestions.length === 0 ? (
                      <div className="text-center py-10 px-6 text-slate-400"><Layers className="w-10 h-10 mx-auto mb-2 opacity-30"/><p className="text-xs font-bold">No questions found.</p></div>
                  ) : (
                      availableQuestions.map(q => {
                          const isAdded = selectedQuestions.some(sq => sq.id === q.id);
                          return (
                              <div key={q.id} onClick={() => !isAdded && addToPaper(q)} className={`p-3 rounded-xl border cursor-pointer transition-all group relative ${isAdded ? 'bg-indigo-50 border-indigo-200 opacity-60' : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'}`}>
                                  <div className="flex justify-between items-start mb-1.5">
                                      <div className="flex gap-2">
                                          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{q.question_type}</span>
                                          {q.topic_tag && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[80px]">{q.topic_tag}</span>}
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{q.marks} Pts</span>
                                  </div>
                                  <div className="text-xs text-slate-700 font-medium line-clamp-3 leading-relaxed" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                                  {!isAdded ? <div className="absolute top-2 right-2 text-indigo-600 opacity-0 group-hover:opacity-100 bg-indigo-50 p-1 rounded-md transition-opacity"><Plus className="w-3.5 h-3.5"/></div> : <div className="absolute top-2 right-2 text-emerald-500"><CheckCircle className="w-3.5 h-3.5"/></div>}
                              </div>
                          );
                      })
                  )}
              </div>
          </div>

          {/* === COL 3: CANVAS (50%) === */}
          <div className="flex-1 overflow-y-auto bg-slate-100 p-4 md:p-8 flex justify-center relative">
              <div ref={printRef} className="bg-white shadow-2xl min-h-[297mm] w-[210mm] p-[20mm] relative">
                  
                  {/* HEADER */}
                  <div className="text-center border-b-2 border-black pb-4 mb-6">
                      {/* Logo */}
                      {isInstitute && instituteLogo && <div className="mb-3 flex justify-center"><img src={instituteLogo} alt="Logo" className="h-16 object-contain" /></div>}

                      {/* Institute Name */}
                      <div className="relative group inline-block w-full">
                          <input 
                              className={`w-full text-center text-4xl font-black mb-2 border-none outline-none bg-transparent ${!canEditBranding ? 'cursor-not-allowed text-slate-800' : ''}`} 
                              value={instituteName} 
                              onChange={e => canEditBranding && setInstituteName(e.target.value)} 
                              disabled={!canEditBranding} 
                          />
                          {!canEditBranding && (
                              <div className="absolute top-0 right-0 hidden group-hover:flex items-center gap-1 bg-black text-white text-[10px] px-2 py-1 rounded z-20">
                                  {isInstitute ? <Crown className="w-3 h-3 text-amber-400"/> : <Lock className="w-3 h-3"/>}
                                  {isInstitute ? "Upgrade to Edit" : "Institute Only"}
                              </div>
                          )}
                      </div>
                      
                      {!isInstitute && <p className="text-[10px] text-slate-400 mb-4 font-mono tracking-widest uppercase">Powered by NextPrep</p>}

                      {/* Exam Title */}
                      <input className="w-full text-center text-xl font-bold mb-4 border-none outline-none bg-transparent focus:bg-slate-50 rounded" value={paperTitle} onChange={e => isPro && setPaperTitle(e.target.value)} disabled={!isPro} placeholder="Exam Name / Subject"/>
                      
                      <div className="flex justify-between font-bold text-sm uppercase border-t-2 border-slate-100 pt-3 mt-2">
                          <div className="flex gap-2 items-center"><span className="text-slate-500 text-xs">Time:</span><input className="w-20 font-black outline-none border-b border-transparent focus:border-black bg-transparent text-black" value={duration} onChange={e => setDuration(e.target.value)} /></div>
                          <div className="flex gap-2 items-center"><span className="text-slate-500 text-xs">Marks:</span><span className="font-black text-black">{totalMarks}</span></div>
                      </div>
                  </div>

                  {/* INSTRUCTIONS */}
                  <div className="mb-8 relative group">
                      <div className="absolute -top-8 right-0 print:hidden opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-white shadow-sm border border-slate-100 p-1 rounded-lg">
                          <span className="text-[10px] font-bold text-slate-400 px-2">Instructions:</span>
                          <button onClick={() => setShowInstructions(!showInstructions)} className="p-1 hover:bg-slate-100 rounded">{showInstructions ? <Eye className="w-3 h-3"/> : <EyeOff className="w-3 h-3"/>}</button>
                      </div>
                      {showInstructions && (
                          <div className="text-sm text-slate-800 bg-slate-50/50 p-4 rounded-xl border border-slate-100 print:border-none print:p-0 print:bg-transparent">
                              <Editor apiKey="koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1" value={instructions} onEditorChange={(c) => isPro && setInstructions(c)} disabled={!isPro} init={{ height: 100, menubar: false, statusbar: false, plugins: ['lists'], toolbar: false }} />
                          </div>
                      )}
                  </div>

                  {/* QUESTIONS */}
                  {selectedQuestions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-slate-100 rounded-3xl print:hidden">
                          <FileText className="w-12 h-12 text-slate-300 mb-3"/>
                          <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">Canvas Empty</p>
                      </div>
                  ) : (
                      <div className="space-y-6">
                          {selectedQuestions.map((q, idx) => (
                              <div key={q.id} className="relative group break-inside-avoid pl-2 hover:bg-slate-50/50 rounded-lg -ml-2 p-2 transition-colors">
                                  <div className="flex gap-3 items-start">
                                      <span className="font-bold text-lg text-slate-800 w-6 flex-shrink-0">{idx + 1}.</span>
                                      <div className="flex-1">
                                          <div className="font-medium text-slate-900 text-sm md:text-base mb-2 leading-relaxed [&_p]:inline" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                                          {/* COMPACT MCQ GRID */}
                                          {q.question_type === 'mcq' && q.options && (
                                              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
                                                  {q.options.map((opt: any, i: number) => (
                                                      <div key={i} className="flex gap-2 text-sm items-start">
                                                          <span className="font-bold text-slate-500 text-xs mt-0.5">({String.fromCharCode(97 + i)})</span> 
                                                          <span className="text-slate-800 leading-snug">{opt.option_text}</span>
                                                      </div>
                                                  ))}
                                              </div>
                                          )}
                                      </div>
                                      <div className="min-w-[2.5rem] text-right">
                                          {isPro ? (
                                              <input className="w-10 text-right bg-slate-100 px-1 py-0.5 rounded text-xs font-bold border border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none" type="number" value={q.marks} onChange={(e) => updateQuestionMarks(q.id, Number(e.target.value))} />
                                          ) : <span className="text-xs font-bold text-slate-500">[{q.marks}]</span>}
                                      </div>
                                  </div>
                                  <div className="absolute -left-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                      <button onClick={() => removeFromPaper(q.id, q.marks)} className="p-2 bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-lg shadow-sm"><Trash2 className="w-4 h-4"/></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}

                  {/* FOOTER */}
                  <div className="mt-16 pt-6 border-t-2 border-slate-900 flex justify-between items-end break-before-auto">
                      <div className="text-center w-full">
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Good Luck</p>
                          {!canRemoveWatermark && <p className="text-[8px] text-slate-300 mt-2 font-mono">Generated by NextPrep</p>}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}