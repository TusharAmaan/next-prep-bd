'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabaseClient";
import { 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  User, 
  ArrowLeft,
  BookOpen,
  FileText,
  Clock,
  Eye,
  Share2,
  Bookmark,
  Languages,
  Moon,
  Sun,
  Menu,
  X,
  Link as LinkIcon,
  Facebook,
  MessageCircle,
  HelpCircle
} from "lucide-react";
import Link from 'next/link';
import { toast } from 'sonner';

export default function ContentDetailPage() {
  const { subjectId, contentId } = useParams();
  const router = useRouter();
  
  const [subject, setSubject] = useState<any>(null);
  const [hierarchy, setHierarchy] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  // Continuous Scrolling State
  const [loadedContents, setLoadedContents] = useState<any[]>([]); // Array of full content objects
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // UI States
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTocOpenMobile, setIsTocOpenMobile] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState<{id: string, show: boolean} | null>(null);

  // Intersection Observer Ref
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchInitialData = useCallback(async () => {
    setIsLoadingInitial(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // 1. Fetch the requested initial content
      const { data: initialContent } = await supabase
        .from('lesson_plan_contents')
        .select(`*, lesson_plan_lessons (*, lesson_plan_units (*))`)
        .eq('id', contentId)
        .single();
      
      if (initialContent) {
        setLoadedContents([initialContent]);
        // Increment view count (proactive)
        await supabase.from('lesson_plan_contents').update({ view_count: (initialContent.view_count || 0) + 1 }).eq('id', contentId);
      }

      // 2. Fetch Subject Info
      const { data: subData } = await supabase
        .from('subjects')
        .select('*, groups(segments(title))')
        .eq('id', subjectId)
        .single();
      setSubject(subData);

      // 3. Fetch flat hierarchy index to know what comes next
      const { data: hierarchyData } = await supabase
        .from('lesson_plan_units')
        .select(`
          *,
          lesson_plan_lessons (
            *,
            lesson_plan_contents (id, title, order_index, type)
          )
        `)
        .eq('subject_id', subjectId)
        .eq('version', initialContent?.version || 'bn')
        .order('order_index');
      
      setHierarchy(hierarchyData || []);
    } catch (error) {
      console.error("Error fetching content details:", error);
    } finally {
      setIsLoadingInitial(false);
    }
  }, [subjectId, contentId]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Flatten hierarchy into a straight list of all content IDs in order
  const flatContentIndex = useMemo(() => {
     let flat: any[] = [];
     hierarchy.forEach(u => {
        u.lesson_plan_lessons?.sort((a:any,b:any) => a.order_index - b.order_index).forEach((l:any) => {
           l.lesson_plan_contents?.sort((a:any,b:any) => a.order_index - b.order_index).forEach((c:any) => {
              flat.push({ ...c, unit: u, lesson: l });
           });
        });
     });
     return flat;
  }, [hierarchy]);

  // Infinite Scroll Logic
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !isLoadingMore && hasMore && loadedContents.length > 0 && flatContentIndex.length > 0) {
       loadNextContent();
    }
  }, [isLoadingMore, hasMore, loadedContents, flatContentIndex]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { root: null, rootMargin: '20px', threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver, loaderRef.current]);

  const loadNextContent = async () => {
     if (loadedContents.length === 0 || flatContentIndex.length === 0) return;
     const lastLoadedId = loadedContents[loadedContents.length - 1].id;
     
     const currentIndex = flatContentIndex.findIndex(c => c.id.toString() === lastLoadedId.toString());
     if (currentIndex === -1 || currentIndex >= flatContentIndex.length - 1) {
        setHasMore(false);
        return;
     }

     const nextContentMeta = flatContentIndex[currentIndex + 1];
     setIsLoadingMore(true);

     try {
        const { data: nextContent } = await supabase
          .from('lesson_plan_contents')
          .select(`*, lesson_plan_lessons (*, lesson_plan_units (*))`)
          .eq('id', nextContentMeta.id)
          .single();
        
        if (nextContent) {
           setLoadedContents(prev => [...prev, nextContent]);
           await supabase.from('lesson_plan_contents').update({ view_count: (nextContent.view_count || 0) + 1 }).eq('id', nextContent.id);
        }
     } catch (err) {
        console.error("Error loading next content:", err);
     } finally {
        setIsLoadingMore(false);
     }
  };

  const handleShare = (method: 'fb' | 'wa' | 'copy', contentUrl: string) => {
     const url = `${window.location.origin}${contentUrl}`;
     if (method === 'copy') {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
     } else if (method === 'fb') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
     } else if (method === 'wa') {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Check out this lesson: " + url)}`, '_blank');
     }
     setShowShareMenu(null);
  };

  const handleSave = () => {
     toast.success("Content saved to your Library!");
  };

  if (isLoadingInitial) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // Determine base styles for dark mode
  const bgMain = isDarkMode ? "bg-slate-950" : "bg-white";
  const textMain = isDarkMode ? "text-slate-200" : "text-slate-900";
  const bgCard = isDarkMode ? "bg-slate-900" : "bg-white";
  const borderCol = isDarkMode ? "border-slate-800" : "border-slate-100";
  const textMuted = isDarkMode ? "text-slate-400" : "text-slate-500";
  const proseDark = isDarkMode ? "prose-invert prose-slate" : "prose-slate";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgMain}`}>
      
      {/* TOP NAVIGATION BREADCRUMB */}
      <div className={`sticky top-0 z-40 ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50/80 border-slate-200'} backdrop-blur-md border-b pt-20 pb-4`}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className={`flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
               <Link href="/curriculum" className="hover:text-indigo-500 transition-colors">Curriculum</Link>
               <ChevronRight className="w-3 h-3" />
               <Link href={`/curriculum/${subjectId}`} className="hover:text-indigo-500 transition-colors">{subject?.title}</Link>
            </div>
            
            {/* Theme Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full border transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 border-slate-700 text-yellow-500 hover:bg-slate-700' : 'bg-white border-slate-200 text-indigo-900 hover:bg-slate-100'}`}
            >
              {isDarkMode ? <><Sun className="w-4 h-4" /> Light Mode</> : <><Moon className="w-4 h-4" /> Dark Mode</>}
            </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* MAIN CONTINUOUS CONTENT AREA */}
          <article className="flex-1 max-w-4xl space-y-24">
             {loadedContents.map((c, index) => {
                const isBengali = c.version === 'bn';
                
                // Process Paywall
                let htmlBody = c.content_body || "";
                let isPaywalled = false;
                if (!user && index === 0) { 
                    const previewLength = Math.floor(htmlBody.length * 0.3);
                    if (htmlBody.length > 500) {
                       htmlBody = htmlBody.substring(0, previewLength);
                       isPaywalled = true;
                    }
                } else if (!user && index > 0) {
                    htmlBody = ""; // Next contents are completely locked out
                    isPaywalled = true;
                }

                return (
                 <div key={c.id} id={`content-${c.id}`} className={`scroll-mt-32 ${index > 0 ? 'pt-24 border-t ' + borderCol : ''}`}>
                   <header className="mb-10">
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                         <div className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${isDarkMode ? 'bg-indigo-900/30 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                            {c.lesson_plan_lessons?.lesson_plan_units?.title} • {c.lesson_plan_lessons?.title}
                         </div>
                         <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${textMuted}`}>
                            <Clock className="w-3 h-3" /> 5 min read
                         </div>
                         <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase ml-auto ${textMuted}`}>
                            <Eye className="w-3 h-3" /> {c.view_count || 0}
                         </div>
                      </div>
                      
                      <h1 className={`text-3xl md:text-5xl font-black tracking-tighter uppercase mb-6 leading-[1.1] ${textMain} ${isBengali ? 'font-noto-serif-bengali' : ''}`}>
                         {c.title}
                      </h1>

                      <div className={`flex items-center gap-4 py-6 border-y ${borderCol}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}><User className="w-5 h-5 text-slate-400" /></div>
                          <div>
                              <p className={`text-xs font-black uppercase ${textMain}`}>Academic Team</p>
                              <p className={`text-[10px] font-bold uppercase tracking-tight ${textMuted}`}>Updated {new Date(c.created_at).toLocaleDateString()}</p>
                          </div>
                          
                          <div className="ml-auto flex gap-2 relative">
                             {/* Share Button Group */}
                             <button 
                               onClick={() => setShowShareMenu(showShareMenu?.id === c.id ? null : {id: c.id, show: true})}
                               className={`p-2.5 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-indigo-400' : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-indigo-600'}`}
                             >
                                <Share2 className="w-4 h-4" />
                             </button>
                             {showShareMenu?.id === c.id && (
                                <div className={`absolute top-full right-12 mt-2 w-48 rounded-2xl shadow-xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                   <button onClick={() => handleShare('copy', `/curriculum/${subjectId}/${c.id}`)} className={`w-full text-left px-4 py-3 text-xs font-bold font-sans uppercase flex items-center gap-3 transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}><LinkIcon className="w-4 h-4"/> Copy Link</button>
                                   <button onClick={() => handleShare('fb', `/curriculum/${subjectId}/${c.id}`)} className={`w-full text-left px-4 py-3 text-xs font-bold font-sans uppercase flex items-center gap-3 transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}><Facebook className="w-4 h-4 text-blue-500"/> Facebook</button>
                                   <button onClick={() => handleShare('wa', `/curriculum/${subjectId}/${c.id}`)} className={`w-full text-left px-4 py-3 text-xs font-bold font-sans uppercase flex items-center gap-3 transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}><MessageCircle className="w-4 h-4 text-emerald-500"/> WhatsApp</button>
                                </div>
                             )}

                             <button 
                               onClick={handleSave}
                               className={`p-2.5 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-indigo-400 hover:border-indigo-500/30' : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-indigo-600 hover:border-indigo-200'}`}
                               title="Save to Library"
                             >
                                <Bookmark className="w-4 h-4" />
                             </button>
                          </div>
                      </div>
                   </header>

                   {/* RICH TEXT CONTENT */}
                   <div className="relative">
                      {isPaywalled && index > 0 ? (
                         // If locked and scrolled to next item
                         <div className={`p-10 rounded-[2rem] text-center border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                            <Lock className="w-8 h-8 mx-auto mb-4 opacity-50" />
                            <h4 className="text-xl font-black uppercase mb-2">Login Required</h4>
                            <p className="text-sm font-medium mb-6 max-w-sm mx-auto">This section continues the lesson, but is reserved for authenticated students.</p>
                            <Link href="/login" className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase text-xs">Login to Read</Link>
                         </div>
                      ) : (
                         <div 
                          className={`prose max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:font-medium lg:prose-lg ${proseDark} ${isBengali ? 'font-noto-serif-bengali' : 'font-sans'} ${isPaywalled ? 'select-none pointer-events-none' : ''}`}
                          dangerouslySetInnerHTML={{ __html: htmlBody }}
                        />
                      )}

                      {/* Paywall Overlay for Guest (Partial Preview) */}
                      {isPaywalled && index === 0 && (
                         <div className="mt-8">
                            <div className={`h-40 bg-gradient-to-t ${isDarkMode ? 'from-slate-950 via-slate-950/90' : 'from-white via-white/90'} to-transparent -translate-y-40 pointer-events-none`} />
                            
                            <div className="relative -mt-32 p-10 bg-indigo-600 rounded-[3rem] text-white overflow-hidden shadow-2xl shadow-indigo-900/20 text-center animate-in zoom-in-95 duration-500">
                               <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                               <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                               <div className="relative z-10 space-y-6">
                                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center mx-auto border border-white/30 shadow-xl">
                                     <Lock className="w-8 h-8 text-white" />
                                  </div>
                                  <div>
                                     <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">Want to Continue Reading?</h3>
                                     <p className="text-indigo-100 font-medium max-w-sm mx-auto">This is just 30% of the content. Log in to unlock the full lesson, exercises, and exams!</p>
                                  </div>
                                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                                     <Link href="/login" className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-all shadow-lg">Login to Account</Link>
                                     <Link href="/signup" className="px-8 py-4 bg-indigo-500 text-white border border-indigo-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-400 transition-all">Create Account</Link>
                                  </div>
                               </div>
                            </div>
                         </div>
                      )}
                   </div>
                   
                   {/* Linked Materials (If any) */}
                   {!isPaywalled && (c.linked_exam_id || c.linked_sheet_id) && (
                      <div className={`mt-16 rounded-[3rem] p-10 relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20'}`}>
                         <div className="absolute top-0 right-0 p-8 opacity-10"><BookOpen className="w-32 h-32" /></div>
                         <div className="relative z-10">
                            <h4 className="text-xl font-black uppercase tracking-tight mb-6 italic">Master this Topic</h4>
                            <div className="flex flex-wrap gap-4">
                               {c.linked_exam_id && (
                                 <button className="px-6 py-4 bg-indigo-600 rounded-2xl flex items-center gap-3 font-bold hover:bg-white hover:text-indigo-600 transition-all shadow-xl">
                                    <FileText className="w-5 h-5" /> TAKE TOPIC EXAM
                                 </button>
                               )}
                               {c.linked_sheet_id && (
                                 <button className="px-6 py-4 bg-slate-800 rounded-2xl flex items-center gap-3 font-bold hover:bg-slate-700 transition-all border border-slate-700">
                                    <FileText className="w-5 h-5" /> DOWNLOAD LECTURE SHEET
                                 </button>
                               )}
                            </div>
                         </div>
                      </div>
                   )}
                 </div>
                );
             })}

             {/* Intersection Observer Target */}
             {hasMore && user && (
               <div ref={loaderRef} className={`py-12 flex justify-center items-center gap-3 ${textMuted} font-bold text-xs uppercase tracking-widest`}>
                 <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> Scroll for next lesson
               </div>
             )}
             {!hasMore && (
               <div className={`py-12 text-center font-bold text-xs uppercase tracking-widest ${textMuted}`}>
                  End of Lesson Plan
               </div>
             )}
          </article>

          {/* SIDEBAR NAVIGATION (Table of Contents) */}
          <aside className="hidden lg:block w-80 shrink-0">
             <div className={`${bgCard} rounded-[2.5rem] border ${borderCol} p-8 sticky top-36 max-h-[75vh] flex flex-col shadow-xl shadow-slate-200/5 dark:shadow-none`}>
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white"><BookOpen className="w-5 h-5" /></div>
                   <div>
                      <h3 className={`text-sm font-black uppercase ${textMain}`}>Table of Contents</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-tight italic ${textMuted}`}>Course Progression</p>
                   </div>
                </div>

                <div className="overflow-y-auto flex-1 pr-2 space-y-6 custom-scrollbar scroll-smooth">
                   {hierarchy.map(unit => (
                      <div key={unit.id} className="space-y-3">
                         <div className="flex items-center gap-2">
                             <div className="w-1 h-4 bg-indigo-600 rounded-full" />
                             <h4 className={`text-[10px] font-black uppercase tracking-widest ${textMain}`}>{unit.title}</h4>
                         </div>
                         <div className={`space-y-1 pl-3 border-l ${borderCol}`}>
                            {unit.lesson_plan_lessons?.sort((a:any, b:any) => a.order_index - b.order_index).map((l: any) => (
                               <div key={l.id} className="space-y-1">
                                  <p className={`text-[10px] font-bold py-1 uppercase ${textMuted}`}>{l.title}</p>
                                  {l.lesson_plan_contents?.sort((a:any, b:any) => a.order_index - b.order_index).map((c: any) => {
                                     // Determine if active: we can just check if it's the latest loaded one, or just if it's in loaded contents 
                                     const isViewed = loadedContents.some(loaded => loaded.id === c.id);
                                     
                                     return (
                                       <button 
                                         key={c.id} 
                                         onClick={() => {
                                            const element = document.getElementById(`content-${c.id}`);
                                            if (element) {
                                               element.scrollIntoView({ behavior: 'smooth' });
                                            } else {
                                               // If not loaded yet, push to router to hard reload on that exact content
                                               router.push(`/curriculum/${subjectId}/${c.id}`);
                                            }
                                         }}
                                         className={`group w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${isViewed ? 'bg-indigo-600 text-white shadow-md' : `${textMuted} hover:text-indigo-500 dark:hover:text-indigo-400`}`}
                                       >
                                          <div className={`w-1.5 h-1.5 rounded-full ${isViewed ? 'bg-white scale-125' : (isDarkMode ? 'bg-slate-700' : 'bg-slate-300')}`} />
                                          <span className="truncate">{c.title}</span>
                                       </button>
                                     );
                                  })}
                               </div>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>

                <Link href={`/curriculum/${subjectId}`} className="mt-8 flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                   <Languages className="w-4 h-4" /> BACK TO SUBJECT
                </Link>
             </div>
          </aside>

        </div>
      </div>

      {/* MOBILE FLOATING TOC BUBBLE */}
      <button 
         onClick={() => setIsTocOpenMobile(true)}
         className="lg:hidden fixed bottom-6 left-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white dark:border-slate-800 z-50 hover:scale-105 transition-transform"
      >
         <BookOpen className="w-6 h-6" />
      </button>

      {/* MOBILE TOC OVERLAY */}
      {isTocOpenMobile && (
         <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in">
            <div className={`w-full max-h-[85vh] rounded-t-[3rem] p-8 flex flex-col animate-in slide-in-from-bottom-full ${bgCard} border-t ${borderCol}`}>
               <div className="flex justify-between items-center mb-6 shrink-0">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white"><BookOpen className="w-5 h-5" /></div>
                     <div>
                        <h3 className={`text-sm font-black uppercase ${textMain}`}>Table of Contents</h3>
                     </div>
                  </div>
                  <button onClick={() => setIsTocOpenMobile(false)} className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}><X className="w-5 h-5" /></button>
               </div>

               <div className="overflow-y-auto flex-1 pr-2 space-y-6">
                   {hierarchy.map(unit => (
                      <div key={unit.id} className="space-y-3">
                         <div className="flex items-center gap-2">
                             <div className="w-1 h-4 bg-indigo-600 rounded-full" />
                             <h4 className={`text-[10px] font-black uppercase tracking-widest ${textMain}`}>{unit.title}</h4>
                         </div>
                         <div className={`space-y-1 pl-3 border-l ${borderCol}`}>
                            {unit.lesson_plan_lessons?.sort((a:any, b:any) => a.order_index - b.order_index).map((l: any) => (
                               <div key={l.id} className="space-y-1">
                                  <p className={`text-[10px] font-bold py-1 uppercase ${textMuted}`}>{l.title}</p>
                                  {l.lesson_plan_contents?.sort((a:any, b:any) => a.order_index - b.order_index).map((c: any) => {
                                     const isViewed = loadedContents.some(loaded => loaded.id === c.id);
                                     return (
                                       <button 
                                         key={c.id} 
                                         onClick={() => {
                                            setIsTocOpenMobile(false);
                                            const element = document.getElementById(`content-${c.id}`);
                                            if (element) {
                                               element.scrollIntoView({ behavior: 'smooth' });
                                            } else {
                                               router.push(`/curriculum/${subjectId}/${c.id}`);
                                            }
                                         }}
                                         className={`group w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${isViewed ? 'bg-indigo-600 text-white' : `${textMuted}`}`}
                                       >
                                          <div className={`w-1.5 h-1.5 rounded-full ${isViewed ? 'bg-white scale-125' : (isDarkMode ? 'bg-slate-700' : 'bg-slate-300')}`} />
                                          <span className="truncate">{c.title}</span>
                                       </button>
                                     );
                                  })}
                               </div>
                            ))}
                         </div>
                      </div>
                   ))}
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
