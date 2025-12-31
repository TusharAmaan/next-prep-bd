"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function HomeMaterialsFilter({ segments = [], resources = [] }: { segments: any[], resources: any[] }) {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Set initial tab safely
  useEffect(() => {
    if (segments.length > 0 && !activeTab) {
      setActiveTab(segments[0].id);
    }
  }, [segments, activeTab]);

  // --- FILTER LOGIC ---
  const filteredResources = resources.filter((res) => {
    if (res.type !== 'blog' && !res.content_url) return false;
    if (!activeTab) return true;
    if (res.segment_id === activeTab) return true;
    const linkedSegment = res.subjects?.groups?.segments?.id;
    return linkedSegment === activeTab;
  });

  const activeSegmentData = segments.find(s => s.id === activeTab);

  // --- HANDLER: Smooth Tab Switch ---
  const handleTabChange = (id: number) => {
    if (id === activeTab) return;
    setIsAnimating(true);
    setActiveTab(id);
    setTimeout(() => setIsAnimating(false), 200);
  };

  // --- HELPER: Visual Configs ---
  const getResourceConfig = (type: string) => {
    switch (type) {
      case 'pdf': return { 
          icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>, 
          label: 'PDF', 
          style: 'bg-red-50 text-red-600 border-red-100 ring-red-500/10' 
      };
      case 'video': return { 
          icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, 
          label: 'Video', 
          style: 'bg-blue-50 text-blue-600 border-blue-100 ring-blue-500/10' 
      };
      case 'question': return { 
          icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, 
          label: 'Question', 
          style: 'bg-orange-50 text-orange-600 border-orange-100 ring-orange-500/10' 
      };
      default: return { 
          icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>, 
          label: 'Note', 
          style: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/10' 
      };
    }
  };

  return (
    <div className="w-full">
      
      {/* ========================================================
          1. CLEAN HORIZONTAL SCROLL TABS
      ======================================================== */}
      <div className="relative mb-8 group">
          {/* Scroll Container */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-2 pb-4 hide-scrollbar snap-x cursor-grab active:cursor-grabbing"
          >
            {segments.map((seg) => (
              <button
                key={seg.id}
                onClick={() => handleTabChange(seg.id)}
                className={`
                  relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border flex-shrink-0 snap-start select-none
                  ${activeTab === seg.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-100"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }
                `}
              >
                {seg.title}
              </button>
            ))}
          </div>

          {/* Fade Gradients (Visual cues for scrolling) */}
          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-[#F8FAFC] to-transparent pointer-events-none md:hidden"></div>
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none"></div>
      </div>

      {/* ========================================================
          2. MODERN CARD GRID
      ======================================================== */}
      
      <div className={`
          grid grid-cols-1 md:grid-cols-2 gap-5
          transition-all duration-300 ease-in-out
          ${isAnimating ? 'opacity-50 scale-[0.99]' : 'opacity-100 scale-100'}
      `}>
        {filteredResources.length > 0 ? (
          filteredResources.slice(0, 8).map((res) => {
            const config = getResourceConfig(res.type);
            
            return (
              <Link 
                href={res.type === 'blog' ? `/blog/${res.id}` : (res.content_url || "#")} 
                key={res.id} 
                target={res.type === 'pdf' || res.type === 'video' ? '_blank' : '_self'}
                className="
                   group flex flex-col bg-white rounded-2xl p-5 
                   border border-slate-200/60 shadow-sm 
                   hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200/50 
                   transition-all duration-300 relative overflow-hidden h-full
                "
              >
                {/* Header: Badge & Date */}
                <div className="flex justify-between items-center mb-3">
                    <span className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ring-1 ring-inset
                        ${config.style}
                    `}>
                        {config.icon}
                        {config.label}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                        {new Date(res.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                </div>

                {/* Body: Title */}
                <h3 className="text-slate-800 font-bold text-lg leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {res.title}
                </h3>

                {/* Footer: Subject & Action */}
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                             {res.subjects?.title || 'General'}
                        </span>
                    </div>

                    {/* Action Arrow (Animated) */}
                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-[-45deg]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl grayscale opacity-50">📂</span>
            </div>
            <p className="text-slate-900 font-bold text-lg">No materials found</p>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                We haven't uploaded content for <span className="font-semibold text-slate-800">{activeSegmentData?.title}</span> yet. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* ========================================================
          3. FOOTER ACTION
      ======================================================== */}
      {activeSegmentData && filteredResources.length > 0 && (
        <div className="mt-10 text-center">
            <Link 
              href={`/resources/${activeSegmentData.slug || '#'}`} 
              className="
                inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold 
                bg-white text-slate-700 border border-slate-200 shadow-sm
                hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 
                transition-all duration-200
              "
            >
                <span>Browse All {activeSegmentData.title}</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
        </div>
      )}

      {/* Utility CSS for hiding scrollbar cleanly */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}