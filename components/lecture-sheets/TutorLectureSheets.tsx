'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { 
  FileText, 
  Search, 
  Clock, 
  CheckCircle2, 
  Download, 
  Printer,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Sparkles
} from "lucide-react";

interface TutorLectureSheetsProps {
  user: any;
}

const TutorLectureSheets: React.FC<TutorLectureSheetsProps> = ({ user }) => {
  const [sheets, setSheets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSheets = useCallback(async () => {
    setIsLoading(true);
    try {
      // Tutors see all published sheets (Professional status)
      const { data, error } = await supabase
        .from('lecture_sheets')
        .select('*, segments(title), groups(title), subjects(title)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSheets(data || []);
    } catch (err) {
      console.error("Error fetching tutor sheets:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  const filteredSheets = sheets.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.subjects?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Lecture Sheet Repository
          </h2>
          <p className="text-xs text-slate-500 font-medium">Access and print materials for your sessions</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search sheets or subjects..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSheets.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No lecture sheets found.</p>
            </div>
          ) : (
            filteredSheets.map((sheet) => (
              <div key={sheet.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
                <div className="h-40 bg-slate-50 relative overflow-hidden flex items-center justify-center">
                   {sheet.thumbnail_url ? (
                     <img src={sheet.thumbnail_url} alt={sheet.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   ) : (
                     <FileText className="w-10 h-10 text-slate-200" />
                   )}
                   <div className="absolute top-2 left-2">
                      <span className="bg-white/90 backdrop-blur-md text-[10px] font-black uppercase px-2 py-1 rounded-lg text-indigo-600 shadow-sm border border-slate-100">
                        {sheet.subjects?.title}
                      </span>
                   </div>
                </div>
                
                <div className="p-5 flex-1 space-y-3">
                   <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{sheet.title}</h3>
                   <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">{sheet.segments?.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${sheet.access_type === 'public' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                         {sheet.access_type}
                      </span>
                   </div>
                </div>

                <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                   <button className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-indigo-600 transition-colors">
                      <Printer className="w-3.5 h-3.5" /> PRINT READY
                   </button>
                   <button 
                     onClick={() => window.open(sheet.file_url, '_blank')}
                     className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-all shadow-md active:scale-95"
                   >
                     <ArrowUpRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quick Stats / Info Footer */}
      <div className="bg-indigo-900 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32" />
         </div>
         <div className="relative z-10 text-center md:text-left">
            <h3 className="text-lg font-bold">Request Content Creation</h3>
            <p className="text-indigo-200 text-xs mt-1">Need a custom lecture sheet for your batch? Contact Admin or suggest via the student portal.</p>
         </div>
         <button className="relative z-10 bg-white text-indigo-900 px-6 py-2.5 rounded-xl font-black text-xs hover:bg-slate-100 transition-all shadow-lg active:scale-95">
            CONTACT ADMIN
         </button>
      </div>
    </div>
  );
};

export default TutorLectureSheets;
