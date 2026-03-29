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
  Sparkles, Download, ArrowRight, BookOpen, User, Zap
} from "lucide-react";
import BookmarkButton from "@/components/shared/BookmarkButton";
import { Metadata } from 'next';
import { getBreadcrumbSchema } from "@/lib/seo-utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }: { 
  params: Promise<{ segment_slug: string; group_slug: string; subject_slug: string }>;
  searchParams: Promise<{ type?: string; category?: string }>;
}): Promise<Metadata> {
  const { segment_slug, group_slug, subject_slug } = await params;
  const { type, category } = await searchParams;

  const { data: segment } = await supabase.from("segments").select("title").eq("slug", segment_slug).single();
  if (!segment) return { title: "Not Found" };

  const { data: group } = await supabase.from("groups").select("title").eq("slug", group_slug).single();
  if (!group) return { title: segment.title };

  const { data: subject } = await supabase.from("subjects").select("title").eq("slug", subject_slug).single();
  if (!subject) return { title: `${group.title} - ${segment.title}` };

  let title = `${subject.title} Resources - ${group.title} (${segment.title})`;
  if (type === 'pdf') title = `${subject.title} Study Materials`;
  if (type === 'video') title = `${subject.title} Video Classes`;
  if (type === 'question') title = `${subject.title} Question Bank`;

  if (category) title = `${category} - ${title}`;

  return {
    title,
    description: `Download verified ${title} for NextPrepBD. Get access to ${subject.title} notes, previous year questions, and expert video classes for ${segment.title} ${group.title}.`,
    alternates: {
      canonical: `/resources/${segment_slug}/${group_slug}/${subject_slug}${type ? `?type=${type}` : ''}${category ? `&category=${category}` : ''}`,
    },
  };
}

