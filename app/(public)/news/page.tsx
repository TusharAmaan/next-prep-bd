import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  // 1. Fetch all news (Newest first)
  const { data: news } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-12 px-6">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Latest <span className="text-blue-600">Updates</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Stay informed with the latest exam notices, educational tips, and admission circulars.
        </p>
      </div>

      {/* NEWS GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {!news || news.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-sm border">
            <p className="text-gray-500 text-lg">No news posted yet.</p>
          </div>
        ) : (
          news.map((item) => (
            <Link 
              href={`/news/${item.id}`} 
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all hover:-translate-y-1 flex flex-col h-full"
            >
              {/* IMAGE THUMBNAIL */}
              <div className="h-48 w-full bg-gray-200 relative overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    <span className="text-sm font-bold">No Image</span>
                  </div>
                )}
                {/* CATEGORY BADGE */}
                <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {item.category || "News"}
                </span>
              </div>

              {/* CONTENT PREVIEW */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-bold mb-3 uppercase tracking-wide">
                  <span>📅 {new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                  {item.title}
                </h2>
                
                {/* READ MORE BUTTON (Pushed to bottom) */}
                <div className="mt-auto pt-4 flex items-center text-blue-600 font-bold text-sm">
                  Read Article <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}