import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import MaterialList from "@/components/MaterialList"; 
import Image from "next/image";
import { 
  BookOpen, 
  FileText, 
  PlayCircle, 
  HelpCircle, 
  PenTool, 
  ChevronRight, 
  ArrowLeft 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GroupPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ segment_slug: string; group_slug: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { segment_slug, group_slug } = await params;
  const { type } = await searchParams;

  // 1. Fetch Segment
  const { data: segmentData } = await supabase.from("segments").select("id, title").eq("slug", segment_slug).single();
  if (!segmentData) return notFound();

  // 2. Fetch Group
  const { data: groupData } = await supabase.from("groups").select("id, title").eq("slug", group_slug).eq("segment_id", segmentData.id).single();
  if (!groupData) return notFound();


  // =========================================================
  //  A. LIST VIEW MODE (Triggered by "View All")
  // =========================================================
  if (type) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            {/* Compact Header for List View */}
            <div className="bg-[#0f172a] text-white py-16 px-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <Link 
                        href={`/resources/${segment_slug}/${group_slug}`} 
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-bold uppercase tracking-wide transition-all backdrop-blur-md mb-6"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to {groupData.title}
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                        {groupData.title} <span className="text-blue-400 capitalize">{type === 'pdf' ? 'Materials' : 'Question Bank'}</span>
                    </h1>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                <div className="lg:col-span-8">
                    <MaterialList groupId={groupData.id} initialType={type} />
                </div>
                <div className="lg:col-span-4 space-y-8">
                    <Sidebar />
                </div>
            </div>
        </div>
      );
  }

  // =========================================================
  //  B. DASHBOARD VIEW MODE (Default)
  // =========================================================

  // 3. Fetch Subjects
  const { data: subjects } = await supabase.from("subjects").select("*").eq("group_id", groupData.id).order("id");

  // 4. FETCH PREVIEW CONTENT
  const { data: blogs } = await supabase
    .from("resources")
    .select("id, title, type, created_at, content_url, seo_description, category")
    .eq("group_id", groupData.id)
    .eq("type", "blog")
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: materials } = await supabase
    .from("resources")
    .select("id, title, type, created_at, content_url, subjects(title)")
    .eq("group_id", groupData.id)
    .in("type", ["pdf", "video"])
    .order("created_at", { ascending: false })
    .limit(5);

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
      <section className="bg-[#0f172a] text-white pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-[-50%] left-[20%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link> / 
                <Link href={`/resources/${segment_slug}`} className="hover:text-white transition-colors">{segmentData.title}</Link> / 
                <span className="text-blue-400">{groupData.title}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
                Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{groupData.title}</span> Subjects
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                Select a subject below to access chapter-wise notes, PDF suggestions, video classes, and board questions.
            </p>
        </div>
      </section>

      {/* CONTENT AREA */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8 space-y-16">
                
                {/* 1. SUBJECTS GRID */}
                <div>
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
                                    className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
                                >
                                    <div className={`h-1.5 w-full bg-gradient-to-r ${getGradient(index)}`}></div>
                                    <div className="p-6 flex items-start gap-5">
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getGradient(index)} text-white flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                                            <BookOpen className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1 line-clamp-2 leading-snug">
                                                {sub.title}
                                            </h3>
                                            <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wide group-hover:text-blue-500 transition-colors mt-2">
                                                <span>View Content</span>
                                                <ChevronRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No subjects found</h3>
                            <p className="text-slate-500 text-sm">We are adding subjects for this group soon.</p>
                        </div>
                    )}
                </div>

                {/* 2. LATEST POSTS (BLOGS) */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-purple-100 text-purple-600 rounded-lg"><PenTool className="w-6 h-6" /></span>
                            <h2 className="text-xl font-bold text-slate-900">Latest Posts</h2>
                        </div>
                        {blogs && blogs.length > 0 && (
                            <Link href={`/blog?segment=${segmentData.title}`} className="self-start sm:self-auto text-sm font-bold text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                View All <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                    {blogs && blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blogs.map((blog) => (
                                <Link key={blog.id} href={`/blog/${blog.id}`} className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                                    <div className="h-40 bg-gray-100 relative overflow-hidden border-b border-slate-100">
                                        {blog.content_url ? (
                                            <Image src={blog.content_url} alt={blog.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-800 to-slate-900">
                                                <h4 className="text-white font-bold text-xs text-center line-clamp-2 px-2">{blog.title}</h4>
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-100">
                                            {blog.category || 'Article'}
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-base text-slate-900 mb-2 leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">{blog.title}</h3>
                                        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-400 font-bold border-t border-slate-100">
                                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                            <span className="text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read <ChevronRight className="w-3 h-3"/></span>
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText className="w-6 h-6" /></span>
                            <h2 className="text-xl font-bold text-slate-900">Study Materials</h2>
                        </div>
                        <Link href={`/resources/${segment_slug}/${group_slug}?type=pdf`} className="self-start sm:self-auto text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {materials && materials.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {materials.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4 group">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'pdf' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                        {item.type === 'pdf' ? <FileText className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-blue-600 transition-colors mb-1 leading-snug line-clamp-1">
                                            <a href={item.content_url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                                            <span className="uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                                                {Array.isArray(item.subjects) ? item.subjects[0]?.title : 'General'}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition whitespace-nowrap hidden sm:block shadow-md">
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-amber-100 text-amber-600 rounded-lg"><HelpCircle className="w-6 h-6" /></span>
                            <h2 className="text-xl font-bold text-slate-900">Previous Questions</h2>
                        </div>
                        <Link href={`/resources/${segment_slug}/${group_slug}?type=question`} className="self-start sm:self-auto text-sm font-bold text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {questions && questions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {questions.map((q) => (
                                <Link href={`/question/${q.id}`} key={q.id} className="block bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all group">
                                    <h3 className="font-bold text-slate-800 text-base md:text-lg mb-3 leading-snug group-hover:text-amber-700 transition-colors">
                                        {q.title}
                                    </h3>
                                    <div className="flex items-center justify-between gap-2">
                                         <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-blue-700 to-slate-900 text-white shadow-sm">
                                                {Array.isArray(q.subjects) ? q.subjects[0]?.title : 'Question'}
                                            </span>
                                         </div>
                                         <span className="text-xs font-bold text-slate-400 flex items-center gap-1 group-hover:text-amber-600 transition-colors uppercase tracking-wide">
                                            Solution <ChevronRight className="w-3 h-3" />
                                         </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-amber-50/50 p-8 rounded-xl border border-dashed border-amber-200 text-center text-amber-700/50 text-sm font-bold">
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