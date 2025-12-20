"use client";

import { useState } from "react";

export default function AppDownloadBanner() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      {/* Banner Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-800 rounded-3xl p-8 md:p-12 shadow-xl text-white">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-100 text-xs font-bold uppercase tracking-wider mb-4">
              Mobile App
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
              Study Smarter, <br/> Not Harder
            </h2>
            <p className="text-blue-100 mb-8 text-lg opacity-90 leading-relaxed">
              Get instant notifications for updates, access offline study materials, and take quizzes directly on your phone.
            </p>
            
            <div className="flex flex-wrap gap-4">
              {/* Google Play Button */}
              <button 
                onClick={() => setShowPopup(true)}
                className="bg-black/20 hover:bg-black/40 border border-white/20 hover:border-white/40 text-white px-5 py-3 rounded-xl transition-all flex items-center gap-3 group"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" /></svg>
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold opacity-70 leading-none">Get it on</div>
                  <div className="text-sm font-bold leading-none mt-1">Google Play</div>
                </div>
              </button>

              {/* App Store Button */}
              <button 
                onClick={() => setShowPopup(true)}
                className="bg-black/20 hover:bg-black/40 border border-white/20 hover:border-white/40 text-white px-5 py-3 rounded-xl transition-all flex items-center gap-3 group"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.45C5.62,7.91 7.2,6.97 8.92,7C10.5,7.06 11.5,7.97 12.47,7.97C13.4,7.97 14.66,6.89 16.57,7C17.3,7.06 19.3,7.3 20.5,9C20.35,9.1 18.25,10.29 18.29,13C18.3,15.37 20.21,16.84 20.73,17.47L20.69,17.56C20.69,17.56 19.95,19.34 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.37 12.36,4.26 13,3.5Z" /></svg>
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold opacity-70 leading-none">Download on the</div>
                  <div className="text-sm font-bold leading-none mt-1">App Store</div>
                </div>
              </button>
            </div>
          </div>
          
          {/* Right Side Illustration */}
          <div className="hidden lg:flex justify-center items-center relative">
             <div className="w-64 h-64 bg-white/10 rounded-full blur-3xl absolute"></div>
             {/* Simple Phone Mockup Icon */}
             <svg className="w-48 h-48 text-white/90 transform rotate-12 drop-shadow-2xl" fill="currentColor" viewBox="0 0 24 24"><path d="M17,1.01L7,1C5.9,1 5,1.9 5,3V21C5,22.1 5.9,23 7,23H17C18.1,23 19,22.1 19,21V3C19,1.9 18.1,1.01 17,1.01M17,19H7V5H17V19Z" /></svg>
          </div>
        </div>
      </div>

      {/* COMING SOON POPUP */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🚀
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Coming Soon!</h3>
            <p className="text-slate-500 mb-6">
              We are working hard to build the best learning experience for you. The app will be available on stores very soon.
            </p>
            
            <button 
              onClick={() => setShowPopup(false)}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
            >
              Okay, I'll wait
            </button>
          </div>
        </div>
      )}
    </>
  );
}