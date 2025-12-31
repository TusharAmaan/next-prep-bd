import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Search, Book, User, Tag, Download, BookOpen, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 20;

type Props = {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
};

export default async function EbooksPage({ searchParams }: Props) {
  const { page = "1", category = "All", q = "" } = await searchParams;
  const currentPage = parseInt(page) || 1;

  // 1. Fetch Categories (Dynamically)
  const { data: allBooks } = await supabase.from("ebooks").select("category");
  const uniqueCategories = Array.from(new Set(allBooks?.map(b => b.category))).filter(Boolean).sort();
  const categories = ["All", ...uniqueCategories];

  // 2. Build Query
  let query = supabase
    .from("ebooks")
    .select("id, title, author, category, cover_url, created_at, tags, content_url", { count: "exact" })
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-28 pb-20">
      
      {/* --- HERO HEADER --- */}
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight relative z-10">
          Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Library</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium relative z-10">
          Access our curated collection of notes, textbooks, and guides completely free.
        </p>
      </div>

      {/* --- STICKY SEARCH & FILTER BAR --- */}
      <div className="sticky top-20 z-30 mb-12 px-4 md:px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto pointer-events-auto">
            <div className="bg-white/80 backdrop-blur-xl p-3 md:p-4 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search Input */}
                <form className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                        name="q"
                        defaultValue={q}
                        type="text" 
                        placeholder="Search title, author..." 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-xl pl-12 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                    <input type="hidden" name="category" value={category} />
                </form>

                {/* Category Pills (Scrollable) */}
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 hide-scrollbar items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 hidden md:block flex-shrink-0">
                        <Filter className="w-3 h-3 inline mr-1" />
                        Filters:
                    </span>
                    {categories.map((cat) => (
                        <Link 
                            key={cat}
                            href={`/ebooks?category=${cat}&q=${q}&page=1`}
                            className={`
                                px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0
                                ${category === cat 
                                    ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105" 
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50"
                                }
                            `}
                        >
                            {cat}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* --- BOOK GRID --- */}
      <div className="max-w-7xl mx-auto px-6">
        {ebooks && ebooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 mb-16">
                {ebooks.map((book) => (
                    <div 
                        key={book.id} 
                        className="group flex flex-col h-full bg-transparent hover:-translate-y-2 transition-transform duration-300"
                    >
                        {/* BOOK COVER CARD */}
                        <Link 
                            href={book.content_url || "#"} 
                            target="_blank"
                            className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-md group-hover:shadow-2xl group-hover:shadow-blue-900/20 transition-all duration-300 bg-white border border-slate-100"
                        >
                            {book.cover_url ? (
                                <img 
                                    src={book.cover_url} 
                                    alt={book.title} 
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                                />
                            ) : (
                                /* Elegant Fallback Cover */
                                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-6 text-center relative">
                                    <div className="absolute inset-0 border-4 border-white/50 m-2 rounded-lg"></div>
                                    <Book className="w-12 h-12 text-slate-300 mb-3" />
                                    <h4 className="text-xs font-bold text-slate-400 line-clamp-3 uppercase tracking-widest">
                                        {book.title}
                                    </h4>
                                </div>
                            )}

                            {/* Hover Overlay Action */}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-lg text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <BookOpen className="w-4 h-4" />
                                    Read Now
                                </span>
                            </div>

                            {/* Category Badge (Top Left) */}
                            <div className="absolute top-2 left-2">
                                <span className="bg-black/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded shadow-sm border border-white/10 uppercase tracking-wide">
                                    {book.category}
                                </span>
                            </div>
                        </Link>

                        {/* BOOK DETAILS */}
                        <div className="mt-4 flex flex-col flex-1">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                                <Link href={book.content_url || "#"} target="_blank">{book.title}</Link>
                            </h3>
                            
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-3">
                                <User className="w-3 h-3" />
                                <span className="truncate">{book.author || "Unknown Author"}</span>
                            </div>

                            {/* Tags */}
                            {book.tags && book.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-auto">
                                    {book.tags.slice(0, 2).map((tag: string, i: number) => (
                                        <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                    <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No books found</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
                    We couldn't find any books matching your search. Try adjusting the filters.
                </p>
                <Link 
                    href="/ebooks"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/20"
                >
                    Clear All Filters
                </Link>
            </div>
        )}

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 border-t border-slate-100 pt-10">
                <Link 
                    href={`/ebooks?category=${category}&q=${q}&page=${currentPage - 1}`}
                    className={`
                        px-5 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all
                        ${currentPage <= 1 
                            ? 'opacity-50 pointer-events-none bg-slate-50 border-slate-100 text-slate-400' 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm'
                        }
                    `}
                >
                    Previous
                </Link>
                
                <span className="text-sm font-bold text-slate-400 px-4">
                    Page <span className="text-slate-900">{currentPage}</span> of {totalPages}
                </span>

                <Link 
                    href={`/ebooks?category=${category}&q=${q}&page=${currentPage + 1}`}
                    className={`
                        px-5 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all
                        ${currentPage >= totalPages 
                            ? 'opacity-50 pointer-events-none bg-slate-50 border-slate-100 text-slate-400' 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm'
                        }
                    `}
                >
                    Next
                </Link>
            </div>
        )}
      </div>
    </div>
  );
}