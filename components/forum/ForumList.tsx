"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  Eye,
  Filter,
  MessageSquare,
  Pin,
  Search,
  ThumbsUp,
} from "lucide-react";
import MathRenderer from "../shared/MathRenderer";

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

  const activeGroup = groups.find((group) => group.title === selectedGroup);
  const filteredSubjects = activeGroup
    ? subjects.filter((subject) => subject.group_id === activeGroup.id)
    : [];

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedSegment !== "All" ||
    selectedGroup !== "All" ||
    selectedSubject !== "All" ||
    selectedType !== "All" ||
    selectedDifficulty !== "All";

  const handleReset = () => {
    setSearch("");
    setSelectedSegment("All");
    setSelectedGroup("All");
    setSelectedSubject("All");
    setSelectedType("All");
    setSelectedDifficulty("All");
  };

  const getThreadTypeBadge = (type: string) => {
    switch (type) {
      case "question_post":
        return {
          label: "Practice question",
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/60",
        };
      case "reading_comprehension":
        return {
          label: "Reading practice",
          className:
            "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900/60",
        };
      case "study_strategy":
        return {
          label: "Study advice",
          className:
            "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/60",
        };
      default:
        return {
          label: "Discussion",
          className:
            "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        };
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900/60";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/60";
      case "hard":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/60";
      default:
        return null;
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getTrail = (thread: ForumThread) =>
    [thread.segment?.title, thread.group?.title, thread.subject?.title]
      .filter(Boolean)
      .join(" > ");

  const renderThreadListItem = (thread: ForumThread, isLast: boolean) => {
    const badge = getThreadTypeBadge(thread.thread_type);
    const difficultyClass = getDifficultyBadge(thread.difficulty);
    const commentsCount = thread.forum_comments?.length || 0;

    return (
      <div
        key={thread.id}
        className={`group flex flex-col gap-4 p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 md:flex-row md:items-center md:justify-between md:p-5 ${
          !isLast ? "border-b border-slate-100 dark:border-slate-800" : ""
        }`}
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {thread.is_pinned && (
              <span className="inline-flex items-center gap-1 rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
                <Pin className="h-3 w-3 fill-current" />
                Pinned
              </span>
            )}

            <span
              className={`rounded-md border px-2 py-1 text-xs font-medium ${badge.className}`}
            >
              {badge.label}
            </span>

            {difficultyClass && (
              <span
                className={`rounded-md border px-2 py-1 text-xs font-medium ${difficultyClass}`}
              >
                {thread.difficulty
                  ? thread.difficulty.charAt(0).toUpperCase() + thread.difficulty.slice(1)
                  : ""}
              </span>
            )}

            {getTrail(thread) && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 md:text-sm">
                {getTrail(thread)}
              </span>
            )}
          </div>

          <Link href={`/forum/thread/${thread.id}`}>
            <h4 className="line-clamp-2 text-base font-semibold leading-snug text-slate-850 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 md:text-lg">
              {thread.title}
            </h4>
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-650 dark:text-slate-350">
              {thread.author?.full_name || "Community member"}
            </span>
            <span aria-hidden="true">.</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(thread.created_at)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 border-t border-slate-100 pt-3 dark:border-slate-800 md:border-t-0 md:pt-0">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1" title="Upvotes">
              <ThumbsUp className="h-4 w-4" />
              <span className="text-sm font-medium">{thread.upvotes || 0}</span>
            </div>

            <div className="flex items-center gap-1" title="Replies">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">{commentsCount}</span>
            </div>

            <div className="flex items-center gap-1" title="Views">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">{thread.views || 0}</span>
            </div>
          </div>

          <Link
            href={`/forum/thread/${thread.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-650 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400"
            aria-label={`Open ${thread.title}`}
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  };

  const renderThreadGroup = (groupThreads: ForumThread[]) => (
    <div className="flex flex-col gap-5">
      {threadTypes.map((type) => {
        const typeThreads = groupThreads
          .filter((thread) => thread.thread_type === type.type)
          .slice(0, 5);

        return (
          <div key={type.type} className="space-y-3">
            <h3 className="border-l-2 border-indigo-500 pl-2 text-sm font-semibold text-slate-650 dark:text-slate-300">
              {type.label}
            </h3>
            {typeThreads.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                {typeThreads.map((thread, index) =>
                  renderThreadListItem(thread, index === typeThreads.length - 1)
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-400">
                Nothing here yet.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full px-3 py-8 font-sans sm:px-4 md:px-6 md:py-10">
      <div className="flex flex-col gap-5 lg:gap-6 xl:flex-row">
        <aside className="w-full shrink-0 xl:w-80">
          <div className="space-y-4 xl:sticky xl:top-24">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
              <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-850 dark:text-slate-100">
                  <Filter className="h-4 w-4 text-indigo-500" />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleReset}
                    className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-350">
                    Search discussions
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by title or topic"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-850 outline-none transition-all focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-350">
                    Segment
                  </label>
                  <select
                    value={selectedSegment}
                    onChange={(event) => {
                      setSelectedSegment(event.target.value);
                      setSelectedGroup("All");
                      setSelectedSubject("All");
                    }}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="All">All segments</option>
                    {segments.map((segment) => (
                      <option key={segment.id} value={segment.title}>
                        {segment.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSegment !== "All" && filteredGroups.length > 0 && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-350">
                      Group
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(event) => {
                        setSelectedGroup(event.target.value);
                        setSelectedSubject("All");
                      }}
                      className="w-full rounded-md border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="All">All groups</option>
                      {filteredGroups.map((group) => (
                        <option key={group.id} value={group.title}>
                          {group.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedGroup !== "All" && filteredSubjects.length > 0 && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-350">
                      Subject
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(event) => setSelectedSubject(event.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="All">All subjects</option>
                      {filteredSubjects.map((subject) => (
                        <option key={subject.id} value={subject.title}>
                          {subject.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-350">
                    Post type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(event) => setSelectedType(event.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="All">All posts</option>
                    <option value="standard">Discussion</option>
                    <option value="question_post">Practice question</option>
                    <option value="study_strategy">Study advice</option>
                    <option value="reading_comprehension">Reading practice</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-350">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(event) => setSelectedDifficulty(event.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="All">All levels</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-850 dark:text-slate-100">
                Community snapshot
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Discussions
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                    {threads.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Members
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                    340+
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between md:px-5">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-350">
                {filteredThreads.length} discussion
                {filteredThreads.length !== 1 ? "s" : ""} found
              </span>
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Newest first
            </span>
          </div>

          {hasActiveFilters ? (
            filteredThreads.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {filteredThreads.map((thread, index) =>
                  renderThreadListItem(thread, index === filteredThreads.length - 1)
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 py-20 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-700" />
                <h3 className="mb-2 text-xl font-semibold text-slate-850 dark:text-slate-100">
                  No discussions found
                </h3>
                <p className="mx-auto mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  Try a broader search or remove one of the filters.
                </p>
                <button
                  onClick={handleReset}
                  className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                >
                  Reset filters
                </button>
              </div>
            )
          ) : (
            <div className="space-y-6">
              {segments.map((segment) => {
                const segmentThreads = threads.filter(
                  (thread) => thread.segment_id === segment.id
                );

                if (segmentThreads.length === 0) return null;

                return (
                  <section
                    key={segment.id}
                    className="space-y-5 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5"
                  >
                    <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                      <h2 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-2xl">
                        <span className="h-6 w-1 rounded-full bg-indigo-600" />
                        {segment.title}
                      </h2>
                    </div>
                    {renderThreadGroup(segmentThreads)}
                  </section>
                );
              })}

              {(() => {
                const generalThreads = threads.filter((thread) => !thread.segment_id);

                if (generalThreads.length === 0) return null;

                return (
                  <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
                    <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                      <h2 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-2xl">
                        <span className="h-6 w-1 rounded-full bg-indigo-600" />
                        General discussions
                      </h2>
                    </div>
                    {renderThreadGroup(generalThreads)}
                  </section>
                );
              })()}
            </div>
          )}
        </main>
      </div>
      <MathRenderer />
    </div>
  );
}
