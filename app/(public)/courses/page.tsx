import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { BookOpen, Clock, User, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  // 1. Fetch data with error handling
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .order('created_at', { ascending: false });

  // 2. Log errors to terminal for debugging
  if (error) {
    console.error("Error fetching courses:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-24 px-6">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Premium <span className="text-blue-600">Courses</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Expert-led courses designed to help you master your subjects and ace your exams.
        </p>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses && courses.length > 0 ? (
            courses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group h-full">
                    
                    {/* THUMBNAIL AREA */}
                    <Link href={`/courses/${course.id}`} className="block h-56 bg-gray-100 relative overflow-hidden">
                        {course.thumbnail_url ? (
                            <img 
                                src={course.thumbnail_url} 
                                alt={course.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                                <BookOpen className="w-12 h-12 mb-2 opacity-20" />
                                <span className="text-xs font-bold uppercase tracking-widest opacity-40">No Preview</span>
                            </div>
                        )}
                        
                        {/* DURATION BADGE */}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-blue-600" />
                            {course.duration || "Self-Paced"}
                        </div>
                    </Link>

                    {/* CONTENT AREA */}
                    <div className="p-6 flex-1 flex flex-col">
                        <Link href={`/courses/${course.id}`}>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                {course.title}
                            </h3>
                        </Link>

                        {/* Instructor Info */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-4">
                            <div className="bg-gray-100 p-1 rounded-full">
                                <User className="w-3 h-3 text-gray-500" />
                            </div>
                            <span>{course.instructor || "NextPrep Team"}</span>
                        </div>
                        
                        {/* Description (Stripped HTML) */}
                        <div className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">
                             {course.description 
                                ? course.description.replace(/<[^>]+>/g, '') 
                                : "No description available for this course."}
                        </div>

                        {/* PRICE & ACTION FOOTER */}
                        <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                            <div>
                                <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Price</span>
                                {course.discount_price ? (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-extrabold text-green-600">৳{course.discount_price}</span>
                                        <span className="text-xs text-gray-400 line-through font-medium">৳{course.price}</span>
                                    </div>
                                ) : (
                                    <span className="text-lg font-extrabold text-blue-600">
                                        {course.price ? `৳${course.price}` : "Free"}
                                    </span>
                                )}
                            </div>
                            
                            <Link 
                                href={`/courses/${course.id}`} 
                                className="group/btn bg-gray-900 hover:bg-blue-600 text-white pl-5 pr-4 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-gray-200 hover:shadow-blue-500/30 flex items-center gap-2"
                            >
                                Details
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            ))
        ) : (
            // EMPTY STATE
            <div className="col-span-full py-24 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">No active courses</h3>
                <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                    We are currently updating our course catalog. Please check back later!
                </p>
            </div>
        )}
      </div>
    </div>
  );
}