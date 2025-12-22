import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 12;

type Props = {
  params: Promise<{ segment_slug: string }>;
  searchParams: Promise<{ page?: string; type?: string }>;
};

export default async function SegmentPage({ params, searchParams }: Props) {
  const { segment_slug } = await params;
  const { page = "1", type = "all" } = await searchParams;

  const currentPage = parseInt(page) || 1;

  // 1. Fetch Segment Data
  const { data: segmentData } = await supabase.from("segments").select("*").eq("slug", segment_slug).single();
  if (!segmentData) return notFound();

  // 2. Fetch Groups
  const { data: groups } = await supabase.from("groups").select("*").eq("segment_id", segmentData.id).order("id");

  // 3. FETCH UPDATES
  const { data: updates } = await supabase
    .from("segment_updates")
    .select("id, type, title, created_at")
    .eq("segment_id", segmentData.id)
    .order("created_at", { ascending: false });

  // 4. FETCH RESOURCES (PAGINATED)
  let query = supabase
    .from("resources")
    .select("id, title, type, created_at, content_url, seo_description", { count: "exact" })
    .eq("segment_id", segmentData.id)
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

  // Filter updates helpers
  const routine = updates?.find(u => u.type === 'routine');
  const syllabus = updates?.find(u => u.type === 'syllabus');
  const result = updates?.find(u => u.type === 'exam_result');

  // Helper for colors
  const getGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-indigo-600",
      "from-emerald-500 to-teal-600",
      "from-purple-500 to-violet-600",
      "from-orange-500 to-red-500"
    ];
    return gradients[index % gradients.length];
  };

  // Helper icon for resources
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
      
      {/* HERO SECTION */}
      <section className="bg-slate-900 text-white pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link> / 
                <span className="text-blue-400">{segmentData.title}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                {segmentData.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Preparation</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                Your complete guide to {segmentData.title}. Access free notes, question banks, and video classes below.
            </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8">
                
                {/* A. GROUPS GRID */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-900">Select Your Group</h2>
                </div>

                {groups && groups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                        {groups.map((group, index) => (
                            <Link 
                                key={group.id} 
                                href={`/resources/${segment_slug}/${group.slug}`} 
                                className="group relative bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-64 cursor-pointer"
                            >
                                <div className={`h-1.5 w-full bg-gradient-to-r ${getGradient(index)}`}></div>
                                <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradient(index)} text-white flex items-center justify-center text-3xl font-black mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                                        {group.title.charAt(0)}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                        {group.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                                        View Subjects →
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center mb-16">
                        <div className="text-4xl mb-4">📂</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Groups Found</h3>
                    </div>
                )}

                {/* B. ESSENTIAL TOOLS */}
                <div className="mb-16">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="text-2xl">⚡</span> Quick Tools
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href={`/resources/${segment_slug}/category/routine`} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer group">
                            <div className="text-blue-600 text-2xl mb-3 group-hover:scale-110 transition-transform">📅</div>
                            <h4 className="font-bold text-slate-800">Exam Routine</h4>
                            {routine ? <p className="text-xs text-slate-500 mt-1 line-clamp-1">Latest: {routine.title}</p> : <p className="text-xs text-slate-400 mt-1">View Archive</p>}
                            <p className="text-[10px] text-blue-600 font-bold mt-2 uppercase">View All →</p>
                        </Link>

                        <Link href={`/resources/${segment_slug}/category/syllabus`} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition cursor-pointer group">
                            <div className="text-emerald-600 text-2xl mb-3 group-hover:scale-110 transition-transform">📝</div>
                            <h4 className="font-bold text-slate-800">Syllabus</h4>
                            {syllabus ? <p className="text-xs text-slate-500 mt-1 line-clamp-1">Latest: {syllabus.title}</p> : <p className="text-xs text-slate-400 mt-1">View Archive</p>}
                            <p className="text-[10px] text-emerald-600 font-bold mt-2 uppercase">View All →</p>
                        </Link>

                        <Link href={`/resources/${segment_slug}/category/exam_result`} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition cursor-pointer group">
                            <div className="text-purple-600 text-2xl mb-3 group-hover:scale-110 transition-transform">🏆</div>
                            <h4 className="font-bold text-slate-800">Exam Results</h4>
                            {result ? <p className="text-xs text-slate-500 mt-1 line-clamp-1">Latest: {result.title}</p> : <p className="text-xs text-slate-400 mt-1">View Archive</p>}
                            <p className="text-[10px] text-purple-600 font-bold mt-2 uppercase">View All →</p>
                        </Link>
                    </div>
                </div>

                {/* C. LATEST RESOURCES (PAGINATED & FILTERED) */}
                <div className="mb-16">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-1.5 bg-orange-500 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-slate-900">Latest Materials</h2>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
                        {['all', 'pdf', 'video', 'question', 'blog'].map((t) => (
                            <Link 
                                key={t}
                                href={`/resources/${segment_slug}?type=${t}&page=1`}
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
                                     <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                        {getIcon(res.type)}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1">{res.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{res.type}</span>
                                            <span className="text-xs text-slate-400">• {new Date(res.created_at).toLocaleDateString()}</span>
                                        </div>
                                     </div>
                                     <div className="text-slate-300 group-hover:text-orange-500 transition-colors">➔</div>
                                </Link>
                             ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-500">
                            No materials available for this section yet.
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <Link 
                                href={`/resources/${segment_slug}?type=${type}&page=${currentPage - 1}`}
                                className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 ${currentPage <= 1 ? 'opacity-50 pointer-events-none bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                            >
                                ← Prev
                            </Link>
                            <span className="text-sm font-bold text-slate-600">Page {currentPage} of {totalPages}</span>
                            <Link 
                                href={`/resources/${segment_slug}?type=${type}&page=${currentPage + 1}`}
                                className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 ${currentPage >= totalPages ? 'opacity-50 pointer-events-none bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                            >
                                Next →
                            </Link>
                        </div>
                    )}
                </div>

            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-4 space-y-8">
                <Sidebar />
            </div>
        </div>
      </section>

    </div>
  );
}