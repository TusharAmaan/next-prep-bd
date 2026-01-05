"use client";
import { useState, useEffect, useRef } from "react";
import { List, X, AlignLeft } from "lucide-react";

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

interface ArticleWithTOCProps {
  content: string;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function ArticleWithTOC({ content }: ArticleWithTOCProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isMobileTOCOpen, setIsMobileTOCOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const elements = contentRef.current.querySelectorAll("h1, h2, h3");
      const headingData: Heading[] = [];
      elements.forEach((elem) => {
        const text = elem.textContent || "";
        const id = slugify(text);
        elem.id = id;
        headingData.push({ id, text, level: parseInt(elem.tagName.substring(1)) });
      });
      setHeadings(headingData);
    }
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "0px 0px -80% 0px" }
    );
    if (contentRef.current) {
      const elements = contentRef.current.querySelectorAll("h1, h2, h3");
      elements.forEach((elem) => observer.observe(elem));
    }
    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setIsMobileTOCOpen(false);
    }
  };

  const TOCList = () => (
    <ul className="space-y-3 border-l-2 border-slate-100 pl-4">
      {headings.length === 0 && <li className="text-sm text-gray-400 italic">No sections found.</li>}
      {headings.map((heading) => (
        <li
          key={heading.id}
          style={{ paddingLeft: `${(heading.level - 1) * 8}px` }}
          className={`text-sm cursor-pointer transition-all duration-200 relative ${
            activeId === heading.id
              ? "text-blue-600 font-bold"
              : "text-gray-500 hover:text-gray-900"
          }`}
          onClick={() => scrollToHeading(heading.id)}
        >
          {activeId === heading.id && <span className="absolute -left-[19px] top-1.5 w-1 h-4 bg-blue-600 rounded-r-full"></span>}
          {heading.text}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="relative flex flex-col xl:flex-row gap-10 items-start">
      
      {/* DESKTOP TOC (Sticky Sidebar) - Hidden on Print */}
      <div className="hidden xl:block w-64 flex-shrink-0 sticky top-32 order-1 print:hidden">
        <h3 className="font-bold text-gray-900 uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
          <AlignLeft className="w-4 h-4" /> Table of Contents
        </h3>
        <TOCList />
      </div>

      {/* MOBILE TOC BUBBLE - Hidden on Print */}
      <div className="xl:hidden print:hidden">
        <button
          onClick={() => setIsMobileTOCOpen(true)}
          className="fixed left-4 bottom-24 z-40 bg-white border border-gray-200 text-blue-600 p-3 rounded-full shadow-xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
        >
          <List className="w-6 h-6" />
        </button>

        {isMobileTOCOpen && (
          <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" onClick={() => setIsMobileTOCOpen(false)} />
            <div className="fixed left-4 bottom-36 z-[70] w-72 bg-white rounded-2xl shadow-2xl p-5 border border-gray-100 animate-in slide-in-from-left-10 fade-in duration-300 origin-bottom-left">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                <h3 className="font-bold text-gray-900 text-sm">Table of Contents</h3>
                <button onClick={() => setIsMobileTOCOpen(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-4 h-4 text-gray-500" /></button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto"><TOCList /></div>
            </div>
          </>
        )}
      </div>

      {/* ARTICLE CONTENT */}
      <div className="flex-1 min-w-0 order-2">
        <div 
          ref={contentRef}
          className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-blue-600 prose-img:rounded-xl prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

    </div>
  );
}