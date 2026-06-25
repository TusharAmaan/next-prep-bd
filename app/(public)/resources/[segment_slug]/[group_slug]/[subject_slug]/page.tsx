import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import LeftSidebar from "@/components/LeftSidebar";
import DarkAppPromo from "@/components/DarkAppPromo"; 
import ResourceFilterView from "@/components/ResourceFilterView"; 
import QuickUpdatesSection from "@/components/QuickUpdatesSection";
import QuestionBankSection from "@/components/QuestionBankSection";
import Image from "next/image";
import { 
  ArrowLeft, PenTool, FileText, PlayCircle, 
  HelpCircle, ChevronRight, Clock, Timer, 
  Sparkles, Download, ArrowRight, BookOpen, User, Zap, Star, Smartphone,
  CalendarDays, Layers, Calendar, Tag
} from "lucide-react";
import BookmarkButton from "@/components/shared/BookmarkButton";
import { Metadata } from 'next';
import { getBreadcrumbSchema } from "@/lib/seo-utils";
import AnimatedCounter from "@/components/AnimatedCounter";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }: { 
  params: Promise<{ segment_slug: string; group_slug: string; subject_slug: string }>;
  searchParams: Promise<{ type?: string; category?: string }>;
}): Promise<Metadata> {
  const { segment_slug, group_slug, subject_slug } = await params;
  const { type, category } = await searchParams;

  const { data: segment } = await supabase.from("segments").select("id, title").eq("slug", segment_slug).single();
  if (!segment) return { title: "Not Found" };

  const { data: group } = await supabase.from("groups").select("id, title").eq("slug", group_slug).eq("segment_id", segment.id).single();
  if (!group) return { title: segment.title };

  const { data: subject } = await supabase.from("subjects").select("title").eq("slug", subject_slug).eq("group_id", group.id).single();
  if (!subject) return { title: `${group.title} - ${segment.title}` };

  let title = `${subject.title} Resources - ${group.title} (${segment.title})`;
  if (type === 'pdf') title = `${subject.title} Study Materials`;
  if (type === 'video') title = `${subject.title} Video Classes`;
  if (type === 'question') title = `${subject.title} Question Bank`;

  if (category) title = `${category} - ${title}`;

  return {
    title,
    description: `Access verified ${title} for NextPrepBD. Download notes, suggestions, and question banks tailored for ${subject.title} success.`,
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

  const { data: segmentData } = await supabase.from("segments").select("*").eq("slug", segment_slug).single();
  if (!segmentData) return notFound();

  const { data: groupData } = await supabase.from("groups").select("*").eq("slug", group_slug).eq("segment_id", segmentData.id).single();
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

    const { data: resources } = await supabase
      .from("resources")
      .select("*, subjects(id, title)")
      .eq("subject_id", subject.id)
      .eq("type", type)
      .eq("status", "approved") 
      .order("created_at", { ascending: false });
    allItems = resources || [];

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
                                <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-indigo-400 tracking-[0.2em] mb-6 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 w-fit">
                                    <Link href={`/resources/${segment_slug}`} className="hover:text-white transition-colors">{segmentData.title}</Link> 
                                    <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-white transition-colors">{groupData.title}</Link> 
                                    <Link href={`/resources/${segment_slug}/${group_slug}/${subject_slug}`} className="hover:text-white transition-colors">{subject.title}</Link> 
                                    <ChevronRight className="w-3 h-3" />
                                    <span className="text-white">{getPageTitle()}</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-4">
                                    {subject.title} <br/>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">{getPageTitle()}</span>
                                </h1>
                            </div>
                            <Link 
                                href={`/resources/${segment_slug}/${group_slug}/${subject_slug}`} 
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black tracking-[0.2em] transition-all backdrop-blur-xl flex items-center gap-3 group"
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
    { data: questions },
    { data: updates },
    { count: materialsCount },
    { count: questionsCount },
    { count: blogsCount }
  ] = await Promise.all([
    supabase.from("resources").select("*, subjects(title), groups(title), profiles(full_name)").eq("subject_id", subject.id).eq("type", "blog").eq("status", "approved").order("created_at", { ascending: false }).limit(4),
    supabase.from("resources").select("*, subjects(title)").eq("subject_id", subject.id).in("type", ["pdf", "video"]).eq("status", "approved").order("created_at", { ascending: false }).limit(6),
    supabase.from("resources").select("*, subjects(title)").eq("subject_id", subject.id).eq("type", "question").eq("status", "approved").order("created_at", { ascending: false }).limit(15),
    supabase.from("segment_updates").select("id, title, type, created_at, attachment_url").eq("segment_id", segmentData.id).order("created_at", { ascending: false }).limit(15),
    supabase.from("resources").select("*", { count: 'exact', head: true }).eq("subject_id", subject.id).in("type", ["pdf", "video"]).eq("status", "approved"),
    supabase.from("resources").select("*", { count: 'exact', head: true }).eq("subject_id", subject.id).eq("type", "question").eq("status", "approved"),
    supabase.from("resources").select("*", { count: 'exact', head: true }).eq("subject_id", subject.id).eq("type", "blog").eq("status", "approved")
  ]);

  const getBlogBadge = (blog: any) => {
    const subjectTitle = Array.isArray(blog.subjects) ? blog.subjects[0]?.title : blog.subjects?.title;
    if (subjectTitle) return subjectTitle;
    const groupTitle = Array.isArray(blog.groups) ? blog.groups[0]?.title : blog.groups?.title;
    if (groupTitle) return groupTitle;
    return blog.category || "Mentorship";
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} ${months === 1 ? "month" : "months"} ago`;
    const years = Math.floor(months / 12);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  };

  const getGroupTheme = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("science")) {
      return {
        text: "text-blue-600 dark:text-blue-450",
        bg: "bg-blue-600 dark:bg-blue-750",
        border: "border-blue-100/70 dark:border-blue-900/50"
      };
    }
    if (t.includes("business") || t.includes("commerce")) {
      return {
        text: "text-amber-600 dark:text-amber-500",
        bg: "bg-amber-600 dark:bg-amber-700",
        border: "border-amber-100/70 dark:border-amber-900/50"
      };
    }
    if (t.includes("humanities") || t.includes("arts")) {
      return {
        text: "text-rose-600 dark:text-rose-450",
        bg: "bg-rose-600 dark:bg-rose-700",
        border: "border-rose-100/70 dark:border-rose-900/50"
      };
    }
    return {
      text: "text-indigo-650 dark:text-indigo-400",
      bg: "bg-indigo-600 dark:bg-indigo-705",
      border: "border-indigo-100/70 dark:border-indigo-900/50"
    };
  };

  const getSegmentSubBadgeText = (segTitle: string, grpTitle: string, subTitle: string) => {
    const t = segTitle.toUpperCase();
    let base = '';
    if (t === 'SSC') base = 'Bangladesh secondary certificate';
    else if (t === 'HSC') base = 'Bangladesh higher secondary certificate';
    else base = `Bangladesh ${segTitle.toLowerCase()} certificate`;
    return `${base} — ${grpTitle.toLowerCase()} — ${subTitle.toLowerCase()}`;
  };

  const theme = getGroupTheme(groupData.title);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white pt-16 transition-colors duration-300 relative overflow-hidden">
        {/* Decorative Colorful Ambient Background Blobs */}
        <div className="absolute top-20 left-10 w-[450px] h-[450px] bg-indigo-200/25 dark:bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] right-20 w-[400px] h-[400px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-20 left-[20%] w-[550px] h-[550px] bg-emerald-100/25 dark:bg-emerald-950/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="w-full grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_340px]">
          
          {/* LEFT SIDEBAR */}
          <LeftSidebar activeSegment={segment_slug} activeGroup={group_slug} activeSubject={subject_slug} />

          {/* MAIN CONTENT AREA */}
          <main className="min-w-0 p-4 md:p-6 pb-20">
            
            {/* HERO SECTION */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 md:p-8 relative overflow-hidden shadow-sm">
              <div className="absolute top-[-60px] right-[-80px] w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
              
              <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-3 md:mb-5">
                <Link href="/" className="hover:text-indigo-650 transition-colors">Home</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href={`/resources/${segment_slug}`} className="hover:text-indigo-650 transition-colors">{segmentData.title}</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-indigo-650 transition-colors">{groupData.title}</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-slate-655 dark:text-slate-300 font-semibold">{subject.title}</span>
              </nav>

              <div className="flex items-start gap-4 md:gap-6 mt-2">
                {/* Left: Icon box */}
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${theme.bg} text-white flex items-center justify-center shrink-0 shadow-md`}>
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-white dark:bg-slate-100 flex items-center justify-center ${theme.text}`}>
                    <svg className="h-3.5 w-3.5 md:h-4.5 md:w-4.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                {/* Right: Content */}
                <div className="flex-1 min-w-0">
                  {/* Sub-badge */}
                  <div className={`flex items-center gap-1.5 text-[9px] md:text-[10px] font-extrabold ${theme.text} tracking-wider mb-1`}>
                    <Star className={`h-3.5 w-3.5 fill-current`} />
                    <span>{getSegmentSubBadgeText(segmentData.title, groupData.title, subject.title)}</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                    {subject.title} <span className={`italic font-normal ${theme.text}`}>Library</span> Hub
                  </h1>

                  {/* Description */}
                  <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
                    Specialized study archives, video classes, and previous year solutions specifically for {subject.title} mastery.
                  </p>

                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="text-left">
                      <div className={`text-xl md:text-2xl font-extrabold ${theme.text}`}>
                        <AnimatedCounter value={materialsCount || 0} />
                      </div>
                      <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Study vault files</div>
                    </div>
                    <div className="text-left">
                      <div className={`text-xl md:text-2xl font-extrabold ${theme.text}`}>
                        <AnimatedCounter value={questionsCount || 0} />
                      </div>
                      <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Practice questions</div>
                    </div>
                    <div className="text-left">
                      <div className={`text-xl md:text-2xl font-extrabold ${theme.text}`}>
                        <AnimatedCounter value={blogsCount || 0} />
                      </div>
                      <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Expert guides</div>
                    </div>
                    <div className="text-left">
                      <div className={`text-xl md:text-2xl font-extrabold ${theme.text}`}>2027</div>
                      <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Batch support</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* PAGE CONTENT CONTAINER */}
            <div className="mt-6 md:mt-8 space-y-6 md:space-y-10">
              
              {/* EXPERT INSIGHTS (BLOGS FIRST) */}
              <section>
                <div className="flex items-center justify-between mb-6 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Subject Insights</h2>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans">Mentorship guides and preparation tips for {subject.title}</p>
                    </div>
                  </div>
                  <Link
                    href={`/blog?segment=${segment_slug}&group=${group_slug}&subject=${subject_slug}`}
                    className="text-[11px] font-bold text-indigo-650 dark:text-indigo-400 flex items-center gap-1 group"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {blogs && blogs.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {blogs.map((blog: any) => (
                      <Link
                        key={blog.id}
                        href={blog.slug ? `/blog/${blog.slug}` : `/blog/${blog.id}`}
                        className="group bg-gradient-to-br from-white to-slate-50/40 dark:from-slate-900 dark:to-indigo-950/5 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 tracking-wider">
                              {getBlogBadge(blog)}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-indigo-500/60" />
                              {new Date(blog.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mb-4">
                            <h3 className="font-bold text-slate-850 dark:text-slate-100 text-xs md:text-sm leading-snug tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                              {blog.title}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                          <span className="flex items-center gap-1.5 truncate max-w-[150px]">
                            <User className="w-3.5 h-3.5 text-indigo-500/60 shrink-0" />
                            <span className="truncate">{blog.profiles?.full_name || "Admin"}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-500/60" />
                            <span>{getTimeAgo(blog.created_at)}</span>
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400">
                    <PenTool className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold">Academic insights pending articles</p>
                  </div>
                )}
              </section>

              {/* QUESTION BANK (SECOND) */}
              <QuestionBankSection 
                questions={questions || []} 
                segmentSlug={segment_slug} 
                browseAllHref={`/resources/${segment_slug}/${group_slug}/${subject_slug}?type=question`} 
                title="Academic Solutions"
                subtitle={`Board questions and school exams for ${subject.title}`}
                defaultSubjectTitle={subject.title}
              />

              {/* LESSON PLAN / CURRICULUM WIDGET */}
              <Link
                href={`/curriculum/${subject.id}`}
                className="block group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-sm hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wide bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full">
                        Interactive lesson plan
                      </span>
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-slate-850 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Track syllabus milestones for {subject.title}
                    </h3>
                    <p className="text-[11px] md:text-xs text-slate-450 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      Visualize your learning progress, check off completed chapters, and follow curated study guidelines designed to streamline your preparation path.
                    </p>
                  </div>
                  <div className="shrink-0 self-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              {/* QUICK UPDATES (THIRD) */}
              <QuickUpdatesSection updates={updates || []} segmentSlug={segment_slug} />

              {/* SUBJECT VAULT (FOURTH) */}
              <section>
                <div className="flex items-center justify-between mb-6 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-lg">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Subject Vault</h2>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">PDF notes, lecture guides, and class materials</p>
                    </div>
                  </div>
                  <Link
                    href={`/resources/${segment_slug}/${group_slug}/${subject_slug}?type=pdf`}
                    className="text-[11px] font-bold text-indigo-650 dark:text-indigo-400 flex items-center gap-1 group"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {materials && materials.length > 0 ? (
                  <div className="space-y-3">
                    {materials.map((item: any) => (
                      <div
                        key={item.id}
                        className="group bg-gradient-to-br from-white to-slate-50/40 dark:from-slate-900 dark:to-indigo-950/5 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm ${item.type === 'pdf' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500' : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600'}`}>
                          {item.type === 'pdf' ? <FileText className="w-5.5 h-5.5" /> : <PlayCircle className="w-5.5 h-5.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-850 dark:text-slate-200 text-xs md:text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate mb-1">
                            <Link href={`/material/${item.slug || item.id}`}>{item.title}</Link>
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded tracking-wider">
                              {subject.title}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/material/${item.slug || item.id}`}
                          className="px-4 py-2 bg-slate-900 dark:bg-white hover:bg-indigo-650 dark:hover:bg-indigo-650 dark:hover:text-white text-white dark:text-slate-900 rounded-lg text-[10px] font-bold tracking-wider hover:scale-105 transition-all shrink-0 shadow-sm"
                        >
                          {item.type === 'pdf' ? 'Open' : 'Watch'}
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-250 dark:border-slate-800 text-slate-400">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold">Material vault is empty</p>
                    <span className="text-[10px] mt-1 block">PDFs and notes will appear here as they're added by instructors</span>
                  </div>
                )}
              </section>

              {/* LIVE ASSESSMENT */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-lg">
                      <Timer className="w-5 h-5" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Live Assessments</h2>
                  </div>
                  <span className="bg-rose-500 text-white text-[8px] font-extrabold px-3 py-1 rounded-full animate-pulse border-b-2 border-rose-700 tracking-widest">
                    LIVE NOW
                  </span>
                </div>
                
                <div className="bg-slate-900 dark:bg-slate-900/80 rounded-2xl p-6 relative overflow-hidden group border border-white/5">
                  <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-650 rounded-full mix-blend-overlay filter blur-[60px] opacity-20 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-650 rounded-full mix-blend-overlay filter blur-[60px] opacity-20 pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight leading-tight">Test Your Preparation</h3>
                      <p className="text-slate-400 mb-6 text-xs md:text-sm font-medium leading-relaxed">
                        Take a real-time model test on <strong>{subject.title}</strong>. Compete with thousands and see your merit position instantly.
                      </p>
                      <DarkAppPromo />
                    </div>
                    
                    <div className="w-full md:w-[45%] bg-slate-800/40 rounded-2xl p-4 border border-white/10 backdrop-blur-xl shadow-lg relative">
                      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></div>
                          <span className="text-[9px] font-bold text-slate-300 tracking-widest">{subject.title} Exam</span>
                        </div>
                        <span className="text-[10px] font-bold text-rose-455 bg-rose-500/10 px-2 py-0.5 rounded">09:59</span>
                      </div>
                      <div className="space-y-3">
                        <div className="h-1.5 bg-white/15 rounded-full w-3/4"></div>
                        <div className="h-1.5 bg-white/10 rounded-full w-1/2 mb-6"></div>
                        <div className="p-3 rounded-lg border border-white/5 bg-white/5 text-[9px] font-bold text-slate-400 tracking-widest cursor-pointer hover:bg-white/10 transition-colors">A. Academic Option Alpha</div>
                        <div className="p-3 rounded-lg border border-indigo-500/50 bg-indigo-600 text-[9px] font-bold text-white tracking-widest shadow-md shadow-indigo-650/40 transform scale-[1.01] transition-transform">B. Verified Correct Answer</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </main>

          {/* RIGHT RAIL (DESKTOP) */}
          <aside className="hidden xl:block py-6 pr-6 pl-0 space-y-6">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </aside>

        </div>
      </div>
    </>
  );
}