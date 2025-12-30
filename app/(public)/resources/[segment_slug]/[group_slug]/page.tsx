import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import MaterialList from "@/components/MaterialList"; // Using our smart list component
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function GroupPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ segment_slug: string; group_slug: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { segment_slug, group_slug } = await params;
  const { type } = await searchParams; // Capture ?type=pdf or ?type=question

  // 1. Fetch Segment
  const { data: segmentData } = await supabase.from("segments").select("id, title").eq("slug", segment_slug).single();
  if (!segmentData) return notFound();

  // 2. Fetch Group
  const { data: groupData } = await supabase.from("groups").select("id, title").eq("slug", group_slug).eq("segment_id", segmentData.id).single();
  if (!groupData) return notFound();


  // === A. LIST VIEW MODE (Triggered by "View All") ===
  if (type) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            {/* Compact Header for List View */}
            <div className="bg-slate-900 text-white py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <Link 
                        href={`/resources/${segment_slug}/${group_slug}`} 
                        className="text-xs font-bold text-slate-400 hover:text-white uppercase mb-4 inline-flex items-center gap-1 transition-colors"
                    >
                        ← Back to {groupData.title} Dashboard
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black">
                        {groupData.title} <span className="text-blue-400 capitalize">{type === 'pdf' ? 'Materials' : 'Question Bank'}</span>
                    </h1>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8">
                    {/* Render the robust list filtered by Group ID */}
                    <MaterialList groupId={groupData.id} initialType={type} />
                </div>
                <div className="lg:col-span-4 space-y-8">
                    <Sidebar />
                </div>
            </div>
        </div>
      );
  }

  // === B. DASHBOARD VIEW MODE (Default) ===

  // 3. Fetch Subjects
  const { data: subjects } = await supabase.from("subjects").select("*").eq("group_id", groupData.id).order("id");

  // 4. FETCH PREVIEW CONTENT (Limited)
  // A. Blogs
  const { data: blogs } = await supabase
    .from("resources")
    .select("id, title, type, created_at, content_url, seo_description, category")
    .eq("group_id", groupData.id)
    .eq("type", "blog")
    .order("created_at", { ascending: false })
    .limit(4);

  // B. Materials
  const { data: materials } = await supabase
    .from("resources")
    .select("id, title, type, created_at, content_url, subjects(title)")
    .eq("group_id", groupData.id)
    .in("type", ["pdf", "video"])
    .order("created_at", { ascending: false })
    .limit(5);

  // C. Questions
  const { data: questions } = await supabase
    .from("resources")
    .select("id, title, type, created_at, subjects(title)")
    .eq("group_id", groupData.id)
    .eq("type", "question")
    .order("created_at", { ascending: false })
    .limit(5);

  const getGradient = (index: number) => {
    const gradients = ["from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-purple-500 to-violet-600", "from-orange-500 to-red-500"];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
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
                Select a subject below to access chapter-wise notes, PDF suggestions, video classes, and board questions.
            </p>
        </div>
      </section>

      {/* CONTENT AREA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8 space-y-12">
                
                {/* 1. SUBJECTS GRID */}
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
                        <div className="bg-slate-50 p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                            <div className="text-4xl mb-4 opacity-50">📚</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No subjects found</h3>
                            <p className="text-slate-500">We are adding subjects for this group soon.</p>
                        </div>
                    )}
                </div>

                {/* 2. LATEST POSTS (BLOGS) */}
                <section>
                    <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-purple-100 text-purple-600 rounded-lg text-xl">✍️</span>
                            <h2 className="text-xl font-bold text-gray-900">Latest Posts</h2>
                        </div>
                        {blogs && blogs.length > 0 && (
                            // Note: This links to general blog list filtered by Segment (as Group filtering is not yet in sidebar)
                            <Link href={`/blog?segment=${segmentData.title}`} className="text-sm font-bold text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors">
                                View All →
                            </Link>
                        )}
                    </div>
                    {blogs && blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blogs.map((blog) => (
                                <Link key={blog.id} href={`/blog/${blog.id}`} className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
                                    <div className="h-40 bg-gray-100 relative overflow-hidden border-b border-slate-100">
                                        {blog.content_url ? (
                                            <Image src={blog.content_url} alt={blog.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-800 to-slate-900">
                                                <h4 className="text-white font-bold text-xs text-center line-clamp-2">{blog.title}</h4>
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-100">
                                            {blog.category || 'Article'}
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg text-slate-900 mb-2 leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">{blog.title}</h3>
                                        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-400 font-bold border-t border-slate-100">
                                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                            <span className="text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">
                            No blog posts available yet.
                        </div>
                    )}
                </section>

                {/* 3. STUDY MATERIALS (PDF/Video) */}
                <section>
                    <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg text-xl">📄</span>
                            <h2 className="text-xl font-bold text-gray-900">Study Materials</h2>
                        </div>
                        {/* VIEW ALL LINK - Triggers List View */}
                        <Link href={`/resources/${segment_slug}/${group_slug}?type=pdf`} className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                            View All →
                        </Link>
                    </div>
                    {materials && materials.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {materials.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${item.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                        {item.type === 'pdf' ? '' : '▶'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-blue-600 transition-colors mb-1 truncate">
                                            <a href={item.content_url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                                            {/* Fix Array Access */}
                                            <span className="uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                                                {Array.isArray(item.subjects) ? item.subjects[0]?.title : 'General'}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition whitespace-nowrap hidden sm:block">
                                        {item.type === 'pdf' ? 'Download' : 'Watch'}
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">
                            No materials uploaded yet.
                        </div>
                    )}
                </section>

                {/* 4. PREVIOUS QUESTIONS */}
                <section>
                    <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-yellow-100 text-yellow-600 rounded-lg text-xl">❓</span>
                            <h2 className="text-xl font-bold text-gray-900">Previous Questions</h2>
                        </div>
                        {/* VIEW ALL LINK - Triggers List View */}
                        <Link href={`/resources/${segment_slug}/${group_slug}?type=question`} className="text-sm font-bold text-yellow-600 hover:bg-yellow-50 px-3 py-1.5 rounded-lg transition-colors">
                            View All →
                        </Link>
                    </div>
                    {questions && questions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {questions.map((q) => (
                                <Link href={`/question/${q.id}`} key={q.id} className="block bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all group">
                                    <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-yellow-700 transition-colors">{q.title}</h3>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                                        <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                                            {Array.isArray(q.subjects) ? q.subjects[0]?.title : 'Question'}
                                        </span>
                                        <span>•</span>
                                        <span>Click to View Solution</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        // Always show section even if empty
                        <div className="bg-yellow-50/50 p-8 rounded-xl border border-dashed border-yellow-200 text-center text-yellow-700/50 text-sm font-bold">
                            No questions available yet.
                        </div>
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