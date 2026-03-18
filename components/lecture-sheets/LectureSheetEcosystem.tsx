'use client';

import React from 'react';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  Zap,
  Target,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const LectureSheetEcosystem = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Content */}
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-black uppercase tracking-wider mb-6">
                <Sparkles className="w-4 h-4" />
                NextPrep Ecosystem
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1]">
                Empowering <span className="text-indigo-600">1,000+</span> Students with Precision Learning.
              </h2>
              <p className="mt-6 text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                Our platform provides more than just exams. Get personalized lecture sheets, 1-to-1 mentorship, and a systematic repository designed for excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mb-4 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2">Smart Requests</h3>
                <p className="text-sm text-slate-500 font-medium">Ask for any lecture sheet. Our experts prepare it specifically for your needs.</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 mb-4 shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2">Mentorship</h3>
                <p className="text-sm text-slate-500 font-medium">Connect with top tutors for 1-to-1 guidance and problem-solving sessions.</p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-2xl shadow-indigo-100 active:scale-95 text-lg">
                Join Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/about" className="bg-white border-2 border-slate-100 hover:border-indigo-100 px-8 py-4 rounded-2xl font-black text-slate-600 flex items-center justify-center transition-all text-lg">
                Learn More
              </Link>
            </div>
          </div>

          {/* Right: Visual Stats / Teaser */}
          <div className="relative">
             <div className="relative z-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-4 shadow-3xl shadow-slate-900/20 aspect-square flex flex-col justify-center overflow-hidden">
                {/* Visual Dashboard Teaser */}
                <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 space-y-8">
                   <div className="flex justify-between items-center">
                      <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-indigo-600 flex items-center justify-center text-[10px] font-black">+1k</div>
                      </div>
                      <span className="text-emerald-400 text-xs font-black flex items-center gap-1 uppercase tracking-widest animate-pulse">
                        <Zap className="w-3 h-3 fill-emerald-400" /> Live Assistance
                      </span>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                         <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <FileText className="w-5 h-5 text-white" />
                         </div>
                         <div className="flex-1">
                            <div className="h-2 w-24 bg-white/20 rounded-full mb-2"></div>
                            <div className="h-1.5 w-40 bg-white/10 rounded-full"></div>
                         </div>
                         <div className="h-6 w-12 bg-white/10 rounded-lg"></div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4 translate-x-4 opacity-60">
                         <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Target className="w-5 h-5 text-white" />
                         </div>
                         <div className="flex-1">
                            <div className="h-2 w-20 bg-white/20 rounded-full mb-2"></div>
                            <div className="h-1.5 w-32 bg-white/10 rounded-full"></div>
                         </div>
                         <div className="h-6 w-12 bg-white/10 rounded-lg"></div>
                      </div>
                   </div>

                   <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Impact</p>
                            <p className="text-3xl font-black text-white">124,580+</p>
                         </div>
                         <div className="text-right">
                             <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Growth</p>
                             <p className="text-xl font-black text-white">+24.5%</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Floaters */}
                <div className="absolute top-20 right-[-20px] bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce shadow-indigo-100">
                   <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-black text-xs">A+</div>
                   <p className="text-xs font-black text-slate-800">New Sheet Published</p>
                </div>
             </div>
             
             {/* Background Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-600/20 blur-[100px] -z-10 rounded-full"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LectureSheetEcosystem;
