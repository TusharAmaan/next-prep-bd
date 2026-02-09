"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useReactToPrint } from "react-to-print";
import { Printer, ArrowLeft, ShieldAlert, Loader2, FileText, Pencil, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ExamViewPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExam = async () => {
        try {
            // 1. Get ID safely
            const examId = params?.id;
            if (!examId) return; // Wait for ID to appear

            console.log("1. Starting fetch for Exam ID:", examId);

            // 2. Check Auth
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.error("Auth Error:", authError);
                router.push('/login');
                return;
            }
            console.log("2. User Authenticated:", user.id);

            // 3. Fetch Exam Data
            const { data, error: dbError } = await supabase
                .from('exam_papers')
                .select('*')
                .eq('id', examId)
                .single();

            if (dbError) {
                console.error("3. Supabase DB Error:", dbError);
                throw new Error(dbError.message);
            }

            if (!data) {
                console.error("3. Data is null (Exam likely belongs to another user)");
                throw new Error("Exam not found or access denied.");
            }

            console.log("3. Success! Exam Data:", data);
            setExam(data);

        } catch (err: any) {
            console.error("Critical Fetch Error:", err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    fetchExam();
  }, [params, router]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: exam?.title || "Exam Paper",
  });

  // --- LOADING STATE ---
  if (loading) return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600"/>
          <p className="text-slate-500 font-bold animate-pulse">Retrieving Exam Data...</p>
          <p className="text-xs text-slate-400">If this takes too long, check browser console (F12)</p>
      </div>
  );

  // --- ERROR STATE ---
  if (error) return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 p-4">
          <div className="bg-red-100 p-4 rounded-full"><ShieldAlert className="w-12 h-12 text-red-600"/></div>
          <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Unable to Load Exam</h1>
              <div className="bg-white p-4 rounded-lg border border-red-200 shadow-sm max-w-md mx-auto text-left">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Error Details:</p>
                  <code className="text-sm text-red-600 block bg-red-50 p-2 rounded">{error}</code>
              </div>
              <div className="mt-8 flex justify-center gap-4">
                  <Link href="/tutor/dashboard/my-exams" className="px-6 py-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                      Back to Library
                  </Link>
                  <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                      Retry
                  </button>
              </div>
          </div>
      </div>
  );

  if (!exam) return null; // Should not happen if error handling works

  // --- SUCCESS STATE (Paper Render) ---
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
       
       {/* 1. TOP BAR */}
       <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50 print:hidden">
           <div className="flex items-center gap-4">
               <Link href="/tutor/dashboard/my-exams" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-indigo-600 transition-colors">
                   <ArrowLeft className="w-5 h-5"/>
               </Link>
               <div>
                   <h1 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                       <FileText className="w-4 h-4 text-indigo-500"/> 
                       {exam.title}
                   </h1>
                   <div className="flex gap-3 text-xs text-slate-500 font-medium">
                        <span>{new Date(exam.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{exam.total_marks} Marks</span>
                   </div>
               </div>
           </div>
           
           <div className="flex gap-2">
               {/* EDIT BUTTON: Links back to builder with ID */}
               <Link 
                   href={`/tutor/dashboard/question-builder?edit_id=${exam.id}`}
                   className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
               >
                   <Pencil className="w-4 h-4"/> Edit
               </Link>
               
               <button 
                   onClick={() => handlePrint()} 
                   className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
               >
                   <Printer className="w-4 h-4"/> Print / PDF
               </button>
           </div>
       </div>

       {/* 2. PAPER PREVIEW (The "Blog Post" View) */}
       <div className="flex-1 overflow-y-auto p-8 flex justify-center print:p-0 print:overflow-visible bg-slate-100/50">
           <div ref={printRef} className="bg-white shadow-xl min-h-[297mm] w-[210mm] p-[20mm] relative print:shadow-none print:w-full print:h-auto print:p-0 print:m-0">
               
               {/* Exam Header */}
               <div className="text-center border-b-2 border-black pb-6 mb-8">
                   <h1 className="text-3xl font-black mb-2 text-slate-900 uppercase tracking-tight">{exam.institute_name}</h1>
                   <h2 className="text-xl font-bold mb-4 text-slate-700">{exam.title}</h2>
                   <div className="flex justify-between font-bold text-sm uppercase border-t-2 border-slate-100 pt-4 text-slate-600">
                        <span>Time: {exam.duration}</span>
                        <span>Marks: {exam.total_marks}</span>
                   </div>
               </div>

               {/* Instructions */}
               {exam.settings?.instructions && exam.settings.showInstructions && (
                   <div 
                        className="mb-8 text-sm text-slate-800 leading-relaxed bg-slate-50/30 p-4 rounded-lg border border-slate-100 print:bg-transparent print:p-0 print:border-none" 
                        dangerouslySetInnerHTML={{__html: exam.settings.instructions}}
                   ></div>
               )}

               {/* Question List Render */}
               <div className="space-y-8">
                   {exam.questions && exam.questions.length > 0 ? (
                       exam.questions.map((q: any, idx: number) => (
                           <div key={idx} className="flex gap-4 items-start break-inside-avoid">
                               {/* Q Number */}
                               <span className="font-bold text-lg w-6 flex-shrink-0 text-slate-900">{idx + 1}.</span>
                               
                               <div className="flex-1">
                                   {/* Q Text */}
                                   <div className="font-medium text-slate-900 mb-3 leading-relaxed text-base [&_p]:inline" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                                   
                                   {/* MCQ Options */}
                                   {q.question_type === 'mcq' && q.options && (
                                       <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2 ml-1">
                                           {q.options.map((opt: any, i: number) => (
                                               <div key={i} className="flex gap-2 text-sm items-start text-slate-800">
                                                   <span className="font-semibold text-slate-500">({String.fromCharCode(97 + i)})</span>
                                                   <span className="leading-snug">{opt.option_text}</span>
                                               </div>
                                           ))}
                                       </div>
                                   )}
                               </div>
                               
                               {/* Marks */}
                               <div className="font-bold text-sm min-w-[2.5rem] text-right text-slate-500">
                                   [{q.marks}]
                               </div>
                           </div>
                       ))
                   ) : (
                       <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                           <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2"/>
                           <p className="text-slate-400 font-medium">This exam has no questions.</p>
                       </div>
                   )}
               </div>

               {/* Footer */}
               <div className="mt-16 pt-8 border-t border-slate-200 text-center break-before-auto">
                   <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Good Luck</p>
                   {exam.settings?.showWatermark && (
                       <p className="text-[9px] text-slate-300 mt-2 font-mono">Generated by NextPrep</p>
                   )}
               </div>
           </div>
       </div>
    </div>
  );
}