'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Sparkles, ArrowRight, Zap, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Thread {
  id: string;
  title: string;
  created_at: string;
  upvotes: number;
  views: number;
  difficulty: string;
  segment?: any;
  author?: any;
  forum_comments?: any[];
}

interface CommunityForumSectionProps {
  threads: Thread[];
}

export default function CommunityForumSection({ threads }: CommunityForumSectionProps) {
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" as any} },
  };

  return (
    <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900/10 border-y border-slate-100 dark:border-slate-800/50 transition-colors duration-500 overflow-hidden relative">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <motion.div variants={itemVariants} className="max-w-2xl">
              <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                NextPrepBD Community Hub
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Join our active <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">discussion forum</span>.
              </h2>
              <p className="mt-6 text-slate-500 dark:text-slate-400 text-base md:text-lg font-medium leading-relaxed">
                Learn with fellow students, solve hard questions together, and share expert study strategies.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Link href="/forum" className="group inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-[0_8px_32px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_40px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 active:scale-95">
                Go to Forum <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {threads.map((thread, idx) => {
              const commentCount = thread.forum_comments?.length || 0;
              
              // Map difficulty to specific colors
              let diffColor = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
              if (thread.difficulty === 'hard') diffColor = "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
              if (thread.difficulty === 'medium') diffColor = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
              if (thread.difficulty === 'easy') diffColor = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";

              return (
                <motion.div key={thread.id} variants={itemVariants} className="h-full">
                  <Link href={`/forum/thread/${thread.id}`} className="group block h-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 rounded-3xl p-8 hover:shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-6 flex-wrap">
                        {thread.segment && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md">
                            {thread.segment.title}
                          </span>
                        )}
                        {thread.difficulty && (
                          <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-md ${diffColor}`}>
                            {thread.difficulty}
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-3 mb-8">
                        {thread.title}
                      </h4>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                          {thread.author?.full_name ? thread.author.full_name.charAt(0) : 'A'}
                        </div>
                        <span className="truncate max-w-[100px] text-slate-700 dark:text-slate-300">
                          {thread.author?.full_name || 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          <Zap className="w-3.5 h-3.5" />
                          {thread.upvotes}
                        </span>
                        <span className="flex items-center gap-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {commentCount}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
