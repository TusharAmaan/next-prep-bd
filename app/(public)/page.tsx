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
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* SECTION 1: HERO WITH SEARCH */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-20 -mt-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -ml-20 -mb-20"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="bg-blue-500/20 text-blue-200 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30 mb-6 inline-block">
                🚀 Bangladesh's #1 Education Portal
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                Master Your Exams with <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">NextPrepBD</span>
            </h1>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
                Access thousands of free notes, question banks, video classes, and job preparation materials in one place.
            </p>

            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10 max-w-2xl mx-auto flex shadow-2xl">
                <input 
                    type="text" 
                    placeholder="What do you want to learn today?" 
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 px-4 py-3"
                />
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all">
                    Search
                </button>
            </div>
        </div>
      </section>

      {/* SECTION 2: STATS STRIP */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 grid grid-cols-2 md:grid-cols-4 p-8 gap-8 text-center divide-x divide-gray-100">
            <div>
                <h3 className="text-3xl font-black text-blue-600">5k+</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Study Materials</p>
            </div>
            <div>
                <h3 className="text-3xl font-black text-blue-600">120+</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Video Classes</p>
            </div>
            <div>
                <h3 className="text-3xl font-black text-blue-600">50k+</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Daily Students</p>
            </div>
            <div className="border-none">
                <h3 className="text-3xl font-black text-blue-600">24/7</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Live Support</p>
            </div>
        </div>
      </section>

      {/* SECTION 3: BROWSE CATEGORIES */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Explore by Category</h2>
            <p className="text-gray-500 mt-2">Find exactly what you need for your level.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {segments.map((seg: any, i: number) => (
                <Link href={`/category/${seg.id}`} key={seg.id} className="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all text-center">
                    <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                        {i === 0 ? '📘' : i === 1 ? '🎓' : i === 2 ? '🏛️' : '💼'}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{seg.title}</h3>
                    <p className="text-xs text-gray-400 mt-2 font-bold uppercase">View Materials →</p>
                </Link>
            ))}
        </div>
      </section>

      {/* SECTION 4: FEATURED COURSES */}
      {courses.length > 0 && (
        <section className="py-20 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">Premium Courses</h2>
                        <p className="text-gray-500 mt-2">Learn from the country's best instructors.</p>
                    </div>
                    <Link href="/courses" className="text-blue-600 font-bold hover:underline">View All Courses →</Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {courses.map((course: any) => (
                        <div key={course.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                {course.thumbnail_url ? (
                                    <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">No Image</div>
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-gray-800">
                                    {course.duration}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition">{course.title}</h3>
                                <p className="text-sm text-gray-500 mb-4">{course.instructor}</p>
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-black text-green-600">৳{course.discount_price || course.price}</span>
                                        {course.discount_price && <span className="text-sm text-gray-400 line-through">৳{course.price}</span>}
                                    </div>
                                    <Link href={`/courses/${course.id}`} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition">Enroll Now</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      )}

      {/* SECTION 5: LATEST RESOURCES & NEWS */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left: Study Materials */}
            <div className="lg:col-span-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-extrabold text-gray-900">Fresh Study Materials</h2>
                    <Link href="/materials" className="text-sm font-bold text-blue-600 border border-blue-100 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition">See All</Link>
                </div>
                <div className="space-y-4">
                    {resources.map((res: any) => (
                        <div key={res.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition group cursor-pointer">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0 ${res.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                {res.type === 'pdf' ? '📄' : '✍️'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition">{res.title}</h4>
                                <div className="flex gap-3 mt-1 text-xs text-gray-500 font-medium">
                                    <span>{new Date(res.created_at).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className="uppercase">{res.type}</span>
                                </div>
                            </div>
                            <Link href={res.type === 'blog' ? `/blog/${res.id}` : res.content_url} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition">
                                ➔
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Notice Board */}
            <div className="lg:col-span-4">
                <div className="bg-slate-900 text-white p-6 rounded-t-2xl flex justify-between items-center">
                    <h3 className="font-bold text-lg">Notice Board</h3>
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                </div>
                <div className="bg-white border border-t-0 border-gray-200 rounded-b-2xl p-2">
                    {news.map((n: any, i: number) => (
                        <div key={n.id} className={`p-4 ${i !== news.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition rounded-lg`}>
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mb-2 inline-block">{n.category || 'Update'}</span>
                            <h4 className="font-bold text-sm text-gray-800 leading-relaxed mb-2 hover:text-blue-600 cursor-pointer">{n.title}</h4>
                            <p className="text-xs text-gray-400">{new Date(n.created_at).toDateString()}</p>
                        </div>
                    ))}
                    <Link href="/news" className="block text-center text-xs font-bold text-gray-500 py-4 hover:text-black uppercase tracking-widest border-t border-gray-50 mt-2">
                        View All Notices
                    </Link>
                </div>

                <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white text-center shadow-lg shadow-blue-200">
                    <h4 className="font-bold text-xl mb-2">Need 1-on-1 Help?</h4>
                    <p className="text-blue-100 text-sm mb-4">Book a session with our expert teachers today.</p>
                    <button className="bg-white text-blue-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-100 transition">Find a Teacher</button>
                </div>
            </div>

        </div>
      </section>

      {/* SECTION 6: APP DOWNLOAD CTA (UPDATED ICONS) */}
      <section className="bg-slate-50 border-t border-gray-200 py-20 px-6">
        <div className="max-w-5xl mx-auto bg-black rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-30"></div>

            <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Study Anytime, Anywhere.</h2>
                <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">Download the NextPrepBD app to save notes offline, take quizzes on the go, and get instant notifications.</p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    {/* APP STORE BUTTON */}
                    <button className="flex items-center gap-3 bg-white text-black px-6 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition group">
                       <svg className="w-6 h-6 fill-current" viewBox="0 0 384 512">
                           <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 79.9c5.2 14.7 19.7 42.9 44.9 77.1 19.3 26.2 38.3 49 63.6 49 19.7 0 32.2-12.7 63-12.7 29.5 0 40.7 12.7 62.7 12.7 26.5 0 42.6-20.4 63.3-48.8 17.5-23.7 28.1-46.5 37-67.6-33.8-13.7-54.3-43.2-54.2-74.5zm-59.3-132.2c16.3-18.8 30.2-46.5 25.1-75.1-23.9 1.5-51.7 15.6-67.3 34.2-13.7 16.2-25.2 41.7-22 72.9 26.9 2.1 53.6-13.1 64.2-32z"/>
                       </svg>
                       <div className="text-left leading-none">
                           <div className="text-[9px] uppercase font-bold text-gray-500">Download on the</div>
                           <div className="text-base font-black">App Store</div>
                       </div>
                    </button>

                    {/* GOOGLE PLAY BUTTON */}
                    <button className="flex items-center gap-3 bg-transparent border border-white/20 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-white/10 transition group">
                       <svg className="w-6 h-6 fill-current" viewBox="0 0 512 512">
                           <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                       </svg>
                       <div className="text-left leading-none">
                           <div className="text-[9px] uppercase font-bold text-gray-400">GET IT ON</div>
                           <div className="text-base font-black">Google Play</div>
                       </div>
                    </button>
                </div>
            </div>
        </div>
      </section>

    </div>
  );
}