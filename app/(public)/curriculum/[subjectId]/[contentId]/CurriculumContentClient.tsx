'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { parseHashtagsToHTML } from '@/utils/hashtagParser';
import { 
  ChevronRight, 
  ChevronDown,
  Lock, 
  User, 
  BookOpen,
  FileText,
  Clock,
  Eye,
  Share2,
  Bookmark,
  Sun,
  Moon,
  X,
  Link as LinkIcon,
  Facebook,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Zap,
  Layers
} from "lucide-react";
import Link from 'next/link';
import { toast } from 'sonner';
import renderMathInElement from "katex/dist/contrib/auto-render";
import "katex/dist/katex.min.css";
import Discussion from '@/components/shared/Discussion';
import TypographyScaler from '@/components/shared/TypographyScaler';
import { useTheme } from '@/components/shared/ThemeProvider';

interface ClientProps {
  subjectId: string;
  initialContent: any;
  initialSubject: any;
  initialHierarchy: any[];
  user: any;
}

export default function CurriculumContentClient({
  subjectId,
  initialContent,
  initialSubject,
  initialHierarchy,
  user
}: ClientProps) {
  const [subject] = useState<any>(initialSubject);
  const [hierarchy] = useState<any[]>(initialHierarchy);
  
  const [loadedContents, setLoadedContents] = useState<any[]>([initialContent]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [reachedBoundary, setReachedBoundary] = useState(false);
  
  const { isDark, toggleTheme } = useTheme();
  const [isTocOpenMobile, setIsTocOpenMobile] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState<{id: string, show: boolean} | null>(null);

  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  const loaderRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);

  // KaTeX Auto-render
  useEffect(() => {
    if (articleRef.current) {
      try {
        renderMathInElement(articleRef.current, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
          ],
          throwOnError: false,
        });
      } catch (err) {
        // KaTeX error handled silently or with a fallback
      }
    }
  }, [loadedContents, isDark]);

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

  // Auto-expand based on loaded contents
  useEffect(() => {
    if (loadedContents.length === 0 || hierarchy.length === 0) return;
    const unitIds = new Set<string>();
    const lessonIds = new Set<string>();
    hierarchy.forEach(u => {
      u.lesson_plan_lessons?.forEach((l: any) => {
        l.lesson_plan_contents?.forEach((c: any) => {
          if (loadedContents.some(lc => lc.id === c.id)) {
            unitIds.add(String(u.id));
            lessonIds.add(String(l.id));
          }
        });
      });
    });
    setExpandedUnits(prev => new Set([...prev, ...unitIds]));
    setExpandedLessons(prev => new Set([...prev, ...lessonIds]));
  }, [loadedContents, hierarchy]);

  const loadNextContent = async () => {
     if (loadedContents.length === 0 || flatContentIndex.length === 0) return;
     const lastLoaded = loadedContents[loadedContents.length - 1];
     const currentIndex = flatContentIndex.findIndex(c => c.id.toString() === lastLoaded.id.toString());
     
     if (currentIndex === -1 || currentIndex >= flatContentIndex.length - 1) {
        setHasMore(false);
        return;
     }

     const nextContentMeta = flatContentIndex[currentIndex + 1];

     if (nextContentMeta.lesson_id !== lastLoaded.lesson_id) {
        if (!reachedBoundary) {
            setReachedBoundary(true);
            return;
        }
     }

     setIsLoadingMore(true);
     setReachedBoundary(false);

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
        // Error loading next content
     } finally {
        setIsLoadingMore(false);
     }
  };

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !isLoadingMore && hasMore && loadedContents.length > 0 && flatContentIndex.length > 0 && !reachedBoundary && user) {
       loadNextContent();
    }
  }, [isLoadingMore, hasMore, loadedContents, flatContentIndex, reachedBoundary, user]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { root: null, rootMargin: '20px', threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId); else next.add(unitId);
      return next;
    });
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId); else next.add(lessonId);
      return next;
    });
  };

  const handleShare = (method: 'fb' | 'wa' | 'copy', contentUrl: string) => {
     const url = `${window.location.origin}${contentUrl}`;
     if (method === 'copy') {
        navigator.clipboard.writeText(url);
        toast.success("Link Copied");
     } else if (method === 'fb') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
     } else if (method === 'wa') {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Educational Resource: " + url)}`, '_blank');
     }
     setShowShareMenu(null);
  };

  const handleSave = () => {
     toast.success("Saved to Library");
  };

  // Theme constants
  const textMain = isDark ? "text-slate-100" : "text-slate-900";
  const borderCol = isDark ? "border-slate-800" : "border-slate-100";
  const proseClass = isDark ? "prose-invert prose-slate" : "prose-slate";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-white dark:bg-slate-950`}>
      <TypographyScaler />
      
      {/* PRE NAVIGATION */}
      <div className={`fixed top-4 md:top-6 left-0 right-0 z-[60] px-4 md:px-6 pointer-events-none`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
             <div className="flex items-center gap-3">
                 <Link href={`/curriculum/${subjectId}`} className={`w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-lg md:shadow-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600`}>
                    <ArrowRight className="w-5 h-5 rotate-180" />
                 </Link>
             </div>
             
             <div className="flex items-center gap-2 md:gap-3">
                 <button 
                  onClick={toggleTheme}
                  className={`w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-lg md:shadow-xl border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 ${isDark ? 'text-amber-400' : 'text-indigo-600'}`}
                 >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                 </button>
                 <button 
                    onClick={() => setIsTocOpenMobile(true)}
                    className="lg:hidden w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-lg bg-indigo-600 text-white border border-indigo-500 active:scale-95"
                 >
                    <BookOpen className="w-5 h-5" />
                 </button>
             </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20 md:py-24 relative">
        <div className="flex flex-col lg:flex-row gap-12 md:gap-20">
          
          {/* MAIN COLUMN */}
          <article ref={articleRef} className="flex-1 max-w-4xl space-y-32">
             {loadedContents.map((c, index) => {
                const isBengali = c.version === 'bn';
                let htmlBody = c.content_body || "";
                let isPaywalled = false;
                
                if (!user && index === 0) { 
                    const previewLength = Math.floor(htmlBody.length * 0.3);
                    if (htmlBody.length > 500) {
                       htmlBody = htmlBody.substring(0, previewLength);
                       isPaywalled = true;
                    }
                } else if (!user && index > 0) {
                    htmlBody = "";
                    isPaywalled = true;
                }

                return (
                 <div key={c.id} id={`content-${c.id}`} className="scroll-mt-32">
                    <header className="mb-12">
                       <div className="flex items-center gap-4 mb-8 flex-wrap">
                          <div className="px-4 py-1.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-widest rounded-full">
                             {c.lesson_plan_lessons?.lesson_plan_units?.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500">
                             <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> 5-8 min read</div>
                          </div>
                          <div className="ml-auto flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500">
                             <div className="flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> {c.view_count || 0} views</div>
                          </div>
                       </div>
                       
                       <h1 className={`text-3xl sm:text-4xl md:text-6xl font-bold mb-6 md:mb-8 leading-[1.1] md:leading-[0.9] tracking-tight ${textMain} ${isBengali ? 'font-bangla' : ''}`}>
                          {c.title}
                       </h1>

                       <div className={`p-3.5 bg-slate-50 dark:bg-slate-900 border ${borderCol} rounded-2xl flex items-center gap-4 transition-colors`}>
                           <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border ${borderCol} flex items-center justify-center shadow-inner shrink-0">
                               <User className="w-5 h-5 text-slate-400" />
                           </div>
                           <div className="flex-1 min-w-0">
                               <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Master Educator</p>
                               <p className="text-[10px] font-bold text-slate-400 tracking-wide mt-0.5 truncate uppercase">Verified Content • {new Date(c.created_at).toLocaleDateString()}</p>
                           </div>
                           
                           <div className="flex gap-1.5 relative shrink-0">
                              <button 
                                onClick={() => setShowShareMenu(showShareMenu?.id === c.id ? null : {id: c.id, show: true})}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all bg-white dark:bg-slate-800 border ${borderCol} hover:border-indigo-500 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm`}
                              >
                                 <Share2 className="w-3.5 h-3.5" />
                              </button>
                              {showShareMenu?.id === c.id && (
                                 <div className={`absolute bottom-full right-0 mb-3 w-56 rounded-2xl shadow-3xl border overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 bg-white dark:bg-slate-900 ${borderCol}`}>
                                    <button onClick={() => handleShare('copy', `/curriculum/${subjectId}/${c.id}`)} className="w-full text-left px-5 py-4 text-xs font-bold tracking-widest flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"><LinkIcon size={16}/> Copy Link</button>
                                    <button onClick={() => handleShare('fb', `/curriculum/${subjectId}/${c.id}`)} className="w-full text-left px-5 py-4 text-xs font-bold tracking-widest flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"><Facebook size={16} className="text-indigo-600"/> Facebook</button>
                                    <button onClick={() => handleShare('wa', `/curriculum/${subjectId}/${c.id}`)} className="w-full text-left px-5 py-4 text-xs font-bold tracking-widest flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"><MessageCircle size={16} className="text-emerald-500"/> WhatsApp</button>
                                 </div>
                              )}
                              <button 
                                onClick={handleSave}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all bg-white dark:bg-slate-800 border ${borderCol} hover:border-indigo-500 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm`}
                              >
                                 <Bookmark className="w-3.5 h-3.5" />
                              </button>
                           </div>
                       </div>
                    </header>

                    <div className="relative">
                       {isPaywalled && index > 0 ? (
                          <div className={`p-12 rounded-[3rem] text-center border-2 border-dashed ${borderCol} bg-slate-50 dark:bg-slate-900/50`}>
                             <Lock className="w-12 h-12 mx-auto mb-6 text-indigo-500" />
                             <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Login Required</h4>
                             <p className="text-sm font-semibold text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed">This curriculum is restricted to registered members. Please sign in to continue.</p>
                             <Link href="/login" className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20">Sign In Now <Zap size={14} /></Link>
                          </div>
                       ) : (
                          <div 
                           className={`prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:font-medium prose-p:leading-relaxed lg:prose-xl ${proseClass} ${isBengali ? 'font-bangla' : 'font-sans'}`}
                           dangerouslySetInnerHTML={{ __html: parseHashtagsToHTML(htmlBody) }}
                         />
                       )}

                       {isPaywalled && index === 0 && (
                          <div className="mt-12">
                             <div className={`h-64 bg-gradient-to-t from-white dark:from-slate-950 via-white/90 dark:via-slate-950/90 to-transparent -translate-y-64 pointer-events-none`} />
                             <div className="relative -mt-48 p-12 bg-slate-900 dark:bg-indigo-600 rounded-[3rem] text-white shadow-3xl text-center group overflow-hidden border border-white/10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                                <div className="relative z-10 space-y-8">
                                   <div className="w-20 h-20 bg-white/10 backdrop-blur border border-white/20 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl"><Lock className="w-10 h-10" /></div>
                                   <div>
                                      <h3 className="text-3xl font-bold mb-4 tracking-tight">Continue Learning?</h3>
                                      <p className="text-indigo-100 dark:text-slate-300 text-sm font-semibold max-w-sm mx-auto opacity-80 leading-relaxed">You have accessed a preview of this subject. Sign in to your student account to sync your progress and view the full curriculum.</p>
                                   </div>
                                   <div className="flex flex-col sm:flex-row justify-center gap-4">
                                      <Link href="/login" className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-bold text-xs tracking-widest hover:bg-slate-100 transition-all shadow-xl">Sign In</Link>
                                      <Link href="/signup" className="px-12 py-5 bg-transparent border-2 border-white/20 hover:bg-white/10 rounded-2xl font-bold text-xs tracking-widest transition-all">Sign Up Free</Link>
                                   </div>
                                </div>
                             </div>
                          </div>
                       )}
                    </div>
                    
                    {!isPaywalled && (
                      <div className="mt-20">
                        <Discussion itemType="curriculum" itemId={c.id.toString()} />
                      </div>
                    )}
                 </div>
                );
             })}

             {hasMore && user && !reachedBoundary && (
                <div ref={loaderRef} className="py-24 flex justify-center">
                  <div className="flex items-center gap-4 px-8 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold tracking-widest text-slate-400">
                     <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> Loading Next Part
                  </div>
                </div>
             )}

             {reachedBoundary && (
                <div className={`p-16 rounded-[4rem] border-2 border-dashed bg-indigo-50/50 dark:bg-slate-900/50 border-indigo-100 dark:border-slate-800 text-center animate-in zoom-in-95 duration-700`}>
                   <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/30 border-4 border-white dark:border-slate-800">
                      <Sparkles className="w-10 h-10" />
                   </div>
                   <h3 className={`text-4xl font-bold tracking-tight mb-4 ${textMain}`}>Part Complete</h3>
                   <p className={`text-xs font-semibold tracking-widest mb-10 max-w-xs mx-auto ${textMuted} leading-relaxed opacity-80`}>You've finished this section. Ready to continue with the next part of the curriculum?</p>
                   
                   <button 
                    onClick={loadNextContent}
                    className="group px-12 py-6 bg-slate-900 dark:bg-indigo-600 text-white rounded-[2rem] font-bold tracking-widest text-xs flex items-center gap-4 mx-auto hover:bg-indigo-500 hover:-translate-y-2 transition-all shadow-3xl shadow-indigo-600/20 active:scale-95"
                   >
                     Next Part <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
             )}

             {!hasMore && (
                <div className="py-32 text-center">
                   <GraduationCap className="w-16 h-16 mx-auto mb-8 text-slate-200 dark:text-slate-800" />
                   <h4 className="text-xl font-bold text-slate-400 dark:text-slate-600 tracking-tight">End of Syllabus</h4>
                   <p className="text-xs font-bold tracking-widest text-slate-300 dark:text-slate-700 mt-2">Achievement unlocked: Curriculum complete</p>
                </div>
             )}
          </article>

          {/* SIDEBAR NAVIGATION */}
          <aside className="hidden lg:block w-96 shrink-0 sticky top-40 h-fit max-h-[80vh] flex flex-col">
             <div className={`flex-1 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 flex flex-col shadow-2xl dark:shadow-none transition-colors`}>
                <div className="flex items-center gap-4 mb-10 border-b border-slate-50 dark:border-slate-800 pb-8">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/20"><Layers className="w-6 h-6" /></div>
                   <div>
                      <h3 className={`text-xs font-bold tracking-widest ${textMain}`}>Course Index</h3>
                      <p className={`text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 mt-1`}>Your Status</p>
                   </div>
                </div>

                <div className="overflow-y-auto flex-1 pr-4 space-y-3 custom-scrollbar">
                   {hierarchy.map(unit => {
                      const unitKey = String(unit.id);
                      const isUnitOpen = expandedUnits.has(unitKey);
                      const unitHasViewed = unit.lesson_plan_lessons?.some((l: any) => l.lesson_plan_contents?.some((c: any) => loadedContents.some(lc => lc.id === c.id)));
                      
                      return (
                        <div key={unit.id} className="space-y-2">
                         <button
                           onClick={() => toggleUnit(unitKey)}
                           className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-left group ${unitHasViewed ? 'bg-indigo-600/5 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                         >
                             <div className={`w-1.5 h-6 rounded-full shrink-0 transition-all ${unitHasViewed ? 'bg-indigo-600 scale-y-110' : 'bg-slate-200 dark:bg-slate-700'}`} />
                             <h4 className={`text-xs font-bold flex-1 truncate font-bangla ${unitHasViewed ? 'text-indigo-600 dark:text-indigo-400' : textMain}`}>{unit.title}</h4>
                             <ChevronDown size={14} className={`transition-transform duration-500 text-slate-300 ${isUnitOpen ? 'rotate-180' : ''}`} />
                         </button>
                         
                         {isUnitOpen && (
                           <div className="space-y-4 pl-6 border-l-2 border-slate-50 dark:border-slate-800 ml-5 animate-in slide-in-from-top-2 duration-300">
                            {unit.lesson_plan_lessons?.sort((a:any, b:any) => a.order_index - b.order_index).map((l: any) => {
                               const lessonKey = String(l.id);
                               const isLessonOpen = expandedLessons.has(lessonKey);
                               const lessonHasViewed = l.lesson_plan_contents?.some((c: any) => loadedContents.some(lc => lc.id === c.id));

                               return (
                                 <div key={l.id} className="space-y-2">
                                  <button
                                    onClick={() => toggleLesson(lessonKey)}
                                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-all text-left ${lessonHasViewed ? 'text-indigo-500' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-400'}`}
                                  >
                                     <ChevronDown size={12} className={`transition-transform duration-500 ${isLessonOpen ? 'rotate-180' : ''}`} />
                                     <span className="text-xs font-bold truncate flex-1 font-bangla">{l.title}</span>
                                  </button>

                                  {isLessonOpen && (
                                    <div className="space-y-1.5 pl-4">
                                     {l.lesson_plan_contents?.sort((a:any, b:any) => a.order_index - b.order_index).map((c: any) => {
                                      const isViewed = loadedContents.some(loaded => loaded.id === c.id);
                                      return (
                                        <button 
                                          key={c.id} 
                                          onClick={() => {
                                             const element = document.getElementById(`content-${c.id}`);
                                             if (element) element.scrollIntoView({ behavior: 'smooth' });
                                             else window.location.href = `/curriculum/${subjectId}/${c.id}`;
                                          }}
                                          className={`relative w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all font-bangla overflow-hidden group/item ${isViewed ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                                        >
                                           <span className="truncate flex-1">{c.title}</span>
                                           {isViewed && <CheckCircle2 size={12} className="shrink-0" />}
                                        </button>
                                      );
                                     })}
                                    </div>
                                  )}
                                 </div>
                               );
                            })}
                           </div>
                         )}
                        </div>
                      );
                   })}
                </div>

                <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800">
                    <Link href={`/curriculum/${subjectId}`} className="w-full flex items-center justify-center gap-3 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 text-slate-600 dark:text-slate-200 rounded-2xl text-xs font-bold tracking-widest hover:bg-slate-900 hover:text-white hover:border-transparent transition-all shadow-sm">
                        <ArrowRight size={14} className="rotate-180" /> Back to Subject
                    </Link>
                </div>
             </div>
          </aside>
        </div>
      </div>

      {/* MOBILE TOC OVERLAY */}
      {isTocOpenMobile && (
         <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
            <div className={`w-full max-w-[320px] h-full flex flex-col animate-in slide-in-from-right duration-500 bg-white dark:bg-slate-900`}>
               <div className="p-8 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Navigation</h3>
                  <button onClick={() => setIsTocOpenMobile(false)} className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 rounded-2xl transition-colors"><X className="w-6 h-6" /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                   {hierarchy.map(unit => {
                      const unitKey = String(unit.id);
                      const isUnitOpen = expandedUnits.has(unitKey);
                      return (
                        <div key={unit.id} className="space-y-2">
                           <button onClick={() => toggleUnit(unitKey)} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-left">
                              <span className="text-xs font-bold flex-1 font-bangla dark:text-white">{unit.title}</span>
                              <ChevronDown size={14} className={`transition-transform duration-500 ${isUnitOpen ? 'rotate-180' : ''}`} />
                           </button>
                           {isUnitOpen && (
                             <div className="pl-4 space-y-2">
                                {unit.lesson_plan_lessons?.map((l:any) => (
                                   <div key={l.id} className="space-y-1">
                                      <p className="text-xs font-bold text-slate-400 font-bangla pl-2">{l.title}</p>
                                      {l.lesson_plan_contents?.map((c:any) => (
                                         <button onClick={() => { setIsTocOpenMobile(false); const el = document.getElementById(`content-${c.id}`); if (el) el.scrollIntoView({behavior:'smooth'}); }} className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-bold text-left dark:text-slate-300">
                                            {c.title}
                                         </button>
                                      ))}
                                   </div>
                                ))}
                             </div>
                           )}
                        </div>
                      );
                   })}
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
