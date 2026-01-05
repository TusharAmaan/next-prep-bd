"use client";
import { useEffect, useRef } from "react";
import { slugify } from "@/utils/slugify";

export default function BlogContent({ content, className }: { content: string, className?: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Find all headers and inject IDs
      const headers = contentRef.current.querySelectorAll("h1, h2, h3");
      headers.forEach((header) => {
        if (header.textContent) {
          header.id = slugify(header.textContent);
          // Optional: Add a class for visual spacing
          header.classList.add("scroll-mt-32"); // Tailwind utility to offset scroll position
        }
      });
    }
  }, [content]);

  return (
    <div 
      ref={contentRef}
      className={`prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600 prose-img:rounded-2xl prose-p:leading-relaxed prose-p:text-slate-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
}