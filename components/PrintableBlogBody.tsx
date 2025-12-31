"use client";

import { useRef } from "react";
import PrintBtn from "./PrintBtn";
import { FileText, Calendar, Clock, ChevronRight } from "lucide-react";

interface PrintableBlogBodyProps {
  post: any;
  formattedDate: string;
  attachmentUrl?: string;
  bengaliFontClass?: string;
}

export default function PrintableBlogBody({ 
  post, 
  formattedDate, 
  attachmentUrl,
  bengaliFontClass 
}: PrintableBlogBodyProps) {
  
  const contentRef = useRef<HTMLDivElement>(null);

  // Helper to estimate read time
  const readTime = Math.ceil((post.content_body?.split(" ").length || 0) / 200);

  return (
    <div className="max-w-5xl mx-auto w-full">
      
      {/* === WEB ACTION BAR === */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print px-2 md:px-0">
         {/* Breadcrumb */}
         <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex-wrap">
            <span>Home</span> 
            <ChevronRight className="w-3 h-3" />
            <span>Resources</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {post.subjects?.groups?.segments?.title || "Post"}
            </span>
         </div>
         <PrintBtn contentRef={contentRef} />
      </div>

      {/* === PRINTABLE DOCUMENT AREA === */}
      <div 
        ref={contentRef} 
        // Mobile: p-5 (less padding), Desktop: p-12 (luxury spacing)
        className="bg-white md:rounded-3xl shadow-sm border-y md:border border-slate-200 p-5 md:p-12 lg:px-16 relative print:shadow-none print:border-none print:p-0 print:block"
      >
        
        {/* PRINT-ONLY HEADER (Invisible on screen) */}
        <div className="hidden print:flex justify-between items-end border-b-2 border-black pb-4 mb-8">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-black">
                    NextPrep<span className="text-blue-600">BD</span>
                </h1>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mt-1">Official Study Material</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-gray-500">www.nextprepbd.com</p>
                <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleDateString()}</p>
            </div>
        </div>

        {/* TITLE & META */}
        <div className="mb-8 md:mb-12 print:mb-6 border-b border-slate-100 pb-8 print:border-none">
            {/* Title: Smaller on mobile (text-2xl), Big on Desktop (text-4xl+) */}
            <h1 className={`text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight print:text-4xl print:text-black ${bengaliFontClass}`}>
                {post.title}
            </h1>

            {/* Meta Data Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 print:text-black">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{formattedDate}</span>
                </div>
                <span className="hidden sm:inline text-slate-300">|</span>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>{readTime} min read</span>
                </div>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="text-slate-900 font-bold">NextPrep Desk</span>
            </div>
        </div>

        {/* ATTACHMENT SECTION */}
        {attachmentUrl && (
          <div className="mb-10 bg-slate-50 border border-slate-200 rounded-xl p-6 print:hidden group hover:border-blue-300 transition-colors">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Download Attachment</h4>
                  <p className="text-sm text-slate-500">Official syllabus or routine PDF included.</p>
                </div>
              </div>
              <a 
                href={attachmentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-slate-900 text-white text-sm px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 text-center"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div 
          // Mobile: text-base (16px), Desktop: text-lg (18px)
          // Leading-7 (loose) for mobile, Leading-8 for desktop
          className={`
            blog-content 
            text-base md:text-lg 
            text-slate-800 
            leading-7 md:leading-8 
            print:text-base print:text-justify print:text-black print:leading-normal 
            ${bengaliFontClass}
          `} 
          dangerouslySetInnerHTML={{ __html: post.content_body || "<p>No content available.</p>" }} 
        />
        
        {/* PRINT-ONLY FOOTER */}
        <div className="hidden print:flex flex-row justify-center items-center text-gray-400 mt-12 pt-6 border-t border-gray-200">
            <p className="text-[10px] uppercase tracking-widest">
                 © {new Date().getFullYear()} NextPrepBD — Your Ultimate Exam Companion
            </p>
        </div>

      </div>
    </div>
  );
}