'use client';

import Link from "next/link";
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
  Star
} from "lucide-react";

export default function AboutPage() {
  const stats = [
    { label: "Active Students", value: "15,000+", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Curated Resources", value: "5,200+", icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Expert Tutors", value: "120+", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Success Rate", value: "98%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const pillars = [
    {
      title: "Structured Curriculum",
      desc: "Step-by-step lesson plans for SSC, HSC, and Admission, ensuring you never miss a topic.",
      icon: Layout,
      color: "blue"
    },
    {
      title: "Lecture Sheets on Demand",
      desc: "Our unique Ask & Deliver system ensures you get the specific materials you need within 24 hours.",
      icon: MessageSquare,
      color: "indigo"
    },
    {
      title: "Verified Question Banks",
      desc: "10+ years of board and admission papers with accurate, expert-verified solutions.",
      icon: ShieldCheck,
      color: "emerald"
    },
    {
      title: "1-to-1 Mentorship",
      desc: "Connect with top university students and professional educators for personalized guidance.",
      icon: GraduationCap,
      color: "purple"
    },
    {
      title: "Real-time Progress",
      desc: "Track your preparation level with our integrated dashboard and performance analytics.",
      icon: Zap,
      color: "pink"
    }
  ];

  const audiences = [
    { name: "SSC & HSC", desc: "Board-focused prep for 9-12", link: "/resources/ssc" },
    { name: "Admission", desc: "DU, BUET, Medical & IBA prep", link: "/resources/university-admission" },
    { name: "Job Preparation", desc: "BCS, Bank & Govt. job materials", link: "/resources/job-prep" }
  ];

  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      
      {/* 1. PREMIUM HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-4 h-4" />
            Redefining Education in Bangladesh
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.05] animate-in fade-in slide-in-from-bottom-4 duration-700">
            The Smartest Way to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Master Your Milestone.
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            NextPrepBD is more than a resource portal. It's a comprehensive educational ecosystem 
            built to provide precision learning for every student, candidate, and professional.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Link href="/" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95">
              Explore Our Ecosystem
            </Link>
            <div className="flex items-center gap-2 text-slate-400 font-bold px-4">
               <Globe className="w-5 h-5" />
               Trusted by 15k+ Students Nationwide
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE PILLARS SECTION (Services) */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="space-y-2">
              <span className="text-blue-600 font-black uppercase tracking-widest text-xs">Our Services</span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                How We Make <span className="text-indigo-600">Learning Better.</span>
              </h2>
            </div>
            <p className="text-slate-500 font-medium max-w-sm">
                We've combined technology and pedagogy to create a comprehensive suite of services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all group flex flex-col">
                <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-${pillar.color}-600 group-hover:text-white transition-all duration-300`}>
                  <pillar.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">{pillar.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{pillar.desc}</p>
                <div className="mt-auto pt-4 flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase text-slate-300 group-hover:text-indigo-400 transition-colors">Service {idx + 1}</span>
                   <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE NEXTPREP ADVANTAGE (Unique Value) */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-8">
              <div>
                <span className="text-amber-600 font-black uppercase tracking-widest text-xs mb-4 block">Why Choose Us?</span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Why We Are Different <br />
                  From <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Anything Else.</span>
                </h2>
              </div>
              
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                 Most educational websites in Bangladesh are built for ad revenue, not students. 
                 We took a different path by focusing on <span className="text-slate-900 font-bold underline decoration-blue-500 decoration-4">Precision over Volume</span>.
              </p>

              <div className="space-y-6">
                 {[
                   { t: "100% Ad-Free Experience", d: "Zero distractions. No pop-ups. Just pure focused learning environment." },
                   { t: "Verified Content Only", d: "Every resource is vetted by top university mentors before being published." },
                   { t: "Smart Organization", d: "A sophisticated hierarchy that maps directly to your official curriculum." }
                 ].map((adv, i) => (
                    <div key={i} className="flex gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                       <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-5 h-5" />
                       </div>
                       <div>
                          <h4 className="font-black text-slate-900 mb-1">{adv.t}</h4>
                          <p className="text-sm text-slate-500 font-medium">{adv.d}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Stats Cards View */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
              <div className="absolute inset-0 bg-blue-100/30 blur-[100px] -z-10 rounded-full"></div>
              {stats.map((stat, idx) => (
                <div key={idx} className={`p-10 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center ${idx % 2 !== 0 ? 'sm:mt-12' : ''} hover:shadow-2xl transition-all duration-500`}>
                   <div className={`w-16 h-16 rounded-3xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
                      <stat.icon className="w-8 h-8" />
                   </div>
                   <h3 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">{stat.value}</h3>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 4. WHO WE SERVE (Audience Categories) */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-600/10 blur-[120px] -z-0 rounded-full"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
           <h2 className="text-3xl md:text-5xl font-black mb-16">Comprehensive Support For</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {audiences.map((aud, idx) => (
                <Link href={aud.link} key={idx} className="group h-full">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[3rem] h-full flex flex-col items-center hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
                     <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-8 shadow-lg shadow-indigo-600/30">
                        <Users className="w-7 h-7" />
                     </div>
                     <h3 className="text-2xl font-black mb-4">{aud.name}</h3>
                     <p className="text-slate-400 font-medium mb-10">{aud.desc}</p>
                     <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 group-hover:text-white transition-colors">
                        Discover More <ArrowRight className="w-4 h-4" />
                     </div>
                  </div>
                </Link>
              ))}
           </div>
        </div>
      </section>

      {/* 5. MISSION & VISION (Restyled) */}
      <section className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="p-10 md:p-16 rounded-[4rem] bg-indigo-50 border border-indigo-100 group hover:bg-indigo-600 hover:text-white transition-all duration-700">
            <Rocket className="w-12 h-12 text-indigo-600 group-hover:text-white mb-8" />
            <h3 className="text-3xl font-black mb-6">Our Mission</h3>
            <p className="text-lg font-medium opacity-70 leading-relaxed">
               To democratize high-quality academic resources. We ensure that every candidate—regardless of location or economic background—has equal access to the best tools for success.
            </p>
         </div>
         <div className="p-10 md:p-16 rounded-[4rem] bg-slate-50 border border-slate-100 group hover:bg-slate-900 hover:text-white transition-all duration-700">
            <Target className="w-12 h-12 text-slate-900 group-hover:text-white mb-8" />
            <h3 className="text-3xl font-black mb-6">Our Vision</h3>
            <p className="text-lg font-medium opacity-70 leading-relaxed">
               Building a future where "lack of guidance" is no longer a barrier. A generation of self-learners empowered by technology to achieve their highest academic potential.
            </p>
         </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[4rem] p-12 md:p-24 text-white relative overflow-hidden shadow-3xl">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-150"></div>
           <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-6xl font-black mb-8 leading-[1.1]">Join the New Era of <br /> Smarter Learning.</h2>
              <p className="text-xl text-blue-100/80 font-medium mb-12">
                 Join 15,000+ students who are already using NextPrepBD to master their curriculums and clear their milestones.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Link href="/signup" className="px-12 py-5 bg-white text-indigo-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-300 transition-all active:scale-95 shadow-2xl">
                    Get Started Free
                 </Link>
                 <Link href="/contact" className="px-12 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                    Connect With Us
                 </Link>
              </div>
           </div>
        </div>
      </section>

    </div>
  );
}

// Sub-components for better organization
function CheckCircle(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

const GraduationCap = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);