"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, FileText, PlayCircle, HelpCircle } from "lucide-react";

export default function HomeMaterialsFilter({ segments = [], resources = [] }: { segments: any[], resources: any[] }) {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize active tab to the first segment
  useEffect(() => {
    if (segments.length > 0 && !activeTab) {
      setActiveTab(segments[0].id);
    }
  }, [segments, activeTab]);

  // --- FILTER LOGIC ---
  const filteredResources = resources.filter((res) => {
    if (!activeTab) return true;
    // Check direct segment match OR linked segment via subject/group
    if (res.segment_id === activeTab) return true;
    const linkedSegment = res.subjects?.groups?.segments?.id;
    return linkedSegment === activeTab;
  });

  const latestPost = filteredResources[0];
  const sidePosts = filteredResources.slice(1, 6);
  const activeSegmentData = segments.find(s => s.id === activeTab);

  // --- HANDLER: Smooth Tab Switch ---
  const handleTabChange = (id: number) => {
    if (id === activeTab) return;
    setIsAnimating(true);
    setActiveTab(id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // --- HELPER: Visual Configs ---
  const getTypeStyles = (type: string) => {
     switch(type) {
         case 'pdf': return { icon: FileText, color: 'text-red-600', bg: 'bg-red-50' };
         case 'video': return { icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-50' };
         case 'question': return { icon: HelpCircle, color: 'text-amber-600', bg: 'bg-amber-50' };
         default: return { icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50' };
     }
  }

  return (
    <div className="w-full">
      
      {/* ========================================================
          1. TOP NAVIGATION TABS
      ======================================================== */}
      <div className="relative mb-8 group">
          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x cursor-grab border-b border-slate-100"
          >
            {segments.map((seg) => (
              <button
                key={seg.id}
                onClick={() => handleTabChange(seg.id)}
                className={`
                  whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 snap-start
                  ${activeTab === seg.id 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105" 
                    : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                  }
                `}
              >
                {seg.title}
              </button>
            ))}
          </div>
          {/* Fade Effect for Scroll */}
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none md:hidden"></div>
      </div>

      {/* ========================================================
          2. CONTENT LAYOUT (Hero Left + List Right)
      ======================================================== */}
      <div className={`
          grid grid-cols-1 lg:grid-cols-12 gap-8 
          transition-all duration-300 ease-in-out
          ${isAnimating ? 'opacity-50 translate-y-1' : 'opacity-100 translate-y-0'}
      `}>
          
          {/* --- LEFT COLUMN: HERO CARD (Col Span 7) --- */}
          <div className="lg:col-span-7 flex flex-col">
              {latestPost ? (
                  <Link 
                      href={latestPost.type === 'blog' ? `/blog/${latestPost.id}` : (latestPost.content_url || '#')}
                      className="group relative flex flex-col h-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                      {/* Image / Black Box Area */}
                      <div className="relative w-full aspect-video md:aspect-[16/9] overflow-hidden bg-slate-100">
                          {latestPost.content_url && (latestPost.type === 'blog' || latestPost.content_url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                              <Image 
                                  src={latestPost.content_url} 
                                  alt={latestPost.title}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                          ) : (
                              // "Black Box" Fallback Design
                              <div className="absolute inset-0 bg-[#0f172a] flex items-center justify-center p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                                  <div className="space-y-3 max-w-lg">
                                      <span className="inline-block px-3 py-1 rounded bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest border border-white/10 backdrop-blur-md">
                                          {latestPost.type}
                                      </span>
                                      <h3 className="text-white text-xl md:text-3xl font-black leading-tight line-clamp-3">
                                          {latestPost.title}
                                      </h3>
                                  </div>
                              </div>
                          )}
                          
                          {/* "Latest" Badge */}
                          <div className="absolute top-4 left-4 z-10">
                              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg animate-pulse">
                                  LATEST UPDATE
                              </span>
                          </div>
                      </div>

                      {/* Text Content */}
                      <div className="p-6 md:p-8 flex-1 flex flex-col">
                          <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mb-3">
                              <span className="uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                {latestPost.subjects?.title || activeSegmentData?.title || 'General'}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3"/> {new Date(latestPost.created_at).toLocaleDateString()}
                              </span>
                          </div>
                          
                          <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 leading-tight group-hover:text-blue-700 transition-colors">
                              {latestPost.title}
                          </h3>
                          
                          <p className="text-slate-500 line-clamp-2 mb-6 flex-1 text-sm md:text-base leading-relaxed">
                              {latestPost.seo_description || "Click to view full details, download materials, or watch the video lesson."}
                          </p>
                          
                          <span className="inline-flex items-center text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-auto">
                              Read Full Post <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"/>
                          </span>
                      </div>
                  </Link>
              ) : (
                  <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-dashed border-slate-300 text-center p-6">
                      <div className="text-4xl mb-2 opacity-30">📂</div>
                      <p className="text-slate-500 font-medium">No content available for {activeSegmentData?.title}.</p>
                  </div>
              )}
          </div>

          {/* --- RIGHT COLUMN: POST LIST (Col Span 5) --- */}
          <div className="lg:col-span-5 flex flex-col gap-4">
              {sidePosts.length > 0 ? (
                  sidePosts.map(post => {
                      const { icon: Icon, color, bg } = getTypeStyles(post.type);
                      return (
                          <Link 
                              key={post.id}
                              href={post.type === 'blog' ? `/blog/${post.id}` : (post.content_url || '#')}
                              className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all group relative overflow-hidden"
                          >
                              {/* Thumbnail / Icon */}
                              <div className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden relative ${bg} flex items-center justify-center border border-slate-100`}>
                                   {post.content_url && (post.type === 'blog' || post.content_url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                                       <Image src={post.content_url} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform"/>
                                   ) : (
                                       <Icon className={`w-8 h-8 ${color}`} strokeWidth={1.5} />
                                   )}
                              </div>
                              
                              {/* Text Info */}
                              <div className="min-w-0 flex-1 py-1">
                                  <h4 className="text-sm md:text-base font-bold text-slate-800 leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                                      {post.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                      <span className={color.replace('text-', 'bg-').replace('600', '50') + ' ' + color + ' px-2 py-0.5 rounded border border-transparent group-hover:border-current transition-colors'}>
                                          {post.type}
                                      </span>
                                      <span>{new Date(post.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                                  </div>
                              </div>
                          </Link>
                      )
                  })
              ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-sm border rounded-2xl border-slate-100 bg-slate-50/50">
                      No additional posts to show.
                  </div>
              )}
              
              {/* View All Button */}
              {activeTab && (
                  <Link 
                      href={`/resources/${activeSegmentData?.slug}`}
                      className="mt-2 block w-full py-3.5 text-center bg-slate-900 text-white hover:bg-blue-600 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-slate-900/10"
                  >
                      View All {activeSegmentData?.title} Posts →
                  </Link>
              )}
          </div>

      </div>

      {/* Utility CSS for hiding scrollbar cleanly */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}