"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { 
  Search, FileText, Newspaper, BookOpen, GraduationCap, 
  Megaphone, ArrowRight, Calendar, Tag, ChevronRight 
} from "lucide-react";

// --- TYPES ---
type SearchResult = {
    id: number;
    title: string;
    type: 'resource' | 'news' | 'ebook' | 'course' | 'update';
    subtype?: string; 
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

      const searchTerm = `%${query}%`; 

      // 1. Search RESOURCES (Added slug)
      const resourcesPromise = supabase
        .from("resources")
        .select("id, slug, title, type, content_url, created_at, seo_description, tags, subjects(title)")
        .or(`title.ilike.${searchTerm},seo_title.ilike.${searchTerm},tags.cs.{${query}}`)
        .limit(8);

      // 2. Search NEWS (Added slug)
      const newsPromise = supabase
        .from("news")
        .select("id, slug, title, category, created_at, seo_description, tags")
        .or(`title.ilike.${searchTerm},seo_title.ilike.${searchTerm},tags.cs.{${query}}`)
        .limit(4);

      // 3. Search EBOOKS (Added slug)
      const ebooksPromise = supabase
        .from("ebooks")
        .select("id, slug, title, author, created_at, seo_description, tags, pdf_url")
        .or(`title.ilike.${searchTerm},seo_title.ilike.${searchTerm},tags.cs.{${query}}`)
        .limit(4);

      // 4. Search COURSES (Added slug)
      const coursesPromise = supabase
        .from("courses")
        .select("id, slug, title, instructor, created_at, seo_description, tags, enrollment_link")
        .or(`title.ilike.${searchTerm},seo_title.ilike.${searchTerm},tags.cs.{${query}}`)
        .limit(4);

      // 5. Search UPDATES (Added slug)
      const updatesPromise = supabase
        .from("segment_updates")
        .select("id, slug, title, type, created_at, seo_description, tags, segments(slug)") 
        .or(`title.ilike.${searchTerm},seo_title.ilike.${searchTerm},tags.cs.{${query}}`)
        .limit(4);

      // Execute all in parallel
      const [resData, newsData, ebookData, courseData, updateData] = await Promise.all([
          resourcesPromise, newsPromise, ebooksPromise, coursesPromise, updatesPromise
      ]);

      // Normalize Data
      const combinedResults: SearchResult[] = [];

      // Process Resources
      resData.data?.forEach((item: any) => combinedResults.push({
          id: item.id, title: item.title, type: 'resource', subtype: item.type,
          url: item.type === 'blog' || item.type === 'question' ? `/question/${item.slug || item.id}` : item.content_url || '#',
          date: item.created_at, description: item.seo_description || `Resource for ${item.subjects?.title || 'General'}`,
          tags: item.tags, sourceTable: 'Library'
      }));

      // Process News
      newsData.data?.forEach((item: any) => combinedResults.push({
          id: item.id, title: item.title, type: 'news', subtype: item.category,
          url: `/news/${item.slug || item.id}`, date: item.created_at, description: item.seo_description || "Latest education news update.",
          tags: item.tags, sourceTable: 'News'
      }));

      // Process eBooks
      ebookData.data?.forEach((item: any) => combinedResults.push({
          id: item.id, title: item.title, type: 'ebook', subtype: 'PDF',
          url: `/ebooks/${item.slug || item.id}`, date: item.created_at, description: item.seo_description || `By ${item.author}`,
          tags: item.tags, sourceTable: 'eBooks'
      }));

      // Process Courses
      courseData.data?.forEach((item: any) => combinedResults.push({
          id: item.id, title: item.title, type: 'course', subtype: 'Online',
          url: `/courses/${item.slug || item.id}`, date: item.created_at, description: item.seo_description || `Instructor: ${item.instructor}`,
          tags: item.tags, sourceTable: 'Courses'
      }));

      // Process Updates
      updateData.data?.forEach((item: any) => {
          const segmentSlug = item.segments?.slug || 'general'; 
          combinedResults.push({
            id: item.id, 
            title: item.title, 
            type: 'update', 
            subtype: item.type,
            url: `/resources/${segmentSlug}/updates/${item.slug || item.id}`,
            date: item.created_at, 
            description: item.seo_description || "Official Notice",
            tags: item.tags, 
            sourceTable: 'Updates'
          });
      });

      // Sort by relevance/date (Newest first)
      setResults(combinedResults.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    };

    const timeoutId = setTimeout(() => { fetchResults(); }, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // --- UI HELPERS ---
  const getIcon = (type: string) => {
      switch(type) {
          case 'resource': return <FileText className="w-5 h-5"/>;
          case 'news': return <Newspaper className="w-5 h-5"/>;
          case 'ebook': return <BookOpen className="w-5 h-5"/>;
          case 'course': return <GraduationCap className="w-5 h-5"/>;
          case 'update': return <Megaphone className="w-5 h-5"/>;
          default: return <Search className="w-5 h-5"/>;
      }
  }

  const getStyle = (type: string) => {
      switch(type) {
          case 'resource': return 'bg-blue-50 text-blue-600 ring-blue-500/20';
          case 'news': return 'bg-orange-50 text-orange-600 ring-orange-500/20';
          case 'ebook': return 'bg-emerald-50 text-emerald-600 ring-emerald-500/20';
          case 'course': return 'bg-purple-50 text-purple-600 ring-purple-500/20';
          default: return 'bg-slate-50 text-slate-600 ring-slate-500/20';
      }
  }

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="mb-12">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Search Results</p>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
            Showing results for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">"{query}"</span>
          </h1>
          <p className="text-slate-500 mt-3 font-medium">Found {results.length} matching items</p>
      </div>

      {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-slate-100 rounded-2xl"></div>)}
          </div>
      )}

      {!loading && results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item) => (
                  <Link 
                    key={`${item.type}-${item.id}`} 
                    href={item.url} 
                    target={item.type === 'ebook' || (item.type === 'resource' && item.subtype === 'pdf') ? '_blank' : '_self'}
                    className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                  >
                      {/* Top Badge */}
                      <div className="flex justify-between items-start mb-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ring-1 ${getStyle(item.type)}`}>
                              {getIcon(item.type)}
                              {item.sourceTable}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1">
                              <Calendar className="w-3 h-3"/>
                              {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-800 leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {item.title}
                          </h3>
                          <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-4">
                              {item.description}
                          </p>
                      </div>

                      {/* Footer Tags */}
                      {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4 pt-4 border-t border-slate-50">
                              {item.tags.slice(0, 3).map((tag, i) => (
                                  <span key={i} className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                                      <Tag className="w-3 h-3 opacity-50"/> {tag}
                                  </span>
                              ))}
                          </div>
                      )}

                      {/* Action Arrow */}
                      <div className="mt-auto flex items-center text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                          Read More <ArrowRight className="w-4 h-4 ml-1"/>
                      </div>
                  </Link>
              ))}
          </div>
      ) : (
          !loading && query && (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-500">We couldn't find anything matching "<span className="font-bold text-slate-700">{query}</span>".</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest py-1">Try:</span>
                    {['Physics', 'Routine', 'SSC 2026', 'English'].map(t => (
                        <Link key={t} href={`/search?q=${t}`} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                            {t}
                        </Link>
                    ))}
                </div>
            </div>
          )
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-4 md:px-8 font-sans">
      <Suspense fallback={<div className="flex justify-center pt-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}