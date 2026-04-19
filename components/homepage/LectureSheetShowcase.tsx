'use client';

import React from 'react';
import { 
  FileSearch, 
  Send, 
  CloudDownload, 
  MessageSquare, 
  CheckCircle,
  HelpCircle,
  Clock,
  Zap,
  ArrowUpRight,
  Sparkles,
  Search
} from 'lucide-react';
import Link from 'next/link';

interface LectureSheetShowcaseProps {
  isLoggedIn: boolean;
}

const LectureSheetShowcase = ({ isLoggedIn }: LectureSheetShowcaseProps) => {
  return (
    <section className="py-16 md:py-32 bg-slate-900 text-white relative overflow-hidden transition-colors duration-500 border-y border-white/5">
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500 to-transparent skew-x-12 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-purple-500 to-transparent -skew-x-12 -translate-x-1/4"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
          
          {/* Left: Content */}
          <div className="lg:col-span-6 space-y-8 md:space-y-12">
            <div className="animate-in fade-in slide-in-from-left-4 duration-1000">
              <span className="inline-flex items-center gap-2.5 md:gap-3 px-4 md:px-6 py-1.5 md:py-2 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-indigo-400 text-[10px] md:text-xs font-bold tracking-wide mb-8 md:mb-10 shadow-sm">
                <Zap className="w-3.5 md:w-4 h-3.5 md:h-4 text-amber-400 fill-amber-400" />
                Study Library on Demand
              </span>
              <h2 className="text-3xl md:text-7xl font-bold leading-[1.1] md:leading-[1] mb-6 md:mb-10 tracking-tight">
                Can't find a study sheet? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">We'll prepare it for you.</span>
              </h2>
              <p className="text-base md:text-lg text-slate-400 font-medium leading-relaxed max-w-xl opacity-80">
                Our team ensures you never fall behind. If a specific topic is missing, just let us know and we'll have it ready for you within 24 hours.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
              <div className="flex gap-4 md:gap-6 group">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 border border-white/5 shadow-2xl">
                  <Search className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base md:text-xl mb-2 md:mb-3 tracking-tight">Quick Search</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Browse thousands of pre-verified study materials.</p>
                </div>
              </div>

              <div className="flex gap-4 md:gap-6 group">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-purple-400 shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all duration-700 border border-white/5 shadow-2xl">
                  <Send className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base md:text-xl mb-2 md:mb-3 tracking-tight">Request Anytime</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Tell us what you need, and we'll add it to the library.</p>
                </div>
              </div>
            </div>

            <div className="pt-8 md:pt-10 flex flex-col sm:flex-row gap-4 md:gap-8">
              <Link href={isLoggedIn ? "/feedback" : "/signup"} className="px-10 md:px-12 py-4 md:py-6 bg-white text-slate-950 rounded-xl md:rounded-3xl font-bold text-xs md:text-sm transition-all shadow-2xl shadow-white/5 active:scale-95 flex items-center justify-center gap-3 md:gap-4 group/btn duration-500">
                Submit a Request <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-2 group-hover/btn:-translate-y-2 transition-transform" />
              </Link>
              <Link href="/curriculum" className="px-10 md:px-12 py-4 md:py-6 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-xl md:rounded-3xl font-bold text-xs md:text-sm hover:bg-white/10 transition-all flex items-center justify-center duration-500">
                Browse Library
              </Link>
            </div>
          </div>

          {/* Right: The Interactive "Flow" Graphic */}
          <div className="lg:col-span-6 relative animate-in zoom-in-95 duration-1000 hidden lg:block">
             <div className="relative z-10 bg-white/5 backdrop-blur-3xl border border-white/10 p-12 md:p-16 rounded-[4rem] shadow-3xl">
                
                {/* Step 1: User Request */}
                <div className="mb-16 relative">
                   <div className="flex items-center gap-6 mb-6">
                      <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                         <HelpCircle className="w-8 h-8 text-white" />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-indigo-400 tracking-wide mb-1">Step 01</p>
                         <h4 className="text-xl font-bold text-white tracking-tight">Tell us what's missing</h4>
                      </div>
                   </div>
                   <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-inner">
                      <div className="flex justify-between items-center text-xs font-medium">
                         <span className="text-slate-500">Requested Topic:</span>
                         <span className="text-indigo-400">Higher Physics Dynamics</span>
                      </div>
                      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500 w-3/4 animate-pulse shadow-glow"></div>
                      </div>
                   </div>
                   <div className="absolute left-8 top-full h-16 w-0.5 bg-gradient-to-b from-indigo-600 to-transparent opacity-30"></div>
                </div>

                {/* Step 2: Expert Working */}
                <div className="mb-16 relative flex justify-end">
                   <div className="w-full max-w-sm">
                      <div className="flex items-center gap-6 mb-6 justify-end text-right">
                         <div>
                            <p className="text-xs font-bold text-purple-400 tracking-wide mb-1">Step 02</p>
                            <h4 className="text-xl font-bold text-white tracking-tight">Our team starts work</h4>
                         </div>
                         <div className="w-16 h-16 bg-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-600/30">
                            <Clock className="w-8 h-8 text-white" />
                         </div>
                      </div>
                      <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center shadow-inner">
                         <div className="flex -space-x-4 mb-6">
                            {[1, 2, 3].map(i => (
                               <div key={i} className="w-12 h-12 rounded-[1.5rem] border-4 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
                                  <img src={`https://i.pravatar.cc/100?img=${i+50}`} alt="tutor" className="object-cover w-full h-full" />
                               </div>
                            ))}
                         </div>
                         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
                            Preparing your materials...
                         </div>
                      </div>
                   </div>
                   <div className="absolute right-8 top-full h-16 w-0.5 bg-gradient-to-b from-purple-600 to-transparent opacity-30"></div>
                </div>

                {/* Step 3: Delivered */}
                <div className="relative">
                   <div className="flex items-center gap-6 mb-6">
                      <div className="w-16 h-16 bg-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-600/30">
                         <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-cyan-400 tracking-wide mb-1">Step 03</p>
                         <h4 className="text-xl font-bold text-white tracking-tight">Ready for you</h4>
                      </div>
                   </div>
                   <div className="bg-cyan-500/10 p-8 rounded-[2.5rem] border border-cyan-500/20 flex items-center justify-between group/file cursor-pointer hover:bg-cyan-500/20 transition-all duration-500 shadow-inner">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/50 group-hover/file:scale-110 transition-transform duration-500">
                            <CloudDownload className="w-6 h-6 text-white" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-cyan-400 tracking-tight">physics-dynamics-x1.pdf</p>
                            <p className="text-[10px] text-cyan-500/60 font-medium tracking-wide mt-1">Uploaded successfully</p>
                         </div>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center group-hover/file:bg-cyan-500 group-hover/file:text-white transition-all text-cyan-500">
                         <ArrowUpRight className="w-5 h-5" />
                      </div>
                   </div>
                </div>

             </div>

             {/* Background Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-indigo-600/20 blur-[150px] -z-10 rounded-full animate-pulse"></div>
          </div>

        </div>
      </div>

      {/* Floating Icons Decors */}
      <Sparkles className="absolute top-32 right-[10%] w-16 h-16 text-indigo-500/5 pointer-events-none" />
      <Zap className="absolute bottom-48 left-[5%] w-24 h-24 text-purple-500/5 rotate-12 pointer-events-none" />
    </section>
  );
};

export default LectureSheetShowcase;
