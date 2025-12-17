"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// 1. ISOLATE SEARCH LOGIC IN A COMPONENT
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      if (query) {
        const { data, error } = await supabase.rpc("global_search", { keyword: query });
        if (!error) setResults(data || []);
      }
      setLoading(false);
    };
    fetchResults();
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Search Results</h1>
          <p className="text-gray-500">Showing results for <span className="font-bold text-blue-600">"{query}"</span></p>
      </div>

      {loading && (
          <div className="space-y-4 animate-pulse">
              <div className="h-24 bg-gray-200 rounded-xl"></div>
              <div className="h-24 bg-gray-200 rounded-xl"></div>
          </div>
      )}

      {!loading && results.length > 0 ? (
          <div className="grid gap-4">
              {results.map((item, index) => (
                  <Link key={index} href={item.url || "#"} target={item.type === 'pdf' ? '_blank' : '_self'} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${item.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                          {item.type === 'pdf' ? '📄' : item.type === 'video' ? '▶' : '📚'}
                      </div>
                      <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">{item.title}</h3>
                          {item.description && <p className="text-sm text-gray-500 line-clamp-2">{item.description.replace(/<[^>]+>/g, '')}</p>}
                      </div>
                  </Link>
              ))}
          </div>
      ) : (
          !loading && <div className="text-center py-20 bg-white rounded-3xl border border-dashed"><span className="text-4xl">🔍</span><p className="text-gray-500 mt-2">No matches found.</p></div>
      )}
    </div>
  );
}

// 2. MAIN PAGE WRAPPED IN SUSPENSE
export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <Suspense fallback={<div className="text-center pt-20">Loading...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}