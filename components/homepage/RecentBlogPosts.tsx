'use client';

import React, { useEffect, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, BookOpen, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  id: string;
  title: string;
  content_url: string;
  category: string;
  created_at: string;
  seo_description: string;
  content_body: string;
  badgeTitle?: string;
  link?: string;
}

interface RecentBlogPostsProps {
  blogs: BlogPost[];
}

export default function RecentBlogPosts({ blogs }: RecentBlogPostsProps) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [activeFilter, setActiveFilter] = useState('All Courses');
  const filters = ['All Courses', 'SSC', 'HSC', 'University Admission', 'BCS / Job Prep', 'Medical'];

  // For demonstration, we just use the provided blogs. 
  // In a real scenario, you'd filter the blogs based on activeFilter.
  const displayBlogs = blogs.slice(0, 6);

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

  return (
    <section className="py-24 md:py-32 bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide mb-4 shadow-sm">
                Latest Articles
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                Read our latest <br /> blog posts & insights
              </h2>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl font-bold text-sm hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group">
                Browse all posts <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 mb-12">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all border-2 ${
                  activeFilter === filter
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {filter}
              </button>
            ))}
          </motion.div>

          {/* Grid */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {displayBlogs.map((blog, i) => {
                
                // Color variations based on index for the thumbnail backgrounds
                const colors = [
                  'from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30',
                  'from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30',
                  'from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30',
                  'from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30',
                  'from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/30',
                  'from-purple-50 to-fuchsia-50 dark:from-purple-900/30 dark:to-fuchsia-900/30',
                ];
                const bgColors = colors[i % colors.length];

                return (
                  <motion.article
                    key={blog.id}
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-[0_24px_64px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_24px_64px_rgba(0,0,0,0.4)] hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:-translate-y-2 transition-all duration-300 flex flex-col"
                  >
                    <div className={`h-[200px] relative overflow-hidden bg-gradient-to-br ${bgColors} flex items-center justify-center`}>
                      {blog.content_url ? (
                        <Image
                          src={blog.content_url}
                          alt={blog.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-5xl group-hover:scale-110 transition-transform duration-500">
                          {i % 2 === 0 ? '📖' : '✍️'}
                        </div>
                      )}
                      
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm text-slate-900 dark:text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50 tracking-wide uppercase">
                          {blog.badgeTitle || blog.category || 'General'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 rounded-md">
                          Blog Post
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(blog.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {blog.title}
                      </h3>

                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-6 flex-1">
                        {blog.seo_description || (blog.content_body ? blog.content_body.replace(/<[^>]+>/g, "").substring(0, 100) : '')}
                      </p>

                      <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <Link href={blog.link || `/blog/${blog.id}`} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 group/link">
                          Read article
                          <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
