'use client';

import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function StatsSection() {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" as any} },
  };

  const stats = [
    { num: "50,000", suffix: "+", label: "Students Enrolled", sub: "Across all programs" },
    { num: "500", suffix: "+", label: "Expert Courses", sub: "SSC · HSC · Admission · BCS" },
    { num: "95", suffix: "%", label: "Satisfaction Rate", sub: "Based on 12,000 reviews" },
    { num: "1,000", suffix: "+", label: "Success Stories", sub: "DU · BUET · Medical admitted" },
  ];

  return (
    <section className="py-16 md:py-20 border-y border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 divide-x-0 lg:divide-x divide-slate-100 dark:divide-slate-800"
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className="flex flex-col items-center text-center px-4">
              <div className="text-4xl md:text-[2.5rem] font-extrabold tracking-tight text-slate-900 dark:text-white leading-none mb-2">
                {stat.num}<span className="text-indigo-600 dark:text-indigo-400">{stat.suffix}</span>
              </div>
              <div className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-300 mb-1">{stat.label}</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.sub}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
