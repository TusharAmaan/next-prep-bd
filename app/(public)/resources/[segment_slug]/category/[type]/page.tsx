import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner"; 

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 12;

type Props = {
  params: Promise<{ segment_slug: string; type: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function CategoryListPage({ params, searchParams }: Props) {
  const { segment_slug, type } = await params;
  const { page = "1" } = await searchParams;

  const currentPage = parseInt(page) || 1;

  // Validate type
  const validTypes = ["routine", "syllabus", "exam_result"];
  if (!validTypes.includes(type)) return notFound();

  // 1. Fetch Segment Data
  const { data: segmentData } = await supabase
    .from("segments")
    .select("id, title")
    .eq("slug", segment_slug)
    .eq("status", "approved")
    .single();

  if (!segmentData) return notFound();

  // 2. Fetch Updates with Pagination
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: posts, count } = await supabase
    .from("segment_updates")
    .select("id, title, created_at", { count: "exact" })
    .eq("segment_id", segmentData.id)
    .eq("type", type)
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  // Formatting helper
  const formatType = (t: string) => t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  // Icon Helper for the cards
  const getTypeIcon = () => {
    switch(type) {
        case 'routine': return "📅";
        case 'syllabus': return "📑";
        case 'exam_result': return "📊";
        default: return "📄";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Main Content Area */}
            <div className="flex-1">
                {/* Page Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        <Link href="/" className="hover:text-blue-600 transition">Home</Link> / 
                        <Link href={`/resources/${segment_slug}`} className="hover:text-blue-600 transition">{segmentData.title}</Link> / 
                        <span>{formatType(type)}</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                          {formatType(type)} Archive
                    </h1>
                    <p className="text-slate-500">
                        Official list of all {type.replace('_', ' ')}s published for {segmentData.title}.
                    </p>
                </div>

                {/* Posts List */}
                {posts && posts.length > 0 ? (
                    <div className="flex flex-col gap-4 mb-10">
                        {posts.map(post => (
                            <Link 
                                key={post.id} 
                                href={`/resources/${segment_slug}/updates/${post.id}`}
                                className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex items-start gap-5"
                            >
                                {/* Icon Box */}
                                <div className="hidden sm:flex shrink-0 w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg items-center justify-center text-2xl group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                    {getTypeIcon()}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span className="uppercase tracking-wide">{formatType(type)}</span>
                                    </div>
                                </div>

                                {/* Arrow / Action */}
                                <div className="shrink-0 self-center">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-16 rounded-2xl border border-dashed border-slate-200 text-center mb-16">
                        <div className="text-4xl mb-4 opacity-30 grayscale">📂</div>
                        <h3 className="text-lg font-bold text-slate-700">No documents found</h3>
                        <p className="text-sm text-slate-400 mt-1">There are no updates in this category yet.</p>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mb-16">
                        <Link 
                            href={`/resources/${segment_slug}/${type}?page=${currentPage - 1}`}
                            className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 ${currentPage <= 1 ? 'opacity-50 pointer-events-none bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                        >
                            ← Prev
                        </Link>
                        <span className="text-sm font-bold text-slate-600">Page {currentPage} of {totalPages}</span>
                        <Link 
                            href={`/resources/${segment_slug}/${type}?page=${currentPage + 1}`}
                            className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 ${currentPage >= totalPages ? 'opacity-50 pointer-events-none bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                        >
                            Next →
                        </Link>
                    </div>
                )}

                {/* NEW DARK PROFESSIONAL APP SECTION */}
                <div className="mt-8">
                    <ProfessionalAppBanner />
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 shrink-0 space-y-8">
                <Sidebar />
            </div>

        </div>
      </div>
    </div>
  );
}