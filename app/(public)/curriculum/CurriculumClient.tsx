'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Book, 
  ChevronRight, 
  Layers,
  X,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Library,
  GraduationCap,
  Facebook,
  Youtube
} from "lucide-react";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface CurriculumClientProps {
  initialSegments: any[];
  initialGroups: any[];
  initialSubjects: any[];
}

export default function CurriculumClient({ 
  initialSegments, 
  initialGroups, 
  initialSubjects 
}: CurriculumClientProps) {
  const [segments] = useState<any[]>(initialSegments);
  const [groups] = useState<any[]>(initialGroups);
  const [subjects] = useState<any[]>(initialSubjects);
  
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeGroups = groups.filter(g => selectedSegment === 'all' || g.segment_id?.toString() === selectedSegment);

  const filteredSubjects = subjects.filter(sub => {
    const matchesSegment = selectedSegment === 'all' || sub.groups?.segment_id?.toString() === selectedSegment;
    const matchesGroup = selectedGroup === 'all' || sub.group_id?.toString() === selectedGroup;
    const matchesSearch = sub.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSegment && matchesGroup && matchesSearch;
  });

  return (
    <div className="w-full flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-500 min-h-screen">
      
      {/* 100% WIDTH HERO HEADER */}
      <div className="w-full bg-slate-950 pt-24 pb-8 md:pt-40 md:pb-32 px-4 md:px-6 relative overflow-hidden flex-shrink-0">
         {/* Premium Abstract Background Patterns */}
         <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
         <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-30 mix-blend-screen pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-cyan-500 rounded-full blur-[120px] opacity-20 mix-blend-screen pointer-events-none"></div>

         <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, ease: "easeOut" }}
               className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-[10px] md:text-xs font-bold tracking-wide mb-4 md:mb-6 backdrop-blur-md"
            >
              <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" /> Comprehensive Curriculum
            </motion.div>
            
            <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
               className="text-3xl md:text-6xl lg:text-7xl font-extrabold text-white mb-3 md:mb-6 leading-tight tracking-tight"
            >
              Master Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Subject</span>
            </motion.h1>
            
            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
               className="text-slate-400 text-sm md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-6 md:mb-10 px-2"
            >
              Explore professionally curated lesson plans. Track your progress, read seamlessly on any device, and ace your exams.
            </motion.p>
            
            {/* Search Bar */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
               className="relative w-full max-w-2xl mx-auto group mb-6 md:mb-0"
            >
              <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 w-4 h-4 md:w-5 md:h-5 transition-colors" />
              <input 
                type="text" 
                placeholder="Search for Physics, Math, English..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 md:pl-14 pr-4 md:pr-6 py-3 md:py-5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 font-medium text-white placeholder-slate-400 transition-all shadow-2xl text-sm md:text-base"
              />
            </motion.div>

            {/* Mobile Quick Filters (Segments and Groups) */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
               className="w-full lg:hidden flex flex-col gap-2 mt-2"
            >
               {/* Segments */}
               <div className="w-full overflow-x-auto flex gap-2 snap-x [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                   <button onClick={() => { setSelectedSegment('all'); setSelectedGroup('all'); }} className={`shrink-0 snap-start px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedSegment === 'all' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}>All Stages</button>
                   {segments.map((seg: any) => (
                       <button key={seg.id} onClick={() => { setSelectedSegment(seg.id.toString()); setSelectedGroup('all'); }} className={`shrink-0 snap-start px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedSegment === seg.id.toString() ? 'bg-indigo-500 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}>
                           {seg.title}
                       </button>
                   ))}
               </div>
               
               {/* Groups */}
               <div className={`w-full overflow-x-auto flex gap-2 snap-x [&::-webkit-scrollbar]:hidden transition-all duration-300 ${selectedSegment === 'all' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                   <button onClick={() => setSelectedGroup('all')} className={`shrink-0 snap-start px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedGroup === 'all' ? 'bg-cyan-500 text-slate-900 shadow-md' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}>All Groups</button>
                   {activeGroups.map((grp: any) => (
                       <button key={grp.id} onClick={() => setSelectedGroup(grp.id.toString())} className={`shrink-0 snap-start px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedGroup === grp.id.toString() ? 'bg-cyan-500 text-slate-900 shadow-md' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}>
                           {grp.title}
                       </button>
                   ))}
               </div>
            </motion.div>
         </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-6 lg:px-12 py-12 md:py-16 flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-20 -mt-8">
        
        {/* MOBILE FILTER TRIGGER */}
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center transition-all active:scale-95 border border-indigo-500"
        >
          <Filter className="w-5 h-5" />
        </button>

        {/* MOBILE FILTER DRAWER */}
        <AnimatePresence>
          {isFilterOpen && (
            <div className="fixed inset-0 z-[100] lg:hidden flex justify-start">
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}
               ></motion.div>
               <motion.div 
                  initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="relative w-full max-w-[320px] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-r border-slate-100 dark:border-slate-800"
               >
                 <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Filter className="w-5 h-5 text-indigo-500" /> Subject Explorer
                    </h3>
                    <button onClick={() => setIsFilterOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                 </div>
                 <div className="overflow-y-auto flex-1">
                   <SidebarContent 
                      segments={segments} 
                      groups={groups} 
                      selectedSegment={selectedSegment} 
                      setSelectedSegment={setSelectedSegment}
                      selectedGroup={selectedGroup}
                      setSelectedGroup={setSelectedGroup}
                      activeGroups={activeGroups}
                   />
                 </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0 h-fit space-y-6 lg:sticky lg:top-28">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden transition-colors">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                      <Layers className="w-4 h-4 text-indigo-500" /> Syllabus Filters
                  </h3>
              </div>
              <SidebarContent 
                  segments={segments} 
                  groups={groups} 
                  selectedSegment={selectedSegment} 
                  setSelectedSegment={setSelectedSegment}
                  selectedGroup={selectedGroup}
                  setSelectedGroup={setSelectedGroup}
                  activeGroups={activeGroups}
              />
          </div>

          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
              <h4 className="font-bold text-xl mb-3 relative z-10 leading-tight">Need a study plan?</h4>
              <p className="text-indigo-100 text-sm font-medium mb-8 relative z-10 opacity-90 leading-relaxed">
                  Generate a structured breakdown of topics and ace your preparation.
              </p>
              <Link href="/curriculum" className="flex items-center justify-center gap-2 text-sm font-bold bg-white text-indigo-600 px-5 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all relative z-10 w-full group-hover:-translate-y-0.5 active:scale-95">
                  Generate Plan <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
              </Link>
          </div>

          {/* JOIN COMMUNITY BLOCK */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none p-6 text-center mt-6">
             <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-sm tracking-wide">Join Our Community</h4>
             <div className="flex justify-center gap-3">
                <a href="https://www.facebook.com/profile.php?id=61584943876571" target="_blank" className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white transition-all shadow-sm">
                   <Facebook className="w-4 h-4" />
                </a>
                <a href="https://www.youtube.com/channel/UCH5mIuxfWQEzXB1IiJqPigA" target="_blank" className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white transition-all shadow-sm">
                   <Youtube className="w-4 h-4" />
                </a>
             </div>
          </div>
        </aside>

        {/* CONTENT AREA (SUBJECT GRID) */}
        <div className="flex-1 min-w-0 pb-16">
          {(selectedSegment !== 'all' || selectedGroup !== 'all' || searchTerm) && (
            <div className="flex flex-wrap items-center gap-3 mb-8 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                 <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 mr-2 flex items-center gap-2">
                   <Filter className="w-4 h-4"/> Active Filters:
                 </span>
                 {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group">
                        Search: "{searchTerm}" <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform text-slate-400"/>
                    </button>
                 )}
                 {selectedSegment !== 'all' && (
                    <button onClick={() => {setSelectedSegment('all'); setSelectedGroup('all');}} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all group">
                        {segments.find(s => s.id.toString() === selectedSegment)?.title} <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform text-indigo-500"/>
                    </button>
                )}
                {selectedGroup !== 'all' && (
                    <button onClick={() => setSelectedGroup('all')} className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all group">
                        {groups.find(g => g.id.toString() === selectedGroup)?.title} <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform text-purple-500"/>
                    </button>
                )}
                <button onClick={() => {setSearchTerm(''); setSelectedSegment('all'); setSelectedGroup('all');}} className="ml-auto text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline underline-offset-4">
                  Clear All
                </button>
            </div>
          )}

          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
              {filteredSubjects.map((sub, sIdx) => {
                  // Generate an abstract geometry background based on subject ID for premium feel
                  const hue = (parseInt(sub.id) * 37) % 360;
                  
                  return (
                    <Link 
                        key={sub.id} 
                        href={`/curriculum/${sub.id}`}
                        className="group relative bg-white dark:bg-slate-900 flex flex-col items-center md:items-stretch p-3 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                        {/* Decorative Top Banner */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
                        
                        <div className="flex items-start justify-between w-full mb-2 md:mb-8">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group-hover:border-indigo-200 dark:group-hover:border-indigo-800 transition-colors mx-auto md:mx-0">
                                {/* Dynamic subtle glow */}
                                <div className="absolute inset-0 opacity-20 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, hsl(${hue}, 80%, 70%), hsl(${(hue + 40) % 360}, 80%, 60%))` }}></div>
                                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-slate-700 dark:text-slate-300 group-hover:text-white relative z-10 transition-colors" />
                            </div>
                            
                            <div className="hidden md:flex flex-col items-end gap-1.5">
                                <span 
                                    className="inline-flex px-3 py-1 rounded-lg text-xs font-bold capitalize shadow-sm border"
                                    style={{ 
                                        backgroundColor: `hsl(${hue}, 85%, 96%)`, 
                                        color: `hsl(${hue}, 85%, 35%)`,
                                        borderColor: `hsl(${hue}, 85%, 90%)`
                                    }}
                                >
                                    {sub.groups?.title || 'Subject'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 capitalize tracking-wide">
                                    {sub.groups?.segments?.title || 'General'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="min-w-0 flex-1 mb-0 md:mb-6 text-center md:text-left w-full">
                            <h3 className="text-xs md:text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate md:line-clamp-2 md:leading-tight tracking-tight mb-0 md:mb-2">
                                {sub.title}
                            </h3>
                            <p className="hidden md:block text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                Dive deep into {sub.title}. Access highly structured lesson plans, resources, and question banks.
                            </p>
                        </div>

                        <div className="hidden md:flex mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 items-center justify-between w-full">
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    <Library className="w-4 h-4 text-slate-400" />
                                    <span>Lessons</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                                <div className="flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4 text-slate-400" />
                                    <span>Prep</span>
                                </div>
                            </div>
                            
                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                            </div>
                        </div>
                    </Link>
                  )
              })}

               {filteredSubjects.length === 0 && (
                   <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl mx-auto flex items-center justify-center mb-6">
                         <Search className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">No subjects found</h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto text-base font-medium leading-relaxed">
                        We couldn't find anything matching your filters. Try adjusting them or searching for something else.
                      </p>
                      <button 
                        onClick={() => {setSearchTerm(''); setSelectedSegment('all'); setSelectedGroup('all');}} 
                        className="mt-8 px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md hover:shadow-lg active:scale-95"
                      >
                        Reset All Filters
                      </button>
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ segments, groups, selectedSegment, setSelectedSegment, selectedGroup, setSelectedGroup, activeGroups }: any) {
    return (
        <div className="p-6 space-y-8 bg-white dark:bg-slate-900">
            <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Educational Stage</h4>
                 <div className="space-y-1.5">
                    <button 
                        onClick={() => { setSelectedSegment('all'); setSelectedGroup('all'); }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex justify-between items-center ${selectedSegment === 'all' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        Show All
                        {selectedSegment === 'all' && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    {segments.map((seg: any) => (
                        <button 
                            key={seg.id}
                            onClick={() => { setSelectedSegment(seg.id.toString()); setSelectedGroup('all'); }}
                            className={`w-full text-left flex justify-between items-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedSegment === seg.id.toString() ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            {seg.title}
                            {selectedSegment === seg.id.toString() && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`transition-all duration-300 ${selectedSegment === 'all' ? 'opacity-50 pointer-events-none' : ''}`}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Subject Group</h4>
                 <div className="space-y-1.5 relative">
                    {/* Vertical guideline for sub-categories */}
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800 -z-10"></div>

                    <button 
                        onClick={() => setSelectedGroup('all')}
                        className={`w-full text-left pl-10 pr-4 py-2.5 rounded-xl text-sm font-bold transition-all flex justify-between items-center ${selectedGroup === 'all' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                        <span className="relative">
                          <span className={`absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-white dark:border-slate-900 ${selectedGroup === 'all' ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                          All Groups
                        </span>
                        {selectedGroup === 'all' && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    {activeGroups.map((grp: any) => (
                        <button 
                            key={grp.id}
                            onClick={() => setSelectedGroup(grp.id.toString())}
                            className={`w-full text-left pl-10 pr-4 py-2.5 rounded-xl text-sm font-bold transition-all flex justify-between items-center ${selectedGroup === grp.id.toString() ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                            <span className="relative">
                              <span className={`absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-white dark:border-slate-900 ${selectedGroup === grp.id.toString() ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                              {grp.title}
                            </span>
                            {selectedGroup === grp.id.toString() && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
                {selectedSegment === 'all' && <p className="text-xs text-slate-400 mt-4 italic font-semibold px-2">Select a stage first to see groups.</p>}
            </div>
        </div>
    );
}
