import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

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
  
  // Icon helpers (SVG)
  const getIcon = (t: string) => {
    switch(t) {
        case 'routine': return (
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        );
        case 'syllabus': return (
            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        );
        case 'exam_result': return (
            <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        );
        default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Main Content Area */}
            <div className="flex-1">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        <Link href="/" className="hover:text-blue-600 transition">Home</Link> / 
                        <Link href={`/resources/${segment_slug}`} className="hover:text-blue-600 transition">{segmentData.title}</Link> / 
                        <span className="text-blue-600">{formatType(type)} Archive</span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                            {getIcon(type)}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900">
                             All {formatType(type)}s
                        </h1>
                    </div>
                    <p className="text-slate-500 text-lg">
                        Browse all official {type.replace('_', ' ')}s published for {segmentData.title}.
                    </p>
                </div>

                {/* Posts Grid (Modernized) */}
                {posts && posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
                        {posts.map(post => (
                            <Link 
                                key={post.id} 
                                href={`/resources/${segment_slug}/updates/${post.id}`}
                                className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="bg-slate-50 text-slate-500 text-xs font-bold px-3 py-1 rounded-full border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            {formatType(type)}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors leading-snug mb-2 line-clamp-2">
                                        {post.title}
                                    </h3>
                                </div>
                                <div className="mt-4 flex items-center text-sm font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                                    View Details 
                                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
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

                {/* NEW: App Download Section (Modern CTA) */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-10 shadow-xl text-white">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left max-w-lg">
                            <h2 className="text-2xl md:text-3xl font-black mb-3">
                                Study Smarter, Not Harder
                            </h2>
                            <p className="text-blue-100 mb-6 text-sm md:text-base opacity-90 leading-relaxed">
                                Get instant notifications for new {type.replace('_', ' ')}s, access offline study materials, and take quizzes directly on your phone.
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                <button className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all transform hover:scale-105 flex items-center gap-2">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" /></svg>
                                    Get on Google Play
                                </button>
                            </div>
                        </div>
                        {/* Decorative Icon Background */}
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M17,1.01L7,1C5.9,1 5,1.9 5,3V21C5,22.1 5.9,23 7,23H17C18.1,23 19,22.1 19,21V3C19,1.9 18.1,1.01 17,1.01M17,19H7V5H17V19Z" /></svg>
                        </div>
                    </div>
                </div>
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