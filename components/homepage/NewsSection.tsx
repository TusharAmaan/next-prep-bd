'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Newspaper, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface NewsItem {
  id: string;
  title: string;
  content_url: string;
  category: string;
  created_at: string;
  seo_description: string;
  content_body: string;
  badgeTitle?: string;
}

interface NewsSectionProps {
  news: NewsItem[];
}

export default function NewsSection({ news }: NewsSectionProps) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const displayNews = news.slice(0, 3); // Only show top 3 on homepage

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" as any} },
  };

  if (!displayNews.length) return null;

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/30 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold tracking-wide mb-4 shadow-sm">
                <Newspaper className="w-3.5 h-3.5" /> Notice Board
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                Latest updates & <br /> educational news
              </h2>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link href="/news" className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl font-bold text-sm hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group">
                All news <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Grid */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {displayNews.map((item, i) => (
                <motion.article
                  key={item.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-[0_24px_64px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_24px_64px_rgba(0,0,0,0.4)] hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:-translate-y-2 transition-all duration-300 flex flex-col"
                >
                  <div className={`h-[200px] relative overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center`}>
                    {item.content_url ? (
                      <Image
                        src={item.content_url}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-5xl group-hover:scale-110 transition-transform duration-500 text-slate-300 dark:text-slate-700">
                        <Newspaper className="w-16 h-16" />
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg shadow-sm tracking-wide uppercase">
                        {item.badgeTitle || item.category || 'News'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(item.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-6 flex-1">
                      {item.seo_description || (item.content_body ? item.content_body.replace(/<[^>]+>/g, "").substring(0, 100) : '')}
                    </p>

                    <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <Link href={`/news/${item.id}`} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 group/link">
                        Read more
                        <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
