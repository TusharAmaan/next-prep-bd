"use client";

import { useRef } from "react";
import PrintBtn from "./PrintBtn";

export default function PrintableBlogBody({ post, formattedDate }: { post: any, formattedDate: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* ACTION BAR (Hidden when printing) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 no-print">
         <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Home</span> / <span>Blogs</span> / <span className="text-blue-600">{post.subjects?.groups?.segments?.title || "Post"}</span>
         </div>
         <PrintBtn contentRef={contentRef} />
      </div>

      {/* PRINTABLE AREA */}
      <div 
        ref={contentRef} 
        // Note: We removed 'print:p-0' because we want the internal padding to look nice, 
        // and @page handles the external paper margins now.
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8 md:p-12 relative print:shadow-none print:border-none print:p-0"
      >
        
        {/* Title */}
        <h1 className="text-2xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight text-center md:text-left print:text-3xl print:mb-4 print:text-black">
            {post.title}
        </h1>

        {/* Metadata (Hidden in Print) */}
        <div className="flex items-center gap-4 border-b border-gray-100 pb-8 mb-8 print:hidden">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">N</div>
            <div>
                <p className="text-sm font-bold text-gray-900">NextPrep Desk</p>
                <p className="text-xs text-gray-500">{formattedDate}</p>
            </div>
        </div>

        {/* Blog Content */}
        <div 
          className="blog-content text-lg max-w-none text-gray-800 leading-relaxed print:text-base print:text-justify print:text-black" 
          dangerouslySetInnerHTML={{ __html: post.content_body || "<p>No content available.</p>" }} 
        />
        
        {/* PRINT FOOTER (Visible on Every Page due to position:fixed in CSS) */}
        <div className="print-footer hidden print:flex flex-row justify-between items-center text-gray-500 mt-8 pt-4 border-t border-gray-200">
            <div className="text-xs">
                 <span className="font-bold text-blue-600">NextPrepBD</span> | Your Ultimate Exam Companion
            </div>
            <div className="text-xs">
                 www.nextprepbd.com
            </div>
        </div>
      </div>
    </>
  );
}