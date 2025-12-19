"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function MaterialsTabs({ segments = [], resources = [] }: { segments: any[], resources: any[] }) {
  // 1. SAFE INITIALIZATION: Handle empty segments gracefully
  const [activeTab, setActiveTab] = useState<number | null>(null);

  useEffect(() => {
    if (segments && segments.length > 0) {
      setActiveTab(segments[0].id);
    }
  }, [segments]);

  // If no data is loaded yet, show a skeleton or simple loading state
  if (!activeTab || segments.length === 0) {
    return <div className="p-10 text-center text-slate-400">Loading categories...</div>;
  }

  // 2. FILTERING LOGIC
  const activeResources = resources.filter((res) => {
    if (res.segment_id === activeTab) return true;
    const linkedSegmentId = res.subjects?.groups?.segments?.id;
    return linkedSegmentId === activeTab;
  });

  const activeSegmentData = segments.find(s => s.id === activeTab);

  return (
    <div>
      {/* TABS BUTTONS */}
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

      {/* RESOURCES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeResources.length > 0 ? (
          activeResources.slice(0, 6).map((res) => (
            <Link 
              href={res.type === 'blog' ? `/blog/${res.id}` : res.content_url} 
              key={res.id} 
              className="flex items-start gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0 ${res.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                 {res.type === 'pdf' ? '📄' : '✍️'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                  {res.title}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {res.subjects?.title || res.type}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                        {new Date(res.created_at).toLocaleDateString()}
                    </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 font-medium">No materials found for {activeSegmentData?.title} yet.</p>
          </div>
        )}
      </div>

      {/* VIEW ALL BUTTON */}
      <div className="text-center mt-10">
        <Link 
            href={activeSegmentData ? `/resources/${activeSegmentData.slug}` : '#'} 
            className="inline-flex items-center gap-2 text-sm font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-6 py-3 rounded-xl transition-colors"
        >
            View All {activeSegmentData?.title || 'Materials'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </Link>
      </div>
    </div>
  );
}