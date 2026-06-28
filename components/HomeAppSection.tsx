'use client';

import { useState } from "react";
import { Smartphone, Apple, Play, X, Download, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomeAppSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900/30 transition-colors duration-500 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 md:p-16 lg:p-24 relative overflow-hidden shadow-[0_24px_64px_rgba(15,23,42,0.04)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.4)]"
          >
            {/* Subtle Grid Pattern Background instead of AI blobs */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
              
              {/* Left text content */}
              <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold tracking-wide uppercase">
                  <Smartphone className="w-3.5 h-3.5" /> Mobile App
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                  Your studies in <br /> your pocket.
                </h2>
                
                <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Take your learning offline. Download class notes, watch video lectures on the go, and get instant notifications for live classes.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <button 
                    onClick={() => setIsOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                  >
                    <svg viewBox="0 0 384 512" className="w-5 h-5 fill-current" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                    </svg>
                    <div className="text-left leading-tight">
                      <div className="text-[9px] uppercase tracking-wider opacity-80">Coming Soon</div>
                      <div className="text-sm">App Store</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setIsOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-8 py-4 rounded-xl font-bold transition-all hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95"
                  >
                    <svg viewBox="0 0 512 512" className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#02D58E" d="M12.9,23.1C7.7,28.3,4.6,36.5,4.6,47.4v417.2c0,10.9,3.1,19.1,8.3,24.3l8.6,8.6l234.3-234.3v-14.3L21.5,14.5L12.9,23.1z" />
                      <path fill="#FFD33E" d="M333.6,323.2l-77.8-77.8v-14.3l77.8-77.8l9.1,5.2l91.1,51.8c25.9,14.7,25.9,38.7,0,53.5l-91.1,51.8L333.6,323.2z" />
                      <path fill="#FF3748" d="M333.6,323.2l-77.8-77.8L21.5,497.6c9.4,10,25.4,10.7,45,0l267.1-151.7L333.6,323.2z" />
                      <path fill="#09B5FF" d="M333.6,188.8L66.5,37.1c-19.6-10.7-35.6-10-45,0l234.3,234.3l77.8-77.8L333.6,188.8z" />
                    </svg>
                    <div className="text-left leading-tight">
                      <div className="text-[9px] uppercase tracking-wider text-slate-500">Coming Soon</div>
                      <div className="text-sm">Google Play</div>
                    </div>
                  </button>
                </div>
                
                <div className="pt-6 flex items-center justify-center lg:justify-start gap-2 text-xs font-bold text-slate-400">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   100% Safe & Ad-Free environment
                </div>
              </div>
              
              {/* Right Visual element (Clean abstract representation) */}
              <div className="lg:w-1/2 w-full max-w-md mx-auto relative h-[400px] flex items-center justify-center">
                 <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-inner transform rotate-3 scale-105"></div>
                 <div className="absolute inset-0 bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col overflow-hidden transform -rotate-3">
                    <div className="bg-slate-100 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">A</div>
                       <div className="flex-1">
                          <div className="h-2 w-24 bg-slate-200 dark:bg-slate-800 rounded-full mb-1"></div>
                          <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                       </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col gap-4">
                       <div className="h-32 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                          <Download className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                       </div>
                       <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                       <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                       <div className="mt-auto grid grid-cols-2 gap-3">
                          <div className="h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"></div>
                          <div className="h-10 bg-slate-50 dark:bg-slate-900 rounded-lg"></div>
                       </div>
                    </div>
                 </div>
              </div>
              
            </div>
          </motion.div>
        </div>
      </section>

      {/* POPUP MODAL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm p-5 md:p-6"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden relative border border-slate-100 dark:border-slate-800"
            >
              
              <div className="p-8 md:p-12 text-center relative">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-100 dark:bg-slate-800 p-2 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-600 dark:text-slate-300">
                  <Smartphone className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                  Mobile App Coming Soon
                </h3>

                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 font-medium">
                  We're finalizing the native app experience for iOS and Android. It will be released soon with offline support and push notifications.
                </p>

                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl transition shadow-md hover:shadow-lg active:scale-95 duration-200 text-sm"
                >
                  Got it, close
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}