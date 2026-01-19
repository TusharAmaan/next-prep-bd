import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import ResourceFilterView from "@/components/ResourceFilterView"; 
import Image from "next/image";
import { 
  ChevronRight, Clock, FolderOpen, 
  Calendar, Trophy, FileBarChart, ArrowRight,
  Sparkles, Layers, PenTool, FileText, PlayCircle,
  CalendarDays, BookOpen
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SegmentPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ segment_slug: string }>,
  searchParams: Promise<{ type?: string; category?: string }> 
}) {
  const { segment_slug } = await params;
  const { type, category } = await searchParams;

  const { data: segmentData } = await supabase.from("segments").select("*").eq("slug", segment_slug).single();
  const { data: allSegments } = await supabase.from("segments").select("id, title, slug").order("id");

  if (!segmentData) return notFound();

  // Helper Config
  const getPageTitle = () => {
    if (type === 'pdf') return 'Study Materials';
    if (type === 'video') return 'Video Classes';
    if (type === 'update') return 'Latest Updates';
    if (type === 'question') return 'Question Bank';
    return 'Resources'; 
  };

  const getPageIcon = () => {
     if (type === 'question') return '❓';
     if (type === 'pdf') return '📚';
     if (type === 'video') return '▶';
     if (type === 'update') return '🔔';
     return '⚡';
  };

  // =========================================================
  //  A. LIST VIEW MODE
  // =========================================================
  if (type) {
      let allItems = [];

      if (type === 'update') {
          const { data: updates } = await supabase
            .from("segment_updates")
            .select("id, title, type, created_at, attachment_url") 
            .eq("segment_id", segmentData.id)
            // Note: If 'segment_updates' has a status column, filter here too. 
            // Assuming updates are direct admin posts for now. If Tutors post updates, ADD .eq('status', 'approved')
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
            .eq("segment_id", segmentData.id)
            .eq("type", type)
            .eq("status", "approved") // <--- CRITICAL FIX: Only show approved resources in List View
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
                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-200 uppercase tracking-wider mb-3">
                                <Link href="/" className="hover:text-white transition-colors">Home</Link> /
                                <Link href={`/resources/${segment_slug}`} className="hover:text-white transition-colors">{segmentData.title}</Link> /
                                <span className="text-white bg-indigo-600 px-2 py-0.5 rounded">{getPageTitle()}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-4">
                                <span className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl md:text-4xl shadow-inner backdrop-blur-md border border-white/10">
                                    {getPageIcon()}
                                </span>
                                <span>{segmentData.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">{getPageTitle()}</span></span>
                            </h1>
                        </div>
                        <Link 
                            href={`/resources/${segment_slug}`} 
                            className="self-start md:self-auto px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wide transition-all backdrop-blur-md flex items-center gap-2"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            <ResourceFilterView 
                items={allItems} 
                initialType={type} 
                initialCategory={category} 
                segmentTitle={segmentData.title}
                segmentSlug={segment_slug} 
            />
        </div>
      );
  }

  // =========================================================
  //  B. DASHBOARD VIEW MODE
  // =========================================================

  const [
    { data: groups },
    { data: blogs },
    { data: materials },
    { data: questions },
    { data: questionCats } 
  ] = await Promise.all([
    supabase.from("groups").select("*").eq("segment_id", segmentData.id).order("id"),
    
    // Blogs: Add .eq('status', 'approved')
    supabase.from("resources").select("*").eq("segment_id", segmentData.id).eq("type", "blog").eq("status", "approved").order("created_at", { ascending: false }).limit(4),
    
    // Materials: Add .eq('status', 'approved')
    supabase.from("resources").select("*, subjects(title)").eq("segment_id", segmentData.id).in("type", ["pdf", "video"]).eq("status", "approved").order("created_at", { ascending: false }).limit(5),
    
    // Questions: Add .eq('status', 'approved')
    supabase.from("resources").select("*, subjects(title)").eq("segment_id", segmentData.id).eq("type", "question").eq("status", "approved").order("created_at", { ascending: false }).limit(5),
    
    // Categories: Add .eq('status', 'approved') (Optional but cleaner)
    supabase.from("resources").select("category").eq("segment_id", segmentData.id).eq("type", "question").eq("status", "approved")
  ]);

  const availableCategories = Array.from(new Set(questionCats?.map(q => q.category).filter(Boolean)));

  const getQuestionTag = (q: any) => {
    return Array.isArray(q.subjects) ? q.subjects[0]?.title : (q.subjects?.title || q.category || "General");
  };

  const getGroupStyle = (index: number) => {
    const styles = [
      { bg: "bg-blue-50", iconBg: "bg-blue-600", text: "text-blue-900", accent: "border-blue-100" },
      { bg: "bg-indigo-50", iconBg: "bg-indigo-600", text: "text-indigo-900", accent: "border-indigo-100" },
      { bg: "bg-emerald-50", iconBg: "bg-emerald-600", text: "text-emerald-900", accent: "border-emerald-100" },
      { bg: "bg-purple-50", iconBg: "bg-purple-600", text: "text-purple-900", accent: "border-purple-100" },
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* DASHBOARD HERO */}
      <section className="bg-slate-900 text-white pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link> / 
                    <span className="text-indigo-400">{segmentData.title}</span>
                </div>
                
                {/* Switcher */}
                <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
                    {allSegments?.slice(0, 5).map(s => (
                        <Link key={s.id} href={`/resources/${s.slug}`} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${s.slug === segment_slug ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                            {s.title}
                        </Link>
                    ))}
                </div>
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6">
                {segmentData.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Hub</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
                Centralized resources, real-time updates, and study materials for {segmentData.title} students.
            </p>
        </div>
      </section>

      {/* MOBILE SWITCHER */}
      <div className="md:hidden bg-white border-b border-slate-200 overflow-x-auto hide-scrollbar py-3 px-4 flex gap-2 sticky top-[60px] z-30 shadow-sm">
         {allSegments?.map(s => (
             <Link key={s.id} href={`/resources/${s.slug}`} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${s.slug === segment_slug ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                 {s.title}
             </Link>
         ))}
      </div>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-8 space-y-16">
                
                {/* 1. GROUPS */}
                {groups && groups.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1.5 bg-indigo-600 rounded-full"></div>
                            <h2 className="text-2xl font-bold text-slate-900">Select Group</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {groups.map((group: any, index: number) => {
                                const style = getGroupStyle(index);
                                return (
                                    <Link key={group.id} href={`/resources/${segment_slug}/${group.slug}`} className={`group relative p-1 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white border border-slate-100 overflow-hidden`}>
                                        <div className={`absolute top-0 right-0 w-32 h-32 ${style.bg} rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                                        <div className="relative z-10 p-6 flex items-start gap-5">
                                            <div className={`w-16 h-16 rounded-2xl ${style.iconBg} text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-900/10 group-hover:scale-110 transition-transform duration-300`}>
                                                {group.title.charAt(0)}
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <h3 className={`text-xl font-bold ${style.text} mb-2`}>{group.title}</h3>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                                                    <span>Explore Resources</span>
                                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* 2. QUICK ACTIONS [REDESIGNED] */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500 fill-amber-500"/> Quick Actions</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* ROUTINE CARD */}
                        <Link href={`/resources/${segment_slug}?type=update&category=Routine`} className="relative group overflow-hidden rounded-2xl p-6 flex flex-col justify-between h-40 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-1">
                            <div className="absolute right-[-20px] bottom-[-20px] opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                                <CalendarDays className="w-32 h-32 text-white" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3">
                                    <CalendarDays className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white leading-tight">Exam<br/>Routine</h3>
                            </div>
                            <div className="relative z-10 flex items-center gap-2 text-[10px] font-bold text-blue-100 uppercase tracking-wider group-hover:text-white">
                                View Schedule <ArrowRight className="w-3 h-3" />
                            </div>
                        </Link>

                        {/* SYLLABUS CARD */}
                        <Link href={`/resources/${segment_slug}?type=update&category=Syllabus`} className="relative group overflow-hidden rounded-2xl p-6 flex flex-col justify-between h-40 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:-translate-y-1">
                            <div className="absolute right-[-20px] bottom-[-20px] opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                                <BookOpen className="w-32 h-32 text-white" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white leading-tight">Full<br/>Syllabus</h3>
                            </div>
                            <div className="relative z-10 flex items-center gap-2 text-[10px] font-bold text-emerald-100 uppercase tracking-wider group-hover:text-white">
                                Check Topics <ArrowRight className="w-3 h-3" />
                            </div>
                        </Link>

                        {/* RESULT CARD */}
                        <Link href={`/resources/${segment_slug}?type=update&category=Result`} className="relative group overflow-hidden rounded-2xl p-6 flex flex-col justify-between h-40 bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all hover:-translate-y-1">
                            <div className="absolute right-[-20px] bottom-[-20px] opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                                <Trophy className="w-32 h-32 text-white" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3">
                                    <Trophy className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white leading-tight">Latest<br/>Results</h3>
                            </div>
                            <div className="relative z-10 flex items-center gap-2 text-[10px] font-bold text-violet-100 uppercase tracking-wider group-hover:text-white">
                                See Marks <ArrowRight className="w-3 h-3" />
                            </div>
                        </Link>
                    </div>
                </section>

{/* 3. LATEST BLOGS */}
                <section>
                    {/* Header with View All Link */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-purple-100 text-purple-600 rounded-lg text-lg">✍️</span>
                            <h2 className="text-xl font-bold text-slate-900">Latest Articles</h2>
                        </div>
                        <Link 
                            href={`/blog?segment=${segment_slug}`} 
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
                                    <div className="h-48 relative overflow-hidden border-b border-slate-100">
                                        {blog.content_url ? (
                                            <Image src={blog.content_url} alt={blog.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-800 to-slate-900">
                                                <PenTool className="w-8 h-8 text-white/50 mb-2"/>
                                                <h3 className="text-white font-bold text-center line-clamp-3">{blog.title}</h3>
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3"><span className="bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-100">{blog.category || 'Article'}</span></div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg text-slate-900 mb-2 leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">{blog.title}</h3>
                                        <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-t border-slate-100 pt-4 mt-auto">
                                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                            <span className="text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read Now →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">No articles published yet.</div>}
                </section>

                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3"><span className="p-2 bg-blue-100 text-blue-600 rounded-lg text-lg">📚</span><h2 className="text-xl font-bold text-slate-900">Study Materials</h2></div>
                        <Link href={`/resources/${segment_slug}?type=pdf`} className="self-start sm:self-auto text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center">View All <ChevronRight className="w-4 h-4" /></Link>
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
                                            <Link href={`/material/${item.slug || item.id}`} className="block">{item.title}</Link>
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                                            <span className="uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">{Array.isArray(item.subjects) ? item.subjects[0]?.title : 'General'}</span>
                                        </div>
                                    </div>
                                    <Link href={`/material/${item.slug || item.id}`} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-900 hover:text-white transition whitespace-nowrap hidden sm:block">
                                        {item.type === 'pdf' ? 'Download' : 'Watch'}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">No materials available.</div>}
                </section>

                {/* 4. QUESTION BANK */}
                <section id="question-bank">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">?</div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Question Bank</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase">Browse by Category</p>
                        </div>
                    </div>

                    {/* Categories */}
                    {availableCategories.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                            {availableCategories.map((cat: any) => (
                                <Link 
                                    key={cat} 
                                    href={`/resources/${segment_slug}?type=question&category=${encodeURIComponent(cat)}`}
                                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all text-center group"
                                >
                                    <FolderOpen className="w-6 h-6 text-indigo-400 mx-auto mb-2 group-hover:text-indigo-600 transition-colors" />
                                    <h4 className="text-xs font-bold text-slate-700 group-hover:text-indigo-900 line-clamp-1">{cat}</h4>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Recent Questions */}
                    <div className="bg-white rounded-2xl p-1 border border-slate-200 shadow-sm">
                        {questions && questions.length > 0 ? (
                            <div className="flex flex-col divide-y divide-slate-100">
                                {questions.map((q: any) => (
                                    <Link href={`/question/${q.slug || q.id}`} key={q.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-all group">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">Q</div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 text-sm md:text-base truncate group-hover:text-indigo-600 transition-colors">{q.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black text-white bg-indigo-600 px-2 py-0.5 rounded shadow-sm">{getQuestionTag(q)}</span>
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(q.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                                    </Link>
                                ))}
                                <Link href={`/resources/${segment_slug}?type=question`} className="text-center py-4 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-b-xl transition-colors uppercase tracking-wide">
                                    View All Questions →
                                </Link>
                            </div>
                        ) : (
                            <div className="p-10 text-center text-slate-400 text-sm font-bold">No questions uploaded yet.</div>
                        )}
                    </div>
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