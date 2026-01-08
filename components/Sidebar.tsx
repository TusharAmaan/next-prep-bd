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
} from "lucide-react";

// --- HELPERS ---

const getSegmentIcon = (slug: string) => {
  const s = slug.toLowerCase();
  if (s.includes("ssc")) return <BookOpen className="w-5 h-5" />;
  if (s.includes("hsc")) return <BookOpen className="w-5 h-5" />;
  if (s.includes("admission")) return <GraduationCap className="w-5 h-5" />;
  if (s.includes("job")) return <Briefcase className="w-5 h-5" />;
  if (s.includes("skill")) return <Lightbulb className="w-5 h-5" />;
  if (s.includes("master")) return <Award className="w-5 h-5" />;
  return <Layers className="w-5 h-5" />;
};

const getSegmentColor = (slug: string) => {
  const s = slug.toLowerCase();
  if (s.includes("ssc"))
    return "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white";
  if (s.includes("hsc"))
    return "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white";
  if (s.includes("admission"))
    return "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white";
  if (s.includes("job"))
    return "bg-slate-100 text-slate-600 group-hover:bg-slate-600 group-hover:text-white";
  return "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white";
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
      return "bg-red-50 text-red-500 border-red-100";
    case "video":
      return "bg-blue-50 text-blue-500 border-blue-100";
    case "blog":
      return "bg-purple-50 text-purple-500 border-purple-100";
    case "question":
      return "bg-amber-50 text-amber-600 border-amber-100";
    default:
      return "bg-gray-50 text-gray-500 border-gray-100";
  }
};

// --- [FIXED] LINK GENERATION LOGIC ---
const getLink = (item: any, allSegments: any[]) => {
  // CRITICAL FIX: Use slug if available, otherwise fallback to ID.
  // NEVER use content_url (which is the image/file link) as the identifier path.
  const identifier = item.slug || item.id;

  // 1. Complex Updates URL: /resources/[segment]/updates/[slug-or-id]
  if (item.type === "updates") {
    const seg = allSegments.find((s) => s.id === item.segment_id);
    const segSlug = seg?.slug || seg?.title?.toLowerCase() || "general";
    return `/resources/${segSlug}/updates/${identifier}`;
  }

  // 2. Standard Internal Types
  if (item.type === "blog") return `/blog/${identifier}`;
  if (item.type === "news") return `/news/${identifier}`;
  if (item.type === "question") return `/question/${identifier}`;
  if (item.type === "courses") return `/courses/${identifier}`;
  if (item.type === "ebooks") return `/ebooks/${identifier}`;

  // 3. External/Direct Links (PDFs, Videos hosted elsewhere)
  // Only use content_url if it's strictly a file download or external link
  return item.content_url || "#";
};

