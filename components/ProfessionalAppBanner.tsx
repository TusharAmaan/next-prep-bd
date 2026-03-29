"use client";

import { useState } from "react";
import { Sparkles, Smartphone, Apple, PlayCircle, X, ChevronRight } from "lucide-react";

export default function ProfessionalAppBanner() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-slate-900 rounded-[1.5rem] md:rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-white/5 isolate group">
        {/* Background Gradients for 'Premium' feel */}
        <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-indigo-600/10 blur-[80px] md:blur-[120px] group-hover:bg-indigo-600/20 transition-all duration-1000"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-20 w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-purple-600/10 blur-[80px] md:blur-[120px] group-hover:bg-purple-600/20 transition-all duration-1000"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 p-8 md:p-16 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 animate-pulse" />
              Unified Learning Experience
            </div>
            
            <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter leading-[1] md:leading-[0.9] uppercase">
              Master your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Preparation.</span>
            </h2>
            
            <p className="text-slate-400 text-base md:text-xl leading-relaxed max-w-xl font-medium opacity-90">
              Join thousands of students using the official NextPrepBD app for offline access, instant notifications, and personalized exam tracking.
            </p>

            <div className="flex flex-wrap gap-4 md:gap-6 pt-2 md:pt-4">
              {/* Apple Button */}
              <button 
                onClick={() => setShowPopup(true)}
                className="group/btn flex items-center gap-3 md:gap-4 bg-white text-slate-950 px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-slate-100 transition-all shadow-xl shadow-white/5 active:scale-95"
              >
                <Apple className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
                <div className="text-left leading-none">
                  <div className="text-[7px] md:text-[8px] opacity-40 mb-1 font-bold">Available on</div>
                  <div className="text-[10px] md:text-xs">App Store</div>
                </div>
              </button>

              {/* Android Button */}
              <button 
                onClick={() => setShowPopup(true)}
                className="group/btn flex items-center gap-4 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                <PlayCircle className="w-6 h-6" fill="currentColor" />
                <div className="text-left leading-none">
                  <div className="text-[8px] opacity-60 mb-1">Get it on</div>
                  <div className="text-xs">Google Play</div>
                </div>
              </button>
            </div>
          </div>

          {/* Visual/Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end py-10 md:py-0">
            <div className="relative w-48 md:w-64 h-[320px] md:h-[420px] bg-slate-950 border-[8px] md:border-[12px] border-slate-800 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl flex items-center justify-center overflow-hidden transform lg:rotate-6 group-hover:rotate-0 transition-transform duration-700">
                {/* Mockup Screen */}
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-4 md:space-y-6 p-6 md:p-8">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white text-3xl md:text-4xl font-black shadow-2xl shadow-indigo-600/50">N</div>
                    <div className="space-y-2 md:space-y-3 w-full">
                        <div className="h-2 bg-slate-800 rounded-full w-4/5 mx-auto"></div>
                        <div className="h-2 bg-slate-900 rounded-full w-3/5 mx-auto opacity-50"></div>
                    </div>
                </div>
                {/* Gloss effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* POPUP MODAL */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[3rem] shadow-2xl p-8 md:p-12 max-w-md w-full text-center relative animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-6 md:top-8 right-6 md:right-8 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 dark:bg-slate-800 p-2 rounded-lg md:rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-4xl border border-indigo-100 dark:border-indigo-800 shadow-inner">
              🚀
            </div>
            
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Preparing Launch</h3>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 font-medium leading-relaxed">
              We are currently in the final engineering phase. The NextPrepBD ecosystem will be live on all app stores very soon.
            </p>
            
            <button 
              onClick={() => setShowPopup(false)}
              className="w-full py-5 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95"
            >
              Confirm Engagement
            </button>
          </div>
        </div>
      )}
    </>
  );
}