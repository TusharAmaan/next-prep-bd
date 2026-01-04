import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import ResourceFilterView from "@/components/ResourceFilterView"; 
import Image from "next/image";
import { 
  ChevronRight, Clock, FolderOpen, 
  Calendar, Trophy, FileBarChart, PlayCircle, FileText
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

  // 1. Fetch Segment Data
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
  //  A. LIST VIEW MODE (Matches your new design request)
  // =========================================================
  if (type) {
      let allItems = [];

      // 1. DATA FETCHING & NORMALIZATION
      if (type === 'update') {
          // Fetch Updates from 'segment_updates' table
          const { data: updates } = await supabase
            .from("segment_updates")
            .select("id, title, type, created_at, attachment_url") 
            .eq("segment_id", segmentData.id)
            .order("created_at", { ascending: false });
          
          // Normalize for Filter View
          // Map DB types (routine/syllabus) to readable Categories
          allItems = updates?.map(u => ({
              ...u,
              category: u.type === 'exam_result' ? 'Result' : (u.type === 'routine' ? 'Routine' : 'Syllabus'),
              subjects: null, // Updates don't have subjects
              content_type: 'update' 
          })) || [];

      } else {
          // Fetch Resources (Question, PDF, Video)
          const { data: resources } = await supabase
            .from("resources")
            .select("*, subjects(id, title)")
            .eq("segment_id", segmentData.id)
            .eq("type", type)
            .order("created_at", { ascending: false });
          allItems = resources || [];
      }

      return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
            {/* High Contrast Header (Indigo/Slate) */}
            <div className="bg-[#0f172a] text-white pt-28 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/30 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                <Link href="/" className="hover:text-white transition-colors">Home</Link> /
                                <Link href={`/resources/${segment_slug}`} className="hover:text-white transition-colors">{segmentData.title}</Link> /
                                <span className="text-indigo-400">{getPageTitle()}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-4">
                                <span className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl md:text-4xl shadow-inner backdrop-blur-md border border-white/10">
                                    {getPageIcon()}
                                </span>
                                <span>{segmentData.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">{getPageTitle()}</span></span>
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

            {/* Filter View Component */}
            <ResourceFilterView 
                items={allItems} 
                initialType={type} 
                initialCategory={category} // Pass category from URL for initial state
                segmentTitle={segmentData.title} 
            />
        </div>
      );
  }

  // =========================================================
  //  B. DASHBOARD VIEW MODE
  // =========================================================

  const [
    { data: groups },
    { data: updates },
    { data: blogs },
    { data: materials },
    { data: questions },
    { data: questionCats } 
  ] = await Promise.all([
    supabase.from("groups").select("*").eq("segment_id", segmentData.id).order("id"),
    supabase.from("segment_updates").select("id, type, title, created_at").eq("segment_id", segmentData.id).order("created_at", { ascending: false }),
    supabase.from("resources").select("*").eq("segment_id", segmentData.id).eq("type", "blog").order("created_at", { ascending: false }).limit(4),
    supabase.from("resources").select("*, subjects(title)").eq("segment_id", segmentData.id).in("type", ["pdf", "video"]).order("created_at", { ascending: false }).limit(5),
    supabase.from("resources").select("*, subjects(title)").eq("segment_id", segmentData.id).eq("type", "question").order("created_at", { ascending: false }).limit(5),
    supabase.from("resources").select("category").eq("segment_id", segmentData.id).eq("type", "question")
  ]);

  const availableCategories = Array.from(new Set(questionCats?.map(q => q.category).filter(Boolean)));
  const routine = updates?.find(u => u.type === 'routine');
  const syllabus = updates?.find(u => u.type === 'syllabus');
  const result = updates?.find(u => u.type === 'exam_result');

  const getQuestionTag = (q: any) => {
    return Array.isArray(q.subjects) ? q.subjects[0]?.title : (q.subjects?.title || q.category || "General");
  };

  const getGradient = (index: number) => {
    const gradients = ["from-indigo-600 to-purple-600", "from-blue-600 to-indigo-600", "from-emerald-600 to-teal-600", "from-orange-500 to-red-500"];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* HERO SECTION */}
      <section className="bg-[#0f172a] text-white pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link> / 
                    <span className="text-indigo-400">{segmentData.title}</span>
                </div>
                
                <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10 backdrop-blur-sm">
                    {allSegments?.slice(0, 5).map(s => (
                        <Link key={s.id} href={`/resources/${s.slug}`} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${s.slug === segment_slug ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                            {s.title}
                        </Link>
                    ))}
                </div>
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6">
                {segmentData.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">Hub</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
                Your central hub for {segmentData.title} resources, exam updates, and study guides.
            </p>
        </div>
      </section>

      {/* MOBILE SWITCHER */}
      <div className="md:hidden bg-white border-b border-slate-200 overflow-x-auto hide-scrollbar py-3 px-4 flex gap-2 sticky top-[60px] z-20 shadow-sm">
         {allSegments?.map(s => (
             <Link key={s.id} href={`/resources/${s.slug}`} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${s.slug === segment_slug ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                 {s.title}
             </Link>
         ))}
      </div>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-8 space-y-16">
                
                {/* GROUPS */}
                {groups && groups.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1.5 bg-indigo-600 rounded-full"></div>
                            <h2 className="text-2xl font-bold text-slate-900">Select Group</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {groups.map((group: any, index: number) => (
                                <Link key={group.id} href={`/resources/${segment_slug}/${group.slug}`} className="group relative bg-white p-1 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="bg-white rounded-xl p-6 h-full flex items-center gap-5 border border-slate-100 group-hover:border-indigo-100 relative z-10">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradient(index)} text-white flex items-center justify-center text-2xl font-black shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                                            {group.title.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{group.title}</h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 group-hover:text-indigo-400">View Resources →</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* QUICK ACTIONS - Updated to use synchronous filter link */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><span className="text-xl">⚡</span> Quick Actions</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Note: Linking to type=update&category=Routine passes data to ResourceFilterView */}
                        <Link href={`/resources/${segment_slug}?type=update&category=Routine`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition group">
                            <div className="flex justify-between items-start mb-2"><Calendar className="w-6 h-6 text-blue-500"/><span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase">Routine</span></div>
                            <h4 className="font-bold text-slate-800 text-sm mt-2">Exam Routine</h4>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{routine ? routine.title : "No active routine"}</p>
                        </Link>
                        <Link href={`/resources/${segment_slug}?type=update&category=Syllabus`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition group">
                            <div className="flex justify-between items-start mb-2"><FileBarChart className="w-6 h-6 text-emerald-500"/><span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold uppercase">Syllabus</span></div>
                            <h4 className="font-bold text-slate-800 text-sm mt-2">Full Syllabus</h4>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{syllabus ? syllabus.title : "No syllabus found"}</p>
                        </Link>
                        <Link href={`/resources/${segment_slug}?type=update&category=Result`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition group">
                            <div className="flex justify-between items-start mb-2"><Trophy className="w-6 h-6 text-purple-500"/><span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded font-bold uppercase">Result</span></div>
                            <h4 className="font-bold text-slate-800 text-sm mt-2">Exam Results</h4>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{result ? result.title : "No results yet"}</p>
                        </Link>
                    </div>
                </section>

                {/* QUESTION BANK */}
                <section id="question-bank">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">?</div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Question Bank</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase">Browse by Category</p>
                        </div>
                    </div>

                    {/* CATEGORY GRID */}
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

                    {/* RECENT QUESTIONS */}
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
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                                    </Link>
                                ))}
                                <Link href={`/resources/${segment_slug}?type=question`} className="text-center py-4 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-b-xl transition-colors uppercase tracking-wide">
                                    View All Questions →
                                </Link>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-sm font-bold">No questions uploaded yet.</div>
                        )}
                    </div>
                </section>

                {/* MATERIALS (Simplified for brevity, similar styling) */}
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
                                            {/* Link to single material page */}
                                            <Link href={`/material/${item.slug || item.id}`} className="block">{item.title}</Link>
                                        </h3>
                                    </div>
                                    <Link href={`/material/${item.slug || item.id}`} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-900 hover:text-white transition whitespace-nowrap hidden sm:block">
                                        {item.type === 'pdf' ? 'Download' : 'Watch'}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">No materials available.</div>}
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