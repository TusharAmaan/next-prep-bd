import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import MaterialsTabs from "@/components/MaterialsTabs"; // Import the client component

// Revalidate data every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
  
  // 1. FETCH DATA
  const [segmentsData, latestResources, latestNews, featuredCourses] = await Promise.all([
    supabase.from("segments").select("*").order("id"),
    // Fetching more resources (20) so filtering on the client side has data to work with
    supabase.from("resources").select("*").limit(20).order("created_at", { ascending: false }),
    supabase.from("news").select("*").limit(5).order("created_at", { ascending: false }),
    supabase.from("courses").select("*").limit(3).order("created_at", { ascending: false })
  ]);

  const segments = segmentsData.data || [];
  const resources = latestResources.data || [];
  const news = latestNews.data || [];
  const courses = featuredCourses.data || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* =========================================
          1. HERO SECTION (Fixed Search)
         ========================================= */}
      <section className="relative bg-slate-900 text-white pt-36 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
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
            
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Access thousands of free notes, question banks, video classes, and job preparation materials.
            </p>

            {/* WORKING SEARCH BAR */}
            {/* We use a standard HTML form that sends the user to /materials?search=... */}
            <form action="/materials" method="GET" className="bg-white p-2 rounded-2xl max-w-2xl mx-auto flex shadow-2xl transform transition-transform hover:scale-[1.01]">
                <input 
                    name="search"
                    type="text" 
                    placeholder="What do you want to learn today?" 
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
          2. LIVE STATS (Unchanged)
         ========================================= */}
      <section className="max-w-6xl mx-auto px-6 relative z-20 -mt-20">
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 p-8 md:p-10">
           {/* ... (Keep your existing SVG stats code here) ... */}
           {/* For brevity, I am keeping the structure simple, paste your SVG stats block here if you removed it, 
               otherwise keep the previous one. I'll put a placeholder: */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                 <div className="p-4">
                    <h3 className="text-4xl font-black text-slate-900">5,000+</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase">Study Notes</p>
                 </div>
                 <div className="p-4 border-t md:border-t-0 md:border-l border-slate-100">
                    <h3 className="text-4xl font-black text-slate-900">1,200+</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase">Students</p>
                 </div>
                 <div className="p-4 border-t md:border-t-0 md:border-l border-slate-100">
                    <h3 className="text-4xl font-black text-slate-900">500+</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase">Daily Visitors</p>
                 </div>
            </div>
        </div>
      </section>

      {/* =========================================
          3. BROWSE CATEGORIES (Refined UI "Like a Boss")
         ========================================= */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Choose Your Goal</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {segments.map((seg: any, i: number) => (
                <Link href={`/category/${seg.id}`} key={seg.id} className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center overflow-hidden">
                    {/* Hover Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative z-10">
                        <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center text-4xl mb-4 shadow-md group-hover:scale-110 transition-transform ring-4 ring-slate-50 group-hover:ring-blue-100">
                             {/* Dynamic Emoji Mapping */}
                             {i === 0 ? '📘' : i === 1 ? '🎓' : i === 2 ? '🏛️' : '💼'}
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors">{seg.title}</h3>
                        <p className="text-xs text-slate-400 mt-2 font-medium">View Materials</p>
                    </div>
                </Link>
            ))}
        </div>
      </section>

      {/* =========================================
          4. PREMIUM COURSES (Unchanged)
         ========================================= */}
      {/* ... Keep your existing Premium Courses section code here ... */}


      {/* =========================================
          5. RESOURCES & SIDEBAR (Redesigned)
         ========================================= */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left: Interactive Study Materials (8 cols) */}
            <div className="lg:col-span-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900">Latest Materials</h2>
                        <p className="text-slate-500 text-sm mt-1">Pick a category to filter the list</p>
                    </div>
                </div>
                
                {/* The New Interactive Component */}
                <MaterialsTabs segments={segments} resources={resources} />
            </div>

            {/* Right: Redesigned Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* 1. Notice Board (Compact) */}
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

                {/* 2. Social Media Widgets */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Facebook */}
                    <a href="https://facebook.com/your-page" target="_blank" className="bg-[#1877F2] text-white p-4 rounded-2xl text-center hover:opacity-90 transition shadow-lg shadow-blue-200">
                        <div className="text-3xl mb-1">f</div>
                        <div className="text-xs font-bold">Join Group</div>
                    </a>
                    {/* YouTube */}
                    <a href="https://youtube.com/@your-channel" target="_blank" className="bg-[#FF0000] text-white p-4 rounded-2xl text-center hover:opacity-90 transition shadow-lg shadow-red-200">
                        <div className="text-3xl mb-1">▶</div>
                        <div className="text-xs font-bold">Subscribe</div>
                    </a>
                </div>

                {/* 3. Teacher Promo */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white text-center shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h4 className="font-black text-xl mb-2">Need 1-on-1 Help?</h4>
                        <p className="text-indigo-100 text-xs mb-4">Book a private session with our expert teachers.</p>
                        <button className="bg-white text-indigo-700 w-full py-3 rounded-xl text-sm font-black hover:bg-indigo-50 transition shadow-md">
                            Find a Teacher
                        </button>
                    </div>
                </div>

                {/* 4. Quick Tools */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-900 mb-4">Quick Tools</h4>
                    <div className="space-y-3">
                        <Link href="/gpa-calculator" className="flex items-center gap-3 text-slate-600 hover:text-blue-600 font-medium text-sm p-2 hover:bg-blue-50 rounded-lg transition">
                            <span>🧮</span> GPA Calculator
                        </Link>
                        <Link href="/syllabus" className="flex items-center gap-3 text-slate-600 hover:text-blue-600 font-medium text-sm p-2 hover:bg-blue-50 rounded-lg transition">
                            <span>📋</span> Full Syllabus
                        </Link>
                        <Link href="/routines" className="flex items-center gap-3 text-slate-600 hover:text-blue-600 font-medium text-sm p-2 hover:bg-blue-50 rounded-lg transition">
                            <span>📅</span> Exam Routine
                        </Link>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* APP DOWNLOAD (Keep existing) */}
      <section className="bg-white border-t border-slate-200 py-24 px-6 text-center">
         <h2 className="text-2xl font-bold text-slate-900 mb-4">Download Our App</h2>
         <p className="text-slate-500 mb-8">Get the best learning experience on mobile.</p>
         <div className="inline-flex gap-4">
             <div className="w-40 h-12 bg-black rounded-lg"></div>
             <div className="w-40 h-12 bg-slate-800 rounded-lg"></div>
         </div>
      </section>

    </div>
  );
}