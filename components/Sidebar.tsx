"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Search,
  FileText,
  PlayCircle,
  HelpCircle,
  PenTool,
  ChevronRight,
  LayoutGrid,
  Clock,
  BookOpen,
  GraduationCap,
  Briefcase,
  Lightbulb,
  Layers,
  Award,
  Facebook,
  Youtube,
  Smartphone,
  Download,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

// --- HELPERS ---

const getSegmentIcon = (slug: string) => {
  const s = slug.toLowerCase();
  if (s.includes("ssc")) return <BookOpen className="w-4 h-4" />;
  if (s.includes("hsc")) return <BookOpen className="w-4 h-4" />;
  if (s.includes("admission")) return <GraduationCap className="w-4 h-4" />;
  if (s.includes("job")) return <Briefcase className="w-4 h-4" />;
  if (s.includes("skill")) return <Lightbulb className="w-4 h-4" />;
  if (s.includes("master")) return <Award className="w-4 h-4" />;
  return <Layers className="w-4 h-4" />;
};

const getSegmentColor = (slug: string) => {
  const s = slug.toLowerCase();
  if (s.includes("ssc"))
    return "bg-blue-50 text-blue-650 dark:bg-blue-950/40 dark:text-blue-400 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white";
  if (s.includes("hsc"))
    return "bg-purple-50 text-purple-650 dark:bg-purple-950/40 dark:text-purple-400 group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white";
  if (s.includes("admission"))
    return "bg-emerald-50 text-emerald-650 dark:bg-emerald-950/40 dark:text-emerald-400 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white";
  if (s.includes("job"))
    return "bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-600 dark:group-hover:bg-slate-500 group-hover:text-white";
  return "bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white";
};

const getIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="w-4 h-4" />;
    case "video":
      return <PlayCircle className="w-4 h-4" />;
    case "blog":
      return <PenTool className="w-4 h-4" />;
    case "question":
      return <HelpCircle className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getIconStyle = (type: string) => {
  switch (type) {
    case "pdf":
      return "bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30";
    case "video":
      return "bg-blue-50 text-blue-500 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30";
    case "blog":
      return "bg-purple-50 text-purple-500 border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/30";
    case "question":
      return "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30";
    default:
      return "bg-gray-50 text-gray-500 border-gray-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800";
  }
};

// --- LINK GENERATION LOGIC ---
const getLink = (item: any, allSegments: any[]) => {
  const identifier = item.slug || item.id;

  if (item.type === "updates") {
    const seg = allSegments.find((s) => s.id === item.segment_id);
    const segSlug = seg?.slug || seg?.title?.toLowerCase() || "general";
    return `/resources/${segSlug}/updates/${identifier}`;
  }

  if (item.type === "blog") return `/blog/${identifier}`;
  if (item.type === "news") return `/news/${identifier}`;
  if (item.type === "question") return `/question/${identifier}`;
  if (item.type === "courses") return `/courses/${identifier}`;
  if (item.type === "ebooks") return `/ebooks/${identifier}`;

  return item.content_url || "#";
};

const getTarget = (item: any) => {
  if (["blog", "question", "news", "updates", "courses"].includes(item.type)) {
    return "_self";
  }
  return "_blank";
};