export default async function SubjectPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ segment_slug: string; group_slug: string; subject_slug: string }>;
  searchParams: Promise<{ type?: string; category?: string }>;
}) {
  const { segment_slug, group_slug, subject_slug } = await params;
  const { type, category } = await searchParams;

  const { data: segmentData } = await supabase.from("segments").select("id, title, slug").eq("slug", segment_slug).single();
  if (!segmentData) return notFound();

  const { data: groupData } = await supabase.from("groups").select("id, title, slug").eq("slug", group_slug).eq("segment_id", segmentData.id).single();
  if (!groupData) return notFound();

  const { data: subject } = await supabase.from("subjects").select("*").eq("slug", subject_slug).eq("group_id", groupData.id).single();
  if (!subject) return notFound();

  // Breadcrumbs Schema
  const breadcrumbItems = [
    { name: "Home", item: "https://nextprepbd.com" },
    { name: "Resources", item: "https://nextprepbd.com/resources" },
    { name: segmentData.title, item: `https://nextprepbd.com/resources/${segment_slug}` },
    { name: groupData.title, item: `https://nextprepbd.com/resources/${segment_slug}/${group_slug}` },
    { name: subject.title, item: `https://nextprepbd.com/resources/${segment_slug}/${group_slug}/${subject_slug}` }
  ];
  if (type) {
    breadcrumbItems.push({ 
        name: type.charAt(0).toUpperCase() + type.slice(1), 
        item: `https://nextprepbd.com/resources/${segment_slug}/${group_slug}/${subject_slug}?type=${type}` 
    });
  }

  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  const getPageTitle = () => {
    if (type === 'pdf') return 'Study Materials';
    if (type === 'video') return 'Video Classes';
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
            .eq("subject_id", subject.id)
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
                <div className="bg-slate-900 text-white pt-32 pb-24 px-6 relative overflow-hidden border-b border-white/5">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20"></div>
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div>
                                <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 w-fit">
                                    <Link href={`/resources/${segment_slug}`} className="hover:text-white transition-colors">{segmentData.title}</Link> 
                                    <ChevronRight className="w-3 h-3" />
                                    <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-white transition-colors">{groupData.title}</Link> 
                                    <ChevronRight className="w-3 h-3" />
                                    <Link href={`/resources/${segment_slug}/${group_slug}/${subject_slug}`} className="hover:text-white transition-colors">{subject.title}</Link> 
                                    <ChevronRight className="w-3 h-3" />
                                    <span className="text-white">{getPageTitle()}</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4">
                                    {subject.title} <br/>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">{getPageTitle()}</span>
                                </h1>
                            </div>
                            <Link 
                                href={`/resources/${segment_slug}/${group_slug}/${subject_slug}`} 
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all backdrop-blur-xl flex items-center gap-3 group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Back to Subject
                            </Link>
                        </div>
                    </div>
                </div>

                <ResourceFilterView 
                    items={allItems} 
                    initialType={type} 
                    initialCategory={category} 
                    segmentTitle={subject.title}
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
    { data: blogs },
    { data: materials },
    { data: questions }
  ] = await Promise.all([
    supabase.from("resources").select("*").eq("subject_id", subject.id).eq("type", "blog").eq("status", "approved").order("created_at", { ascending: false }).limit(4),
    supabase.from("resources").select("*, subjects(title)").eq("subject_id", subject.id).in("type", ["pdf", "video"]).eq("status", "approved").order("created_at", { ascending: false }).limit(6),
    supabase.from("resources").select("*, subjects(title)").eq("subject_id", subject.id).eq("type", "question").eq("status", "approved").order("created_at", { ascending: false }).limit(5)
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white transition-colors duration-300 pb-20">
        
        {/* DASHBOARD HERO */}
        <section className="bg-slate-900 text-white pt-40 pb-32 px-6 relative overflow-hidden border-b border-white/5">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none -mr-40 -mt-20"></div>
          <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-12 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 w-fit">
                  <Link href="/" className="hover:text-white transition-colors">Home</Link> 
                  <ChevronRight className="w-3 h-3" />
                  <Link href={`/resources/${segment_slug}`} className="hover:text-white transition-colors">{segmentData.title}</Link> 
                  <ChevronRight className="w-3 h-3" />
                  <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-white transition-colors">{groupData.title}</Link> 
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-white">{subject.title}</span>
              </div>

              <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
                  {subject.title} <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Hub</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-3xl font-medium leading-relaxed">
                  Specialized study archives, video classes, and previous year solutions specifically for <span className="text-white">{subject.title}</span> mastery.
              </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              
              <div className="lg:col-span-8 space-y-24">
                  
                  <section>
                      <div className="flex items-center justify-between mb-10 gap-6">
                          <div className="flex items-center gap-4">
                              <div className="h-10 w-2 bg-purple-600 rounded-full"></div>
                              <h2 className="text-3xl font-black uppercase tracking-tighter">Subject Insights</h2>
                          </div>
                          <Link 
                              href={`/blog?segment=${segment_slug}&group=${group_slug}&subject=${subject_slug}`} 
                              className="px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all duration-300"
                          >
                              Full Journal
                          </Link>
                      </div>

                      {blogs && blogs.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {blogs.map((blog: any) => (
                                  <Link 
                                      key={blog.id} 
                                      href={blog.slug ? `/blog/${blog.slug}` : `/blog/${blog.id}`} 
                                      className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl dark:hover:shadow-indigo-900/10 hover:-translate-y-2 transition-all duration-500 flex flex-col h-full"
                                  >
                                      <div className="h-48 relative overflow-hidden">
                                          {blog.content_url ? (
                                              <Image src={blog.content_url} alt={blog.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                          ) : (
                                              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-100 dark:bg-slate-800">
                                                  <PenTool className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-4"/>
                                                  <h3 className="text-slate-400 dark:text-slate-500 font-black text-center text-xs uppercase tracking-widest leading-relaxed line-clamp-3">{blog.title}</h3>
                                              </div>
                                          )}
                                          <div className="absolute top-6 left-6">
                                              <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-900 dark:text-white text-[9px] font-black px-4 py-2 rounded-xl shadow-2xl border border-white/10 uppercase tracking-[0.2em]">
                                                  {subject.title}
                                              </span>
                                          </div>
                                      </div>
                                      <div className="p-8 flex-1 flex flex-col gap-4">
                                          <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-tight">{blog.title}</h3>
                                          <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                                              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">Scholarly Guide <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/></span>
                                          </div>
                                      </div>
                                  </Link>
                              ))}
                          </div>
                      ) : (
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-20 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
                              <PenTool className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-6" />
                              <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">No articles found for this subject</p>
                          </div>
                      )}
                  </section>

                  <section>
                      <div className="flex items-center justify-between mb-10 gap-6 px-4">
                          <div className="flex items-center gap-4">
                              <div className="h-10 w-2 bg-blue-600 rounded-full"></div>
                              <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Subject Vault</h2>
                          </div>
                          <Link href={`/resources/${segment_slug}/${group_slug}/${subject_slug}?type=pdf`} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all duration-300">
                              Explore All
                          </Link>
                      </div>

                      {materials && materials.length > 0 ? (
                          <div className="space-y-4 px-4">
                              {materials.map((item: any) => (
                                  <div key={item.id} className="group bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 flex items-center gap-6">
                                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform duration-500 group-hover:scale-110 ${item.type === 'pdf' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
                                          {item.type === 'pdf' ? <FileText className="w-7 h-7"/> : <PlayCircle className="w-7 h-7"/>}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <h3 className="font-black text-slate-800 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight truncate mb-2 leading-tight">
                                              <Link href={item.slug ? `/material/${item.slug}` : `/material/${item.id}`}>{item.title}</Link>
                                          </h3>
                                          <div className="flex items-center gap-4">
                                              <span className="text-[9px] font-black px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg uppercase tracking-widest border border-slate-100 dark:border-slate-700">
                                                  {subject.title}
                                              </span>
                                          </div>
                                      </div>
                                      <Link href={item.slug ? `/material/${item.slug}` : `/material/${item.id}`} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/20 hidden sm:block">
                                          {item.type === 'pdf' ? 'Download' : 'Open'}
                                      </Link>
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

                  <section>
                      <div className="flex items-center gap-4 mb-10 px-4">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-indigo-600/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">?</div>
                          <div>
                              <h2 className="text-3xl font-black uppercase tracking-tighter">Academic Solutions</h2>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Archived Examinations</p>
                          </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden px-2 mx-4">
                          {questions && questions.length > 0 ? (
                              <div className="flex flex-col divide-y divide-slate-50 dark:divide-slate-800">
                                  {questions.map((q: any) => (
                                      <Link href={q.slug ? `/question/${q.slug}` : `/question/${q.id}`} key={q.id} className="flex flex-col md:flex-row md:items-center gap-6 p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group">
                                          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-2xl group-hover:scale-110 transition-transform">Q</div>
                                          <div className="flex-1 min-w-0">
                                              <h3 className="font-black text-slate-800 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight truncate mb-2 leading-tight">{q.title}</h3>
                                              <div className="flex items-center gap-4">
                                                  <span className="text-[9px] font-black text-white bg-indigo-600 px-3 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-600/20">{subject.title}</span>
                                                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 flex items-center gap-2 uppercase tracking-widest"><Clock className="w-3.5 h-3.5 text-indigo-500"/> {new Date(q.created_at).toLocaleDateString()}</span>
                                              </div>
                                          </div>
                                          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all duration-300">
                                              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                          </div>
                                      </Link>
                                  ))}
                                  <Link href={`/resources/${segment_slug}/${group_slug}/${subject_slug}?type=question`} className="text-center py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all uppercase tracking-[0.2em]">
                                      Browse Full Question Archive
                                  </Link>
                              </div>
                          ) : (
                              <div className="p-20 text-center">
                                  <Zap className="w-16 h-16 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                                  <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-xs">No questions found</p>
                              </div>
                          )}
                      </div>
                  </section>

                  <section>
                      <div className="flex items-center justify-between mb-10 px-6">
                          <div className="flex items-center gap-4">
                              <div className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl shadow-slate-900/20"><Timer className="w-7 h-7" /></div>
                              <h2 className="text-3xl font-black uppercase tracking-tighter">Live Assessments</h2>
                          </div>
                          <span className="bg-rose-500 text-white text-[10px] font-black px-4 py-2 rounded-full animate-pulse border-b-4 border-rose-700 uppercase tracking-widest">
                              LIVE NOW
                          </span>
                      </div>
                      
                      <div className="bg-slate-900 dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-white/5 mx-4">
                          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 -mr-20 -mt-20"></div>
                          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 -ml-20 -mb-20"></div>
                          
                          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                              <div className="flex-1 text-center md:text-left">
                                  <h3 className="text-3xl md:text-4xl font-black text-white mb-6 uppercase tracking-tighter leading-tight">Test Your <br/>Preparation</h3>
                                  <p className="text-slate-400 mb-10 text-lg font-medium leading-relaxed">
                                      Take a real-time model test on <strong>{subject.title}</strong>. Compete with thousands and see your merit position instantly.
                                  </p>
                                  <DarkAppPromo />
                              </div>
                              
                              <div className="w-full md:w-2/5 bg-slate-800/40 rounded-3xl p-6 border border-white/10 backdrop-blur-xl shadow-2xl relative">
                                  <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                      <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{subject.title} Exam</span>
                                      </div>
                                      <span className="text-xs font-black text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg">09:59</span>
                                  </div>
                                  <div className="space-y-4">
                                      <div className="h-2 bg-white/10 rounded-full w-3/4"></div>
                                      <div className="h-2 bg-white/5 rounded-full w-1/2 mb-8"></div>
                                      <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-white/10 transition-colors">A. Academic Option Alpha</div>
                                      <div className="p-4 rounded-xl border border-indigo-500/50 bg-indigo-600 text-[10px] font-black text-white uppercase tracking-widest shadow-2xl shadow-indigo-600/40 transform scale-[1.02]">B. Verified Correct Answer</div>
                                  </div>
                              </div>
                          </div>
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