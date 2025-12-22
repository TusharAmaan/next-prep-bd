import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner"; 

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 15;

type Props = {
  searchParams: Promise<{ page?: string; segment?: string; q?: string }>;
};

export default async function BlogListPage({ searchParams }: Props) {
  const { page = "1", segment = "All", q = "" } = await searchParams;
  const currentPage = parseInt(page) || 1;

  // 1. Fetch All Segments for the Filter Bar
  const { data: segmentsData } = await supabase.from("segments").select("id, title").order("id");
  const segmentsList = ["All", ...(segmentsData?.map(s => s.title) || [])];

  // 2. Build Query
  let query = supabase
    .from("resources")
    .select(`
        id, title, content_body, created_at, content_url, type, seo_description,
        segment_id,
        subjects (
          groups (
            segments ( title )
          )
        )
    `, { count: "exact" })
    .eq("type", "blog")
    .order("created_at", { ascending: false });

  // Apply Search
  if (q) query = query.ilike("title", `%${q}%`);

  // Apply Segment Filter
  if (segment !== "All") {
    // We filter by segment_id if we can find the matching segment from our list
    const targetSegment = segmentsData?.find(s => s.title === segment);
    if (targetSegment) {
        query = query.eq("segment_id", targetSegment.id);
    }
  }

  // Apply Pagination
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: blogs, count } = await query.range(from, to);
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="mb-12 text-center">
            <span className="text-blue-600 font-extrabold text-xs tracking-widest uppercase mb-3 block">
                {segment === "All" ? "All Classes" : segment}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Class <span className="text-blue-600">Blogs</span>
            </h1>

            {/* Search Bar & Filter */}
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Search Form */}
                <form className="max-w-xl mx-auto relative group">
                    <input 
                        name="q"
                        defaultValue={q}
                        type="text" 
                        placeholder={`Search ${segment === 'All' ? '' : segment} blogs...`} 
                        className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-full pl-6 pr-12 py-4 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <input type="hidden" name="segment" value={segment} />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-100 p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </button>
                </form>

                {/* Segment Pills */}
                <div className="flex flex-wrap justify-center gap-2">
                    {segmentsList.map((seg) => (
                        <Link 
                            key={seg}
                            href={`/blog?segment=${seg}&q=${q}&page=1`}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                segment === seg 
                                ? "bg-slate-900 text-white border-slate-900" 
                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-900"
                            }`}
                        >
                            {seg}
                        </Link>
                    ))}
                </div>
            </div>
        </div>

        {/* CONTENT GRID */}
        {blogs && blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {blogs.map((blog: any) => {
                    // Extract segment title safely from the nested join
                    const segmentTitle = blog.subjects?.groups?.segments?.title || "General";
                    
                    return (
                        <Link key={blog.id} href={`/blog/${blog.id}`} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                            <div className="h-48 bg-slate-100 relative overflow-hidden">
                                {blog.content_url ? (
                                    <Image src={blog.content_url} alt={blog.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">No Image</div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-100">
                                        {segmentTitle}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2 block">
                                    {new Date(blog.created_at).toLocaleDateString()}
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {blog.title}
                                </h3>
                                {/* Show SEO description or fallback to stripped content body */}
                                <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed mb-4 flex-1">
                                    {blog.seo_description || blog.content_body?.replace(/<[^>]+>/g, '').substring(0, 150) + "..."}
                                </p>
                                <span className="text-blue-600 text-xs font-bold mt-auto group-hover:underline">Read Full Post →</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        ) : (
            <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200 mb-16">
                <div className="text-4xl mb-4">✍️</div>
                <h3 className="text-xl font-bold text-slate-900">No blogs found</h3>
                <p className="text-slate-500 mt-2">There are no blogs for {segment} matching your search.</p>
                <Link href="/blog" className="mt-6 inline-block text-blue-600 font-bold text-sm hover:underline">Clear Filters</Link>
            </div>
        )}

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mb-16">
                <Link 
                    href={`/blog?segment=${segment}&q=${q}&page=${currentPage - 1}`}
                    className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 ${currentPage <= 1 ? 'opacity-50 pointer-events-none bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                >
                    ← Prev
                </Link>
                <span className="text-sm font-bold text-slate-600">Page {currentPage} of {totalPages}</span>
                <Link 
                    href={`/blog?segment=${segment}&q=${q}&page=${currentPage + 1}`}
                    className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 ${currentPage >= totalPages ? 'opacity-50 pointer-events-none bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                >
                    Next →
                </Link>
            </div>
        )}

        {/* APP BANNER */}
        <div className="mt-8">
            <ProfessionalAppBanner />
        </div>

      </div>
    </div>
  );
}