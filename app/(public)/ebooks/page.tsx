import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import EbookFilters from "@/components/EbookFilters"; // Adjust path as needed
import { BookOpen, Calendar, User } from "lucide-react"; // npm i lucide-react
import { Search } from 'lucide-react';
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ 
    page?: string; 
    category?: string; 
    q?: string; 
    limit?: string 
  }>;
};

export default async function EbooksPage({ searchParams }: Props) {
  const { page = "1", category = "All", q = "", limit = "20" } = await searchParams;
  
  // Parse numeric params safely
  const currentPage = Math.max(1, parseInt(page) || 1);
  const itemsPerPage = Math.max(1, parseInt(limit) || 20);

  // 1. Fetch Categories for Filter (Optimized)
  const { data: catData } = await supabase.from("ebooks").select("category");
  const uniqueCategories = Array.from(new Set(catData?.map((b) => b.category))).filter(Boolean).sort();

  // 2. Build Main Query
  let query = supabase
    .from("ebooks")
    .select("id, title, author, category, cover_url, created_at, tags, description", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%,tags.cs.{${q}}`); // improved search
  if (category !== "All") query = query.eq("category", category);

  // 3. Pagination Logic
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  const { data: ebooks, count } = await query.range(from, to);
  
  const totalResults = count || 0;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      
      {/* --- HERO HEADER --- */}
      <div className="bg-[#0f172a] text-white pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            Explore <span className="text-indigo-400">Knowledge</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A curated digital library tailored for your learning journey. 
            Browse {totalResults} resources available for free.
          </p>
        </div>
      </div>

      {/* --- INTERACTIVE TOOLBAR (Client Component) --- */}
      <div className="-mt-12">
        <EbookFilters categories={uniqueCategories} />
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {ebooks && ebooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 mb-16">
            {ebooks.map((book) => (
              <Link
                href={`/ebooks/${book.id}`}
                key={book.id}
                className="group relative bg-white rounded-3xl p-3 border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
              >
                {/* Image Container */}
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-slate-100 mb-4 shadow-inner">
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                      <BookOpen size={48} className="mb-2 opacity-50" />
                      <span className="text-xs font-bold uppercase tracking-widest">No Cover</span>
                    </div>
                  )}
                  
                  {/* Floating Category Badge */}
                  <span className="absolute top-3 right-3 bg-white/95 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm text-slate-800 border border-slate-100">
                    {book.category}
                  </span>
                </div>

                {/* Text Content */}
                <div className="px-2 pb-2 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {book.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                    <User size={14} />
                    <span className="truncate">{book.author}</span>
                  </div>

                  {/* Tags (Optional) */}
                  {book.tags && book.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4 mt-auto">
                      {book.tags.slice(0, 2).map((t: string) => (
                        <span key={t} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-bold uppercase tracking-wide">
                          {t}
                        </span>
                      ))}
                      {book.tags.length > 2 && <span className="text-[10px] text-slate-400 px-1 py-1">+{book.tags.length - 2}</span>}
                    </div>
                  )}

                  {/* Date Added */}
                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(book.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
                      Read now →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* --- EMPTY STATE --- */
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Search size={40} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No matching books found</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              We couldn't find anything for "<strong>{q}</strong>". Try adjusting your search or category filters.
            </p>
            <Link
              href="/ebooks"
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200"
            >
              Reset Filters
            </Link>
          </div>
        )}

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-12">
            {/* Prev */}
            <PaginationLink 
              page={currentPage - 1} 
              disabled={currentPage <= 1} 
              active={false} 
              params={{ category, q, limit }}
              label="←"
            />
            
            {/* Page Numbers Logic (Simplified for brevity) */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
               // Logic to center the current page
               let pNum = i + 1;
               if (totalPages > 5 && currentPage > 3) {
                 pNum = currentPage - 2 + i;
                 // Cap at totalPages
                 if (pNum > totalPages) pNum = totalPages - (4 - i);
               }
               return pNum;
            }).map((pNum) => (
              <PaginationLink 
                key={pNum}
                page={pNum}
                disabled={false}
                active={pNum === currentPage}
                params={{ category, q, limit }}
                label={pNum.toString()}
              />
            ))}

            {/* Next */}
            <PaginationLink 
              page={currentPage + 1} 
              disabled={currentPage >= totalPages} 
              active={false} 
              params={{ category, q, limit }}
              label="→"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Small helper component for Pagination Buttons
function PaginationLink({ page, disabled, active, params, label }: any) {
  if (disabled) {
    return <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-300 font-bold text-sm cursor-not-allowed">{label}</span>;
  }
  const urlParams = new URLSearchParams();
  if (params.category !== "All") urlParams.set("category", params.category);
  if (params.q) urlParams.set("q", params.q);
  if (params.limit !== "20") urlParams.set("limit", params.limit);
  urlParams.set("page", page.toString());

  return (
    <Link
      href={`/ebooks?${urlParams.toString()}`}
      className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${
        active
          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/30 scale-110"
          : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600"
      }`}
    >
      {label}
    </Link>
  );
}