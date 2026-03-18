'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Languages
} from "lucide-react";
import Link from 'next/link';

export default function ContentDetailPage() {
  const { subjectId, contentId } = useParams();
  const router = useRouter();
  
  const [content, setContent] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [hierarchy, setHierarchy] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adjacents, setAdjacents] = useState<{ prev: any, next: any }>({ prev: null, next: null });

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Get User Session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // 2. Fetch Content with Lesson and Unit
      const { data: contentData } = await supabase
        .from('lesson_plan_contents')
        .select(`
          *,
          lesson_plan_lessons (
            *,
            lesson_plan_units (*)
          )
        `)
        .eq('id', contentId)
        .single();
      
      if (contentData) {
        setContent(contentData);
        
        // Increment view count (proactive)
        await supabase.from('lesson_plan_contents').update({ view_count: (contentData.view_count || 0) + 1 }).eq('id', contentId);
      }

      // 3. Fetch Subject Info
      const { data: subData } = await supabase
        .from('subjects')
        .select('*, groups(segments(title))')
        .eq('id', subjectId)
        .single();
      setSubject(subData);

      // 4. Fetch Hierarchy (Sidebar)
      const { data: hierarchyData } = await supabase
        .from('lesson_plan_units')
        .select(`
          *,
          lesson_plan_lessons (
            *,
            lesson_plan_contents (id, title, order_index)
          )
        `)
        .eq('subject_id', subjectId)
        .eq('version', contentData?.version || 'bn')
        .order('order_index');
      setHierarchy(hierarchyData || []);

      // 5. Calculate Adjacents (Simplified: within the same lesson)
      if (contentData && hierarchyData) {
         const currentLesson = contentData.lesson_plan_lessons;
         const allContents = currentLesson?.lesson_plan_contents?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
         const currentIndex = allContents.findIndex((c: any) => c.id.toString() === contentId?.toString());
         
         setAdjacents({
            prev: currentIndex > 0 ? allContents[currentIndex - 1] : null,
            next: currentIndex < allContents.length - 1 ? allContents[currentIndex + 1] : null
         });
      }

    } catch (error) {
      console.error("Error fetching content details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, contentId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // PAYWALL LOGIC
  const processedContent = useMemo(() => {
    if (!content?.content_body) return "";
    if (user) return content.content_body; // Logged in: Full content

    // Not logged in: 30% Preview
    const body = content.content_body;
    const length = body.length;
    const previewLength = Math.floor(length * 0.3);
    
    // Find a good stopping point (end of a tag or space)
    const preview = body.substring(0, previewLength);
    return preview;
  }, [content, user]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* TOP NAVIGATION BREADCRUMB (Image 3) */}
      <div className="bg-slate-50 border-b border-slate-100 pt-24 pb-4">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <Link href="/curriculum" className="hover:text-indigo-600">Curriculum</Link>
               <ChevronRight className="w-3 h-3" />
               <Link href={`/curriculum/${subjectId}`} className="hover:text-indigo-600">{subject?.title} ({subject?.groups?.segments?.title})</Link>
               <ChevronRight className="w-3 h-3" />
               <span className="text-indigo-600">{content?.lesson_plan_lessons?.title}</span>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* MAIN CONTENT AREA */}
          <article className="flex-1 max-w-4xl">
             <header className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                   <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg border border-indigo-100">
                      Version: {content?.version === 'bn' ? 'Bengali' : 'English'}
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                      <Clock className="w-3 h-3" /> 5 min read
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase ml-auto">
                      <Eye className="w-3 h-3" /> {content?.view_count || 0}
                   </div>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-6 leading-[1.1]">
                   {content?.title}
                </h1>

                <div className="flex items-center gap-4 py-6 border-y border-slate-50">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><User className="w-5 h-5 text-slate-400" /></div>
                    <div>
                        <p className="text-xs font-black text-slate-900 uppercase">Academic Team</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Updated {new Date(content?.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                       <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 transition-all"><Share2 className="w-4 h-4" /></button>
                       <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 transition-all"><Bookmark className="w-4 h-4" /></button>
                    </div>
                </div>
             </header>

             {/* RICH TEXT CONTENT */}
             <div className="relative">
                <div 
                  className={`prose prose-slate max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:font-medium prose-p:text-slate-600 prose-li:font-medium ${!user ? 'select-none pointer-events-none' : ''}`}
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                />

                {/* Paywall Overlay for Guest */}
                {!user && (
                   <div className="mt-8">
                      {/* Blurred Preview End */}
                      <div className="h-40 bg-gradient-to-t from-white via-white/90 to-transparent -translate-y-40 pointer-events-none" />
                      
                      <div className="relative -mt-32 p-10 bg-indigo-600 rounded-[3rem] text-white overflow-hidden shadow-2xl shadow-indigo-200 text-center animate-in zoom-in-95 duration-500">
                         {/* Marketing Decor */}
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

             {/* ADJACENT NAVIGATION */}
             <div className="mt-20 flex flex-col sm:flex-row justify-between gap-6 pt-10 border-t border-slate-100">
                {adjacents.prev ? (
                   <Link href={`/curriculum/${subjectId}/${adjacents.prev.id}`} className="group flex flex-col max-w-[280px]">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Previous Component</span>
                      <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all flex items-center gap-4">
                         <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center group-hover:bg-indigo-500 transition-all"><ChevronLeft className="w-5 h-5 text-slate-300 group-hover:text-white" /></div>
                         <span className="text-sm font-bold text-slate-900 group-hover:text-white truncate">{adjacents.prev.title}</span>
                      </div>
                   </Link>
                ) : <div />}

                {adjacents.next && (
                   <Link href={`/curriculum/${subjectId}/${adjacents.next.id}`} className="group flex flex-col items-end text-right max-w-[280px]">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">Next Component <ChevronRight className="w-3 h-3" /></span>
                      <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all flex items-center gap-4">
                         <span className="text-sm font-bold text-slate-900 group-hover:text-white truncate">{adjacents.next.title}</span>
                         <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center group-hover:bg-indigo-500 transition-all"><ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-white" /></div>
                      </div>
                   </Link>
                )}
             </div>

             {/* Linked Materials (If any) */}
             {(content?.linked_exam_id || content?.linked_sheet_id) && (
                <div className="mt-16 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10"><BookOpen className="w-32 h-32" /></div>
                   <div className="relative z-10">
                      <h4 className="text-xl font-black uppercase tracking-tight mb-6 italic">Master this Topic</h4>
                      <div className="flex flex-wrap gap-4">
                         {content.linked_exam_id && (
                           <button className="px-6 py-4 bg-indigo-600 rounded-2xl flex items-center gap-3 font-bold hover:bg-white hover:text-indigo-600 transition-all shadow-xl">
                              <FileText className="w-5 h-5" /> TAKE TOPIC EXAM
                           </button>
                         )}
                         {content.linked_sheet_id && (
                           <button className="px-6 py-4 bg-slate-800 rounded-2xl flex items-center gap-3 font-bold hover:bg-slate-700 transition-all">
                              <FileText className="w-5 h-5" /> DOWNLOAD LECTURE SHEET
                           </button>
                         )}
                      </div>
                   </div>
                </div>
             )}
          </article>

          {/* SIDEBAR NAVIGATION (Image 3) */}
          <aside className="w-full lg:w-80 shrink-0">
             <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 sticky top-28 max-h-[80vh] flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white"><BookOpen className="w-5 h-5" /></div>
                   <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase">Table of Contents</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic">Course Progression</p>
                   </div>
                </div>

                <div className="overflow-y-auto flex-1 pr-2 space-y-6 custom-scrollbar">
                   {hierarchy.map(unit => (
                      <div key={unit.id} className="space-y-3">
                         <div className="flex items-center gap-2">
                             <div className="w-1 h-4 bg-indigo-600 rounded-full" />
                             <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{unit.title}</h4>
                         </div>
                         <div className="space-y-1 pl-3 border-l border-slate-200">
                            {unit.lesson_plan_lessons?.sort((a:any, b:any) => a.order_index - b.order_index).map((l: any) => (
                               <div key={l.id} className="space-y-1">
                                  <p className="text-[10px] font-bold text-slate-400 py-1 uppercase">{l.title}</p>
                                  {l.lesson_plan_contents?.sort((a:any, b:any) => a.order_index - b.order_index).map((c: any) => (
                                     <Link 
                                       key={c.id} 
                                       href={`/curriculum/${subjectId}/${c.id}`}
                                       className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${c.id.toString() === contentId?.toString() ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50 border-emerald-50' : 'text-slate-500 hover:text-indigo-600 hover:bg-white'}`}
                                     >
                                        <div className={`w-1.5 h-1.5 rounded-full ${c.id.toString() === contentId?.toString() ? 'bg-indigo-600 scale-125' : 'bg-slate-300'}`} />
                                        <span className="truncate">{c.title}</span>
                                     </Link>
                                  ))}
                               </div>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>

                <Link href={`/curriculum/${subjectId}`} className="mt-8 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
                   <Languages className="w-4 h-4" /> SWITCH VERSION / VIEW ALL
                </Link>
             </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
