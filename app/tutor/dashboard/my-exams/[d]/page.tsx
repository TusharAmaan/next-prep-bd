"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Search, Plus, Trash2, Save, CheckCircle, 
  Loader2, ArrowLeft, Eye, X, MonitorPlay, EyeOff,
  Printer, Pencil 
} from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { useRouter, useParams } from "next/navigation"; // Changed useSearchParams to useParams
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

function BuilderContent() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams(); 
  
  // LOGIC: If 'd' is 'new' or 'create', we are making a new one. Otherwise, it's an ID.
  const routeId = params?.d as string;
  const isEditMode = routeId && routeId !== 'new' && routeId !== 'create';

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPro, setIsPro] = useState(false);
  
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [paperTitle, setPaperTitle] = useState("Monthly Assessment");
  const [instituteName, setInstituteName] = useState("NextPrep Model Test");
  const [duration, setDuration] = useState("45 Mins");
  const [totalMarks, setTotalMarks] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [instructions, setInstructions] = useState("<ul><li>Answer all questions.</li><li>No electronic devices allowed.</li></ul>");

  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ segment: "", group: "", subject: "", type: "", topic: "" });
  
  const [metaData, setMetaData] = useState<{
    segments: MetaItem[];
    groups: MetaItem[];
    subjects: MetaItem[];
  }>({ segments: [], groups: [], subjects: [] });

  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [showPaperOverview, setShowPaperOverview] = useState(false);

  // --- 1. INITIAL LOAD & EDIT MODE CHECK ---
  useEffect(() => {
    const init = async () => {
      setInitialLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('subscription_plan, institute_name').eq('id', user.id).single();
        if (prof) {
            setIsPro(prof.subscription_plan === 'pro' || prof.subscription_plan === 'trial');
            // Only set default institute name if we are NOT editing (to avoid overwriting saved name)
            if(prof.institute_name && !isEditMode) setInstituteName(prof.institute_name);
        }
      }
      
      // Load Segments for Filter
      const { data: segs } = await supabase.from('segments').select('id, title');
      if (segs) setMetaData(prev => ({ ...prev, segments: segs as MetaItem[] }));

      // Load Existing Exam Data if in Edit Mode
      if (isEditMode) {
          const { data: exam, error } = await supabase.from('exam_papers').select('*').eq('id', routeId).single();
          
          if (exam) {
              setPaperTitle(exam.title);
              setInstituteName(exam.institute_name || "NextPrep Model Test");
              setDuration(exam.duration);
              setTotalMarks(exam.total_marks);
              setSelectedQuestions(exam.questions || []);
              if (exam.settings) {
                  setShowInstructions(exam.settings.showInstructions);
                  setInstructions(exam.settings.instructions);
              }
              // OPTION B: Also populate the "Available" list with these questions so they are visible on the left too?
              // Standard behavior is usually to show the bank, but we can seed the list with the selected ones 
              // so the user sees the "Added" status immediately.
              setAvailableQuestions(exam.questions || []); 
          } else if (error) {
              console.error("Error loading exam:", error);
              // alert("Could not load exam. It might have been deleted.");
          }
      } else {
          // If new, maybe load some default questions or leave empty
          searchQuestions(); // Load initial batch of 50
      }
      setInitialLoading(false);
    };
    init();
  }, [routeId, isEditMode]); // Depend on routeId

  // --- 2. FILTER LOGIC ---
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
    if (data) setAvailableQuestions(data);
    setLoading(false);
  };

  // --- 3. ACTIONS ---
  const addToPaper = (q: Question) => {
    if (selectedQuestions.some(item => item.id === q.id)) return;
    const newQ = { ...q }; 
    const updated = [...selectedQuestions, newQ];
    setSelectedQuestions(updated);
    recalcTotal(updated);
  };

  const removeFromPaper = (id: string) => {
    const updated = selectedQuestions.filter(q => q.id !== id);
    setSelectedQuestions(updated);
    recalcTotal(updated);
  };

  const updateMark = (id: string, newMark: number) => {
    const updated = selectedQuestions.map(q => q.id === id ? { ...q, marks: newMark } : q);
    setSelectedQuestions(updated);
    recalcTotal(updated);
  };

  const recalcTotal = (questions: Question[]) => {
    const total = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    setTotalMarks(total);
  };

  // --- 4. PRINTING (WHOLE PAPER) ---
  const handlePrintPaper = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const questionsHtml = selectedQuestions.map((q, idx) => {
        const optionsHtml = (q.options && q.options.length > 0)
          ? `<div style="margin-top:10px; display:grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-left: 20px;">
              ${q.options.map((opt: any, i: number) => 
                `<div style="font-size:14px;"><strong>${String.fromCharCode(97 + i)})</strong> ${opt.option_text}</div>`
              ).join('')}
             </div>` 
          : '';
        
        return `
            <div style="margin-bottom: 25px; page-break-inside: avoid;">
                <div style="display: flex; gap: 10px;">
                    <div style="font-weight: bold; width: 25px;">${idx + 1}.</div>
                    <div style="flex: 1;">
                        <div style="font-size: 15px; line-height: 1.5;">${q.question_text}</div>
                        ${optionsHtml}
                    </div>
                    <div style="font-weight: bold; font-size: 14px;">[${q.marks}]</div>
                </div>
            </div>
        `;
    }).join('');

    const instructionsHtml = showInstructions 
        ? `<div style="font-size: 13px; font-style: italic; margin-bottom: 20px; padding: 10px; border: 1px dashed #ccc;">${instructions}</div>` 
        : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>${paperTitle} - Print</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 40px; max-width: 900px; margin: 0 auto; color: #000; }
            h1 { text-align: center; margin-bottom: 5px; font-size: 28px; text-transform: uppercase; }
            h2 { text-align: center; margin-top: 0; margin-bottom: 20px; font-size: 18px; font-weight: normal; text-decoration: underline; }
            .meta { display: flex; justify-content: space-between; font-weight: bold; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 5px 0; margin-bottom: 20px; font-family: sans-serif; font-size: 14px; }
            p { margin: 0; }
            @media print {
                body { padding: 0; width: 100%; }
                @page { margin: 20mm; }
            }
          </style>
        </head>
        <body>
          <h1>${instituteName}</h1>
          <h2>${paperTitle}</h2>
          
          <div class="meta">
              <span>Time: ${duration}</span>
              <span>Total Marks: ${totalMarks}</span>
          </div>

          ${instructionsHtml}

          <div class="questions">
            ${questionsHtml}
          </div>

          <script>
            window.onload = () => { setTimeout(() => { window.print(); }, 500); }
          </script>
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

    const payload = {
        user_id: user.id,
        title: paperTitle,
        institute_name: instituteName,
        duration: duration,
        total_marks: totalMarks,
        questions: selectedQuestions,
        settings: { instructions, showInstructions },
        is_finalized: true 
    };

    let error;
    if (isEditMode) {
        // Update existing exam
        const { error: updateError } = await supabase.from('exam_papers').update(payload).eq('id', routeId);
        error = updateError;
        if (!error) alert("Exam Updated Successfully!");
    } else {
        // Create new exam
        const { data: newExam, error: insertError } = await supabase.from('exam_papers').insert(payload).select().single();
        error = insertError;
        if (!error && newExam) {
             alert("Exam Saved! Redirecting to Edit Mode...");
             // Redirect to the "Edit" URL of this new exam so the Print button appears
             router.push(`/tutor/dashboard/my-exams/${newExam.id}`);
        }
    }

    if (error) {
        alert("Save Failed: " + error.message);
    } 
    setSaving(false);
  };

  if(initialLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600"/></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 font-sans text-slate-900">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm z-30">
          <div className="flex items-center gap-4">
              <Link href="/tutor/dashboard/my-exams" className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft className="w-5 h-5 text-slate-500"/></Link>
              <div>
                  <h1 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      {isEditMode ? "Editing Exam" : "Exam Composer"}
                  </h1>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                      <span>{selectedQuestions.length} Questions</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{totalMarks} Total Marks</span>
                  </div>
              </div>
          </div>
          <div className="flex gap-3">
              {/* PRINT BUTTON - Only shows if Saved (Edit Mode) */}
              {isEditMode && (
                  <button onClick={handlePrintPaper} className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
                      <Printer className="w-4 h-4 text-indigo-600"/> Print Paper
                  </button>
              )}

              <button onClick={() => setShowPaperOverview(true)} disabled={selectedQuestions.length === 0} className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50">
                  <MonitorPlay className="w-4 h-4"/> Overview
              </button>
              
              <button onClick={handleSave} disabled={saving || selectedQuestions.length === 0} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} 
                  {isEditMode ? "Update" : "Save"}
              </button>
          </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
          {/* LEFT: DISCOVERY / BANK */}
          <div className="w-96 bg-white border-r border-slate-200 flex flex-col z-20 hidden md:flex">
              <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
                  <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                      <input className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-all" placeholder="Search keywords..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchQuestions()}/>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                      <select className="text-xs border p-2 rounded bg-white" onChange={e => loadGroups(e.target.value)}><option value="">Segment</option>{metaData.segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                      <select className="text-xs border p-2 rounded bg-white" onChange={e => loadSubjects(e.target.value)}><option value="">Group</option>{metaData.groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                  </div>
                  <select className="w-full text-xs border p-2 rounded bg-white" onChange={e => setFilters({...filters, subject: e.target.value})}><option value="">Subject</option>{metaData.subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                      <select className="text-xs border p-2 rounded bg-white" onChange={e => setFilters({...filters, type: e.target.value})}><option value="">All Types</option><option value="mcq">MCQ</option><option value="passage">Passage</option><option value="descriptive">Creative</option></select>
                      <input className="text-xs border p-2 rounded bg-white" placeholder="Topic Tag..." onChange={e => setFilters({...filters, topic: e.target.value})} />
                  </div>
                  <button onClick={searchQuestions} className="w-full bg-slate-800 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-900 transition-all">Search Questions</button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-100">
                  {availableQuestions.map(q => {
                      const isAdded = selectedQuestions.some(sq => sq.id === q.id);
                      return (
                          <div key={q.id} className={`p-3 bg-white rounded-lg border transition-all hover:shadow-md group ${isAdded ? 'opacity-60 border-indigo-200' : 'border-slate-200'}`}>
                              <div className="flex justify-between items-start mb-2">
                                  <div className="flex gap-1"><span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded uppercase text-slate-600">{q.question_type}</span>{q.topic_tag && <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 max-w-[80px] truncate">{q.topic_tag}</span>}</div>
                                  <span className="text-xs font-bold text-slate-900">{q.marks} Pts</span>
                              </div>
                              <div className="text-xs text-slate-700 line-clamp-2 mb-2" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                              <div className="flex gap-2">
                                  <button onClick={(e) => { e.stopPropagation(); setPreviewQuestion(q); }} className="flex-1 py-1.5 rounded bg-slate-50 text-slate-500 text-xs font-bold hover:bg-slate-100 flex items-center justify-center gap-1"><Eye className="w-3 h-3"/> View</button>
                                  <button onClick={() => !isAdded && addToPaper(q)} className={`flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors ${isAdded ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{isAdded ? <CheckCircle className="w-3 h-3"/> : <Plus className="w-3 h-3"/>} {isAdded ? "Added" : "Add"}</button>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* RIGHT: CANVAS (The Paper) */}
          <div className="flex-1 overflow-y-auto bg-slate-200 p-4 md:p-8 flex justify-center">
              <div className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[20mm] relative">
                  <div className="text-center border-b-2 border-black pb-4 mb-6 group">
                      <input className={`w-full text-center text-3xl font-black mb-2 outline-none placeholder:text-slate-300 bg-transparent ${!isPro ? 'cursor-not-allowed text-slate-500' : 'text-slate-900'}`} value={instituteName} onChange={e => isPro && setInstituteName(e.target.value)} disabled={!isPro} placeholder="Your Institute Name"/>
                      <input className="w-full text-center text-lg font-bold mb-4 outline-none bg-transparent" value={paperTitle} onChange={e => setPaperTitle(e.target.value)} placeholder="Exam Name / Subject"/>
                      <div className="flex justify-between font-bold text-sm uppercase border-t-2 border-slate-100 pt-3 text-slate-800">
                          <div className="flex gap-2 items-center"><span>Time:</span><input className="w-20 font-black outline-none border-b border-transparent focus:border-black bg-transparent text-black" value={duration} onChange={e => setDuration(e.target.value)} /></div>
                          <div className="flex gap-2 items-center"><span>Total Marks:</span><span className="font-black text-black">{totalMarks}</span></div>
                      </div>
                  </div>
                  <div className="mb-8">
                      <div className="flex justify-between items-center mb-1 print:hidden">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instructions</span>
                          <button onClick={() => setShowInstructions(!showInstructions)} className="text-slate-400 hover:text-indigo-600">{showInstructions ? <Eye className="w-3 h-3"/> : <EyeOff className="w-3 h-3"/>}</button>
                      </div>
                      {showInstructions && (<div className="text-sm text-slate-800 leading-relaxed p-2 rounded border border-transparent hover:border-slate-100 transition-colors"><Editor apiKey="koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1" value={instructions} onEditorChange={c => setInstructions(c)} init={{ height: 80, menubar: false, toolbar: false, statusbar: false }} /></div>)}
                  </div>
                  <div className="space-y-6">
                      {selectedQuestions.map((q, idx) => (
                          <div key={q.id} className="relative group pl-2 hover:bg-slate-50 transition-colors rounded -ml-2 p-1 break-inside-avoid">
                              <div className="flex gap-3 items-start"><span className="font-bold text-lg w-6 flex-shrink-0 text-slate-900">{idx + 1}.</span><div className="flex-1"><div className="font-medium text-slate-900 text-sm leading-relaxed [&_p]:inline" dangerouslySetInnerHTML={{__html: q.question_text}}></div>{q.question_type === 'mcq' && q.options && (<div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">{q.options.map((opt:any, i:number) => (<div key={i} className="flex gap-2 text-sm items-start text-slate-800"><span className="font-bold text-slate-500">({String.fromCharCode(97 + i)})</span><span className="leading-snug">{opt.option_text}</span></div>))}</div>)}</div><div className="w-12 text-right">{isPro ? (<input type="number" className="w-8 text-right font-bold text-sm bg-slate-50 border border-slate-200 rounded px-1 focus:border-indigo-500 outline-none" value={q.marks} onChange={(e) => updateMark(q.id, Number(e.target.value))}/>) : <span className="font-bold text-sm text-slate-600">[{q.marks}]</span>}</div></div>
                              <button onClick={() => removeFromPaper(q.id)} className="absolute -left-8 top-0 p-1.5 bg-white border border-red-100 text-red-500 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                          </div>
                      ))}
                  </div>
                  <div className="mt-16 pt-6 border-t-2 border-slate-900 text-center"><p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Good Luck</p></div>
              </div>
          </div>
      </div>

      {/* SINGLE QUESTION PREVIEW POPUP */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-800">Question Preview</h3>
                      <div className="flex gap-2 text-xs mt-1">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">{previewQuestion.question_type}</span>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{previewQuestion.marks} Marks</span>
                      </div>
                    </div>
                    <button onClick={() => setPreviewQuestion(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400"/>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    <div className="prose prose-sm max-w-none text-slate-800" dangerouslySetInnerHTML={{__html: previewQuestion.question_text}}></div>
                    {previewQuestion.options && previewQuestion.options.length > 0 && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {previewQuestion.options.map((opt: any, i: number) => (
                                <div key={i} className="flex gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 items-center">
                                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white border border-slate-300 rounded-full text-xs font-bold text-slate-500">
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    <span className="text-sm text-slate-700">{opt.option_text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-2">
                    <button onClick={() => setPreviewQuestion(null)} className="px-5 py-2 text-slate-500 font-bold text-sm hover:bg-slate-200 rounded-lg transition-colors">
                        Close
                    </button>
                    <button 
                      onClick={() => { addToPaper(previewQuestion); setPreviewQuestion(null); }} 
                      className="px-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4"/> Add to Paper
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* READ ONLY OVERVIEW POPUP */}
      {showPaperOverview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                      <div><h3 className="font-black text-slate-800 text-lg">Exam Overview</h3><p className="text-xs text-slate-500">Read-only preview.</p></div>
                      <button onClick={() => setShowPaperOverview(false)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 bg-slate-100 flex justify-center">
                      <div className="bg-white shadow-lg w-[210mm] min-h-[297mm] p-[20mm] pointer-events-none scale-90 origin-top">
                          <div className="text-center border-b-2 border-black pb-4 mb-6">
                              <h1 className="text-4xl font-black mb-2 text-slate-900">{instituteName}</h1>
                              <h2 className="text-xl font-bold mb-4 text-slate-800">{paperTitle}</h2>
                          </div>
                          <div className="space-y-6">
                              {selectedQuestions.map((q, idx) => (
                                  <div key={idx} className="flex gap-3 items-start">
                                      <span className="font-bold text-lg w-6 flex-shrink-0 text-slate-900">{idx + 1}.</span>
                                      <div className="flex-1"><div className="font-medium text-slate-900 text-sm mb-2" dangerouslySetInnerHTML={{__html: q.question_text}}></div></div>
                                      <div className="font-bold text-sm min-w-[2rem] text-right text-slate-600">[{q.marks}]</div>
                                  </div>
                              ))}
                          </div>
                      </div>
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