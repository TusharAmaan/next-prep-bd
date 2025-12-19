"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// 1. ISOLATE SEARCH LOGIC IN A COMPONENT
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || ""; // Handle null safely
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      // Don't search if query is empty
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);

      // --- THE NEW SMART SEARCH QUERY ---
      // We search in Title OR SEO Title OR SEO Description
      const { data, error } = await supabase
        .from("resources")
        .select("*, subjects(title)") // Fetch subject name too
        .or(`title.ilike.%${query}%,seo_title.ilike.%${query}%,seo_description.ilike.%${query}%`)
        .limit(20);

      if (!error) {
        setResults(data || []);
      }
      setLoading(false);
    };

    // Debounce slightly to prevent spamming while typing (optional but good)
    const timeoutId = setTimeout(() => {
        fetchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Search Results</h1>
          <p className="text-gray-500">
            Showing results for <span className="font-bold text-blue-600">"{query}"</span>
          </p>
      </div>

      {loading && (
          <div className="space-y-4 animate-pulse">
              <div className="h-24 bg-gray-200 rounded-xl"></div>
              <div className="h-24 bg-gray-200 rounded-xl"></div>
              <div className="h-24 bg-gray-200 rounded-xl"></div>
          </div>
      )}

      {!loading && results.length > 0 ? (
          <div className="grid gap-4">
              {results.map((item, index) => (
                  <Link 
                    key={item.id || index} 
                    // Dynamic URL generation based on type
                    href={item.type === 'blog' ? `/blog/${item.id}` : item.content_url || "#"} 
                    target={item.type === 'pdf' ? '_blank' : '_self'} 
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex items-start gap-4 group"
                  >
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${item.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                          {item.type === 'pdf' ? '📄' : item.type === 'video' ? '▶' : '✍️'}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                            {item.title}
                          </h3>
                          
                          {/* Display SEO Description if available, else standard description */}
                          <p className="text-sm text-gray-500 line-clamp-2">
                             {item.seo_description || item.description?.replace(/<[^>]+>/g, '')}
                          </p>

                          {/* Metadata Tags */}
                          <div className="mt-3 flex gap-2">
                             {item.subjects?.title && (
                                <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">
                                    {item.subjects.title}
                                </span>
                             )}
                             <span className="text-[10px] uppercase font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                {item.type}
                             </span>
                          </div>
                      </div>
                  </Link>
              ))}
          </div>
      ) : (
          !loading && query && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <span className="text-4xl block mb-2">🔍</span>
                <p className="text-gray-500 font-medium">No matches found for "{query}".</p>
                <p className="text-sm text-gray-400">Try checking your spelling or using different keywords.</p>
            </div>
          )
      )}
    </div>
  );
}

// 2. MAIN PAGE WRAPPED IN SUSPENSE
export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <Suspense fallback={<div className="text-center pt-20 font-bold text-gray-400">Loading search...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}