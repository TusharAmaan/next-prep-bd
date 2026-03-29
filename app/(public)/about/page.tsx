import Link from "next/link";
import { Metadata } from 'next';
import { 
  Sparkles, 
  Rocket, 
  Target, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  MessageSquare, 
  Layout, 
  Users, 
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Globe,
  Star,
  GraduationCap,
  History,
  CheckCircle2,
  Lock,
  Flag
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our Mission & Vision | NextPrepBD",
  description: "Learn about NextPrepBD's commitment to revolutionizing education in Bangladesh. Discover how we're building a high-performance platform to help candidates achieve their academic goals.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  const stats = [
    { label: "Active Students", value: "15,000+", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Academic Resources", value: "5,200+", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Expert Mentors", value: "120+", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Content Accuracy", value: "99.9%", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const pillars = [
    {
      title: "Strategic Learning",
      desc: "Precision-designed lesson plans for SSC, HSC, and University Admissions.",
      icon: Layout,
    },
    {
      title: "Student Support Hub",
      desc: "On-demand resource generation. Request any material and receive it within 24 hours.",
      icon: MessageSquare,
    },
    {
      title: "Verified Archives",
      desc: "Comprehensive question banks with 100% expert-verified solutions.",
      icon: Flag,
    },
    {
      title: "Expert Mentorship",
      desc: "Direct guidance from top-tier university scholars and professional educators.",
      icon: GraduationCap,
    },
    {
      title: "Progress Tracking",
      desc: "Track your educational progress with advanced diagnostic dashboards.",
      icon: Zap,
    }
  ];

  const audiences = [
    { name: "Secondary / Higher", desc: "Board-level preparation for Class 9-12", link: "/resources/ssc" },
    { name: "University Admission", desc: "DU, BUET, Medical & Foreign University entry", link: "/resources/university-admission" },
    { name: "Job Preparation", desc: "BCS, Bank & Government sector preparation", link: "/resources/job-prep" }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "NextPrepBD",
      "description": "Bangladesh's leading education portal providing curated resources for students and candidates.",
      "url": "https://nextprepbd.com",
      "logo": "https://nextprepbd.com/icon.png",
      "foundingDate": "2024",
      "sameAs": [
        "https://www.facebook.com/nextprepbd",
        "https://www.youtube.com/@nextprepbd"
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-white dark:bg-slate-950 font-sans transition-colors duration-500 overflow-x-hidden">
        
        {/* 1. HERO SECTION */}
        <section className="relative pt-32 pb-20 md:pt-60 md:pb-48 px-4 md:px-6 overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[150px] -mr-40 -mt-40 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-cyan-600/5 dark:bg-cyan-600/10 rounded-full blur-[150px] -ml-40 -mb-40 animate-pulse"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-900 text-white dark:bg-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-8 md:mb-12 shadow-2xl">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Leading Educational Hub
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-8xl font-bold text-slate-900 dark:text-white mb-8 md:mb-10 tracking-tight leading-[1] md:leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  Engineering the <br className="hidden md:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500">
                    Future of Learning.
                  </span>
                </h1>
                
                <p className="text-lg md:text-2xl text-slate-500 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed mb-12 md:mb-16 font-medium opacity-80">
                  NextPrepBD is more than a resource center. We are a high-performance educational ecosystem 
                  dedicated to helping every student achieve academic excellence with precision.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                  <Link href="/" className="w-full sm:w-auto group px-12 py-5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl md:rounded-[2rem] font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all shadow-3xl active:scale-95 flex items-center justify-center gap-4">
                    Explore Resources <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <div className="flex items-center gap-3 md:gap-4 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                     <Users className="w-5 h-5 text-indigo-500" />
                     Trusted by 15,000+ Students
                  </div>
                </div>
            </div>
          </div>
        </section>

        {/* 2. STATS */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 relative z-20 -mt-12 md:-mt-24">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-none flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-500">
                   <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl ${stat.bg} dark:bg-slate-800 ${stat.color} dark:text-indigo-400 flex items-center justify-center mb-4 md:mb-6 shadow-inner transition-transform group-hover:scale-110`}>
                      <stat.icon className="w-6 h-6 md:w-8 md:h-8" />
                   </div>
                   <h3 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1 md:mb-2 tracking-tight">{stat.value}</h3>
                   <p className="text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">{stat.label}</p>
                </div>
              ))}
           </div>
        </section>

        {/* 3. CORE PILLARS */}
        <section className="py-24 md:py-44 max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 md:mb-24 gap-8 md:gap-12 text-center md:text-left">
            <div className="space-y-4">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Academic Framework</span>
              <h2 className="text-3xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1] md:leading-[0.9]">
                High-Quality <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Academic Grid.</span>
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md text-base md:text-xl leading-relaxed mx-auto md:mx-0 opacity-80">
                We've combined modern technology with expert teaching to build a resilient platform for your academic success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-2xl md:rounded-[3rem] border border-slate-100 dark:border-slate-800 hover:shadow-3xl dark:hover:shadow-indigo-900/10 hover:-translate-y-3 transition-all group flex flex-col">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 md:mb-10 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                   <pillar.icon className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:scale-110" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 md:mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight leading-tight">{pillar.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mb-6 md:mb-8 opacity-80">{pillar.desc}</p>
                <div className="mt-auto pt-4 md:pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                   <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600">Sector {idx + 1}</span>
                   <ChevronRight className="w-4 h-4 text-slate-200 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. THE NEXTPREP ADVANTAGE */}
        <section className="py-24 md:py-44 bg-slate-50 dark:bg-slate-900/30 relative border-y border-slate-100 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 items-center">
             <div className="space-y-8 md:space-y-12 text-center md:text-left">
                <div className="space-y-4">
                  <span className="text-amber-600 dark:text-amber-500 font-bold uppercase tracking-widest text-[10px]">What Sets Us Apart</span>
                  <h2 className="text-3xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1] md:leading-[0.9]">
                    Why NextPrep <br className="hidden md:block"/>
                    is Different.
                  </h2>
                </div>
                
                <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl mx-auto md:mx-0 opacity-80">
                   Unlike other sites, we focus purely on <span className="text-slate-900 dark:text-white font-bold underline decoration-indigo-500 decoration-2 md:decoration-4 underline-offset-4 md:underline-offset-8">Academic Excellence</span> and user experience.
                </p>

                <div className="grid grid-cols-1 gap-4 text-left">
                   {[
                     { t: "Focused Learning Environment", d: "Clean interface without intrusive ads. Focus 100% on your studies." },
                     { t: "Expert-Verified Content", d: "Resources are thoroughly vetted by expert educators before being published." },
                     { t: "Curriculum Map Alignment", d: "All resources are organized according to the national and global academic syllabi." }
                   ].map((adv, i) => (
                      <div key={i} className="flex gap-4 md:gap-6 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group hover:border-indigo-500/30 transition-all shadow-sm">
                         <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 md:mb-2 tracking-tight text-sm md:text-base">{adv.t}</h4>
                            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed opacity-70">{adv.d}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="relative group mt-12 lg:mt-0">
                <div className="absolute inset-0 bg-indigo-600/10 blur-[120px] rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl md:rounded-[4rem] p-8 md:p-12 shadow-3xl overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={200} /></div>
                   <div className="space-y-6 md:space-y-10">
                      <div className="bg-slate-950 rounded-2xl md:rounded-[3rem] p-10 md:p-12 text-center text-white relative overflow-hidden group/box">
                         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600 to-transparent opacity-20"></div>
                         <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 text-indigo-400">Our Vision</h4>
                         <p className="text-xl md:text-2xl font-bold tracking-tight leading-tight relative z-10">Revolutionizing <br/> Education in <br/> Bangladesh.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 md:gap-6">
                         <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800 rounded-2xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 text-center">
                            <History className="w-6 h-6 md:w-8 md:h-8 text-indigo-600 mx-auto mb-3 md:mb-4" />
                            <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-slate-400">Founded 2024</p>
                         </div>
                         <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800 rounded-2xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 text-center">
                            <Flag className="w-6 h-6 md:w-8 md:h-8 text-cyan-600 mx-auto mb-3 md:mb-4" />
                            <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-slate-400">Trusted Nationwide</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* 5. AUDIENCE CATEGORIES */}
        <section className="py-24 md:py-44 max-w-7xl mx-auto px-4 md:px-6 text-center">
           <h2 className="text-3xl md:text-7xl font-bold mb-16 md:mb-24 tracking-tight leading-tight md:leading-none text-slate-900 dark:text-white">Success for <br className="md:hidden"/> <span className="text-indigo-600 dark:text-indigo-400">Every Candidate.</span></h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              {audiences.map((aud, idx) => (
                <Link href={aud.link} key={idx} className="group">
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 md:p-12 rounded-3xl md:rounded-[3.5rem] h-full flex flex-col items-center hover:bg-slate-950 hover:text-white dark:hover:bg-indigo-600 transition-all duration-700 hover:-translate-y-4 shadow-xl dark:shadow-none group text-left sm:text-center">
                     <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-8 md:mb-10 shadow-inner group-hover:bg-white group-hover:text-indigo-600 transition-all duration-500 group-hover:scale-110">
                        <Users className="w-8 h-8 md:w-10 md:h-10" />
                     </div>
                     <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 tracking-tight leading-none">{aud.name}</h3>
                     <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-widest opacity-60 mb-8 md:mb-12 leading-relaxed">{aud.desc}</p>
                     <div className="mt-auto flex items-center gap-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-all">
                        Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
                </Link>
              ))}
           </div>
        </section>

        {/* 6. CALL TO ACTION */}
        <section className="py-24 md:py-44 px-4 md:px-6">
          <div className="max-w-7xl mx-auto bg-slate-900 dark:bg-indigo-600 rounded-[3rem] md:rounded-[5rem] p-10 md:p-32 text-white relative overflow-hidden shadow-3xl text-center group">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-20 pointer-events-none"></div>
             <div className="absolute bottom-0 right-0 p-20 opacity-5 group-hover:opacity-10 transition-opacity"><Rocket size={500} className="hidden md:block"/></div>
             
             <div className="relative z-10 max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-8xl font-bold mb-8 md:mb-10 leading-[1] md:leading-[0.9] tracking-tight">Join the Modern <br /> Learning Era.</h2>
                <p className="text-lg md:text-2xl text-indigo-100/70 font-medium mb-12 md:mb-16 leading-relaxed opacity-90">
                   Join over 15,000 students already using NextPrepBD to excel in their studies.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
                   <Link href="/signup" className="px-12 py-5 md:py-6 bg-white text-slate-900 rounded-2xl md:rounded-3xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-2xl">
                      Sign Up Now
                   </Link>
                   <Link href="/contact" className="px-12 py-5 md:py-6 bg-transparent border-2 border-white/20 text-white rounded-2xl md:rounded-3xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-4">
                      Contact Us <MessageSquare className="w-5 h-5" />
                   </Link>
                </div>
             </div>
          </div>
        </section>

      </div>
    </>
  );
}