import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ segment_slug: string; group_slug: string }>;
  searchParams: Promise<{ page?: string; type?: string }>;
};

const ITEMS_PER_PAGE = 12;

export default async function GroupPage({ params, searchParams }: Props) {
  const { segment_slug, group_slug } = await params;
  const { page = "1", type = "all" } = await searchParams;

  const currentPage = parseInt(page) || 1;

  // 1. Fetch Segment
  const { data: segmentData } = await supabase.from("segments").select("id, title").eq("slug", segment_slug).single();
  if (!segmentData) return notFound();

  // 2. Fetch Group
  const { data: groupData } = await supabase.from("groups").select("id, title").eq("slug", group_slug).eq("segment_id", segmentData.id).single();
  if (!groupData) return notFound();

  // 3. Fetch Subjects
  const { data: subjects } = await supabase.from("subjects").select("*").eq("group_id", groupData.id).order("id");

  // 4. FETCH RESOURCES WITH PAGINATION & FILTER
  let query = supabase
    .from("resources")
    .select("id, title, type, created_at, content_url, seo_description", { count: "exact" })
    .eq("group_id", groupData.id)
    .order("created_at", { ascending: false });

  // Apply Filter
  if (type !== "all") {
    query = query.eq("type", type);
  }

  // Apply Pagination
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: resources, count } = await query.range(from, to);
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  // Gradient Helper for consistent branding
  const getGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-indigo-600",
      "from-emerald-500 to-teal-600",
      "from-purple-500 to-violet-600",
      "from-orange-500 to-red-500"
    ];
    return gradients[index % gradients.length];
  };

  // Helper icon
  const getIcon = (type: string) => {
    switch(type) {
        case 'pdf': return '📄';
        case 'video': return '▶️';
        case 'blog': return '✍️';
        case 'question': return '❓';
        default: return '📁';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* =========================================
          1. HERO SECTION (Dark & Premium)
         ========================================= */}
      <section className="bg-slate-900 text-white pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-[-50%] left-[20%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link> / 
                <Link href={`/resources/${segment_slug}`} className="hover:text-white transition-colors">{segmentData.title}</Link> / 
                <span className="text-blue-400">{groupData.title}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
                Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{groupData.title}</span> Subjects
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                Select a subject below to access chapter-wise notes, PDF suggestions, video classes, and board questions tailored for your exam.
            </p>
        </div>
      </section>

      {/* =========================================
          2. CONTENT AREA
         ========================================= */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT COLUMN: Subjects Grid */}
            <div className="lg:col-span-8">
                
                {/* A. SUBJECTS GRID */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-900">Available Subjects</h2>
                </div>

                {subjects && subjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
                        {subjects.map((sub, index) => (
                            <Link 
                                key={sub.id} 
                                href={`/resources/${segment_slug}/${group_slug}/${sub.slug}`} 
                                className="group bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
                            >
                                {/* Top Accent Strip */}
                                <div className={`h-1.5 w-full bg-gradient-to-r ${getGradient(index)}`}></div>
                                
                                <div className="p-6 flex items-start gap-5">
                                    {/* Icon Box */}
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getGradient(index)} text-white flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                                        {sub.title.charAt(0)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1 line-clamp-2">
                                            {sub.title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wide group-hover:text-blue-400 transition-colors mt-2">
                                            <span>View Materials</span>
                                            <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center mb-16">
                        <div className="text-4xl mb-4">📚</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No subjects found</h3>
                        <p className="text-slate-500">We are adding subjects for this group soon.</p>
                    </div>
                )}

                {/* B. LATEST RESOURCES (PAGINATED) */}
                <div className="mb-16">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-1.5 bg-orange-500 rounded-full"></div>
                            <h2 className="text-2xl font-bold text-slate-900">General Materials</h2>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
                        {['all', 'pdf', 'video', 'question', 'blog'].map((t) => (
                            <Link 
                                key={t}
                                href={`/resources/${segment_slug}/${group_slug}?type=${t}&page=1`}
                                scroll={false}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition ${type === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'}`}
                            >
                                {t}
                            </Link>
                        ))}
                    </div>
                    
                    {resources && resources.length > 0 ? (
                        <div className="space-y-4">
                             {resources.map((res) => (
                                <Link key={res.id} href={res.type === 'blog' ? `/blog/${res.id}` : res.content_url || '#'} target={res.type === 'blog' ? '_self' : '_blank'} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-orange-300 hover:shadow-md transition group">
                                     <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                                        {getIcon(res.type)}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1">{res.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{res.type}</span>
                                            <span className="text-xs text-slate-400">• {new Date(res.created_at).toLocaleDateString()}</span>
                                        </div>
                                     </div>
                                     <div className="text-slate-300 group-hover:text-orange-500 transition-colors">
                                        ➔
                                     </div>
                                </Link>
                             ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-500">
                            No general materials found for this filter.
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <Link 
                                href={`/resources/${segment_slug}/${group_slug}?type=${type}&page=${currentPage - 1}`}
                                className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 ${currentPage <= 1 ? 'opacity-50 pointer-events-none bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                            >
                                ← Prev
                            </Link>
                            <span className="text-sm font-bold text-slate-600">Page {currentPage} of {totalPages}</span>
                            <Link 
                                href={`/resources/${segment_slug}/${group_slug}?type=${type}&page=${currentPage + 1}`}
                                className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 ${currentPage >= totalPages ? 'opacity-50 pointer-events-none bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                            >
                                Next →
                            </Link>
                        </div>
                    )}
                </div>

            </div>

            {/* RIGHT COLUMN: Sidebar */}
            <div className="lg:col-span-4 space-y-8">
                <Sidebar />
            </div>
        </div>
      </section>

    </div>
  );
}