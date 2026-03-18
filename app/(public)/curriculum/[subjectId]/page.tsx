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
  Book
} from "lucide-react";
import Link from 'next/link';

export default function SubjectHierarchyPage() {
  const { subjectId } = useParams();
  const router = useRouter();
  const [subject, setSubject] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [otherSubjects, setOtherSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState<'en' | 'bn'>('bn');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUnits, setExpandedUnits] = useState<Record<number, boolean>>({});

  const fetchData = useCallback(async () => {
    if (!subjectId) return;
    setIsLoading(true);
    try {
      // 1. Fetch Subject Info
      const { data: subData } = await supabase
        .from('subjects')
        .select('*, groups(segments(title))')
        .eq('id', subjectId)
        .single();
      
      if (subData) setSubject(subData);

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

      // 3. Fetch Other Subjects in same group
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
  }, [subjectId, version]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleUnit = (id: number) => {
    setExpandedUnits(prev => ({ ...prev, [id]: !prev[id] }));
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
           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Hierarchy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pt-24 pb-12 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION (Image 2) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 border-b border-slate-800 pb-10">
           <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">
                 <Link href="/curriculum" className="hover:text-white transition-colors">Resources</Link>
                 <ChevronRight className="w-3 h-3" />
                 <span>{subject?.groups?.segments?.title || 'Segment'}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                 {subject?.title} <span className="text-indigo-500 underline decoration-indigo-500/30">Curriculum</span>
              </h1>
           </div>

           <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              {/* Version Toggle */}
              <div className="flex p-1 bg-slate-800/50 rounded-2xl border border-slate-700 w-full sm:w-auto">
                <button 
                   onClick={() => setVersion('bn')}
                   className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${version === 'bn' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                   BN
                </button>
                <button 
                   onClick={() => setVersion('en')}
                   className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${version === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                   EN
                </button>
              </div>

              <div className="flex items-center gap-4 px-6 py-3 bg-slate-800/30 rounded-2xl border border-slate-800 w-full sm:w-auto">
                 <div className="text-center border-r border-slate-700 pr-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase">Lessons</p>
                    <p className="text-sm font-black text-white">{units.length * 5}+</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase">Viewed</p>
                    <p className="text-sm font-black text-white">2.4k</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* MAIN COLUMN (Hierarchy - Image 2) */}
          <div className="flex-1 space-y-6">
             
             {/* Search Bar */}
             <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Seach topics within this subject..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-slate-800/40 border border-slate-800 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-800/60 font-medium transition-all text-white placeholder:text-slate-600 shadow-inner"
                />
             </div>

             {/* HIERARCHY TREE */}
             <div className="space-y-4">
                {isLoading ? (
                  [1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-800/20 rounded-3xl border border-slate-800 animate-pulse"></div>)
                ) : (
                  filteredUnits.map((unit) => (
                    <div key={unit.id} className="bg-slate-800/20 border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-slate-700 transition-all group">
                       <button 
                        onClick={() => toggleUnit(unit.id)}
                        className="w-full px-8 py-7 flex items-center justify-between hover:bg-slate-800/40 transition-all text-left"
                       >
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-500">
                               <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Unit {unit.order_index}</p>
                               <h3 className="text-xl font-black text-white uppercase tracking-tight">{unit.title}</h3>
                            </div>
                         </div>
                         <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center">
                            {expandedUnits[unit.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                         </div>
                       </button>

                       {expandedUnits[unit.id] && (
                         <div className="px-8 pb-8 space-y-3 animate-in fade-in slide-in-from-top-4">
                            {unit.lesson_plan_lessons?.sort((a: any, b: any) => a.order_index - b.order_index).map((lesson: any) => (
                              <div key={lesson.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all relative overflow-hidden">
                                 <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">Lesson {lesson.order_index}</span>
                                       <h4 className="text-lg font-bold text-slate-100">{lesson.title}</h4>
                                    </div>
                                 </div>
                                 
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {lesson.lesson_plan_contents?.sort((a: any, b: any) => a.order_index - b.order_index).map((content: any) => (
                                      <Link 
                                        key={content.id} 
                                        href={`/curriculum/${subjectId}/${content.id}`}
                                        className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800 hover:translate-x-1 transition-all group/it"
                                      >
                                         <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                                            {content.type === 'passage' ? <FileText className="w-4 h-4 text-blue-400" /> : (content.type === 'exercise' ? <HelpCircle className="w-4 h-4 text-orange-400" /> : <LinkIcon className="w-4 h-4 text-purple-400" />)}
                                         </div>
                                         <span className="text-xs font-bold text-slate-400 group-hover/it:text-white transition-colors truncate">{content.title}</span>
                                         <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover/it:opacity-100 transition-all" />
                                      </Link>
                                    ))}
                                 </div>
                              </div>
                            ))}
                         </div>
                       )}
                    </div>
                  ))
                )}

                {units.length === 0 && !isLoading && (
                  <div className="py-32 text-center bg-slate-800/10 rounded-[4rem] border border-dashed border-slate-800">
                     <Book className="w-20 h-20 text-slate-800 mx-auto mb-6" />
                     <h3 className="text-2xl font-black text-slate-700 uppercase italic">Planning in Progress</h3>
                     <p className="text-slate-500 mt-2 font-medium">This version of the syllabus is being updated by our team. Check back soon!</p>
                  </div>
                )}
             </div>
          </div>

          {/* SIDEBAR (Image 2) */}
          <aside className="w-full lg:w-80 space-y-8">
             {/* Relevant Books */}
             <div className="bg-slate-800/20 border border-slate-800 rounded-[2.5rem] p-8">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Book className="w-4 h-4 text-indigo-500" /> Relevant Books
                </h3>
                <div className="space-y-4">
                   {[1, 2].map(i => (
                     <div key={i} className="flex gap-4 group cursor-pointer">
                        <div className="w-16 h-20 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-indigo-500 transition-all">
                           <FileText className="w-6 h-6 text-slate-700" />
                        </div>
                        <div className="py-1">
                           <p className="text-xs font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">Class {subject?.groups?.segments?.title || ''} Main Textbook</p>
                           <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">NCTB Board Version</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             {/* Other Subjects */}
             <div className="bg-slate-800/20 border border-slate-800 rounded-[2.5rem] p-8">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Explore Others</h3>
                <div className="space-y-2">
                   {otherSubjects.map(sub => (
                     <Link 
                      key={sub.id} 
                      href={`/curriculum/${sub.id}`}
                      className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl hover:bg-indigo-600 group transition-all"
                     >
                        <span className="text-xs font-bold text-slate-400 group-hover:text-white">{sub.title}</span>
                        <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-white" />
                     </Link>
                   ))}
                </div>
             </div>

             {/* Social Links (Image 2) */}
             <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-[2.5rem] p-8 text-center">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Stay Connected</p>
                <div className="flex justify-center gap-4">
                   <a href="#" className="p-4 bg-slate-800 rounded-2xl hover:bg-blue-600 transition-all text-white"><Facebook className="w-5 h-5" /></a>
                   <a href="#" className="p-4 bg-slate-800 rounded-2xl hover:bg-red-600 transition-all text-white"><Youtube className="w-5 h-5" /></a>
                   <a href="#" className="p-4 bg-slate-800 rounded-2xl hover:bg-indigo-600 transition-all text-white"><Instagram className="w-5 h-5" /></a>
                </div>
             </div>

             {/* Contact Mini-Form (Image 2) */}
             <div className="bg-slate-800/20 border border-slate-800 rounded-[2.5rem] p-8">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Mail className="w-4 h-4 text-indigo-500" /> Need Help?
                </h3>
                <p className="text-xs text-slate-500 mb-6 font-medium">Send us a quick message for academic inquiries.</p>
                <div className="space-y-4">
                   <input className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs outline-none focus:border-indigo-500" placeholder="Your Email" />
                   <textarea className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs outline-none focus:border-indigo-500 min-h-[100px]" placeholder="Message"></textarea>
                   <button className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-lg active:scale-95">Send Query</button>
                </div>
             </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
