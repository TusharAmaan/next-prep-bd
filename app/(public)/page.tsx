import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Apple, PlayCircle } from "lucide-react";

// Revalidate data every 60 seconds (keeps homepage fresh)
export const revalidate = 30;

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
          1. HERO SECTION
         ========================================= */}
      <section className="relative bg-slate-900 text-white pt-28 md:pt-36 pb-20 md:pb-32 px-5 md:px-6 overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/30 rounded-full blur-[80px] md:blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-indigo-600/20 rounded-full blur-[80px] md:blur-[120px]"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 md:px-4 py-1.5 rounded-full text-[11px] md:text-sm font-semibold text-blue-100 mb-6 md:mb-8 shadow-lg">
                <span className="relative flex h-1.5 md:h-2 w-1.5 md:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 md:h-2 w-1.5 md:w-2 bg-green-500"></span>
                </span>
                Bangladesh's #1 Education Portal
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1] uppercase">
                Master Your Exams with <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">NextPrepBD</span>
            </h1>
            
            <p className="text-base md:text-xl text-slate-300 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed font-medium opacity-90">
                Access thousands of free notes, question banks, video classes, and job preparation materials in one place.
            </p>

            {/* Search Bar */}
            <div className="bg-white p-1 md:p-2 rounded-xl md:rounded-2xl max-w-2xl mx-auto flex shadow-2xl transform transition-transform hover:scale-[1.01]">
                <input 
                    type="text" 
                    placeholder="Search resources..." 
                    className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 px-4 md:px-6 py-3 md:py-4 text-sm md:text-lg font-bold"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl font-black text-sm md:text-lg transition-all shadow-md uppercase tracking-widest">
                    Search
                </button>
            </div>
        </div>
      </section>

      {/* =========================================
          2. LIVE STATS COUNTER (Updated with SVGs)
         ========================================= */}
      <section className="max-w-6xl mx-auto px-5 md:px-6 relative z-20 -mt-12 md:-mt-20">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 md:divide-x divide-slate-100">
                
                {/* Stat 1: Materials */}
                <div className="flex items-center gap-4 md:gap-5 px-2 md:px-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600 shadow-sm transition-transform hover:scale-110">
                        {/* Document Icon */}
                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    </div>
                    <div>
                        <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">5,000+</h3>
                        <p className="text-[10px] md:text-sm font-black text-slate-500 uppercase tracking-[0.15em] mt-1">Study Notes</p>
                    </div>
                </div>

                {/* Stat 2: Students */}
                <div className="flex items-center gap-5 px-4 pt-8 md:pt-0">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-sm transition-transform hover:scale-110">
                        {/* User Group Icon */}
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    </div>
                    <div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">1,200+</h3>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Active Students</p>
                    </div>
                </div>

                {/* Stat 3: Visitors */}
                <div className="flex items-center gap-5 px-4 pt-8 md:pt-0">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm transition-transform hover:scale-110">
                        {/* Trending Icon */}
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
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
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-5 md:px-6">
        <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter">Explore by Category</h2>
            <div className="w-16 md:w-20 h-1 bg-blue-600 mx-auto mt-3 md:mt-4 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {segments.map((seg: any, i: number) => (
                <Link href={`/category/${seg.id}`} key={seg.id} className="group bg-white p-6 md:p-8 rounded-xl md:rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-2xl md:text-3xl mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-inner">
                        {/* Dynamic Emoji Mapping */}
                        {i === 0 ? '📘' : i === 1 ? '🎓' : i === 2 ? '🏛️' : '💼'}
                    </div>
                    <h3 className="font-black text-base md:text-lg text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{seg.title}</h3>
                    <div className="flex items-center justify-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase tracking-widest text-blue-600">
                        <span>Browse</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                </Link>
            ))}
        </div>
      </section>

      {/* =========================================
          3.5 COMPREHENSIVE LESSON PLAN TEASER
         ========================================= */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-7xl mx-auto px-5 md:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-10 md:gap-12">
            <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-3 md:px-4 py-1 rounded-full text-[9px] font-black text-indigo-300 mb-6 uppercase tracking-widest">
                   New Release ✨
                </div>
                <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase mb-6 leading-tight">
                   Comprehensive <br/> <span className="text-indigo-500">Lesson Plans</span>
                </h2>
                <p className="text-slate-400 text-base md:text-lg mb-8 md:mb-10 max-w-xl font-medium leading-relaxed opacity-90">
                   Experience the most structured curriculum ever built. Every unit, every lesson, and every small topic perfectly organized for your success.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                   <Link href="/curriculum" className="px-8 md:px-10 py-4 md:py-5 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-[0.2em] hover:bg-white hover:text-indigo-600 transition-all shadow-2xl shadow-indigo-600/20 active:scale-95">Explore Syllabus</Link>
                </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3 md:gap-4 max-w-lg lg:max-w-none">
                <div className="space-y-3 md:space-y-4">
                   <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] md:transform md:translate-y-8">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500 rounded-xl md:rounded-2xl mb-3 md:mb-4 flex items-center justify-center shadow-lg shadow-indigo-500/40 font-black text-sm md:text-base">1</div>
                      <h4 className="font-bold uppercase tracking-tight text-white text-xs md:text-sm">Unit-wise Organization</h4>
                   </div>
                   <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem]">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-pink-500 rounded-xl md:rounded-2xl mb-3 md:mb-4 flex items-center justify-center shadow-lg shadow-pink-500/40 font-black text-sm md:text-base">2</div>
                      <h4 className="font-bold uppercase tracking-tight text-white text-xs md:text-sm">Lesson Breakdown</h4>
                   </div>
                </div>
                <div className="space-y-3 md:space-y-4 pt-8 md:pt-12">
                   <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem]">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500 rounded-xl md:rounded-2xl mb-3 md:mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/40 font-black text-sm md:text-base">3</div>
                      <h4 className="font-bold uppercase tracking-tight text-white text-xs md:text-sm">Practical Exercises</h4>
                   </div>
                   <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] md:transform md:lg:-translate-y-8">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500 rounded-xl md:rounded-2xl mb-3 md:mb-4 flex items-center justify-center shadow-lg shadow-amber-500/40 font-black text-sm md:text-base">4</div>
                      <h4 className="font-bold uppercase tracking-tight text-white text-xs md:text-sm">Exam Integration</h4>
                   </div>
                </div>
            </div>
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
          6. APP DOWNLOAD CTA
         ========================================= */}
      <section className="bg-white border-t border-slate-200 py-16 md:py-24 px-5 md:px-6">
        <div className="max-w-5xl mx-auto bg-black rounded-[1.5rem] md:rounded-[3rem] p-8 md:p-24 text-center relative overflow-hidden shadow-2xl">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-40"></div>
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600 rounded-full blur-[100px] opacity-40"></div>

            <div className="relative z-10">
                <h2 className="text-3xl md:text-6xl font-black text-white mb-6 tracking-tight uppercase">Study Anywhere.</h2>
                <p className="text-slate-400 text-base md:text-xl mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium opacity-90">
                    Download the NextPrepBD app to save notes offline, take quizzes on the go, and get instant notifications about exams.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-5">
                    {/* APP STORE BUTTON */}
                    <button className="flex items-center gap-3 md:gap-4 bg-white text-black px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-slate-200 transition group shadow-xl hover:scale-105 transform duration-200">
                       <Apple className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" />
                       <div className="text-left leading-none">
                           <div className="text-[7px] md:text-[8px] font-bold text-slate-500 mb-1">Download on the</div>
                           <div className="text-base md:text-xl">App Store</div>
                       </div>
                    </button>

                    {/* GOOGLE PLAY BUTTON */}
                    <button className="flex items-center gap-3 md:gap-4 bg-white/10 backdrop-blur border border-white/20 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-white/20 transition group shadow-xl hover:scale-105 transform duration-200">
                       <PlayCircle className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" />
                       <div className="text-left leading-none">
                           <div className="text-[7px] md:text-[8px] font-bold text-slate-400 mb-1">GET IT ON</div>
                           <div className="text-base md:text-xl">Google Play</div>
                       </div>
                    </button>
                </div>
            </div>
        </div>
      </section>

    </div>
  );
}