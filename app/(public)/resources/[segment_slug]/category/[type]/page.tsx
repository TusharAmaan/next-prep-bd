import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner"; 
import { Metadata } from 'next';
import { getBreadcrumbSchema } from "@/lib/seo-utils";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 12;

type Props = {
  params: Promise<{ segment_slug: string; type: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segment_slug, type } = await params;
  const { data: segment } = await supabase.from("segments").select("title").eq("slug", segment_slug).single();
  if (!segment) return { title: "Not Found" };

  const formatType = (t: string) => t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  const title = `${formatType(type)} Archive - ${segment.title}`;

  return {
    title,
    description: `Official archive of all ${type.replace('_', ' ')}s for ${segment.title}. Stay updated with the latest exam schedules and results on NextPrepBD.`,
    alternates: {
      canonical: `/resources/${segment_slug}/category/${type}`,
    },
  };
}

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

  // Breadcrumbs
  const breadcrumbItems = [
    { name: "Home", item: "https://nextprepbd.com" },
    { name: "Resources", item: "https://nextprepbd.com/resources" },
    { name: segmentData.title, item: `https://nextprepbd.com/resources/${segment_slug}` },
    { name: formatType(type), item: `https://nextprepbd.com/resources/${segment_slug}/category/${type}` }
  ];
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pt-32 pb-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
              
              {/* Main Content Area */}
              <div className="flex-1">
                  {/* Page Header */}
                  <div className="mb-10">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                          <Link href="/" className="hover:text-indigo-600 transition">Home</Link> / 
                          <Link href={`/resources/${segment_slug}`} className="hover:text-indigo-600 transition">{segmentData.title}</Link> / 
                          <span>{formatType(type)}</span>
                      </div>
                      
                      <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight uppercase">
                            {formatType(type)} Archive
                      </h1>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">
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
                                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl dark:hover:shadow-indigo-900/10 transition-all duration-300 flex items-start gap-6 shadow-sm"
                              >
                                  {/* Icon Box */}
                                  <div className="hidden sm:flex shrink-0 w-14 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl items-center justify-center text-3xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:border-indigo-100 dark:group-hover:border-indigo-800 transition-colors shadow-inner">
                                      {getTypeIcon()}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0 py-1">
                                      <h3 className="text-xl font-black text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate uppercase tracking-tight leading-tight">
                                          {post.title}
                                      </h3>
                                      <div className="flex items-center gap-4 mt-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                          <span className="flex items-center gap-1.5">
                                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                              {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                          </span>
                                          <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full"></span>
                                          <span>{formatType(type)}</span>
                                      </div>
                                  </div>

                                  {/* Arrow / Action */}
                                  <div className="shrink-0 self-center">
                                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                      </div>
                                  </div>
                              </Link>
                          ))}
                      </div>
                  ) : (
                      <div className="bg-white dark:bg-slate-900 p-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center mb-16 shadow-inner">
                          <div className="text-5xl mb-6 opacity-30 grayscale">📂</div>
                          <h3 className="text-xl font-black text-slate-700 dark:text-white uppercase tracking-tight">No documents found</h3>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-black uppercase tracking-widest">There are no updates in this category yet.</p>
                      </div>
                  )}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-6 mb-16">
                          <Link 
                              href={`/resources/${segment_slug}/category/${type}?page=${currentPage - 1}`}
                              className={`px-6 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${currentPage <= 1 ? 'opacity-30 pointer-events-none bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 shadow-sm'}`}
                          >
                              ← Prev
                          </Link>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Page {currentPage} of {totalPages}</span>
                          <Link 
                              href={`/resources/${segment_slug}/category/${type}?page=${currentPage + 1}`}
                              className={`px-6 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${currentPage >= totalPages ? 'opacity-30 pointer-events-none bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 shadow-sm'}`}
                          >
                              Next →
                          </Link>
                      </div>
                  )}

                  <ProfessionalAppBanner />
              </div>

              {/* Sidebar */}
              <div className="w-full lg:w-80 shrink-0 space-y-8">
                  <Sidebar />
              </div>

          </div>
        </div>
      </div>
    </>
  );
}