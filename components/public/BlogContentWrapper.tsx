"use client";

import { useState, useRef } from "react";
import { FileText, HelpCircle, Printer } from "lucide-react";
import PrintableBlogBody from "@/components/PrintableBlogBody";
import QuizView from "@/components/public/QuizView";
import { useReactToPrint } from "react-to-print";

interface WrapperProps {
  post: any;
  questions: any[];
  formattedDate: string;
  readTime: number;
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
  
  const articleRef = useRef<HTMLDivElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: activeTab === 'article' ? articleRef : quizRef,
    documentTitle: `${post.title} - ${activeTab === 'article' ? 'Article' : 'Practice Questions'}`,
  });

  return (
    <div className="space-y-8">
      
      {/* 1. TAB SWITCHER */}
      {questions && questions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2 flex gap-3 shadow-xl sticky top-24 z-30 mx-4 md:mx-0 print:hidden transition-colors backdrop-blur-xl bg-white/90 dark:bg-slate-900/90">
          <button
            onClick={() => setActiveTab('article')}
            className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
              activeTab === 'article' 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/20 dark:shadow-white/10' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText size={18} /> Read Perspective
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all relative ${
              activeTab === 'quiz' 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <HelpCircle size={18} /> Practice Lab
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black transition-colors ${
                activeTab === 'quiz' ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
            }`}>
              {questions.length}
            </span>
          </button>
        </div>
      )}

      {/* 2. CONTENT AREA */}
      <div className="min-h-[500px]">
        
        {/* ARTICLE TAB */}
        <div className={activeTab === 'article' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
          <div ref={articleRef} className="print:p-10">
             <PrintableBlogBody 
                post={post} 
                formattedDate={formattedDate}
                readTime={readTime}
                bengaliFontClass={bengaliFontClass} 
                isLoggedIn={isLoggedIn}
                attachmentUrl={post.content_url} 
                onPrintTrigger={handlePrint} 
             />
          </div>
        </div>

        {/* QUIZ TAB */}
        {activeTab === 'quiz' && (
          <div ref={quizRef} className="print:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-12 print:hidden text-center border-b border-slate-100 dark:border-slate-800 pb-10">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-xl shadow-indigo-600/30 rotate-3">?</div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter leading-tight">{post.title}</h1>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Interactive Assessment Portal</p>
             </div>
             
             <QuizView 
                questions={questions} 
                isLoggedIn={isLoggedIn} 
                title={post.title} 
             />
          </div>
        )}

      </div>
    </div>
  );
}