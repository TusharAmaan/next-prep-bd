import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function SegmentPage({ params }: { params: Promise<{ segment_slug: string }> }) {
  const { segment_slug } = await params;

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

  // 4. FETCH CONTENT BY TYPE (Separate Queries)
  
  // A. Blogs (Latest 4)
  const { data: blogs } = await supabase
    .from("resources")
    .select("id, title, type, created_at, content_url, seo_description")
    .eq("segment_id", segmentData.id)
    .eq("type", "blog")
    .order("created_at", { ascending: false })
    .limit(4);

  // B. Materials (PDF/Video - Latest 6)
  const { data: materials } = await supabase
    .from("resources")
    .select("id, title, type, created_at, content_url")
    .eq("segment_id", segmentData.id)
    .in("type", ["pdf", "video"])
    .order("created_at", { ascending: false })
    .limit(6);

  // C. Questions (Latest 6)
  const { data: questions } = await supabase
    .from("resources")
    .select("id, title, type, created_at")
    .eq("segment_id", segmentData.id)
    .eq("type", "question")
    .order("created_at", { ascending: false })
    .limit(6);

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
            <div className="lg:col-span-8 space-y-12">
                
                {/* A. GROUPS GRID */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-slate-900">Select Your Group</h2>
                    </div>

                    {groups && groups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                            <div className="text-4xl mb-4">📂</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Groups Found</h3>
                        </div>
                    )}
                </div>

                {/* B. ESSENTIAL TOOLS */}
                <div>
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

                {/* --- SEPARATE CONTENT SECTIONS START HERE --- */}

                {/* 1. LATEST POSTS (BLOGS) */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-purple-100 text-purple-600 rounded-lg text-xl">✍️</span>
                            <h2 className="text-2xl font-bold text-gray-900">Latest Posts</h2>
                        </div>
                        {blogs && blogs.length > 0 && (
                            <Link href={`/blog?segment=${segmentData.title}`} className="text-sm font-bold text-purple-600 hover:underline">View All</Link>
                        )}
                    </div>
                    {blogs && blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blogs.map((blog) => (
                                <Link key={blog.id} href={`/blog/${blog.id}`} className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
                                    <div className="h-40 bg-gray-100 relative overflow-hidden">
                                        {blog.content_url ? (
                                            <img src={blog.content_url} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 font-bold">No Image</div>
                                        )}
                                        <div className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow">BLOG</div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg text-gray-800 mb-2 leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">{blog.title}</h3>
                                        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-400 font-medium border-t border-gray-50">
                                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                            <span className="text-purple-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">Read More →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-400 text-sm font-medium italic">No blog posts available yet.</div>
                    )}
                </section>

                {/* 2. STUDY MATERIALS (PDF/VIDEO) */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg text-xl">📄</span>
                            <h2 className="text-2xl font-bold text-gray-900">Study Materials</h2>
                        </div>
                        {materials && materials.length > 0 && (
                            <Link href={`/resources/${segment_slug}?type=pdf`} className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
                        )}
                    </div>
                    {materials && materials.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {materials.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${item.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                        {item.type === 'pdf' ? '' : '▶'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-1 truncate">
                                            <a href={item.content_url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                            <span className="uppercase bg-gray-100 px-2 py-0.5 rounded">{item.type}</span>
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-black hover:text-white transition whitespace-nowrap">
                                        {item.type === 'pdf' ? 'Download' : 'Watch'}
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-400 text-sm font-medium italic">No materials uploaded yet.</div>
                    )}
                </section>

                {/* 3. PREVIOUS YEAR QUESTIONS */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-yellow-100 text-yellow-600 rounded-lg text-xl">❓</span>
                            <h2 className="text-2xl font-bold text-gray-900">Previous Year Questions</h2>
                        </div>
                        {questions && questions.length > 0 && (
                            <Link href={`/resources/${segment_slug}?type=question`} className="text-sm font-bold text-yellow-600 hover:underline">View All</Link>
                        )}
                    </div>
                    {questions && questions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {questions.map((q) => (
                                <Link href={`/question/${q.id}`} key={q.id} className="block bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all group">
                                    <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-yellow-700 transition-colors">{q.title}</h3>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                                        <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">Board Question</span>
                                        <span>•</span>
                                        <span>Click to View Solution</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-400 text-sm font-medium italic">No questions available yet.</div>
                    )}
                </section>

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