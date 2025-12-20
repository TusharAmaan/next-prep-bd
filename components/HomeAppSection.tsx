"use client";

import { useState } from "react";

export default function HomeAppSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* =========================================
          APP DOWNLOAD SECTION (Interactive)
         ========================================= */}
      <section className="bg-white border-t border-slate-200 py-24 px-6">
        <div className="max-w-5xl mx-auto bg-black rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-40"></div>
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600 rounded-full blur-[100px] opacity-40"></div>

            <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Study Anytime, Anywhere.</h2>
                <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                    Download the NextPrepBD app to save notes offline, take quizzes on the go, and get instant notifications about exams.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-5">
                    {/* APP STORE BUTTON */}
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-4 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition group shadow-xl hover:scale-105 transform duration-200"
                    >
                        <svg className="w-8 h-8 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 79.9c5.2 14.7 19.7 42.9 44.9 77.1 19.3 26.2 38.3 49 63.6 49 19.7 0 32.2-12.7 63-12.7 29.5 0 40.7 12.7 62.7 12.7 26.5 0 42.6-20.4 63.3-48.8 17.5-23.7 28.1-46.5 37-67.6-33.8-13.7-54.3-43.2-54.2-74.5zm-59.3-132.2c16.3-18.8 30.2-46.5 25.1-75.1-23.9 1.5-51.7 15.6-67.3 34.2-13.7 16.2-25.2 41.7-22 72.9 26.9 2.1 53.6-13.1 64.2-32z"/></svg>
                        <div className="text-left leading-none">
                            <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Download on the</div>
                            <div className="text-xl font-black">App Store</div>
                        </div>
                    </button>

                    {/* PLAY STORE BUTTON */}
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-4 bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition group shadow-xl hover:scale-105 transform duration-200"
                    >
                        <svg className="w-8 h-8 fill-current" viewBox="0 0 512 512"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                        <div className="text-left leading-none">
                            <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">GET IT ON</div>
                            <div className="text-xl font-black">Google Play</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* =========================================
          THE PROFESSIONAL POPUP (Hidden by default)
         ========================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative transform transition-all scale-100">
            
            {/* Decor Header */}
            <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 w-full"></div>
            
            <div className="p-8 text-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🚀</span>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-black text-slate-800 mb-3">
                App Coming Soon!
              </h3>

              {/* Professional Text */}
              <p className="text-slate-600 leading-relaxed mb-8">
                We are building the ultimate exam companion for your pocket. The 
                <span className="font-bold text-slate-900"> NextPrepBD Mobile App </span> 
                is currently in the final stages of development.
                <br /><br />
                It will feature offline reading, live model tests, and instant notifications.
              </p>

              {/* Action Button */}
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition shadow-lg"
              >
                Got it, I'll wait!
              </button>
            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}