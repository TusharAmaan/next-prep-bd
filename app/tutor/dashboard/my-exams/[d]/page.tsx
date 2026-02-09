"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Search, Plus, Trash2, Save, CheckCircle, 
  Loader2, ArrowLeft, Eye, X, MonitorPlay, EyeOff,
  Printer, Pencil, ChevronDown, ChevronUp, Clock, FileText, Hash
} from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

// --- TYPES ---
interface Question {
  id: string;
  question_text: string;
  question_type: string;
  default_marks: number;
  marks: number | string; // FIXED: Allow string so input can be empty while typing
  topic_tag?: string;
  options?: any[];
}

interface MetaItem {
  id: string | number;
  title: string;
}

function BuilderContent() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams(); 
  
  const routeId = params?.d as string;
  const isEditMode = routeId && routeId !== 'new' && routeId !== 'create';

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPro, setIsPro] = useState(false);
  
  // Paper State
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [paperTitle, setPaperTitle] = useState("Monthly Assessment");
  const [instituteName, setInstituteName] = useState("NextPrep Model Test");
  const [duration, setDuration] = useState("45");
  const [showInstructions, setShowInstructions] = useState(true);
  const [instructions, setInstructions] = useState("<ul><li>Answer all questions.</li><li>No electronic devices allowed.</li></ul>");

  // Sidebar State
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ segment: "", group: "", subject: "", type: "", topic: "" });
  const [showFilters, setShowFilters] = useState(false);
  
  const [metaData, setMetaData] = useState<{
    segments: MetaItem[];
    groups: MetaItem[];
    subjects: MetaItem[];
  }>({ segments: [], groups: [], subjects: [] });

  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [showPaperOverview, setShowPaperOverview] = useState(false);

  // Derived State (Robust Total Calculation)
  const totalMarks = useMemo(() => {
    return selectedQuestions.reduce((sum, q) => {
        const m = typeof q.marks === 'string' ? parseFloat(q.marks) : q.marks;
        return sum + (isNaN(m) ? 0 : m);
    }, 0);
  }, [selectedQuestions]);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const init = async () => {
      setInitialLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('subscription_plan, institute_name').eq('id', user.id).single();
        if (prof) {
            setIsPro(prof.subscription_plan === 'pro' || prof.subscription_plan === 'trial');
            if(prof.institute_name && !isEditMode) setInstituteName(prof.institute_name);
        }
      }
      
      const { data: segs } = await supabase.from('segments').select('id, title');
      if (segs) setMetaData(prev => ({ ...prev, segments: segs as MetaItem[] }));

      if (isEditMode) {
          const { data: exam, error } = await supabase.from('exam_papers').select('*').eq('id', routeId).single();
          if (exam) {
              setPaperTitle(exam.title);
              setInstituteName(exam.institute_name || "NextPrep Model Test");
              setDuration(exam.duration ? exam.duration.replace(/\D/g, '') : "45");
              
              // FIXED: Ensure loaded questions allow editing by sanitizing 'marks'
              const loadedQuestions = (exam.questions || []).map((q: any) => ({
                  ...q,
                  marks: q.marks !== undefined ? q.marks : (q.default_marks || 0)
              }));
              setSelectedQuestions(loadedQuestions);

              if (exam.settings) {
                  setShowInstructions(exam.settings.showInstructions);
                  setInstructions(exam.settings.instructions);
              }
              // Populate sidebar with something so it isn't empty
              setAvailableQuestions(loadedQuestions);
          }
      } else {
        searchQuestions();
      }
      setInitialLoading(false);
    };
    init();
  }, [routeId, isEditMode]);

  // --- 2. DATA FETCHING ---
  const loadGroups = async (segId: string) => {
    const { data } = await supabase.from('groups').select('id, title').eq('segment_id', segId);
    if (data) {
        setMetaData(prev => ({ ...prev, groups: data as MetaItem[] }));
        setFilters(prev => ({ ...prev, segment: segId, group: "", subject: "" }));
    }
  };

  const loadSubjects = async (grpId: string) => {
    const { data } = await supabase.from('subjects').select('id, title').eq('group_id', grpId);
    if (data) {
        setMetaData(prev => ({ ...prev, subjects: data as MetaItem[] }));
        setFilters(prev => ({ ...prev, group: grpId, subject: "" }));
    }
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
    if (filters.topic) query = query.ilike('topic_tag', `%${filters.topic}%`);
    if (search) query = query.ilike('question_text', `%${search}%`);

    const { data } = await query;
    if (data) {
        const mapped = data.map((q: any) => ({
            ...q,
            default_marks: q.marks,
            marks: q.marks // Initialize editable mark
        }));
        setAvailableQuestions(mapped);
    }
    setLoading(false);
  };

  // --- 3. ACTIONS ---
  const addToPaper = (q: Question) => {
    if (selectedQuestions.some(item => item.id === q.id)) return;
    const newQ = { ...q, marks: q.default_marks || q.marks }; 
    setSelectedQuestions([...selectedQuestions, newQ]);
  };

  const removeFromPaper = (id: string) => {
    setSelectedQuestions(selectedQuestions.filter(q => q.id !== id));
  };

  // FIXED: MARK UPDATE LOGIC
  const updateQuestionMark = (id: string, newMark: string) => {
    // 1. Allow empty string (clearing the input)
    if (newMark === "") {
        setSelectedQuestions(prev => prev.map(q => q.id === id ? { ...q, marks: "" } : q));
        return;
    }

    // 2. Allow valid numbers
    const num = parseFloat(newMark);
    if (!isNaN(num)) {
        setSelectedQuestions(prev => prev.map(q => q.id === id ? { ...q, marks: num } : q));
    }
  };

  // --- 4. PRINT / SAVE ---
  const handlePrintPaper = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const questionsHtml = selectedQuestions.map((q, idx) => {
        const optionsHtml = (q.options && q.options.length > 0)
          ? `<div style="margin-top:8px; display:grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-left: 20px;">
              ${q.options.map((opt: any, i: number) => 
                `<div style="font-size:14px;"><strong>${String.fromCharCode(97 + i)})</strong> ${opt.option_text}</div>`
              ).join('')}
             </div>` 
          : '';
        
        return `
            <div style="margin-bottom: 20px; page-break-inside: avoid;">
                <div style="display: flex; gap: 10px; align-items: baseline;">
                    <div style="font-weight: bold; width: 25px; flex-shrink: 0;">${idx + 1}.</div>
                    <div style="flex: 1;">
                        <div style="font-size: 15px; line-height: 1.5;">${q.question_text}</div>
                        ${optionsHtml}
                    </div>
                    <div style="font-weight: bold; font-size: 14px; width: 30px; text-align: right;">[${q.marks}]</div>
                </div>
            </div>
        `;
    }).join('');

    const instructionsHtml = showInstructions 
        ? `<div style="font-size: 13px; font-style: italic; margin-bottom: 25px; padding: 10px; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">${instructions}</div>` 
        : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>${paperTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap');
            body { font-family: 'Merriweather', serif; padding: 40px; max-width: 210mm; margin: 0 auto; color: #1a1a1a; }
            h1 { text-align: center; margin: 0 0 10px 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            h2 { text-align: center; margin: 0 0 25px 0; font-size: 16px; font-weight: normal; color: #4a4a4a; }
            .header-meta { display: flex; justify-content: space-between; font-weight: bold; font-family: sans-serif; font-size: 13px; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 20px; text-transform: uppercase; }
            @media print {
                body { padding: 0; width: 100%; margin: 20mm 15mm; }
            }
          </style>
        </head>
        <body>
          <h1>${instituteName}</h1>
          <h2>${paperTitle}</h2>
          
          <div class="header-meta">
              <span>Time: ${duration} Mins</span>
              <span>Total Marks: ${totalMarks}</span>
          </div>

          ${instructionsHtml}
          <div class="questions">${questionsHtml}</div>

          <script>window.onload = () => { setTimeout(() => { window.print(); }, 500); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSave = async () => {
    if (selectedQuestions.length === 0) return alert("Please add questions first!");
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // SANITIZE: Convert any empty strings back to 0 before saving
    const sanitizedQuestions = selectedQuestions.map(q => ({
        ...q,
        marks: (q.marks === "" || q.marks === undefined) ? 0 : Number(q.marks)
    }));

    const payload = {
        user_id: user.id,
        title: paperTitle,
        institute_name: instituteName,
        duration: `${duration} Mins`,
        total_marks: totalMarks,
        questions: sanitizedQuestions,
        settings: { instructions, showInstructions },
        is_finalized: true 
    };

    let error, newId;
    if (isEditMode) {
        const { error: updateError } = await supabase.from('exam_papers').update(payload).eq('id', routeId);
        error = updateError;
    } else {
        const { data: newExam, error: insertError } = await supabase.from('exam_papers').insert(payload).select().single();
        error = insertError;
        if(newExam) newId = newExam.id;
    }

    if (error) alert("Save Failed: " + error.message);
    else {
        alert("Saved Successfully!");
        if(newId) router.push(`/tutor/dashboard/my-exams/${newId}`);
    }
    setSaving(false);
  };

  if(initialLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600"/></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 font-sans text-slate-900">
      
      {/* --- TOP TOOLBAR --- */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex justify-between items-center shadow-sm z-30 h-16 flex-none">
          <div className="flex items-center gap-4">
              <Link href="/tutor/dashboard/my-exams" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-indigo-600 transition-colors">
                  <ArrowLeft className="w-5 h-5"/>
              </Link>
              <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
              <div>
                  <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600"/>
                      {isEditMode ? "Edit Mode" : "New Exam"}
                  </h1>
                  <p className="text-xs text-slate-500">
                      {selectedQuestions.length} Questions • {totalMarks} Marks
                  </p>
              </div>
          </div>
          
          <div className="flex gap-2">
              {isEditMode && (
                  <button onClick={handlePrintPaper} className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-3 py-2 rounded-lg font-bold text-xs hover:bg-slate-50 transition-all shadow-sm">
                      <Printer className="w-4 h-4 text-indigo-600"/> Print
                  </button>
              )}
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold text-xs hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} 
                  <span>{isEditMode ? "Update" : "Save"}</span>
              </button>
          </div>
      </div>

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex flex-1 overflow-hidden">
          
          {/* LEFT SIDEBAR: QUESTION BANK */}
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 flex-none shadow-[2px_0_10px_-5px_rgba(0,0,0,0.1)]">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="relative mb-3">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                      <input className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-white shadow-sm" placeholder="Search bank..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchQuestions()}/>
                  </div>
                  
                  <button onClick={() => setShowFilters(!showFilters)} className="w-full flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-indigo-600 mb-2">
                      <span>Filters</span>
                      {showFilters ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                  </button>

                  {showFilters && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-200 mb-2">
                         <div className="grid grid-cols-2 gap-2">
                              <select className="text-xs border border-slate-200 p-1.5 rounded bg-white w-full" onChange={e => loadGroups(e.target.value)}><option value="">Segment</option>{metaData.segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                              <select className="text-xs border border-slate-200 p-1.5 rounded bg-white w-full" onChange={e => loadSubjects(e.target.value)}><option value="">Group</option>{metaData.groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                         </div>
                         <select className="text-xs border border-slate-200 p-1.5 rounded bg-white w-full" onChange={e => setFilters({...filters, subject: e.target.value})}><option value="">Subject</option>{metaData.subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                         <button onClick={searchQuestions} className="w-full bg-slate-800 text-white py-1.5 rounded text-xs font-bold hover:bg-slate-900">Apply Filters</button>
                      </div>
                  )}
              </div>

              {/* Question List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-100/50">
                  {availableQuestions.map(q => {
                      const isAdded = selectedQuestions.some(sq => sq.id === q.id);
                      return (
                          <div key={q.id} className={`p-3 bg-white rounded-lg border transition-all hover:shadow-md group relative ${isAdded ? 'opacity-50 border-indigo-200' : 'border-slate-200 hover:border-indigo-300'}`}>
                              <div className="flex justify-between items-start mb-1">
                                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">{q.question_type}</span>
                                  <span className="text-[10px] font-bold text-slate-400">{q.default_marks || 0} pts</span>
                              </div>
                              <div className="text-xs text-slate-800 line-clamp-2 mb-2 font-medium leading-relaxed" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                              <div className="flex gap-2 mt-2">
                                  <button onClick={(e) => { e.stopPropagation(); setPreviewQuestion(q); }} className="p-1.5 bg-slate-50 text-slate-500 rounded hover:bg-slate-100 hover:text-indigo-600"><Eye className="w-3.5 h-3.5"/></button>
                                  <button onClick={() => !isAdded && addToPaper(q)} className={`flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors ${isAdded ? 'bg-green-50 text-green-600 cursor-default' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}`}>
                                      {isAdded ? <CheckCircle className="w-3 h-3"/> : <Plus className="w-3 h-3"/>} {isAdded ? "Added" : "Add"}
                                  </button>
                              </div>
                          </div>
                      );
                  })}
                  {availableQuestions.length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs">No questions found.<br/>Try adjusting filters.</div>
                  )}
              </div>
          </div>

          {/* CENTER: PAPER CANVAS */}
          <div className="flex-1 overflow-y-auto bg-slate-200/80 p-6 md:p-8 flex justify-center relative">
              
              {/* THE PAGE (A4 Visual) */}
              <div className="bg-white shadow-2xl w-[210mm] min-h-[297mm] h-fit p-[15mm] md:p-[20mm] relative transition-all duration-300 origin-top">
                  
                  {/* --- DOC HEADER (Editable) --- */}
                  <div className="text-center border-b-2 border-slate-900 pb-4 mb-6 group hover:bg-slate-50/50 p-2 rounded transition-colors relative">
                      {/* Institute Name Input */}
                      <input 
                        className={`w-full text-center text-3xl font-black mb-2 outline-none placeholder:text-slate-300 bg-transparent uppercase tracking-tight ${!isPro ? 'cursor-not-allowed text-slate-400' : 'text-slate-900 focus:text-indigo-900'}`} 
                        value={instituteName} 
                        onChange={e => isPro && setInstituteName(e.target.value)} 
                        disabled={!isPro} 
                        placeholder="INSTITUTE NAME"
                      />
                      
                      {/* Paper Title Input */}
                      <input 
                        className="w-full text-center text-lg font-medium mb-4 outline-none bg-transparent text-slate-700 focus:text-indigo-700" 
                        value={paperTitle} 
                        onChange={e => setPaperTitle(e.target.value)} 
                        placeholder="Subject / Exam Title"
                      />

                      {/* Meta Data Bar */}
                      <div className="flex justify-between items-center font-bold text-sm uppercase border-t-2 border-slate-100 pt-3 text-slate-800 px-4">
                          <div className="flex gap-2 items-center bg-slate-100 px-3 py-1 rounded">
                              <Clock className="w-4 h-4 text-slate-500"/>
                              <span className="text-slate-500 text-xs">Time:</span>
                              <input 
                                className="w-12 font-black outline-none bg-transparent text-slate-900 border-b border-transparent focus:border-indigo-500 text-center" 
                                value={duration} 
                                onChange={e => setDuration(e.target.value)} 
                                type="text"
                              />
                              <span className="text-xs text-slate-500">mins</span>
                          </div>
                          
                          <div className="flex gap-2 items-center bg-slate-100 px-3 py-1 rounded">
                              <Hash className="w-4 h-4 text-slate-500"/>
                              <span className="text-slate-500 text-xs">Marks:</span>
                              <span className="font-black text-indigo-700 text-lg">{totalMarks}</span>
                          </div>
                      </div>
                      
                      {!isPro && <span className="absolute top-2 right-2 text-[10px] font-bold text-amber-500 border border-amber-200 bg-amber-50 px-2 py-0.5 rounded-full">PRO FEATURE</span>}
                  </div>

                  {/* --- INSTRUCTIONS SECTION --- */}
                  <div className="mb-8 group relative">
                      <div className="flex justify-between items-center mb-1 print:hidden opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 right-0">
                          <button onClick={() => setShowInstructions(!showInstructions)} className="text-xs text-indigo-600 font-bold hover:underline flex gap-1 items-center bg-white px-2 py-0.5 rounded shadow-sm border">
                            {showInstructions ? "Hide Instructions" : "Show Instructions"}
                          </button>
                      </div>
                      {showInstructions && (
                        <div className="text-sm text-slate-800 leading-relaxed p-2 rounded border border-transparent hover:border-slate-200 transition-colors">
                           <Editor apiKey="koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1" value={instructions} onEditorChange={c => setInstructions(c)} init={{ height: 100, menubar: false, toolbar: false, statusbar: false, content_style: 'body { font-family:serif; font-size:14px; }' }} />
                        </div>
                      )}
                  </div>

                  {/* --- QUESTIONS LIST (The Real Content) --- */}
                  <div className="space-y-6">
                      {selectedQuestions.length === 0 && (
                          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl">
                              <p className="text-slate-400 font-medium">Your paper is empty.</p>
                              <p className="text-slate-300 text-sm mt-1">Add questions from the left sidebar.</p>
                          </div>
                      )}

                      {selectedQuestions.map((q, idx) => (
                          <div key={q.id} className="relative group pl-3 hover:bg-slate-50 transition-colors rounded -ml-3 p-2 break-inside-avoid border border-transparent hover:border-slate-200">
                              <div className="flex gap-4 items-start">
                                  {/* Q Index */}
                                  <span className="font-bold text-lg w-6 flex-shrink-0 text-slate-900 pt-0.5">{idx + 1}.</span>
                                  
                                  {/* Q Content */}
                                  <div className="flex-1">
                                      <div className="font-medium text-slate-900 text-base leading-relaxed font-serif [&_p]:inline" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                                      
                                      {/* MCQ Options */}
                                      {q.question_type === 'mcq' && q.options && (
                                          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3 ml-2">
                                              {q.options.map((opt:any, i:number) => (
                                                  <div key={i} className="flex gap-2 text-sm items-start text-slate-800">
                                                      <span className="font-bold text-slate-500 text-xs mt-0.5">({String.fromCharCode(97 + i)})</span>
                                                      <span className="leading-snug">{opt.option_text}</span>
                                                  </div>
                                              ))}
                                          </div>
                                      )}
                                  </div>

                                  {/* Editable Marks */}
                                  <div className="w-16 text-right flex flex-col items-end">
                                      <div className="flex items-center gap-1 relative">
                                        <span className="text-slate-400 text-xs font-bold absolute -left-3">[</span>
                                        <input 
                                            type="text" 
                                            className="w-10 text-center font-bold text-base bg-transparent border-b border-transparent focus:border-indigo-500 focus:bg-white outline-none text-slate-900 p-0" 
                                            value={q.marks} 
                                            onChange={(e) => updateQuestionMark(q.id, e.target.value)}
                                            onFocus={(e) => e.target.select()}
                                            placeholder="0"
                                        />
                                        <span className="text-slate-400 text-xs font-bold absolute -right-3">]</span>
                                      </div>
                                  </div>
                              </div>

                              {/* Hover Actions */}
                              <div className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                  <button onClick={() => removeFromPaper(q.id)} className="p-2 bg-white border border-red-100 text-red-500 rounded shadow-sm hover:bg-red-50" title="Remove Question">
                                      <Trash2 className="w-4 h-4"/>
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>

                  {/* --- FOOTER --- */}
                  <div className="mt-16 pt-6 border-t border-slate-300 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">End of Exam</p>
                  </div>
              </div>
          </div>
      </div>

      {/* --- PREVIEW MODAL --- */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Question Preview</h3>
                    <button onClick={() => setPreviewQuestion(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400"/></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="prose prose-sm max-w-none text-slate-800" dangerouslySetInnerHTML={{__html: previewQuestion.question_text}}></div>
                    {previewQuestion.options && (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            {previewQuestion.options.map((opt:any, i:number) => (
                                <div key={i} className="flex gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                                    <span className="font-bold text-slate-400">{String.fromCharCode(65+i)}</span>
                                    <span className="text-sm">{opt.option_text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-2">
                    <button onClick={() => setPreviewQuestion(null)} className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-200 rounded-lg">Close</button>
                    <button onClick={() => { addToPaper(previewQuestion); setPreviewQuestion(null); }} className="px-5 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700">Add to Paper</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default function QuestionBuilder() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600"/></div>}>
      <BuilderContent />
    </Suspense>
  );
}