'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BookOpen, GraduationCap, Briefcase, Layout, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CurriculumShowcaseProps {
  isLoggedIn: boolean;
}

const CurriculumShowcase = ({ isLoggedIn }: CurriculumShowcaseProps) => {
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
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" as any} },
  };

  const categories = [
    {
      title: "School (Class 9-10)",
      desc: "Comprehensive study materials and strategic archives tailored for school.",
      icon: Layout,
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
      link: "/curriculum?segment=school",
      main: true,
    },
    {
      title: "College (HSC)",
      desc: "Comprehensive study materials and strategic archives tailored for college.",
      icon: GraduationCap,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20",
      link: "/curriculum?segment=college",
      main: true,
    },
    {
      title: "University Admission",
      desc: "Paths to university admission entry and growth.",
      icon: BookOpen,
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
      link: "/curriculum?segment=university-admission",
      main: false,
    },
    {
      title: "Career Goals",
      desc: "Paths to career goals entry and growth.",
      icon: Briefcase,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
      link: "/curriculum?segment=job-prep",
      main: false,
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="flex flex-col items-center"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center max-w-3xl mb-16 md:mb-24">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold tracking-wide mb-6">
              The Learning Path Crafted for You
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
              A clear path for every <span className="text-indigo-600 dark:text-indigo-400">student's journey.</span>
            </h2>
            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
              Structured roadmaps for every academic stage. From your first steps in Class 9 to landing your dream career, we're with you all the way.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
            {/* Main Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {categories.filter(c => c.main).map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <motion.div key={idx} variants={itemVariants}>
                    <Link 
                      href={cat.link}
                      className="group block h-full bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] hover:-translate-y-2 flex flex-col relative overflow-hidden"
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white ${cat.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">{cat.title}</h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                        {cat.desc}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                          Explore path
                        </span>
                        <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Secondary Cards */}
            <div className="lg:col-span-5 flex flex-col gap-8">
               {categories.filter(c => !c.main).map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <motion.div key={idx} variants={itemVariants} className="flex-1">
                    <Link 
                      href={cat.link}
                      className="group flex items-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 h-full"
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-slate-800 group-hover:text-white ${cat.color}`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="ml-6 flex-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{cat.title}</h3>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{cat.desc}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-300" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Social Proof Bar */}
          {isLoggedIn && (
            <motion.div variants={itemVariants} className="mt-20 w-full">
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 flex items-center justify-center overflow-hidden">
                        <Image src={`https://i.pravatar.cc/100?img=${i + 30}`} alt="participant" width={48} height={48} className="object-cover w-full h-full" />
                      </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white z-10">+12k</div>
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-1">Verified Student Community</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Join thousands of students on their journey.</p>
                  </div>
                </div>
                <Link href="/student/dashboard" className="w-full md:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 active:scale-95 text-center shadow-lg">
                  Open My Dashboard
                </Link>
              </div>
            </motion.div>
          )}

        </motion.div>
      </div>
    </section>
  );
};

export default CurriculumShowcase;
