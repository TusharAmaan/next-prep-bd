import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import DarkAppPromo from "@/components/DarkAppPromo"; 
import ResourceFilterView from "@/components/ResourceFilterView"; 
import Image from "next/image";
import { 
  ArrowLeft, PenTool, FileText, PlayCircle, 
  HelpCircle, ChevronRight, Clock, Timer, 
  Sparkles, Download 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubjectPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ segment_slug: string; group_slug: string; subject_slug: string }>;
  searchParams: Promise<{ type?: string; category?: string }>;
}) {
  const { segment_slug, group_slug, subject_slug } = await params;
  const { type, category } = await searchParams;

  // 1. Fetch Hierarchy Data
  const { data: segmentData } = await supabase.from("segments").select("id, title, slug").eq("slug", segment_slug).single();
  if (!segmentData) return notFound();

  const { data: groupData } = await supabase.from("groups").select("id, title, slug").eq("slug", group_slug).eq("segment_id", segmentData.id).single();
  if (!groupData) return notFound();

  const { data: subject } = await supabase.from("subjects").select("*").eq("slug", subject_slug).eq("group_id", groupData.id).single();
  if (!subject) return notFound();

  // Helper Config
  const getPageTitle = () => {
    if (type === 'pdf') return 'Study Materials';
    if (type === 'video') return 'Video Classes';
    if (type === 'question') return 'Question Bank';
    return 'Resources'; 
  };

  const getPageIcon = () => {
     if (type === 'question') return '❓';
     if (type === 'pdf') return '📚';
     if (type === 'video') return '▶';
     return '⚡';
  };

  // =========================================================
  //  A. LIST VIEW MODE (Triggered by "View All")
  // =========================================================
  if (type) {
      // Fetch Resources for this Subject
      let allItems = [];

      // [FIX] Added status check for updates if applicable, otherwise for resources
      if (type === 'update') {
         const { data: updates } = await supabase
            .from("segment_updates")
            .select("id, title, type, created_at, attachment_url") 
            .eq("segment_id", segmentData.id)
            // .eq("status", "approved") // Uncomment if your updates table has a status column
            .order("created_at", { ascending: false });
         
         allItems = updates?.map(u => ({
             ...u,
             category: u.type === 'exam_result' ? 'Result' : (u.type === 'routine' ? 'Routine' : 'Syllabus'),
             subjects: null, 
             slug: null 
         })) || [];
      } else {
         const { data: resources } = await supabase
            .from("resources")
            .select("*, subjects(id, title)")
            .eq("subject_id", subject.id)
            .eq("type", type)
            .eq("status", "approved") // <--- CONFIRMING THIS FILTER IS HERE
            .order("created_at", { ascending: false });
         allItems = resources || [];
      }

      return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
            {/* Header */}
            <div className="bg-[#1e1b4b] text-white pt-28 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/30 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-indigo-200 uppercase tracking-wider mb-3">
                                <Link href={`/resources/${segment_slug}`} className="hover:text-white transition-colors">{segmentData.title}</Link> /
                                <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-white transition-colors">{groupData.title}</Link> /
                                <Link href={`/resources/${segment_slug}/${group_slug}/${subject_slug}`} className="hover:text-white transition-colors">{subject.title}</Link> /
                                <span className="text-white bg-indigo-600 px-2 py-0.5 rounded">{getPageTitle()}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-4">
                                <span className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl md:text-4xl shadow-inner backdrop-blur-md border border-white/10">
                                    {getPageIcon()}
                                </span>
                                <span>{subject.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">{getPageTitle()}</span></span>
                            </h1>
                        </div>
                        <Link 
                            href={`/resources/${segment_slug}/${group_slug}/${subject_slug}`} 
                            className="self-start md:self-auto px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wide transition-all backdrop-blur-md flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Subject
                        </Link>
                    </div>
                </div>
            </div>

            {/* Filter Component */}
            <ResourceFilterView 
                items={allItems} 
                initialType={type} 
                initialCategory={category} 
                segmentTitle={subject.title}
                segmentSlug={segment_slug} 
            />
        </div>
      );
  }

  // =========================================================
  //  B. DASHBOARD VIEW MODE
  // =========================================================

  // Parallel Fetching for Dashboard
  const [
    { data: blogs },
    { data: materials },
    { data: questions }
  ] = await Promise.all([
    // 1. Blogs [FIXED]
    supabase.from("resources")
      .select("*")
      .eq("subject_id", subject.id)
      .eq("type", "blog")
      .eq("status", "approved") // <--- ADDED FILTER
      .order("created_at", { ascending: false })
      .limit(4),

    // 2. Study Materials [FIXED]
    supabase.from("resources")
      .select("*, subjects(title)")
      .eq("subject_id", subject.id)
      .in("type", ["pdf", "video"])
      .eq("status", "approved") // <--- ADDED FILTER
      .order("created_at", { ascending: false })
      .limit(6),

    // 3. Questions [FIXED]
    supabase.from("resources")
      .select("*, subjects(title)")
      .eq("subject_id", subject.id)
      .eq("type", "question")
      .eq("status", "approved") // <--- ADDED FILTER
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* DASHBOARD HERO */}
      <section className="bg-slate-900 text-white pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link> / 
                <Link href={`/resources/${segment_slug}`} className="hover:text-white transition-colors">{segmentData.title}</Link> / 
                <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-white transition-colors">{groupData.title}</Link> / 
                <span className="text-indigo-400">{subject.title}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
                {subject.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Hub</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                Comprehensive notes, video lectures, and previous year questions specifically for <span className="text-white">{subject.title}</span>.
            </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT CONTENT */}
            <div className="lg:col-span-8 space-y-16">
                
                {/* 1. LATEST ARTICLES */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-purple-100 text-purple-600 rounded-lg"><PenTool className="w-6 h-6" /></span>
                            <h2 className="text-xl font-bold text-slate-900">Latest Articles</h2>
                        </div>
                        <Link 
                            href={`/blog?segment=${segment_slug}&group=${group_slug}&subject=${subject_slug}`} 
                            className="self-start sm:self-auto text-sm font-bold text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors flex items-center"
                        >
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {blogs && blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blogs.map((blog: any) => (
                                <Link 
                                    key={blog.id} 
                                    href={blog.slug ? `/blog/${blog.slug}` : `/blog/${blog.id}`} 
                                    className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="h-40 bg-gray-100 relative overflow-hidden border-b border-slate-100">
                                        {blog.content_url ? (
                                            <Image src={blog.content_url} alt={blog.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-800 to-slate-900">
                                                <h4 className="text-white font-bold text-xs text-center line-clamp-2 px-2">{blog.title}</h4>
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-100">
                                            {subject.title}
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-base text-slate-900 mb-2 leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">{blog.title}</h3>
                                        <div className="mt-auto pt-4 flex items-center justify-end text-xs text-slate-400 font-bold border-t border-slate-100">
                                            <span className="text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read <ChevronRight className="w-3 h-3"/></span>
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

                {/* 2. STUDY MATERIALS */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText className="w-6 h-6" /></span>
                            <h2 className="text-xl font-bold text-slate-900">Study Materials</h2>
                        </div>
                        <Link href={`/resources/${segment_slug}/${group_slug}/${subject_slug}?type=pdf`} className="self-start sm:self-auto text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {materials && materials.length > 0 ? (
                        <div className="space-y-3">
                            {materials.map((item: any) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-4 group">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${item.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                        {item.type === 'pdf' ? <FileText className="w-5 h-5"/> : <PlayCircle className="w-5 h-5"/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-indigo-600 transition-colors mb-1 truncate">
                                            <Link href={item.slug ? `/material/${item.slug}` : `/material/${item.id}`} className="block">{item.title}</Link>
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                                            <span className="uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">{subject.title}</span>
                                        </div>
                                    </div>
                                    <Link 
                                        href={item.slug ? `/material/${item.slug}` : `/material/${item.id}`} 
                                        className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-900 hover:text-white transition whitespace-nowrap hidden sm:block"
                                    >
                                        {item.type === 'pdf' ? 'Download' : 'Watch'}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">
                            No materials uploaded yet.
                        </div>
                    )}
                </section>

                {/* 3. QUESTION BANK */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><HelpCircle className="w-6 h-6" /></span>
                            <h2 className="text-xl font-bold text-slate-900">Question Bank</h2>
                        </div>
                        <Link href={`/resources/${segment_slug}/${group_slug}/${subject_slug}?type=question`} className="self-start sm:self-auto text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl p-1 border border-slate-200 shadow-sm">
                        {questions && questions.length > 0 ? (
                            <div className="flex flex-col divide-y divide-slate-100">
                                {questions.map((q: any) => (
                                    <Link href={q.slug ? `/question/${q.slug}` : `/question/${q.id}`} key={q.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-all group">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">Q</div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 text-sm md:text-base truncate group-hover:text-indigo-600 transition-colors">{q.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black text-white bg-indigo-600 px-2 py-0.5 rounded shadow-sm">{subject.title}</span>
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(q.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center text-slate-400 text-sm font-bold">No questions uploaded yet.</div>
                        )}
                    </div>
                </section>

                {/* 4. LIVE EXAM PROMO */}
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
                                    Take a live model test on <strong>{subject.title}</strong>. Get instant results and merit position.
                                </p>
                                <DarkAppPromo />
                            </div>
                            
                            {/* Visual Mockup */}
                            <div className="w-full md:w-1/3 bg-slate-800/50 rounded-xl p-4 border border-slate-700 backdrop-blur-sm">
                                <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
                                    <span className="text-[10px] font-bold text-slate-400">{subject.title}</span>
                                    <span className="text-[10px] font-bold text-red-400">09:59</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 bg-slate-600 rounded w-3/4"></div>
                                    <div className="h-2 bg-slate-700 rounded w-1/2 mb-4"></div>
                                    <div className="p-2 rounded border border-slate-600 bg-slate-700/50 text-[10px] text-slate-300">A. Option 1</div>
                                    <div className="p-2 rounded border border-blue-500 bg-blue-600 text-[10px] text-white font-bold shadow-lg shadow-blue-500/20">B. Correct Answer</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-4 space-y-8">
                <Sidebar />
            </div>

        </div>
      </div>
    </div>
  );
}