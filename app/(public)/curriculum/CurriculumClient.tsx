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
  Sparkles
} from "lucide-react";
import Link from 'next/link';

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
    <div className="w-full">
      {/* MOBILE FILTER TRIGGER */}
      <button 
        onClick={() => setIsFilterOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center animate-bounce transition-all active:scale-95 shadow-indigo-600/30"
      >
        <Filter className="w-5 h-5" />
      </button>

      {/* MOBILE FILTER DRAWER */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex justify-start">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
           <div className="relative w-full max-w-[320px] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 border-r border-slate-100 dark:border-slate-800">
             <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                  <Filter className="w-5 h-5 text-indigo-500" /> Intelligence
                </h3>
                <button onClick={() => setIsFilterOpen(false)} className="p-2.5 md:p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 rounded-xl md:rounded-2xl transition-colors"><X className="w-5 h-5" /></button>
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
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest mb-6 md:mb-8">
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" /> Comprehensive Mapping
        </div>
        <h1 className="text-4xl md:text-8xl font-black text-slate-900 dark:text-white mb-6 md:mb-8 leading-[1] md:leading-[0.9] uppercase tracking-tighter">
          Master every <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Subject</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-base md:text-xl leading-relaxed mb-8 md:mb-12 max-w-2xl mx-auto transition-colors opacity-80">
          Explore our professionally curated lesson plans. Track your progress, read seamlessly on any device, and master your exams.
        </p>
        
        <div className="relative max-w-2xl mx-auto group">
          <Search className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 md:w-6 md:h-6 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search subjects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-4 md:py-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-[2.5rem] outline-none focus:ring-4 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/10 font-black text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-xl md:shadow-2xl shadow-indigo-100/20 dark:shadow-none text-sm md:text-base"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-32 h-fit space-y-10">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl dark:shadow-indigo-900/5 transition-colors">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
                      <Layers className="w-4 h-4 text-indigo-500" /> Filters
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

          <div className="bg-slate-900 dark:bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <h4 className="font-black uppercase tracking-tight text-xl leading-tight mb-4 relative z-10">Strategic <br/>Blueprint</h4>
              <p className="text-slate-400 dark:text-indigo-100 text-xs font-bold leading-relaxed mb-8 relative z-10 font-black uppercase tracking-widest opacity-60">Engineered for high-performance evolution.</p>
              <Link href="/about" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-white text-slate-900 px-8 py-4 rounded-2xl hover:bg-slate-50 transition-all relative z-10 w-full group">
                  Research <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
              </Link>
          </div>
        </aside>

         {/* CONTENT AREA */}
        <div className="flex-1 min-w-0">
          {(selectedSegment !== 'all' || selectedGroup !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-8 md:mb-10">
                {selectedSegment !== 'all' && (
                    <button onClick={() => {setSelectedSegment('all'); setSelectedGroup('all');}} className="flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 md:py-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all group">
                        {segments.find(s => s.id.toString() === selectedSegment)?.title} <X className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:rotate-90 transition-transform"/>
                    </button>
                )}
                {selectedGroup !== 'all' && (
                    <button onClick={() => setSelectedGroup('all')} className="flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 md:py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all group">
                        {groups.find(g => g.id.toString() === selectedGroup)?.title} <X className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:rotate-90 transition-transform"/>
                    </button>
                )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {filteredSubjects.map(sub => (
                  <Link 
                      key={sub.id} 
                      href={`/curriculum/${sub.id}`}
                      className="group relative bg-white dark:bg-slate-900 flex flex-col h-64 md:h-72 p-6 md:p-10 rounded-[1.5rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-2xl dark:hover:shadow-indigo-900/10 hover:-translate-y-2 md:hover:-translate-y-3 transition-all duration-500 overflow-hidden"
                  >
                      <div className="absolute top-0 right-0 w-32 md:w-40 h-32 md:h-40 bg-indigo-500/5 rounded-bl-full -mr-8 md:-mr-12 -mt-8 md:-mt-12 transition-all group-hover:bg-indigo-500/10 group-hover:scale-110"></div>
                      
                      <div className="relative z-10 flex items-start justify-between mb-auto">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 dark:bg-slate-800 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner border border-slate-100 dark:border-slate-700">
                              <Book className="w-5 h-5 md:w-7 md:h-7" />
                          </div>
                           <div className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors mb-2 text-right">
                              {sub.groups?.segments?.title || 'General'}
                          </div>
                      </div>
                      
                      <div className="relative z-10 pt-4 md:pt-6">
                          <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 transition-colors group-hover:text-indigo-400">{sub.groups?.title || 'Module'}</p>
                          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight mb-6 md:mb-8 uppercase leading-tight line-clamp-2">{sub.title}</h3>
                          <div className="flex items-center gap-3 md:gap-4 text-indigo-600 dark:text-indigo-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] group-hover:translate-x-2 md:group-hover:translate-x-3 transition-transform">
                              Scan Curriculum <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </div>
                      </div>
                  </Link>
              ))}

               {filteredSubjects.length === 0 && (
                  <div className="col-span-full py-20 md:py-32 text-center bg-white dark:bg-slate-900/50 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner transition-colors">
                      <Search className="w-16 md:w-20 h-16 md:h-20 text-slate-200 dark:text-slate-800 mx-auto mb-6 md:mb-8 animate-pulse" />
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">No modules detected</h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-3 md:mt-4 max-w-sm mx-auto text-sm font-medium">Reconfigure your intelligence filters to explore the ecosystem.</p>
                      <button onClick={() => {setSearchTerm(''); setSelectedSegment('all'); setSelectedGroup('all');}} className="mt-8 md:mt-12 px-10 md:px-12 py-4 md:py-5 bg-slate-900 dark:bg-indigo-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl md:rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-600/20">Reset Core Hub</button>
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
        <div className="p-6 md:p-8 space-y-8 md:space-y-12">
            <div>
                <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 md:mb-6 tracking-[0.2em] uppercase">Academic Segment</h4>
                <div className="space-y-2">
                    <button 
                        onClick={() => { setSelectedSegment('all'); setSelectedGroup('all'); }}
                        className={`w-full text-left px-4 md:px-5 py-3 md:py-4 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${selectedSegment === 'all' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        Index All
                    </button>
                    {segments.map((seg: any) => (
                        <button 
                            key={seg.id}
                            onClick={() => { setSelectedSegment(seg.id.toString()); setSelectedGroup('all'); }}
                            className={`w-full text-left flex justify-between items-center px-4 md:px-5 py-3 md:py-4 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${selectedSegment === seg.id.toString() ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            {seg.title}
                            {selectedSegment === seg.id.toString() && <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`transition-all duration-700 ${selectedSegment === 'all' ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-6 tracking-[0.2em] uppercase">Focus Group</h4>
                <div className="space-y-2">
                    <button 
                        onClick={() => setSelectedGroup('all')}
                        className={`w-full text-left px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedGroup === 'all' ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xl shadow-slate-900/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        All Portfolios
                    </button>
                    {activeGroups.map((grp: any) => (
                        <button 
                            key={grp.id}
                            onClick={() => setSelectedGroup(grp.id.toString())}
                            className={`w-full text-left flex justify-between items-center px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedGroup === grp.id.toString() ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xl shadow-slate-900/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            {grp.title}
                            {selectedGroup === grp.id.toString() && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                        </button>
                    ))}
                </div>
                {selectedSegment === 'all' && <p className="text-[9px] text-slate-400 mt-4 italic font-black uppercase tracking-widest">Select segment to unlock</p>}
            </div>
        </div>
    );
}
