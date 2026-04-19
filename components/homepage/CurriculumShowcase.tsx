'use client';

import React from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Briefcase, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Layout,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface CurriculumShowcaseProps {
  isLoggedIn: boolean;
}

const CurriculumShowcase = ({ isLoggedIn }: CurriculumShowcaseProps) => {
  const categories = [
    {
      title: "School (Class 9-10)",
      items: ["SSC Complete Support", "Foundation Materials", "Board Paper Solutions"],
      icon: Layout,
      color: "from-blue-500 to-indigo-600",
      link: "/curriculum?segment=school",
      delay: "0"
    },
    {
      title: "College (HSC)",
      items: ["HSC Specialized Prep", "Test Paper Guides", "Step-by-Step Solutions"],
      icon: GraduationCap,
      color: "from-indigo-600 to-purple-600",
      link: "/curriculum?segment=college",
      delay: "100"
    },
    {
      title: "University Admission",
      items: ["DU, BUET & Medical Prep", "Unit-wise Master Plans", "Strategic Entry Guides"],
      icon: BookOpen,
      color: "from-purple-600 to-pink-600",
      link: "/curriculum?segment=university-admission",
      delay: "200"
    },
    {
      title: "Career Goals",
      items: ["BCS & Bank Jobs", "Job Search Preparation", "Professional Growth Paths"],
      icon: Briefcase,
      color: "from-pink-600 to-rose-600",
      link: "/curriculum?segment=job-prep",
      delay: "300"
    }
  ];

  return (
    <section id="curriculum-map" className="py-16 md:py-32 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/4"></div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2.5 md:gap-3 px-4 md:px-6 py-1.5 md:py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-[10px] md:text-xs font-bold tracking-wide mb-8 md:mb-10 shadow-sm">
            <Sparkles className="w-3.5 md:w-4 h-3.5 md:h-4 text-indigo-500" />
            The Learning Path Crafted for You
          </div>
          <h2 className="text-3xl md:text-7xl font-bold text-slate-900 dark:text-white leading-[1.1] md:leading-[1] tracking-tight mb-6 md:mb-10">
            A clear path for every <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">student's journey.</span>
          </h2>
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto opacity-80">
            We provide structured roadmaps for every academic stage. From your first steps in Class 9 to landing your dream career, we're with you all the way.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Main Academic Cards (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {categories.slice(0, 2).map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={idx} 
                  href={cat.link}
                  className="group relative bg-slate-50 dark:bg-slate-900/50 rounded-3xl md:rounded-[3rem] p-8 md:p-12 hover:bg-white dark:hover:bg-slate-900 border border-transparent dark:border-white/5 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all duration-700 hover:-translate-y-2 flex flex-col shadow-sm hover:shadow-2xl overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                  
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-8 md:mb-10 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700`}>
                    <Icon className="w-7 h-7 md:w-8 md:h-8" />
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6 tracking-tight leading-tight">{cat.title}</h3>
                  <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
                    Comprehensive study materials and strategic archives tailored for {cat.title.toLowerCase()}.
                  </p>
                  
                  <div className="mt-auto flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800 group-hover:bg-indigo-600/30 transition-all"></div>
                    <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-2 transition-transform duration-500" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Secondary Cards (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
             {categories.slice(2, 4).map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={idx} 
                  href={cat.link}
                  className="group relative flex items-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl md:rounded-[3rem] p-8 md:p-10 hover:bg-white dark:hover:bg-slate-900 border border-transparent dark:border-white/5 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all duration-700 hover:-translate-y-2 shadow-sm hover:shadow-2xl overflow-hidden"
                >
                  <div className={`w-14 h-14 md:w-20 md:h-20 shrink-0 rounded-2xl md:rounded-[2rem] bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 dark:text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700`}>
                    <Icon className="w-7 h-7 md:w-9 md:h-9" />
                  </div>
                  <div className="ml-6 md:ml-10 flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{cat.title}</h3>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed opacity-80">Paths to {cat.title.toLowerCase()} entry and growth.</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-800 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-2 transition-all duration-500" />
                </Link>
              );
            })}
          </div>
        </div>

        {isLoggedIn && (
          <div className="mt-16 md:mt-32 pt-10 md:pt-16 border-t border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 bg-slate-50 dark:bg-slate-900/50 p-8 md:p-12 rounded-3xl md:rounded-[4rem] border dark:border-white/5">
            <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8">
              <div className="flex -space-x-4 md:-space-x-5">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[2.5rem] border-2 md:border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl">
                    <img src={`https://i.pravatar.cc/100?img=${i + 30}`} alt="participant" className="object-cover w-full h-full" />
                  </div>
                ))}
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[2.5rem] border-2 md:border-4 border-white dark:border-slate-900 bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-2xl shadow-indigo-600/30">+12k</div>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-1 md:mb-2">Verified Student Community</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Join thousands of students on their journey to excellence.</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 md:gap-6">
              <Link href="/student/dashboard" className="px-8 md:px-12 py-4 md:py-5 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all shadow-2xl shadow-indigo-600/20 active:scale-95 duration-300">
                Open My Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CurriculumShowcase;
