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
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

interface LectureSheetShowcaseProps {
  isLoggedIn: boolean;
}

const LectureSheetShowcase = ({ isLoggedIn }: LectureSheetShowcaseProps) => {
  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500 to-transparent skew-x-12 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-purple-500 to-transparent -skew-x-12 -translate-x-1/4"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left: Content */}
          <div className="space-y-10">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                Lecture Sheet Ecosystem
              </span>
              <h2 className="text-4xl md:text-6xl font-black leading-[1.1] mb-8">
                Missing a Sheet?<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Ask. We Deliver.</span>
              </h2>
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                Can't find the specific lecture sheet you need? Our on-demand system allows you to request any topic, and our expert tutors will prepare it for you within 24 hours.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex gap-5 group">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 border border-white/5">
                  <FileSearch className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg mb-2">Smart Search</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Browse thousands of pre-verified lecture sheets across all subjects.</p>
                </div>
              </div>

              <div className="flex gap-5 group">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-purple-400 shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 border border-white/5">
                  <Send className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg mb-2">Quick Request</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Request high-quality sheets if they are missing from our archive.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-6">
              <Link href={isLoggedIn ? "/feedback" : "/login"} className="px-10 py-5 bg-white text-slate-900 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-blue-400 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 group">
                Request a Sheet <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link href="/resources/hsc" className="px-10 py-5 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center">
                Browse Archive
              </Link>
            </div>
          </div>

          {/* Right: The Interactive "Flow" Graphic */}
          <div className="relative animate-in zoom-in-95 duration-1000">
             <div className="relative z-10 bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 rounded-[4rem] shadow-3xl">
                
                {/* Step 1: User Request */}
                <div className="mb-12 relative">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                         <HelpCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Step 01</p>
                         <h4 className="font-black text-white">Student Submits Request</h4>
                      </div>
                   </div>
                   <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-500">Topic:</span>
                         <span className="font-bold text-slate-300">Quantum Physics Basics</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 w-3/4 animate-pulse"></div>
                      </div>
                   </div>
                   {/* Connector Line */}
                   <div className="absolute left-6 top-full h-12 w-0.5 bg-gradient-to-b from-blue-600 to-transparent opacity-30"></div>
                </div>

                {/* Step 2: Expert Working */}
                <div className="mb-12 relative flex justify-end">
                   <div className="w-full max-w-[280px]">
                      <div className="flex items-center gap-4 mb-4 justify-end text-right">
                         <div>
                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-0.5">Step 02</p>
                            <h4 className="font-black text-white">Expert Preparation</h4>
                         </div>
                         <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20">
                            <Clock className="w-6 h-6 text-white" />
                         </div>
                      </div>
                      <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 flex flex-col items-center">
                         <div className="flex -space-x-3 mb-4">
                            {[1, 2, 3].map(i => (
                               <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                                  <img src={`https://i.pravatar.cc/100?img=${i+40}`} alt="tutor" />
                               </div>
                            ))}
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
                            Tutors are labeling...
                         </div>
                      </div>
                   </div>
                   {/* Connector Line */}
                   <div className="absolute right-6 top-full h-12 w-0.5 bg-gradient-to-b from-purple-600 to-transparent opacity-30"></div>
                </div>

                {/* Step 3: Delivered */}
                <div className="relative">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                         <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Step 03</p>
                         <h4 className="font-black text-white">Delivered & Ready</h4>
                      </div>
                   </div>
                   <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 flex items-center justify-between group/file cursor-pointer hover:bg-emerald-500/20 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                            <CloudDownload className="w-5 h-5 text-white" />
                         </div>
                         <p className="text-sm font-black text-emerald-400">Download-Physics-Q1.pdf</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover/file:bg-emerald-500 group-hover/file:text-white transition-all text-emerald-500">
                         <ArrowUpRight className="w-4 h-4" />
                      </div>
                   </div>
                </div>

             </div>

             {/* Background Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-600/20 blur-[120px] -z-10 rounded-full"></div>
          </div>

        </div>
      </div>

      {/* Floating Icons Decors */}
      <MessageSquare className="absolute top-20 right-[15%] w-12 h-12 text-blue-500/10" />
      <Zap className="absolute bottom-40 left-[10%] w-16 h-16 text-purple-500/10" />
    </section>
  );
};

export default LectureSheetShowcase;
