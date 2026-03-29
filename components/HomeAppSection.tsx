"use client";

import { useState } from "react";
import { Sparkles, Smartphone, Apple, PlayCircle, X, ArrowRight, Bell, Zap } from "lucide-react";

export default function HomeAppSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/50 py-16 md:py-32 px-5 md:px-6 transition-colors duration-500">
        <div className="max-w-6xl mx-auto bg-slate-900 dark:bg-slate-900/40 rounded-2xl md:rounded-[4rem] p-8 md:p-28 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
            <div className="absolute -top-40 -right-40 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-indigo-600 rounded-full blur-[100px] md:blur-[150px] opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-purple-600 rounded-full blur-[100px] md:blur-[150px] opacity-20 animate-pulse"></div>

            <div className="relative z-10 space-y-8 md:space-y-12">
                <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-1.5 md:py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-2 md:mb-4">
                    <Zap className="w-3.5 md:w-4 h-3.5 md:h-4 text-amber-400 fill-amber-400" />
                    Mobile Ecosystem
                </div>
                
                <h2 className="text-4xl md:text-8xl font-black text-white mb-6 md:mb-8 tracking-tighter leading-[1] md:leading-[0.9] uppercase italic">
                    Academy in <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 text-glow">Your Pocket.</span>
                </h2>
                
                <p className="text-slate-400 text-base md:text-2xl mb-10 md:mb-16 max-w-3xl mx-auto leading-relaxed font-medium opacity-90">
                    Experience seamless learning with the NextPrepBD mobile app. Access offline journals, solve instant quizzes, and stay ahead with real-time academic alerts.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-8">
                    {/* APP STORE BUTTON */}
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="group flex items-center gap-4 md:gap-6 bg-white text-slate-950 px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[0.15em] hover:bg-slate-100 transition shadow-2xl hover:scale-105 active:scale-95 duration-500"
                    >
                        <Apple className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                        <div className="text-left leading-none">
                            <div className="text-[7px] md:text-[9px] opacity-40 mb-1">Coming Soon to</div>
                            <div className="text-sm md:text-lg">App Store</div>
                        </div>
                    </button>

                    {/* PLAY STORE BUTTON */}
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="group flex items-center gap-4 md:gap-6 bg-white/5 backdrop-blur-3xl border border-white/10 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[0.15em] hover:bg-white/10 transition shadow-2xl hover:scale-105 active:scale-95 duration-500"
                    >
                        <PlayCircle className="w-6 h-6 md:w-8 md:h-8 fill-current text-indigo-400" />
                        <div className="text-left leading-none">
                            <div className="text-[7px] md:text-[9px] opacity-40 mb-1">Android App</div>
                            <div className="text-sm md:text-lg">Google Play</div>
                        </div>
                    </button>
                </div>

                <div className="pt-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center justify-center gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Encrypted & Secure 
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                </div>
            </div>
        </div>
      </section>

      {/* POPUP MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-500 p-5 md:p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[3.5rem] shadow-2xl max-w-lg w-full overflow-hidden relative transform transition-all border border-slate-100 dark:border-slate-800">
            
            <div className="h-1.5 md:h-2.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 w-full shadow-lg"></div>
            
            <div className="p-8 md:p-16 text-center pt-16 md:pt-16">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 md:mb-10 border border-indigo-100 dark:border-indigo-900/50 shadow-inner">
                <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              </div>

              <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 md:mb-6 uppercase tracking-tighter leading-none italic">
                Evolution in Progress
              </h3>

              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg leading-relaxed mb-10 md:mb-12 font-medium opacity-90">
                The <span className="text-slate-950 dark:text-white font-black">NextPrepBD Mobile Ecosystem</span> is entering the final deployment phase. We are engineering a revolutionary offline learning experience for all candidates.
              </p>

              <button 
                onClick={() => setIsOpen(false)}
                className="w-full bg-slate-900 dark:bg-indigo-600 text-white font-black py-4 md:py-6 rounded-xl md:rounded-2xl hover:bg-indigo-600 dark:hover:bg-indigo-500 transition shadow-2xl shadow-indigo-600/20 uppercase tracking-[0.2em] text-[9px] md:text-[10px] active:scale-95 duration-300"
              >
                Acknowledge Protocol
              </button>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 md:top-10 right-6 md:right-10 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 dark:bg-slate-800 p-2 md:p-2.5 rounded-xl md:rounded-2xl"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}