import { Metadata } from "next";
import { Briefcase, Rocket, Star, Heart, Zap, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the NextPrepBD team and help us redefine education in Bangladesh. Explore opportunities for passionate educators and engineers.",
  alternates: {
    canonical: "/careers",
  },
};

export default function CareersPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Careers at NextPrepBD",
    "description": "Information about career opportunities and core values at NextPrepBD.",
    "publisher": {
      "@type": "Organization",
      "name": "NextPrepBD",
      "logo": "https://nextprepbd.com/icon.png"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pt-28 pb-20 overflow-hidden transition-colors duration-300">
        
        {/* BACKGROUND ACCENTS */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[5%] left-[-5%] w-[30%] h-[30%] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          
          {/* HERO */}
          <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider mb-6 border border-indigo-200 dark:border-indigo-800">
              <Rocket className="w-3.5 h-3.5" /> Shape the Future of Learning
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight uppercase">
              Build something <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-300% animate-gradient">truly meaningful.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
               We are opted to create career opportunities here as well. <br/>
               Soon, we'll be looking for passionate educators, engineers, and designers to join our growing team.
            </p>
          </div>

          {/* CORE VALUES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
              {[
                  { icon: Star, title: "Excellence", desc: "We push boundaries and set new standards in educational technology.", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
                  { icon: Heart, title: "Student-First", desc: "Every decision we make starts with how it benefits the students of Bangladesh.", color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
                  { icon: Zap, title: "Innovation", desc: "We embrace messy problems and solve them with elegant, scalable solutions.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" }
              ].map((value, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl dark:hover:shadow-indigo-900/10 hover:-translate-y-2 transition-all duration-500 group">
                      <div className={`w-16 h-16 ${value.bg} ${value.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm`}>
                          <value.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">{value.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{value.desc}</p>
                  </div>
              ))}
          </div>

          {/* CTA CARD */}
          <div className="bg-slate-900 dark:bg-slate-900/80 border border-slate-800 rounded-[3.5rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
              {/* Decorative Blobs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                  <div className="max-w-xl">
                      <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight leading-tight">Don't wait for <br/> a job posting.</h2>
                      <p className="text-indigo-100/70 text-lg mb-8 font-medium">
                          If you believe you have what it takes to transform education in Bangladesh, we’d love to hear from you today.
                      </p>
                      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                          <Link 
                              href="mailto:nextprepbd@gmail.com" 
                              className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-xl hover:scale-105 active:scale-95"
                          >
                              <Mail className="w-4 h-4" /> Send Your CV
                          </Link>
                          <Link href="/about" className="bg-slate-800 text-white border border-slate-700 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center">
                              Our Story
                          </Link>
                      </div>
                  </div>
                  
                  <div className="shrink-0">
                      <div className="w-56 h-56 rounded-[3.5rem] bg-indigo-600/20 border border-white/10 flex items-center justify-center backdrop-blur-3xl animate-float">
                          <Briefcase className="w-24 h-24 text-indigo-400 opacity-60" />
                      </div>
                  </div>
              </div>
          </div>

          {/* FOOTER NOTE */}
          <div className="mt-20 text-center">
              <p className="text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">NextPrepBD Engineering & Product</p>
          </div>

        </div>
      </div>
    </>
  );
}