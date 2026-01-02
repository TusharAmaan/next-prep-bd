"use client";

import { useRef } from "react";
import Link from "next/link";
import PrintBtn from "./PrintBtn";
import { 
  FileText, Calendar, Clock, ChevronRight, 
  Lock, Download, Check
} from "lucide-react";

// 1. UPDATE INTERFACE
interface PrintableBlogBodyProps {
  post: any;
  formattedDate: string;
  attachmentUrl?: string;
  bengaliFontClass?: string;
  isLoggedIn: boolean; // <--- ADDED THIS
}

export default function PrintableBlogBody({ 
  post, 
  formattedDate, 
  attachmentUrl,
  bengaliFontClass,
  isLoggedIn // <--- DESTRUCTURE THIS
}: PrintableBlogBodyProps) {
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  // REMOVED: useState for user and useEffect. 
  // We now trust the 'isLoggedIn' prop from the server.

  const readTime = Math.ceil((post.content_body?.split(" ").length || 0) / 200);

  return (
    <div className="max-w-5xl mx-auto w-full">
      
      {/* === WEB ACTION BAR === */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print px-2 md:px-0">
         <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex-wrap">
            <span>Home</span> 
            <ChevronRight className="w-3 h-3" />
            <span>Resources</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {post.subjects?.groups?.segments?.title || "Post"}
            </span>
         </div>
         
         {/* 2. CONDITIONAL PRINT BUTTON */}
         {/* Only show the Print Button if logged in */}
         {isLoggedIn ? (
            <PrintBtn contentRef={contentRef} />
         ) : (
             <div className="text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                Log in to Download PDF
             </div>
         )}
      </div>

      {/* === PRINTABLE DOCUMENT AREA === */}
      <div 
        ref={contentRef} 
        className="bg-white md:rounded-3xl shadow-sm border-y md:border border-slate-200 p-5 md:p-12 lg:px-16 relative print:shadow-none print:border-none print:p-0 print:block"
      >
        
        {/* PRINT HEADER */}
        <div className="hidden print:flex justify-between items-end border-b-2 border-black pb-4 mb-8">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-black">
                    NextPrep<span className="text-blue-600">BD</span>
                </h1>
            </div>
            <div className="text-right">
                <p className="text-xs text-gray-500">www.nextprepbd.com</p>
            </div>
        </div>

        {/* TITLE & META */}
        <div className="mb-8 md:mb-12 print:mb-6 border-b border-slate-100 pb-8 print:border-none">
            <h1 className={`text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight print:text-4xl print:text-black ${bengaliFontClass}`}>
                {post.title}
            </h1>

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
            </div>
        </div>

        {/* === PROFESSIONAL ATTACHMENT SECTION === */}
        {attachmentUrl && (
          <div className="mb-10 print:hidden animate-in fade-in slide-in-from-top-4 duration-500">
            {isLoggedIn ? (
                // --- OPTION A: LOGGED IN (ACCESS GRANTED) ---
                <div className="bg-green-50/50 border border-green-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <FileText className="w-24 h-24 text-green-600" />
                    </div>
                    
                    <div className="flex items-start gap-4 z-10">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                            <Check className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                Official Attachment 
                                <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] uppercase tracking-wide rounded-full">Ready</span>
                            </h4>
                            <p className="text-sm text-slate-600 mt-1">
                                Full syllabus/notes available for download.
                            </p>
                        </div>
                    </div>

                    <a 
                        href={attachmentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full md:w-auto z-10 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-green-600/20 transition-all active:scale-95"
                    >
                        <Download className="w-4 h-4" /> Download PDF
                    </a>
                </div>
            ) : (
                // --- OPTION B: NOT LOGGED IN (GATED CONTENT) ---
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-1 relative overflow-hidden group">
                    <div className="bg-white rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        
                        <div className="flex items-start gap-4 opacity-60 grayscale group-hover:grayscale-0 transition-all duration-500">
                            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">Attachment Available</h4>
                                <p className="text-sm text-slate-500">Contains {post.subjects?.groups?.segments?.title} material.</p>
                            </div>
                        </div>

                        <div className="w-full md:w-auto">
                            <Link href="/login" className="block w-full">
                                <button className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md group-hover:shadow-lg">
                                    <Lock className="w-4 h-4 text-amber-400" />
                                    <span>Login to Download</span>
                                </button>
                            </Link>
                            <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                                Free access for registered students.
                            </p>
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 group-hover:bg-blue-600 transition-colors"></div>
                </div>
            )}
          </div>
        )}

        {/* MAIN CONTENT */}
        <div 
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
        
        {/* FOOTER */}
        <div className="hidden print:flex flex-row justify-center items-center text-gray-400 mt-12 pt-6 border-t border-gray-200">
            <p className="text-[10px] uppercase tracking-widest">
                  © {new Date().getFullYear()} NextPrepBD — Your Ultimate Exam Companion
            </p>
        </div>

      </div>
    </div>
  );
}