"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, CalendarDays, ChevronRight, Hash } from "lucide-react";

export default function HomeMaterialsFilter({ segments = [], resources = [] }: { segments: any[], resources: any[] }) {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize active tab
  useEffect(() => {
    if (segments.length > 0 && !activeTab) {
      setActiveTab(segments[0].id);
    }
  }, [segments, activeTab]);

  // --- 1. FILTERING LOGIC (BLOGS ONLY) ---
  const filteredResources = resources.filter((res) => {
    // STRICTLY BLOGS
    if (res.type !== 'blog') return false;
    
    // Segment Filter
    if (!activeTab) return true;
    if (res.segment_id === activeTab) return true;
    const linkedSegment = res.subjects?.groups?.segments?.id;
    return linkedSegment === activeTab;
  });

  const latestPost = filteredResources[0];
  const sidePosts = filteredResources.slice(1, 6); // Next 5 posts
  const activeSegmentData = segments.find(s => s.id === activeTab);

  // --- 2. HANDLER: Smooth Tab Switch ---
  const handleTabChange = (id: number) => {
    if (id === activeTab) return;
    setIsAnimating(true);
    setActiveTab(id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // --- 3. SMART LABEL HELPER ---
  const getLabel = (res: any) => {
    if (res.subjects?.title) return res.subjects.title;
    if (res.groups?.title) return res.groups.title;
    return activeSegmentData?.title || 'General';
  };

  // --- 4. PERMALINK GENERATOR [NEW] ---
  const getPostLink = (post: any) => {
    // Determine the identifier (Slug preferred, ID fallback)
    const identifier = post.slug || post.id;

    // Logic for different post types (Robustness for future use)
    if (post.type === 'updates') {
        const seg = post.subjects?.groups?.segments;
        const segmentSlug = seg?.slug || seg?.title?.toLowerCase() || 'general';
        return `/resources/${segmentSlug}/updates/${identifier}`;
    }
    
    if (post.type === 'news') return `/news/${identifier}`;
    if (post.type === 'courses') return `/courses/${identifier}`;
    if (post.type === 'ebooks') return `/ebooks/${identifier}`;

    // Default for 'blog'
    return `/blog/${identifier}`;
  };

  return (
    <div className="w-full">
      
      {/* --- TABS --- */}
      <div className="relative mb-6 group">
          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar snap-x cursor-grab"
          >
            {segments.map((seg) => (
              <button
                key={seg.id}
                onClick={() => handleTabChange(seg.id)}
                className={`
                  whitespace-nowrap px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 snap-start border
                  ${activeTab === seg.id 
                    ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }
                `}
              >
                {seg.title}
              </button>
            ))}
          </div>
      </div>

      {/* --- GRID LAYOUT --- */}
      <div className={`
          grid grid-cols-1 lg:grid-cols-12 gap-6 
          transition-all duration-300 ease-in-out
          ${isAnimating ? 'opacity-50 translate-y-1' : 'opacity-100 translate-y-0'}
      `}>
          
          {/* --- HERO COLUMN (Left) --- */}
          <div className="lg:col-span-7 flex flex-col">
              {latestPost ? (
                  <Link 
                      href={getPostLink(latestPost)} // <--- Updated Link
                      className="group relative flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 min-h-[350px]"
                  >
                      {/* Cover Image or Black Box Fallback */}
                      <div className="relative w-full flex-1 min-h-[220px] bg-slate-900 overflow-hidden">
                          {latestPost.content_url ? (
                              <Image 
                                  src={latestPost.content_url} 
                                  alt={latestPost.title}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                              />
                          ) : (
                              // THE BLACK BOX DESIGN
                              <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-slate-900">
                                  <div className="space-y-4 max-w-md relative z-10">
                                      <div className="inline-block px-3 py-1 rounded border border-white/20 bg-white/5 backdrop-blur-md text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                          {getLabel(latestPost)}
                                      </div>
                                      <h3 className="text-white text-xl md:text-3xl font-black leading-tight line-clamp-3">
                                          {latestPost.title}
                                      </h3>
                                  </div>
                                  {/* Subtle grid pattern for texture */}
                                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                              </div>
                          )}
                          
                          {/* Floating Badge */}
                          <div className="absolute top-4 left-4 z-20">
                              <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg">
                                  LATEST
                              </span>
                          </div>
                      </div>

                      {/* Text Content */}
                      <div className="p-5 flex flex-col bg-white">
                          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
                              <span className="text-blue-600">{getLabel(latestPost)}</span>
                              <span>•</span>
                              <span>{new Date(latestPost.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                              {latestPost.title}
                          </h3>
                          
                          <p className="text-slate-500 line-clamp-2 text-sm leading-relaxed mb-4">
                              {latestPost.seo_description || "Read the full article to learn more about this topic..."}
                          </p>
                          
                          <span className="inline-flex items-center text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-auto uppercase tracking-wide">
                              Read Article <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform"/>
                          </span>
                      </div>
                  </Link>
              ) : (
                  <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center p-6">
                      <div className="text-3xl mb-2 opacity-30">✍️</div>
                      <p className="text-slate-500 text-sm font-medium">No blogs posted yet.</p>
                  </div>
              )}
          </div>

          {/* --- LIST COLUMN (Right) --- */}
          <div className="lg:col-span-5 flex flex-col gap-3">
              {sidePosts.length > 0 ? (
                  sidePosts.map(post => (
                      <Link 
                          key={post.id}
                          href={getPostLink(post)} // <--- Updated Link
                          className="flex gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group h-full"
                      >
                          {/* Thumbnail */}
                          <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden relative bg-slate-100 border border-slate-100">
                               {post.content_url ? (
                                   <Image src={post.content_url} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform"/>
                               ) : (
                                   <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                        <Hash className="w-6 h-6" />
                                   </div>
                               )}
                          </div>
                          
                          {/* Info */}
                          <div className="min-w-0 flex-1 flex flex-col justify-center">
                              <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
                                      {getLabel(post)}
                                  </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                                  {post.title}
                              </h4>
                              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                  <CalendarDays className="w-3 h-3" /> {new Date(post.created_at).toLocaleDateString()}
                              </span>
                          </div>
                      </Link>
                  ))
              ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs border rounded-2xl border-slate-100 bg-slate-50/50">
                      No more posts to show.
                  </div>
              )}
              
              {activeTab && (
                  <Link 
                      href={`/blog?segment=${activeSegmentData?.title}`}
                      className="mt-1 block w-full py-3 text-center bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white font-bold text-xs rounded-xl transition-colors border border-slate-200"
                  >
                      View All {activeSegmentData?.title} Blogs →
                  </Link>
              )}
          </div>

      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}