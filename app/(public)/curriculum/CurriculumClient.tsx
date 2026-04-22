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
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95 shadow-indigo-600/30"
      >
        <Filter className="w-5 h-5" />
      </button>

      {/* MOBILE FILTER DRAWER */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex justify-start">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
           <div className="relative w-full max-w-[320px] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 border-r border-slate-100 dark:border-slate-800">
             <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-5 h-5 text-indigo-500" /> Subject Explorer
                </h3>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
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
      <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-4 md:mb-6">
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" /> Structured Subjects
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6 leading-tight tracking-tight">
          Master every <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Subject</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-base md:text-lg leading-relaxed mb-6 md:mb-8 max-w-2xl mx-auto transition-colors opacity-80">
          Explore our professionally curated lesson plans. Track your progress, read seamlessly on any device, and master your exams.
        </p>
        
        <div className="relative max-w-2xl mx-auto group">
          <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search subjects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 md:pl-14 pr-6 py-3 md:py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 font-medium text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-sm text-sm md:text-base"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-32 h-fit space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
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

          <div className="bg-slate-900 dark:bg-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <h4 className="font-bold text-lg mb-2 relative z-10">Strategic <br/>Blueprint</h4>
              <p className="text-slate-300 dark:text-indigo-100 text-xs font-medium mb-6 relative z-10 opacity-90">Engineered for high-performance evolution.</p>
              <Link href="/about" className="flex items-center justify-center gap-2 text-xs font-semibold bg-white text-slate-900 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all relative z-10 w-full group">
                  Research <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
              </Link>
          </div>
        </aside>

         {/* CONTENT AREA */}
        <div className="flex-1 min-w-0">
          {(selectedSegment !== 'all' || selectedGroup !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6 md:mb-8">
                 {selectedSegment !== 'all' && (
                    <button onClick={() => {setSelectedSegment('all'); setSelectedGroup('all');}} className="flex items-center gap-2 px-3 py-1.5 md:py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-500/20 transition-all group">
                        {segments.find(s => s.id.toString() === selectedSegment)?.title} <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform"/>
                    </button>
                )}
                {selectedGroup !== 'all' && (
                    <button onClick={() => setSelectedGroup('all')} className="flex items-center gap-2 px-3 py-1.5 md:py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium hover:text-slate-900 dark:hover:text-white transition-all group">
                        {groups.find(g => g.id.toString() === selectedGroup)?.title} <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform"/>
                    </button>
                )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filteredSubjects.map(sub => (
                  <Link 
                      key={sub.id} 
                      href={`/curriculum/${sub.id}`}
                      className="group relative bg-white dark:bg-slate-900 flex flex-col p-5 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-lg dark:hover:shadow-indigo-900/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                      <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-indigo-500/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-indigo-500/10 group-hover:scale-110"></div>
                      
                      <div className="relative z-10 flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all border border-slate-100 dark:border-slate-700">
                              <Book className="w-6 h-6" />
                          </div>
                           <div className="text-xs font-medium text-slate-500 transition-colors text-right">
                              {sub.groups?.segments?.title || 'General'}
                          </div>
                      </div>
                      
                      <div className="relative z-10 pt-2 flex-1 flex flex-col">
                          <p className="text-xs font-medium text-slate-500 mb-1 transition-colors group-hover:text-indigo-500">{sub.groups?.title || 'Module'}</p>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-4 leading-snug line-clamp-2">{sub.title}</h3>
                          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs group-hover:translate-x-1 transition-transform mt-auto">
                              Scan Curriculum <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                      </div>
                  </Link>
              ))}

               {filteredSubjects.length === 0 && (
                   <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors">
                      <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No results found</h3>
                      <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">Try adjusting your filters to find what you're looking for.</p>
                      <button onClick={() => {setSearchTerm(''); setSelectedSegment('all'); setSelectedGroup('all');}} className="mt-6 px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors">Reset Filters</button>
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
        <div className="p-5 space-y-6">
            <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Academic Segment</h4>
                 <div className="space-y-1">
                    <button 
                        onClick={() => { setSelectedSegment('all'); setSelectedGroup('all'); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedSegment === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        Show All
                    </button>
                    {segments.map((seg: any) => (
                        <button 
                            key={seg.id}
                            onClick={() => { setSelectedSegment(seg.id.toString()); setSelectedGroup('all'); }}
                            className={`w-full text-left flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedSegment === seg.id.toString() ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            {seg.title}
                            {selectedSegment === seg.id.toString() && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`transition-all duration-300 ${selectedSegment === 'all' ? 'opacity-50 pointer-events-none' : ''}`}>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Focus Group</h4>
                 <div className="space-y-1">
                    <button 
                        onClick={() => setSelectedGroup('all')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedGroup === 'all' ? 'bg-slate-800 dark:bg-slate-700 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        All Categories
                    </button>
                    {activeGroups.map((grp: any) => (
                        <button 
                            key={grp.id}
                            onClick={() => setSelectedGroup(grp.id.toString())}
                            className={`w-full text-left flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedGroup === grp.id.toString() ? 'bg-slate-800 dark:bg-slate-700 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            {grp.title}
                            {selectedGroup === grp.id.toString() && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
                {selectedSegment === 'all' && <p className="text-xs text-slate-500 mt-2 italic font-medium">Select a segment first</p>}
            </div>
        </div>
    );
}
