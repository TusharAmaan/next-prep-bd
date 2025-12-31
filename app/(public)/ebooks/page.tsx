import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 20;

type Props = {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
};

export default async function EbooksPage({ searchParams }: Props) {
  const { page = "1", category = "All", q = "" } = await searchParams;
  const currentPage = parseInt(page) || 1;

  // 1. Fetch Categories (Dynamically from existing books to avoid empty filters)
  // Note: For a perfect list, you might want a separate 'categories' table, but this works for now.
  const { data: allBooks } = await supabase.from("ebooks").select("category");
  const uniqueCategories = Array.from(new Set(allBooks?.map(b => b.category))).filter(Boolean).sort();
  const categories = ["All", ...uniqueCategories];

  // 2. Build Query
  let query = supabase
    .from("ebooks")
    .select("id, title, author, category, cover_url, created_at, tags", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply Search (Title or Author)
  if (q) {
    query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`);
  }
  
  // Apply Category Filter
  if (category !== "All") {
    query = query.eq("category", category);
  }

  // Apply Pagination
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  
  const { data: ebooks, count } = await query.range(from, to);
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-24 pb-20">
      
      {/* --- HEADER SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Digital <span className="text-blue-600">Library</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
          Access our curated collection of notes, textbooks, and guides completely free.
        </p>

        {/* --- SEARCH & FILTER BAR --- */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-24 z-20">
            
            {/* Search Input Form */}
            <form className="relative w-full md:w-96 group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </span>
                <input 
                    name="q"
                    defaultValue={q}
                    type="text" 
                    placeholder="Search by title or author..." 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {/* Maintain category when searching */}
                <input type="hidden" name="category" value={category} />
            </form>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar items-center">
                {categories.map((cat) => (
                    <Link 
                        key={cat}
                        href={`/ebooks?category=${cat}&q=${q}&page=1`}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                            category === cat 
                            ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20" 
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                    >
                        {cat}
                    </Link>
                ))}
            </div>
        </div>
      </div>

      {/* --- BOOK GRID --- */}
      <div className="max-w-7xl mx-auto px-6">
        {ebooks && ebooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
                {ebooks.map((book) => (
                    <Link 
                        href={`/ebooks/${book.id}`} 
                        key={book.id} 
                        className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full cursor-pointer relative overflow-hidden"
                    >
                        {/* COVER IMAGE */}
                        <div className="relative w-full h-64 bg-slate-100 rounded-xl overflow-hidden mb-5 shadow-inner border border-slate-100 group-hover:shadow-md transition-shadow">
                            {book.cover_url ? (
                                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                    <span className="text-4xl mb-2">📚</span>
                                    <span className="text-xs font-bold uppercase tracking-widest">No Cover</span>
                                </div>
                            )}
                            {/* Category Badge */}
                            <div className="absolute top-3 left-3">
                                <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide border border-white/50">
                                    {book.category}
                                </span>
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {book.title}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mb-4">{book.author}</p>
                            
                            {/* Tags */}
                            {book.tags && book.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-6">
                                    {book.tags.slice(0, 2).map((tag: string, i: number) => (
                                        <span key={i} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100 font-medium">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* ACTION BUTTON */}
                            <div className="mt-auto pt-4 border-t border-slate-100">
                                <span className="block w-full py-3.5 bg-slate-900 text-white hover:bg-blue-600 text-center text-sm font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2 group-hover:translate-y-[-2px]">
                                    View Details
                                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        ) : (
            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No books found</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                    We couldn't find any books matching "<span className="font-bold text-slate-800">{q}</span>". Try adjusting your filters.
                </p>
                <Link 
                    href="/ebooks"
                    className="text-blue-600 font-bold hover:underline"
                >
                    Clear all filters
                </Link>
            </div>
        )}

        {/* --- PAGINATION CONTROLS --- */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mb-16">
                <Link 
                    href={`/ebooks?category=${category}&q=${q}&page=${currentPage - 1}`}
                    className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 ${currentPage <= 1 ? 'opacity-50 pointer-events-none bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                >
                    ← Prev
                </Link>
                
                <span className="text-sm font-bold text-slate-600">
                    Page {currentPage} of {totalPages}
                </span>

                <Link 
                    href={`/ebooks?category=${category}&q=${q}&page=${currentPage + 1}`}
                    className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 ${currentPage >= totalPages ? 'opacity-50 pointer-events-none bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                >
                    Next →
                </Link>
            </div>
        )}
      </div>

    </div>
  );
}