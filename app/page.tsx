import Link from "next/link";
import { Suspense } from "react";
import HomeMaterialsFilter from "@/components/HomeMaterialsFilter";
import HomeAppSection from "@/components/HomeAppSection";
import AdBanner from "@/components/AdBanner";
import Image from "next/image";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { 
  Search, 
  FileText, 
  Users, 
  Zap, 
  GraduationCap, 
  School, 
  BookOpen, 
  Stethoscope, 
  Briefcase, 
  TrendingUp,
  ArrowRight,
  Bell,
  Download,
  Facebook,
  Youtube,
  Clock,
  ChevronRight,
  FileClock,
  UserCheck,
  Star,
  ShieldCheck,
  PlayCircle,
  Sparkles
} from "lucide-react";
import { createClient } from "@/lib/supabaseServer";
import CurriculumShowcase from "@/components/homepage/CurriculumShowcase";
import LectureSheetShowcase from "@/components/homepage/LectureSheetShowcase";

export const revalidate = 0; 

function SectionSkeleton() {
  return (
    <div className="w-full space-y-10 animate-pulse">
      <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-3xl w-64"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]"></div>
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  
  const supabaseServer = await createClient();
  const [segmentsData, latestResources, latestNews, ebooksData, { data: { user } }] = await Promise.all([
    supabaseServer.from("segments").select("*").order("id"),
    supabaseServer.from("resources")
      .select("*, subjects ( title, groups ( segments ( id, title, slug ) ) )")
      .limit(50) 
      .order("created_at", { ascending: false }),
    supabaseServer.from("news").select("*").limit(5).order("created_at", { ascending: false }),
    supabaseServer.from("ebooks")
      .select("id, title, author, cover_url, created_at, category")
      .limit(5)
      .order("created_at", { ascending: false }),
    supabaseServer.auth.getUser()
  ]);

  const segments = segmentsData.data || [];
  const resources = latestResources.data || [];
  const news = latestNews.data || [];
  const ebooks = ebooksData.data || [];

  const getQuestionText = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('ssc')) return "Full board archive & verified solutions.";
    if (s.includes('hsc')) return "Test paper analysis & board papers.";
    if (s.includes('admission')) return "DU, BUET & Medical entrance prep.";
    if (s.includes('job')) return "BCS & Bank professional archives.";
    return `Archive for ${slug.replace(/-/g, ' ')}.`;
  };

  const goalCards = [
    { title: "SSC", desc: "Resources for secondary candidates.", link: "/resources/ssc", bg: "bg-blue-600", icon: School },
    { title: "HSC", desc: "Advanced academic materials & test papers.", link: "/resources/hsc", bg: "bg-indigo-600", icon: GraduationCap },
    { title: "University", desc: "Varsity & Engineering entry strategies.", link: "/resources/university-admission", bg: "bg-fuchsia-600", icon: BookOpen },
    { title: "Medical", desc: "MBBS & Dental entrance guide.", link: "/resources/university-admission/science/medical-admission", bg: "bg-rose-500", icon: Stethoscope },
    { title: "IBA - MBA", desc: "Professional BBA/MBA admission assets.", link: "/resources/master's-admission/mba/iba", bg: "bg-slate-800", icon: TrendingUp },
    { title: "Career Prep", desc: "BCS, Bank & Job preparation.", link: "/resources/job-prep", bg: "bg-emerald-600", icon: Briefcase }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-900 text-white pt-28 md:pt-48 pb-20 md:pb-40 px-5 md:px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-indigo-600/20 rounded-full blur-[100px] md:blur-[150px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-blue-600/10 rounded-full blur-[100px] md:blur-[150px] animate-pulse"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2.5 bg-white/5 backdrop-blur-3xl border border-white/10 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-8 md:mb-10 shadow-2xl animate-fade-in-down">
                <span className="relative flex h-1.5 md:h-2 w-1.5 md:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 md:h-2 w-1.5 md:w-2 bg-indigo-500"></span>
                </span>
                Bangladesh's Premier Academic Platform
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-9xl font-black tracking-tighter mb-6 md:mb-10 leading-[1] md:leading-[0.85] animate-fade-in-up uppercase italic">
                Master your <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-300% animate-gradient-flow text-glow">Learning</span>
            </h1>
            
            <p className="max-w-xl mx-auto text-base md:text-xl text-slate-400 font-medium leading-relaxed mb-10 md:mb-12 animate-fade-in-up opacity-90" style={{ animationDelay: '100ms' }}>
                Access verified resources, strategic archives, and expert guidance. The revolutionary platform built for excellence.
            </p>

            <form action="/search" method="GET" className="bg-white/5 backdrop-blur-3xl p-2 md:p-3 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 max-w-3xl mx-auto flex flex-col sm:flex-row gap-2.5 md:gap-4 shadow-3xl transform transition-all hover:scale-[1.02] animate-fade-in-up group" style={{ animationDelay: '200ms' }}>
                <div className="relative flex-1">
                    <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 w-5 h-5 md:w-6 md:h-6 transition-colors" />
                    <input name="q" type="text" placeholder="Search resources..." className="w-full bg-transparent border-none outline-none text-white placeholder-slate-500 pl-14 md:pl-16 pr-5 py-3 md:py-5 text-sm md:text-lg font-black tracking-wide uppercase" required />
                </div>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 md:px-10 py-3.5 md:py-5 rounded-xl md:rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl shadow-indigo-600/30 w-full sm:w-auto flex items-center justify-center gap-2.5 hover:scale-105 active:scale-95 duration-500">
                    Search <ArrowRight className="w-4 h-4" />
                </button>
            </form>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <ScrollReveal>
        <section className="max-w-6xl mx-auto px-5 md:px-6 relative z-20 -mt-10 md:-mt-24">
          <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[3.5rem] shadow-2xl shadow-indigo-900/10 dark:shadow-slate-950 p-6 md:p-12 border border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 md:divide-x divide-slate-100 dark:divide-slate-800/50">
                  <div className="flex flex-col items-center text-center group">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl md:rounded-[1.5rem] flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-all duration-500 shadow-inner">
                          <FileText className="w-6 h-6 md:w-8 md:h-8" />
                      </div>
                      <h3 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 md:mb-2 uppercase italic">12,000+</h3>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Verified Assets</p>
                  </div>
                  <div className="flex flex-col items-center text-center group">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-xl md:rounded-[1.5rem] flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-all duration-500 shadow-inner">
                          <Users className="w-6 h-6 md:w-8 md:h-8" />
                      </div>
                      <h3 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 md:mb-2 uppercase italic">5,400+</h3>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Active Candidates</p>
                  </div>
                  <div className="flex flex-col items-center text-center group">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl md:rounded-[1.5rem] flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-all duration-500 shadow-inner">
                          <Zap className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                      </div>
                      <h3 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 md:mb-2 uppercase italic">Daily</h3>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Resource Updates</p>
                  </div>
              </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 3. CHOOSE YOUR GOAL */}
      <ScrollReveal>
        <section className="pt-16 md:pt-32 pb-12 md:pb-16 max-w-7xl mx-auto px-5 md:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 md:mb-20 gap-6 md:gap-8">
              <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                      <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5" />
                      Learning Paths
                  </div>
                  <h2 className="text-3xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1] md:leading-[0.9] uppercase italic">
                      Select Your <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Goal</span>
                  </h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md text-base md:text-lg leading-relaxed opacity-80">
                  Carefully designed pathways and curated archives to help you reach the next academic level.
              </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
              {goalCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                      <ScrollReveal key={idx} delay={idx * 50}>
                        <Link href={card.link} className="group relative block h-full">
                            <div className="h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm hover:shadow-2xl dark:hover:shadow-indigo-900/10 transition-all duration-500 hover:-translate-y-2 flex flex-col group">
                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] ${card.bg} flex items-center justify-center mb-5 md:mb-8 shadow-2xl transform group-hover:scale-110 transition-all duration-500`}>
                                    <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </div>
                                <h3 className="text-base md:text-xl font-black text-slate-900 dark:text-white mb-2 md:mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-none tracking-tight uppercase italic">{card.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-[9px] md:text-[11px] leading-relaxed mb-6 md:mb-8 font-black uppercase tracking-wider opacity-70 line-clamp-2">{card.desc}</p>
                                <div className="mt-auto flex items-center text-indigo-600 dark:text-indigo-400 font-black text-[9px] uppercase tracking-[0.2em] gap-2 md:gap-3">
                                    <span>Browse</span>
                                    <div className="flex-1 h-[2.5px] bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-400 transition-all duration-500"></div>
                                </div>
                            </div>
                        </Link>
                      </ScrollReveal>
                  );
              })}
          </div>
        </section>
      </ScrollReveal>

      {/* 4. PREVIOUS YEAR QUESTIONS */}
      <ScrollReveal>
        <section className="py-16 md:py-32 bg-slate-100/50 dark:bg-slate-900/30 relative overflow-hidden border-y border-slate-100 dark:border-slate-800/50">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/5 dark:bg-indigo-400/5 -skew-x-12 translate-x-1/2 -z-0"></div>
          <div className="max-w-7xl mx-auto px-5 md:px-6 relative z-10">
              <div className="text-center mb-12 md:mb-24">
                  <div className="inline-block px-3 md:px-4 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg mb-6 shadow-2xl shadow-indigo-600/30">Archives</div>
                  <h2 className="text-3xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 md:mb-6 leading-[1.1] md:leading-none uppercase italic">Exam Archive <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Index</span></h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-base md:text-lg font-medium leading-relaxed opacity-80">Verified solutions for over a decade of board and competitive exams at your fingertips.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
                  {segments.map((seg: any, i: number) => (
                      <ScrollReveal key={seg.id} delay={i * 50}>
                        <Link 
                            href={`/resources/${seg.slug}?type=question`} 
                            className="group flex items-center bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl md:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl dark:hover:shadow-indigo-900/10 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-500 hover:-translate-y-1.5"
                        >
                            <div className="w-12 h-12 md:w-20 md:h-20 shrink-0 rounded-xl md:rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-500 shadow-inner">
                                <FileClock className="w-6 h-6 md:w-8 md:h-8 text-slate-400 dark:text-slate-600 group-hover:text-white transition-colors" />
                            </div>
                            <div className="ml-4 md:ml-8">
                                <div className="flex items-center gap-3 mb-1.5 md:mb-2">
                                    <h4 className="font-black text-base md:text-xl text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight leading-none uppercase italic">{seg.title}</h4>
                                    <span className="text-[7px] md:text-[9px] font-black text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 md:px-3 py-1 rounded-lg uppercase tracking-[0.2em] border border-green-100 dark:border-green-800/30 animate-pulse">Live</span>
                                </div>
                                <p className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 md:mb-4 line-clamp-1 opacity-70">{getQuestionText(seg.slug)}</p>
                                <div className="flex items-center gap-4 md:gap-6">
                                    <span className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none"><Users className="w-3 h-3 text-indigo-400" /> 12k+</span>
                                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] group-hover:translate-x-1.5 transition-transform duration-500">View <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5 inline" /></span>
                                </div>
                            </div>
                        </Link>
                      </ScrollReveal>
                  ))}
              </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 5. CURRICULUM SHOWCASE */}
      <CurriculumShowcase isLoggedIn={!!user} />

      {/* 6. LECTURE SHEET SYSTEM */}
      <LectureSheetShowcase isLoggedIn={!!user} />

      {/* 7. MAIN CONTENT AREA */}
      <section className="pt-24 pb-32 max-w-7xl mx-auto px-6">
        <div className="mb-16">
            <AdBanner dataAdSlot="8219606997" dataAdFormat="fluid" dataAdLayoutKey="-f9+a+14-5p+64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8">
                <div className="mb-12 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-indigo-900/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                            <Zap className="w-8 h-8 fill-current" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-2">Academic Resources</h2>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Latest additions & strategic updates</p>
                        </div>
                    </div>
                    <div>
                        <span className="inline-flex items-center gap-2.5 px-5 py-2 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 text-[9px] font-bold uppercase tracking-widest rounded-xl animate-pulse border border-green-100 dark:border-green-800/30">
                            <span className="w-2 h-2 bg-green-600 rounded-full shadow-glow-green"></span>
                            Live Updates
                        </span>
                    </div>
                </div>
                <Suspense fallback={<SectionSkeleton />}>
                  <HomeMaterialsFilter segments={segments} resources={resources} />
                </Suspense>
            </div>

            {/* RIGHT COLUMN: SIDEBAR */}
            <div className="lg:col-span-4 space-y-12">
                
                {/* TUTOR PROMO */}
                <ScrollReveal direction="right">
                  <div className="relative group p-[1px] rounded-[3rem] bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 shadow-2xl overflow-hidden hover:scale-[1.02] transition-all duration-700">
                      <div className="bg-slate-900 rounded-[3rem] p-10 relative overflow-hidden h-full">
                          <div className="absolute -right-8 -top-8 opacity-10 group-hover:opacity-25 transition-opacity duration-1000 rotate-12">
                              <Users className="w-48 h-48 text-white" />
                          </div>
                          <div className="relative z-10 flex flex-col h-full">
                              <div className="flex gap-4 mb-10 pl-4">
                                  {[1, 2, 3, 4].map((i) => (
                                      <div key={i} className="w-12 h-12 rounded-[1.2rem] border-4 border-slate-900 bg-slate-800 flex items-center justify-center -ml-5 first:ml-0 overflow-hidden shadow-2xl">
                                          <Image src={`https://i.pravatar.cc/100?img=${i+15}`} alt="mentor" width={48} height={48} className="object-cover w-full h-full" />
                                      </div>
                                  ))}
                                  <div className="w-12 h-12 rounded-[1.2rem] border-4 border-slate-900 bg-indigo-600 flex items-center justify-center -ml-5 text-[10px] font-bold text-white shadow-2xl shadow-indigo-600/50">+80</div>
                              </div>
                              <h3 className="text-4xl font-bold text-white leading-[0.9] mb-6 tracking-tight">Learn with <br/><span className="text-indigo-400">Expert Mentors.</span></h3>
                              <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">Engage in personalized 1-on-1 sessions for Physics, Math & Admission coaching.</p>
                              <Link href="/find-tutor" className="mt-auto">
                                  <button className="w-full bg-white text-slate-950 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-4 shadow-2xl hover:bg-indigo-500 hover:text-white active:scale-95 duration-500 group-hover:shadow-indigo-500/20">
                                      Find a Mentor <ArrowRight className="w-5 h-5" />
                                  </button>
                              </Link>
                              <p className="text-center text-[9px] text-slate-600 mt-6 font-bold uppercase tracking-widest">Verified Top-Tier Educators</p>
                          </div>
                      </div>
                  </div>
                </ScrollReveal>

                {/* COMMUNITY WIDGET */}
                <ScrollReveal direction="right" delay={100}>
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl dark:shadow-indigo-900/5 group">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-4 text-[10px] uppercase tracking-widest">
                          <Zap className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" /> Join the Community
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                          <a href="https://www.facebook.com/people/Nextprep-BD/61584943876571/" target="_blank" className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-all duration-500 hover:-translate-y-2 group">
                              <Facebook className="w-8 h-8 mb-3 text-blue-600 group-hover:text-white transition-transform group-hover:scale-125" />
                              <span className="text-[9px] font-bold uppercase tracking-widest">Facebook</span>
                          </a>
                          <a href="https://youtube.com/@nextprepbd" target="_blank" className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 hover:bg-red-600 dark:hover:bg-red-600 hover:text-white transition-all duration-500 hover:-translate-y-2 group">
                              <Youtube className="w-8 h-8 mb-3 text-red-600 group-hover:text-white transition-transform group-hover:scale-125" />
                              <span className="text-[9px] font-bold uppercase tracking-widest">YouTube</span>
                          </a>
                      </div>
                  </div>
                </ScrollReveal>

                {/* NOTICE BOARD */}
                <ScrollReveal direction="right" delay={200}>
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl dark:shadow-indigo-900/5">
                      <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-4 text-[10px] uppercase tracking-widest"><Bell className="w-4 h-4 text-indigo-600" /> Latest Updates</h3>
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-glow-red"></div>
                      </div>
                      <div className="p-4 max-h-[400px] overflow-y-auto hide-scrollbar custom-scrollbar">
                          {news.map((n: any) => (
                              <Link href={`/news/${n.id}`} key={n.id} className="block p-5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-500 group border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                  <div className="flex items-center gap-3 mb-3">
                                      <span className="text-[8px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-lg uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">{n.category || 'Update'}</span>
                                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{new Date(n.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug tracking-tight line-clamp-2">{n.title}</h4>
                              </Link>
                          ))}
                      </div>
                      <Link href="/news" className="block text-center py-6 bg-slate-50 dark:bg-slate-800/50 text-[9px] font-bold text-slate-500 dark:text-slate-400 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest border-t border-slate-50 dark:border-slate-800">View Full Feed</Link>
                  </div>
                </ScrollReveal>

                {/* POPULAR EBOOKS */}
                <ScrollReveal direction="right" delay={300}>
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl dark:shadow-indigo-900/5">
                      <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-4 text-[10px] uppercase tracking-widest"><BookOpen className="w-4 h-4 text-purple-600" /> Digital Resources</h3>
                      </div>
                      <div className="p-4">
                          {ebooks.map((book: any) => (
                              <Link href={`/ebooks/${book.id}`} key={book.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-500 group border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                  <div className="flex items-center gap-5 overflow-hidden">
                                      <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                                          <FileText className="w-6 h-6" />
                                      </div>
                                      <div className="min-w-0">
                                          <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">{book.title}</h4>
                                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">{book.category}</p>
                                      </div>
                                  </div>
                                  <span className="p-2.5 text-slate-300 dark:text-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Download className="w-5 h-5" /></span>
                              </Link>
                          ))}
                      </div>
                      <Link href="/ebooks" className="block text-center py-6 bg-purple-50 dark:bg-purple-900/20 text-[9px] font-bold text-purple-600 dark:text-purple-400 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest duration-500">Access Library</Link>
                  </div>
                </ScrollReveal>

            </div>
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <HomeAppSection />

    </div>
  );
}