"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Clock,
  Eye,
  MessageSquare,
  Pin,
  Search,
  ChevronRight,
  MoreVertical,
  Flag,
  Share2,
  Bookmark,
  TrendingUp,
  MessageCircle,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import ReportModal from "./ReportModal";

interface ForumListProps {
  initialThreads: ForumThread[];
  segments: Segment[];
  groups: Group[];
  subjects: Subject[];
}

interface Segment {
  id: number;
  title: string;
}

interface Group {
  id: number;
  title: string;
  segment_id: number;
}

interface Subject {
  id: number;
  title: string;
  group_id: number;
}

interface ForumThread {
  id: string;
  title: string;
  content?: string | null;
  thread_type?: string | null;
  difficulty?: string | null;
  is_pinned?: boolean | null;
  upvotes?: number | null;
  views?: number | null;
  created_at: string;
  segment_id?: number | null;
  author?: {
    full_name?: string | null;
    gamification_rank?: string | null;
  } | null;
  segment?: {
    title?: string | null;
  } | null;
  group?: {
    title?: string | null;
  } | null;
  subject?: {
    title?: string | null;
  } | null;
  forum_comments?: { id: string | number }[] | null;
}

const threadTypes = [
  { type: "standard", label: "Discussions" },
  { type: "question_post", label: "Practice questions" },
  { type: "study_strategy", label: "Study advice" },
  { type: "reading_comprehension", label: "Reading practice" },
];

