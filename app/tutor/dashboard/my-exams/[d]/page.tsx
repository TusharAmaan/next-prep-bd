"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useReactToPrint } from "react-to-print";
import { Printer, ArrowLeft, ShieldAlert, Loader2, FileText } from "lucide-react";
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
    // 1. Wait for the ID. If Next.js hasn't provided it yet, DO NOTHING (keep loading).
    if (!params?.id) return;

    const fetchExam = async () => {
        try {
            const examId = params.id;
            console.log("Looking for Exam ID:", examId);

            // 2. Check Session
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // 3. Fetch Data
            const { data, error: dbError } = await supabase
                .from('exam_papers')
                .select('*')
                .eq('id', examId)
                .single();

            if (dbError) {
                console.error("Supabase Error:", dbError);
                throw new Error("Could not find this exam. It might have been deleted.");
            }

            if (!data) {
                throw new Error("Exam data is empty.");
            }

            setExam(data);
        } catch (err: any) {
            console.error("Fetch Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchExam();
  }, [params?.id, router]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: exam?.title || "Exam Paper",
  });

  // --- 1. LOADING STATE ---
  if (loading) return (
      <div className="h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600"/>
          <p className="text-sm font-bold text-slate-500 animate-pulse">Loading Exam...</p>
      </div>
  );

  // --- 2. ERROR STATE ---
  if (error || !exam) return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 p-4">
          <div className="bg-red-50 p-5 rounded-full shadow-sm ring-1 ring-red-100">
              <ShieldAlert className="w-12 h-12 text-red-500"/>
          </div>
          <div className="text-center">
              <h1 className="text-2xl font-black text-slate-800 mb-2">Unable to Load</h1>
              <p className="text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                  {error}
              </p>
              
              <Link href="/tutor/dashboard/my-exams" className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-sm">
                  Back to Library
              </Link>
          </div>
      </div>
  );

  // --- 3. SUCCESS STATE (The Paper) ---
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
       
       {/* Actions Bar (Not Printed) */}
       <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50 print:hidden">
           <div className="flex items-center gap-4">
               <Link href="/tutor/dashboard/my-exams" className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
                   <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-800"/>
               </Link>
               <div>
                   <h1 className="font-bold text-slate-800 text-lg leading-tight flex items-center gap-2">
                       <FileText className="w-4 h-4 text-indigo-500"/> {exam.title}
                   </h1>
                   <p className="text-xs text-slate-500 font-medium">
                       Generated on {new Date(exam.created_at).toLocaleDateString()}
                   </p>
               </div>
           </div>
           <button 
                onClick={() => handlePrint()} 
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black shadow-lg hover:shadow-xl transition-all active:scale-95"
           >
               <Printer className="w-4 h-4"/> Print / Download PDF
           </button>
       </div>

       {/* PAPER RENDERER (This is what gets printed) */}
       <div className="flex-1 overflow-y-auto p-8 flex justify-center print:p-0 print:overflow-visible">
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
                   <div 
                        className="mb-8 text-sm text-slate-800 leading-relaxed bg-slate-50/50 p-3 rounded border border-slate-100 print:bg-transparent print:p-0 print:border-none" 
                        dangerouslySetInnerHTML={{__html: exam.settings.instructions}}
                   ></div>
               )}

               {/* Questions */}
               <div className="space-y-8">
                   {exam.questions.map((q: any, idx: number) => (
                       <div key={idx} className="flex gap-3 items-start break-inside-avoid">
                           <span className="font-bold text-lg w-6 flex-shrink-0 text-slate-900">{idx + 1}.</span>
                           
                           <div className="flex-1">
                               {/* Question Content */}
                               <div className="font-medium text-slate-900 mb-2 leading-relaxed text-base [&_p]:inline" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
                               
                               {/* MCQ Grid */}
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

               {/* Footer */}
               <div className="mt-16 pt-6 border-t-2 border-slate-900 text-center break-before-auto">
                   <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Good Luck</p>
                   {/* Watermark Logic */}
                   {exam.settings?.showWatermark && (
                       <p className="text-[8px] text-slate-300 mt-2 font-mono">Generated by NextPrep</p>
                   )}
               </div>
           </div>
       </div>
    </div>
  );
}