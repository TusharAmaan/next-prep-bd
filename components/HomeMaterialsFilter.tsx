"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function HomeMaterialsFilter({ segments = [], resources = [] }: { segments: any[], resources: any[] }) {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

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
    setTimeout(() => setIsAnimating(false), 300); // Simple fade duration
  };

  // --- HELPER: Visual Configs ---
  const getResourceConfig = (type: string) => {
    switch (type) {
      case 'pdf': return { icon: '📄', color: 'text-red-600', bg: 'bg-red-50', border: 'border-l-red-500' };
      case 'video': return { icon: '▶', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-l-blue-500' };
      case 'question': return { icon: '❓', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-l-orange-500' };
      default: return { icon: '✍️', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-l-purple-500' };
    }
  };

  return (
    <div className="relative">
      
      {/* ========================================================
          1. REIMAGINED SEGMENT SELECTOR
      ======================================================== */}
      
      {/* Desktop/Tablet View: Centered Wrapped Grid (No Scrolling) */}
      <div className="hidden md:flex flex-wrap justify-center gap-3 mb-10">
        {segments.map((seg) => (
          <button
            key={seg.id}
            onClick={() => handleTabChange(seg.id)}
            className={`
              relative px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 border-2
              ${activeTab === seg.id
                ? "bg-slate-800 text-white border-slate-800 shadow-xl shadow-slate-200 -translate-y-1"
                : "bg-white text-slate-500 border-slate-100 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50"
              }
            `}
          >
            {seg.title}
            {/* Active Indicator Dot */}
            {activeTab === seg.id && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile View: Sticky Glassy Ribbon (Horizontal Scroll) */}
      <div className="md:hidden sticky top-[70px] z-30 -mx-4 px-4 pb-4 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-200/50 mb-6">
         <div className="flex overflow-x-auto gap-3 hide-scrollbar pt-2">
            {segments.map((seg) => (
              <button
                key={seg.id}
                onClick={() => handleTabChange(seg.id)}
                className={`
                  whitespace-nowrap flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all border
                  ${activeTab === seg.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-slate-500 border-slate-200"
                  }
                `}
              >
                {seg.title}
              </button>
            ))}
         </div>
         {/* Fade effect on the right to indicate scroll */}
         <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none"></div>
      </div>


      {/* ========================================================
          2. UPGRADED POST LIST
      ======================================================== */}
      
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
        {filteredResources.length > 0 ? (
          filteredResources.slice(0, 8).map((res) => {
            const config = getResourceConfig(res.type);
            
            return (
              <Link 
                href={res.type === 'blog' ? `/blog/${res.id}` : (res.content_url || "#")} 
                key={res.id} 
                target={res.type === 'pdf' || res.type === 'video' ? '_blank' : '_self'}
                className={`
                   group relative bg-white p-5 rounded-xl shadow-sm border border-slate-100 
                   hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 
                   flex flex-col sm:flex-row gap-4 overflow-hidden
                   border-l-[6px] ${config.border} /* Colored left border indicator */
                `}
              >
                {/* Icon Box */}
                <div className={`
                    w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center text-2xl 
                    ${config.bg} ${config.color} transition-transform group-hover:scale-110
                `}>
                    {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            {res.subjects?.title || res.type}
                        </span>
                        
                        {/* Date (Right Aligned) */}
                        <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">
                           {new Date(res.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>

                    <h4 className="font-bold text-slate-800 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                        {res.title}
                    </h4>

                    {/* Footer / Meta */}
                    <div className="mt-3 flex items-center gap-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <span className="text-xs font-semibold text-blue-500 flex items-center gap-1">
                            View Material <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </span>
                    </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="text-5xl mb-4 opacity-20 grayscale">📂</div>
            <p className="text-slate-900 font-bold text-lg">No materials found</p>
            <p className="text-slate-400 text-sm">Select a different category above.</p>
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
                inline-flex items-center gap-3 bg-white text-slate-800 border-2 border-slate-200 px-8 py-3 rounded-full text-sm font-bold 
                hover:border-slate-800 hover:bg-slate-800 hover:text-white transition-all duration-300 group
              "
            >
                <span>Browse All {activeSegmentData.title}</span>
                <span className="bg-slate-100 text-slate-600 group-hover:bg-slate-700 group-hover:text-white w-6 h-6 flex items-center justify-center rounded-full text-xs transition-colors">
                    →
                </span>
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