import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import LeftSidebar from "@/components/LeftSidebar";
import ResourceFilterView from "@/components/ResourceFilterView";
import QuickUpdatesSection from "@/components/QuickUpdatesSection";
import QuestionBankSection from "@/components/QuestionBankSection";
import Image from "next/image";
import {
    ChevronRight, ArrowLeft, Clock,
    CalendarDays, BookOpen, Trophy, Sparkles, ArrowRight,
    PenTool, FileText, PlayCircle, FolderOpen, FolderClosed, Star, Smartphone, Download, Tag, HelpCircle, Zap,
    Layers, Bell, Calendar, User
} from "lucide-react";
import BookmarkButton from "@/components/shared/BookmarkButton";
import { Metadata } from 'next';
import { getBreadcrumbSchema } from "@/lib/seo-utils";
import AnimatedCounter from "@/components/AnimatedCounter";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }: {
    params: Promise<{ segment_slug: string; group_slug: string }>;
    searchParams: Promise<{ type?: string; category?: string }>;
}): Promise<Metadata> {
    const { segment_slug, group_slug } = await params;
    const { type, category } = await searchParams;

    const { data: segment } = await supabase.from("segments").select("id, title").eq("slug", segment_slug).single();
    if (!segment) return { title: "Not Found" };

    const { data: group } = await supabase.from("groups").select("title").eq("slug", group_slug).eq("segment_id", segment.id).single();
    if (!group) return { title: segment.title };
 
    let title = `${group.title} Resources (${segment.title})`;
    if (type === 'pdf') title = `${group.title} Study Materials`;
    if (type === 'video') title = `${group.title} Video Classes`;
    if (type === 'question') title = `${group.title} Question Bank`;
    if (type === 'update') title = `${group.title} Latest Updates`;

    if (category) title = `${category} - ${title}`;

    return {
        title,
        description: `Access verified ${title} for NextPrepBD. Download notes, suggestions, and question banks tailored for ${group.title} success.`,
        alternates: {
            canonical: `/resources/${segment_slug}/${group_slug}${type ? `?type=${type}` : ''}${category ? `&category=${category}` : ''}`,
        },
    };
}

