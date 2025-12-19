import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

// 1. Force dynamic rendering so new posts show up instantly
export const dynamic = "force-dynamic";

export default async function HomePage() {
  
  // 2. FETCH DATA DIRECTLY (No Client Components)
  const [segmentsData, latestResources, latestNews] = await Promise.all([
    supabase.from("segments").select("*").order("id"),
    // Fetch the latest 6 items regardless of category
    supabase.from("resources")
      .select("*, subjects ( title, groups ( segments ( id, title, slug ) ) )")
      .limit(6)
      .order("created_at", { ascending: false }),
    supabase.from("news").select("*").limit(5).order("created_at", { ascending: false }),
  ]);

  // Safety check: Ensure arrays exist even if DB fails
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
                Bangladesh's #1 Education Portal
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
                Master Your Exams with <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">NextPrepBD</span>
            </h1>
            
            {/* SEARCH FORM */}
            <form action="/search" method="GET" className="bg-white p-2 rounded-2xl max-w-2xl mx-auto flex shadow-2xl transform transition-transform hover:scale-[1.01]">
                <input 
                    name="q" 
                    type="text" 
                    placeholder="Search for notes (e.g. Physics)" 
                    className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 px-6 py-4 text-lg"
                    required
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-md">
                    Search
                </button>
            </form>
        </div>
      </section>

      {/* =========================================
          2. STATS BAR
         ========================================= */}
      <section className="max-w-6xl mx-auto px-6 relative z-20 -mt-20">
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="text-center">
                    <h3 className="text-4xl font-black text-slate-900">5,000+</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase mt-1">Study Notes</p>
                </div>
                <div className="text-center pt-4 md:pt-0">
                    <h3 className="text-4xl font-black text-slate-900">1,200+</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase mt-1">Students</p>
                </div>
                <div className="text-center pt-4 md:pt-0">
                    <h3 className="text-4xl font-black text-slate-900">500+</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase mt-1">Daily Visitors</p>
                </div>
            </div>
        </div>
      </section>

      {/* =========================================
          3. CATEGORIES (Based on your folder structure)
         ========================================= */}
      <section className="pt-24 pb-12 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Choose Your Goal</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {segments.map((seg: any, i: number) => (
                <Link 
                    // Direct link to your dynamic folder: /resources/[segment_slug]
                    href={`/resources/${seg.slug}`} 
                    key={seg.id} 
                    className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center"
                >
                    <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">
                         {/* Simple emoji logic based on index */}
                         {i === 0 ? '📘' : i === 1 ? '🎓' : i === 2 ? '🏛️' : '💼'}
                    </div>
                    <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors">{seg.title}</h3>
                </Link>
            ))}
        </div>
      </section>

      {/* =========================================
          4. MAIN CONTENT AREA
         ========================================= */}
      <section className="py-16 max-w-7xl mx-auto px-6 border-t border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT COLUMN: LATEST MATERIALS (Static List - No Tabs) */}
            <div className="lg:col-span-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-extrabold text-slate-900">Freshly Added</h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {resources.length > 0 ? (
                        resources.map((res: any) => (
                            <Link 
                              href={res.type === 'blog' ? `/blog/${res.id}` : res.content_url} 
                              key={res.id} 
                              className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
                            >
                              {/* Icon */}
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${res.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                 {res.type === 'pdf' ? '📄' : '✍️'}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition text-lg">
                                  {res.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    {/* Show which subject/segment this belongs to */}
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                        {res.subjects?.title || "General"}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">
                                        {new Date(res.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                              </div>
                              
                              {/* Arrow */}
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                              </div>
                            </Link>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            No materials added yet.
                        </div>
                    )}
                </div>
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
                    <button className="bg-white text-indigo-700 w-full py-3 rounded-xl text-sm font-black hover:bg-indigo-50 transition shadow-md relative z-10">
                        Find a Teacher
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* =========================================
          5. APP DOWNLOAD
         ========================================= */}
      <section className="bg-white border-t border-slate-200 py-24 px-6">
        <div className="max-w-5xl mx-auto bg-black rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
            {/* Simple Background */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-gradient-to-r from-gray-800 to-gray-900"></div>

            <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Study Anytime, Anywhere.</h2>
                <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                    Download the NextPrepBD app to save notes offline and take quizzes on the go.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-5">
                    {/* Placeholder Buttons */}
                    <button className="bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition">
                        Download on App Store
                    </button>
                    <button className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition">
                        Get it on Google Play
                    </button>
                </div>
            </div>
        </div>
      </section>

    </div>
  );
}