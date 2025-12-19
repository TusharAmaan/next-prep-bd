"use client";
import { useState } from "react";
import Link from "next/link";

export default function HomeMaterialsFilter({ segments = [], resources = [] }: { segments: any[], resources: any[] }) {
  // Default to the first segment ID (usually SSC) so the list isn't empty on load
  const [activeTab, setActiveTab] = useState<number | null>(segments.length > 0 ? segments[0].id : null);

  // --- FILTER LOGIC ---
  const filteredResources = resources.filter((res) => {
    // 1. If no tab is selected, show nothing (or everything, your choice)
    if (!activeTab) return true;

    // 2. Direct Match (if resource has segment_id)
    if (res.segment_id === activeTab) return true;

    // 3. Nested Match (Resource -> Subject -> Group -> Segment)
    // We check if the resource belongs to the active segment via its relationships
    const linkedSegment = res.subjects?.groups?.segments?.id;
    return linkedSegment === activeTab;
  });

  const activeSegmentData = segments.find(s => s.id === activeTab);

  return (
    <div>
      {/* 1. FILTER BUTTONS (Pills) */}
      <div className="flex flex-wrap gap-3 mb-8">
        {segments.map((seg) => (
          <button
            key={seg.id}
            onClick={() => setActiveTab(seg.id)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border ${
              activeTab === seg.id
                ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105"
                : "bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            {seg.title}
          </button>
        ))}
      </div>

      {/* 2. MATERIALS LIST */}
      <div className="grid grid-cols-1 gap-4">
        {filteredResources.length > 0 ? (
          filteredResources.slice(0, 6).map((res) => (
            <Link 
              href={res.type === 'blog' ? `/blog/${res.id}` : res.content_url} 
              key={res.id} 
              className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${res.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                 {res.type === 'pdf' ? '📄' : '✍️'}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition text-lg">
                  {res.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {res.subjects?.title || res.type}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                        {new Date(res.created_at).toLocaleDateString()}
                    </span>
                </div>
              </div>
              
              {/* Arrow */}
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No materials found for this category yet.
          </div>
        )}
      </div>

      {/* 3. VIEW ALL LINK */}
      {activeSegmentData && (
          <div className="text-center mt-6">
              <Link 
                href={`/resources/${activeSegmentData.slug}`} 
                className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
              >
                  View All {activeSegmentData.title} Materials
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
          </div>
      )}
    </div>
  );
}