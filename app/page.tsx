import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import HomeMaterialsFilter from "@/components/HomeMaterialsFilter"; // <--- Import the filter
import HomeAppSection from "@/components/HomeAppSection";
export const revalidate = 60;

export default async function HomePage() {
  
  // 2. FETCH DATA
  const [segmentsData, latestResources, latestNews] = await Promise.all([
    supabase.from("segments").select("*").order("id"),
    // Fetch MORE items (e.g. 50) so the client-side filter has enough data to show for each tab
    supabase.from("resources")
      .select("*, subjects ( title, groups ( segments ( id, title, slug ) ) )")
      .limit(50) 
      .order("created_at", { ascending: false }),
    supabase.from("news").select("*").limit(5).order("created_at", { ascending: false }),
  ]);

  const segments = segmentsData.data || [];
  const resources = latestResources.data || [];
  const news = latestNews.data || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* =========================================
          1. HERO SECTION
         ========================================= */}
      <section className="relative bg-slate-900 text-white pt-36 pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-sm font-semibold text-blue-100 mb-8 shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Bangladesh's Largest Education Portal
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
                Master Your Exams with <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">NextPrepBD</span>
            </h1>
            
            {/* SEARCH FORM */}
{/* SEARCH FORM (Mobile Optimized) */}
            <form 
                action="/search" 
                method="GET" 
                className="bg-white p-2 rounded-2xl max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 shadow-2xl transform transition-transform hover:scale-[1.01]"
            >
                <input 
                    name="q" 
                    type="text" 
                    placeholder="Search for notes (e.g. Physics)" 
                    // Mobile: Full width, smaller padding. Desktop: Flex-1, larger padding.
                    className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg w-full"
                    required
                />
                <button 
                    type="submit" 
                    // Mobile: Full width button. Desktop: Auto width.
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-xl font-bold text-lg transition-all shadow-md w-full sm:w-auto"
                >
                    Search
                </button>
            </form>
        </div>
      </section>

{/* =========================================
          2. STATS BAR (Redesigned with Icons)
         ========================================= */}
      <section className="max-w-6xl mx-auto px-6 relative z-20 -mt-20">
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                
                {/* Stat 1: Study Notes */}
                <div className="flex flex-col items-center text-center p-2 group">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                        {/* Icon: Document Text */}
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">5,000+</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Study Notes</p>
                </div>

                {/* Stat 2: Students */}
                <div className="flex flex-col items-center text-center p-2 group">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                        {/* Icon: Users */}
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">1,200+</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Active Students</p>
                </div>

                {/* Stat 3: Visitors */}
                <div className="flex flex-col items-center text-center p-2 group">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                        {/* Icon: Trending Up */}
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">500+</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Daily Visitors</p>
                </div>

            </div>
        </div>
      </section>

      {/* =========================================
          3. CATEGORIES
         ========================================= */}
      <section className="pt-24 pb-12 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Choose Your Goal</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {segments.map((seg: any, i: number) => (
                <Link 
                    href={`/resources/${seg.slug}`} 
                    key={seg.id} 
                    className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center"
                >
                    <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">
                         {i === 0 ? '📘' : i === 1 ? '🎓' : i === 2 ? '🏛️' : '💼'}
                    </div>
                    <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors">{seg.title}</h3>
                </Link>
            ))}
        </div>
      </section>

      {/* =========================================
          4. MAIN CONTENT AREA (Now with Filter!)
         ========================================= */}
      <section className="py-16 max-w-7xl mx-auto px-6 border-t border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT COLUMN: INTERACTIVE FILTER & LIST */}
            <div className="lg:col-span-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-extrabold text-slate-900">Latest Materials</h2>
                    <p className="text-slate-500 text-sm mt-1">Pick a category to filter the list instantly.</p>
                </div>

                {/* THIS IS THE COMPONENT THAT HANDLES FILTERING */}
                <HomeMaterialsFilter segments={segments} resources={resources} />
            </div>

            {/* RIGHT COLUMN: SIDEBAR */}
            <div className="lg:col-span-4 space-y-8">
                {/* Notice Board */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                        <h3 className="font-bold">Notice Board</h3>
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    </div>
                    <div className="divide-y divide-slate-100">
                         {news.map((n: any) => (
                             <Link href={`/news/${n.id}`} key={n.id} className="block p-4 hover:bg-slate-50 transition">
                                 <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{n.title}</h4>
                                 <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toDateString()}</p>
                             </Link>
                         ))}
                    </div>
                </div>
                
                {/* Social Widgets */}
                <div className="grid grid-cols-2 gap-4">
                    <a href="#" className="bg-[#1877F2] text-white p-4 rounded-2xl text-center hover:opacity-90 transition shadow-lg shadow-blue-200">
                        <div className="text-3xl mb-1">f</div>
                        <div className="text-xs font-bold">Join Group</div>
                    </a>
                    <a href="#" className="bg-[#FF0000] text-white p-4 rounded-2xl text-center hover:opacity-90 transition shadow-lg shadow-red-200">
                        <div className="text-3xl mb-1">▶</div>
                        <div className="text-xs font-bold">Subscribe</div>
                    </a>
                </div>

                {/* Teacher Promo */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white text-center shadow-xl relative overflow-hidden">
                    <h4 className="font-black text-xl mb-2 relative z-10">Need 1-on-1 Help?</h4>
                    <p className="text-indigo-100 text-xs mb-4 relative z-10">Book a private session with our expert teachers.</p>
                    <a><button className="bg-white text-indigo-700 w-full py-3 rounded-xl text-sm font-black hover:bg-indigo-50 transition shadow-md relative z-10">
                        Find a Teacher
                    </button></a>
                </div>
            </div>
        </div>
      </section>

{/* 5. APP DOWNLOAD */}
<HomeAppSection />
    </div>
  );
}