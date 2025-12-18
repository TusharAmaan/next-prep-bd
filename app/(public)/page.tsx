import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

// Revalidate data every 60 seconds (keeps homepage fresh)
export const revalidate = 60;

export default async function HomePage() {
  
  // 1. FETCH DATA IN PARALLEL
  const [segmentsData, latestResources, latestNews, featuredCourses] = await Promise.all([
    supabase.from("segments").select("*").order("id"),
    supabase.from("resources").select("*").limit(6).order("created_at", { ascending: false }),
    supabase.from("news").select("*").limit(3).order("created_at", { ascending: false }),
    supabase.from("courses").select("*").limit(3).order("created_at", { ascending: false })
  ]);

  const segments = segmentsData.data || [];
  const resources = latestResources.data || [];
  const news = latestNews.data || [];
  const courses = featuredCourses.data || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* =========================================
          1. HERO SECTION (Taller padding for overlap)
         ========================================= */}
      <section className="relative bg-slate-900 text-white pt-36 pb-32 px-6 overflow-hidden">
        
        {/* Background Gradients */}
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
                Access thousands of free notes, question banks, video classes, and job preparation materials in one place.
            </p>

            {/* Search Bar */}
            <div className="bg-white p-2 rounded-2xl max-w-2xl mx-auto flex shadow-2xl transform transition-transform hover:scale-[1.01]">
                <input 
                    type="text" 
                    placeholder="What do you want to learn today?" 
                    className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 px-6 py-4 text-lg"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-md">
                    Search
                </button>
            </div>
        </div>
      </section>

      {/* =========================================
          2. LIVE STATS COUNTER (Floating Card)
         ========================================= */}
      <section className="max-w-6xl mx-auto px-6 relative z-20 -mt-20">
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                
                {/* Stat 1 */}
                <div className="flex items-center gap-5 px-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm text-blue-600">
                        📚
                    </div>
                    <div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">5,000+</h3>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Study Notes</p>
                    </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center gap-5 px-4 pt-8 md:pt-0">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm text-green-600">
                        🎓
                    </div>
                    <div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">1,200+</h3>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Active Students</p>
                    </div>
                </div>

                {/* Stat 3 */}
                <div className="flex items-center gap-5 px-4 pt-8 md:pt-0">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm text-orange-600">
                        🔥
                    </div>
                    <div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">500+</h3>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Daily Visitors</p>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* =========================================
          3. BROWSE CATEGORIES
         ========================================= */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Explore by Category</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {segments.map((seg: any, i: number) => (
                <Link href={`/category/${seg.id}`} key={seg.id} className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all text-center">
                    <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform shadow-inner">
                        {/* Dynamic Emoji Mapping */}
                        {i === 0 ? '📘' : i === 1 ? '🎓' : i === 2 ? '🏛️' : '💼'}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{seg.title}</h3>
                    <div className="flex items-center justify-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-blue-600">
                        <span>Browse</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                </Link>
            ))}
        </div>
      </section>

      {/* =========================================
          4. PREMIUM COURSES
         ========================================= */}
      {courses.length > 0 && (
        <section className="py-24 bg-white border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900">Premium Courses</h2>
                        <p className="text-slate-500 mt-2 text-lg">Learn from the country's best instructors.</p>
                    </div>
                    <Link href="/courses" className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition flex items-center gap-2">
                        View All Courses 
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {courses.map((course: any) => (
                        <div key={course.id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            <div className="h-52 bg-slate-200 relative overflow-hidden">
                                {course.thumbnail_url ? (
                                    <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">No Image</div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-md text-xs font-bold px-3 py-1.5 rounded-full text-slate-800 flex items-center gap-1">
                                    <span>⏱</span> {course.duration}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-xl text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition">{course.title}</h3>
                                <p className="text-sm text-slate-500 mb-5 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">👨‍🏫</span>
                                    {course.instructor}
                                </p>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-green-600">৳{course.discount_price || course.price}</span>
                                        {course.discount_price && <span className="text-sm text-slate-400 line-through font-medium">৳{course.price}</span>}
                                    </div>
                                    <Link href={`/courses/${course.id}`} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition shadow-lg shadow-slate-200">Enroll Now</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      )}

      {/* =========================================
          5. RESOURCES & NOTICE BOARD
         ========================================= */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left: Study Materials (8 cols) */}
            <div className="lg:col-span-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-extrabold text-slate-900">Fresh Study Materials</h2>
                    <Link href="/materials" className="text-sm font-bold text-blue-600 border border-blue-100 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition">See All</Link>
                </div>
                <div className="space-y-4">
                    {resources.map((res: any) => (
                        <div key={res.id} className="flex items-center gap-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition group cursor-pointer">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${res.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                {res.type === 'pdf' ? '📄' : '✍️'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-lg text-slate-900 truncate group-hover:text-blue-600 transition mb-1">{res.title}</h4>
                                <div className="flex gap-3 text-xs text-slate-500 font-bold uppercase tracking-wide">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded">{res.type}</span>
                                    <span className="py-0.5">{new Date(res.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <Link href={res.type === 'blog' ? `/blog/${res.id}` : res.content_url} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Notice Board (4 cols) */}
            <div className="lg:col-span-4">
                <div className="bg-slate-900 text-white p-6 rounded-t-2xl flex justify-between items-center shadow-lg">
                    <h3 className="font-bold text-lg">Notice Board</h3>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </div>
                <div className="bg-white border border-t-0 border-slate-200 rounded-b-2xl p-2 shadow-sm">
                    {news.map((n: any, i: number) => (
                        <div key={n.id} className={`p-5 ${i !== news.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50 transition rounded-xl group`}>
                            <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">{n.category || 'Update'}</span>
                            <h4 className="font-bold text-sm text-slate-800 leading-relaxed mb-2 group-hover:text-blue-600 cursor-pointer">{n.title}</h4>
                            <p className="text-xs text-slate-400 font-medium">{new Date(n.created_at).toDateString()}</p>
                        </div>
                    ))}
                    <Link href="/news" className="block text-center text-xs font-bold text-slate-500 py-4 hover:text-black uppercase tracking-widest border-t border-slate-50 mt-2">
                        View All Notices
                    </Link>
                </div>

                {/* Teacher Promo */}
                <div className="mt-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center shadow-xl shadow-blue-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-overlay opacity-10 -mr-10 -mt-10"></div>
                    <h4 className="font-black text-2xl mb-2 relative z-10">Need 1-on-1 Help?</h4>
                    <p className="text-blue-100 text-sm mb-6 relative z-10 font-medium">Book a session with our expert teachers today and clear your doubts.</p>
                    <button className="bg-white text-blue-700 px-8 py-3 rounded-xl text-sm font-black hover:bg-blue-50 transition relative z-10 shadow-lg w-full">Find a Teacher</button>
                </div>
            </div>

        </div>
      </section>

      {/* =========================================
          6. APP DOWNLOAD CTA (Official SVGs)
         ========================================= */}
      <section className="bg-white border-t border-slate-200 py-24 px-6">
        <div className="max-w-5xl mx-auto bg-black rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-40"></div>
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600 rounded-full blur-[100px] opacity-40"></div>

            <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Study Anytime, Anywhere.</h2>
                <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                    Download the NextPrepBD app to save notes offline, take quizzes on the go, and get instant notifications about exams.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-5">
                    {/* APP STORE */}
                    <button className="flex items-center gap-4 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition group shadow-xl hover:scale-105 transform duration-200">
                       <svg className="w-8 h-8 fill-current" viewBox="0 0 384 512">
                           <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 79.9c5.2 14.7 19.7 42.9 44.9 77.1 19.3 26.2 38.3 49 63.6 49 19.7 0 32.2-12.7 63-12.7 29.5 0 40.7 12.7 62.7 12.7 26.5 0 42.6-20.4 63.3-48.8 17.5-23.7 28.1-46.5 37-67.6-33.8-13.7-54.3-43.2-54.2-74.5zm-59.3-132.2c16.3-18.8 30.2-46.5 25.1-75.1-23.9 1.5-51.7 15.6-67.3 34.2-13.7 16.2-25.2 41.7-22 72.9 26.9 2.1 53.6-13.1 64.2-32z"/>
                       </svg>
                       <div className="text-left leading-none">
                           <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Download on the</div>
                           <div className="text-xl font-black">App Store</div>
                       </div>
                    </button>

                    {/* GOOGLE PLAY */}
                    <button className="flex items-center gap-4 bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition group shadow-xl hover:scale-105 transform duration-200">
                       <svg className="w-8 h-8 fill-current" viewBox="0 0 512 512">
                           <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                       </svg>
                       <div className="text-left leading-none">
                           <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">GET IT ON</div>
                           <div className="text-xl font-black">Google Play</div>
                       </div>
                    </button>
                </div>
            </div>
        </div>
      </section>

    </div>
  );
}