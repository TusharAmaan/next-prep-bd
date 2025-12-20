"use client";

import { useState } from "react";

export default function DarkAppPromo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          {/* Main Download Button */}
          <button 
             onClick={() => setIsOpen(true)}
             className="flex items-center justify-center gap-3 bg-white text-black px-6 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-lg"
          >
              {/* Universal Download Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9h2v9h-2zm-2.5-2.5l3.5 3.5 3.5-3.5-1.42-1.42L12 14.67l-2.08-2.09L8.5 14z"/></svg>
              <span>Download App</span>
          </button>
          
          {/* Platform Badges (Non-clickable visual indicators) */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-gray-300 text-sm font-medium">
             <span className="flex items-center gap-1.5"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.3785 13.8532 7.9999 12 7.9999s-3.5902.3786-5.1361.9497L4.8416 5.4467a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/></svg> Android</span>
             <span className="w-px h-4 bg-gray-600"></span>
             <span className="flex items-center gap-1.5"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.64 3.4 1.63-3.15 1.88-2.6 6.55 1.2 7.98-.6 1.62-1.6 3.01-3.25 3.4zm-4.32-15c-.15 1.56-1.35 2.87-2.93 2.83-.35-1.63 1-3.1 2.93-2.83z"/></svg> iOS</span>
          </div>
      </div>

      {/* === POPUP (Reused) === */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative transform transition-all scale-100">
             <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 w-full"></div>
             <div className="p-8 text-center">
               <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6"><span className="text-4xl">🚀</span></div>
               <h3 className="text-2xl font-black text-slate-800 mb-3">App Coming Soon!</h3>
               <p className="text-slate-600 leading-relaxed mb-8">
                 The <span className="font-bold text-slate-900">NextPrepBD App</span> for <span className="text-green-600 font-bold">Android</span> & <span className="text-gray-800 font-bold">iOS</span> is in the final stages of development.
               </p>
               <button onClick={() => setIsOpen(false)} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition shadow-lg">Got it, I'll wait!</button>
             </div>
          </div>
        </div>
      )}
      <style jsx>{` .animate-fade-in { animation: fadeIn 0.2s ease-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } `}</style>
    </>
  );
}