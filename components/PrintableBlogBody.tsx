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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden px-4 md:px-0">
         <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex-wrap">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link> 
            <ChevronRight className="w-3 h-3" />
            <span>Resources</span> 
            <ChevronRight className="w-3 h-3" />
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
            bg-white rounded-3xl shadow-sm border border-slate-200 
            relative overflow-hidden
            
            /* Responsive Screen Padding */
            p-6 sm:p-8 md:p-12 lg:p-16
            
            /* Strict Print Overrides */
            print:shadow-none print:border-none print:bg-transparent print:p-0 print:m-0 print:overflow-visible print:w-full print:max-w-none
            
            ${bengaliFontClass}
        `}
      >
        
        {/* === PRINT ONLY HEADER (Visible ONLY on Paper) === */}
        <div className="hidden print:flex justify-between items-end border-b-2 border-black pb-4 mb-8">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-black">
                    NextPrep<span className="text-gray-800">BD</span>
                </h1>
                <p className="text-xs text-gray-600 mt-1">Learner's Best Friend</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-gray-500">Printed on {new Date().toLocaleDateString()}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{post.subjects?.title || post.category}</p>
            </div>
        </div>

        {/* === POST HEADER (Title & Meta) === */}
        <div className="mb-8 md:mb-12 border-b border-slate-100 pb-6 md:pb-8 print:border-slate-300 print:mb-6 print:pb-4">
            
            {/* Title: Fluid on Screen, Fixed on Print */}
            <h1 className="
                text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 
                mb-4 md:mb-6 leading-[1.15] tracking-tight
                print:text-[22pt] print:text-black print:leading-tight print:mb-3
            ">
                {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 print:text-[10pt] print:text-gray-600">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500 print:hidden" />
                    <span>{formattedDate}</span>
                </div>
                
                {readTime && readTime > 0 && (
                    <>
                        <span className="hidden sm:inline text-slate-300 print:hidden">•</span>
                        <div className="flex items-center gap-2 print:hidden">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>{readTime} min read</span>
                        </div>
                    </>
                )}
            </div>
        </div>

        {/* === DOWNLOAD SECTION (Hidden on Print) === */}
        <div className="mb-8 md:mb-12 print:hidden">
          {isLoggedIn ? (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50/30 border border-emerald-100 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm">
                  <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                          <Check className="w-5 h-5" />
                      </div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-base">Printable PDF Ready</h4>
                          <p className="text-sm text-slate-600 mt-0.5">Download or print this formatted lesson.</p>
                      </div>
                  </div>
                  
                  <button 
                    onClick={onPrintTrigger} 
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                      <Download className="w-4 h-4"/> Save as PDF
                  </button>
              </div>
          ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
                  <div className="flex items-start gap-4 opacity-70">
                      <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center shrink-0">
                          <Lock className="w-5 h-5" />
                      </div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-base">PDF Version Locked</h4>
                          <p className="text-sm text-slate-500 mt-0.5">Login to download or print this content.</p>
                      </div>
                  </div>
                  <Link href="/login" className="w-full sm:w-auto text-center px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-md transition-colors">
                      Login
                  </Link>
              </div>
          )}
        </div>

        {/* === CONTENT BODY === */}
        {/* We use a robust set of classes here:
            - Screen: standard text sizes that scale up on desktop (text-base -> md:text-lg).
            - Print: Hard-coded to 12pt with tight line heights to save paper. 
            - Prose Modifiers: Forces typography plugin (if used in BlogContent) to respect our rules.
        */}
        <div className="
            /* --- Screen Typography --- */
            text-base leading-relaxed text-slate-800
            md:text-lg md:leading-loose
            
            /* --- Print Typography (Strict 12pt) --- */
            print:text-[12pt] print:leading-[1.5] print:text-black
            
            /* --- Element Overrides (Screen & Print) --- */
            [&>p]:mb-6 print:[&>p]:mb-3
            [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 
            print:[&>h2]:mt-6 print:[&>h2]:mb-2 print:[&>h2]:text-[16pt] print:[&>h2]:text-black
            
            [&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-800
            print:[&>h3]:mt-4 print:[&>h3]:mb-2 print:[&>h3]:text-[14pt] print:[&>h3]:text-black
            
            [&>ul]:my-6 [&>ul]:pl-6 [&>ul>li]:mb-2 
            print:[&>ul]:my-3 print:[&>ul>li]:mb-1
            
            /* Prose plugin overrides (insurance) */
            prose-p:text-base md:prose-p:text-lg print:prose-p:text-[12pt]
            prose-headings:text-slate-900 print:prose-headings:text-black
            max-w-none
        ">
            <BlogContent content={post.content_body || ""} />
        </div>

        {/* === PRINT FOOTER === */}
        <div className="hidden print:flex flex-row justify-center items-center text-gray-500 mt-10 pt-4 border-t border-gray-300 break-inside-avoid">
            <p className="text-[9pt] uppercase tracking-widest font-bold">
                © {new Date().getFullYear()} NextPrepBD - All Rights Reserved
            </p>
        </div>

      </div>
    </div>
  );
}