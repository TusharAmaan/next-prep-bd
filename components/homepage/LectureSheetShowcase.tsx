'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HelpCircle, Clock, CheckCircle, Search, Send, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface LectureSheetShowcaseProps {
  isLoggedIn: boolean;
}

const LectureSheetShowcase = ({ isLoggedIn }: LectureSheetShowcaseProps) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" as any} },
  };

  const flowSteps = [
    {
      icon: HelpCircle,
      title: "Tell us what you're looking for",
      desc: "Send us the topic or subject names you need. Our system logs your request instantly.",
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    },
    {
      icon: Clock,
      title: "Team starts preparation",
      desc: "Qualified educators and subject experts craft the highest quality materials for your journey.",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      icon: CheckCircle,
      title: "Ready for your studies",
      desc: "Your custom materials are uploaded and ready for download within 24 hours.",
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-slate-900 text-white relative overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center"
        >
          {/* Left: Content */}
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-12">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-xs font-bold tracking-wide mb-6">
                Study Library on Demand
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight text-white">
                Can't find a study sheet? <br className="hidden lg:block"/>
                <span className="text-indigo-400">We'll prepare it.</span>
              </h2>
              <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-lg">
                Our team ensures you never fall behind. If a specific topic is missing, just let us know and we'll have it ready within 24 hours.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400 border border-white/10">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">Quick Search</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Browse thousands of pre-verified materials.</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-purple-400 border border-white/10">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">Request Anytime</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Tell us what you need, we'll add it.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link href={isLoggedIn ? "/feedback" : "/signup"} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group">
                Submit a Request <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/curriculum" className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center">
                Browse Library
              </Link>
            </div>
          </motion.div>

          {/* Right: The Interactive "Flow" Graphic */}
          <motion.div variants={itemVariants} className="lg:col-span-7 relative">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none"></div>

              <div className="space-y-12 relative z-10">
                {flowSteps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="relative group">
                      <div className="flex gap-6 md:gap-8">
                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${step.color} transition-transform duration-300 group-hover:scale-110 relative z-10`}>
                          <Icon className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div className="pt-2">
                          <h4 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">{step.title}</h4>
                          <p className="text-slate-400 text-sm leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                      
                      {/* Connecting Line */}
                      {idx !== flowSteps.length - 1 && (
                        <div className="absolute left-7 md:left-8 top-16 w-px h-[calc(100%+16px)] bg-slate-700/50 z-0">
                           <div className="w-full h-1/2 bg-gradient-to-b from-indigo-500 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default LectureSheetShowcase;
