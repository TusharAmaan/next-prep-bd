'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Sparkles, BookOpen, GraduationCap, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function HeroCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [segments, setSegments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleOpen = async () => {
    setIsOpen(true);
    if (segments.length === 0) {
      setIsLoading(true);
      const { data } = await supabase.from('segments').select('id, title, slug').order('id');
      setSegments(data || []);
      setIsLoading(false);
    }
  };

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    router.push(`/resources/${slug}`);
  };

  return (
    <>
      <button 
        onClick={handleOpen} 
        className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-[0_8px_32px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_40px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
      >
        Start Learning Free <ArrowRight className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 z-20"></div>
              
              {/* Sticky Header with Close Button */}
              <div className="flex justify-between items-center p-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Select Your Segment
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Choose an academic stage to continue.
                  </p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-28 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {segments.map((seg, idx) => {
                      const icons = [<GraduationCap />, <BookOpen />, <Layers />, <Sparkles />];
                      const icon = icons[idx % icons.length];
                      
                      return (
                        <button
                          key={seg.id}
                          onClick={() => handleSelect(seg.slug)}
                          className="group flex flex-col items-center justify-center p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md text-center"
                        >
                          <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all duration-300 mb-3 shadow-inner group-hover:-translate-y-1">
                            {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
                          </div>
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                            {seg.title}
                          </h3>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-5 sm:px-8 border-t border-slate-100 dark:border-slate-800 shrink-0">
                 <div className="flex items-center justify-between">
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Join <strong className="text-slate-900 dark:text-white">50,000+</strong> students learning effectively.
                    </p>
                    <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      NextPrepBD
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
