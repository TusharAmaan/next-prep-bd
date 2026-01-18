"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Eye, EyeOff, FileText, ChevronDown, ChevronUp } from "lucide-react";

interface Option {
  option_text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'descriptive' | 'passage';
  marks: number;
  explanation: string;
  options?: Option[]; // For MCQs
  sub_questions?: Question[]; // For Passages
}

interface QuizViewProps {
  questions: Question[];
}

export default function QuizView({ questions }: QuizViewProps) {
  return (
    <div className="space-y-8 py-6">
      {questions.map((q, index) => (
        <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Question Header / Body */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded uppercase">
                Question {index + 1}
              </span>
              <span className="text-xs font-medium text-slate-400 uppercase">
                {q.question_type} • {q.marks} Marks
              </span>
            </div>
            
            <div 
              className="prose prose-slate max-w-none font-medium text-slate-800"
              dangerouslySetInnerHTML={{ __html: q.question_text }}
            />
          </div>

          {/* RENDER BASED ON TYPE */}
          <div className="px-6 pb-6">
            {q.question_type === 'mcq' && <MCQRenderer question={q} />}
            
            {q.question_type === 'descriptive' && <DescriptiveRenderer question={q} />}
            
            {q.question_type === 'passage' && q.sub_questions && (
              <div className="mt-4 pl-4 border-l-4 border-indigo-100 space-y-6">
                {q.sub_questions.map((sub, i) => (
                  <div key={sub.id} className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm font-bold text-slate-700 mb-2">Q{index+1}.{i+1}: <span dangerouslySetInnerHTML={{__html: sub.question_text}} /></p>
                    {sub.question_type === 'mcq' ? (
                      <MCQRenderer question={sub} />
                    ) : (
                      <DescriptiveRenderer question={sub} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- SUB-COMPONENTS FOR INTERACTION ---

function MCQRenderer({ question }: { question: Question }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Helper to determine style based on selection & correctness
  const getOptionStyle = (idx: number, isCorrect: boolean) => {
    if (selectedIdx === null) return "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"; // Default
    
    if (idx === selectedIdx) {
      return isCorrect 
        ? "border-green-500 bg-green-50 ring-1 ring-green-500" // Correct Selection
        : "border-red-500 bg-red-50 ring-1 ring-red-500"; // Wrong Selection
    }
    
    if (isCorrect && selectedIdx !== null) return "border-green-500 bg-green-50/50"; // Show correct answer if wrong selected
    return "border-slate-100 opacity-50"; // Dim others
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2">
        {question.options?.map((opt, idx) => (
          <button
            key={idx}
            disabled={selectedIdx !== null} // Lock after picking
            onClick={() => {
              setSelectedIdx(idx);
              setShowExplanation(true);
            }}
            className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group ${getOptionStyle(idx, opt.is_correct)}`}
          >
            <span className="text-sm font-medium">{opt.option_text}</span>
            {selectedIdx === idx && (
              opt.is_correct 
                ? <CheckCircle className="w-5 h-5 text-green-600" />
                : <XCircle className="w-5 h-5 text-red-500" />
            )}
          </button>
        ))}
      </div>

      {/* Explanation Reveal */}
      {showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg animate-in fade-in slide-in-from-top-2">
          <p className="text-xs font-bold text-blue-600 uppercase mb-1 flex items-center gap-1">
            <FileText size={14}/> Explanation
          </p>
          <p className="text-sm text-slate-700">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

function DescriptiveRenderer({ question }: { question: Question }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm font-bold text-indigo-600 flex items-center gap-2 hover:underline"
      >
        {isOpen ? <EyeOff size={16}/> : <Eye size={16}/>}
        {isOpen ? "Hide Answer" : "Show Answer"}
      </button>
      
      {isOpen && (
        <div className="mt-3 p-4 bg-slate-100 rounded-lg border-l-4 border-indigo-500 animate-in fade-in">
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Model Answer:</p>
          <p className="text-sm text-slate-800 whitespace-pre-wrap">{question.explanation || "No explanation provided."}</p>
        </div>
      )}
    </div>
  );
}