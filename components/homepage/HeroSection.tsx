'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import HeroCTA from './HeroCTA';

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } },
  };

  return (
    <section className="relative min-h-[100svh] flex items-center pt-28 pb-20 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500">
      {/* Soft Animated Background Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" as any}}
          className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-indigo-50 dark:bg-indigo-900/20 blur-[80px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" as any, delay: 1 }}
          className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-50 dark:bg-blue-900/15 blur-[80px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" as any, delay: 2 }}
          className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-emerald-50 dark:bg-emerald-900/10 blur-[80px]"
        />
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold tracking-wide mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Bangladesh's #1 Exam Platform
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-[5rem] font-extrabold text-slate-900 dark:text-white leading-[1.05] tracking-tight mb-6">
              Your journey to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">success</span> <br />
              starts here.
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg mb-10">
              Thousands of Bangladeshi students trust NextPrepBD to crack SSC, HSC, University Admission, and beyond — with expert-crafted content and live mentorship.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <HeroCTA />
              <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5" /> See How It Works
              </a>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4 mt-12">
              <div className="flex -space-x-3">
                {['#6366F1', '#10B981', '#F59E0B', '#EF4444'].map((color, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center font-bold text-white text-xs shadow-sm" style={{ background: color }}>
                    {['A', 'F', 'R', 'S'][i]}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs bg-slate-100 dark:bg-slate-800 shadow-sm z-10">
                  +
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 mb-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <svg key={i} className="w-4 h-4 text-amber-500 fill-amber-500" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium"><strong>50,000+</strong> students · <strong>4.9★</strong> rating</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" as any, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            {/* Floating Top Card */}
            <motion.div 
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" as any}}
              className="absolute -top-4 -right-4 md:top-10 md:right-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-20 hidden sm:flex items-center gap-3"
            >
              <div className="text-3xl">🏆</div>
              <div>
                <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 leading-none mb-1">98%</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Pass rate this year</div>
              </div>
            </motion.div>

            {/* Main Interactive Card */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-[0_24px_64px_rgba(15,23,42,0.08)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.4)] w-full max-w-md relative z-10 overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-1 text-lg">HSC Physics Full Course</h3>
                  <p className="text-xs font-medium text-slate-500">Dr. Kamal Hossain · 127 chapters</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Your Progress</span>
                  <span className="text-indigo-600 dark:text-indigo-400">72% Complete</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "72%" }}
                    transition={{ duration: 1.5, ease: "easeInOut" as any, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { name: "Newton's Laws of Motion", time: "32 min", status: "done" },
                  { name: "Waves & Oscillations", time: "41 min", status: "done" },
                  { name: "Thermodynamics Basics", time: "28 min", status: "active" },
                ].map((ch, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${ch.status === 'done' ? 'bg-emerald-50 dark:bg-emerald-900/10' : ch.status === 'active' ? 'bg-indigo-50 dark:bg-indigo-900/10' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${ch.status === 'done' ? 'bg-emerald-500 text-white' : ch.status === 'active' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {ch.status === 'done' ? '✓' : ch.status === 'active' ? '▶' : i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ch.name}</div>
                      <div className="text-[10px] font-medium text-slate-500">{ch.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ticker Feed */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700 flex items-center gap-3 overflow-hidden relative">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-ping absolute"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 relative z-10"></span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">Live</span>
                <div className="flex-1 overflow-hidden relative">
                  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-50 dark:from-slate-800 to-transparent z-10 pointer-events-none"></div>
                  <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 15, ease: "easeInOut" as any, repeat: Infinity }}
                    className="flex whitespace-nowrap gap-8"
                  >
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400"><strong>Arif</strong> just completed Chapter 3</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400"><strong>Fatema</strong> scored 95 in mock test</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400"><strong>Riya</strong> asked a question in forum</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400"><strong>Arif</strong> just completed Chapter 3</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400"><strong>Fatema</strong> scored 95 in mock test</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400"><strong>Riya</strong> asked a question in forum</span>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Floating Bottom Card */}
            <motion.div 
              animate={{ y: [8, -8, 8] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" as any, delay: 0.5 }}
              className="absolute -bottom-6 -left-6 md:-bottom-2 md:left-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-20 hidden sm:flex items-center gap-3"
            >
              <div className="text-3xl">🎓</div>
              <div>
                <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 leading-none mb-1">1,240</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Got admitted this month</div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
