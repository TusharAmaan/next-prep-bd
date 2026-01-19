import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { BookOpen, Clock, User, ArrowRight, Search, GraduationCap, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  // 1. Fetch data
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "approved") // <--- CRITICAL FIX: Only show live, approved courses
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
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* --- 1. DARK CONTRASTY HEADER --- */}
      <div className="bg-slate-900 text-white pt-32 pb-24 relative overflow-hidden">
        
        {/* Decorative Background Blurs */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
             <div className="absolute right-0 top-10 w-96 h-96 bg-blue-600 rounded-full blur-[120px] translate-x-1/2"></div>
             <div className="absolute left-10 bottom-10 w-64 h-64 bg-indigo-600 rounded-full blur-[80px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
           {/* Top Badge */}
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-blue-300 text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>Upgrade your skills today</span>
           </div>

           <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
             Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Premium Courses</span>
           </h1>
           
           <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
             Join thousands of students mastering new subjects with our expert-led, self-paced, and interactive curriculums.
           </p>

           {/* Fake Search Bar for Visual Completeness */}
           <div className="max-w-xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500" />
              </div>
              <input 
                 type="text" 
                 placeholder="What do you want to learn?" 
                 className="block w-full pl-11 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-900/50 transition-all shadow-xl"
              />
           </div>
        </div>
      </div>

      {/* --- 2. MAIN CONTENT (Overlaps Header) --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 pb-20">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses && courses.length > 0 ? (
              courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-200 flex flex-col group h-full">
                      
                      {/* IMAGE AREA - Fixed Aspect Ratio (16:9) */}
                      <Link href={`/courses/${course.id}`} className="block relative aspect-video bg-slate-100 overflow-hidden">
                          {course.thumbnail_url ? (
                              <img 
                                  src={course.thumbnail_url} 
                                  alt={course.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                              />
                          ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                                  <GraduationCap className="w-12 h-12 mb-2 opacity-20" />
                              </div>
                          )}
                          
                          {/* OVERLAYS */}
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                          
                          {/* Top Right Badge */}
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-600" />
                              {course.duration || "Self-Paced"}
                          </div>
                      </Link>

                      {/* CONTENT AREA */}
                      <div className="p-6 flex-1 flex flex-col relative">
                          {/* Category Tag */}
                          <div className="mb-3">
                             <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                Course
                             </span>
                          </div>

                          <Link href={`/courses/${course.id}`}>
                              <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                  {course.title}
                              </h3>
                          </Link>

                          {/* Instructor */}
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                  <User className="w-3 h-3" />
                              </div>
                              <span>{course.instructor || "NextPrep Team"}</span>
                          </div>
                          
                          {/* Description */}
                          <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                               {course.description 
                                  ? course.description.replace(/<[^>]+>/g, '') 
                                  : "Master this subject with our comprehensive curriculum."}
                          </p>

                          {/* FOOTER: Price & Button */}
                          <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                              
                              {/* Price Logic */}
                              <div className="flex flex-col">
                                  {course.discount_price ? (
                                      <>
                                          <div className="flex items-center gap-2">
                                             <span className="text-lg font-extrabold text-slate-900">৳{course.discount_price}</span>
                                             <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                               -{getDiscountPercent(course.price, course.discount_price)}%
                                             </span>
                                          </div>
                                          <span className="text-xs text-slate-400 line-through font-medium">Original: ৳{course.price}</span>
                                      </>
                                  ) : (
                                      <span className="text-lg font-extrabold text-slate-900">
                                          {course.price ? `৳${course.price}` : "Free"}
                                      </span>
                                  )}
                              </div>
                              
                              <Link 
                                  href={`/courses/${course.id}`} 
                                  className="group/btn bg-slate-900 text-white pl-5 pr-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:bg-blue-600 hover:shadow-blue-500/30 flex items-center gap-2"
                              >
                                  Enroll
                                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                              </Link>
                          </div>
                      </div>
                  </div>
              ))
          ) : (
              // EMPTY STATE
              <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                     <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No active courses found</h3>
                  <p className="text-slate-500 mt-2 max-w-md mx-auto">
                      We are currently updating our course catalog with new and exciting content. Please check back soon!
                  </p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}