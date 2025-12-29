import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function SegmentPage({ params }: { params: Promise<{ segment_slug: string }> }) {
  const { segment_slug } = await params;

  // 1. Fetch Segment Data
  const { data: segmentData } = await supabase.from("segments").select("*").eq("slug", segment_slug).single();
  if (!segmentData) return notFound();

  // 2. Fetch Groups
  const { data: groups } = await supabase.from("groups").select("*").eq("segment_id", segmentData.id).order("id");

  // 3. FETCH UPDATES (Routine, Syllabus, Result)
  const { data: updates } = await supabase
    .from("segment_updates")
    .select("id, type, title, created_at")
    .eq("segment_id", segmentData.id)
    .order("created_at", { ascending: false });

  // 4. FETCH CONTENT BY TYPE
  
  // A. Blogs (Latest 4)
  const { data: blogs } = await supabase
    .from("resources")
    .select("id, title, type, created_at, content_url, seo_description, category")
    .eq("segment_id", segmentData.id)
    .eq("type", "blog")
    .order("created_at", { ascending: false })
    .limit(4);

  // B. Materials (PDF/Video - Latest 5)
  const { data: materials } = await supabase
    .from("resources")
    .select("id, title, type, created_at, content_url, subjects(title)")
    .eq("segment_id", segmentData.id)
    .in("type", ["pdf", "video"])
    .order("created_at", { ascending: false })
    .limit(5);

  // C. Questions (Latest 5)
  const { data: questions } = await supabase
    .from("resources")
    .select("id, title, type, created_at, subjects(title)")
    .eq("segment_id", segmentData.id)
    .eq("type", "question")
    .order("created_at", { ascending: false })
    .limit(5);

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
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
                {segmentData.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Hub</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                Your complete guide to {segmentData.title}. Access free notes, question banks, and video classes below.
            </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT COLUMN (8 cols) */}
            <div className="lg:col-span-8 space-y-16">
                
                {/* 1. GROUPS SELECTION */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-slate-900">Select Group</h2>
                    </div>

                    {groups && groups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {groups.map((group, index) => (
                                <Link 
                                    key={group.id} 
                                    href={`/resources/${segment_slug}/${group.slug}`} 
                                    className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-56 cursor-pointer"
                                >
                                    <div className={`h-1.5 w-full bg-gradient-to-r ${getGradient(index)}`}></div>
                                    <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradient(index)} text-white flex items-center justify-center text-2xl font-black mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                                            {group.title.charAt(0)}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                                            {group.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                                            Enter Group →
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                            <div className="text-4xl mb-4 opacity-50">📂</div>
                            <h3 className="text-lg font-bold text-slate-700">No Groups Found</h3>
                        </div>
                    )}
                </div>

                {/* 2. QUICK TOOLS (Routine, Syllabus) */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="text-xl">⚡</span> Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Routine */}
                        <Link href={`/resources/${segment_slug}/category/routine`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-2xl">📅</span>
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase group-hover:bg-blue-600 group-hover:text-white transition-colors">Routine</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm">Exam Routine</h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{routine ? routine.title : "Check Archive"}</p>
                        </Link>

                        {/* Syllabus */}
                        <Link href={`/resources/${segment_slug}/category/syllabus`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-2xl">📝</span>
                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold uppercase group-hover:bg-emerald-600 group-hover:text-white transition-colors">Syllabus</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm">Full Syllabus</h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{syllabus ? syllabus.title : "Check Archive"}</p>
                        </Link>

                        {/* Result */}
                        <Link href={`/resources/${segment_slug}/category/exam_result`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-2xl">🏆</span>
                                <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded font-bold uppercase group-hover:bg-purple-600 group-hover:text-white transition-colors">Result</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm">Exam Results</h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{result ? result.title : "Check Archive"}</p>
                        </Link>
                    </div>
                </div>

                {/* 3. LATEST BLOGS (Fixed UI) */}
                <section>
                    <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-purple-100 text-purple-600 rounded-lg text-lg">✍️</span>
                            <h2 className="text-xl font-bold text-slate-900">Latest Articles</h2>
                        </div>
                        {/* LINK TO BLOG LIST PAGE with Segment Filter */}
                        <Link href={`/blog?segment=${encodeURIComponent(segmentData.title)}`} className="text-sm font-bold text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors">
                            View All Posts →
                        </Link>
                    </div>

                    {blogs && blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blogs.map((blog) => (
                                <Link key={blog.id} href={`/blog/${blog.id}`} className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                                    {/* Cover Image or Gradient Fallback */}
                                    <div className="h-48 relative overflow-hidden border-b border-slate-100">
                                        {blog.content_url ? (
                                            <Image 
                                                src={blog.content_url} 
                                                alt={blog.title} 
                                                fill 
                                                className="object-cover transition-transform duration-700 group-hover:scale-105" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-800 to-slate-900 group-hover:from-blue-900 group-hover:to-slate-900 transition-all">
                                                <h3 className="text-white font-bold text-center line-clamp-3 leading-snug drop-shadow-md">
                                                    {blog.title}
                                                </h3>
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-100">
                                                {blog.category || 'Article'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        {blog.content_url && (
                                            <h3 className="font-bold text-lg text-slate-900 mb-2 leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">
                                                {blog.title}
                                            </h3>
                                        )}
                                        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                                            {blog.seo_description || "Read full article for details..."}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-t border-slate-100 pt-4 mt-auto">
                                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                            <span className="text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read Now →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">
                            No articles published yet.
                        </div>
                    )}
                </section>

                {/* 4. STUDY MATERIALS (PDF/Video List) */}
                <section>
                    <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg text-lg">📚</span>
                            <h2 className="text-xl font-bold text-slate-900">Study Materials</h2>
                        </div>
                        {/* LINK TO MATERIALS LIST (Requires a page, using /resources for now) */}
                        <Link href={`/resources?segment=${encodeURIComponent(segmentData.title)}&type=pdf`} className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                            View All PDFs →
                        </Link>
                    </div>

                    {materials && materials.length > 0 ? (
                        <div className="space-y-3">
                            {materials.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4 group">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${item.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                        {item.type === 'pdf' ? '📄' : '▶'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-blue-600 transition-colors mb-1 truncate">
                                            <a href={item.content_url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                                            <span className="uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">{Array.isArray(item.subjects) ? item.subjects[0]?.title : 'General'}</span>
                                            <span>•</span>
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-900 hover:text-white transition whitespace-nowrap hidden sm:block">
                                        {item.type === 'pdf' ? 'Download' : 'Watch'}
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">
                            No materials available yet.
                        </div>
                    )}
                </section>

            </div>

            {/* RIGHT COLUMN: SIDEBAR (4 cols) */}
            <div className="lg:col-span-4 space-y-8">
                <Sidebar />
                
                {/* Optional: Add an Ad Unit here if needed */}
                {/* <div className="bg-slate-200 h-64 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                    Ad Space
                </div> */}
            </div>
        </div>
      </section>

    </div>
  );
}