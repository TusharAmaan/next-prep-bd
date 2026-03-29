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
  CalendarDays, BookOpen, User, Zap
} from "lucide-react";
import BookmarkButton from "@/components/shared/BookmarkButton";
import { Metadata } from 'next';
import { getBreadcrumbSchema } from "@/lib/seo-utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }: { 
  params: Promise<{ segment_slug: string }>,
  searchParams: Promise<{ type?: string; category?: string }> 
}): Promise<Metadata> {
  const { segment_slug } = await params;
  const { type, category } = await searchParams;

  const { data: segment } = await supabase.from("segments").select("title").eq("slug", segment_slug).single();
  if (!segment) return { title: "Not Found" };

  let title = `${segment.title} Resources`;
  if (type === 'pdf') title = `${segment.title} Study Materials`;
  if (type === 'video') title = `${segment.title} Video Classes`;
  if (type === 'question') title = `${segment.title} Question Bank`;
  if (type === 'update') title = `${segment.title} Exam Updates`;

  if (category) title = `${category} - ${title}`;

  return {
    title,
    description: `Access verified ${title} for NextPrepBD. Download notes, suggestions, and question banks tailored for ${segment.title} success.`,
    alternates: {
      canonical: `/resources/${segment_slug}${type ? `?type=${type}` : ''}${category ? `&category=${category}` : ''}`,
    },
  };
}

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

  // Breadcrumbs Schema
  const breadcrumbItems = [
    { name: "Home", item: "https://nextprepbd.com" },
    { name: "Resources", item: "https://nextprepbd.com/resources" },
    { name: segmentData.title, item: `https://nextprepbd.com/resources/${segment_slug}` }
  ];
  if (type) {
    breadcrumbItems.push({ 
        name: type.charAt(0).toUpperCase() + type.slice(1), 
        item: `https://nextprepbd.com/resources/${segment_slug}?type=${type}` 
    });
  }

  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  // Helper Config
  const getPageTitle = () => {
    if (type === 'pdf') return 'Study Materials';
    if (type === 'video') return 'Video Classes';
    if (type === 'update') return 'Latest Updates';
    if (type === 'question') return 'Question Bank';
    return 'Resources'; 
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
            .eq("status", "approved") 
            .order("created_at", { ascending: false });
          allItems = resources || [];
      }

      return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white transition-colors duration-300">
                <div className="bg-slate-900 text-white pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-6 relative overflow-hidden border-b border-white/5">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20"></div>
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                            <div>
                                <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 md:mb-6 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 w-fit">
                                    <Link href="/" className="hover:text-white transition-colors">Home</Link> 
                                    <ChevronRight className="w-3 h-3" />
                                    <Link href={`/resources/${segment_slug}`} className="hover:text-white transition-colors">{segmentData.title}</Link> 
                                    <ChevronRight className="w-3 h-3" />
                                    <span className="text-white">{getPageTitle()}</span>
                                </div>
                                <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4">
                                    {segmentData.title} <br className="hidden md:block"/>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">{getPageTitle()}</span>
                                </h1>
                            </div>
                            <Link 
                                href={`/resources/${segment_slug}`} 
                                className="px-6 md:px-8 py-3 md:py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-xl flex items-center justify-center gap-3 group"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
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
        </>
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
    supabase.from("resources").select("*").eq("segment_id", segmentData.id).eq("type", "blog").eq("status", "approved").order("created_at", { ascending: false }).limit(4),
    supabase.from("resources").select("*, subjects(title)").eq("segment_id", segmentData.id).in("type", ["pdf", "video"]).eq("status", "approved").order("created_at", { ascending: false }).limit(5),
    supabase.from("resources").select("*, subjects(title)").eq("segment_id", segmentData.id).eq("type", "question").eq("status", "approved").order("created_at", { ascending: false }).limit(5),
    supabase.from("resources").select("category").eq("segment_id", segmentData.id).eq("type", "question").eq("status", "approved")
  ]);

  const availableCategories = Array.from(new Set(questionCats?.map(q => q.category).filter(Boolean)));

  const getQuestionTag = (q: any) => {
    return Array.isArray(q.subjects) ? q.subjects[0]?.title : (q.subjects?.title || q.category || "General");
  };

  const getGroupStyle = (index: number) => {
    const styles = [
      { bg: "bg-blue-600", lightBg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400" },
      { bg: "bg-indigo-600", lightBg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-600 dark:text-indigo-400" },
      { bg: "bg-emerald-600", lightBg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
      { bg: "bg-purple-600", lightBg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400" },
    ];
    return styles[index % styles.length];
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white transition-colors duration-300 pb-20">
        
        {/* DASHBOARD HERO */}
        <section className="bg-slate-900 text-white pt-32 md:pt-40 pb-20 md:pb-32 px-4 md:px-6 relative overflow-hidden border-b border-white/5">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none -mr-40 -mt-20"></div>
          <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10 mb-8 md:mb-12">
                  <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 w-fit">
                      <Link href="/" className="hover:text-white transition-colors">Home</Link> 
                      <ChevronRight className="w-3 h-3" />
                      <span className="text-white">{segmentData.title}</span>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-3 bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-xl">
                      {allSegments?.slice(0, 5).map(s => (
                          <Link key={s.id} href={`/resources/${s.slug}`} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${s.slug === segment_slug ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                              {s.title}
                          </Link>
                      ))}
                  </div>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[1] md:leading-[0.9] mb-6 md:mb-8">
                  {segmentData.title} <br className="hidden md:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Hub</span>
              </h1>
              <p className="text-base md:text-xl text-slate-400 max-w-2xl font-medium leading-relaxed opacity-80">
                  Centralized resources, real-time updates, and verified study materials tailored for {segmentData.title} success.
              </p>
          </div>
        </section>

        {/* MOBILE SWITCHER */}
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto hide-scrollbar py-4 px-4 flex gap-3 sticky top-[60px] z-30 shadow-xl">
           {allSegments?.map(s => (
               <Link key={s.id} href={`/resources/${s.slug}`} className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${s.slug === segment_slug ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                   {s.title}
               </Link>
           ))}
        </div>

        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
              
              <div className="lg:col-span-8 space-y-16 md:space-y-24">
                  
                  {groups && groups.length > 0 && (
                      <section>
                          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
                              <div className="h-8 md:h-10 w-1.5 md:w-2 bg-indigo-600 rounded-full"></div>
                              <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Academic Segments</h2>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                              {groups.map((group: any, index: number) => {
                                  const style = getGroupStyle(index);
                                  return (
                                      <Link key={group.id} href={`/resources/${segment_slug}/${group.slug}`} className={`group bg-white dark:bg-slate-900 p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:shadow-2xl dark:hover:shadow-indigo-900/10 hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500 relative overflow-hidden flex items-center gap-4 md:gap-6`}>
                                          <div className={`w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl ${style.bg} text-white flex items-center justify-center text-2xl md:text-4xl font-black shadow-xl shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                                              {group.title.charAt(0)}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                              <h3 className={`text-base md:text-2xl font-black uppercase tracking-tight mb-1 md:mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate`}>{group.title}</h3>
                                              <div className="flex items-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                                                  <span>Library</span>
                                                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                                              </div>
                                          </div>
                                      </Link>
                                  );
                              })}
                          </div>
                      </section>
                  )}

                   <section>
                      <div className="flex items-center gap-3 mb-8 md:mb-10 px-4 md:px-6 py-3 md:py-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl md:rounded-3xl border border-indigo-500/10 w-fit">
                          <Sparkles className="w-4 md:w-5 h-4 md:h-5 text-amber-500 fill-amber-500 animate-pulse"/> 
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Institutional Updates</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                          <Link href={`/resources/${segment_slug}?type=update&category=Routine`} className="relative group overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between h-44 md:h-52 bg-gradient-to-br from-blue-500 to-indigo-700 shadow-xl md:shadow-2xl shadow-blue-500/20 hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500">
                              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 transform rotate-12 group-hover:scale-110 transition-all duration-700">
                                  <CalendarDays className="w-32 md:w-48 h-32 md:h-48 text-white" />
                              </div>
                              <div className="relative z-10">
                                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mb-4 md:mb-6 border border-white/10 shadow-inner text-white">
                                      <CalendarDays className="w-5 md:w-6 h-5 md:h-6" />
                                  </div>
                                  <h3 className="text-xl md:text-2xl font-black text-white leading-none uppercase tracking-tighter">Exam<br/>Routine</h3>
                              </div>
                              <div className="relative z-10 flex items-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-black text-blue-100 uppercase tracking-widest group-hover:text-white transition-colors">
                                  Track Schedule <ArrowRight className="w-3 md:w-4 h-3 md:h-4" />
                              </div>
                          </Link>

                          <Link href={`/resources/${segment_slug}?type=update&category=Syllabus`} className="relative group overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between h-44 md:h-52 bg-gradient-to-br from-emerald-500 to-teal-700 shadow-xl md:shadow-2xl shadow-emerald-500/20 hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500">
                              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 transform rotate-12 group-hover:scale-110 transition-all duration-700">
                                  <BookOpen className="w-32 md:w-48 h-32 md:h-48 text-white" />
                              </div>
                              <div className="relative z-10">
                                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mb-4 md:mb-6 border border-white/10 shadow-inner text-white">
                                      <BookOpen className="w-5 md:w-6 h-5 md:h-6" />
                                  </div>
                                  <h3 className="text-xl md:text-2xl font-black text-white leading-none uppercase tracking-tighter">Full<br/>Syllabus</h3>
                              </div>
                              <div className="relative z-10 flex items-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-black text-emerald-100 uppercase tracking-widest group-hover:text-white transition-colors">
                                  Curriculums <ArrowRight className="w-3 md:w-4 h-3 md:h-4" />
                              </div>
                          </Link>

                          <Link href={`/resources/${segment_slug}?type=update&category=Result`} className="relative group overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between h-44 md:h-52 bg-gradient-to-br from-amber-500 to-orange-700 shadow-xl md:shadow-2xl shadow-amber-500/20 hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500">
                              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 transform rotate-12 group-hover:scale-110 transition-all duration-700">
                                  <Trophy className="w-32 md:w-48 h-32 md:h-48 text-white" />
                              </div>
                              <div className="relative z-10">
                                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mb-4 md:mb-6 border border-white/10 shadow-inner text-white">
                                      <Trophy className="w-5 md:w-6 h-5 md:h-6" />
                                  </div>
                                  <h3 className="text-xl md:text-2xl font-black text-white leading-none uppercase tracking-tighter">Board<br/>Results</h3>
                              </div>
                              <div className="relative z-10 flex items-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-black text-amber-100 uppercase tracking-widest group-hover:text-white transition-colors">
                                  Achievement <ArrowRight className="w-3 md:w-4 h-3 md:h-4" />
                              </div>
                          </Link>
                      </div>
                  </section>

                  <section>
                      <div className="flex items-center justify-between mb-8 md:mb-10 gap-4">
                          <div className="flex items-center gap-3 md:gap-4">
                              <div className="h-8 md:h-10 w-1.5 md:w-2 bg-purple-600 rounded-full"></div>
                              <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Expert Insights</h2>
                          </div>
                          <Link 
                              href={`/blog?segment=${segment_slug}`} 
                              className="px-4 md:px-6 py-2 md:py-3 bg-slate-900 dark:bg-slate-800 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all duration-300"
                          >
                              Explore
                          </Link>
                      </div>

                      {blogs && blogs.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                              {blogs.map((blog: any) => (
                                  <Link 
                                      key={blog.id} 
                                      href={blog.slug ? `/blog/${blog.slug}` : `/blog/${blog.id}`} 
                                      className="group bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl dark:hover:shadow-indigo-900/10 hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500 flex flex-col h-full"
                                  >
                                      <div className="h-44 md:h-56 relative overflow-hidden">
                                          {blog.content_url ? (
                                              <Image src={blog.content_url} alt={blog.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                          ) : (
                                              <div className="w-full h-full flex flex-col items-center justify-center p-6 md:p-8 bg-slate-100 dark:bg-slate-800">
                                                  <PenTool className="w-10 md:w-12 h-10 md:h-12 text-slate-300 dark:text-slate-600 mb-4"/>
                                                  <h3 className="text-slate-400 dark:text-slate-500 font-black text-center text-xs md:text-sm uppercase tracking-widest leading-relaxed line-clamp-2">{blog.title}</h3>
                                              </div>
                                          )}
                                          <div className="absolute top-4 md:top-6 left-4 md:left-6">
                                              <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-900 dark:text-white text-[8px] md:text-[9px] font-black px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl shadow-2xl border border-white/10 uppercase tracking-widest">
                                                  {blog.category || 'Mentorship'}
                                              </span>
                                          </div>
                                      </div>
                                      <div className="p-6 md:p-8 flex-1 flex flex-col">
                                          <h3 className="font-black text-lg md:text-2xl text-slate-900 dark:text-white mb-4 md:mb-6 uppercase tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">{blog.title}</h3>
                                          <div className="flex items-center justify-between mt-auto pt-4 md:pt-6 border-t border-slate-50 dark:border-slate-800">
                                              <span className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{new Date(blog.created_at).toLocaleDateString()}</span>
                                              <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-600 text-slate-300 dark:text-slate-600 group-hover:text-white flex items-center justify-center transition-all duration-300">
                                                  <ArrowRight className="w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform" />
                                              </div>
                                          </div>
                                      </div>
                                  </Link>
                              ))}
                          </div>
                      ) : (
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-20 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
                              <PenTool className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-6" />
                              <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Academic journal pending articles</p>
                          </div>
                      )}
                  </section>

                  <section>
                      <div className="flex items-center justify-between mb-8 md:mb-10 gap-4">
                          <div className="flex items-center gap-3 md:gap-4">
                              <div className="h-8 md:h-10 w-1.5 md:w-2 bg-blue-600 rounded-full"></div>
                              <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Study Vault</h2>
                          </div>
                          <Link href={`/resources/${segment_slug}?type=pdf`} className="px-4 md:px-6 py-2 md:py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all duration-300">
                              View All
                          </Link>
                      </div>
                      {materials && materials.length > 0 ? (
                          <div className="space-y-3 md:space-y-4">
                              {materials.map((item: any) => (
                                  <div key={item.id} className="group bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl md:hover:shadow-2xl transition-all duration-500 flex items-center gap-4 md:gap-6">
                                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl shrink-0 transition-transform duration-500 group-hover:scale-110 ${item.type === 'pdf' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
                                          {item.type === 'pdf' ? <FileText className="w-6 md:w-7 h-6 md:h-7"/> : <PlayCircle className="w-6 md:w-7 h-6 md:h-7"/>}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <h3 className="font-black text-slate-800 dark:text-white text-base md:text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight truncate mb-1">
                                              <Link href={`/material/${item.slug || item.id}`}>{item.title}</Link>
                                          </h3>
                                          <div className="flex items-center gap-2 md:gap-4">
                                              <span className="text-[8px] md:text-[9px] font-black px-2 md:px-3 py-0.5 md:py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md md:rounded-lg uppercase tracking-widest border border-slate-100 dark:border-slate-700 truncate max-w-[120px] md:max-w-none">
                                                  {Array.isArray(item.subjects) ? item.subjects[0]?.title : 'Verified Material'}
                                              </span>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-3 md:gap-4">
                                         <Link href={`/material/${item.slug || item.id}`} className="px-4 md:px-6 py-2 md:py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/10">
                                             {item.type === 'pdf' ? 'Open' : 'Watch'}
                                         </Link>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="p-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                              <BookOpen className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                              <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Material library is empty</p>
                          </div>
                      )}
                  </section>

                  <section id="question-bank">
                      <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-10">
                          <div className="w-10 md:w-14 h-10 md:h-14 rounded-xl md:rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl md:text-4xl font-black shadow-xl md:shadow-2xl shadow-indigo-600/20">?</div>
                          <div>
                              <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Question Bank</h2>
                              <p className="text-[8px] md:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5 md:mt-1">Institutional Archives</p>
                          </div>
                      </div>

                      {availableCategories.length > 0 && (
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
                              {availableCategories.map((cat: any) => (
                                  <Link 
                                      key={cat} 
                                      href={`/resources/${segment_slug}?type=question&category=${encodeURIComponent(cat)}`}
                                      className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 text-center group"
                                  >
                                      <FolderOpen className="w-8 md:w-10 h-8 md:h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3 md:mb-4 group-hover:text-indigo-600 transition-colors" />
                                      <h4 className="text-[9px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">{cat}</h4>
                                  </Link>
                              ))}
                          </div>
                      )}

                      <div className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                          {questions && questions.length > 0 ? (
                              <div className="flex flex-col divide-y divide-slate-50 dark:divide-slate-800">
                                  {questions.map((q: any) => (
                                      <Link href={`/question/${q.slug || q.id}`} key={q.id} className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 p-6 md:p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group">
                                          <div className="w-10 md:w-14 h-10 md:h-14 rounded-xl md:rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl md:text-2xl group-hover:scale-110 transition-transform">Q</div>
                                          <div className="flex-1 min-w-0">
                                              <h3 className="font-black text-slate-800 dark:text-white text-base md:text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight truncate mb-1.5 md:mb-2">{q.title}</h3>
                                              <div className="flex items-center gap-3 md:gap-4">
                                                  <span className="text-[8px] md:text-[9px] font-black text-white bg-indigo-600 px-2.5 md:px-3 py-1 rounded-md md:rounded-lg uppercase tracking-widest shadow-md">{getQuestionTag(q)}</span>
                                                  <span className="text-[8px] md:text-[9px] font-black text-slate-400 dark:text-slate-500 flex items-center gap-1.5 uppercase tracking-widest"><Clock className="w-3 md:w-3.5 h-3 md:h-3.5 text-indigo-500"/> {new Date(q.created_at).toLocaleDateString()}</span>
                                              </div>
                                          </div>
                                          <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all duration-300 self-end md:self-center">
                                              <ArrowRight className="w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform" />
                                          </div>
                                      </Link>
                                  ))}
                                  <Link href={`/resources/${segment_slug}?type=question`} className="text-center py-5 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all uppercase tracking-widest">
                                      Browse Full Archive
                                  </Link>
                              </div>
                          ) : (
                              <div className="p-16 md:p-20 text-center">
                                  <Zap className="w-12 md:w-16 h-12 md:h-16 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                                  <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[10px] md:text-xs">No questions found</p>
                              </div>
                          )}
                      </div>
                  </section>
              </div>

              <div className="lg:col-span-4">
                  <div className="sticky top-32">
                      <Sidebar />
                  </div>
              </div>
          </div>
        </section>
      </div>
    </>
  );
}