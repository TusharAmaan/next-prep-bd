"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// Define the shape of our search result
type SearchResult = {
  id: number;
  type: string;
  title: string;
  url: string;
  similarity: number;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q"); // Get "?q=..." from URL
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (!query) return;
      setLoading(true);

      // Call the "Smart Function" we made in SQL
      const { data, error } = await supabase.rpc("global_search", {
        keyword: query,
      });

      if (data) setResults(data);
      setLoading(false);
    }

    performSearch();
  }, [query]);

  // Helper to get Icon based on type
  const getIcon = (type: string) => {
    switch (type) {
      case "pdf": return "📄";
      case "video": return "🎬";
      case "course": return "🎓";
      case "blog": return "✍️";
      case "question": return "❓";
      case "ebook": return "📚";
      default: return "🔍";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Search Header */}
        <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                Search Results
            </h1>
            <p className="text-gray-500">
                Showing results for <span className="font-bold text-black">"{query}"</span>
            </p>
        </div>

        {/* Loading State */}
        {loading && (
            <div className="animate-pulse space-y-4">
                <div className="h-16 bg-gray-200 rounded-xl"></div>
                <div className="h-16 bg-gray-200 rounded-xl"></div>
                <div className="h-16 bg-gray-200 rounded-xl"></div>
            </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && query && (
            <div className="bg-white p-12 rounded-2xl border-2 border-dashed text-center">
                <div className="text-6xl mb-4">🤔</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No exact matches found</h3>
                <p className="text-gray-500">Try searching for related keywords like "Physics" or "English".</p>
            </div>
        )}

        {/* Results Grid */}
        <div className="space-y-3">
            {results.map((item, index) => (
                <Link 
                    key={`${item.type}-${item.id}-${index}`} 
                    href={item.url}
                    className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
                >
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-blue-50 group-hover:scale-110 transition-transform">
                        {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded tracking-wider">
                                {item.type}
                            </span>
                            {/* Similarity Score Debug (Optional: Remove later) */}
                            {/* <span className="text-[10px] text-green-600">Match: {Math.round(item.similarity * 100)}%</span> */}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 truncate transition-colors">
                            {item.title}
                        </h3>
                    </div>
                    <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
                        →
                    </div>
                </Link>
            ))}
        </div>

      </div>
    </div>
  );
}