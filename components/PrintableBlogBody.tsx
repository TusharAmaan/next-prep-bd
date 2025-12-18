"use client";

import { useRef } from "react";
import PrintBtn from "./PrintBtn";

export default function PrintableBlogBody({ post, formattedDate }: { post: any, formattedDate: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* ACTION BAR (Has .no-print class, so it won't appear in PDF) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 no-print">
         <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Home</span> / <span>Blogs</span> / <span className="text-blue-600">{post.subjects?.groups?.segments?.title || "Post"}</span>
         </div>
         <PrintBtn contentRef={contentRef} />
      </div>

      {/* PRINTABLE AREA */}
      <div ref={contentRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8 md:p-12 relative print:p-0 print:shadow-none print:border-none">
        
        {/* Title */}
        <h1 className="text-1xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight text-center md:text-left print:text-center print:text-4xl print:mb-8">
            {post.title}
        </h1>

        {/* Metadata (Hidden in Print via CSS if desired, but keeping for now based on requirement 1) */}
        <div className="flex items-center gap-4 border-b border-gray-100 pb-8 mb-8 print:hidden">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">N</div>
            <div>
                <p className="text-sm font-bold text-gray-900">NextPrep Desk</p>
                <p className="text-xs text-gray-500">{formattedDate}</p>
            </div>
        </div>

        {/* Blog Content */}
        <div 
          className="blog-content text-lg max-w-none" 
          dangerouslySetInnerHTML={{ __html: post.content_body || "<p>No content available.</p>" }} 
        />
        
        {/* PRINT ONLY FOOTER (Visible ONLY on PDF) */}
        <div className="print-footer">
            <div>
                 <span className="brand">NextPrepBD</span> | Your Ultimate Exam Companion
            </div>
            <div>
                 www.nextprepbd.com
            </div>
        </div>
      </div>
    </>
  );
}