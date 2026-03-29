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
      title: "Discovery (Class 9-10)",
      items: ["SSC All Groups", "Science & Arts Journals", "Board Archive Solutions"],
      icon: Layout,
      color: "from-blue-500 to-indigo-600",
      link: "/curriculum?segment=school",
      delay: "0"
    },
    {
      title: "Academy (HSC)",
      items: ["HSC Specialized Prep", "Test Paper Intelligence", "Engineering/Varsity Track"],
      icon: GraduationCap,
      color: "from-indigo-600 to-purple-600",
      link: "/curriculum?segment=college",
      delay: "100"
    },
    {
      title: "University Entry",
      items: ["DU, BUET, Medical", "IBA & MBA Professional", "Unit-wise Strategic Plans"],
      icon: BookOpen,
      color: "from-purple-600 to-pink-600",
      link: "/curriculum?segment=university-admission",
      delay: "200"
    },
    {
      title: "Career Evolution",
      items: ["Job Preparation", "BCS & Bank Professional", "NTRCA Strategic Roadmap"],
      icon: Briefcase,
      color: "from-pink-600 to-rose-600",
      link: "/curriculum?segment=job-prep",
      delay: "300"
    }
  ];

  return (
    <section className="py-32 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/4"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-24">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-sm">
            <Sparkles className="w-4 h-4" />
            Curriculum Ecosystem
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter mb-10 uppercase">
            A Fully <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Structured</span> Learning Map.
          </h2>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
            We provide precision roadmaps for every academic stage. From Class 9 discovery to professional career evolution, our curriculum is engineered for excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div 
                key={idx} 
                className="group relative bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 hover:shadow-2xl dark:hover:shadow-indigo-900/20 transition-all duration-700 hover:-translate-y-3 flex flex-col"
              >
                <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-10 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700`}>
                  <Icon className="w-10 h-10" />
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tighter leading-none">{cat.title}</h3>
                
                <ul className="space-y-5 mb-12 flex-1">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs font-black text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors uppercase tracking-widest leading-loose">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link 
                  href={cat.link}
                  className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group/btn group-hover:translate-x-2 duration-500"
                >
                  Explore Strategies
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-32 pt-16 border-t border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-12 bg-slate-50 dark:bg-slate-900/50 p-12 rounded-[4rem] border dark:border-white/5">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="flex -space-x-5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-16 h-16 rounded-[2.5rem] border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl">
                  <img src={`https://i.pravatar.cc/100?img=${i + 30}`} alt="participant" className="object-cover w-full h-full" />
                </div>
              ))}
              <div className="w-16 h-16 rounded-[2.5rem] border-4 border-white dark:border-slate-900 bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-2xl shadow-indigo-600/30">+12k</div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">Verified Academic Community</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em]">Join the revolutionary learning ecosystem.</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {isLoggedIn ? (
              <Link href="/student/dashboard" className="px-12 py-5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20 active:scale-95 duration-300">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/signup" className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 duration-300">
                  Acknowledge & Join
                </Link>
                <Link href="/curriculum" className="px-12 py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95 duration-300">
                  Research Plans
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurriculumShowcase;
