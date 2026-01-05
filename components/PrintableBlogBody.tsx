"use client";
import { useRef } from "react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { FileText, Calendar, Clock, ChevronRight, Lock, Download, Check, Printer } from "lucide-react";
import LikeButton from "./LikeButton";
import BlogContent from "@/components/BlogContent"; // <--- New Renderer

interface PrintableBlogBodyProps {
  post: any;
  formattedDate: string;
  attachmentUrl?: string;
  bengaliFontClass?: string;
  isLoggedIn: boolean;
}

export default function PrintableBlogBody({ 
  post, 
  formattedDate, 
  attachmentUrl,
  bengaliFontClass,
  isLoggedIn
}: PrintableBlogBodyProps) {
  
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `NextPrepBD-${post.title?.replace(/\s+/g, '-')}`,
  });

  const readTime = Math.ceil((post.content_body?.split(" ").length || 0) / 200);

  return (
    <div className="w-full"> {/* Removed max-w-5xl constraint to let grid control width */}
      
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print px-2 md:px-0">
         <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex-wrap">
            <span>Home</span> <ChevronRight className="w-3 h-3" />
            <span>Resources</span> <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {post.subjects?.groups?.segments?.title || "Post"}
            </span>
         </div>
        <div className="no-print"><LikeButton resourceId={post.id} /></div>
      </div>

      {/* PRINTABLE AREA */}
      <div 
        ref={contentRef} 
        className={`bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-12 relative print:shadow-none print:border-none print:p-0 ${bengaliFontClass}`}
      >
        {/* PRINT HEADER */}
        <div className="hidden print:flex justify-between items-end border-b-2 border-black pb-4 mb-8">
            <div><h1 className="text-3xl font-black tracking-tighter text-black">NextPrep<span className="text-blue-600">BD</span></h1></div>
            <div className="text-right"><p className="text-xs text-gray-500">www.nextprepbd.com</p></div>
        </div>

        {/* POST HEADER */}
        <div className="mb-8 md:mb-10 print:mb-6 border-b border-slate-100 pb-8 print:border-none">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight print:text-4xl print:text-black">
                {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 print:text-black">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /><span>{formattedDate}</span></div>
                <span className="hidden sm:inline text-slate-300">|</span>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /><span>{readTime} min read</span></div>
                <button onClick={handlePrint} className="flex items-center gap-2 ml-auto text-slate-400 hover:text-slate-700 transition-colors print:hidden">
                    <Printer className="w-4 h-4"/> Print
                </button>
            </div>
        </div>

        {/* DOWNLOAD CTA (Hidden on print) */}
        <div className="mb-10 print:hidden">
          {attachmentUrl && (
             isLoggedIn ? (
              <div className="bg-green-50/50 border border-green-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0"><Check className="w-5 h-5" /></div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm md:text-base">Printable PDF Ready</h4>
                          <p className="text-xs text-slate-600">Download formatted lesson.</p>
                      </div>
                  </div>
                  <a href={attachmentUrl} target="_blank" className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center gap-2">
                      <Download className="w-4 h-4"/> Download
                  </a>
              </div>
             ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-4 opacity-60">
                      <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center shrink-0"><Lock className="w-5 h-5" /></div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm md:text-base">PDF Version Locked</h4>
                          <p className="text-xs text-slate-500">Login to access file.</p>
                      </div>
                  </div>
                  <Link href="/login" className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors">Login</Link>
              </div>
             )
          )}
        </div>

        {/* CONTENT RENDERER */}
        <BlogContent content={post.content_body || ""} />

        {/* FOOTER */}
        <div className="hidden print:flex flex-row justify-center items-center text-gray-400 mt-12 pt-6 border-t border-gray-200">
            <p className="text-[10px] uppercase tracking-widest">© {new Date().getFullYear()} NextPrepBD</p>
        </div>
      </div>
    </div>
  );
}