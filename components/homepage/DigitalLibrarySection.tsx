'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BookOpen, ArrowRight, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Ebook {
  id: string;
  title: string;
  author: string;
  cover_url?: string;
  category: string;
  created_at: string;
}

interface DigitalLibrarySectionProps {
  ebooks: Ebook[];
}

export default function DigitalLibrarySection({ ebooks }: DigitalLibrarySectionProps) {
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" as any} },
  };

  // Only display the top 4 ebooks
  const displayEbooks = ebooks.slice(0, 4);

  return (
    <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900/30 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 lg:p-16 shadow-[0_24px_64px_rgba(15,23,42,0.06)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.3)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <motion.div variants={itemVariants} className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 text-purple-600 dark:text-purple-400 text-xs font-bold tracking-wide mb-6">
                <BookOpen className="w-3.5 h-3.5" /> Digital Library
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
                Download premium <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">eBooks & Guides</span>.
              </h2>
              <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
                Access our collection of carefully crafted ebooks, formula sheets, and exam strategy guides to boost your preparation.
              </p>
              
              <Link href="/ebooks" className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-[0_8px_32px_rgba(147,51,234,0.25)] hover:shadow-[0_12px_40px_rgba(147,51,234,0.35)] hover:-translate-y-0.5 active:scale-95 group">
                Browse Library <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Right Content - Ebook Grid */}
            <motion.div variants={itemVariants} className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {displayEbooks.map((book) => (
                <Link key={book.id} href={`/ebooks/${book.id}`} className="group flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-transparent hover:border-purple-200 dark:hover:border-purple-900/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all duration-300">
                  <div className="w-16 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0 relative shadow-sm group-hover:shadow-md transition-shadow">
                    {book.cover_url ? (
                       <Image src={book.cover_url} alt={book.title} fill className="object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 text-purple-600 dark:text-purple-400">
                          <FileText className="w-6 h-6" />
                       </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-1">
                      {book.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mb-2">
                      By {book.author || 'NextPrepBD'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                        {book.category}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors shrink-0 shadow-sm">
                    <Download className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
