import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function CategoryListPage({ params }: { params: Promise<{ segment_slug: string; type: string }> }) {
  const { segment_slug, type } = await params;

  // Validate type to prevent 404 errors on weird URLs
  const validTypes = ["routine", "syllabus", "exam_result"];
  if (!validTypes.includes(type)) return notFound();

  // 1. Fetch Segment Data
  const { data: segmentData } = await supabase
    .from("segments")
    .select("id, title")
    .eq("slug", segment_slug)
    .single();

  if (!segmentData) return notFound();

  // 2. Fetch All Updates for this Type (Ordered by newest)
  const { data: posts } = await supabase
    .from("segment_updates")
    .select("id, title, created_at")
    .eq("segment_id", segmentData.id)
    .eq("type", type)
    .order("created_at", { ascending: false });

  // Formatting helper
  const formatType = (t: string) => t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  const typeIcons: any = { routine: "📅", syllabus: "📝", exam_result: "🏆" };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div className="lg:col-span-8">
                {/* Page Header */}
                <div className="mb-8 border-b border-gray-200 pb-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        <Link href="/" className="hover:text-blue-600">Home</Link> / 
                        <Link href={`/resources/${segment_slug}`} className="hover:text-blue-600">{segmentData.title}</Link> / 
                        <span className="text-blue-600">{formatType(type)} Archive</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3">
                        <span>{typeIcons[type]}</span> 
                        <span>All {formatType(type)}s</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Browse all published {type.replace('_', ' ')}s for {segmentData.title}.
                    </p>
                </div>

                {/* Posts Grid */}
                {posts && posts.length > 0 ? (
                    <div className="grid gap-4">
                        {posts.map(post => (
                            <Link 
                                key={post.id} 
                                href={`/resources/${segment_slug}/updates/${post.id}`}
                                className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between"
                            >
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors mb-1">
                                        {post.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Published on {new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                    ➔
                                </span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-xl border border-dashed border-slate-200 text-center">
                        <div className="text-4xl mb-4 grayscale opacity-50">📂</div>
                        <h3 className="text-lg font-bold text-slate-700">No posts found</h3>
                        <p className="text-slate-400 text-sm mt-1">We haven't uploaded any {formatType(type)}s yet.</p>
                    </div>
                )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">
                <Sidebar />
            </div>

        </div>
      </div>
    </div>
  );
}