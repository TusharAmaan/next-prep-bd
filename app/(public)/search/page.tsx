"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      if (query) {
        // Call the new SQL function
        const { data, error } = await supabase.rpc("global_search", { keyword: query });
        if (!error) setResults(data || []);
      }
      setLoading(false);
    };
    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Search Results</h1>
            <p className="text-gray-500">
                Showing results for <span className="font-bold text-blue-600">"{query}"</span>
            </p>
        </div>

        {/* LOADING STATE */}
        {loading && (
            <div className="space-y-4 animate-pulse">
                <div className="h-24 bg-gray-200 rounded-xl"></div>
                <div className="h-24 bg-gray-200 rounded-xl"></div>
                <div className="h-24 bg-gray-200 rounded-xl"></div>
            </div>
        )}

        {/* RESULTS GRID */}
        {!loading && results.length > 0 ? (
            <div className="grid gap-4">
                {results.map((item, index) => (
                    <Link 
                        key={index} 
                        href={item.url || "#"}
                        target={item.type === 'pdf' || item.type === 'ebook' ? '_blank' : '_self'}
                        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group flex items-start gap-4"
                    >
                        {/* ICON BASED ON TYPE */}
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 
                            ${item.type === 'pdf' ? 'bg-red-50 text-red-500' : 
                              item.type === 'video' ? 'bg-blue-50 text-blue-500' : 
                              item.type === 'blog' ? 'bg-purple-50 text-purple-500' : 
                              'bg-green-50 text-green-500'}`}>
                            {item.type === 'pdf' ? '📄' : item.type === 'video' ? '▶' : item.type === 'blog' ? '✍️' : '📚'}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded text-gray-500">{item.type}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                {item.title}
                            </h3>
                            {item.description && (
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {item.description.replace(/<[^>]+>/g, '')}
                                </p>
                            )}
                        </div>
                        
                        <span className="text-gray-300 group-hover:text-blue-500 text-xl">→</span>
                    </Link>
                ))}
            </div>
        ) : (
            !loading && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                    <span className="text-6xl block mb-4">🔍</span>
                    <h3 className="text-xl font-bold text-gray-900">No matches found</h3>
                    <p className="text-gray-500 mt-2">Try checking your spelling or use general keywords like "HSC" or "English".</p>
                </div>
            )
        )}

      </div>
    </div>
  );
}