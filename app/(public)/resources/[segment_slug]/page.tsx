import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
// Import the new Client Component for robust filtering
import ResourceFilterView from "@/components/ResourceFilterView"; 
import Image from "next/image";
import { 
  ChevronRight, Clock, FolderOpen, 
  FileText, PlayCircle, BookOpen, 
  HelpCircle, Calendar, Trophy, FileBarChart 
} from "lucide-react";

// 1. CACHING CONFIG
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

  // 1. Fetch Current Segment
  const { data: segmentData } = await supabase.from("segments").select("*").eq("slug", segment_slug).single();
  
  // 2. Fetch ALL Segments (For Quick Switcher)
  const { data: allSegments } = await supabase.from("segments").select("id, title, slug").order("id");

  if (!segmentData) return notFound();

  // =========================================================
  //  HELPER: VIEW CONFIGURATION
  // =========================================================
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
     return '⚡';
  };

  const getGradient = (index: number) => {
    const gradients = ["from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-purple-500 to-violet-600", "from-orange-500 to-red-500"];
    return gradients[index % gradients.length];
  };

  // =========================================================
  //  A. LIST VIEW MODE (HANDLES ?type=question etc)
  // =========================================================
  if (type) {
      // 1. Fetch ALL data for this type (Client component handles filtering)
      const { data: allItems } = await supabase
        .from("resources")
        .select("*, subjects(id, title)") // Fetch subject info for filtering
        .eq("segment_id", segmentData.id)
        .eq("type", type)
        .order("created_at", { ascending: false });

      // 2. Fetch Subjects for the Dropdown filter
      const { data: subjectList } = await supabase
        .from("subjects")
        .select("id, title")
        .order("title");

      return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
            {/* Header */}
            <div className="bg-[#0f172a] text-white pt-28 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#3498db]/20 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                <Link href="/" className="hover:text-white transition-colors">Home</Link> /
                                <Link href={`/resources/${segment_slug}`} className="hover:text-white transition-colors">{segmentData.title}</Link> /
                                <span className="text-[#3498db]">{getPageTitle()}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-4">
                                <span className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl md:text-4xl shadow-inner backdrop-blur-md border border-white/10">
                                    {getPageIcon()}
                                </span>
                                <span>{segmentData.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3498db] to-cyan-300">{getPageTitle()}</span></span>
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

            {/* CLIENT FILTER COMPONENT (Handles Filtering Logic Synchronously) */}
            <ResourceFilterView 
                items={allItems || []} 
                initialType={type} 
                segmentTitle={segmentData.title} 
                subjects={subjectList || []}
            />
        </div>
      );
  }

  // =========================================================
  //  B. DASHBOARD VIEW MODE (DEFAULT)
  // =========================================================

  // Parallel Data Fetching for Dashboard
  const [
    { data: groups },
    { data: updates },
    { data: blogs },
    { data: materials },
    { data: questions },
    { data: questionCats } // Fetch categories separately for the browse grid
  ] = await Promise.all([
    supabase.from("groups").select("*").eq("segment_id", segmentData.id).order("id"),
    supabase.from("segment_updates").select("id, type, title, created_at, attachment_url").eq("segment_id", segmentData.id).order("created_at", { ascending: false }),
    supabase.from("resources").select("*").eq("segment_id", segmentData.id).eq("type", "blog").order("created_at", { ascending: false }).limit(4),
    supabase.from("resources").select("*, subjects(title)").eq("segment_id", segmentData.id).in("type", ["pdf", "video"]).order("created_at", { ascending: false }).limit(5),
    supabase.from("resources").select("*, subjects(title)").eq("segment_id", segmentData.id).eq("type", "question").order("created_at", { ascending: false }).limit(5),
    supabase.from("resources").select("category").eq("segment_id", segmentData.id).eq("type", "question")
  ]);

  // Extract Unique Categories for "Browse by Category"
  const availableCategories = Array.from(new Set(questionCats?.map(q => q.category).filter(Boolean)));

  const routine = updates?.find(u => u.type === 'routine');
  const syllabus = updates?.find(u => u.type === 'syllabus');
  const result = updates?.find(u => u.type === 'exam_result');

  // Helper to prioritize Subject Name > Category > Default
  const getQuestionTag = (q: any) => {
    return Array.isArray(q.subjects) ? q.subjects[0]?.title : (q.subjects?.title || q.category || "General");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* HERO SECTION */}
      <section className="bg-[#0f172a] text-white pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link> / 
                    <span className="text-[#3498db]">{segmentData.title}</span>
                </div>
                
                {/* Desktop Quick Switcher */}
                <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10 backdrop-blur-sm">
                    {allSegments?.slice(0, 5).map(s => (
                        <Link key={s.id} href={`/resources/${s.slug}`} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${s.slug === segment_slug ? 'bg-[#3498db] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                            {s.title}
                        </Link>
                    ))}
                </div>
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6">
                {segmentData.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3498db] to-cyan-300">Hub</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
                Your central hub for {segmentData.title} resources, exam updates, and study guides.
            </p>
        </div>
      </section>

      {/* MOBILE QUICK SWITCHER */}
      <div className="md:hidden bg-white border-b border-slate-200 overflow-x-auto hide-scrollbar py-3 px-4 flex gap-2 sticky top-[60px] z-20 shadow-sm">
         {allSegments?.map(s => (
             <Link key={s.id} href={`/resources/${s.slug}`} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${s.slug === segment_slug ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                 {s.title}
             </Link>
         ))}
      </div>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT COLUMN (Main Content) */}
            <div className="lg:col-span-8 space-y-16">
                
                {/* 1. GROUPS GRID */}
                {groups && groups.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1.5 bg-[#3498db] rounded-full"></div>
                            <h2 className="text-2xl font-bold text-slate-900">Select Group</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {groups.map((group: any, index: number) => (
                                <Link key={group.id} href={`/resources/${segment_slug}/${group.slug}`} className="group relative bg-white p-1 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl pointer-events-none"></div>
                                    <div className="bg-white rounded-xl p-6 h-full flex items-center gap-5 border border-slate-100 group-hover:border-blue-100 relative z-10">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradient(index)} text-white flex items-center justify-center text-2xl font-black shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                            {group.title.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#3498db] transition-colors">{group.title}</h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 group-hover:text-blue-400">View Resources →</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* 2. QUICK ACTIONS (Routine/Syllabus/Result) */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><span className="text-xl">⚡</span> Quick Actions</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link href={`/resources/${segment_slug}?type=update&category=routine`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition group">
                            <div className="flex justify-between items-start mb-2"><Calendar className="w-6 h-6 text-blue-500"/><span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase">Routine</span></div>
                            <h4 className="font-bold text-slate-800 text-sm mt-2">Exam Routine</h4>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{routine ? routine.title : "No active routine"}</p>
                        </Link>
                        <Link href={`/resources/${segment_slug}?type=update&category=syllabus`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition group">
                            <div className="flex justify-between items-start mb-2"><FileBarChart className="w-6 h-6 text-emerald-500"/><span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold uppercase">Syllabus</span></div>
                            <h4 className="font-bold text-slate-800 text-sm mt-2">Full Syllabus</h4>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{syllabus ? syllabus.title : "No syllabus found"}</p>
                        </Link>
                        <Link href={`/resources/${segment_slug}?type=update&category=exam_result`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition group">
                            <div className="flex justify-between items-start mb-2"><Trophy className="w-6 h-6 text-purple-500"/><span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded font-bold uppercase">Result</span></div>
                            <h4 className="font-bold text-slate-800 text-sm mt-2">Exam Results</h4>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{result ? result.title : "No results yet"}</p>
                        </Link>
                    </div>
                </section>
                {/* 3. LATEST BLOGS */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="p-2 bg-purple-100 text-purple-600 rounded-lg text-lg">✍️</span>
                        <h2 className="text-xl font-bold text-slate-900">Latest Articles</h2>
                    </div>
                    {blogs && blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blogs.map((blog: any) => (
                                <Link key={blog.id} href={`/blog/${blog.id}`} className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                                    <div className="h-48 relative overflow-hidden border-b border-slate-100">
                                        {blog.content_url ? <Image src={blog.content_url} alt={blog.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-800 to-slate-900"><h3 className="text-white font-bold text-center line-clamp-3">{blog.title}</h3></div>}
                                        <div className="absolute top-3 left-3"><span className="bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-100">{blog.category || 'Article'}</span></div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg text-slate-900 mb-2 leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">{blog.title}</h3>
                                        <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-t border-slate-100 pt-4 mt-auto"><span>{new Date(blog.created_at).toLocaleDateString()}</span><span className="text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read Now →</span></div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">No articles published yet.</div>}
                </section>

                {/* 4. PREVIOUS QUESTIONS (REFINED & ROBUST) */}
                <section id="question-bank" className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3498db] flex items-center justify-center text-xl font-bold">?</div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Question Bank</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase">Browse by Category</p>
                        </div>
                    </div>

                    {/* A. CATEGORY GRID (Only show if categories exist) */}
                    {availableCategories.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                            {availableCategories.map((cat: any) => (
                                <Link 
                                    key={cat} 
                                    href={`/resources/${segment_slug}?type=question&category=${encodeURIComponent(cat)}`}
                                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-[#3498db] hover:shadow-md transition-all text-center group"
                                >
                                    <FolderOpen className="w-6 h-6 text-[#3498db] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <h4 className="text-xs font-bold text-slate-700 group-hover:text-[#3498db] line-clamp-1">{cat}</h4>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* B. RECENT QUESTIONS LIST */}
                    <div className="bg-white rounded-2xl p-1 border border-slate-200 shadow-sm">
                        {questions && questions.length > 0 ? (
                            <div className="flex flex-col divide-y divide-slate-100">
                                {questions.map((q: any) => (
                                    <Link href={`/question/${q.slug || q.id}`} key={q.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-all group">
                                        <div className="w-10 h-10 rounded-lg bg-[#3498db]/10 flex items-center justify-center text-[#3498db] font-bold shrink-0">
                                            Q
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 text-sm md:text-base truncate group-hover:text-[#3498db] transition-colors">{q.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {/* SUBJECT TAG with #3498db */}
                                                <span className="text-[10px] font-black text-white bg-[#3498db] px-2 py-0.5 rounded shadow-sm">{getQuestionTag(q)}</span>
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(q.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg group-hover:bg-[#3498db] transition-colors hidden sm:block">
                                            Read Now
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 sm:hidden" />
                                    </Link>
                                ))}
                                <Link href={`/resources/${segment_slug}?type=question`} className="text-center py-4 text-xs font-bold text-slate-500 hover:text-[#3498db] hover:bg-slate-50 rounded-b-xl transition-colors uppercase tracking-wide">
                                    View All Questions →
                                </Link>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-sm font-bold">
                                No questions uploaded yet.
                            </div>
                        )}
                    </div>
                </section>

                {/* 5. STUDY MATERIALS */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3"><span className="p-2 bg-blue-100 text-blue-600 rounded-lg text-lg">📚</span><h2 className="text-xl font-bold text-slate-900">Study Materials</h2></div>
                        <Link href={`/resources/${segment_slug}?type=pdf`} className="self-start sm:self-auto text-sm font-bold text-[#3498db] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center">View All <ChevronRight className="w-4 h-4" /></Link>
                    </div>
                    {materials && materials.length > 0 ? (
                        <div className="space-y-3">
                            {materials.map((item: any) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-[#3498db] hover:shadow-md transition-all flex items-center gap-4 group">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${item.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                        {item.type === 'pdf' ? <FileText className="w-5 h-5"/> : <PlayCircle className="w-5 h-5"/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-[#3498db] transition-colors mb-1 truncate">
                                            <a href={item.content_url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                                            <span className="uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">{Array.isArray(item.subjects) ? item.subjects[0]?.title : 'General'}</span>
                                        </div>
                                    </div>
                                    <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-900 hover:text-white transition whitespace-nowrap hidden sm:block">
                                        {item.type === 'pdf' ? 'Download' : 'Watch'}
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">No materials available.</div>}
                </section>

            </div>

            {/* RIGHT COLUMN (Sidebar) */}
            <div className="lg:col-span-4 space-y-8">
                <Sidebar />
            </div>
        </div>
      </section>
    </div>
  );
}