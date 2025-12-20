"use client";

import { useRef } from "react";
import PrintBtn from "./PrintBtn";

// 1. Add optional 'attachmentUrl' to the props definition
interface PrintableBlogBodyProps {
  post: any;
  formattedDate: string;
  attachmentUrl?: string; // Optional: Won't affect normal blogs
}

export default function PrintableBlogBody({ post, formattedDate, attachmentUrl }: PrintableBlogBodyProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* === WEB ACTION BAR (Hidden in Print) === */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 no-print">
         <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Home</span> / <span>Resources</span> / <span className="text-blue-600">{post.subjects?.groups?.segments?.title || "Post"}</span>
         </div>
         <PrintBtn contentRef={contentRef} />
      </div>

      {/* === PRINTABLE DOCUMENT AREA === */}
      <div 
        ref={contentRef} 
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 relative print:shadow-none print:border-none print:p-0 print:block"
      >
        
        {/* 1. PRINT-ONLY LETTERHEAD HEADER (Visible ONLY on Paper) */}
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

        {/* 2. ARTICLE TITLE & META */}
        <div className="mb-8 print:mb-6">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 leading-tight print:text-4xl print:text-black">
                {post.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 print:text-black">
                <span className="font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full print:border print:border-black print:bg-transparent print:text-black">
                    {post.subjects?.groups?.segments?.title || "General"}
                </span>
                <span>•</span>
                <span>{formattedDate}</span>
                <span>•</span>
                <span>NextPrep Desk</span>
            </div>
        </div>

        {/* 3. ATTACHMENT SECTION (Only shows if attachmentUrl exists - Updates Only) */}
        {/* Added 'print:hidden' so this download button doesn't appear on the paper PDF */}
        {attachmentUrl && (
          <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white text-blue-600 rounded-lg flex items-center justify-center text-xl shadow-sm">
                📄
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Official Document</h4>
                <p className="text-xs text-slate-500">Contains official routine/syllabus PDF</p>
              </div>
            </div>
            <a 
                href={attachmentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white text-sm px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200 w-full md:w-auto text-center"
            >
                Download PDF
            </a>
          </div>
        )}

        {/* 4. MAIN CONTENT */}
        <div 
          className="blog-content text-lg text-gray-800 leading-relaxed print:text-base print:text-justify print:text-black print:leading-normal" 
          dangerouslySetInnerHTML={{ __html: post.content_body || "<p>No content available.</p>" }} 
        />
        
        {/* 5. PRINT-ONLY FOOTER */}
        <div className="hidden print:flex flex-row justify-center items-center text-gray-400 mt-12 pt-6 border-t border-gray-200">
            <p className="text-[10px] uppercase tracking-widest">
                 © {new Date().getFullYear()} NextPrepBD — Your Ultimate Exam Companion
            </p>
        </div>

      </div>
    </>
  );
}