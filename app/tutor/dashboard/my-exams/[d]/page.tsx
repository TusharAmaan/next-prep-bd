"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useReactToPrint } from "react-to-print";
import { Printer, ArrowLeft, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ExamViewPage() {
  const { id } = useParams();
  const supabase = createClient();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch the "Recipe" (JSON Data)
  useEffect(() => {
    const fetchExam = async () => {
        const { data } = await supabase
            .from('exam_papers')
            .select('*')
            .eq('id', id)
            .single();
        
        if (data) setExam(data);
        setLoading(false);
    };
    fetchExam();
  }, [id]);

  // 2. The Print Logic (Browser Native)
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: exam?.title || "Exam Paper",
  });

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600"/></div>;
  if (!exam) return <div className="p-10 text-center">Exam not found.</div>;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
       
       {/* Actions Bar (Not Printed) */}
       <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50 print:hidden">
           <div className="flex items-center gap-4">
               <Link href="/tutor/dashboard/my-exams" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                   <ArrowLeft className="w-5 h-5 text-slate-600"/>
               </Link>
               <div>
                   <h1 className="font-bold text-slate-800 text-lg leading-tight">{exam.title}</h1>
                   <p className="text-xs text-slate-500">Created on {new Date(exam.created_at).toLocaleDateString()}</p>
               </div>
           </div>
           <button onClick={() => handlePrint()} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black shadow-lg hover:shadow-xl transition-all">
               <Printer className="w-4 h-4"/> Print / Save as PDF
           </button>
       </div>

       {/* PAPER RENDERER (This gets printed) */}
       <div className="flex-1 overflow-y-auto p-8 flex justify-center">
           <div ref={printRef} className="bg-white shadow-2xl min-h-[297mm] w-[210mm] p-[20mm] relative print:shadow-none print:w-full print:h-auto print:p-0 print:m-0">
               
               {/* Header */}
               <div className="text-center border-b-2 border-black pb-6 mb-8">
                   <h1 className="text-4xl font-black mb-2 text-slate-900">{exam.institute_name}</h1>
                   <h2 className="text-xl font-bold mb-4 text-slate-800">{exam.title}</h2>
                   <div className="flex justify-between font-bold text-sm uppercase border-t-2 border-slate-100 pt-4 text-slate-700">
                        <span>Time: {exam.duration}</span>
                        <span>Total Marks: {exam.total_marks}</span>
                   </div>
               </div>

               {/* Instructions */}
               {exam.settings?.instructions && exam.settings.showInstructions && (
                   <div className="mb-8 text-sm text-slate-800 leading-relaxed bg-slate-50/50 p-2 rounded print:bg-transparent print:p-0" dangerouslySetInnerHTML={{__html: exam.settings.instructions}}></div>
               )}

               {/* Questions Loop */}
               <div className="space-y-8">
                   {exam.questions.map((q: any, idx: number) => (
                       <div key={idx} className="flex gap-3 items-start break-inside-avoid">
                           <span className="font-bold text-lg w-6 flex-shrink-0 text-slate-900">{idx + 1}.</span>
                           
                           <div className="flex-1">
                               {/* Question Text */}
                               <div className="font-medium text-slate-900 mb-2 leading-relaxed text-base [&_p]:inline" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                               
                               {/* Options (Grid) */}
                               {q.question_type === 'mcq' && q.options && (
                                   <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
                                       {q.options.map((opt: any, i: number) => (
                                           <div key={i} className="flex gap-2 text-sm items-start text-slate-800">
                                               <span className="font-bold text-slate-500">({String.fromCharCode(97 + i)})</span>
                                               <span className="leading-snug">{opt.option_text}</span>
                                           </div>
                                       ))}
                                   </div>
                               )}
                           </div>
                           
                           {/* Marks */}
                           <div className="font-bold text-sm min-w-[2rem] text-right text-slate-600">
                               [{q.marks}]
                           </div>
                       </div>
                   ))}
               </div>

               {/* Footer / Watermark */}
               <div className="mt-16 pt-6 border-t-2 border-slate-900 text-center break-before-auto">
                   <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Good Luck</p>
                   {exam.settings?.showWatermark && (
                       <p className="text-[8px] text-slate-300 mt-2 font-mono">Generated by NextPrep</p>
                   )}
               </div>
           </div>
       </div>
    </div>
  );
}