const getTarget = (item: any) => {
  // Internal navigation uses _self
  if (["blog", "question", "news", "updates", "courses"].includes(item.type)) {
    return "_self";
  }
  // PDFs and External Videos open in new tab
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

  // 2. FETCH MATERIALS
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoadingMaterials(true);
      let query = supabase
        .from("resources")
        .select("id, title, type, content_url, slug, created_at, segment_id") // Added slug here
        // Added 'updates' and 'news' to the filter list so they appear in sidebar
        .in("type", ["blog", "pdf", "video", "updates", "news"]) 
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

  // 3. FETCH QUESTIONS
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      let query = supabase
        .from("resources")
        .select("id, title, type, content_url, slug, created_at, segment_id") // Added slug here
        .eq("type", "question")
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

  // --- UI ---

  return (
    <div className="space-y-6">
      {/* 1. SEARCH WIDGET */}
      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            placeholder="Search resources, blog, questions..."
            className="w-full bg-slate-50 text-slate-900 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold placeholder:text-slate-400 outline-none transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Search className="w-5 h-5" />
          </div>
        </form>
      </div>

      {/* 2. EXPLORE SECTIONS */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 px-4 py-3.5">
          <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700">
            <LayoutGrid className="h-4 w-4 text-indigo-500" />
            Explore Segments
          </h3>
          <p className="mt-1 text-[11px] text-slate-500">
            Jump directly into the resources you care about.
          </p>
        </div>

        {segments.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-slate-400">
            Loading sections...
          </div>
        ) : (
          <div className="px-3 py-2 md:py-3">
            <div className="flex flex-col gap-1.5">
              {segments.map((seg) => (
                <Link
                  key={seg.id}
                  href={`/resources/${seg.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white/80 px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-[1px] hover:border-indigo-200 hover:bg-indigo-50/60 hover:shadow-md"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${getSegmentColor(
                      seg.slug
                    )}`}
                  >
                    {getSegmentIcon(seg.slug)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                      {seg.title}
                    </p>
                    <p className="mt-0.5 hidden text-[11px] text-slate-400 md:block">
                      View resources for {seg.title}
                    </p>
                  </div>

                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-indigo-500" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. LATEST MATERIALS */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-4 pt-3.5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700">
                <FileText className="h-4 w-4 text-blue-500" />
                Latest Materials
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                Fresh PDFs, videos & blogs for your study.
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-blue-500 shadow-sm">
              <FileText className="h-4 w-4" />
            </div>
          </div>

          {/* Pill filter */}
          <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
            {["All", ...segments.map((s) => s.title)].map((label) => {
              const isActive = materialFilter === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setMaterialFilter(label)}
                  className={[
                    "whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                    isActive
                      ? "border-blue-500 bg-blue-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-blue-50/60",
                  ].join(" ")}
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
                  className="h-12 w-full animate-pulse rounded-xl bg-slate-50"
                />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                <FileText className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-600">
                No materials found
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Try a different segment or check back later.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {materials.map((item) => (
                <Link
                  key={item.id}
                  /* UPDATED: Pass segments to getLink for dynamic routing */
                  href={getLink(item, segments)}
                  target={getTarget(item)}
                  className="group relative flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50/80"
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-sm ${getIconStyle(
                      item.type
                    )}`}
                  >
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-semibold leading-snug text-slate-800 group-hover:text-blue-600">
                      {item.title}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(item.created_at).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" }
                        )}
                      </span>
                      {materialFilter === "All" && item.segment_id && (
                        <span className="truncate text-[9px] font-black uppercase tracking-wide text-blue-500">
                          {segments.find((s) => s.id === item.segment_id)
                            ?.title || ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-3.5 w-3.5 text-slate-300 transition group-hover:text-blue-400" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/60">
          <Link
            href="/blog"
            className="block px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
          >
            View All Materials
          </Link>
        </div>
      </div>

      {/* 4. QUESTION ARCHIVE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-amber-50/60 px-4 pt-3.5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700">
                <HelpCircle className="h-4 w-4 text-amber-500" />
                Recent Questions
              </h3>
              <p className="mt-1 text-[11px] text-slate-600">
                Practice problems & past questions by segment.
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm">
              <HelpCircle className="h-4 w-4" />
            </div>
          </div>

          {/* Pill filter */}
          <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
            {["All", ...segments.map((s) => s.title)].map((label) => {
              const isActive = questionFilter === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setQuestionFilter(label)}
                  className={[
                    "whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                    isActive
                      ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                      : "border-amber-100 bg-amber-50/70 text-amber-700 hover:border-amber-300 hover:bg-amber-100",
                  ].join(" ")}
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
                  className="h-12 w-full animate-pulse rounded-xl bg-amber-50/60"
                />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-300">
                <HelpCircle className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                No questions found
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Try another segment or come back later.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {questions.map((item) => (
                <Link
                  key={item.id}
                  /* UPDATED: Pass segments here too */
                  href={getLink(item, segments)}
                  target={getTarget(item)}
                  className="group relative flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-amber-50/60"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600 shadow-sm">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-semibold leading-snug text-slate-800 group-hover:text-amber-700">
                      {item.title}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(item.created_at).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" }
                        )}
                      </span>
                      {questionFilter === "All" && item.segment_id && (
                        <span className="truncate text-[9px] font-black uppercase tracking-wide text-amber-700">
                          {segments.find((s) => s.id === item.segment_id)
                            ?.title || ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-3.5 w-3.5 text-amber-300 transition group-hover:text-amber-600" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. SOCIAL MEDIA */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3.5">
          <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-700">
            Stay Connected
          </h3>
          <p className="mt-1 text-[11px] text-slate-500">
            Follow us for tips, updates & new content.
          </p>
        </div>

        <div className="p-3 space-y-2.5">
          {/* Facebook */}
          <a
            href="https://facebook.com/gmatclub"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-gradient-to-r from-[#1877F2]/5 via-white to-white px-3 py-2.5 transition-all hover:-translate-y-[1px] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1877F2] text-white shadow-sm">
              <Facebook className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900">
                Join our Facebook community
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 group-hover:text-slate-600">
                Discuss questions, get tips & stay motivated.
              </p>
            </div>
          </a>

          {/* YouTube */}
          <a
            href="https://youtube.com/c/gmatclub"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-gradient-to-r from-[#FF0000]/5 via-white to-white px-3 py-2.5 transition-all hover:-translate-y-[1px] hover:border-[#FF0000]/40 hover:bg-[#FF0000]/5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF0000] text-white shadow-sm">
              <Youtube className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900">
                Subscribe on YouTube
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 group-hover:text-slate-600">
                Watch video lessons, explanations & strategy.
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}