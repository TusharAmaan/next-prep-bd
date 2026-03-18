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
  Layout
} from "lucide-react";
import Link from 'next/link';

export default function CurriculumPage() {
  const [segments, setSegments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [segRes, subRes] = await Promise.all([
        supabase.from('segments').select('*').order('title'),
        supabase.from('subjects').select(`
          *,
          groups (
            id,
            title,
            segment_id,
            segments (id, title)
          )
        `).order('title')
      ]);

      setSegments(segRes.data || []);
      setSubjects(subRes.data || []);
    } catch (error) {
      console.error("Error fetching curriculum data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(sub => {
    const matchesSegment = selectedSegment === 'all' || sub.groups?.segment_id?.toString() === selectedSegment;
    const matchesSearch = sub.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSegment && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4 italic">
            Comprehensive <span className="text-indigo-600">Curriculum</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl">
            Explore our meticulously designed lesson plans, categorized by exam type and subject. 
            Everything you need for your academic journey in one place.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR: Segments (Image 1) */}
          <aside className="w-full lg:w-64 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-28">
               <div className="flex items-center gap-2 mb-6">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-slate-900 uppercase tracking-tight">Select Exam</h3>
               </div>
               
               <div className="space-y-1">
                  <button 
                    onClick={() => setSelectedSegment('all')}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${selectedSegment === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
                  >
                    All Segments
                  </button>
                  {segments.map(seg => (
                    <button 
                      key={seg.id}
                      onClick={() => setSelectedSegment(seg.id.toString())}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${selectedSegment === seg.id.toString() ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
                    >
                      {seg.title}
                    </button>
                  ))}
               </div>

               <div className="mt-8 pt-8 border-t border-slate-50">
                  <div className="bg-indigo-600 rounded-2xl p-4 text-white">
                      <p className="text-[10px] font-black uppercase opacity-60 mb-1">Resources</p>
                      <p className="text-sm font-bold leading-tight">1000+ Topicwise Lessons Ready</p>
                  </div>
               </div>
            </div>
          </aside>

          {/* MAIN CONTENT Area (Image 1) */}
          <div className="flex-1 space-y-6">
            
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
               <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search subjects (e.g., Physics, English...)" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                  />
               </div>
               <button className="px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
                  <Filter className="w-4 h-4" /> Filter
               </button>
            </div>

            {/* Subject List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {isLoading ? (
                 [1, 2, 4, 5, 6].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-slate-50"></div>)
               ) : (
                 filteredSubjects.map(sub => (
                   <Link 
                    key={sub.id} 
                    href={`/curriculum/${sub.id}`}
                    className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-between"
                   >
                     <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                          <Book className="w-7 h-7" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{sub.groups?.segments?.title || 'General'}</p>
                          <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{sub.title}</h3>
                       </div>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ChevronRight className="w-5 h-5" />
                     </div>
                   </Link>
                 ))
               )}

               {!isLoading && filteredSubjects.length === 0 && (
                 <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-100">
                    <Search className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">No subjects found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your search or segment filter.</p>
                 </div>
               )}
            </div>

            {/* Features Teaser (Image 1 suggests list of subjects, but let's add some style) */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-3xl border border-indigo-100">
                    <GraduationCap className="w-8 h-8 text-indigo-600 mb-4" />
                    <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-tight">Structured Learning</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">Follow a clear path designed by experts for your specific board exams.</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-3xl border border-indigo-100">
                    <Clock className="w-8 h-8 text-indigo-600 mb-4" />
                    <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-tight">Time Saving</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">Topic-wise organization helps you find exactly what you need in seconds.</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-3xl border border-indigo-100">
                    <Layout className="w-8 h-8 text-indigo-600 mb-4" />
                    <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-tight">Mobile First</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">Optimized for phones so you can study anytime, anywhere.</p>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
