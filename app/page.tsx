import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import HomeMaterialsFilter from "@/components/HomeMaterialsFilter";
import HomeAppSection from "@/components/HomeAppSection";
import AdBanner from "@/components/AdBanner";
import Image from "next/image";
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
  PlayCircle
} from "lucide-react";

export const revalidate = 0; 

export default async function HomePage() {
  
  // 1. FETCH DATA
  const [segmentsData, latestResources, latestNews, ebooksData] = await Promise.all([
    supabase.from("segments").select("*").order("id"),
    supabase.from("resources")
      .select("*, subjects ( title, groups ( segments ( id, title, slug ) ) )")
      .limit(50) 
      .order("created_at", { ascending: false }),
    supabase.from("news").select("*").limit(5).order("created_at", { ascending: false }),
    supabase.from("ebooks")
      .select("id, title, author, cover_url, created_at, category")
      .limit(5)
      .order("created_at", { ascending: false })
  ]);

  const segments = segmentsData.data || [];
  const resources = latestResources.data || [];
  const news = latestNews.data || [];
  const ebooks = ebooksData.data || [];

  const getQuestionText = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('ssc')) return "All board questions & solutions.";
    if (s.includes('hsc')) return "Board & college test papers.";
    if (s.includes('admission')) return "DU, BUET, Medical papers.";
    if (s.includes('job')) return "BCS & Bank exam archive.";
    return `Archive of ${slug.replace(/-/g, ' ')}.`;
  };

  const goalCards = [
    { title: "SSC", desc: "Science, Arts & Commerce guide.", link: "/resources/ssc", bg: "bg-blue-600", icon: School },
    { title: "HSC", desc: "Notes & college admission prep.", link: "/resources/hsc", bg: "bg-indigo-600", icon: GraduationCap },
    { title: "University", desc: "Varsity & Engineering prep.", link: "/resources/university-admission", bg: "bg-fuchsia-600", icon: BookOpen },
    { title: "Medical", desc: "MBBS & Dental admission guide.", link: "/resources/university-admission/science/medical-admission", bg: "bg-rose-500", icon: Stethoscope },
    { title: "IBA - MBA", desc: "BBA/MBA admission tests.", link: "/resources/master's-admission/mba/iba", bg: "bg-slate-800", icon: TrendingUp },
    { title: "Job Prep", desc: "BCS, Bank Jobs & NTRCA.", link: "/resources/job-prep", bg: "bg-emerald-600", icon: Briefcase }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#0f172a] text-white pt-36 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold text-blue-100 mb-8 shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Bangladesh's Largest Education Portal
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
                Master Your Exams with <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">NextPrepBD</span>
            </h1>
            
            <form action="/search" method="GET" className="bg-white p-2 rounded-2xl max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 shadow-2xl transform transition-transform hover:scale-[1.01]">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input name="q" type="text" placeholder="Search notes, questions (e.g. Physics)" className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg rounded-xl" required />
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-xl font-bold text-lg transition-all shadow-md w-full sm:w-auto flex items-center justify-center gap-2">
                    Search
                </button>
            </form>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="max-w-6xl mx-auto px-6 relative z-20 -mt-16 md:-mt-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="flex flex-col items-center text-center group">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText className="w-7 h-7" />
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-1">5,000+</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Study Notes</p>
                </div>
                <div className="flex flex-col items-center text-center group">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Users className="w-7 h-7" />
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-1">1,200+</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Students</p>
                </div>
                <div className="flex flex-col items-center text-center group">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Zap className="w-7 h-7 fill-current" />
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-1">Daily</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Live Updates</p>
                </div>
            </div>
        </div>
      </section>

      {/* 3. REDESIGNED: CHOOSE YOUR GOAL */}
      <section className="pt-24 pb-12 max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
                <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">Pathways</span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Goal</span>
                </h2>
            </div>
            <p className="text-slate-500 font-medium max-w-md">
                Tailored study materials and curated paths to help you clear your next big milestone.
            </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            {goalCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <Link href={card.link} key={idx} className="group relative">
                        <div className={`absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10 ${card.bg}`}></div>
                        <div className="h-full bg-white border border-slate-200 group-hover:border-transparent p-6 rounded-[2rem] transition-all duration-300 group-hover:-translate-y-2 flex flex-col shadow-sm group-hover:shadow-2xl">
                            <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                                <Icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{card.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">{card.desc}</p>
                            <div className="mt-auto flex items-center text-blue-600 font-bold text-xs uppercase tracking-wider gap-2">
                                <span>Explore</span>
                                <div className="w-6 h-[2px] bg-blue-100 group-hover:w-10 group-hover:bg-blue-600 transition-all duration-300"></div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
      </section>

      {/* 4. REDESIGNED: PREVIOUS YEAR QUESTIONS */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-100/40 skew-x-12 translate-x-1/2 -z-0"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
                <div className="inline-block px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-full mb-4">The Archive</div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Previous Year <span className="text-blue-600">Questions</span></h2>
                <p className="text-slate-500 max-w-2xl mx-auto">Instant access to over 10 years of board and competitive exam papers with verified solutions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {segments.map((seg: any) => (
                    <Link 
                        href={`/resources/${seg.slug}?type=question`} 
                        key={seg.id}
                        className="group flex items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300"
                    >
                        <div className="w-16 h-16 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                            <FileClock className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                        <div className="ml-5">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{seg.title}</h4>
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">NEW</span>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-1 mb-2">{getQuestionText(seg.slug)}</p>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400"><Users className="w-3 h-3" /> 12k+ Solved</span>
                                <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600">Practice Now <ChevronRight className="w-3 h-3" /></span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* 5. MAIN CONTENT AREA */}
      <section className="pt-16 pb-20 max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-10">
            <AdBanner dataAdSlot="8219606997" dataAdFormat="fluid" dataAdLayoutKey="-f9+a+14-5p+64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8">
                <div className="mb-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Zap className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900">Latest Materials</h2>
                            <p className="text-xs text-slate-500 font-medium">Freshly added content & updates</p>
                        </div>
                    </div>
                    <div className="hidden sm:block text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full animate-pulse border border-green-200">
                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                            Live Feed
                        </span>
                    </div>
                </div>
                <HomeMaterialsFilter segments={segments} resources={resources} />
            </div>

            {/* REDESIGNED RIGHT COLUMN: SIDEBAR */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* 1. TUTOR PROMO: THE "TRUST" DESIGN */}
                <div className="relative group p-[1px] rounded-[2.5rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl overflow-hidden">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 relative overflow-hidden h-full">
                        <div className="absolute -right-4 -top-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <Users className="w-32 h-32 text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex gap-2 mb-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center -ml-3 first:ml-0 overflow-hidden">
                                        <Image src={`https://i.pravatar.cc/100?img=${i+10}`} alt="tutor" width={40} height={40} />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center -ml-3 text-[10px] font-bold text-white">+50</div>
                            </div>
                            <h3 className="text-3xl font-black text-white leading-tight mb-4">Learn from the <span className="text-indigo-400">Best Minds.</span></h3>
                            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Personalized 1-on-1 coaching for Physics, Math & Admission prep.</p>
                            <Link href="/find-tutor">
                                <button className="w-full bg-white hover:bg-indigo-400 hover:text-white text-slate-900 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
                                    FIND A TUTOR <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                            <p className="text-center text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-widest">Verified & Top Rated Mentors</p>
                        </div>
                    </div>
                </div>

                {/* 2. COMMUNITY WIDGET */}
                <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Join Our Community
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <a href="https://www.facebook.com/people/Nextprep-BD/61584943876571/" target="_blank" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white transition-all group">
                            <Facebook className="w-6 h-6 mb-2 text-blue-600 group-hover:text-white" />
                            <span className="text-[10px] font-black uppercase">Follow Us</span>
                        </a>
                        <a href="https://youtube.com/@nextprepbd" target="_blank" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white transition-all group">
                            <Youtube className="w-6 h-6 mb-2 text-red-600 group-hover:text-white" />
                            <span className="text-[10px] font-black uppercase">Watch</span>
                        </a>
                    </div>
                </div>

                {/* 3. NOTICE BOARD */}
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2"><Bell className="w-4 h-4 text-blue-600" /> Notices</h3>
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    </div>
                    <div className="p-2 max-h-[350px] overflow-y-auto">
                        {news.map((n: any) => (
                            <Link href={`/news/${n.id}`} key={n.id} className="block p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">{n.category || 'Update'}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{new Date(n.created_at).toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 leading-snug">{n.title}</h4>
                            </Link>
                        ))}
                    </div>
                    <Link href="/news" className="block text-center py-4 bg-slate-50 text-xs font-bold text-slate-500 hover:text-blue-600 border-t border-slate-100 uppercase tracking-widest">View All Updates</Link>
                </div>

                {/* 4. POPULAR EBOOKS */}
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2"><BookOpen className="w-4 h-4 text-purple-600" /> eBook Library</h3>
                    </div>
                    <div className="p-3">
                        {ebooks.map((book: any) => (
                            <Link href={`/ebooks/${book.id}`} key={book.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition group border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">{book.title}</h4>
                                        <p className="text-[10px] text-slate-400">{book.category}</p>
                                    </div>
                                </div>
                                <span className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Download className="w-4 h-4" /></span>
                            </Link>
                        ))}
                    </div>
                    <Link href="/ebooks" className="block text-center py-4 bg-purple-50 text-xs font-bold text-purple-600 hover:bg-purple-100 transition-colors uppercase tracking-widest">Browse All eBooks</Link>
                </div>

            </div>
        </div>
      </section>

      {/* 5. APP DOWNLOAD */}
      <HomeAppSection />
    </div>
  );
}