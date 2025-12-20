"use client";

import { useState } from "react";

export default function ProfessionalAppBanner() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-800 isolate">
        {/* Background Gradients for 'Premium' feel */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 p-10 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Coming Soon
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              Take your prep <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">to the next level.</span>
            </h2>
            
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              Download the official NextPrepBD app to access offline syllabus, get instant routine updates, and track your exam progress.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {/* Apple Button */}
              <button 
                onClick={() => setShowPopup(true)}
                className="group flex items-center gap-3 bg-white text-slate-900 px-5 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-all active:scale-95"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.45C5.62,7.91 7.2,6.97 8.92,7C10.5,7.06 11.5,7.97 12.47,7.97C13.4,7.97 14.66,6.89 16.57,7C17.3,7.06 19.3,7.3 20.5,9C20.35,9.1 18.25,10.29 18.29,13C18.3,15.37 20.21,16.84 20.73,17.47L20.69,17.56C20.69,17.56 19.95,19.34 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.37 12.36,4.26 13,3.5Z" /></svg>
                <div className="text-left leading-none">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Download on</div>
                  <div className="text-sm">App Store</div>
                </div>
              </button>

              {/* Android Button */}
              <button 
                onClick={() => setShowPopup(true)}
                className="group flex items-center gap-3 bg-slate-800 text-white px-5 py-3 rounded-lg font-semibold border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all active:scale-95"
              >
                <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" /></svg>
                <div className="text-left leading-none">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Get it on</div>
                  <div className="text-sm">Google Play</div>
                </div>
              </button>
            </div>
          </div>

          {/* Visual/Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-48 h-[300px] bg-slate-900 border-[8px] border-slate-800 rounded-[2.5rem] shadow-2xl flex items-center justify-center overflow-hidden">
                {/* Mockup Screen */}
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-3 p-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold">N</div>
                    <div className="space-y-2 w-full">
                        <div className="h-2 bg-slate-800 rounded w-3/4 mx-auto"></div>
                        <div className="h-2 bg-slate-800 rounded w-1/2 mx-auto"></div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPUP MODAL */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl border border-slate-200">
              🚀
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Coming Soon!</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              We are putting the final touches on the app. It will be available on Play Store and App Store very soon.
            </p>
            
            <button 
              onClick={() => setShowPopup(false)}
              className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
            >
              Okay, I'll wait
            </button>
          </div>
        </div>
      )}
    </>
  );
}