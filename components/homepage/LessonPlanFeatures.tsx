'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { PlayCircle, Video, PenTool, Users, Calendar, BarChart3, FileText, MessageSquare } from 'lucide-react';

export default function LessonPlanFeatures() {
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
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } },
  };

  const features = [
    {
      title: "Comprehensive Lecture Notes",
      desc: "Get access to detailed, beautifully crafted lecture sheets and notes for every single chapter to accelerate your revision.",
      badge: "Most Popular",
      badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      icon: FileText,
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    },
    {
      title: "Recorded Courses",
      desc: "500+ structured video courses you can watch anytime, rewind as much as you need, at your own pace.",
      badge: "New content weekly",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      icon: Video,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      title: "Practice Tests",
      desc: "Exam-simulation MCQs, board-format tests, and timed mock exams with instant feedback and score breakdowns.",
      badge: "Board-pattern updated",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      icon: PenTool,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      title: "Interactive Discussion Forums",
      desc: "Stuck on a problem? Post it in our community forums and get instant help from peers and expert moderators.",
      badge: "Highly Active",
      badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      icon: MessageSquare,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
      title: "AI Study Planner",
      desc: "Tell it your exam date and current level — it builds a realistic, day-by-day study schedule tailored to your goal.",
      badge: "Beta · Free for all",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      icon: Calendar,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      title: "Progress Tracking",
      desc: "Visual dashboards, chapter completion rates, mock test history, and weekly performance insights — all in one place.",
      badge: "New dashboard coming",
      badgeColor: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      icon: BarChart3,
      color: "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900/20 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wide mb-6 shadow-sm">
              Everything you need
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
              Built for how students <br /> actually learn
            </h2>
            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
              Six tools designed around real student behavior — not just a feature list, a complete learning ecosystem.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 hover:shadow-[0_10px_32px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_10px_32px_rgba(0,0,0,0.4)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mb-6 group-hover:scale-110 transition-transform duration-300 ${feat.color}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{feat.title}</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                    {feat.desc}
                  </p>
                  
                  <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase mt-auto ${feat.badgeColor}`}>
                    {feat.badge}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
