import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const { data: courses } = await supabase.from("courses").select("*").order('created_at', { ascending: false });

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
                <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group">
                    
                    {/* LINK TO INTERNAL DETAILS PAGE */}
                    <Link href={`/courses/${course.id}`} className="block h-56 bg-gray-200 relative overflow-hidden">
                        {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">No Image</div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-gray-900 text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
                            {course.duration || "Self-Paced"}
                        </div>
                    </Link>

                    {/* CONTENT */}
                    <div className="p-6 flex-1 flex flex-col">
                        <Link href={`/courses/${course.id}`}>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                                {course.title}
                            </h3>
                        </Link>
                        <p className="text-sm text-gray-500 font-medium mb-4">By {course.instructor || "NextPrep Team"}</p>
                        
                        <div className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">
                             {course.description?.replace(/<[^>]+>/g, '') || "No description available."}
                        </div>

                        {/* PRICE & ACTION */}
{/* PRICE & ACTION */}
<div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
    <div>
        <span className="block text-xs text-gray-400 uppercase font-bold">Price</span>
        {course.discount_price ? (
            <div className="flex flex-col">
                <span className="text-xs text-gray-400 line-through font-medium">{course.price}</span>
                <span className="text-lg font-extrabold text-green-600">{course.discount_price}</span>
            </div>
        ) : (
            <span className="text-lg font-extrabold text-blue-600">{course.price || "Free"}</span>
        )}
    </div>
    
    <Link 
        href={`/courses/${course.id}`} 
        className="bg-gray-900 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-blue-500/20"
    >
        View Details
    </Link>
</div>
                    </div>
                </div>
            ))
        ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-400 text-lg">No active courses at the moment.</p>
            </div>
        )}
      </div>
    </div>
  );
}