"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import PrintBtn from "./PrintBtn";
import { FileText, Calendar, Clock, ChevronRight, Lock, Unlock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; // Ensure this path is correct

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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Check User Session on Mount
  useEffect(() => {
    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        setLoading(false);
    };
    checkUser();
  }, []);

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
        className="bg-white md:rounded-3xl shadow-sm border-y md:border border-slate-200 p-5 md:p-12 lg:px-16 relative print:shadow-none print:border-none print:p-0 print:block"
      >
        
        {/* PRINT-ONLY HEADER */}
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
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="text-slate-900 font-bold">NextPrep Desk</span>
            </div>
        </div>

        {/* === SMART ATTACHMENT SECTION === */}
        {attachmentUrl && !loading && (
          <div className="mb-10 print:hidden animate-fade-in">
            {user ? (
                // --- SCENARIO 1: LOGGED IN (SHOW DOWNLOAD) ---
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 group hover:border-blue-300 transition-colors">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                    Download Attachment <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Unlocked</span>
                                </h4>
                                <p className="text-sm text-slate-500">Official syllabus or routine PDF included.</p>
                            </div>
                        </div>
                        <a 
                            href={attachmentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto bg-slate-900 text-white text-sm px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 text-center flex items-center justify-center gap-2"
                        >
                            Download PDF <Unlock className="w-4 h-4 opacity-50"/>
                        </a>
                    </div>
                </div>
            ) : (
                // --- SCENARIO 2: NOT LOGGED IN (SHOW PROMPT) ---
                <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl p-6 relative overflow-hidden group hover:shadow-md transition-all">
                    {/* Decorative Background Icon */}
                    <div className="absolute -right-6 -top-6 text-slate-100 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        <Lock className="w-32 h-32" />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm border border-indigo-100 flex-shrink-0">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg">Unlock this Resource</h4>
                                <p className="text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">
                                    Log in to download this PDF and access exclusive study materials <span className="font-bold text-indigo-600">completely free</span>.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                            <Link 
                                href="/login" 
                                className="w-full sm:w-auto bg-indigo-600 text-white text-sm px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-center flex items-center justify-center gap-2"
                            >
                                Log In to Download
                            </Link>
                            <p className="text-[10px] text-center text-slate-400 font-medium">
                                Don't have an account? <Link href="/signup" className="text-indigo-600 hover:underline">Sign up for free</Link>
                            </p>
                        </div>
                    </div>
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