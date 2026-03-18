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
            p-4 sm:p-6 md:p-12 lg:p-14
            
            /* Print Overrides: Remove styles to save ink/space */
            print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none
            
            ${bengaliFontClass}
        `}
      >
        
        {/* === FLUID RESPONSIVE TYPOGRAPHY === */}
        <style>{`
          :root {
            --base-font-size: 16px;
          }
          @media (max-width: 640px) {
            :root { --base-font-size: 14.5px; }
          }
          @media (min-width: 1536px) {
            :root { --base-font-size: 18px; }
          }

          .responsive-typography {
            font-size: var(--base-font-size);
            line-height: 1.7;
            color: #334155; /* slate-700 */
          }

          .responsive-h1 { 
            font-size: clamp(1.75rem, 5vw, 2.5rem); 
            line-height: 1.2; 
            letter-spacing: -0.02em;
          }
          .responsive-h2 { 
            font-size: clamp(1.4rem, 4vw, 1.875rem); 
            line-height: 1.3; 
            margin-top: 2.5rem; 
            margin-bottom: 1.25rem;
          }
          .responsive-h3 { 
            font-size: clamp(1.1rem, 3vw, 1.5rem); 
            line-height: 1.4; 
            margin-top: 2rem; 
            margin-bottom: 1rem;
          }
          .responsive-p { margin-bottom: 1.25rem; }
          .responsive-li { margin: 0.75rem 0; }
          
          /* Specialized scales for small screens to prevent "too large" feel */
          @media (max-width: 480px) {
            .responsive-typography { font-size: 14px; line-height: 1.6; }
            .responsive-h1 { font-size: 1.5rem; }
            .responsive-h2 { font-size: 1.25rem; }
            .responsive-h3 { font-size: 1.1rem; }
          }

          .responsive-code { 
            font-size: 0.9em; 
            background: #f8fafc;
            padding: 0.2em 0.4em;
            border-radius: 0.4em;
            border: 1px solid #e2e8f0;
          }
          
          .responsive-table { 
            display: block;
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            font-size: 0.9em;
          }
          
          @media print {
            .responsive-typography {
              font-size: 12pt !important;
              line-height: 1.5 !important;
              color: black !important;
            }
            .responsive-h1 { font-size: 24pt !important; color: black !important; margin-bottom: 0.5cm !important; }
            .responsive-h2 { font-size: 18pt !important; color: black !important; margin-top: 1cm !important; }
            .responsive-h3 { font-size: 14pt !important; color: black !important; }
            .responsive-p { margin-bottom: 0.4cm !important; orphans: 3; widows: 3; }
            .responsive-code { font-size: 10pt !important; background: #eee !important; border: 1px solid #ddd !important; }
            
            /* High Quality Print specific */
            @page {
              margin: 2cm;
              size: A4;
            }
          }
        `}</style>
        
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
        <div className="mb-6 sm:mb-8 md:mb-10 border-b border-slate-100 pb-6 sm:pb-7 md:pb-8 print:border-slate-300">
            {/* Title: Responsive Sizing with Mobile Optimization */}
            <h1 className="responsive-h1 responsive-typography font-black text-slate-900 mb-4 sm:mb-5 md:mb-6 leading-tight print:text-black print:font-bold">
                {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 responsive-meta responsive-typography text-slate-500 print:text-xs print:text-gray-600">
                <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 print:text-black flex-shrink-0" />
                    <span className="break-words">{formattedDate}</span>
                </div>
                {readTime && readTime > 0 && (
                    <>
                        <span className="hidden sm:inline text-slate-300 print:hidden">|</span>
                        <div className="flex items-center gap-2 print:hidden">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                            <span>{readTime} min read</span>
                        </div>
                    </>
                )}
            </div>
        </div>

        {/* === DOWNLOAD SECTION (Strict Login Check) === */}
        <div className="mb-6 sm:mb-8 md:mb-10 print:hidden">
          {isLoggedIn ? (
              <div className="bg-green-50/50 border border-green-200 rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-3 md:gap-4 w-full sm:w-auto">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0"><Check className="w-4 h-4 md:w-5 md:h-5" /></div>
                      <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-900 responsive-typography responsive-meta break-words">Printable PDF Ready</h4>
                          <p className="responsive-meta text-slate-600 mt-0.5 break-words">Download formatted lesson.</p>
                      </div>
                  </div>
                  
                  <button 
                    onClick={onPrintTrigger} 
                    className="w-full sm:w-auto px-5 py-2.5 bg-green-600 text-white rounded-lg responsive-meta font-bold hover:bg-green-700 active:bg-green-800 shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                      <Download className="w-4 h-4"/> Save as PDF
                  </button>
              </div>
          ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-3 md:gap-4 opacity-60 w-full sm:w-auto">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center shrink-0"><Lock className="w-4 h-4 md:w-5 md:h-5" /></div>
                      <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-900 responsive-typography responsive-meta break-words">PDF Version Locked</h4>
                          <p className="responsive-meta text-slate-500 mt-0.5 break-words">Login to download.</p>
                      </div>
                  </div>
                  <Link href="/login" className="w-full sm:w-auto text-center px-5 py-2.5 bg-slate-900 text-white rounded-lg responsive-meta font-bold hover:bg-blue-600 active:bg-blue-700 transition-colors whitespace-nowrap">Login</Link>
              </div>
          )}
        </div>

        {/* === CONTENT BODY (Mobile-Optimized Responsive Typography) === */}
        <div className="responsive-typography print:text-sm print:leading-normal print:text-black">
            <div className="[&_p]:responsive-p [&_h2]:responsive-h2 [&_h3]:responsive-h3 [&_h4]:responsive-h3 [&_h5]:responsive-h3 [&_li]:responsive-li [&_code]:responsive-code [&_table]:responsive-table [&_pre]:overflow-x-auto [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:text-slate-600 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg">
                <BlogContent content={post.content_body || ""} />
            </div>
        </div>

        {/* === PRINT FOOTER === */}
        <div className="hidden print:flex flex-row justify-center items-center text-gray-400 mt-12 pt-6 border-t border-gray-300 page-break-inside-avoid">
            <p className="text-[10px] uppercase tracking-widest">© {new Date().getFullYear()} NextPrepBD - All Rights Reserved</p>
        </div>

      </div>
    </div>
  );
}