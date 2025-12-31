import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import DarkAppPromo from "@/components/DarkAppPromo";
import Image from "next/image";
import { 
  ArrowLeft, 
  PenTool, 
  FileText, 
  PlayCircle, 
  HelpCircle, 
  ChevronRight, 
  Clock,
  Timer
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubjectPage({ params }: { params: Promise<{ segment_slug: string; group_slug: string; subject_slug: string }> }) {
  const { segment_slug, group_slug, subject_slug } = await params;

  // 1. Fetch Segment
  const { data: segmentData } = await supabase.from("segments").select("id, title").eq("slug", segment_slug).single();
  if (!segmentData) return notFound();

  // 2. Fetch Group
  const { data: groupData } = await supabase.from("groups").select("id, title").eq("slug", group_slug).eq("segment_id", segmentData.id).single();
  if (!groupData) return notFound();

  // 3. Fetch Subject
  const { data: subject } = await supabase.from("subjects").select("*").eq("slug", subject_slug).eq("group_id", groupData.id).single();
  if (!subject) return notFound();

  // 4. Fetch Content
  const { data: blogs } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", subject.id)
    .eq("type", "blog")
    .order("created_at", { ascending: false })
    .limit(6);

  const { data: materials } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", subject.id)
    .in("type", ["pdf", "video"])
    .order("created_at", { ascending: false })
    .limit(12);

  const { data: questions } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", subject.id)
    .eq("type", "question")
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* HERO SECTION */}
      <section className="bg-[#0f172a] text-white pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link> / 
                <span className="text-slate-500">{segmentData.title}</span> / 
                <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-white transition-colors">{groupData.title}</Link> /
                <span className="text-blue-400">{subject.title}</span>
            </div>

            {/* Back Link */}
            <Link 
                href={`/resources/${segment_slug}/${group_slug}`} 
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-bold uppercase tracking-wide transition-all backdrop-blur-md mb-6"
            >
                <ArrowLeft className="w-3 h-3" />
                Back to Subjects
            </Link>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
                {subject.title}
            </h1>
            <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                Browse all notes, blogs, video classes, and previous year questions for <span className="text-white">{subject.title}</span>.
            </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT CONTENT (8 Cols) */}
            <div className="lg:col-span-8 space-y-16">
                
                {/* 1. LATEST POSTS */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-purple-100 text-purple-600 rounded-lg"><PenTool className="w-6 h-6" /></span>
                            <h2 className="text-xl font-bold text-slate-900">Latest Posts</h2>
                        </div>
                    </div>

                    {blogs && blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blogs.map((blog) => (
                                <Link key={blog.id} href={`/blog/${blog.id}`} className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                                    <div className="h-48 bg-gray-100 relative overflow-hidden border-b border-slate-100">
                                        {blog.content_url ? (
                                            <Image src={blog.content_url} alt={blog.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-800 to-slate-900">
                                                <h4 className="text-white font-bold text-xs text-center line-clamp-2 px-2">{blog.title}</h4>
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-100">
                                            BLOG
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg text-slate-900 mb-2 leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">
                                            {blog.title}
                                        </h3>
                                        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-400 font-bold border-t border-slate-100">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                            </div>
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

                {/* 2. STUDY MATERIALS */}
                <section>
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
                        <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText className="w-6 h-6" /></span>
                        <h2 className="text-xl font-bold text-slate-900">Study Materials</h2>
                    </div>

                    {materials && materials.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {materials.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4 group">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'pdf' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                        {item.type === 'pdf' ? <FileText className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-blue-600 transition-colors mb-1 leading-snug break-words">
                                            <a href={item.content_url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                                            <span className="uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">{item.type}</span>
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

                {/* 3. PREVIOUS YEAR QUESTIONS */}
                <section>
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
                        <span className="p-2 bg-amber-100 text-amber-600 rounded-lg"><HelpCircle className="w-6 h-6" /></span>
                        <h2 className="text-xl font-bold text-slate-900">Previous Questions</h2>
                    </div>

                    {questions && questions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {questions.map((q) => (
                                <Link href={`/question/${q.id}`} key={q.id} className="block bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all group">
                                    <h3 className="font-bold text-slate-800 text-base md:text-lg mb-3 leading-snug group-hover:text-amber-700 transition-colors">
                                        {q.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-sm">
                                            Board Question
                                        </span>
                                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 group-hover:text-amber-600 transition-colors uppercase tracking-wide">
                                            View Solution <ChevronRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">
                            No questions available yet.
                        </div>
                    )}
                </section>

                {/* 4. APP PROMOTION (Live Exams) */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-slate-900 text-white rounded-lg"><Timer className="w-6 h-6" /></span>
                            <h2 className="text-2xl font-bold text-slate-900">Live Exams</h2>
                        </div>
                        <span className="bg-red-100 text-red-600 text-[10px] font-black px-3 py-1 rounded-full animate-pulse border border-red-200">
                            LIVE NOW
                        </span>
                    </div>
                    
                    <div className="bg-[#0F172A] rounded-2xl p-6 md:p-8 relative overflow-hidden group shadow-xl">
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -ml-16 -mb-16"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-bold text-white mb-2">Test Your Preparation</h3>
                                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                                    Join over 5,000+ students taking daily model tests. Get instant results, negative marking, and nationwide merit lists.
                                </p>
                                <DarkAppPromo />
                            </div>
                            
                            {/* Visual Mockup */}
                            <div className="w-full md:w-1/3 bg-slate-800/50 rounded-xl p-4 border border-slate-700 backdrop-blur-sm">
                                <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
                                    <span className="text-[10px] font-bold text-slate-400">Physics 1st Paper</span>
                                    <span className="text-[10px] font-bold text-red-400">09:59</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 bg-slate-600 rounded w-3/4"></div>
                                    <div className="h-2 bg-slate-700 rounded w-1/2 mb-4"></div>
                                    <div className="p-2 rounded border border-slate-600 bg-slate-700/50 text-[10px] text-slate-300">A. Velocity</div>
                                    <div className="p-2 rounded border border-blue-500 bg-blue-600 text-[10px] text-white font-bold shadow-lg shadow-blue-500/20">B. Acceleration</div>
                                    <div className="p-2 rounded border border-slate-600 bg-slate-700/50 text-[10px] text-slate-300">C. Force</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>

            {/* SIDEBAR (4 Cols) */}
            <div className="lg:col-span-4 space-y-8">
                <Sidebar />
            </div>

        </div>
      </div>
    </div>
  );
}