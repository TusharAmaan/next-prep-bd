'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, 
  Filter, 
  Book, 
  ChevronRight, 
  Layers,
  GraduationCap,
  Clock,
  Layout,
  X,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import Link from 'next/link';

export default function CurriculumPage() {
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // Filter states
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [segRes, grpRes, subRes] = await Promise.all([
        supabase.from('segments').select('*').order('id'),
        supabase.from('groups').select('*').order('id'),
        supabase.from('subjects').select(`
          *,
          groups (
            id,
            title,
            segment_id,
            segments (id, title)
          )
        `).order('id')
      ]);

      setSegments(segRes.data || []);
      setGroups(grpRes.data || []);
      setSubjects(subRes.data || []);
    } catch (error) {
      console.error("Error fetching curriculum data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter groups depending on the selected segment
  const activeGroups = groups.filter(g => selectedSegment === 'all' || g.segment_id?.toString() === selectedSegment);

  const filteredSubjects = subjects.filter(sub => {
    const matchesSegment = selectedSegment === 'all' || sub.groups?.segment_id?.toString() === selectedSegment;
    const matchesGroup = selectedGroup === 'all' || sub.group_id?.toString() === selectedGroup;
    const matchesSearch = sub.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSegment && matchesGroup && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20">
      
      {/* MOBILE FILTER TRIGGER (Floating) */}
      <button 
        onClick={() => setIsFilterOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce transition-all active:scale-90"
      >
        <Filter className="w-6 h-6" />
      </button>

      {/* MOBILE FILTER DRAWER */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex justify-start">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
           <div className="relative w-full max-w-[300px] bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 border-r border-slate-800">
             <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Filter className="w-4 h-4 text-indigo-400" /> Filter
                </h3>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"><X className="w-5 h-5" /></button>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO HEADER */}
        <div className="text-center max-w-3xl mx-auto pt-10 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-6">
            <BookOpen className="w-4 h-4" /> Lesson Plans
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-6 leading-none">
            Master Every <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Subject</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10 px-4">
            Explore our curated lesson plans. Track your progress, read seamlessly on any device, and master your upcoming exams.
          </p>
          
          {/* Main Search Bar (Simplified) */}
          <div className="relative max-w-2xl mx-auto group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search subjects (e.g., Physics, English...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-full outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-white placeholder-slate-500 transition-all font-bold shadow-2xl"
            />
          </div>
        </div>

        {/* MAIN GRID LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-[280px] shrink-0 sticky top-30 h-fit space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-400" /> Systematic Filter
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

            {/* Support/Info Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-900/20 group overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <h4 className="font-black uppercase tracking-tighter text-lg leading-tight mb-2 relative z-10">Tailored For <br/>Your Exams</h4>
                <p className="text-indigo-100 text-xs font-medium leading-relaxed relative z-10">Our system is designed to provide the most efficient path to mastery.</p>
                <Link href="/about" className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 backdrop-blur-md w-fit px-3 py-1.5 rounded-full transition-all relative z-10">
                    Learn More <ChevronRight className="w-3 h-3"/>
                </Link>
            </div>
          </aside>

          {/* CONTENT AREA */}
          <div className="flex-1 min-w-0">
            {/* Active Chips (Mobile only or redundant) */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                {selectedSegment !== 'all' && (
                    <button onClick={() => {setSelectedSegment('all'); setSelectedGroup('all');}} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-indigo-500/20 transition-all">
                        {segments.find(s => s.id.toString() === selectedSegment)?.title} <X className="w-3 h-3"/>
                    </button>
                )}
                {selectedGroup !== 'all' && (
                    <button onClick={() => setSelectedGroup('all')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-tight hover:text-white transition-all">
                        {groups.find(g => g.id.toString() === selectedGroup)?.title} <X className="w-3 h-3"/>
                    </button>
                )}
            </div>

            {/* SUBJECT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-slate-900/50 rounded-[2rem] border border-slate-800 animate-pulse"></div>)
                ) : (
                    filteredSubjects.map(sub => (
                        <Link 
                            key={sub.id} 
                            href={`/curriculum/${sub.id}`}
                            className="group relative bg-slate-900 flex flex-col h-64 p-8 rounded-[2rem] border border-slate-800 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-indigo-500/10 group-hover:scale-110"></div>
                            
                            <div className="relative z-10 flex items-start justify-between mb-auto">
                                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner border border-slate-700">
                                    <Book className="w-5 h-5" />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-400 transition-colors">
                                    {sub.groups?.segments?.title || 'General'}
                                </div>
                            </div>
                            
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{sub.groups?.title || 'No Group'}</p>
                                <h3 className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight font-bangla mb-4">{sub.title}</h3>
                                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Explore Topics <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))
                )}

                {!isLoading && filteredSubjects.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-800">
                        <Search className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">No subjects found</h3>
                        <p className="text-slate-500 mt-1 max-w-xs mx-auto text-sm">We couldn't find anything matching your filters or search terms.</p>
                        <button onClick={() => {setSearchTerm(''); setSelectedSegment('all'); setSelectedGroup('all');}} className="mt-6 px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all text-xs uppercase tracking-widest">Clear Everything</button>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

{/* SIDEBAR CONTENT REUSABLE COMPONENT */}
function SidebarContent({ segments, groups, selectedSegment, setSelectedSegment, selectedGroup, setSelectedGroup, activeGroups }: any) {
    return (
        <div className="p-6 space-y-10">
            {/* Segment Section */}
            <div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Segment</h4>
                <div className="space-y-1">
                    <button 
                        onClick={() => { setSelectedSegment('all'); setSelectedGroup('all'); }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedSegment === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        All Segments
                    </button>
                    {segments.map((seg: any) => (
                        <button 
                            key={seg.id}
                            onClick={() => { setSelectedSegment(seg.id.toString()); setSelectedGroup('all'); }}
                            className={`w-full text-left flex justify-between items-center px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedSegment === seg.id.toString() ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            {seg.title}
                            {selectedSegment === seg.id.toString() && <CheckCircle2 className="w-3 h-3" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Group Section */}
            <div className={`transition-all duration-500 ${selectedSegment === 'all' ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Focus Group</h4>
                <div className="space-y-1">
                    <button 
                        onClick={() => setSelectedGroup('all')}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedGroup === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        All Groups
                    </button>
                    {activeGroups.map((grp: any) => (
                        <button 
                            key={grp.id}
                            onClick={() => setSelectedGroup(grp.id.toString())}
                            className={`w-full text-left flex justify-between items-center px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedGroup === grp.id.toString() ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            {grp.title}
                            {selectedGroup === grp.id.toString() && <CheckCircle2 className="w-3 h-3 text-indigo-400" />}
                        </button>
                    ))}
                </div>
                {selectedSegment === 'all' && <p className="text-[9px] text-slate-600 mt-2 italic font-medium">Select a segment first</p>}
            </div>
        </div>
    );
}
