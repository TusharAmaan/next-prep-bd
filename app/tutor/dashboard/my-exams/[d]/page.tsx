"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useReactToPrint } from "react-to-print";
import { Printer, ArrowLeft, ShieldAlert, Loader2, FileText, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ExamViewPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Wait for ID to exist
    if (!params?.id) return;

    const fetchExam = async () => {
        try {
            const examId = params.id;
            
            // 1. Auth Check
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // 2. Fetch Data
            const { data, error: dbError } = await supabase
                .from('exam_papers')
                .select('*')
                .eq('id', examId)
                .single();

            if (dbError) throw dbError;
            if (!data) throw new Error("Exam not found.");

            setExam(data);
        } catch (err: any) {
            console.error("Load Error:", err);
            setError(err.message || "Failed to load exam.");
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

  if (loading) return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600"/>
          <p className="text-slate-500 font-bold animate-pulse">Loading Exam...</p>
      </div>
  );

  if (error || !exam) return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 p-4">
          <div className="bg-red-100 p-4 rounded-full"><ShieldAlert className="w-10 h-10 text-red-600"/></div>
          <div className="text-center">
              <h1 className="text-xl font-bold text-slate-900">Unable to View Exam</h1>
              <p className="text-slate-500 mt-2">{error}</p>
              <Link href="/tutor/dashboard/my-exams" className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50">
                  <ArrowLeft className="w-4 h-4"/> Return to Library
              </Link>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
       <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50 print:hidden">
           <div className="flex items-center gap-4">
               <Link href="/tutor/dashboard/my-exams" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-indigo-600 transition-colors"><ArrowLeft className="w-5 h-5"/></Link>
               <div>
                   <h1 className="font-bold text-slate-800 text-lg flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500"/> {exam.title}</h1>
                   <p className="text-xs text-slate-400 font-medium">Generated on {new Date(exam.created_at).toLocaleDateString()}</p>
               </div>
           </div>
           
           <div className="flex gap-2">
               {/* EDIT BUTTON LINKING TO BUILDER */}
               <Link href={`/tutor/dashboard/question-builder?edit_id=${exam.id}`} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
                   <Pencil className="w-4 h-4"/> Edit Question
               </Link>
               
               <button onClick={() => handlePrint()} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">
                   <Printer className="w-4 h-4"/> Print / PDF
               </button>
           </div>
       </div>

       <div className="flex-1 overflow-y-auto p-8 flex justify-center print:p-0 print:overflow-visible bg-slate-100/50">
           <div ref={printRef} className="bg-white shadow-xl min-h-[297mm] w-[210mm] p-[20mm] relative print:shadow-none print:w-full print:h-auto print:p-0 print:m-0">
               <div className="text-center border-b-2 border-black pb-6 mb-8">
                   <h1 className="text-3xl font-black mb-2 text-slate-900 uppercase tracking-tight">{exam.institute_name}</h1>
                   <h2 className="text-xl font-bold mb-4 text-slate-700">{exam.title}</h2>
                   <div className="flex justify-between font-bold text-sm uppercase border-t-2 border-slate-100 pt-4 text-slate-600">
                        <span>Time: {exam.duration}</span><span>Marks: {exam.total_marks}</span>
                   </div>
               </div>
               {exam.settings?.instructions && exam.settings.showInstructions && (<div className="mb-8 text-sm text-slate-800 leading-relaxed bg-slate-50/30 p-4 rounded-lg border border-slate-100 print:bg-transparent print:p-0 print:border-none" dangerouslySetInnerHTML={{__html: exam.settings.instructions}}></div>)}
               <div className="space-y-8">
                   {exam.questions.map((q: any, idx: number) => (
                       <div key={idx} className="flex gap-4 items-start break-inside-avoid">
                           <span className="font-bold text-lg w-6 flex-shrink-0 text-slate-900">{idx + 1}.</span>
                           <div className="flex-1">
                               <div className="font-medium text-slate-900 mb-3 leading-relaxed text-base [&_p]:inline" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                               {q.question_type === 'mcq' && q.options && (<div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2 ml-1">{q.options.map((opt: any, i: number) => (<div key={i} className="flex gap-2 text-sm items-start text-slate-800"><span className="font-semibold text-slate-500">({String.fromCharCode(97 + i)})</span><span className="leading-snug">{opt.option_text}</span></div>))}</div>)}
                           </div>
                           <div className="font-bold text-sm min-w-[2.5rem] text-right text-slate-500">[{q.marks}]</div>
                       </div>
                   ))}
               </div>
               <div className="mt-16 pt-8 border-t border-slate-200 text-center break-before-auto">
                   <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Good Luck</p>
               </div>
           </div>
       </div>
    </div>
  );
}