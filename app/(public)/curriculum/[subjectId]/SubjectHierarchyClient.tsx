'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { 
  BookOpen, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  FileText, 
  HelpCircle, 
  Link as LinkIcon,
  Facebook,
  Youtube,
  Instagram,
  Users,
  Eye,
  ArrowRight,
  Book,
  X,
  ExternalLink,
  MessageSquare,
  Layers,
  GraduationCap,
  Info,
  Share2,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import Link from 'next/link';
import { toast } from 'sonner';

interface ClientProps {
  subjectId: string;
  initialSubject: any;
  initialUnits: any[];
  initialRelatedBooks: any[];
  initialLinkedCourses: any[];
  initialOtherSubjects: any[];
}

export default function SubjectHierarchyClient({
  subjectId,
  initialSubject,
  initialUnits,
  initialRelatedBooks,
  initialLinkedCourses,
  initialOtherSubjects
}: ClientProps) {
  const [subject, setSubject] = useState<any>(initialSubject);
  const [units, setUnits] = useState<any[]>(initialUnits);
  const [relatedBooks] = useState<any[]>(initialRelatedBooks);
  const [linkedCourses] = useState<any[]>(initialLinkedCourses);
  const [otherSubjects] = useState<any[]>(initialOtherSubjects);
  
  const [version, setVersion] = useState<'en' | 'bn'>('bn');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUnits, setExpandedUnits] = useState<Record<number, boolean>>({});
  const [isAllBooksOpen, setIsAllBooksOpen] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Re-fetch units when version changes
  useEffect(() => {
    const fetchUnits = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('lesson_plan_units')
        .select(`
          *,
          lesson_plan_lessons (
            *,
            lesson_plan_contents (*)
          )
        `)
        .eq('subject_id', subjectId)
        .eq('version', version)
        .order('order_index');
      
      setUnits(data || []);
      setIsLoading(false);
    };
    
    if (version !== 'bn') {
        fetchUnits();
    } else {
        setUnits(initialUnits);
    }
  }, [version, subjectId, initialUnits]);

  const toggleUnit = (id: number) => {
    setExpandedUnits(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('feedbacks').insert([{
         role: 'student',
         full_name: feedbackEmail || 'Anonymous',
         category: 'Curriculum query',
         message: `[Subject: ${subject?.title} (${subject?.groups?.title})]\n${feedbackMessage}`,
         status: 'new'
      }]);

      if (error) throw error;
      toast.success("Feedback received! We will review it.");
      setFeedbackMessage('');
      setFeedbackEmail('');
    } catch (error) {
       toast.error("Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUnits = units.filter(unit => {
    const unitMatches = unit.title.toLowerCase().includes(searchTerm.toLowerCase());
    const lessonMatches = unit.lesson_plan_lessons?.some((l: any) => l.title.toLowerCase().includes(searchTerm.toLowerCase()));
    return unitMatches || lessonMatches;
  });

  return (
    <div className="w-full">
      {/* MODAL: See All Books */}
      {isAllBooksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAllBooksOpen(false)}></div>
           <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-8 shadow-3xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-8 shrink-0 border-b border-slate-100 dark:border-slate-800 pb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter flex items-center gap-4">
                  <Book className="w-7 h-7 text-indigo-500" /> Books & Resources
                </h3>
                <button onClick={() => setIsAllBooksOpen(false)} className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 rounded-2xl transition-colors"><X className="w-5 h-5" /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                {relatedBooks.map(book => (
                  <a key={book.id} href={book.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 group p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-indigo-500/30 transition-all shadow-sm">
                     <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:border-indigo-500 transition-colors shadow-inner">
                        <BookOpen className="w-6 h-6 text-indigo-500 group-hover:text-indigo-400 transition-colors" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate tracking-tight">{book.title}</p>
                        {book.subtitle && <p className="text-[11px] text-slate-500 mt-1 tracking-widest font-bold truncate">{book.subtitle}</p>}
                     </div>
                     <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-all shrink-0" />
                  </a>
                ))}
                {relatedBooks.length === 0 && (
                    <div className="py-20 text-center opacity-40 grayscale flex flex-col items-center gap-4">
                        <BookOpen size={48} />
                        <p className="text-xs font-bold tracking-widest text-slate-500">No assets mapped</p>
                    </div>
                )}
             </div>
           </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16 border-b border-slate-100 dark:border-slate-800 pb-16 transition-colors">
         <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide mb-4">
               <Link href="/curriculum" className="hover:text-indigo-600 transition-colors">Syllabus</Link>
               <ChevronRight className="w-3.5 h-3.5" />
               <span className="text-slate-500 dark:text-slate-400">{subject?.groups?.segments?.title || 'Segment'}</span>
               <ChevronRight className="w-3.5 h-3.5" />
               <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">{subject?.groups?.title || 'Course'}</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-bold text-slate-900 dark:text-white leading-[0.9] tracking-tighter">
               {subject?.title}
            </h1>
         </div>

         <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
            {/* Version Toggle */}
            <div className="flex p-2 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 w-full sm:w-auto shadow-xl dark:shadow-none transition-colors">
              <button 
                 onClick={() => setVersion('bn')}
                 className={`flex-1 sm:flex-none px-10 py-3.5 rounded-2xl text-xs font-bold tracking-wide transition-all ${version === 'bn' ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                 Bengali
              </button>
              <button 
                 onClick={() => setVersion('en')}
                 className={`flex-1 sm:flex-none px-10 py-3.5 rounded-2xl text-xs font-bold tracking-wide transition-all ${version === 'en' ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                 English
              </button>
            </div>

            {/* Stats */}
             <div className="flex items-center gap-8 px-10 py-4 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 w-full sm:w-auto shadow-xl dark:shadow-none transition-colors">
               <div className="text-center group">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-2 justify-center tracking-wide mb-1 group-hover:text-indigo-500 transition-colors"><Layers className="w-3.5 h-3.5"/> Lessons</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">{units.reduce((acc, curr) => acc + (curr.lesson_plan_lessons?.length || 0), 0)}</p>
               </div>
               <div className="w-px h-10 bg-slate-100 dark:bg-slate-800"></div>
               <div className="text-center group">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-2 justify-center tracking-wide mb-1 group-hover:text-indigo-500 transition-colors"><Eye className="w-3.5 h-3.5"/> Reads</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">{subject?.view_count || 0}</p>
               </div>
            </div>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        
        {/* MAIN COLUMN (Hierarchy) */}
        <div className="flex-1 space-y-10">
           
           {/* Search Bar */}
           <div className="relative group">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search for topics in the syllabus..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 px-8 py-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-indigo-600/5 dark:focus:ring-indigo-500/5 font-bold text-slate-900 dark:text-white placeholder:text-slate-400 transition-all shadow-xl dark:shadow-none"
              />
           </div>

           {/* HIERARCHY TREE */}
           <div className="space-y-6">
              {isLoading ? (
                [1,2,3,4].map(i => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 animate-pulse"></div>)
              ) : (
                filteredUnits.map((unit) => (
                  <div key={unit.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden hover:shadow-2xl dark:hover:shadow-indigo-900/10 transition-all group shadow-sm">
                     <button 
                      onClick={() => toggleUnit(unit.id)}
                      className="w-full px-8 py-8 sm:px-10 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left"
                     >
                       <div className="flex items-center gap-6 sm:gap-10">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner border ${expandedUnits[unit.id] ? 'bg-indigo-600 text-white border-indigo-500 scale-110 rotate-6' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'}`}>
                             <BookOpen className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide mb-1 group-hover:text-indigo-500 transition-colors">Unit {unit.order_index || 'X'}</p>
                             <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tighter leading-tight">{unit.title}</h3>
                          </div>
                       </div>
                       <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-500 ${expandedUnits[unit.id] ? 'bg-slate-900 dark:bg-white border-transparent text-white dark:text-slate-900 rotate-180' : 'border-slate-100 dark:border-slate-800 text-slate-300'}`}>
                          <ChevronDown className="w-6 h-6" />
                       </div>
                     </button>

                     {expandedUnits[unit.id] && (
                       <div className="px-8 pb-10 sm:px-10 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                          {unit.lesson_plan_lessons?.sort((a: any, b: any) => a.order_index - b.order_index).map((lesson: any) => {
                            const contents = lesson.lesson_plan_contents?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
                            
                            return (
                              <div key={lesson.id} className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 rounded-[2rem] p-8 hover:border-indigo-500/30 transition-all relative overflow-hidden shadow-inner group/lesson">
                                 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-100 dark:border-slate-700/50 pb-6">
                                    <div className="flex items-center gap-4">
                                       <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover/lesson:bg-indigo-600 transition-colors"><div className="w-1.5 h-1.5 bg-indigo-600 group-hover/lesson:bg-white rounded-full"></div></div>
                                       <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">{lesson.title}</h4>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest">{contents.length} Intelligence Points</span>
                                 </div>
                                 
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {contents.map((content: any) => (
                                      <Link 
                                        key={content.id} 
                                        href={`/curriculum/${subjectId}/${content.id}`}
                                        className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-500 hover:shadow-xl dark:hover:shadow-indigo-900/10 hover:-translate-y-1 transition-all group/item shadow-sm"
                                      >
                                         <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-inner group-hover/item:bg-indigo-600 transition-colors duration-500">
                                            {content.type === 'passage' ? <FileText className="w-5 h-5 text-emerald-500 group-hover/item:text-white" /> : (content.type === 'exercise' ? <HelpCircle className="w-5 h-5 text-amber-500 group-hover/item:text-white" /> : <LinkIcon className="w-5 h-5 text-indigo-500 group-hover/item:text-white" />)}
                                         </div>
                                         <div className="flex-1 min-w-0">
                                            <span className="text-[11px] font-bold text-slate-900 dark:text-white group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors tracking-tight truncate block">{content.title}</span>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest block mt-0.5">{content.type}</span>
                                         </div>
                                         <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all text-indigo-500" />
                                      </Link>
                                    ))}
                                 </div>
                              </div>
                            );
                          })}
                       </div>
                     )}
                  </div>
                ))
              )}

              {units.length === 0 && !isLoading && (
                <div className="py-32 text-center bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner group">
                   <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse border border-slate-100 dark:border-slate-700">
                        <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                   </div>
                   <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tighter mb-4">Lessons will be added soon!</h3>
                   <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-sm mx-auto leading-relaxed">We are currently updating the lessons for this subject. Please check back later.</p>
                </div>
              )}
           </div>
        </div>

        {/* SIDEBAR Column */}
        <aside className="w-full lg:w-[380px] space-y-10">
           
           {/* Relevant Books */}
           <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl dark:shadow-indigo-900/5 transition-colors">
              <div className="flex justify-between items-center mb-8 border-b border-slate-50 dark:border-slate-800 pb-6">
                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-widest">
                   <Book className="w-5 h-5 text-indigo-500" /> Reference Assets
                </h3>
                {relatedBooks.length > 3 && (
                  <button onClick={() => setIsAllBooksOpen(true)} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl">View Index</button>
                )}
              </div>
              <div className="space-y-4">
                 {relatedBooks.slice(0, 3).map(book => (
                   <a key={book.id} href={book.url || '#'} target="_blank" rel="noopener noreferrer" className="flex gap-5 group cursor-pointer p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 hover:border-indigo-500 hover:shadow-xl dark:hover:shadow-indigo-900/10 transition-all font-bangla">
                      <div className="w-16 h-20 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:border-indigo-500 group-hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)] transition-all overflow-hidden shadow-inner">
                         <BookOpen className="w-7 h-7 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors duration-500" />
                      </div>
                      <div className="py-2 flex-1 min-w-0">
                         <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate tracking-tight">{book.title}</p>
                         {book.subtitle && <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 font-bold tracking-wide truncate">{book.subtitle}</p>}
                      </div>
                   </a>
                 ))}
                 {relatedBooks.length === 0 && (
                    <div className="py-12 text-center opacity-40 grayscale flex flex-col items-center gap-4">
                        <BookOpen size={40} className="text-slate-400" />
                        <p className="text-[10px] font-bold tracking-widest text-slate-500">No assets mapped</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Sidebar Course Feature */}
           {linkedCourses.length > 0 && (
             <div className="bg-slate-900 dark:bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-3xl relative overflow-hidden group transition-all hover:-translate-y-2">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10">
                   <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-[1.2rem] flex items-center justify-center text-white mb-6 shadow-2xl">
                      <GraduationCap className="w-7 h-7" />
                   </div>
                   <h3 className="text-2xl font-bold text-white leading-tight mb-4 tracking-tighter">Advance Your Mastery: <br/><span className="text-indigo-400 dark:text-indigo-200">{linkedCourses[0].title}</span></h3>
                   <p className="text-slate-400 dark:text-indigo-100 text-xs font-bold tracking-wide mb-10 leading-relaxed opacity-80">Gain mastery in {subject?.title} with our world-class guided curriculum.</p>
                   <Link 
                      href={`/courses/${linkedCourses[0].slug}`}
                      className="w-full inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-5 rounded-2xl text-xs font-bold tracking-wide hover:bg-slate-50 transition-all active:scale-95 shadow-2xl group"
                   >
                      Enroll Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </Link>
                </div>
             </div>
           )}

           {/* Other Subjects in Group */}
           {otherSubjects.length > 0 && (
             <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl dark:shadow-indigo-900/5 transition-colors">
                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white mb-8 border-b border-slate-50 dark:border-slate-800 pb-6 tracking-widest flex items-center gap-3">
                   <Layers className="w-5 h-5 text-indigo-500" /> Lateral Modules
                </h3>
                <div className="space-y-3">
                   {otherSubjects.map(sub => (
                     <Link 
                      key={sub.id} 
                      href={`/curriculum/${sub.id}`}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white group transition-all font-bangla shadow-sm"
                     >
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-white truncate pr-4 transition-colors tracking-tight">{sub.title}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white shrink-0 group-hover:translate-x-1 transition-all" />
                     </Link>
                   ))}
                </div>
             </div>
           )}

           {/* Community Promo */}
           <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl dark:shadow-indigo-900/5 transition-colors group">
              <h3 className="text-[11px] font-bold text-slate-900 dark:text-white mb-8 border-b border-slate-50 dark:border-slate-800 pb-6 tracking-widest flex items-center gap-3">
                 <Share2 className="w-5 h-5 text-indigo-500" /> Public Discourse
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <a href="#" className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:bg-indigo-600 hover:text-white transition-all duration-500 shadow-sm group/fb">
                    <Facebook className="w-6 h-6 mb-3 text-indigo-600 group-hover/fb:text-white transition-transform group-hover/fb:scale-125" />
                    <span className="text-[9px] font-bold tracking-widest">Connect</span>
                 </a>
                 <a href="#" className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:bg-red-600 hover:text-white transition-all duration-500 shadow-sm group/yt">
                    <Youtube className="w-6 h-6 mb-3 text-red-600 group-hover/yt:text-white transition-transform group-hover/yt:scale-125" />
                    <span className="text-[9px] font-bold tracking-widest">Watch</span>
                 </a>
              </div>
           </div>

           {/* Contact Mini-Form */}
           <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
              <h3 className="text-[12px] font-bold text-white mb-4 flex items-center gap-3 relative z-10 tracking-widest">
                 <MessageSquare className="w-5 h-5 text-indigo-400" /> Intelligence Query
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mb-8 relative z-10 leading-relaxed opacity-80 tracking-widest">Contribute to the ecosystem. Encountered an anomaly in {subject?.title} syllabus?</p>
              
              <form onSubmit={handleFeedbackSubmit} className="space-y-3 relative z-10">
                 <input 
                   value={feedbackEmail}
                   onChange={(e) => setFeedbackEmail(e.target.value)}
                   className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-xs outline-none focus:border-indigo-500 transition-all text-white placeholder:text-slate-500 font-bold tracking-widest" 
                   placeholder="Identity / Student ID" 
                 />
                 <textarea 
                   required
                   value={feedbackMessage}
                   onChange={(e) => setFeedbackMessage(e.target.value)}
                   className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-xs outline-none focus:border-indigo-500 transition-all min-h-[120px] text-white placeholder:text-slate-500 font-bold tracking-widest resize-none" 
                   placeholder="Intelligence Report..."
                 ></textarea>
                 <button 
                   disabled={isSubmitting}
                   type="submit" 
                   className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-[11px] tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
                 >
                   {isSubmitting ? 'Relaying...' : <><span className="group-hover:translate-x-1 transition-transform">Relay Payload</span> <ArrowRight className="w-4 h-4" /></>}
                 </button>
              </form>
           </div>
        </aside>

      </div>
    </div>
  );
}
