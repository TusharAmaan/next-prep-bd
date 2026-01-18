"use client";

import { useState, useRef } from "react";
import { FileText, HelpCircle } from "lucide-react";
import PrintableBlogBody from "@/components/PrintableBlogBody";
import QuizView from "@/components/public/QuizView";
import { useReactToPrint } from "react-to-print";

interface WrapperProps {
  post: any;
  questions: any[];
  formattedDate: string;
  readTime: number; // Added Prop
  bengaliFontClass: string;
  isLoggedIn: boolean;
}

export default function BlogContentWrapper({ 
  post, 
  questions, 
  formattedDate,
  readTime, 
  bengaliFontClass, 
  isLoggedIn 
}: WrapperProps) {
  const [activeTab, setActiveTab] = useState<'article' | 'quiz'>('article');
  
  // Refs for Printing
  const articleRef = useRef<HTMLDivElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);

  // Print Handling (Passed down to Green Button)
  const handlePrint = useReactToPrint({
    contentRef: activeTab === 'article' ? articleRef : quizRef,
    documentTitle: `${post.title} - ${activeTab === 'article' ? 'Article' : 'Practice Questions'}`,
  });

  return (
    <div className="space-y-6">
      
      {/* 1. TAB SWITCHER (Only if questions exist) */}
      {questions && questions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex gap-2 shadow-sm sticky top-24 z-30 mx-4 md:mx-0 print:hidden">
          <button
            onClick={() => setActiveTab('article')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'article' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileText size={16} /> Read Article
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'quiz' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
            }`}
          >
            <HelpCircle size={16} /> Practice Questions
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full ml-1">
              {questions.length}
            </span>
          </button>
        </div>
      )}

      {/* REMOVED THE TOP ACTIONS BAR (Print Buttons) AS REQUESTED */}

      {/* 3. CONTENT AREA */}
      <div className="min-h-[500px]">
        
        {/* ARTICLE TAB */}
        <div className={activeTab === 'article' ? 'block' : 'hidden'}>
          <div ref={articleRef} className="print:p-8">
             <PrintableBlogBody 
                post={post} 
                formattedDate={formattedDate}
                readTime={readTime} // Pass the calculated time
                bengaliFontClass={bengaliFontClass} 
                isLoggedIn={isLoggedIn}
                attachmentUrl={post.content_url} 
                // We pass the function so the Green Button inside can use it
                onPrintTrigger={handlePrint} 
             />
          </div>
        </div>

        {/* QUIZ TAB */}
        {activeTab === 'quiz' && (
          <div ref={quizRef} className="print:p-8">
             <div className="mb-6 print:block hidden text-center border-b pb-4">
                <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
                <p className="text-sm text-slate-500">Practice Questions</p>
             </div>
             <QuizView questions={questions} />
          </div>
        )}

      </div>
    </div>
  );
}