export default async function GroupPage({
    params,
    searchParams
}: {
    params: Promise<{ segment_slug: string; group_slug: string }>,
    searchParams: Promise<{ type?: string; category?: string }>
}) {
    const { segment_slug, group_slug } = await params;
    const { type, category } = await searchParams;

    const { data: segmentData } = await supabase.from("segments").select("*").eq("slug", segment_slug).single();
    if (!segmentData) return notFound();

    const { data: groupData } = await supabase.from("groups").select("*").eq("slug", group_slug).eq("segment_id", segmentData.id).single();
    if (!groupData) return notFound();

    const { data: allSegments } = await supabase.from("segments").select("id, title, slug").order("id");

    // Breadcrumbs Schema
    const breadcrumbItems = [
        { name: "Home", item: "https://nextprepbd.com" },
        { name: "Resources", item: "https://nextprepbd.com/resources" },
        { name: segmentData.title, item: `https://nextprepbd.com/resources/${segment_slug}` },
        { name: groupData.title, item: `https://nextprepbd.com/resources/${segment_slug}/${group_slug}` }
    ];
    if (type) {
        breadcrumbItems.push({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            item: `https://nextprepbd.com/resources/${segment_slug}/${group_slug}?type=${type}`
        });
    }

    const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

    // Helper Config
    const getPageTitle = () => {
        if (type === 'pdf') return 'Study Materials';
        if (type === 'video') return 'Video Classes';
        if (type === 'update') return 'Group Updates';
        if (type === 'question') return 'Question Bank';
        return 'Resources';
    };

    const getGradient = (index: number) => {
        const gradients = ["from-blue-600 to-indigo-600", "from-emerald-500 to-teal-600", "from-purple-600 to-violet-600", "from-orange-500 to-red-500"];
        return gradients[index % gradients.length];
    };

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
                .eq("group_id", groupData.id)
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
                                    <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black text-indigo-400 tracking-widest mb-4 md:mb-6 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 w-fit">
                                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                                        <ChevronRight className="w-3 h-3" />
                                        <Link href={`/resources/${segment_slug}`} className="hover:text-white transition-colors">{segmentData.title}</Link>
                                        <ChevronRight className="w-3 h-3" />
                                        <span className="text-white">{getPageTitle()}</span>
                                    </div>
                                    <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-none mb-4">
                                        {groupData.title} <br className="hidden md:block" />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">{getPageTitle()}</span>
                                    </h1>
                                </div>
                                <Link
                                    href={`/resources/${segment_slug}/${group_slug}`}
                                    className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black tracking-[0.2em] transition-all backdrop-blur-xl flex items-center gap-3 group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Back to Group
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
            </>
        );
    }

    // =========================================================
    //  B. DASHBOARD VIEW MODE
    // =========================================================

    const [
        { data: subjects },
        { data: blogs },
        { data: materials },
        { data: questions },
        { data: questionCats },
        { data: updates },
        { count: questionsCount },
        { count: materialsCount }
    ] = await Promise.all([
        supabase.from("subjects").select("*").eq("group_id", groupData.id).order("id"),
        supabase.from("resources").select("*, subjects(title), groups(title), profiles(full_name)").eq("group_id", groupData.id).eq("type", "blog").eq("status", "approved").order("created_at", { ascending: false }).limit(4),
        supabase.from("resources").select("*, subjects(title)").eq("group_id", groupData.id).in("type", ["pdf", "video"]).eq("status", "approved").order("created_at", { ascending: false }).limit(5),
        supabase.from("resources").select("*, subjects(title)").eq("group_id", groupData.id).eq("type", "question").eq("status", "approved").order("created_at", { ascending: false }).limit(15),
        supabase.from("resources").select("category").eq("group_id", groupData.id).eq("type", "question").eq("status", "approved"),
        supabase.from("segment_updates").select("id, title, type, created_at, attachment_url").eq("segment_id", segmentData.id).order("created_at", { ascending: false }).limit(15),
        supabase.from("resources").select("*", { count: 'exact', head: true }).eq("group_id", groupData.id).eq("type", "question").eq("status", "approved"),
        supabase.from("resources").select("*", { count: 'exact', head: true }).eq("group_id", groupData.id).in("type", ["pdf", "video"]).eq("status", "approved")
    ]);

    const availableCategories = Array.from(new Set(questionCats?.map(q => q.category).filter(Boolean)));

    const getQuestionTag = (q: any) => {
        return Array.isArray(q.subjects) ? q.subjects[0]?.title : (q.subjects?.title || q.category || "General");
    };

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

    const getSegmentSubBadgeText = (segTitle: string, grpTitle: string) => {
        const t = segTitle.toUpperCase();
        let base = '';
        if (t === 'SSC') base = 'Bangladesh secondary certificate';
        else if (t === 'HSC') base = 'Bangladesh higher secondary certificate';
        else base = `Bangladesh ${segTitle.toLowerCase()} certificate`;
        return `${base} — ${grpTitle.toLowerCase()}`;
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
                    <LeftSidebar activeSegment={segment_slug} activeGroup={group_slug} />

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
                                <span className="text-slate-655 dark:text-slate-300 font-semibold">{groupData.title}</span>
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
                                        <span>{getSegmentSubBadgeText(segmentData.title, groupData.title)}</span>
                                    </div>

                                    {/* Title */}
                                    <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                                        {groupData.title} <span className={`italic font-normal ${theme.text}`}>Library</span> Hub
                                    </h1>

                                    {/* Description */}
                                    <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
                                        Focused resources, subject-specific materials, and academic archives for {groupData.title} students under {segmentData.title}.
                                    </p>

                                    {/* Stats Row */}
                                    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
                                        <div className="text-left">
                                            <div className={`text-xl md:text-2xl font-extrabold ${theme.text}`}>
                                                <AnimatedCounter value={subjects?.length || 0} />
                                            </div>
                                            <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Subjects</div>
                                        </div>
                                        <div className="text-left">
                                            <div className={`text-xl md:text-2xl font-extrabold ${theme.text}`}>
                                                <AnimatedCounter value={questionsCount || 0} />
                                            </div>
                                            <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Board papers</div>
                                        </div>
                                        <div className="text-left">
                                            <div className={`text-xl md:text-2xl font-extrabold ${theme.text}`}>
                                                <AnimatedCounter value={materialsCount || 0} />
                                            </div>
                                            <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lecture guides</div>
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

                            {/* ACADEMIC SUBJECTS */}
                            {subjects && subjects.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Academic Subjects</h2>
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500">Access focused study material libraries per subject</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 mb-8">
                                        {subjects.map((sub: any) => (
                                            <Link
                                                key={sub.id}
                                                href={`/resources/${segment_slug}/${group_slug}/${sub.slug}`}
                                                className="group bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/10 p-[18px] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500 dark:hover:border-indigo-400 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between min-h-[160px] relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-indigo-50/5 dark:to-indigo-500/10 pointer-events-none" />
                                                
                                                <div className="flex flex-col gap-3 relative z-10">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                                                        <BookOpen className="w-5 h-5" />
                                                    </div>
                                                    <div className="pr-6">
                                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{sub.title}</h3>
                                                        <p className="text-[11.5px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-1 font-semibold">
                                                            <FolderClosed className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500/60 transition-colors" />
                                                            <span>Subject vault</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="w-[26px] h-[26px] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-650 group-hover:text-white flex items-center justify-center transition-all text-[11px] self-end mt-2 ml-auto relative z-10 group-hover:translate-x-0.5 duration-300">
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* QUICK UPDATES */}
                            <QuickUpdatesSection updates={updates || []} segmentSlug={segment_slug} />

                            {/* QUESTION BANK */}
                            <QuestionBankSection
                                questions={questions || []}
                                segmentSlug={segment_slug}
                                browseAllHref={`/resources/${segment_slug}/${group_slug}?type=question`}
                                subtitle={`Board questions and school exams for ${groupData.title}`}
                            />

                            {/* STUDY VAULT */}
                            <section>
                                <div className="flex items-center justify-between mb-6 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-lg">
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Study Vault</h2>
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500">PDF notes, slides, and class sheets</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/resources/${segment_slug}/${group_slug}?type=pdf`}
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
                                                             {getSubjectName(item)}
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

                            {/* EXPERT INSIGHTS */}
                            <section>
                                <div className="flex items-center justify-between mb-6 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Scholarly Guides</h2>
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500">Mentorship guides and preparation tips for {groupData.title}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/blog?segment=${segment_slug}&group=${group_slug}`}
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
                                                className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-indigo-550 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-full"
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