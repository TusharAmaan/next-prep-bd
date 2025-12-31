import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import MaterialList from "@/components/MaterialList"; 
import Image from "next/image";

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
  
  // 2. Fetch ALL Segments (For the "Switch Class" Navigation)
  const { data: allSegments } = await supabase.from("segments").select("id, title, slug").order("id");

  if (!segmentData) return notFound();

  // =========================================================
  //  HELPER: VIEW CONFIGURATION
  // =========================================================
  const getPageTitle = () => {
    if (category) return category.replace(/_/g, ' '); 
    if (type === 'pdf') return 'Study Materials';
    if (type === 'video') return 'Video Classes';
    if (type === 'update') return 'Latest Updates';
    return 'Question Bank'; 
  };

  const getPageIcon = () => {
     if (type === 'question') return '❓';
     if (type === 'pdf') return '📚';
     if (type === 'video') return '▶';
     return '⚡';
  };

  // =========================================================
  //  A. LIST VIEW MODE (Question Bank / PDF List)
  // =========================================================
  if (type) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
            
            {/* 1. PREMIUM HEADER (Dark Theme for Contrast) */}
            <div className="bg-[#0f172a] text-white pt-24 pb-12 px-5 md:px-8 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Navigation Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        {/* Breadcrumbs */}
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
                            <span className="opacity-50">/</span>
                            <Link href={`/resources/${segment_slug}`} className="hover:text-blue-400 transition-colors">{segmentData.title}</Link>
                            <span className="opacity-50">/</span>
                            <span className="text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{getPageTitle()}</span>
                        </div>

                        {/* HIGH VISIBILITY BACK BUTTON */}
                        <Link 
                            href={`/resources/${segment_slug}`} 
                            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-bold uppercase tracking-wide transition-all backdrop-blur-md"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Dashboard
                        </Link>
                    </div>

                    {/* Title Section */}
                    <div className="flex flex-col gap-4">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight md:leading-snug break-words flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
                            {/* Icon Box */}
                            <span className="shrink-0 bg-blue-600 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-900/50 border border-blue-400/30">
                                {getPageIcon()}
                            </span>
                            {/* Text Wrapper */}
                            <span className="flex-1">
                                {segmentData.title} <span className="text-blue-400">{getPageTitle()}</span>
                            </span>
                        </h1>
                        <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
                            Browsing the complete archive for <span className="text-white">{segmentData.title}</span>. 
                            Use the filters below to refine your search.
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. "NOT LOOKING FOR THIS?" NAVIGATION BAR */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-5 md:px-8 py-3 flex items-center gap-4 overflow-x-auto hide-scrollbar">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Switch Class:</span>
                    <div className="flex items-center gap-2">
                        {allSegments?.map((seg) => (
                            <Link 
                                key={seg.id} 
                                href={`/resources/${seg.slug}?type=${type}`} 
                                className={`
                                    px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border
                                    ${seg.slug === segment_slug 
                                        ? "bg-slate-900 text-white border-slate-900" 
                                        : "bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600"}
                                `}
                            >
                                {seg.title}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* 3. CONTENT GRID (Fixed Mobile Order) */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                
                {/* Main Content (First on Mobile) */}
                <div className="lg:col-span-8">
                    <MaterialList segmentId={segmentData.id} initialType={type} initialCategory={category} />
                </div>
                
                {/* Sidebar (Second on Mobile) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* "Wrong Class" CTA Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                         <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                         <h4 className="font-bold text-lg mb-1 relative z-10">Not {segmentData.title}?</h4>
                         <p className="text-indigo-100 text-xs mb-4 relative z-10">Find materials for other classes easily.</p>
                         <Link href="/" className="block w-full text-center bg-white text-indigo-700 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-50 transition shadow-md relative z-10">
                             Browse All Classes
                         </Link>
                    </div>

                    <div className="sticky top-24">
                        <Sidebar />
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // =========================================================
  //  B. DASHBOARD VIEW MODE
  // =========================================================

  const { data: groups } = await supabase.from("groups").select("*").eq("segment_id", segmentData.id).order("id");
  const { data: updates } = await supabase.from("segment_updates").select("id, type, title, created_at, attachment_url").eq("segment_id", segmentData.id).order("created_at", { ascending: false });

  // Preview Content
  const { data: blogs } = await supabase.from("resources").select("*").eq("segment_id", segmentData.id).eq("type", "blog").order("created_at", { ascending: false }).limit(4);
  const { data: materials } = await supabase.from("resources").select("*, subjects(title)").eq("segment_id", segmentData.id).in("type", ["pdf", "video"]).order("created_at", { ascending: false }).limit(5);
  const { data: questions } = await supabase.from("resources").select("*, subjects(title)").eq("segment_id", segmentData.id).eq("type", "question").order("created_at", { ascending: false }).limit(5);

  const routine = updates?.find(u => u.type === 'routine');
  const syllabus = updates?.find(u => u.type === 'syllabus');
  const result = updates?.find(u => u.type === 'exam_result');

  const isNew = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      return Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)) <= 7;
  };

  const getGradient = (index: number) => {
    const gradients = ["from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-purple-500 to-violet-600", "from-orange-500 to-red-500"];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* HERO SECTION */}
      <section className="bg-[#0f172a] text-white pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
            {/* Nav */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link> / 
                    <span className="text-blue-400">{segmentData.title}</span>
                </div>
                
                {/* Quick Switcher (Desktop) */}
                <div className="hidden md:flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Switch:</span>
                    {allSegments?.slice(0, 4).map(s => (
                        s.slug !== segment_slug && <Link key={s.id} href={`/resources/${s.slug}`} className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 bg-white/5 rounded border border-white/10">{s.title}</Link>
                    ))}
                </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                {segmentData.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Hub</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                Your central hub for {segmentData.title} resources, exam updates, and study guides.
            </p>
        </div>
      </section>

      {/* MOBILE QUICK SWITCHER */}
      <div className="md:hidden bg-white border-b border-slate-200 overflow-x-auto hide-scrollbar py-3 px-4 flex gap-2">
         {allSegments?.map(s => (
             <Link key={s.id} href={`/resources/${s.slug}`} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border ${s.slug === segment_slug ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                 {s.title}
             </Link>
         ))}
      </div>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-16">
                
                {/* 1. GROUPS */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-slate-900">Select Group</h2>
                    </div>
                    {groups && groups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {groups.map((group, index) => (
                                <Link key={group.id} href={`/resources/${segment_slug}/${group.slug}`} className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-56 cursor-pointer">
                                    <div className={`h-1.5 w-full bg-gradient-to-r ${getGradient(index)}`}></div>
                                    <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradient(index)} text-white flex items-center justify-center text-2xl font-black mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>{group.title.charAt(0)}</div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{group.title}</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest group-hover:text-blue-400 transition-colors">Enter Group →</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-12 rounded-2xl border border-dashed border-slate-200 text-center"><div className="text-4xl mb-4 opacity-50">📂</div><h3 className="text-lg font-bold text-slate-700">No Groups Found</h3></div>
                    )}
                </div>

                {/* 2. QUICK UPDATES (Routine/Syllabus) */}
                {/* ... (Existing Quick Actions code remains mostly same, just ensuring correct styling) ... */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><span className="text-xl">⚡</span> Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href={`/resources/${segment_slug}?type=update&category=routine`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2"><span className="text-2xl">📅</span><span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase">Routine</span></div>
                            <h4 className="font-bold text-slate-800 text-sm">Exam Routine</h4>
                            {routine ? <p className="text-xs text-slate-500 mt-1 line-clamp-1">{routine.title}</p> : <p className="text-xs text-slate-400 mt-1 italic">No active routine</p>}
                        </Link>
                        <Link href={`/resources/${segment_slug}?type=update&category=syllabus`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2"><span className="text-2xl">📝</span><span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold uppercase">Syllabus</span></div>
                            <h4 className="font-bold text-slate-800 text-sm">Full Syllabus</h4>
                            {syllabus ? <p className="text-xs text-slate-500 mt-1 line-clamp-1">{syllabus.title}</p> : <p className="text-xs text-slate-400 mt-1 italic">No syllabus found</p>}
                        </Link>
                        <Link href={`/resources/${segment_slug}?type=update&category=exam_result`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2"><span className="text-2xl">🏆</span><span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded font-bold uppercase">Result</span></div>
                            <h4 className="font-bold text-slate-800 text-sm">Exam Results</h4>
                            {result ? <p className="text-xs text-slate-500 mt-1 line-clamp-1">{result.title}</p> : <p className="text-xs text-slate-400 mt-1 italic">No results yet</p>}
                        </Link>
                    </div>
                </div>

                {/* 3. LATEST POSTS */}
                <section>
                    <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3"><span className="p-2 bg-purple-100 text-purple-600 rounded-lg text-lg">✍️</span><h2 className="text-xl font-bold text-slate-900">Latest Articles</h2></div>
                        <Link href={`/blog?segment=${encodeURIComponent(segmentData.title)}`} className="text-sm font-bold text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors">View All →</Link>
                    </div>
                    {blogs && blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blogs.map((blog) => (
                                <Link key={blog.id} href={`/blog/${blog.id}`} className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                                    <div className="h-48 relative overflow-hidden border-b border-slate-100">
                                        {blog.content_url ? <Image src={blog.content_url} alt={blog.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-800 to-slate-900"><h3 className="text-white font-bold text-center line-clamp-3">{blog.title}</h3></div>}
                                        <div className="absolute top-3 left-3"><span className="bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-100">{blog.category || 'Article'}</span></div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg text-slate-900 mb-2 leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">{blog.title}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">{blog.seo_description}</p>
                                        <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-t border-slate-100 pt-4 mt-auto"><span>{new Date(blog.created_at).toLocaleDateString()}</span><span className="text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read Now →</span></div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">No articles published yet.</div>}
                </section>

                {/* 4. MATERIALS */}
                <section>
                    <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3"><span className="p-2 bg-blue-100 text-blue-600 rounded-lg text-lg">📚</span><h2 className="text-xl font-bold text-slate-900">Study Materials</h2></div>
                        <Link href={`/resources/${segment_slug}?type=pdf`} className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">View All →</Link>
                    </div>
                    {materials && materials.length > 0 ? (
                        <div className="space-y-3">
                            {materials.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4 group">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${item.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>{item.type === 'pdf' ? '📄' : '▶'}</div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-blue-600 transition-colors mb-1 truncate"><a href={item.content_url} target="_blank" rel="noopener noreferrer">{item.title}</a></h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold"><span className="uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">{Array.isArray(item.subjects) ? item.subjects[0]?.title : 'General'}</span><span>•</span><span>{new Date(item.created_at).toLocaleDateString()}</span></div>
                                    </div>
                                    <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-900 hover:text-white transition whitespace-nowrap hidden sm:block">{item.type === 'pdf' ? 'Download' : 'Watch'}</a>
                                </div>
                            ))}
                        </div>
                    ) : <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">No materials available yet.</div>}
                </section>

                {/* 5. PREVIOUS QUESTIONS */}
                <section>
                    <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3"><span className="p-2 bg-yellow-100 text-yellow-600 rounded-lg text-xl">❓</span><h2 className="text-xl font-bold text-slate-900">Previous Year Questions</h2></div>
                        <Link href={`/resources/${segment_slug}?type=question`} className="text-sm font-bold text-yellow-600 hover:bg-yellow-50 px-3 py-1.5 rounded-lg transition-colors">View All →</Link>
                    </div>
                    {questions && questions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {questions.map((q) => (
                                <Link href={`/question/${q.id}`} key={q.id} className="block bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all group">
                                    <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-yellow-700 transition-colors">{q.title}</h3>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                                        <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">{Array.isArray(q.subjects) ? q.subjects[0]?.title : 'Board Question'}</span>
                                        <span>•</span><span>Click to View Solution</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-yellow-50/50 p-8 rounded-xl border border-dashed border-yellow-200 text-center text-yellow-700/50 text-sm font-bold">No questions uploaded for this segment yet.</div>
                    )}
                </section>

            </div>

            <div className="lg:col-span-4 space-y-8">
                <Sidebar />
            </div>
        </div>
      </section>

    </div>
  );
}