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
    <div className="min-h-screen bg-slate-900 pt-24 pb-20">
      
      {/* Dynamic Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
           <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Filter className="w-5 h-5 text-indigo-600" /> Filter Library
                </h3>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 bg-white rounded-xl shadow-sm"><X className="w-5 h-5" /></button>
             </div>
             
             <div className="p-6 overflow-y-auto flex-1 space-y-8">
               
               {/* Segment Selection */}
               <div className="space-y-3">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">1. Select Segment</h4>
                 <div className="flex flex-col gap-2">
                   <button 
                      onClick={() => { setSelectedSegment('all'); setSelectedGroup('all'); }}
                      className={`text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all border ${selectedSegment === 'all' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                   >
                      All Segments
                   </button>
                   {segments.map(seg => (
                     <button 
                        key={seg.id}
                        onClick={() => { setSelectedSegment(seg.id.toString()); setSelectedGroup('all'); }}
                        className={`text-left flex justify-between items-center px-5 py-3.5 rounded-2xl text-sm font-bold transition-all border ${selectedSegment === seg.id.toString() ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                     >
                        {seg.title}
                        {selectedSegment === seg.id.toString() && <CheckCircle2 className="w-4 h-4 text-white" />}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Group Selection */}
               {selectedSegment !== 'all' && activeGroups.length > 0 && (
                 <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">2. Select Group</h4>
                   <div className="flex flex-col gap-2">
                     <button 
                        onClick={() => setSelectedGroup('all')}
                        className={`text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all border ${selectedGroup === 'all' ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                     >
                        All Groups
                     </button>
                     {activeGroups.map(grp => (
                       <button 
                          key={grp.id}
                          onClick={() => setSelectedGroup(grp.id.toString())}
                          className={`text-left flex justify-between items-center px-5 py-3.5 rounded-2xl text-sm font-bold transition-all border ${selectedGroup === grp.id.toString() ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                       >
                          {grp.title}
                          {selectedGroup === grp.id.toString() && <CheckCircle2 className="w-4 h-4 text-white" />}
                       </button>
                     ))}
                   </div>
                 </div>
               )}
             </div>
             
             <div className="p-6 border-t border-slate-100 bg-slate-50">
               <button 
                 onClick={() => setIsFilterOpen(false)}
                 className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
               >
                 Apply Filters & View
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs uppercase tracking-widest mb-6">
            <BookOpen className="w-4 h-4" /> Lesson Plans
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-6 leading-none">
            Master Every <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Subject</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10 px-4">
            Explore our curated lesson plans. Track your progress, read seamlessly on any device, and master your upcoming exams.
          </p>
          
          {/* Main Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
             <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search subjects (e.g., Physics, English...)" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-full outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-white placeholder-slate-500 transition-all font-bold shadow-2xl"
                />
             </div>
             <button 
                onClick={() => setIsFilterOpen(true)}
                className="px-8 py-5 bg-white text-slate-900 rounded-full font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:-translate-y-1"
             >
                <Filter className="w-5 h-5" /> Filter
                {selectedSegment !== 'all' && <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>}
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Active Filters Display */}
        {(selectedSegment !== 'all' || selectedGroup !== 'all') && (
          <div className="flex flex-wrap items-center gap-3 mb-8 justify-center">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Filters:</span>
            {selectedSegment !== 'all' && (
              <div className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-4 py-1.5 rounded-full text-xs font-bold">
                Segment: {segments.find(s => s.id.toString() === selectedSegment)?.title || 'Unknown'}
                <button onClick={() => { setSelectedSegment('all'); setSelectedGroup('all'); }} className="hover:text-white"><X className="w-3 h-3"/></button>
              </div>
            )}
            {selectedGroup !== 'all' && (
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 px-4 py-1.5 rounded-full text-xs font-bold">
                Group: {groups.find(g => g.id.toString() === selectedGroup)?.title || 'Unknown'}
                <button onClick={() => setSelectedGroup('all')} className="hover:text-white"><X className="w-3 h-3"/></button>
              </div>
            )}
          </div>
        )}

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {isLoading ? (
             [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 bg-slate-800/50 rounded-3xl animate-pulse border border-slate-700/50"></div>)
           ) : (
             filteredSubjects.map(sub => (
               <Link 
                key={sub.id} 
                href={`/curriculum/${sub.id}`}
                className="group relative bg-slate-800/40 backdrop-blur-sm p-6 rounded-3xl border border-slate-700/50 shadow-lg hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)] hover:border-indigo-500/50 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden"
               >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110 group-hover:bg-indigo-500/20"></div>
                 
                 <div className="relative z-10 flex items-start justify-between mb-8">
                   <div className="w-14 h-14 bg-slate-700/50 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-inner border border-slate-600/50">
                      <Book className="w-6 h-6" />
                   </div>
                   <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-300 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                      {sub.groups?.segments?.title || 'General'}
                   </div>
                 </div>
                 
                 <div className="relative z-10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{sub.groups?.title || 'No Group'}</p>
                    <h3 className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight leading-none mb-4">{sub.title}</h3>
                    
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
                      Explore Topics <ChevronRight className="w-4 h-4" />
                    </div>
                 </div>
               </Link>
             ))
           )}

           {!isLoading && filteredSubjects.length === 0 && (
             <div className="col-span-full py-24 text-center bg-slate-800/20 rounded-[3rem] border border-dashed border-slate-700/50">
                <Search className="w-16 h-16 text-slate-600 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">No subjects found</h3>
                <p className="text-slate-400 mt-2 font-medium">Try adjusting your search or filter criteria.</p>
                <button onClick={() => {setSearchTerm(''); setSelectedSegment('all'); setSelectedGroup('all');}} className="mt-6 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">Clear Filters</button>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
