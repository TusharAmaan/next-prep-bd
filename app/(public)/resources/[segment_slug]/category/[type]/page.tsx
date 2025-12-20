import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import AppDownloadBanner from "@/components/AppDownloadBanner"; // Import the new component

export const dynamic = "force-dynamic";

export default async function CategoryListPage({ params }: { params: Promise<{ segment_slug: string; type: string }> }) {
  const { segment_slug, type } = await params;

  // Validate type
  const validTypes = ["routine", "syllabus", "exam_result"];
  if (!validTypes.includes(type)) return notFound();

  // 1. Fetch Segment Data
  const { data: segmentData } = await supabase
    .from("segments")
    .select("id, title")
    .eq("slug", segment_slug)
    .single();

  if (!segmentData) return notFound();

  // 2. Fetch All Updates
  const { data: posts } = await supabase
    .from("segment_updates")
    .select("id, title, created_at")
    .eq("segment_id", segmentData.id)
    .eq("type", type)
    .order("created_at", { ascending: false });

  // Formatting helper
  const formatType = (t: string) => t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  // Style helpers based on type
  const getTypeStyles = (t: string) => {
    switch(t) {
        case 'routine': return { color: "text-blue-600", bg: "bg-blue-50", border: "border-l-blue-500" };
        case 'syllabus': return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-l-emerald-500" };
        case 'exam_result': return { color: "text-purple-600", bg: "bg-purple-50", border: "border-l-purple-500" };
        default: return { color: "text-slate-600", bg: "bg-slate-50", border: "border-l-slate-500" };
    }
  };
  
  const styles = getTypeStyles(type);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Main Content Area */}
            <div className="flex-1">
                {/* Page Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        <Link href="/" className="hover:text-blue-600 transition">Home</Link> / 
                        <Link href={`/resources/${segment_slug}`} className="hover:text-blue-600 transition">{segmentData.title}</Link> / 
                        <span className={styles.color}>{formatType(type)} Archive</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
                         All {formatType(type)}s
                    </h1>
                    <p className="text-slate-500 text-lg">
                        Browse all official {type.replace('_', ' ')}s published for {segmentData.title}.
                    </p>
                </div>

                {/* Posts Grid (Redesigned) */}
                {posts && posts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 mb-12">
                        {posts.map(post => (
                            <Link 
                                key={post.id} 
                                href={`/resources/${segment_slug}/updates/${post.id}`}
                                className={`group relative bg-white p-6 rounded-r-xl rounded-l-sm border border-slate-200 border-l-4 ${styles.border} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${styles.bg} ${styles.color}`}>
                                                {formatType(type)}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">
                                            {post.title}
                                        </h3>
                                    </div>

                                    {/* Action Button Visual */}
                                    <div className="shrink-0">
                                        <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors bg-slate-50 group-hover:bg-blue-50 px-4 py-2 rounded-lg">
                                            View Details
                                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center mb-12">
                        <div className="text-5xl mb-4 opacity-20">📂</div>
                        <h3 className="text-xl font-bold text-slate-700">No content found</h3>
                        <p className="text-slate-400 mt-2">We haven't uploaded any {formatType(type)}s yet.</p>
                    </div>
                )}

                {/* Using the New Component Here */}
                <AppDownloadBanner />
            </div>

            {/* Sidebar (Right Side) */}
            <div className="w-full lg:w-80 shrink-0 space-y-8">
                <Sidebar />
            </div>

        </div>
      </div>
    </div>
  );
}