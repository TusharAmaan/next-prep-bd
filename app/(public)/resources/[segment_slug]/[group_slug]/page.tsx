import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function GroupPage({ params }: { params: Promise<{ segment_slug: string; group_slug: string }> }) {
  const { segment_slug, group_slug } = await params;

  // 1. Fetch Segment
  const { data: segmentData } = await supabase
    .from("segments")
    .select("id, title")
    .eq("slug", segment_slug)
    .single();

  if (!segmentData) return notFound();

  // 2. Fetch Group (strictly belonging to this segment)
  const { data: groupData } = await supabase
    .from("groups")
    .select("id, title")
    .eq("slug", group_slug)
    .eq("segment_id", segmentData.id)
    .single();

  if (!groupData) return notFound();

  // 3. Fetch Subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("group_id", groupData.id)
    .order("id");

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="mb-10 border-b border-gray-200 pb-8">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                <Link href="/" className="hover:text-blue-600 transition">Home</Link> / 
                <span className="text-gray-600">{segmentData.title}</span> / 
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{groupData.title}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Browse <span className="text-blue-600">{groupData.title}</span> Subjects
            </h1>
            <p className="text-gray-500 mt-2 max-w-2xl">
                Select a subject below to access chapter-wise notes, PDF suggestions, video classes, and board questions.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* SUBJECT GRID (8 Cols) */}
            <div className="lg:col-span-8">
                {subjects && subjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {subjects.map((sub) => (
                            <Link 
                                key={sub.id} 
                                href={`/resources/${segment_slug}/${group_slug}/${sub.slug}`}
                                className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex items-start gap-5 h-full"
                            >
                                {/* Icon Box - Fixed Size */}
                                <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-2xl flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
                                    {sub.title.charAt(0)}
                                </div>
                                
                                {/* Content - Flexible Width */}
                                <div className="flex-1 min-w-0 py-1">
                                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 leading-snug mb-2 break-words">
                                        {sub.title}
                                    </h3>
                                    <div className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wide group-hover:text-blue-500 transition-colors">
                                        <span>View Materials</span>
                                        <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-xl border-2 border-dashed text-center">
                        <div className="text-4xl mb-4">📚</div>
                        <h3 className="text-gray-900 font-bold text-lg">No subjects found</h3>
                        <p className="text-gray-500 text-sm mt-1">Check back later for updates.</p>
                    </div>
                )}
            </div>

            {/* SIDEBAR (4 Cols) */}
            <div className="lg:col-span-4">
                <Sidebar />
            </div>
        </div>
      </div>
    </div>
  );
}