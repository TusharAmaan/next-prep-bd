"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, CalendarDays, ChevronRight, Hash, Sparkles, BookOpen } from "lucide-react";

export default function HomeMaterialsFilter({ segments = [], resources = [] }: { segments: any[], resources: any[] }) {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (segments.length > 0 && !activeTab) {
      setActiveTab(segments[0].id);
    }
  }, [segments, activeTab]);

  const filteredResources = resources.filter((res) => {
    if (res.type !== 'blog') return false;
    if (res.status !== 'approved') return false; 
    
    if (!activeTab) return true;
    if (res.segment_id === activeTab) return true;
    const linkedSegment = res.subjects?.groups?.segments?.id;
    return linkedSegment === activeTab;
  });

  const latestPost = filteredResources[0];
  const sidePosts = filteredResources.slice(1, 6); 
  const activeSegmentData = segments.find(s => s.id === activeTab);

  const handleTabChange = (id: number) => {
    if (id === activeTab) return;
    setIsAnimating(true);
    setActiveTab(id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getLabel = (res: any) => {
    if (res.subjects?.title) return res.subjects.title;
    if (res.groups?.title) return res.groups.title;
    return activeSegmentData?.title || 'Academy';
  };

  const getPostLink = (post: any) => {
    const identifier = post.slug || post.id;

    if (post.type === 'updates') {
        const seg = post.subjects?.groups?.segments;
        const segmentSlug = seg?.slug || seg?.title?.toLowerCase() || 'general';
        return `/resources/${segmentSlug}/updates/${identifier}`;
    }
    
    if (post.type === 'news') return `/news/${identifier}`;
    if (post.type === 'courses') return `/courses/${identifier}`;
    if (post.type === 'ebooks') return `/ebooks/${identifier}`;

    return `/blog/${identifier}`;
  };

  return (
    <div className="w-full font-sans">
      
      {/* --- TABS --- */}
      <div className="relative mb-10 group overflow-hidden">
          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x cursor-grab"
          >
            {segments.map((seg) => (
              <button
                key={seg.id}
                onClick={() => handleTabChange(seg.id)}
                className={`
                  whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all duration-500 snap-start border
                  ${activeTab === seg.id 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20 scale-105" 
                    : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }
                `}
              >
                {seg.title}
              </button>
            ))}
          </div>
          {/* Faders for mobile */}
          <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none sm:hidden"></div>
      </div>

      {/* --- GRID LAYOUT --- */}
      <div className={`
          grid grid-cols-1 lg:grid-cols-12 gap-10 
          transition-all duration-500 ease-in-out
          ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
      `}>
          
          {/* --- HERO COLUMN --- */}
          <div className="lg:col-span-7 flex flex-col">
              {latestPost ? (
                  <Link 
                      href={getPostLink(latestPost)} 
                      className="group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl dark:hover:shadow-indigo-900/10 transition-all duration-500 min-h-[450px]"
                  >
                      <div className="relative w-full flex-1 min-h-[280px] bg-slate-950 overflow-hidden">
                          {latestPost.content_url ? (
                              <Image 
                                  src={latestPost.content_url} 
                                  alt={latestPost.title}
                                  fill
                                  className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                              />
                          ) : (
                              <div className="absolute inset-0 flex items-center justify-center p-12 text-center bg-slate-950">
                                  <div className="space-y-6 max-w-md relative z-10">
                                      <BookOpen className="w-12 h-12 text-indigo-500 mx-auto opacity-50 group-hover:scale-125 transition-transform duration-700" />
                                      <h3 className="text-white text-2xl md:text-4xl font-black uppercase tracking-tighter leading-tight line-clamp-3">
                                          {latestPost.title}
                                      </h3>
                                  </div>
                                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                              </div>
                          )}
                          
                          <div className="absolute top-6 left-6 z-20">
                              <span className="bg-indigo-600 text-white text-[9px] font-black px-4 py-1.5 rounded-xl border border-white/10 shadow-2xl tracking-[0.2em] uppercase">
                                  CORE INSIGHT
                              </span>
                          </div>
                      </div>

                      <div className="p-8 flex flex-col bg-white dark:bg-slate-900">
                          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-[0.15em]">
                              <span className="text-indigo-600 dark:text-indigo-400">{getLabel(latestPost)}</span>
                              <span>•</span>
                              <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {new Date(latestPost.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight uppercase tracking-tighter group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                              {latestPost.title}
                          </h3>
                          
                          <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-sm leading-relaxed mb-8 font-medium">
                              {latestPost.seo_description || "Dive into the comprehensive analysis and structured guidance specifically curated for your academic journey..."}
                          </p>
                          
                          <span className="inline-flex items-center text-[10px] font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all mt-auto uppercase tracking-widest group-hover:translate-x-3 duration-500">
                              Access Archive <ArrowRight className="w-4 h-4 ml-4"/>
                          </span>
                      </div>
                  </Link>
              ) : (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center p-12">
                      <Sparkles className="w-16 h-16 text-slate-100 dark:text-slate-800 mb-6" />
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-black uppercase tracking-widest">Awaiting Fresh Content</p>
                  </div>
              )}
          </div>

          {/* --- LIST COLUMN --- */}
          <div className="lg:col-span-5 flex flex-col gap-5">
              {sidePosts.length > 0 ? (
                  sidePosts.map(post => (
                      <Link 
                          key={post.id}
                          href={getPostLink(post)}
                          className="flex gap-6 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-indigo-900/10 hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all duration-300 group"
                      >
                          <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden relative bg-slate-950 border border-slate-100 dark:border-slate-800">
                               {post.content_url ? (
                                   <Image src={post.content_url} alt={post.title} fill className="object-cover group-hover:scale-125 transition-transform duration-700 opacity-80 group-hover:opacity-100"/>
                               ) : (
                                   <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-700">
                                        <Hash className="w-6 h-6 group-hover:scale-125 transition-transform" />
                                   </div>
                               )}
                          </div>
                          
                          <div className="min-w-0 flex-1 flex flex-col justify-center">
                              <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/30">
                                      {getLabel(post)}
                                  </span>
                              </div>
                              <h4 className="text-base font-black text-slate-800 dark:text-slate-200 leading-tight uppercase tracking-tighter line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {post.title}
                              </h4>
                              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                                  <CalendarDays className="w-3.5 h-3.5 text-indigo-400" /> {new Date(post.created_at).toLocaleDateString()}
                              </span>
                          </div>
                      </Link>
                  ))
              ) : (
                  <div className="flex-1 flex items-center justify-center p-12 text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/50">
                      Archive Synchronization Pending
                  </div>
              )}
              
              {activeTab && (
                  <Link 
                      href={`/blog?segment=${activeSegmentData?.title}`}
                      className="mt-4 block w-full py-5 text-center bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all duration-500 border border-slate-200 dark:border-slate-700 shadow-sm"
                  >
                      Expand Academic Journal <ChevronRight className="w-4 h-4 inline-block ml-2"/>
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