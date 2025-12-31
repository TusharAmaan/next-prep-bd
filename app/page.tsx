import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import HomeMaterialsFilter from "@/components/HomeMaterialsFilter";
import HomeAppSection from "@/components/HomeAppSection";
import AdBanner from "@/components/AdBanner";

// 1. CACHING CONFIG
export const revalidate = 60;

export default async function HomePage() {
  
  // 2. FETCH DATA
  const [segmentsData, latestResources, latestNews] = await Promise.all([
    supabase.from("segments").select("*").order("id"),
    supabase.from("resources")
      .select("*, subjects ( title, groups ( segments ( id, title, slug ) ) )")
      .limit(50) 
      .order("created_at", { ascending: false }),
    supabase.from("news").select("*").limit(5).order("created_at", { ascending: false }),
  ]);

  const segments = segmentsData.data || [];
  const resources = latestResources.data || [];
  const news = latestNews.data || [];

  // --- CONFIG: Custom Goal Cards ---
  const goalCards = [
    {
      title: "SSC",
      desc: "Complete guide for Science, Arts & Commerce with suggestions.",
      link: "/resources/ssc",
      bg: "bg-gradient-to-br from-blue-600 to-indigo-700",
      shadow: "shadow-blue-200",
      icon: <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    },
    {
      title: "HSC",
      desc: "Notes, question banks & college admission prep.",
      link: "/resources/hsc",
      bg: "bg-gradient-to-br from-purple-600 to-fuchsia-700",
      shadow: "shadow-purple-200",
      icon: <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
    },
    {
      title: "University Admission",
      desc: "Varsity A/B/C unit & Engineering prep materials.",
      link: "/resources/university-admission",
      bg: "bg-gradient-to-br from-rose-500 to-orange-600",
      shadow: "shadow-rose-200",
      icon: <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
    },
    {
      title: "Medical Prep",
      desc: "MBBS & Dental admission comprehensive guide.",
      link: "/resources/university-admission/science/medical-admission",
      bg: "bg-gradient-to-br from-emerald-500 to-teal-700",
      shadow: "shadow-emerald-200",
      icon: <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    },
    {
      title: "IBA - MBA",
      desc: "Master your BBA/MBA admission tests.",
      link: "/resources/master's-admission/mba/iba",
      bg: "bg-gradient-to-br from-slate-700 to-black",
      shadow: "shadow-slate-200",
      icon: <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    },
    {
      title: "Govt. Jobs",
      desc: "BCS, Bank Jobs & NTRCA preparation.",
      link: "/resources/job-prep/govt.-jobs",
      bg: "bg-gradient-to-br from-cyan-500 to-blue-700",
      shadow: "shadow-cyan-200",
      icon: <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* =========================================
          1. HERO SECTION
         ========================================= */}
      <section className="relative bg-slate-900 text-white pt-36 pb-32 px-6 overflow-hidden">
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
            
            <form 
                action="/search" 
                method="GET" 
                className="bg-white p-2 rounded-2xl max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 shadow-2xl transform transition-transform hover:scale-[1.01]"
            >
                <input 
                    name="q" 
                    type="text" 
                    placeholder="Search notes (e.g. Physics)" 
                    className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg w-full"
                    required
                />
                <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-xl font-bold text-lg transition-all shadow-md w-full sm:w-auto"
                >
                    Search
                </button>
            </form>
        </div>
      </section>

      {/* =========================================
          2. STATS BAR
         ========================================= */}
      <section className="max-w-6xl mx-auto px-6 relative z-20 -mt-16 md:-mt-20">
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 p-6 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="flex flex-col items-center text-center p-2 group">
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-1">5,000+</h3>
                    <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">Study Notes</p>
                </div>
                <div className="flex flex-col items-center text-center p-2 group">
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-1">1,200+</h3>
                    <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">Active Students</p>
                </div>
                <div className="flex flex-col items-center text-center p-2 group">
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-1">500+</h3>
                    <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">Daily Visitors</p>
                </div>
            </div>
        </div>
      </section>

      {/* =========================================
          3. CATEGORIES (REDESIGNED)
         ========================================= */}
      <section className="pt-20 pb-12 max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16 space-y-3">
            <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight">
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Goal</span>
            </h2>
            <div className="w-16 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-5">
            {goalCards.map((card: any, idx: number) => {
                return (
                    <Link 
                        href={card.link} 
                        key={idx} 
                        className={`
                          group relative flex flex-col justify-between p-4 md:p-5 rounded-[1.5rem] 
                          ${card.bg} shadow-lg hover:shadow-xl hover:shadow-blue-500/20
                          transition-all duration-300 hover:-translate-y-1 overflow-hidden
                          border border-white/10 min-h-[140px] md:min-h-[180px]
                        `}
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-white/20 transition-all duration-500"></div>

                        <div className="relative z-10">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 shadow-inner border border-white/20">
                                {card.icon}
                            </div>
                            <h3 className="font-extrabold text-sm md:text-lg text-white tracking-wide leading-tight mb-1">
                              {card.title}
                            </h3>
                            {/* Desktop-Only Description */}
                            <p className="hidden md:block text-[10px] text-white/80 leading-relaxed font-medium">
                                {card.desc}
                            </p>
                        </div>

                        <div className="relative z-10 flex items-center justify-between text-white/90 group-hover:text-white mt-auto pt-3">
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-80">Explore</span>
                            <span className="text-sm md:text-base transform group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                    </Link>
                );
            })}
        </div>
      </section>

      {/* =========================================
          4. PREVIOUS YEAR QUESTIONS (Refined UI)
         ========================================= */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
            <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-orange-500">🗂️</span> Question Bank
                </h2>
                <p className="text-slate-500 text-sm mt-1">Archive of previous year board questions.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {segments.map((seg: any) => (
                    <Link 
                        href={`/resources/${seg.slug}?category=Previous%20Year%20Questions`} 
                        key={seg.id}
                        className="
                            flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 
                            hover:bg-white hover:border-orange-200 hover:shadow-md transition-all group
                        "
                    >
                        <div className="w-10 h-10 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform">
                            📁
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-slate-700 group-hover:text-orange-600 truncate">{seg.title}</h4>
                            <p className="text-[10px] text-slate-400">View Archive</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* =========================================
          5. MAIN CONTENT AREA (Refined Mobile Header)
         ========================================= */}
      <section className="pt-10 pb-20 max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="mb-10">
            <AdBanner dataAdSlot="8219606997" dataAdFormat="fluid" dataAdLayoutKey="-f9+a+14-5p+64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8">
                {/* NEW HEADER DESIGN */}
                <div className="mb-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl">⚡</div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900">Latest Materials</h2>
                            <p className="text-xs text-slate-500 font-medium">Freshly added content & updates</p>
                        </div>
                    </div>
                    <div className="hidden sm:block text-right">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full animate-pulse">Live Feed</span>
                    </div>
                </div>
                
                <HomeMaterialsFilter segments={segments} resources={resources} />
            </div>

            {/* RIGHT COLUMN: SIDEBAR */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* NOTICE BOARD */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
                        <h3 className="font-bold text-sm flex items-center gap-2"><span>📢</span> Notice Board</h3>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto custom-scrollbar">
                          {news.map((n: any) => (
                             <Link href={`/news/${n.id}`} key={n.id} className="block p-4 hover:bg-slate-50 transition group">
                                 <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded mb-1 inline-block uppercase">{n.category || 'Update'}</span>
                                 <h4 className="font-bold text-xs md:text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{n.title}</h4>
                                 <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                                     <span>🕒</span> {new Date(n.created_at).toLocaleDateString()}
                                 </p>
                             </Link>
                          ))}
                    </div>
                    <Link href="/news" className="block text-center py-3 text-xs font-bold text-slate-500 hover:text-blue-600 bg-slate-50 border-t border-slate-100 transition-colors">View All Notices →</Link>
                </div>
                
                {/* SOCIAL WIDGETS */}
                <div className="grid grid-cols-2 gap-3">
                    <a href="https://www.facebook.com/people/Nextprep-BD/61584943876571/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 bg-[#1877F2] text-white p-4 rounded-xl shadow-lg hover:bg-[#166fe5] transition-all text-center">
                        <div className="text-2xl">f</div>
                        <span className="text-xs font-bold">Facebook</span>
                    </a>
                    <a href="https://youtube.com/gmatclub" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 bg-[#FF0000] text-white p-4 rounded-xl shadow-lg hover:bg-[#e60000] transition-all text-center">
                        <div className="text-2xl">▶</div>
                        <span className="text-xs font-bold">YouTube</span>
                    </a>
                </div>

                {/* TEACHER PROMO */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white text-center shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <h4 className="font-black text-xl mb-2 relative z-10">Need Help?</h4>
                    <p className="text-indigo-100 text-xs mb-4 relative z-10">Book a private session with expert teachers.</p>
                    <button className="bg-white text-indigo-700 w-full py-3 rounded-xl text-xs font-black hover:bg-indigo-50 transition shadow-lg relative z-10">Find Teacher</button>
                </div>
            </div>
        </div>
      </section>

      {/* 5. APP DOWNLOAD */}
      <HomeAppSection />
    </div>
  );
}