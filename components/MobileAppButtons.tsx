"use client";

import { useState } from "react";
import Image from "next/image"; // Assuming you use Next.js Image, or use standard <img>

export default function MobileAppButtons() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* === THE BUTTONS === */}
      <div className="flex gap-4 mt-4">
        {/* Apple Store Button */}
        <button 
          onClick={() => setIsOpen(true)}
          className="transition-transform hover:scale-105 active:scale-95"
          aria-label="Download on App Store"
        >
          {/* Replace this src with your actual App Store Image if you have one */}
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
            alt="Download on App Store" 
            className="h-10 w-auto"
          />
        </button>

        {/* Google Play Button */}
        <button 
          onClick={() => setIsOpen(true)}
          className="transition-transform hover:scale-105 active:scale-95"
          aria-label="Get it on Google Play"
        >
          {/* Replace this src with your actual Play Store Image */}
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
            alt="Get it on Google Play" 
            className="h-10 w-auto"
          />
        </button>
      </div>

      {/* === THE PROFESSIONAL POPUP === */}
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

      {/* Animation Style (Same as your Admin Panel) */}
      <style jsx>{`
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}