export default function Sidebar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [segments, setSegments] = useState<any[]>([]);

  const [materials, setMaterials] = useState<any[]>([]);
  const [materialFilter, setMaterialFilter] = useState("All");
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  const [questions, setQuestions] = useState<any[]>([]);
  const [questionFilter, setQuestionFilter] = useState("All");
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // 1. FETCH SEGMENTS
  useEffect(() => {
    const fetchSegments = async () => {
      const { data } = await supabase
        .from("segments")
        .select("id, title, slug")
        .order("id");
      if (data) setSegments(data);
    };
    fetchSegments();
  }, []);

  // 2. FETCH MATERIALS (Status: Approved Only)
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoadingMaterials(true);
      let query = supabase
        .from("resources")
        .select("id, title, type, content_url, slug, created_at, segment_id")
        .in("type", ["blog", "pdf", "video", "updates", "news"])
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(5);

      if (materialFilter !== "All") {
        const segId = segments.find((s) => s.title === materialFilter)?.id;
        if (segId) query = query.eq("segment_id", segId);
      }

      const { data } = await query;
      if (data) setMaterials(data);
      setLoadingMaterials(false);
    };

    if (segments.length > 0 || materialFilter === "All") fetchMaterials();
  }, [materialFilter, segments]);

  // 3. FETCH QUESTIONS (Status: Approved Only)
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      let query = supabase
        .from("resources")
        .select("id, title, type, content_url, slug, created_at, segment_id")
        .eq("type", "question")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(5);

      if (questionFilter !== "All") {
        const segId = segments.find((s) => s.title === questionFilter)?.id;
        if (segId) query = query.eq("segment_id", segId);
      }

      const { data } = await query;
      if (data) setQuestions(data);
      setLoadingQuestions(false);
    };

    if (segments.length > 0 || questionFilter === "All") fetchQuestions();
  }, [questionFilter, segments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      {/* 1. SEARCH WIDGET */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/5 dark:focus-within:ring-indigo-400/5 transition-all duration-300">
        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold placeholder:text-slate-400 outline-none border border-transparent focus:border-slate-200 dark:focus:border-slate-700/60 transition-all font-sans"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-650 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
        </form>
      </div>

      {/* 2. CHOOSE STAGE WIDGET */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-800 dark:text-slate-200">
            <LayoutGrid className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <span>Choose stage</span>
          </h3>
          <p className="mt-1 text-[11px] text-slate-450 dark:text-slate-500">
            Select your academic stage or exam category.
          </p>
        </div>

        {segments.length === 0 ? (
          <div className="px-5 py-6 text-center text-xs text-slate-400">
            Loading stages...
          </div>
        ) : (
          <div className="px-5 py-3 space-y-1">
            {segments.map((seg) => (
              <Link
                key={seg.id}
                href={`/resources/${seg.slug}`}
                className="group flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-200"
              >
                <div
                  className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl shadow-sm transition-colors duration-300 ${getSegmentColor(
                    seg.slug
                  )}`}
                >
                  {getSegmentIcon(seg.slug)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                    {seg.title}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    View resources for {seg.title}
                  </p>
                </div>

                <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-700 transition group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 duration-200" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 3. RECENT NOTES WIDGET */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-800 dark:text-slate-200">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Recent notes</span>
              </h3>
              <p className="mt-1 text-[11px] text-slate-450 dark:text-slate-500">
                Fresh files, video explanations, and articles.
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {["All", ...segments.map((s) => s.title)].map((label) => {
              const isActive = materialFilter === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setMaterialFilter(label)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-bold tracking-wide transition-all ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                      : "border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3">
          {loadingMaterials ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 w-full animate-pulse rounded-xl bg-slate-50 dark:bg-slate-850"
                />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-300">
                <FileText className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No materials found
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Try a different stage or check back later.
              </p>
            </div>
          ) : (
            <div className="px-2 py-1 space-y-1">
              {materials.map((item) => (
                <Link
                  key={item.id}
                  href={getLink(item, segments)}
                  target={getTarget(item)}
                  className="group flex items-start gap-3 rounded-xl px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-200"
                >
                  <div
                    className={`mt-0.5 flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-colors duration-300 ${getIconStyle(
                      item.type
                    )}`}
                  >
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-bold leading-snug text-slate-850 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 dark:bg-slate-850 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800/40">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(item.created_at).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" }
                        )}
                      </span>
                      {materialFilter === "All" && item.segment_id && (
                        <span className="truncate text-[9px] font-black tracking-widest uppercase text-blue-500">
                          {segments.find((s) => s.id === item.segment_id)
                            ?.title || ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-700 self-center transition group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 duration-200" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20">
          <Link
            href="/blog"
            className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-bold text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition-colors duration-200"
          >
            <span>View all notes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4. PRACTICE QUESTIONS WIDGET */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-800 dark:text-slate-200">
                <HelpCircle className="h-4 w-4 text-amber-500" />
                <span>Practice questions</span>
              </h3>
              <p className="mt-1 text-[11px] text-slate-450 dark:text-slate-500">
                Problems and quizzes from actual tests.
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {["All", ...segments.map((s) => s.title)].map((label) => {
              const isActive = questionFilter === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setQuestionFilter(label)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-bold tracking-wide transition-all ${
                    isActive
                      ? "border-amber-500 bg-amber-500 text-white shadow-sm shadow-amber-500/10"
                      : "border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3">
          {loadingQuestions ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 w-full animate-pulse rounded-xl bg-slate-50 dark:bg-slate-850"
                />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-300">
                <HelpCircle className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No questions found
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Try another segment or come back later.
              </p>
            </div>
          ) : (
            <div className="px-2 py-1 space-y-1">
              {questions.map((item) => (
                <Link
                  key={item.id}
                  href={getLink(item, segments)}
                  target={getTarget(item)}
                  className="group flex items-start gap-3 rounded-xl px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-200"
                >
                  <div className="mt-0.5 flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border border-amber-100 dark:border-amber-900/45 bg-amber-55/30 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 shadow-sm transition-colors duration-300">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-bold leading-snug text-slate-850 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-sans">
                      {item.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 dark:bg-slate-850 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800/40">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(item.created_at).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" }
                        )}
                      </span>
                      {questionFilter === "All" && item.segment_id && (
                        <span className="truncate text-[9px] font-black tracking-widest uppercase text-amber-500">
                          {segments.find((s) => s.id === item.segment_id)
                            ?.title || ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-700 self-center transition group-hover:text-amber-550 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 duration-200" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. STAY CONNECTED WIDGET */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="text-xs font-bold tracking-wider text-slate-800 dark:text-slate-200">
            Stay connected
          </h3>
          <p className="mt-1 text-[11px] text-slate-450 dark:text-slate-500">
            Follow us for tips, updates & new content.
          </p>
        </div>

        <div className="p-4 space-y-2">
          {/* Facebook */}
          <a
            href="https://www.facebook.com/profile.php?id=61584943876571"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 px-3 py-2 transition-all hover:border-[#1877F2]/30 dark:hover:border-[#1877F2]/30 hover:bg-[#1877F2]/5 dark:hover:bg-[#1877F2]/5"
          >
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-[#1877F2] text-white shadow-sm">
              <Facebook className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-850 dark:text-slate-200 group-hover:text-[#1877F2] transition-colors">
                Join Facebook community
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                Discuss questions, get tips & stay motivated.
              </p>
            </div>
          </a>

          {/* YouTube */}
          <a
            href="https://www.youtube.com/@NextprepbdYT"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 px-3 py-2 transition-all hover:border-[#FF0000]/30 dark:hover:border-[#FF0000]/30 hover:bg-[#FF0000]/5 dark:hover:bg-[#FF0000]/5"
          >
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-[#FF0000] text-white shadow-sm">
              <Youtube className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-850 dark:text-slate-200 group-hover:text-[#FF0000] transition-colors">
                Subscribe on YouTube
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                Watch video lessons, explanations & strategy.
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* 6. NEXTPREPBD APP PROMO */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50/20 via-white to-white dark:from-indigo-950/10 dark:via-slate-900 dark:to-slate-900 shadow-sm p-5 relative">
        <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-650 dark:text-indigo-400 tracking-wider mb-2">
          <Smartphone className="h-4 w-4" />
          <span>NextPrepBD app</span>
        </div>
        <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed mb-4">
          Get real-time updates, question alerts, and revision tools on the go.
        </p>
        <button
          onClick={() => toast.success("Redirecting to app store…")}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md"
        >
          <Download className="h-4 w-4" />
          <span>Download app</span>
        </button>
      </div>
    </div>
  );
}