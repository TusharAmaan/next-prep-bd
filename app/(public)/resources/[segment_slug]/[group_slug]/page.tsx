import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function GroupPage({ params }: { params: Promise<{ segment_slug: string; group_slug: string }> }) {
  const { segment_slug, group_slug } = await params;

  // 1. Fetch Segment
  const { data: segmentData } = await supabase.from("segments").select("id, title").eq("slug", segment_slug).single();
  if (!segmentData) return notFound();

  // 2. Fetch Group
  const { data: groupData } = await supabase.from("groups").select("id, title").eq("slug", group_slug).eq("segment_id", segmentData.id).single();
  if (!groupData) return notFound();

  // 3. Fetch Subjects
  const { data: subjects } = await supabase.from("subjects").select("*").eq("group_id", groupData.id).order("id");

  // 4. FETCH CONTENT BY TYPE (Group Level)
  
  // A. Blogs (Latest 4)
  const { data: blogs } = await supabase
    .from("resources")
    .select("id, title, type, created_at, content_url, seo_description")
    .eq("group_id", groupData.id)
    .eq("type", "blog")
    .order("created_at", { ascending: false })
    .limit(4);

  // B. Materials (PDF/Video - Latest 6)
  const { data: materials } = await supabase
    .from("resources")
    .select("id, title, type, created_at, content_url")
    .eq("group_id", groupData.id)
    .in("type", ["pdf", "video"])
    .order("created_at", { ascending: false })
    .limit(6);

  // C. Questions (Latest 6)
  const { data: questions } = await supabase
    .from("resources")
    .select("id, title, type, created_at")
    .eq("group_id", groupData.id)
    .eq("type", "question")
    .order("created_at", { ascending: false })
    .limit(6);

  // Gradient Helper
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
        <div className="absolute top-[-50%] left-[20%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
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

      {/* CONTENT AREA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8 space-y-12">
                
                {/* A. SUBJECTS GRID */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-slate-900">Available Subjects</h2>
                    </div>

                    {subjects && subjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {subjects.map((sub, index) => (
                                <Link 
                                    key={sub.id} 
                                    href={`/resources/${segment_slug}/${group_slug}/${sub.slug}`} 
                                    className="group bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
                                >
                                    <div className={`h-1.5 w-full bg-gradient-to-r ${getGradient(index)}`}></div>
                                    <div className="p-6 flex items-start gap-5">
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
                        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                            <div className="text-4xl mb-4">📚</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No subjects found</h3>
                            <p className="text-slate-500">We are adding subjects for this group soon.</p>
                        </div>
                    )}
                </div>

                {/* --- SEPARATE CONTENT SECTIONS --- */}

                {/* 1. LATEST POSTS (BLOGS) */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-purple-100 text-purple-600 rounded-lg text-xl">✍️</span>
                            <h2 className="text-2xl font-bold text-gray-900">Latest Posts</h2>
                        </div>
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

                {/* 2. STUDY MATERIALS */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg text-xl">📄</span>
                            <h2 className="text-2xl font-bold text-gray-900">Study Materials</h2>
                        </div>
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