export default function ForumList({
  initialThreads,
  segments,
  groups,
  subjects,
}: ForumListProps) {
  const [threads] = useState<ForumThread[]>(initialThreads);
  const [search, setSearch] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("All");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  
  // Modal states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState("");

  const filteredThreads = useMemo(() => {
    let result = threads;

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (thread) =>
          thread.title?.toLowerCase().includes(query) ||
          thread.content?.toLowerCase().includes(query)
      );
    }

    if (selectedSegment !== "All") {
      result = result.filter((thread) => thread.segment?.title === selectedSegment);
    }

    if (selectedGroup !== "All") {
      result = result.filter((thread) => thread.group?.title === selectedGroup);
    }

    if (selectedSubject !== "All") {
      result = result.filter((thread) => thread.subject?.title === selectedSubject);
    }

    if (selectedType !== "All") {
      result = result.filter((thread) => thread.thread_type === selectedType);
    }

    if (selectedDifficulty !== "All") {
      result = result.filter(
        (thread) => thread.difficulty === selectedDifficulty.toLowerCase()
      );
    }

    return result;
  }, [
    search,
    selectedDifficulty,
    selectedGroup,
    selectedSegment,
    selectedSubject,
    selectedType,
    threads,
  ]);

  const activeSegment = segments.find((segment) => segment.title === selectedSegment);
  const filteredGroups = activeSegment
    ? groups.filter((group) => group.segment_id === activeSegment.id)
    : [];

  const handleReset = () => {
    setSearch("");
    setSelectedSegment("All");
    setSelectedGroup("All");
    setSelectedSubject("All");
    setSelectedType("All");
    setSelectedDifficulty("All");
  };

  const openReportModal = (threadId: string) => {
    setReportTargetId(threadId);
    setReportModalOpen(true);
  };

  const getThreadTypeBadge = (type?: string | null) => {
    switch (type) {
      case "question_post":
        return {
          label: "Practice question",
          className: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
        };
      case "reading_comprehension":
        return {
          label: "Reading practice",
          className: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        };
      case "study_strategy":
        return {
          label: "Study advice",
          className: "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
        };
      default:
        return {
          label: "Discussion",
          className: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        };
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      if (hours === 0) return "Just now";
      return `${hours}h ago`;
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const renderThreadListItem = (thread: ForumThread) => {
    const badge = getThreadTypeBadge(thread.thread_type);
    const commentsCount = thread.forum_comments?.length || 0;

    return (
      <div
        key={thread.id}
        className={`group relative flex flex-col gap-0 rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50 sm:flex-row ${
          thread.is_pinned ? "border-l-4 border-l-amber-500" : ""
        }`}
      >
        {/* Pinned bar if applicable */}
        {thread.is_pinned && (
          <div className="absolute top-0 left-0 right-0 flex items-center gap-1.5 rounded-t-xl bg-amber-50 border-b border-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-500 sm:relative sm:w-full">
            <Pin className="h-3 w-3 fill-current" />
            Pinned by moderator
          </div>
        )}

        <div className={`flex w-full flex-col sm:flex-row ${thread.is_pinned ? "sm:mt-0" : ""}`}>
          {/* Vote Column */}
          <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 p-3 dark:border-slate-800 sm:flex-col sm:border-b-0 sm:border-r sm:p-4">
            <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors">
              <ArrowUp className="h-4 w-4" />
            </button>
            <span className="min-w-[24px] text-center font-semibold text-slate-900 dark:text-slate-100 font-sans">
              {thread.upvotes || 0}
            </span>
            <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:border-red-500 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-red-500/50 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors">
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>

          {/* Thread Body */}
          <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
            {/* Meta Tags / Hierarchy */}
            <div className="mb-2.5 flex flex-wrap items-center gap-y-1.5">
              {thread.segment?.title && (
                <div className="flex items-center">
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {thread.segment.title}
                  </span>
                  {thread.group?.title && (
                    <>
                      <ChevronRight className="mx-1 h-3 w-3 text-slate-400" />
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                        {thread.group.title}
                      </span>
                    </>
                  )}
                  {thread.subject?.title && (
                    <>
                      <ChevronRight className="mx-1 h-3 w-3 text-slate-400" />
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                        {thread.subject.title}
                      </span>
                    </>
                  )}
                </div>
              )}
              
              <span className={`ml-2 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
                {badge.label}
              </span>
            </div>

            {/* Title */}
            <Link href={`/forum/thread/${thread.id}`} className="mb-2 block">
              <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 sm:text-lg">
                {thread.title}
              </h3>
            </Link>

            {/* Excerpt */}
            {thread.content && (
              <p className="mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {thread.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
              </p>
            )}

            {/* Footer / Meta */}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-3 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    {getInitials(thread.author?.full_name)}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {thread.author?.full_name || "Anonymous"}
                  </span>
                  {thread.author?.gamification_rank && (
                    <span className="rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-400">
                      ⭐ {thread.author.gamification_rank}
                    </span>
                  )}
                </div>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(thread.created_at)}
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs font-semibold">{commentsCount} replies</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span className="text-xs font-semibold">{thread.views || 0}</span>
                </div>
                
                {/* Actions Dropdown / Icons */}
                <div className="flex items-center gap-1 ml-2">
                  <button className="rounded p-1.5 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors" title="Bookmark">
                    <Bookmark className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => openReportModal(thread.id)}
                    className="rounded p-1.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors" title="Report"
                  >
                    <Flag className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <ReportModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
        targetId={reportTargetId} 
        targetType="thread" 
      />
      
      <div className="mx-auto max-w-[1440px] px-3 py-6 sm:px-4 md:px-6 md:py-8 font-sans">
        
        {/* Main 3-Column Grid */}
        <div className="flex flex-col items-start gap-5 lg:flex-row lg:gap-6 xl:gap-8">
          
          {/* LEFT SIDEBAR */}
          <aside className="sticky top-24 hidden w-[248px] shrink-0 flex-col gap-4 lg:flex">
            
            {/* Segments Card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Segments</h3>
                {selectedSegment !== "All" && (
                  <button onClick={() => setSelectedSegment("All")} className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">All</button>
                )}
              </div>
              <div className="py-1.5">
                {segments.map((seg) => (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedSegment(seg.title)}
                    className={`flex w-full items-center justify-between border-l-2 px-4 py-2.5 text-left transition-colors ${
                      selectedSegment === seg.title
                        ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-900/20"
                        : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span className={`text-sm font-medium ${selectedSegment === seg.title ? "text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"}`}>
                      {seg.title}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      selectedSegment === seg.title 
                        ? "bg-indigo-600 text-white dark:bg-indigo-500" 
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      {threads.filter(t => t.segment_id === seg.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Groups Card */}
            {selectedSegment !== "All" && filteredGroups.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Groups</h3>
                </div>
                <div className="py-1.5">
                  <button
                    onClick={() => setSelectedGroup("All")}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors ${
                      selectedGroup === "All" ? "font-semibold text-indigo-600 dark:text-indigo-400" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                    }`}
                  >
                    <div className={`h-1.5 w-1.5 rounded-full ${selectedGroup === "All" ? "bg-indigo-600 dark:bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                    All Groups
                  </button>
                  {filteredGroups.map((grp) => (
                    <button
                      key={grp.id}
                      onClick={() => setSelectedGroup(grp.title)}
                      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors ${
                        selectedGroup === grp.title ? "font-semibold text-indigo-600 dark:text-indigo-400" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                      }`}
                    >
                      <div className={`h-1.5 w-1.5 rounded-full ${selectedGroup === grp.title ? "bg-indigo-600 dark:bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                      {grp.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filters Card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Difficulty</h3>
                <div className="flex flex-wrap gap-2">
                  {["All", "Easy", "Medium", "Hard"].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                        selectedDifficulty === diff 
                          ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500" 
                          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-900/30"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mx-4 h-px bg-slate-100 dark:bg-slate-800" />
              <div className="p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Thread Type</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedType("All")}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                      selectedType === "All" ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    All
                  </button>
                  {threadTypes.map(type => (
                    <button
                      key={type.type}
                      onClick={() => setSelectedType(type.type)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                        selectedType === type.type 
                          ? "border-indigo-600 bg-indigo-600 text-white" 
                          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-900/30"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Community Stats</h3>
              </div>
              <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800">
                <div className="bg-white p-4 text-center dark:bg-slate-900">
                  <div className="font-sans text-xl font-bold text-indigo-600 dark:text-indigo-400">{threads.length}</div>
                  <div className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">Threads</div>
                </div>
                <div className="bg-white p-4 text-center dark:bg-slate-900">
                  <div className="font-sans text-xl font-bold text-amber-500">2.4k</div>
                  <div className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">Members</div>
                </div>
              </div>
            </div>

          </aside>

          {/* MAIN FEED */}
          <main className="min-w-0 flex-1 w-full flex flex-col gap-4">
            
            {/* Controls Bar */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-500"
                />
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button className="whitespace-nowrap rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400">
                  Hot
                </button>
                <button className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                  Latest
                </button>
                <button className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                  Unanswered
                </button>
              </div>
            </div>

            {/* Mobile Filters Toggle (visible only on mobile) */}
            <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
              <button className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Segments: {selectedSegment}
              </button>
              <button className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Difficulty: {selectedDifficulty}
              </button>
              <button className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Type: {selectedType === "All" ? "All" : threadTypes.find(t => t.type === selectedType)?.label}
              </button>
            </div>

            {/* Thread List */}
            {filteredThreads.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filteredThreads.map((thread) => renderThreadListItem(thread))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-24 text-center dark:border-slate-700 dark:bg-slate-900">
                <AlertCircle className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">No discussions found</h3>
                <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  onClick={handleReset}
                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>

          {/* RIGHT SIDEBAR (Desktop only) */}
          <aside className="sticky top-24 hidden w-[268px] shrink-0 flex-col gap-4 xl:flex">
            
            {/* Leaderboard Card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Top Contributors</h3>
              </div>
              <div className="flex flex-col py-2">
                {[
                  { name: "Sakib Rahman", pts: 4850, rank: 1, color: "text-amber-500" },
                  { name: "Aisha Khan", pts: 3920, rank: 2, color: "text-slate-400" },
                  { name: "Fahim Faysal", pts: 3105, rank: 3, color: "text-amber-700" },
                  { name: "Tariq Hasan", pts: 2840, rank: 4, color: "text-slate-500 dark:text-slate-400" },
                  { name: "Nusrat Jahan", pts: 2150, rank: 5, color: "text-slate-500 dark:text-slate-400" },
                ].map((user) => (
                  <div key={user.rank} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                    <span className={`w-5 text-center text-sm font-bold ${user.color}`}>{user.rank}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {getInitials(user.name)}
                    </div>
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Expert</span>
                    </div>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{user.pts}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Tags */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Trending Topics</h3>
              </div>
              <div className="flex flex-wrap gap-2 p-4">
                {["Physics 1st Paper", "Calculus", "IELTS Reading", "DU Admission", "Grammar", "Organic Chemistry"].map(tag => (
                  <span key={tag} className="cursor-pointer rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-900/30">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
      
      {/* Mobile FAB */}
      <button className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all md:hidden">
        <MessageSquare className="h-6 w-6" />
      </button>

    </>
  );
}
