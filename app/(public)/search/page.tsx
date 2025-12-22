"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// --- TYPES ---
type SearchResult = {
    id: number;
    title: string;
    type: 'resource' | 'news' | 'ebook' | 'course' | 'update';
    subtype?: string; // e.g. 'pdf', 'video'
    url: string;
    date: string;
    description: string;
    tags?: string[];
    sourceTable: string;
};

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || ""; 
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) { setResults([]); return; }
      setLoading(true);

      const searchTerm = `%${query}%`; // Wildcard search

      // 1. Search RESOURCES
      const resourcesPromise = supabase
        .from("resources")
        .select("id, title, type, content_url, created_at, seo_description, tags, subjects(title)")
        .or(`title.ilike.${searchTerm},seo_title.ilike.${searchTerm},tags.cs.{${query}}`) // 'cs' = contains value for arrays
        .limit(10);

      // 2. Search NEWS
      const newsPromise = supabase
        .from("news")
        .select("id, title, category, created_at, seo_description, tags")
        .or(`title.ilike.${searchTerm},seo_title.ilike.${searchTerm},tags.cs.{${query}}`)
        .limit(5);

      // 3. Search EBOOKS
      const ebooksPromise = supabase
        .from("ebooks")
        .select("id, title, author, created_at, seo_description, tags, pdf_url")
        .or(`title.ilike.${searchTerm},seo_title.ilike.${searchTerm},tags.cs.{${query}}`)
        .limit(5);

      // 4. Search COURSES
      const coursesPromise = supabase
        .from("courses")
        .select("id, title, instructor, created_at, seo_description, tags, enrollment_link")
        .or(`title.ilike.${searchTerm},seo_title.ilike.${searchTerm},tags.cs.{${query}}`)
        .limit(5);

      // 5. Search UPDATES
      const updatesPromise = supabase
        .from("segment_updates")
        .select("id, title, type, created_at, seo_description, tags")
        .or(`title.ilike.${searchTerm},seo_title.ilike.${searchTerm},tags.cs.{${query}}`)
        .limit(5);

      // Execute all in parallel
      const [resData, newsData, ebookData, courseData, updateData] = await Promise.all([
          resourcesPromise, newsPromise, ebooksPromise, coursesPromise, updatesPromise
      ]);

      // Normalize Data
      const combinedResults: SearchResult[] = [];

      // Process Resources
      resData.data?.forEach((item: any) => combinedResults.push({
          id: item.id, title: item.title, type: 'resource', subtype: item.type,
          url: item.type === 'blog' ? `/blog/${item.id}` : item.content_url || '#',
          date: item.created_at, description: item.seo_description || `Resource for ${item.subjects?.title || 'General'}`,
          tags: item.tags, sourceTable: 'Library'
      }));

      // Process News
      newsData.data?.forEach((item: any) => combinedResults.push({
          id: item.id, title: item.title, type: 'news', subtype: item.category,
          url: `/news/${item.id}`, date: item.created_at, description: item.seo_description || "Latest education news update.",
          tags: item.tags, sourceTable: 'News'
      }));

      // Process eBooks
      ebookData.data?.forEach((item: any) => combinedResults.push({
          id: item.id, title: item.title, type: 'ebook', subtype: 'PDF',
          url: item.pdf_url || '#', date: item.created_at, description: item.seo_description || `By ${item.author}`,
          tags: item.tags, sourceTable: 'eBooks'
      }));

      // Process Courses
      courseData.data?.forEach((item: any) => combinedResults.push({
          id: item.id, title: item.title, type: 'course', subtype: 'Online',
          url: item.enrollment_link || '#', date: item.created_at, description: item.seo_description || `Instructor: ${item.instructor}`,
          tags: item.tags, sourceTable: 'Courses'
      }));

      // Process Updates
      updateData.data?.forEach((item: any) => combinedResults.push({
          id: item.id, title: item.title, type: 'update', subtype: item.type,
          url: `/updates/${item.id}`, date: item.created_at, description: item.seo_description || "Official Notice",
          tags: item.tags, sourceTable: 'Updates'
      }));

      // Sort by relevance/date (Newest first)
      setResults(combinedResults.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    };

    // Debounce
    const timeoutId = setTimeout(() => { fetchResults(); }, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // --- UI HELPERS ---
  const getIcon = (type: string, subtype?: string) => {
      if(type === 'resource') {
          if(subtype === 'pdf') return '📄';
          if(subtype === 'video') return '▶️';
          if(subtype === 'blog') return '✍️';
          return '📂';
      }
      if(type === 'news') return '📰';
      if(type === 'ebook') return '📚';
      if(type === 'course') return '🎓';
      if(type === 'update') return '📢';
      return '🔍';
  }

  const getColor = (type: string) => {
      if(type === 'resource') return 'bg-blue-50 text-blue-600 border-blue-100';
      if(type === 'news') return 'bg-orange-50 text-orange-600 border-orange-100';
      if(type === 'ebook') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      if(type === 'course') return 'bg-purple-50 text-purple-600 border-purple-100';
      return 'bg-slate-50 text-slate-600 border-slate-100';
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-12 text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Search Results</h1>
          <p className="text-slate-500 text-lg">
            Found <span className="font-bold text-black">{results.length}</span> matches for <span className="font-bold text-blue-600">"{query}"</span>
          </p>
      </div>

      {loading && (
          <div className="space-y-4 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl"></div>)}
          </div>
      )}

      {!loading && results.length > 0 ? (
          <div className="space-y-6">
              {results.map((item, index) => (
                  <Link 
                    key={`${item.type}-${item.id}`} 
                    href={item.url} 
                    target={item.type === 'ebook' || (item.type === 'resource' && item.subtype !== 'blog') ? '_blank' : '_self'}
                    className="block bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  >
                      <div className="flex items-start gap-6">
                          {/* Icon Box */}
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 border ${getColor(item.type)}`}>
                              {getIcon(item.type, item.subtype)}
                          </div>

                          <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${getColor(item.type)}`}>
                                      {item.sourceTable}
                                  </span>
                                  <span className="text-xs text-slate-400 font-medium">
                                      {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                  </span>
                              </div>
                              
                              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                                  {item.title}
                              </h3>
                              
                              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
                                  {item.description}
                              </p>

                              {/* Tags */}
                              {item.tags && item.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                      {item.tags.slice(0, 4).map((tag, i) => (
                                          <span key={i} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                              #{tag}
                                          </span>
                                      ))}
                                  </div>
                              )}
                          </div>

                          <div className="self-center hidden sm:block">
                              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                  ➔
                              </div>
                          </div>
                      </div>
                  </Link>
              ))}
          </div>
      ) : (
          !loading && query && (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="text-6xl mb-4 opacity-20">🔍</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-500">We couldn't find anything matching "{query}".</p>
                <p className="text-sm text-slate-400 mt-1">Try broad terms like "Physics", "SSC", or "Routine".</p>
            </div>
          )
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-6 font-sans">
      <Suspense fallback={<div className="flex justify-center pt-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}