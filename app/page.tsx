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
  PlayCircle
} from "lucide-react";

// 1. CACHING CONFIG
export const revalidate = 60;

export default async function HomePage() {
  
  // 2. FETCH DATA
  const [segmentsData, latestResources, latestNews, ebooksData] = await Promise.all([
    supabase.from("segments").select("*").order("id"),
    supabase.from("resources")
      .select("*, subjects ( title, groups ( segments ( id, title, slug ) ) )")
      .limit(50) 
      .order("created_at", { ascending: false }),
    supabase.from("news").select("*").limit(5).order("created_at", { ascending: false }),
    supabase.from("resources")
      .select("id, title, content_url, created_at")
      .eq("type", "pdf")
      .limit(4)
      .order("created_at", { ascending: false })
  ]);

  const segments = segmentsData.data || [];
  const resources = latestResources.data || [];
  const news = latestNews.data || [];
  const ebooks = ebooksData.data || [];

  const getQuestionText = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('ssc')) return "All board questions.";
    if (s.includes('hsc')) return "Board & college tests.";
    if (s.includes('admission')) return "DU, BUET, Medical papers.";
    if (s.includes('job')) return "BCS & Bank exams.";
    return `Archive of ${slug.replace(/-/g, ' ')}.`;
  };

  const goalCards = [
    { title: "SSC", desc: "Science, Arts & Commerce guide.", link: "/resources/ssc", bg: "bg-gradient-to-br from-blue-600 to-indigo-700", icon: School },
    { title: "HSC", desc: "Notes & college admission prep.", link: "/resources/hsc", bg: "bg-gradient-to-br from-purple-600 to-fuchsia-700", icon: GraduationCap },
    { title: "University Admission", desc: "Varsity & Engineering prep.", link: "/resources/university-admission", bg: "bg-gradient-to-br from-rose-500 to-orange-600", icon: BookOpen },
    { title: "Medical Prep", desc: "MBBS & Dental admission guide.", link: "/resources/university-admission/science/medical-admission", bg: "bg-gradient-to-br from-emerald-500 to-teal-700", icon: Stethoscope },
    { title: "IBA - MBA", desc: "BBA/MBA admission tests.", link: "/resources/master's-admission/mba/iba", bg: "bg-gradient-to-br from-slate-700 to-black", icon: TrendingUp },
    { title: "Job Preparation", desc: "BCS, Bank Jobs & NTRCA.", link: "/resources/job-prep", bg: "bg-gradient-to-br from-cyan-500 to-blue-700", icon: Briefcase }
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
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 p-8 md:p-10">
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

      {/* 3. CHOOSE YOUR GOAL */}
      <section className="pt-24 pb-12 max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Goal</span>
            </h2>
            <div className="w-16 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
            {goalCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <Link href={card.link} key={idx} className={`group relative flex flex-col justify-between p-5 rounded-[1.5rem] ${card.bg} shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-white/10 min-h-[160px]`}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-white/20 transition-all duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 shadow-inner border border-white/20">
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-extrabold text-sm md:text-lg text-white tracking-wide leading-tight mb-1">{card.title}</h3>
                            <p className="hidden md:block text-xs font-medium text-white/90 leading-snug line-clamp-2">{card.desc}</p>
                        </div>
                        <div className="relative z-10 flex items-center justify-between text-white/90 group-hover:text-white mt-auto pt-3 border-t border-white/10">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Explore</span>
                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                );
            })}
        </div>
      </section>

      {/* 4. PREVIOUS YEAR QUESTIONS (UPDATED CARDS: Black/Blue Gradient) */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12 space-y-3">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Previous Year <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Questions</span>
                </h2>
                <div className="w-16 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
                <p className="text-slate-500 font-medium pt-2">Access our extensive archive of past board questions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {segments.map((seg: any) => (
                    <Link 
                        href={`/resources/${seg.slug}?type=question`} 
                        key={seg.id}
                        /* DARK GRADIENT CARD - Compact & Optimized */
                        className="
                           group relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950
                           rounded-2xl p-5 border border-slate-700/50 shadow-lg
                           hover:shadow-xl hover:shadow-blue-500/10 
                           transition-all duration-300 hover:-translate-y-1 flex flex-col
                        "
                    >
                        {/* Glowing Accent Top */}
                        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                <FileClock className="w-5 h-5" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-700">
                                Archive
                            </span>
                        </div>
                        
                        <h4 className="font-bold text-lg text-white mb-1 group-hover:text-blue-300 transition-colors">
                            {seg.title}
                        </h4>
                        
                        <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4">
                            {getQuestionText(seg.slug)}
                        </p>

                        <div className="mt-auto pt-3 border-t border-white/5 flex items-center gap-2 text-xs font-bold text-blue-400 group-hover:text-blue-300 transition-colors uppercase tracking-wide">
                            <span>View Questions</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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

            {/* RIGHT COLUMN: SIDEBAR */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* 1. SOCIAL WIDGETS (REPLICA DESIGN) */}
                <div className="space-y-4">
                    {/* Facebook Button */}
                    <a href="https://www.facebook.com/people/Nextprep-BD/61584943876571/" target="_blank" rel="noopener noreferrer" 
                       className="flex items-center gap-4 bg-[#1877F2] text-white p-4 rounded-2xl shadow-lg hover:brightness-110 hover:-translate-y-1 transition-all group w-full">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <Facebook className="w-6 h-6 fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold leading-tight">Join Community</span>
                            <span className="text-xs font-medium opacity-90">Facebook Page</span>
                        </div>
                    </a>

                    {/* YouTube Button */}
                    <a href="https://youtube.com/@nextprepbd" target="_blank" rel="noopener noreferrer" 
                       className="flex items-center gap-4 bg-[#FF0000] text-white p-4 rounded-2xl shadow-lg hover:brightness-110 hover:-translate-y-1 transition-all group w-full">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <PlayCircle className="w-6 h-6 fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold leading-tight">Watch Classes</span>
                            <span className="text-xs font-medium opacity-90">YouTube Channel</span>
                        </div>
                    </a>
                </div>

                {/* 2. NOTICE BOARD */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-[#0f172a] text-white px-5 py-4 flex justify-between items-center">
                        <h3 className="font-bold text-sm flex items-center gap-2"><Bell className="w-4 h-4" /> Notice Board</h3>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto custom-scrollbar">
                          {news.map((n: any) => (
                             <Link href={`/news/${n.id}`} key={n.id} className="block p-4 hover:bg-slate-50 transition group">
                                 <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded mb-1 inline-block uppercase">{n.category || 'Update'}</span>
                                 <h4 className="font-bold text-xs md:text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{n.title}</h4>
                                 <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(n.created_at).toLocaleDateString()}</p>
                             </Link>
                          ))}
                    </div>
                    <Link href="/news" className="block text-center py-3 text-xs font-bold text-slate-500 hover:text-blue-600 bg-slate-50 border-t border-slate-100 transition-colors">View All Notices →</Link>
                </div>

                {/* 3. POPULAR EBOOKS */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                        <h3 className="font-bold text-slate-900">Popular eBooks</h3>
                    </div>
                    <div className="p-2">
                        {ebooks.length > 0 ? (
                             <div className="space-y-1">
                                {ebooks.map((book: any) => (
                                    <div key={book.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition group border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center shrink-0"><FileText className="w-4 h-4" /></div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">{book.title}</h4>
                                                <p className="text-[10px] text-slate-400">PDF • Free Download</p>
                                            </div>
                                        </div>
                                        <a href={book.content_url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Download className="w-4 h-4" /></a>
                                    </div>
                                ))}
                             </div>
                        ) : (
                            <div className="p-4 text-center text-slate-400 text-xs font-medium">No eBooks available.</div>
                        )}
                    </div>
                    <Link href="/resources/ebooks" className="block text-center py-3 text-xs font-bold text-purple-600 hover:bg-purple-50 bg-white border-t border-slate-100 transition-colors">Browse eBook Library →</Link>
                </div>

                {/* 4. TEACHER PROMO */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white text-center shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                    <h4 className="font-black text-xl mb-2 relative z-10">Need Help?</h4>
                    <p className="text-indigo-100 text-xs mb-4 relative z-10">Book a private session with expert teachers.</p>
                    <button className="bg-white text-indigo-700 w-full py-3 rounded-xl text-xs font-black hover:bg-indigo-50 transition shadow-lg relative z-10 flex items-center justify-center gap-2">
                        Find Teacher <ChevronRight className="w-3 h-3"/>
                    </button>
                </div>

            </div>
        </div>
      </section>

      {/* 6. APP DOWNLOAD */}
      <HomeAppSection />
    </div>
  );
}