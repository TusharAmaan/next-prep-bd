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
  Layout
} from 'lucide-react';
import Link from 'next/link';

interface CurriculumShowcaseProps {
  isLoggedIn: boolean;
}

const CurriculumShowcase = ({ isLoggedIn }: CurriculumShowcaseProps) => {
  const categories = [
    {
      title: "School (Class 9-10)",
      items: ["SSC All Groups", "Science & Arts Notes", "Board Question Banks"],
      icon: Layout,
      color: "from-blue-500 to-indigo-600",
      link: "/curriculum?segment=school",
      delay: "0"
    },
    {
      title: "College (HSC)",
      items: ["HSC Specialized Prep", "Test Paper Solutions", "Engineering/Varsity Base"],
      icon: GraduationCap,
      color: "from-indigo-600 to-purple-600",
      link: "/curriculum?segment=college",
      delay: "100"
    },
    {
      title: "Univ. Admission",
      items: ["DU, BUET, Medical", "IBA & MBA Paths", "Unit-wise Suggestions"],
      icon: BookOpen,
      color: "from-purple-600 to-pink-600",
      link: "/curriculum?segment=university-admission",
      delay: "200"
    },
    {
      title: "Professional Skills",
      items: ["Job Preparation", "BCS & Bank Jobs", "NTRCA Guideline"],
      icon: Briefcase,
      color: "from-pink-600 to-rose-600",
      link: "/curriculum?segment=job-prep",
      delay: "300"
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Curriculum Ecosystem
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight mb-8">
            A Fully <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Structured</span> Learning Journey.
          </h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            We don't just provide notes; we provide a roadmap. From Class 9 to Job Preparation, our curriculum is meticulously structured for every stage of your academic life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, idx) => (
            <div 
              key={idx} 
              className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 hover:-translate-y-2 flex flex-col"
              style={{ animationDelay: `${cat.delay}ms` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                <cat.icon className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-6 group-hover:text-blue-600 transition-colors">{cat.title}</h3>
              
              <ul className="space-y-4 mb-8 flex-1">
                {cat.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link 
                href={cat.link}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 hover:text-blue-600 transition-colors group/btn"
              >
                Explore Plans
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-12 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-8 bg-slate-50/50 p-10 rounded-[3rem]">
          <div className="flex items-center gap-6">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="student" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">+5k</div>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Trusted by Thousands</p>
              <p className="text-xs text-slate-500 font-bold">Join our growing ecosystem of candidates.</p>
            </div>
          </div>

          <div className="flex gap-4">
            {isLoggedIn ? (
              <Link href="/student/dashboard" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/signup" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl active:scale-95 shadow-blue-200">
                  Join Now
                </Link>
                <Link href="/curriculum" className="px-10 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all active:scale-95">
                  Learn More
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
