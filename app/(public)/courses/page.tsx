import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { BookOpen, Clock, User, ArrowRight, Search, GraduationCap, Sparkles, Star } from "lucide-react";
import BookmarkButton from "@/components/shared/BookmarkButton";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  // 1. Fetch data
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true) 
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);
  }

  // Helper to calculate discount percentage
  const getDiscountPercent = (price: number, discountPrice: number) => {
     if (!price || !discountPrice) return 0;
     return Math.round(((price - discountPrice) / price) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* --- 1. PREMIUM HEADER --- */}
      <div className="bg-slate-900 text-white pt-40 pb-32 relative overflow-hidden border-b border-white/5">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none -ml-20 -mb-20"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
           {/* Top Badge */}
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-8">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span>Upgrade your skills today</span>
           </div>

           <h1 className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter leading-[0.9]">
             Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Courses</span>
           </h1>
           
           <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
             Join thousands of students mastering new subjects with our expert-led, self-paced, and interactive curriculums designed for excellence.
           </p>

           {/* Search Bar */}
           <div className="max-w-xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input 
                 type="text" 
                 placeholder="Search courses (e.g., Web Design, Math...)" 
                 className="block w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-2xl backdrop-blur-sm font-bold text-sm"
              />
           </div>
        </div>
      </div>

      {/* --- 2. MAIN CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 pb-32">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses && courses.length > 0 ? (
              courses.map((course) => (
                  <div key={course.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl dark:hover:shadow-indigo-900/10 hover:-translate-y-3 transition-all duration-500 border border-slate-100 dark:border-slate-800 flex flex-col group h-full">
                      
                      {/* IMAGE AREA */}
                      <Link href={`/courses/${course.id}`} className="block relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                          {course.image_url ? (
                              <img 
                                  src={course.image_url} 
                                  alt={course.title} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                              />
                          ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                                  <GraduationCap className="w-14 h-14 mb-3 opacity-30" />
                              </div>
                          )}
                          
                          {/* Top Right Badge */}
                          <div className="absolute top-5 right-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-slate-900 dark:text-white text-[8px] font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 border border-slate-100/10 uppercase tracking-widest transition-colors">
                              <Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                              {course.duration || "Self-Paced"}
                          </div>

                          {/* Top Left Bookmark */}
                          <div className="absolute top-5 left-5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                             <BookmarkButton 
                                itemType="course" 
                                itemId={course.id} 
                                metadata={{ title: course.title, thumbnail_url: course.thumbnail_url }} 
                             />
                          </div>

                          {/* Hover Overlay Icon */}
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 scale-50 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                                <ArrowRight className="w-6 h-6" />
                             </div>
                          </div>
                      </Link>

                      {/* CONTENT AREA */}
                      <div className="p-8 md:p-10 flex-1 flex flex-col">
                          {/* Category Tag */}
                          <div className="flex items-center justify-between mb-5">
                             <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg transition-colors">
                                COURSE
                             </span>
                             <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-[10px] font-bold">4.9</span>
                             </div>
                          </div>

                          <Link href={`/courses/${course.id}`}>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 tracking-tight">
                                  {course.title}
                              </h3>
                          </Link>

                          {/* Instructor */}
                          <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 transition-colors">
                              <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                  <User className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate">{course.instructor || "Academic Board"}</span>
                          </div>
                          
                          {/* Description */}
                          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-8 leading-relaxed font-medium transition-colors">
                                {course.description 
                                   ? course.description.replace(/<[^>]+>/g, '') 
                                   : "Master this subject with our comprehensive curriculum and expert guidance."}
                          </p>

                          {/* FOOTER: Price & Button */}
                          <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                              
                              <div className="flex flex-col">
                                  {course.discount_price ? (
                                      <>
                                          <div className="flex items-center gap-2.5 mb-0.5">
                                             <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter transition-colors">৳{course.discount_price}</span>
                                             <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-lg shadow-rose-500/20 uppercase tracking-wider">
                                               -{getDiscountPercent(course.price, course.discount_price)}%
                                             </span>
                                          </div>
                                          <span className="text-[10px] text-slate-400 dark:text-slate-600 line-through font-bold uppercase tracking-widest">৳{course.price}</span>
                                      </>
                                  ) : (
                                      <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter transition-colors">
                                          {course.price ? `৳${course.price}` : "Free access"}
                                      </span>
                                  )}
                              </div>
                              
                              <Link 
                                  href={`/courses/${course.id}`} 
                                  className="group/btn bg-slate-900 dark:bg-indigo-600 text-white pl-6 pr-5 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 dark:shadow-indigo-600/20 hover:scale-105 active:scale-95 flex items-center gap-2.5"
                              >
                                  Enroll Now
                                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
                              </Link>
                          </div>
                      </div>
                  </div>
              ))
          ) : (
              // EMPTY STATE
              <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner">
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-200 dark:text-slate-700 border border-slate-50 dark:border-slate-800 animate-pulse">
                     <GraduationCap className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">No active courses</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto font-medium">
                      Our experts are currently updating the course catalog. Check back soon for new premium content!
                  </p>
                  <button className="mt-10 px-10 py-5 bg-slate-900 dark:bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20">
                      Notify Me
                  </button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}