"use client";

import { useRef } from "react";
import Link from "next/link";
import { 
  Calendar, Clock, ChevronRight, 
  Lock, Download, Check
} from "lucide-react";
import LikeButton from "./LikeButton";
import BlogContent from "@/components/BlogContent"; 

interface PrintableBlogBodyProps {
  post: any;
  formattedDate: string;
  readTime?: number; 
  attachmentUrl?: string;
  bengaliFontClass?: string;
  isLoggedIn: boolean;
  onPrintTrigger?: () => void; 
}

export default function PrintableBlogBody({ 
  post, 
  formattedDate, 
  readTime, 
  attachmentUrl,
  bengaliFontClass,
  isLoggedIn,
  onPrintTrigger
}: PrintableBlogBodyProps) {
  
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full">
      
      {/* === WEB ACTION BAR (Hidden on Print) === */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden px-2 md:px-0">
         <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex-wrap">
            <Link href="/" className="hover:text-blue-600">Home</Link> <ChevronRight className="w-3 h-3" />
            <span>Resources</span> <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {post.subjects?.groups?.segments?.title || "Post"}
            </span>
         </div>
        <div className="no-print"><LikeButton resourceId={post.id} /></div>
      </div>

      {/* === MAIN CONTENT CARD === */}
      <div 
        ref={contentRef} 
        className={`
            bg-white rounded-3xl shadow-sm border border-slate-100 
            relative 
            
            /* Responsive Padding: Smaller on mobile to maximize screen width */
            p-5 md:p-12 
            
            /* Print Overrides: Remove styles to save ink/space */
            print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none
            
            ${bengaliFontClass}
        `}
      >
        
        {/* === PRINT ONLY HEADER (Visible ONLY on Paper) === */}
        <div className="hidden print:flex justify-between items-end border-b-2 border-black pb-4 mb-8">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-black">
                    NextPrep<span className="text-blue-600">BD</span>
                </h1>
                <p className="text-xs text-gray-500 mt-1">Learner's Best Friend</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-gray-400">Printed on {new Date().toLocaleDateString()}</p>
            </div>
        </div>

        {/* === POST HEADER (Title & Meta) === */}
        <div className="mb-6 md:mb-10 border-b border-slate-100 pb-6 md:pb-8 print:border-slate-300">
            {/* Title: Responsive Sizing */}
            <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-4 md:mb-6 leading-tight print:text-black print:text-2xl">
                {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-medium text-slate-500 print:text-xs print:text-gray-600">
                <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 text-blue-500 print:text-black" />
                    <span>{formattedDate}</span>
                </div>
                {readTime && readTime > 0 && (
                    <>
                        <span className="hidden sm:inline text-slate-300 print:hidden">|</span>
                        <div className="flex items-center gap-2 print:hidden">
                            <Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                            <span>{readTime} min read</span>
                        </div>
                    </>
                )}
            </div>
        </div>

        {/* === DOWNLOAD SECTION (Strict Login Check) === */}
        <div className="mb-8 md:mb-10 print:hidden">
          {isLoggedIn ? (
              <div className="bg-green-50/50 border border-green-200 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0"><Check className="w-4 h-4 md:w-5 md:h-5" /></div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm md:text-base">Printable PDF Ready</h4>
                          <p className="text-xs text-slate-600">Download formatted lesson.</p>
                      </div>
                  </div>
                  
                  <button 
                    onClick={onPrintTrigger} 
                    className="w-full sm:w-auto px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                  >
                      <Download className="w-4 h-4"/> Save as PDF
                  </button>
              </div>
          ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-3 md:gap-4 opacity-60">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center shrink-0"><Lock className="w-4 h-4 md:w-5 md:h-5" /></div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm md:text-base">PDF Version Locked</h4>
                          <p className="text-xs text-slate-500">Login to download.</p>
                      </div>
                  </div>
                  <Link href="/login" className="w-full sm:w-auto text-center px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors">Login</Link>
              </div>
          )}
        </div>

        {/* === CONTENT BODY (Optimized Fonts) === */}
        {/* 1. Mobile: text-sm (approx 14px/10.5pt) 
            2. Desktop (md): text-base (approx 16px/12pt)
            3. Print: text-sm (keeps it from being huge on paper) + text-black + tighter line height
        */}
        <div className="
            text-sm leading-7 
            md:text-base md:leading-8 
            print:text-sm print:leading-normal print:text-black
            [&_p]:mb-4 [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-xl md:[&_h2]:text-2xl [&_h3]:mt-6 [&_h3]:mb-3
        ">
            <BlogContent content={post.content_body || ""} />
        </div>

        {/* === PRINT FOOTER === */}
        <div className="hidden print:flex flex-row justify-center items-center text-gray-400 mt-8 pt-4 border-t border-gray-200">
            <p className="text-[10px] uppercase tracking-widest">© {new Date().getFullYear()} NextPrepBD - All Rights Reserved</p>
        </div>

      </div>
    </div>
  );
}