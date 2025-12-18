"use client";

import { useRef } from "react";
import PrintBtn from "./PrintBtn";

export default function PrintableBlogBody({ post, formattedDate }: { post: any, formattedDate: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 no-print">
         <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Home</span> / <span>Blogs</span> / <span className="text-blue-600">{post.subjects?.groups?.segments?.title || "Post"}</span>
         </div>
         <PrintBtn contentRef={contentRef} />
      </div>

      {/* PRINTABLE AREA */}
      <div ref={contentRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8 md:p-12 relative">
        
        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight text-center md:text-left">
            {post.title}
        </h1>

        {/* Metadata */}
        <div className="flex items-center gap-4 border-b border-gray-100 pb-8 mb-8">
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

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Related Topics:</h4>
                <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: string, i: number) => (
                        <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">#{tag}</span>
                    ))}
                </div>
            </div>
        )}

        {/* PRINT ONLY FOOTER (Visible on PDF) */}
        <div className="print-footer">
            <p className="font-bold text-black text-sm">NextPrepBD</p>
            <p className="text-xs text-gray-500">Your Ultimate Exam Companion • www.nextprepbd.com</p>
        </div>
      </div>
    </>
  );
}