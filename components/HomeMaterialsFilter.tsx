"use client";
import { useState } from "react";
import Link from "next/link";

export default function HomeMaterialsFilter({ segments = [], resources = [] }: { segments: any[], resources: any[] }) {
  const [activeTab, setActiveTab] = useState<number | null>(segments.length > 0 ? segments[0].id : null);

  // --- FILTER LOGIC ---
  const filteredResources = resources.filter((res) => {
    // 1. Sanity Check
    if (res.type !== 'blog' && !res.content_url) return false;

    // 2. Tab Filtering
    if (!activeTab) return true;
    if (res.segment_id === activeTab) return true;
    const linkedSegment = res.subjects?.groups?.segments?.id;
    return linkedSegment === activeTab;
  });

  const activeSegmentData = segments.find(s => s.id === activeTab);

  // --- HELPER: Get Icon Based on Type ---
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'video': return '▶';
      case 'question': return '❓';
      default: return '✍️';
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-50 text-red-500 border-red-100';
      case 'video': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'question': return 'bg-orange-50 text-orange-500 border-orange-100';
      default: return 'bg-purple-50 text-purple-500 border-purple-100';
    }
  };

  return (
    <div>
      {/* 1. APP-LIKE HORIZONTAL SCROLL TABS */}
      {/* -mx-4 px-4 allows scroll to touch screen edges on mobile while keeping alignment */}
      <div className="flex overflow-x-auto pb-4 gap-3 -mx-6 px-6 md:mx-0 md:px-0 no-scrollbar mb-6 snap-x">
        {segments.map((seg) => (
          <button
            key={seg.id}
            onClick={() => setActiveTab(seg.id)}
            className={`
              whitespace-nowrap flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border snap-start
              ${activeTab === seg.id
                ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105"
                : "bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-600"
              }
            `}
          >
            {seg.title}
          </button>
        ))}
      </div>

      {/* 2. MATERIALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.length > 0 ? (
          filteredResources.slice(0, 8).map((res) => (
            <Link 
              href={res.type === 'blog' ? `/blog/${res.id}` : (res.content_url || "#")} 
              key={res.id} 
              target={res.type === 'pdf' || res.type === 'video' ? '_blank' : '_self'}
              className="group flex items-start gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
            >
              {/* Type Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border ${getResourceColor(res.type)}`}>
                 {getResourceIcon(res.type)}
              </div>
              
              {/* Content Info */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h4 className="font-bold text-slate-800 text-sm md:text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                  {res.title}
                </h4>
                
                <div className="flex items-center flex-wrap gap-y-1 gap-x-3 mt-2">
                    {/* Subject Badge */}
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200">
                        {res.subjects?.title || res.type}
                    </span>
                    
                    {/* Date */}
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {new Date(res.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                </div>
              </div>

              {/* Action Arrow (Mobile Optimized) */}
              <div className="self-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                 <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <div className="text-4xl mb-3 opacity-30">📂</div>
            <p className="text-slate-500 font-bold text-sm">No materials added yet.</p>
          </div>
        )}
      </div>

      {/* 3. VIEW ALL BUTTON (Sticky Bottom feel) */}
      {activeSegmentData && filteredResources.length > 0 && (
          <div className="mt-8 text-center">
              <Link 
                href={`/resources/${activeSegmentData.slug || '#'}`} 
                className="
                  inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 
                  hover:bg-blue-600 hover:shadow-blue-200 hover:-translate-y-1 transition-all duration-300 w-full md:w-auto justify-center
                "
              >
                  <span>Explore All {activeSegmentData.title}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
          </div>
      )}
    </div>
  );
}