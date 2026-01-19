import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import ResourceFilterView from "@/components/ResourceFilterView"; 
import Image from "next/image";
import { 
  BookOpen, FileText, PlayCircle, HelpCircle, 
  PenTool, ChevronRight, ArrowLeft, Clock, 
  Calendar, FileBarChart, Trophy, Sparkles, ArrowRight
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GroupPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ segment_slug: string; group_slug: string }>;
  searchParams: Promise<{ type?: string; category?: string }>;
}) {
  const { segment_slug, group_slug } = await params;
  const { type, category } = await searchParams;

  // 1. Fetch Data
  const { data: segmentData } = await supabase.from("segments").select("id, title, slug").eq("slug", segment_slug).single();
  if (!segmentData) return notFound();

  const { data: groupData } = await supabase.from("groups").select("id, title, slug").eq("slug", group_slug).eq("segment_id", segmentData.id).single();
  if (!groupData) return notFound();

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

  const getGradient = (index: number) => {
    const gradients = ["from-blue-600 to-indigo-600", "from-emerald-500 to-teal-600", "from-purple-600 to-violet-600", "from-orange-500 to-red-500"];
    return gradients[index % gradients.length];
  };

  // Helper to get Subject Name safely
  const getSubjectName = (resource: any) => {
    if (Array.isArray(resource.subjects) && resource.subjects.length > 0) {
        return resource.subjects[0].title;
    }
    if (resource.subjects && typeof resource.subjects === 'object' && resource.subjects.title) {
        return resource.subjects.title;
    }
    return "Common";
  };

  // =========================================================
  //  A. LIST VIEW MODE (Matches SegmentPage Style)
  // =========================================================
  if (type) {
      let allItems = [];

      if (type === 'update') {
          const { data: updates } = await supabase
            .from("segment_updates")
            .select("id, title, type, created_at, attachment_url") 
            .eq("segment_id", segmentData.id) 
            .eq("status", "approved")
            .order("created_at", { ascending: false });
          
          allItems = updates?.map(u => ({
              ...u,
              category: u.type === 'exam_result' ? 'Result' : (u.type === 'routine' ? 'Routine' : 'Syllabus'),
              subjects: null, 
              slug: null 
          })) || [];

      } else {
          // Fetch Resources for this Group
          const { data: resources } = await supabase
            .from("resources")
            .select("*, subjects(id, title)")
            .eq("group_id", groupData.id) // Filter by Group
            .eq("type", type)
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
                                <Link href={`/resources/${segment_slug}`} className="hover:text-white transition-colors">{segmentData.title}</Link> /
                                <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-white transition-colors">{groupData.title}</Link> /
                                <span className="text-white bg-indigo-600 px-2 py-0.5 rounded">{getPageTitle()}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-4">
                                <span className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl md:text-4xl shadow-inner backdrop-blur-md border border-white/10">
                                    {getPageIcon()}
                                </span>
                                <span>{groupData.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">{getPageTitle()}</span></span>
                            </h1>
                        </div>
                        <Link 
                            href={`/resources/${segment_slug}/${group_slug}`} 
                            className="self-start md:self-auto px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wide transition-all backdrop-blur-md flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Group
                        </Link>
                    </div>
                </div>
            </div>

            <ResourceFilterView 
                items={allItems} 
                initialType={type} 
                initialCategory={category} 
                segmentTitle={groupData.title}
                segmentSlug={segment_slug} 
            />
        </div>
      );
  }

  // =========================================================
  //  B. DASHBOARD VIEW MODE
  // =========================================================

  // Parallel Fetching
  const [
    { data: subjects },
    { data: updates }, 
    { data: blogs },
    { data: materials },
    { data: questions }
  ] = await Promise.all([
    supabase.from("subjects").select("*").eq("group_id", groupData.id).order("id"),
    supabase.from("segment_updates").select("id, type, title, created_at").eq("segment_id", segmentData.id).order("created_at", { ascending: false }).limit(3),
    // Updated blogs query to include subjects(title) for the card label
    supabase.from("resources").select("*, subjects(title)").eq("group_id", groupData.id).eq("type", "blog").order("created_at", { ascending: false }).limit(4),
    supabase.from("resources").select("*, subjects(title)").eq("group_id", groupData.id).in("type", ["pdf", "video"]).order("created_at", { ascending: false }).limit(5),
    supabase.from("resources").select("*, subjects(title)").eq("group_id", groupData.id).eq("type", "question").order("created_at", { ascending: false }).limit(5)
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* HERO SECTION */}
      <section className="bg-slate-900 text-white pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link> / 
                    <Link href={`/resources/${segment_slug}`} className="hover:text-white transition-colors">{segmentData.title}</Link> /
                    <span className="text-indigo-400">{groupData.title}</span>
                </div>
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6">
                {groupData.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Hub</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
                Access all subject-specific resources, notes, and question banks for {groupData.title}.
            </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-8 space-y-16">
                
                {/* 1. SUBJECTS */}
                {subjects && subjects.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1.5 bg-indigo-600 rounded-full"></div>
                            <h2 className="text-2xl font-bold text-slate-900">Available Subjects</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {subjects.map((sub, index) => (
                                <Link 
                                    key={sub.id} 
                                    href={`/resources/${segment_slug}/${group_slug}/${sub.slug}`} 
                                    className="group relative p-1 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white border border-slate-100 overflow-hidden"
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getGradient(index)} rounded-full blur-3xl -mr-10 -mt-10 opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                                    
                                    <div className="relative z-10 p-6 flex items-start gap-5">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradient(index)} text-white flex items-center justify-center text-2xl font-black shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                                            <BookOpen className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{sub.title}</h3>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">
                                                <span>View Content</span>
                                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}


                {/* 2. LATEST BLOGS */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-purple-100 text-purple-600 rounded-lg text-lg">✍️</span>
                            <h2 className="text-xl font-bold text-slate-900">Latest Articles</h2>
                        </div>
                        <Link 
                            href={`/blog?segment=${segment_slug}&group=${group_slug}`} 
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
                                        {/* Subject Name or 'Common' */}
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-100">
                                            {getSubjectName(blog)}
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-base text-slate-900 mb-2 leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">{blog.title}</h3>
                                        <div className="mt-auto pt-4 flex items-center justify-end text-xs text-slate-400 font-bold border-t border-slate-100">
                                            {/* Date Removed */}
                                            <span className="text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read <ChevronRight className="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">No blog posts available yet.</div>}
                </section>

                {/* 3. LATEST MATERIALS */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3"><span className="p-2 bg-blue-100 text-blue-600 rounded-lg text-lg">📚</span><h2 className="text-xl font-bold text-slate-900">Latest Materials</h2></div>
                        <Link href={`/resources/${segment_slug}/${group_slug}?type=pdf`} className="self-start sm:self-auto text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center">View All <ChevronRight className="w-4 h-4" /></Link>
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
                                            <span className="uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">{getSubjectName(item) === 'Common' ? 'General' : getSubjectName(item)}</span>
                                        </div>
                                    </div>
                                    <Link href={item.slug ? `/material/${item.slug}` : `/material/${item.id}`} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-900 hover:text-white transition whitespace-nowrap hidden sm:block">
                                        {item.type === 'pdf' ? 'Download' : 'Watch'}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold">No materials available.</div>}
                </section>

                {/* 4. PREVIOUS QUESTIONS */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-lg">?</span>
                            <h2 className="text-xl font-bold text-slate-900">Question Bank</h2>
                        </div>
                        <Link href={`/resources/${segment_slug}/${group_slug}?type=question`} className="self-start sm:self-auto text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
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
                                                <span className="text-[10px] font-black text-white bg-indigo-600 px-2 py-0.5 rounded shadow-sm">{getSubjectName(q)}</span>
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