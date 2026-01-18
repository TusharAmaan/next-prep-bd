"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle, XCircle, HelpCircle, Lock, ChevronRight, Download, FileQuestion, FileCheck } from "lucide-react";
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
}

interface QuizViewProps {
  questions: Question[];
  isLoggedIn: boolean;
  title: string; // Needed for PDF Header
}

export default function QuizView({ questions, isLoggedIn, title }: QuizViewProps) {
  const [revealed, setRevealed] = useState<{ [key: string]: boolean }>({});
  const [selectedOpts, setSelectedOpts] = useState<{ [key: string]: number }>({});
  
  // PRINT STATE: 'solved' = Expand All, 'blank' = Hide All, null = Interactive Mode
  const [printMode, setPrintMode] = useState<'solved' | 'blank' | null>(null);
  
  const componentRef = useRef<HTMLDivElement>(null);

  // --- PRINT HANDLER ---
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${title.replace(/\s+/g, '-')}-Quiz`,
    onAfterPrint: () => setPrintMode(null), // Reset after printing
  });

  // Helper to trigger specific print modes
  const triggerPrint = (mode: 'solved' | 'blank') => {
    setPrintMode(mode);
    // We need a tiny timeout to allow React to render the expanded/collapsed state
    // before the print dialog grabs the content.
    setTimeout(() => {
        handlePrint();
    }, 100);
  };

  const handleOptionClick = (qId: string, optIndex: number) => {
    setSelectedOpts(prev => ({ ...prev, [qId]: optIndex }));
    setRevealed(prev => ({ ...prev, [qId]: true }));
  };

  if (!questions || questions.length === 0) return <div className="p-8 text-center text-slate-400">No practice questions available.</div>;

  return (
    <div className="w-full">
      
      {/* === DOWNLOAD OPTIONS SECTION === */}
      <div className="mb-8 print:hidden">
        {isLoggedIn ? (
            // LOGGED IN: Show Options
            <div className="bg-green-50/50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0"><Download className="w-5 h-5" /></div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm md:text-base">Download Practice PDF</h4>
                        <p className="text-xs text-slate-600">Select a format to download.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* BUTTON 1: Questions Only */}
                    <button 
                        onClick={() => triggerPrint('blank')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-green-100 text-green-700 font-bold rounded-xl hover:bg-green-600 hover:text-white hover:border-green-600 transition-all text-sm"
                    >
                        <FileQuestion size={18}/> Questions Only
                    </button>

                    {/* BUTTON 2: With Solutions */}
                    <button 
                        onClick={() => triggerPrint('solved')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all text-sm"
                    >
                        <FileCheck size={18}/> With Answers & Explanations
                    </button>
                </div>
            </div>
        ) : (
            // NOT LOGGED IN: Locked State
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-4 opacity-60">
                    <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center shrink-0"><Lock className="w-5 h-5" /></div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm md:text-base">PDF Downloads Locked</h4>
                        <p className="text-xs text-slate-500">Login to download questions.</p>
                    </div>
                </div>
                <Link href="/login" className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors">Login</Link>
            </div>
        )}
      </div>

      {/* === PRINTABLE CONTENT === */}
      <div ref={componentRef} className="space-y-8 max-w-3xl mx-auto print:p-8">
        
        {/* Print Header (Title) */}
        <div className="hidden print:block border-b-2 border-black pb-4 mb-8 text-center">
            <h1 className="text-2xl font-black text-black mb-2">{title}</h1>
            <p className="text-sm text-gray-500 uppercase tracking-widest">{printMode === 'blank' ? 'Practice Sheet' : 'Solution Key'}</p>
        </div>

        {questions.map((q, idx) => {
            // LOGIC: Should we show the answer/explanation?
            // If printMode is 'solved': YES (Force Show)
            // If printMode is 'blank': NO (Force Hide)
            // If printMode is null: Use interactive state (revealed[q.id])
            const showAnswer = printMode === 'solved' ? true : (printMode === 'blank' ? false : revealed[q.id]);
            
            // LOGIC: Selection State
            // If printing, remove red/green colors for a cleaner look (unless 'solved')
            const isPrinting = printMode !== null;

            return (
                <div key={q.id} className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow ${isPrinting ? 'break-inside-avoid border-none shadow-none p-0 mb-8' : ''}`}>
                
                {/* Question Header */}
                <div className="flex gap-4 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm print:border print:border-black print:text-black print:bg-transparent">
                    {idx + 1}
                    </span>
                    <div>
                    <h3 className="text-lg font-bold text-slate-800 leading-relaxed print:text-black" dangerouslySetInnerHTML={{ __html: q.question_text }}></h3>
                    <div className="flex gap-2 mt-2 print:hidden">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                            {q.question_type}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded">
                            {q.marks} Mark{q.marks > 1 ? 's' : ''}
                        </span>
                    </div>
                    </div>
                </div>

                {/* Options Grid */}
                <div className="space-y-3 pl-12">
                    {q.options?.map((opt, i) => {
                    const isSelected = selectedOpts[q.id] === i;
                    const isCorrect = opt.is_correct;
                    
                    // Determine Style
                    let styleClass = "border-slate-200 hover:bg-slate-50"; // Default
                    
                    if (isPrinting) {
                        // Print Styles (Clean)
                        if (printMode === 'solved' && isCorrect) styleClass = "border-black font-bold bg-gray-100"; // Highlight correct
                        else styleClass = "border-gray-300";
                    } else {
                        // Interactive Styles
                        if (showAnswer) {
                            if (isCorrect) styleClass = "bg-green-50 border-green-500 text-green-700 font-bold";
                            else if (isSelected) styleClass = "bg-red-50 border-red-500 text-red-700 opacity-60";
                            else styleClass = "border-slate-100 text-slate-400 opacity-50";
                        }
                    }

                    return (
                        <button
                        key={i}
                        disabled={showAnswer || isPrinting}
                        onClick={() => handleOptionClick(q.id, i)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${styleClass} print:p-2 print:border print:text-sm`}
                        >
                        <span className="text-sm">{opt.option_text}</span>
                        {/* Icons: Show only in interactive or solved print mode */}
                        {showAnswer && isCorrect && <CheckCircle className="w-5 h-5 text-green-600 print:text-black" />}
                        {showAnswer && isSelected && !isCorrect && !isPrinting && <XCircle className="w-5 h-5 text-red-600" />}
                        </button>
                    );
                    })}
                </div>

                {/* Explanation Section */}
                {showAnswer && (
                    <div className="mt-6 pl-12 animate-in fade-in slide-in-from-top-2 print:mt-4">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 relative overflow-hidden print:border print:border-gray-300 print:bg-transparent print:p-4">
                        <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2 print:text-black">
                        <HelpCircle className="w-4 h-4" /> Explanation
                        </h4>
                        
                        {isLoggedIn ? (
                        <div className="text-sm text-slate-700 leading-relaxed print:text-black">
                            {q.explanation || "No explanation provided."}
                        </div>
                        ) : (
                        // Locked State (Only visible interactively, never prints because we filter logic above)
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

                </div>
            );
        })}
      </div>
    </div>
  );
}