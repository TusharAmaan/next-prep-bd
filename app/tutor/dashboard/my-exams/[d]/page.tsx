"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Search, Plus, Trash2, Save, CheckCircle, 
  Loader2, ArrowLeft, Eye, X, 
  Printer, Clock, FileText, Hash, 
  Layout, Columns
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
  marks: number | string;
  topic_tag?: string;
  options?: any[];
}

interface MetaItem {
  id: string | number;
  title: string;
}

type PrintFormat = 'portrait' | 'landscape';

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
  
  // Access Control
  const [isPro, setIsPro] = useState(false);

  // Paper State
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [paperTitle, setPaperTitle] = useState("Monthly Assessment");
  const [instituteName, setInstituteName] = useState("NextPrep Model Test");
  const [duration, setDuration] = useState("45");
  const [footerText, setFooterText] = useState("Good Luck");
  const [showInstructions, setShowInstructions] = useState(true);
  const [instructions, setInstructions] = useState("<ul><li>Answer all questions.</li><li>No electronic devices allowed.</li></ul>");

  // Sidebar State
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ segment: "", group: "", subject: "", type: "", topic: "" });
  
  const [metaData, setMetaData] = useState<{
    segments: MetaItem[];
    groups: MetaItem[];
    subjects: MetaItem[];
  }>({ segments: [], groups: [], subjects: [] });

  // UI State
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printFormat, setPrintFormat] = useState<PrintFormat>('portrait');

  // --- DERIVED STATE ---
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
            // ROBUST PERMISSION CHECK
            // We convert to lower case and check if it INCLUDES 'pro' or 'trial' to be safe against spaces/casing
            const plan = (prof.subscription_plan || '').toLowerCase();
            const hasAccess = plan.includes('pro') || plan.includes('trial');
            
            setIsPro(hasAccess);
            
            // Set Institute Name logic (only override default if we aren't editing an existing paper)
            if(prof.institute_name && !isEditMode) {
                 setInstituteName(prof.institute_name);
            }
        }
      }
      
      const { data: segs } = await supabase.from('segments').select('id, title');
      if (segs) setMetaData(prev => ({ ...prev, segments: segs as MetaItem[] }));

      if (isEditMode) {
          const { data: exam } = await supabase.from('exam_papers').select('*').eq('id', routeId).single();
          if (exam) {
              setPaperTitle(exam.title);
              setInstituteName(exam.institute_name || "NextPrep Model Test");
              setDuration(exam.duration ? exam.duration.replace(/\D/g, '') : "45");
              if (exam.settings?.footerText) setFooterText(exam.settings.footerText);

              const loadedQuestions = (exam.questions || []).map((q: any) => ({
                  ...q,
                  marks: q.marks !== undefined ? q.marks : (q.default_marks || 0)
              }));
              setSelectedQuestions(loadedQuestions);

              if (exam.settings) {
                  setShowInstructions(exam.settings.showInstructions);
                  setInstructions(exam.settings.instructions);
              }
              setAvailableQuestions(loadedQuestions); 
          }
      } else {
        searchQuestions();
      }
      setInitialLoading(false);
    };
    init();
  }, [routeId, isEditMode]);

  // --- 2. DATA & FILTERING ---
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
            marks: q.marks 
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

  const updateQuestionMark = (id: string, newMark: string) => {
    if (newMark === "") {
        setSelectedQuestions(prev => prev.map(q => q.id === id ? { ...q, marks: "" } : q));
        return;
    }
    const num = parseFloat(newMark);
    if (!isNaN(num)) {
        setSelectedQuestions(prev => prev.map(q => q.id === id ? { ...q, marks: num } : q));
    }
  };

  // --- 4. ADVANCED PRINTING ENGINE (FIXED) ---
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isLandscape = printFormat === 'landscape';

    // --- FIX: DEFINING HEADER HTML HERE ---
    const headerHtml = `
      <div class="header-block">
          <h1>${instituteName}</h1>
          <h2>${paperTitle}</h2>
          <div class="meta-bar">
              <span>Time: ${duration} Mins</span>
              <span>Total Marks: ${totalMarks}</span>
          </div>
          ${showInstructions ? `<div class="instructions">${instructions}</div>` : ''}
          <div class="separator"></div>
      </div>
    `;

    // Generate Question HTML
    const questionsHtml = selectedQuestions.map((q, idx) => {
        const optionsHtml = (q.options && q.options.length > 0)
          ? `<div class="options-grid">
              ${q.options.map((opt: any, i: number) => 
                `<div class="option"><strong>${String.fromCharCode(97 + i)})</strong> ${opt.option_text}</div>`
              ).join('')}
             </div>` 
          : '';
        
        return `
            <div class="question-block">
                <div class="q-marks">[${q.marks}]</div>
                <div class="q-num">${idx + 1}.</div>
                <div class="q-text">
                    ${q.question_text}
                    ${optionsHtml}
                </div>
            </div>
        `;
    }).join('');

    const cssStyles = `
      @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Inter:wght@400;600;800&display=swap');
      
      @page {
          size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
          /* OPTIMIZED MARGINS: 8mm bottom to reduce waste */
          margin: 10mm 10mm 8mm 10mm;
      }
      
      body { 
          font-family: 'Merriweather', serif; 
          color: #1a1a1a; 
          margin: 0; padding: 0;
          -webkit-print-color-adjust: exact;
      }

      /* --- LAYOUT LOGIC --- */
      .content-wrapper {
          ${isLandscape ? 'column-count: 2; column-gap: 30px;' : ''}
          width: 100%;
      }

      /* --- HEADER STYLES --- */
      .header-block {
          text-align: center;
          margin-bottom: 15px;
          break-inside: avoid; 
      }
      h1 { margin: 0; font-size: 22px; text-transform: uppercase; font-family: 'Inter', sans-serif; font-weight: 800; }
      h2 { margin: 5px 0 10px 0; font-size: 14px; font-weight: normal; color: #444; }
      
      .meta-bar { 
          display: flex; justify-content: space-between; 
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; 
          text-transform: uppercase; border-top: 2px solid #000; border-bottom: 2px solid #000;
          padding: 4px 0; margin-bottom: 10px;
      }

      .instructions { 
          font-size: 12px; font-style: italic; margin-bottom: 15px; 
          text-align: left; background: #f9f9f9; padding: 5px;
          line-height: 1.3;
      }
      .separator { border-bottom: 1px solid #ddd; margin-bottom: 15px; }

      /* --- QUESTION BLOCK STYLES --- */
      .question-block {
          margin-bottom: 12px;
          display: block; 
          position: relative;
          padding-left: 25px; /* Indent for Q Number */
          break-inside: auto; /* Allow breaking naturally */
      }

      /* Marks Floated Right */
      .q-marks {
          float: right;
          font-family: 'Inter', sans-serif; 
          font-weight: 700; 
          font-size: 13px; 
          margin-left: 8px;
          background: #fff;
          padding-left: 5px;
      }

      .q-num {
          position: absolute; left: 0; top: 0;
          font-weight: bold; font-size: 13px; font-family: 'Inter', sans-serif;
      }

      .q-text { 
          font-size: 13px; 
          line-height: 1.5; 
          text-align: justify; /* Justify Text */
          text-justify: inter-word;
      }
      .q-text p { margin: 0; display: inline; }
      
      .options-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 4px; 
          margin-top: 5px; 
          clear: both;
      }
      .option { font-size: 12px; }

      .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 11px; font-weight: bold; text-transform: uppercase; color: #888;
          break-inside: avoid;
          border-top: 1px solid #eee;
          padding-top: 5px;
      }
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>${paperTitle}</title>
          <style>${cssStyles}</style>
        </head>
        <body>
          <div class="content-wrapper">
              ${headerHtml}
              ${questionsHtml}
              <div class="footer">${footerText}</div>
          </div>
          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setShowPrintModal(false);
  };

  // --- 5. SAVE ---
  const handleSave = async () => {
    if (selectedQuestions.length === 0) return alert("Please add questions first!");
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
        settings: { instructions, showInstructions, footerText },
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
              <button 
                onClick={() => setShowPrintModal(true)} 
                className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-bold text-xs hover:bg-slate-50 transition-all shadow-sm"
              >
                  <Printer className="w-4 h-4 text-indigo-600"/> Print
              </button>
              
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold text-xs hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} 
                  <span>{isEditMode ? "Update" : "Save"}</span>
              </button>
          </div>
      </div>

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex flex-1 overflow-hidden">
          
          {/* SIDEBAR: FILTERS & QUESTIONS */}
          <div className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col z-20 flex-none shadow-[2px_0_10px_-5px_rgba(0,0,0,0.1)]">
              {/* Robust Filters always visible */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="relative mb-3">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                      <input className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-white shadow-sm" placeholder="Search keywords..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchQuestions()}/>
                  </div>
                  
                  <div className="space-y-2">
                     <div className="grid grid-cols-2 gap-2">
                          <select className="text-xs border border-slate-200 p-2 rounded bg-white w-full outline-none focus:border-indigo-500" onChange={e => loadGroups(e.target.value)}><option value="">Segment</option>{metaData.segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                          <select className="text-xs border border-slate-200 p-2 rounded bg-white w-full outline-none focus:border-indigo-500" onChange={e => loadSubjects(e.target.value)}><option value="">Group</option>{metaData.groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                     </div>
                     <select className="text-xs border border-slate-200 p-2 rounded bg-white w-full outline-none focus:border-indigo-500" onChange={e => setFilters({...filters, subject: e.target.value})}><option value="">Subject</option>{metaData.subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                     
                     <div className="grid grid-cols-2 gap-2">
                        <select className="text-xs border border-slate-200 p-2 rounded bg-white w-full outline-none focus:border-indigo-500" onChange={e => setFilters({...filters, type: e.target.value})}><option value="">All Types</option><option value="mcq">MCQ</option><option value="passage">Passage</option><option value="descriptive">Creative</option></select>
                        <input className="text-xs border border-slate-200 p-2 rounded bg-white w-full outline-none focus:border-indigo-500" placeholder="Topic Tag..." onChange={e => setFilters({...filters, topic: e.target.value})} />
                     </div>
                     
                     <button onClick={searchQuestions} className="w-full bg-slate-800 text-white py-2 rounded text-xs font-bold hover:bg-slate-900 transition-all shadow-sm">Search Questions</button>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-100/50">
                  {availableQuestions.map(q => {
                      const isAdded = selectedQuestions.some(sq => sq.id === q.id);
                      return (
                          <div key={q.id} className={`p-3 bg-white rounded-lg border transition-all hover:shadow-md group relative ${isAdded ? 'opacity-60 border-indigo-100 bg-indigo-50/20' : 'border-slate-200 hover:border-indigo-300'}`}>
                              <div className="flex justify-between items-start mb-1">
                                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">{q.question_type}</span>
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{q.default_marks || 0} pts</span>
                              </div>
                              <div className="text-xs text-slate-800 line-clamp-2 mb-2 font-medium leading-relaxed" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                              <div className="flex gap-2 mt-2">
                                  <button onClick={(e) => { e.stopPropagation(); setPreviewQuestion(q); }} className="p-1.5 bg-slate-50 text-slate-500 rounded hover:bg-slate-100 hover:text-indigo-600"><Eye className="w-3.5 h-3.5"/></button>
                                  <button onClick={() => !isAdded && addToPaper(q)} className={`flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors ${isAdded ? 'bg-green-100 text-green-700 cursor-default' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}`}>
                                      {isAdded ? <CheckCircle className="w-3 h-3"/> : <Plus className="w-3 h-3"/>} {isAdded ? "Added" : "Add"}
                                  </button>
                              </div>
                          </div>
                      );
                  })}
                  {availableQuestions.length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs">No questions found.</div>
                  )}
              </div>
          </div>

          {/* CENTER: PAPER CANVAS */}
          <div className="flex-1 overflow-y-auto bg-slate-200/80 p-4 md:p-6 flex justify-center relative">
              <div className="bg-white shadow-xl w-full max-w-[210mm] min-h-[297mm] h-fit p-[15mm] md:p-[20mm] relative transition-all duration-300 origin-top flex flex-col">
                  
                  {/* HEADER (Editable) */}
                  <div className="text-center border-b-2 border-slate-900 pb-4 mb-6 group hover:bg-slate-50/50 p-2 rounded transition-colors relative">
                      <input 
                        className={`w-full text-center text-3xl font-black mb-2 outline-none placeholder:text-slate-300 bg-transparent uppercase tracking-tight ${!isPro ? 'cursor-not-allowed text-slate-400' : 'text-slate-900 focus:text-indigo-900'}`} 
                        value={instituteName} 
                        onChange={e => isPro && setInstituteName(e.target.value)} 
                        disabled={!isPro} 
                        placeholder="INSTITUTE NAME"
                      />
                      
                      <input 
                        className="w-full text-center text-lg font-medium mb-4 outline-none bg-transparent text-slate-700 focus:text-indigo-700" 
                        value={paperTitle} 
                        onChange={e => setPaperTitle(e.target.value)} 
                        placeholder="Subject / Exam Title"
                      />

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
                      
                      {!isPro && <span className="absolute top-2 right-2 text-[10px] font-bold text-amber-500 border border-amber-200 bg-amber-50 px-2 py-0.5 rounded-full">LOCKED</span>}
                  </div>

                  {/* INSTRUCTIONS */}
                  <div className="mb-8 group relative flex-none">
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

                  {/* QUESTIONS */}
                  <div className="space-y-6 flex-1">
                      {selectedQuestions.map((q, idx) => (
                          <div key={q.id} className="relative group pl-3 hover:bg-slate-50 transition-colors rounded -ml-3 p-2 break-inside-avoid border border-transparent hover:border-slate-200">
                              <div className="flex gap-4 items-start">
                                  <span className="font-bold text-lg w-6 flex-shrink-0 text-slate-900 pt-0.5">{idx + 1}.</span>
                                  <div className="flex-1">
                                      <div className="font-medium text-slate-900 text-base leading-relaxed font-serif [&_p]:inline" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
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
                              <div className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                  <button onClick={() => removeFromPaper(q.id)} className="p-2 bg-white border border-red-100 text-red-500 rounded shadow-sm hover:bg-red-50" title="Remove Question">
                                      <Trash2 className="w-4 h-4"/>
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>

                  {/* FOOTER */}
                  <div className="mt-16 pt-4 border-t border-slate-300 text-center flex-none">
                      <input 
                          className="w-full text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 outline-none bg-transparent hover:text-slate-600 focus:text-indigo-600"
                          value={footerText}
                          onChange={(e) => setFooterText(e.target.value)}
                          placeholder="WRITE FOOTER HERE..."
                      />
                  </div>
              </div>
          </div>
      </div>

      {/* PRINT MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
             <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="text-lg font-bold text-slate-800">Print Settings</h3>
                     <button onClick={() => setShowPrintModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 mb-8">
                     <button 
                        onClick={() => setPrintFormat('portrait')}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${printFormat === 'portrait' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                     >
                         <Layout className="w-8 h-8"/>
                         <span className="font-bold text-sm">Portrait</span>
                         <span className="text-[10px] text-slate-500">Standard A4</span>
                     </button>
                     
                     <button 
                        onClick={() => setPrintFormat('landscape')}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${printFormat === 'landscape' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                     >
                         <Columns className="w-8 h-8"/>
                         <span className="font-bold text-sm">Landscape</span>
                         <span className="text-[10px] text-slate-500">2-Column Saver</span>
                     </button>
                 </div>
                 
                 <button onClick={handlePrint} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                     <Printer className="w-5 h-5"/> Print Now
                 </button>
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