"use client";
import { useEffect, useRef } from "react";
import { slugify } from "@/utils/slugify";

import RichTextDisplay from "./shared/RichTextDisplay";

export default function BlogContent({ content, className }: { content: string, className?: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // 1. Target h2 through h6 (Ignoring h1 as requested)
      const headers = contentRef.current.querySelectorAll("h2, h3, h4, h5, h6");
      
      headers.forEach((header) => {
        if (header.textContent) {
          const id = slugify(header.textContent);
          header.id = id;
          header.classList.add("scroll-mt-32"); 
        }
      });


    }
  }, [content]);

  return (
    <div ref={contentRef}>
      <RichTextDisplay 
        content={content}
        className={`prose prose-lg dark:prose-invert max-w-none 
          prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-2xl 
          prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300
          ${className}`}
      />
    </div>
  );
}