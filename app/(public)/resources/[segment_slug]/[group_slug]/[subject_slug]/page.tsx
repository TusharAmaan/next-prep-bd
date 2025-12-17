import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function SubjectPage({ params }: { params: Promise<{ segment_slug: string; group_slug: string; subject_slug: string }> }) {
  const { segment_slug, group_slug, subject_slug } = await params;

  // 1. Fetch Segment
  const { data: segmentData } = await supabase
    .from("segments")
    .select("id, title")
    .eq("slug", segment_slug)
    .single();

  if (!segmentData) return notFound();

  // 2. Fetch Group
  const { data: groupData } = await supabase
    .from("groups")
    .select("id, title")
    .eq("slug", group_slug)
    .eq("segment_id", segmentData.id)
    .single();

  if (!groupData) return notFound();

  // 3. Fetch Subject (Strict Hierarchy Check)
  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subject_slug)
    .eq("group_id", groupData.id)
    .single();

  if (!subject) return notFound();

  // 4. Fetch Content - Blogs (Latest Posts)
  const { data: blogs } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", subject.id)
    .eq("type", "blog")
    .order("created_at", { ascending: false });

  // 5. Fetch Content - Study Materials (PDF/Video)
  const { data: materials } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", subject.id)
    .in("type", ["pdf", "video"])
    .order("created_at", { ascending: false });

  // 6. Fetch Content - Questions
  const { data: questions } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", subject.id)
    .eq("type", "question")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="mb-10 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                <Link href="/" className="hover:text-blue-600 transition">Home</Link> / 
                <span className="text-gray-500">{segmentData.title}</span> / 
                <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-blue-600 transition">{groupData.title}</Link> /
                <span className="text-blue-600">{subject.title}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                {subject.title}
            </h1>
            <p className="text-lg text-gray-500 max-w-3xl">
                Browse all notes, blogs, video classes, and previous year questions for {subject.title}.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT CONTENT (8 Cols) */}
            <div className="lg:col-span-8 space-y-12">
                
                {/* SECTION: LATEST POSTS (BLOGS) */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="p-2 bg-purple-100 text-purple-600 rounded-lg text-xl">✍️</span>
                        <h2 className="text-2xl font-bold text-gray-900">Latest Posts</h2>
                    </div>
                    
                    {blogs && blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blogs.map((blog) => (
                                <Link 
                                    key={blog.id} 
                                    href={`/blog/${blog.id}`}
                                    className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all flex flex-col h-full"
                                >
                                    <div className="h-40 bg-gray-100 relative overflow-hidden">
                                        {blog.content_url ? (
                                            <img src={blog.content_url} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold bg-gray-100">No Image</div>
                                        )}
                                        <div className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                                            BLOG
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg text-gray-800 mb-2 leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">
                                            {blog.title}
                                        </h3>
                                        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-400 font-medium border-t border-gray-50">
                                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                            <span className="text-purple-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                                                Read More →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                            <p className="text-gray-400 text-sm font-medium italic">No blog posts available yet.</p>
                        </div>
                    )}
                </section>

                {/* SECTION: STUDY MATERIALS */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="p-2 bg-blue-100 text-blue-600 rounded-lg text-xl">📚</span>
                        <h2 className="text-2xl font-bold text-gray-900">Study Materials</h2>
                    </div>
                    {materials && materials.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {materials.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${item.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                        {item.type === 'pdf' ? '📄' : '▶'}
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
                        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                            <p className="text-gray-400 text-sm font-medium italic">No materials uploaded yet.</p>
                        </div>
                    )}
                </section>

                {/* SECTION: PREVIOUS YEAR QUESTIONS */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="p-2 bg-yellow-100 text-yellow-600 rounded-lg text-xl">❓</span>
                        <h2 className="text-2xl font-bold text-gray-900">Previous Year Questions</h2>
                    </div>
                    {questions && questions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {questions.map((q) => (
                                <Link href={`/question/${q.id}`} key={q.id} className="block bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all group">
                                    <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-yellow-700 transition-colors">
                                        {q.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                                        <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">Board Question</span>
                                        <span>•</span>
                                        <span>Click to View Solution</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                            <p className="text-gray-400 text-sm font-medium italic">No questions available yet.</p>
                        </div>
                    )}
                </section>

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