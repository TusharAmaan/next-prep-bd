"use client";
import { useState, useEffect } from "react";
import { List, AlignLeft, X, ChevronRight } from "lucide-react";
import { slugify } from "@/utils/slugify";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function BlogTOC({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // 1. Parse Headings (h2-h6)
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    // Select only h2 to h6
    const elements = doc.querySelectorAll("h2, h3, h4, h5, h6");
    const headingData: Heading[] = [];

    elements.forEach((elem) => {
      if (elem.textContent?.trim()) {
        headingData.push({
          id: slugify(elem.textContent),
          text: elem.textContent,
          level: parseInt(elem.tagName.substring(1)),
        });
      }
    });

    setHeadings(headingData);
  }, [content]);

  // 2. Scroll Spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -70% 0px" }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  // 3. Smooth Scroll Handler
  const handleScroll = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100; // Adjust for your fixed header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      setActiveId(id);
      setIsMobileOpen(false);
    }
  };

  if (headings.length === 0) return null;

  // --- TOC ITEM RENDERER ---
  const TOCList = () => (
    <nav className="relative pl-2">
      {/* Decorative vertical line */}
      <div className="absolute left-2 top-2 bottom-2 w-[2px] bg-slate-100 rounded-full"></div>
      
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id} className="relative group">
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleScroll(heading.id, e)}
              // Indentation logic based on H2 (level 2) being the base
              style={{ paddingLeft: `${(heading.level - 2) * 12 + 16}px` }}
              className={`
                block py-1.5 text-[13px] leading-tight transition-all duration-300 border-l-2 -ml-[1px]
                ${activeId === heading.id 
                  ? "border-blue-600 text-blue-700 font-bold bg-blue-50/50 rounded-r-lg" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }
              `}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      {/* === DESKTOP SIDEBAR === */}
      <div className="hidden xl:block sticky top-32 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <AlignLeft className="w-4 h-4" /> Table of Contents
          </h3>
          <TOCList />
        </div>
      </div>

      {/* === MOBILE FLOATING BUBBLE === */}
      <div className="xl:hidden print:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed left-5 bottom-24 z-40 bg-white border border-slate-200 text-blue-600 p-3.5 rounded-full shadow-xl shadow-blue-900/10 active:scale-95 transition-transform flex items-center justify-center"
          title="Open Table of Contents"
        >
          <List className="w-6 h-6" />
        </button>

        {/* Mobile Drawer */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileOpen(false)} />
            <div className="absolute bottom-24 left-5 w-72 bg-white rounded-2xl shadow-2xl p-5 border border-slate-100 animate-in slide-in-from-bottom-5 fade-in duration-200 origin-bottom-left">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
                <h3 className="font-bold text-slate-900 text-sm">Table of Contents</h3>
                <button onClick={() => setIsMobileOpen(false)} className="p-1 hover:bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                <TOCList />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}