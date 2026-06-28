'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function TutorPromoSection() {
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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" as any} },
  };

  const benefits = [
    "Personalized 1-on-1 mentoring",
    "Verified experts from BUET, DU & Medical",
    "Custom study schedules",
    "Doubt solving on demand",
  ];

  return (
    <section className="py-20 md:py-32 bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="bg-indigo-600 dark:bg-indigo-900 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-16 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 shadow-2xl shadow-indigo-600/20"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-indigo-400 opacity-20 rounded-full blur-3xl mix-blend-screen"></div>
          </div>

          <motion.div variants={itemVariants} className="lg:w-1/2 relative z-10 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-xs font-bold tracking-wide mb-6 backdrop-blur-sm">
                <Users className="w-3.5 h-3.5" /> Premium Mentorship
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                Learn with <br /> Expert Mentors
              </h2>
            </div>
            
            <p className="text-indigo-100/90 text-base md:text-lg font-medium leading-relaxed max-w-lg">
              Get personalized guidance, clear your doubts, and build a winning strategy with top educators who have already walked the path to success.
            </p>

            <ul className="space-y-3">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-3 text-indigo-50 font-medium text-sm md:text-base">
                  <CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Link href="/find-tutor" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 group">
                Find a mentor <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:w-1/2 relative z-10 w-full flex justify-center lg:justify-end">
             <div className="relative w-full max-w-md aspect-square">
               {/* Decorative avatars around a central circle */}
               <div className="absolute inset-0 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                 <div className="w-[70%] h-[70%] bg-white/10 rounded-full border border-white/10 flex items-center justify-center">
                    <div className="w-[50%] h-[50%] bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                      <div className="text-center">
                        <div className="text-3xl font-extrabold text-white leading-none">80+</div>
                        <div className="text-xs font-bold text-indigo-200 mt-1 uppercase tracking-wider">Mentors</div>
                      </div>
                    </div>
                 </div>
               </div>

               {/* Avatars */}
               {[
                 { top: '0%', left: '50%', delay: 0 },
                 { top: '25%', left: '85%', delay: 0.1 },
                 { top: '75%', left: '85%', delay: 0.2 },
                 { top: '100%', left: '50%', delay: 0.3 },
                 { top: '75%', left: '15%', delay: 0.4 },
                 { top: '25%', left: '15%', delay: 0.5 },
               ].map((pos, idx) => (
                 <motion.div
                   key={idx}
                   initial={{ opacity: 0, scale: 0 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.5 + pos.delay, duration: 0.5, type: 'spring' }}
                   className="absolute w-16 h-16 rounded-2xl bg-white p-1 shadow-xl -translate-x-1/2 -translate-y-1/2"
                   style={{ top: pos.top, left: pos.left }}
                 >
                   <div className="w-full h-full rounded-xl overflow-hidden bg-slate-200">
                     <Image src={`https://i.pravatar.cc/150?img=${idx + 10}`} alt="Mentor" width={64} height={64} className="object-cover w-full h-full" />
                   </div>
                 </motion.div>
               ))}
             </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
