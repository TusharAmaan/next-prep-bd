"use client";

import { useState, useRef } from "react";
import { 
  CheckCircle, XCircle, HelpCircle, Lock, 
  ChevronRight, Download, FileQuestion, FileCheck, Eye, EyeOff 
} from "lucide-react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";

interface Option {
  option_text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  marks: number;
  explanation: string;
  options: Option[];
  sub_questions?: Question[]; // Added support for Passage Sub-questions
}

interface QuizViewProps {
  questions: Question[];
  isLoggedIn: boolean;
  title: string;
}

export default function QuizView({ questions, isLoggedIn, title }: QuizViewProps) {
  const [revealed, setRevealed] = useState<{ [key: string]: boolean }>({});
  const [selectedOpts, setSelectedOpts] = useState<{ [key: string]: number }>({});
  const [printMode, setPrintMode] = useState<'solved' | 'blank' | null>(null);
  
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${title.replace(/\s+/g, '-')}-Quiz`,
    onAfterPrint: () => setPrintMode(null),
  });

  const triggerPrint = (mode: 'solved' | 'blank') => {
    setPrintMode(mode);
    setTimeout(() => {
        handlePrint();
    }, 100);
  };

  const handleOptionClick = (qId: string, optIndex: number) => {
    setSelectedOpts(prev => ({ ...prev, [qId]: optIndex }));
    setRevealed(prev => ({ ...prev, [qId]: true }));
  };

  const toggleReveal = (qId: string) => {
    setRevealed(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  // --- RENDER HELPER: Single Question Card ---
  const renderQuestionCard = (q: Question, indexDisplay: string | number, isSub: boolean = false) => {
    const showAnswer = printMode === 'solved' ? true : (printMode === 'blank' ? false : revealed[q.id]);
    const isPrinting = printMode !== null;

    return (
      <div key={q.id} className={`bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow ${isPrinting ? 'break-inside-avoid border-none shadow-none p-0 mb-6' : 'mb-6'} ${isSub ? 'mt-4 border-l-4 border-l-indigo-200 ml-0 md:ml-4 bg-slate-50/50' : ''}`}>
        
        {/* Header Row */}
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="flex gap-3 md:gap-4 w-full">
            {/* Badge */}
            <span className={`flex-shrink-0 flex items-center justify-center font-bold text-xs md:text-sm print:border print:border-black print:text-black print:bg-transparent ${isSub ? 'w-6 h-6 bg-indigo-100 text-indigo-700 rounded text-xs' : 'w-6 h-6 md:w-8 md:h-8 bg-indigo-50 text-indigo-600 rounded-full'}`}>
              {indexDisplay}
            </span>
            
            <div className="w-full min-w-0">
              <div className="overflow-x-auto">
                 <h3 
                   className="text-base md:text-lg font-bold text-slate-800 leading-relaxed print:text-black [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-slate-300 [&_th]:border [&_th]:border-slate-300 [&_th]:p-2 [&_th]:bg-slate-100 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_img]:max-w-full [&_img]:h-auto" 
                   dangerouslySetInnerHTML={{ __html: q.question_text }}
                 ></h3>
              </div>
              
              <div className="flex gap-2 mt-2 print:hidden flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{q.question_type}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded">{q.marks} Mark{q.marks > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          
          {/* Toggle Button */}
          {!isPrinting && q.question_type !== 'passage' && (
            <button 
              onClick={() => toggleReveal(q.id)}
              className="flex-shrink-0 text-indigo-600 hover:bg-indigo-50 p-1.5 md:p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
              title={showAnswer ? "Hide Answer" : "Show Answer"}
            >
               {showAnswer ? <EyeOff size={18} /> : <Eye size={18} />}
               <span className="hidden sm:inline">{showAnswer ? "Hide" : "Answer"}</span>
            </button>
          )}
        </div>

        {/* --- OPTIONS RENDERER (MCQ) --- */}
        {q.options && q.options.length > 0 && (
           <div className="space-y-3 pl-0 md:pl-12">
              {q.options.map((opt, i) => {
                 const isSelected = selectedOpts[q.id] === i;
                 const isCorrect = opt.is_correct;
                 
                 // BASE STYLE
                 let styleClass = "border-slate-200 hover:bg-slate-50"; 
                 
                 // PRINT STYLE (Specific Logic to ensure visibility)
                 if (isPrinting) {
                    if (printMode === 'solved' && isCorrect) {
                        // Correct Answer in PDF: Dark Border + Light Gray BG + Bold
                        styleClass = "border-black font-bold bg-gray-200 text-black";
                    } else {
                        // Normal Option in PDF: Solid Gray Border + Black Text
                        styleClass = "border-slate-400 text-black";
                    }
                 } else {
                    // WEB INTERACTIVE STYLE
                    if (showAnswer) {
                        if (isCorrect) styleClass = "bg-green-50 border-green-500 text-green-700 font-bold";
                        else if (isSelected) styleClass = "bg-red-50 border-red-500 text-red-700 opacity-60";
                        else styleClass = "border-slate-100 text-slate-400 opacity-50";
                    } else if (isSelected) {
                        styleClass = "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium";
                    }
                 }

                 return (
                    <button
                      key={i}
                      disabled={showAnswer || isPrinting}
                      onClick={() => handleOptionClick(q.id, i)}
                      className={`w-full text-left p-3 md:p-4 rounded-xl border-2 transition-all flex justify-between items-center ${styleClass} print:p-2 print:border-2 print:text-sm print:break-inside-avoid`}
                    >
                       <span className="text-sm">{opt.option_text}</span>
                       
                       {/* Icons for PDF (Black) and Web (Colored) */}
                       {showAnswer && isCorrect && <CheckCircle className="w-5 h-5 text-green-600 print:text-black flex-shrink-0 ml-2" />}
                       {showAnswer && isSelected && !isCorrect && !isPrinting && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 ml-2" />}
                    </button>
                 );
              })}
           </div>
        )}

        {/* --- EXPLANATION RENDERER --- */}
        {showAnswer && (q.explanation || q.question_type !== 'passage') && (
           <div className="mt-4 md:mt-6 pl-0 md:pl-12 animate-in fade-in slide-in-from-top-2 print:mt-4">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 md:p-5 relative overflow-hidden print:border print:border-gray-400 print:bg-transparent print:p-4">
                 <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2 print:text-black">
                    <HelpCircle className="w-4 h-4" /> Explanation
                 </h4>
                 
                 {isLoggedIn ? (
                    <div className="overflow-x-auto">
                       <div 
                          className="text-sm text-slate-700 leading-relaxed print:text-black [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-slate-300 [&_th]:border [&_th]:border-slate-300 [&_th]:p-2 [&_th]:bg-slate-100 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_img]:max-w-full [&_img]:h-auto"
                          dangerouslySetInnerHTML={{ __html: q.explanation || "No explanation provided." }}
                       />
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center space-y-3 print:hidden">
                       <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <Lock className="w-5 h-5 text-amber-500" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-800">Explanation Hidden</p>
                          <p className="text-xs text-slate-500 mb-3">Please login to view the detailed solution.</p>
                          <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                             Login Now <ChevronRight className="w-3 h-3" />
                          </Link>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        )}

        {/* --- RECURSIVE: PASSAGE SUB-QUESTIONS --- */}
        {q.question_type === 'passage' && q.sub_questions && q.sub_questions.length > 0 && (
           <div className="mt-6 pt-6 border-t border-dashed border-slate-300 pl-0 md:pl-8">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 print:text-black">Questions based on above passage:</h4>
              {q.sub_questions.map((sq, sIdx) => renderQuestionCard(sq, `${indexDisplay}.${sIdx + 1}`, true))}
           </div>
        )}

      </div>
    );
  };

  if (!questions || questions.length === 0) return <div className="p-8 text-center text-slate-400">No practice questions available.</div>;

  return (
    <div className="w-full">
      
      {/* DOWNLOAD OPTIONS */}
      <div className="mb-8 print:hidden">
        {isLoggedIn ? (
            <div className="bg-green-50/50 border border-green-200 rounded-2xl p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0"><Download className="w-5 h-5" /></div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm md:text-base">Download Practice PDF</h4>
                        <p className="text-xs text-slate-600">Select a format to download.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onClick={() => triggerPrint('blank')} className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-green-100 text-green-700 font-bold rounded-xl hover:bg-green-600 hover:text-white hover:border-green-600 transition-all text-sm">
                        <FileQuestion size={18}/> <span className="text-xs md:text-sm">Questions Only</span>
                    </button>
                    <button onClick={() => triggerPrint('solved')} className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all text-sm">
                        <FileCheck size={18}/> <span className="text-xs md:text-sm">With Answers</span>
                    </button>
                </div>
            </div>
        ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-4 opacity-60">
                    <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center shrink-0"><Lock className="w-5 h-5" /></div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm md:text-base">PDF Locked</h4>
                        <p className="text-xs text-slate-500">Login to download.</p>
                    </div>
                </div>
                <Link href="/login" className="w-full sm:w-auto text-center px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors">Login</Link>
            </div>
        )}
      </div>

      {/* QUIZ CONTENT AREA */}
      <div ref={componentRef} className="space-y-6 md:space-y-8 max-w-3xl mx-auto print:p-8">
        
        {/* PDF Title Header */}
        <div className="hidden print:block border-b-2 border-black pb-4 mb-8 text-center">
            <h1 className="text-2xl font-black text-black mb-2">{title}</h1>
            <p className="text-sm text-gray-500 uppercase tracking-widest">{printMode === 'blank' ? 'Practice Sheet' : 'Solution Key'}</p>
        </div>

        {/* Loop through Questions */}
        {questions.map((q, idx) => renderQuestionCard(q, idx + 1))}

      </div>
    </div>
  );
}