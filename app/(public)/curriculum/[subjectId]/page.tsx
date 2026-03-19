'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Mail,
  Users,
  Eye,
  ArrowRight,
  Book,
  X,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Layers
} from "lucide-react";
import Link from 'next/link';
import { toast } from 'sonner';

export default function SubjectHierarchyPage() {
  const { subjectId } = useParams();
  const router = useRouter();
  const [subject, setSubject] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
  const [otherSubjects, setOtherSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState<'en' | 'bn'>('bn');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUnits, setExpandedUnits] = useState<Record<number, boolean>>({});
  
  // Modals
  const [isAllBooksOpen, setIsAllBooksOpen] = useState(false);

  // Form State
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Count tracking to avoid double increment
  const [hasViewed, setHasViewed] = useState(false);

  const fetchData = useCallback(async () => {
    if (!subjectId) return;
    setIsLoading(true);
    try {
      // 1. Fetch Subject Info
      const { data: subData } = await supabase
        .from('subjects')
        .select('*, groups(title, segments(title))')
        .eq('id', subjectId)
        .single();
      
      if (subData) {
        setSubject(subData);
        // Increment view count if newly loaded
        if (!hasViewed) {
          const newCount = (subData.view_count || 0) + 1;
          // Optimistically update DB
          await supabase.from('subjects').update({ view_count: newCount }).eq('id', subjectId);
          setSubject({ ...subData, view_count: newCount });
          setHasViewed(true);
        }
      }

      // 2. Fetch Hierarchy
      const { data: unitsData } = await supabase
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
      
      setUnits(unitsData || []);

      // 3. Fetch Related Books
      const { data: booksData } = await supabase
        .from('lesson_plan_subject_books')
        .select('*')
        .eq('subject_id', subjectId)
        .order('order_index');
      setRelatedBooks(booksData || []);

      // 4. Fetch Other Subjects in same group
      if (subData?.group_id) {
        const { data: others } = await supabase
          .from('subjects')
          .select('id, title')
          .eq('group_id', subData.group_id)
          .neq('id', subjectId)
          .limit(5);
        setOtherSubjects(others || []);
      }

    } catch (error) {
      console.error("Error fetching subject details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, version, hasViewed]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleUnit = (id: number) => {
    setExpandedUnits(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('feedbacks').insert([{
         role: 'student', // Assuming general public feedback aligns with student role logic
         full_name: feedbackEmail ? `Guest (${feedbackEmail})` : 'Anonymous Curriculum User',
         category: 'Curriculum query',
         message: `[Subject: ${subject?.title} (${subject?.groups?.title})]\n${feedbackMessage}`,
         status: 'new'
      }]);

      if (error) throw error;
      toast.success("Message sent! Our admins will review it soon.");
      setFeedbackMessage('');
      setFeedbackEmail('');
    } catch (error) {
       toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUnits = units.filter(unit => {
    const unitMatches = unit.title.toLowerCase().includes(searchTerm.toLowerCase());
    const lessonMatches = unit.lesson_plan_lessons?.some((l: any) => l.title.toLowerCase().includes(searchTerm.toLowerCase()));
    return unitMatches || lessonMatches;
  });

  if (isLoading && !subject) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pt-24 pb-20 text-slate-300">

      {/* MODAL: See All Books */}
      {isAllBooksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAllBooksOpen(false)}></div>
           <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Book className="w-5 h-5 text-indigo-400" /> All Related Books
                </h3>
                <button onClick={() => setIsAllBooksOpen(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"><X className="w-4 h-4" /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {relatedBooks.map(book => (
                  <a key={book.id} href={book.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group p-4 bg-slate-800/50 rounded-2xl hover:bg-slate-800 border border-transparent hover:border-indigo-500/30 transition-all">
                     <div className="w-12 h-12 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center shrink-0 group-hover:border-indigo-500 transition-colors">
                        <BookOpen className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">{book.title}</p>
                        {book.subtitle && <p className="text-[10px] text-slate-500 mt-0.5 uppercase font-bold tracking-widest truncate">{book.subtitle}</p>}
                     </div>
                     <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" />
                  </a>
                ))}
                {relatedBooks.length === 0 && <p className="text-slate-500 text-center py-10 font-bold text-sm">No books linked yet.</p>}
             </div>
           </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 border-b border-slate-800 pb-10">
           <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">
                 <Link href="/curriculum" className="hover:text-white transition-colors">Curriculum</Link>
                 <ChevronRight className="w-3 h-3" />
                 <span>{subject?.groups?.segments?.title || 'Segment'}</span>
                 <ChevronRight className="w-3 h-3" />
                 <span>{subject?.groups?.title || 'Group'}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight md:leading-none">
                 {subject?.title}
              </h1>
           </div>

           <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              {/* Version Toggle */}
              <div className="flex p-1 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 w-full sm:w-auto shadow-inner">
                <button 
                   onClick={() => setVersion('bn')}
                   className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${version === 'bn' ? 'bg-indigo-600 text-white shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)]' : 'text-slate-400 hover:text-white'}`}
                >
                   BN
                </button>
                <button 
                   onClick={() => setVersion('en')}
                   className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${version === 'en' ? 'bg-indigo-600 text-white shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)]' : 'text-slate-400 hover:text-white'}`}
                >
                   EN
                </button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 px-6 py-3 bg-slate-800/30 rounded-xl border border-slate-700/50 w-full sm:w-auto mt-4 sm:mt-0">
                 <div className="text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1 justify-center"><Layers className="w-3 h-3"/> Lessons</p>
                    <p className="text-lg font-black text-white">{units.reduce((acc, curr) => acc + (curr.lesson_plan_lessons?.length || 0), 0)}+</p>
                 </div>
                 <div className="w-px h-8 bg-slate-700/50"></div>
                 <div className="text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1 justify-center"><Eye className="w-3 h-3"/> Viewed</p>
                    <p className="text-lg font-black text-white">{subject?.view_count || 0}</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* MAIN COLUMN (Hierarchy) */}
          <div className="flex-1 space-y-6">
             
             {/* Search Bar */}
             <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Seach topics within this subject..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-slate-800/80 font-medium transition-all text-white placeholder:text-slate-500 shadow-inner"
                />
             </div>

             {/* HIERARCHY TREE */}
             <div className="space-y-4">
                {isLoading ? (
                  [1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-800/20 rounded-2xl border border-slate-800 animate-pulse"></div>)
                ) : (
                  filteredUnits.map((unit) => (
                    <div key={unit.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600 transition-all group backdrop-blur-sm">
                       <button 
                        onClick={() => toggleUnit(unit.id)}
                        className="w-full px-6 py-6 sm:px-8 flex items-center justify-between hover:bg-slate-800/60 transition-all text-left"
                       >
                         <div className="flex items-center gap-4 sm:gap-6">
                            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 shadow-inner shrink-0">
                               <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-[10px] sm:text-xs font-black text-indigo-400 uppercase tracking-widest mb-1 shadow-indigo-900 drop-shadow-md">Unit {unit.order_index}</p>
                               <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">{unit.title}</h3>
                            </div>
                         </div>
                         <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-transform duration-300 ${expandedUnits[unit.id] ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600 text-slate-400'}`}>
                            {expandedUnits[unit.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                         </div>
                       </button>

                       {expandedUnits[unit.id] && (
                         <div className="px-6 pb-8 sm:px-8 space-y-4 animate-in fade-in slide-in-from-top-4">
                            {unit.lesson_plan_lessons?.sort((a: any, b: any) => a.order_index - b.order_index).map((lesson: any) => (
                              <div key={lesson.id} className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 sm:p-6 hover:border-indigo-500/40 transition-all relative overflow-hidden shadow-inner">
                                 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                    <div className="flex items-center gap-3">
                                       <span className="text-[10px] font-black text-slate-400 bg-slate-800 uppercase tracking-widest px-2.5 py-1 rounded-md">Lesson {lesson.order_index}</span>
                                       <h4 className="text-base sm:text-lg font-bold text-slate-100">{lesson.title}</h4>
                                    </div>
                                 </div>
                                 
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {lesson.lesson_plan_contents?.sort((a: any, b: any) => a.order_index - b.order_index).map((content: any) => (
                                      <Link 
                                        key={content.id} 
                                        href={`/curriculum/${subjectId}/${content.id}`}
                                        className="flex items-center gap-3 p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all group/it shadow-sm"
                                      >
                                         <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 shadow-inner">
                                            {content.type === 'passage' ? <FileText className="w-4 h-4 text-emerald-400" /> : (content.type === 'exercise' ? <HelpCircle className="w-4 h-4 text-orange-400" /> : <LinkIcon className="w-4 h-4 text-blue-400" />)}
                                         </div>
                                         <span className="text-xs font-bold text-slate-300 group-hover/it:text-white transition-colors truncate">{content.title}</span>
                                         <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover/it:opacity-100 transition-all text-indigo-400" />
                                      </Link>
                                    ))}
                                    {(!lesson.lesson_plan_contents || lesson.lesson_plan_contents.length === 0) && (
                                       <div className="col-span-full py-4 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">No contents yet</div>
                                    )}
                                 </div>
                              </div>
                            ))}
                            {(!unit.lesson_plan_lessons || unit.lesson_plan_lessons.length === 0) && (
                               <div className="py-6 text-center text-slate-600 text-xs font-bold uppercase tracking-widest bg-slate-900/50 rounded-2xl border border-slate-700/30">No lessons planned</div>
                            )}
                         </div>
                       )}
                    </div>
                  ))
                )}

                {units.length === 0 && !isLoading && (
                  <div className="py-32 text-center bg-slate-800/20 rounded-3xl border border-dashed border-slate-700/50 backdrop-blur-sm">
                     <Book className="w-16 h-16 text-slate-600 mx-auto mb-6 opacity-50" />
                     <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Planning in Progress</h3>
                     <p className="text-slate-400 mt-2 font-medium max-w-sm mx-auto">This version of the syllabus is currently being organized by our master teachers. Check back soon!</p>
                  </div>
                )}
             </div>
          </div>

          {/* SIDEBAR Column */}
          <aside className="w-full lg:w-[340px] space-y-6">
             {/* Relevant Books */}
             <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                     <Book className="w-4 h-4 text-indigo-400" /> Textbooks
                  </h3>
                  {relatedBooks.length > 3 && (
                    <button onClick={() => setIsAllBooksOpen(true)} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-full">See All</button>
                  )}
                </div>
                <div className="space-y-3">
                   {relatedBooks.slice(0, 3).map(book => (
                     <a key={book.id} href={book.url || '#'} target="_blank" rel="noopener noreferrer" className="flex gap-4 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-slate-800 transition-all">
                        <div className="w-14 h-16 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center shrink-0 group-hover:border-indigo-500 group-hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)] transition-all">
                           <BookOpen className="w-5 h-5 text-slate-600 group-hover:text-indigo-400" />
                        </div>
                        <div className="py-1 flex-1 min-w-0">
                           <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">{book.title}</p>
                           {book.subtitle && <p className="text-[9px] text-slate-500 mt-1 uppercase font-black tracking-widest truncate">{book.subtitle}</p>}
                        </div>
                     </a>
                   ))}
                   {relatedBooks.length === 0 && (
                      <p className="text-slate-500 text-xs font-bold text-center py-6 border border-dashed border-slate-700 rounded-xl">No specific books linked.</p>
                   )}
                </div>
             </div>

             {/* Other Subjects in Group */}
             {otherSubjects.length > 0 && (
               <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Explore Group</h3>
                  <div className="space-y-2">
                     {otherSubjects.map(sub => (
                       <Link 
                        key={sub.id} 
                        href={`/curriculum/${sub.id}`}
                        className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-indigo-600 hover:border-indigo-500 group transition-all"
                       >
                          <span className="text-xs font-bold text-slate-400 group-hover:text-white truncate pr-4">{sub.title}</span>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white shrink-0" />
                       </Link>
                     ))}
                  </div>
               </div>
             )}

             {/* Contact Mini-Form */}
             <div className="bg-slate-800/40 backdrop-blur-md border border-indigo-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2 relative z-10">
                   <MessageSquare className="w-4 h-4 text-indigo-400" /> Suggestion / Query
                </h3>
                <p className="text-xs text-slate-400 font-medium mb-6 relative z-10">Found an error or have an academic inquiry regarding {subject?.title}? Message our support.</p>
                
                <form onSubmit={handleFeedbackSubmit} className="space-y-3 relative z-10">
                   <input 
                     value={feedbackEmail}
                     onChange={(e) => setFeedbackEmail(e.target.value)}
                     className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500" 
                     placeholder="Your Contact Email (Optional)" 
                   />
                   <textarea 
                     required
                     value={feedbackMessage}
                     onChange={(e) => setFeedbackMessage(e.target.value)}
                     className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[100px] text-white placeholder-slate-500" 
                     placeholder="Describe your query or suggestion..."
                   ></textarea>
                   <button 
                     disabled={isSubmitting}
                     type="submit" 
                     className="w-full py-3.5 bg-indigo-500 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                     {isSubmitting ? 'Sending...' : 'Send Message'}
                   </button>
                </form>
             </div>

             {/* Social Links */}
             <div className="flex justify-center gap-4 pt-4">
                <a href="#" className="p-3 bg-slate-800/50 rounded-xl hover:bg-[#1877F2] hover:text-white transition-all text-slate-400 border border-slate-700"><Facebook className="w-4 h-4" /></a>
                <a href="#" className="p-3 bg-slate-800/50 rounded-xl hover:bg-[#FF0000] hover:text-white transition-all text-slate-400 border border-slate-700"><Youtube className="w-4 h-4" /></a>
                <a href="#" className="p-3 bg-slate-800/50 rounded-xl hover:bg-[#E4405F] hover:text-white transition-all text-slate-400 border border-slate-700"><Instagram className="w-4 h-4" /></a>
             </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
