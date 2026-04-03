import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import EbookFilters from "@/components/EbookFilters"; 
import { BookOpen, Calendar, User, Search, ArrowRight, Download } from "lucide-react"; 
import BookmarkButton from "@/components/shared/BookmarkButton";
import { Metadata } from 'next';
import { getBreadcrumbSchema } from "@/lib/seo-utils";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ 
    page?: string; 
    category?: string; 
    q?: string; 
    limit?: string 
  }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category = "All", q = "" } = await searchParams;
  
  let title = "Digital Library & E-Books Archive - NextPrepBD";
  if (category !== "All") title = `${category} E-Books & Resources - NextPrepBD`;
  if (q) title = `Search Results for "${q}" - Digital Library`;

  return {
    title,
    description: "Access our premium digital library with verified e-books, lecture sheets, and academic resources for SSC, HSC, and Admission candidates in Bangladesh.",
    alternates: {
      canonical: "/ebooks",
    },
  };
}

export default async function EbooksPage({ searchParams }: Props) {
  const { page = "1", category = "All", q = "", limit = "20" } = await searchParams;
  
  const currentPage = Math.max(1, parseInt(page) || 1);
  const itemsPerPage = Math.max(1, parseInt(limit) || 20);

  const { data: catData } = await supabase.from("ebooks").select("category");
  const uniqueCategories = Array.from(new Set(catData?.map((b) => b.category))).filter(Boolean).sort();

  let query = supabase
    .from("ebooks")
    .select("id, title, author, category, cover_url, created_at, tags, description", { count: "exact" })
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (q) query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%,tags.cs.{${q}}`); 
  if (category !== "All") query = query.eq("category", category);

  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  const { data: ebooks, count } = await query.range(from, to);
  
  const totalResults = count || 0;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const breadcrumbItems = [
    { name: "Home", item: "https://nextprepbd.com" },
    { name: "E-Books", item: "https://nextprepbd.com/ebooks" }
  ];
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24 transition-colors duration-300">
        
        {/* --- HERO HEADER --- */}
        <div className="bg-slate-900 text-white pt-40 pb-32 px-6 relative overflow-hidden border-b border-white/5">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none -ml-20 -mb-20"></div>
          
          <div className="max-w-7xl mx-auto relative z-10 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold tracking-wide mb-8">
                  <BookOpen className="w-3.5 h-3.5" /> Digital Research Portal
              </span>
              <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
                  Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Knowledge</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                  Access our curated digital library tailored for your learning journey. 
                  Premium resources {totalResults > 0 && `(${totalResults}+)`} available for your academic excellence.
              </p>
          </div>
        </div>

        {/* --- INTERACTIVE TOOLBAR --- */}
        <div className="-mt-14 relative z-30">
          <EbookFilters categories={uniqueCategories} />
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-20">
          {ebooks && ebooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
              {ebooks.map((book) => (
                <Link
                  href={`/ebooks/${book.id}`}
                  key={book.id}
                  className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl dark:hover:shadow-indigo-900/10 hover:-translate-y-3 transition-all duration-500 flex flex-col h-full overflow-hidden"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-slate-800 mb-6 shadow-inner">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800">
                        <BookOpen className="w-12 h-12 mb-3 opacity-50" />
                        <span className="text-[10px] font-black uppercase tracking-widest">No Cover</span>
                      </div>
                    )}
                    
                    <span className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg text-slate-900 dark:text-white border border-slate-100/10 tracking-wide">
                      {book.category}
                    </span>

                    <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                       <BookmarkButton 
                          itemType="ebook" 
                          itemId={book.id} 
                          metadata={{ title: book.title, thumbnail_url: book.cover_url }} 
                       />
                    </div>

                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                       <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 scale-50 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                          <ArrowRight className="w-6 h-6" />
                       </div>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="px-3 pb-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                      {book.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500 text-xs font-bold tracking-wide mb-6 transition-colors">
                      <User className="w-3.5 h-3.5" />
                      <span className="truncate">{book.author}</span>
                    </div>

                    {book.tags && book.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                        {book.tags.slice(0, 2).map((t: string) => (
                          <span key={t} className="text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-xl font-bold tracking-wide border border-slate-100 dark:border-slate-700 transition-colors">
                            {t}
                          </span>
                        ))}
                        {book.tags.length > 2 && <span className="text-[10px] font-black text-slate-300 dark:text-slate-700">+{book.tags.length - 2}</span>}
                      </div>
                    )}

                    <div className="pt-6 mt-auto border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-600 tracking-wide">
                        <Calendar className="w-3 h-3 text-indigo-500" />
                        {new Date(book.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wide group-hover:translate-x-1 transition-transform">
                        Access <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 px-6 text-center bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-8 animate-pulse text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-700">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">No resources found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 font-medium">
                We couldn't find any resources matching "<strong>{q}</strong>". Try adjusting your search or category filters.
              </p>
              <Link
                href="/ebooks"
                className="px-10 py-5 bg-slate-900 dark:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
              >
                Reset All Filters
              </Link>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mb-24">
              <PaginationLink 
                page={currentPage - 1} 
                disabled={currentPage <= 1} 
                params={{ category, q, limit }}
                label="Prev"
              />
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                 let pNum = i + 1;
                 if (totalPages > 5 && currentPage > 3) {
                   pNum = currentPage - 2 + i;
                   if (pNum > totalPages) pNum = totalPages - (4 - i);
                 }
                 return pNum;
              }).map((pNum) => (
                <PaginationLink 
                  key={pNum}
                  page={pNum}
                  active={pNum === currentPage}
                  params={{ category, q, limit }}
                  label={pNum.toString()}
                />
              ))}

              <PaginationLink 
                page={currentPage + 1} 
                disabled={currentPage >= totalPages} 
                params={{ category, q, limit }}
                label="Next"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function PaginationLink({ page, disabled, active, params, label }: any) {
  if (disabled) {
    return <span className="px-8 py-4 bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-700 font-bold text-xs tracking-wide rounded-2xl cursor-not-allowed border border-slate-100 dark:border-slate-800">{label}</span>;
  }
  const urlParams = new URLSearchParams();
  if (params.category !== "All") urlParams.set("category", params.category);
  if (params.q) urlParams.set("q", params.q);
  if (params.limit !== "20") urlParams.set("limit", params.limit);
  urlParams.set("page", page.toString());

  return (
    <Link
      href={`/ebooks?${urlParams.toString()}`}
      className={`px-8 py-4 rounded-2xl font-bold text-xs tracking-wide transition-all ${
        active
          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl shadow-indigo-600/20 dark:shadow-white/10 scale-110"
          : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-lg"
      }`}
    >
      {label}
    </Link>
  );
}