"use client";
import { useEffect, useRef } from "react";
import { slugify } from "@/utils/slugify";

export default function BlogContent({ content, className }: { content: string, className?: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // 1. Target h2 through h6 (Ignoring h1 as requested)
      const headers = contentRef.current.querySelectorAll("h2, h3, h4, h5, h6");
      
      headers.forEach((header) => {
        if (header.textContent) {
          // 2. Generate ID keeping Bengali characters intact
          const id = slugify(header.textContent);
          header.id = id;
          
          // 3. Add scroll-margin for sticky header offset
          header.classList.add("scroll-mt-32"); 
        }
      });
    }
  }, [content]);

  return (
    <div 
      ref={contentRef}
      className={`prose prose-lg max-w-none 
        prose-headings:font-bold prose-headings:text-slate-900 
        prose-a:text-blue-600 prose-img:rounded-2xl 
        prose-p:leading-relaxed prose-p:text-slate-700 
        ${className}`}
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
}