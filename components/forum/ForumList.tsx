"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Search, MessageSquare, Flame, CheckCircle, 
  Clock, ArrowRight, Grid, List as ListIcon, 
  Sparkles, Filter, ShieldAlert, Pin, Eye, 
  ThumbsUp, BookOpen, AlertCircle, PlusCircle 
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import MathRenderer from "../shared/MathRenderer";

interface ForumListProps {
  initialThreads: any[];
  segments: any[];
  groups: any[];
  subjects: any[];
}

export default function ForumList({ 
  initialThreads, 
  segments, 
  groups, 
  subjects 
}: ForumListProps) {
  const [threads, setThreads] = useState<any[]>(initialThreads);
  const [search, setSearch] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("All");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  const [filteredThreads, setFilteredThreads] = useState<any[]>(initialThreads);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter logic
  useEffect(() => {
    let result = threads;

    // Search query
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (t) => 
          t.title?.toLowerCase().includes(lowerSearch) || 
          t.content?.toLowerCase().includes(lowerSearch)
      );
    }

    // Segment
    if (selectedSegment !== "All") {
      result = result.filter((t) => t.segment?.title === selectedSegment);
    }

    // Group
    if (selectedGroup !== "All") {
      result = result.filter((t) => t.group?.title === selectedGroup);
    }

    // Subject
    if (selectedSubject !== "All") {
      result = result.filter((t) => t.subject?.title === selectedSubject);
    }

    // Thread Type
    if (selectedType !== "All") {
      result = result.filter((t) => t.thread_type === selectedType);
    }

    // Difficulty
    if (selectedDifficulty !== "All") {
      result = result.filter((t) => t.difficulty === selectedDifficulty?.toLowerCase());
    }

    setFilteredThreads(result);
  }, [search, selectedSegment, selectedGroup, selectedSubject, selectedType, selectedDifficulty, threads]);

  // Reset filters
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
          label: "Practice Question",
          bg: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
        };
      case "tutor_announcement":
        return {
          label: "Tutor Post",
          bg: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
        };
      case "study_strategy":
        return {
          label: "Study Strategy",
          bg: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
        };
      default:
        return {
          label: "Discussion",
          bg: "bg-slate-500/10 text-slate-500 border border-slate-500/20",
        };
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return "bg-green-500/15 text-green-500 dark:text-green-400 border border-green-500/20";
      case "medium":
        return "bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/20";
      case "hard":
        return "bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/20";
      default:
        return null;
    }
  };

  // Get available groups based on selected segment
  const activeSegment = segments.find(s => s.title === selectedSegment);
  const filteredGroups = activeSegment 
    ? groups.filter(g => g.segment_id === activeSegment.id)
    : [];

  // Get available subjects based on selected group
  const activeGroup = groups.find(g => g.title === selectedGroup);
  const filteredSubjects = activeGroup
    ? subjects.filter(s => s.group_id === activeGroup.id)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 font-sans">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* LEFT COLUMN: FILTERS (Sticky on Desktop) */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-24 space-y-6">
            
            {/* Filter Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm shadow-slate-100 dark:shadow-none">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-855 dark:text-slate-200 tracking-wide flex items-center gap-2">
                  <Filter className="w-4 h-4 text-indigo-500" /> Filters
                </h3>
                {(selectedSegment !== "All" || selectedGroup !== "All" || selectedSubject !== "All" || selectedType !== "All" || selectedDifficulty !== "All" || search !== "") && (
                  <button 
                    onClick={handleReset}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">Search Discussions</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Type Something..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl outline-none focus:border-indigo-500 text-slate-855 dark:text-slate-200 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Segment Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">Segment</label>
                  <select 
                    value={selectedSegment}
                    onChange={(e) => {
                      setSelectedSegment(e.target.value);
                      setSelectedGroup("All");
                      setSelectedSubject("All");
                    }}
                    className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl outline-none focus:border-indigo-500 text-slate-600 dark:text-slate-350 font-medium animate-none"
                  >
                    <option value="All">All Segments</option>
                    {segments.map((seg) => (
                      <option key={seg.id} value={seg.title}>{seg.title}</option>
                    ))}
                  </select>
                </div>

                {/* Group Filter (Dependent on Segment) */}
                {selectedSegment !== "All" && filteredGroups.length > 0 && (
                  <div className="animate-in slide-in-from-top duration-300">
                    <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">Group</label>
                    <select 
                      value={selectedGroup}
                      onChange={(e) => {
                        setSelectedGroup(e.target.value);
                        setSelectedSubject("All");
                      }}
                      className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl outline-none focus:border-indigo-500 text-slate-600 dark:text-slate-350 font-medium"
                    >
                      <option value="All">All Groups</option>
                      {filteredGroups.map((grp) => (
                        <option key={grp.id} value={grp.title}>{grp.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Subject Filter (Dependent on Group) */}
                {selectedGroup !== "All" && filteredSubjects.length > 0 && (
                  <div className="animate-in slide-in-from-top duration-300">
                    <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">Subject</label>
                    <select 
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl outline-none focus:border-indigo-500 text-slate-600 dark:text-slate-350 font-medium"
                    >
                      <option value="All">All Subjects</option>
                      {filteredSubjects.map((sub) => (
                        <option key={sub.id} value={sub.title}>{sub.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Thread Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">Format</label>
                  <select 
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl outline-none focus:border-indigo-500 text-slate-600 dark:text-slate-350 font-medium"
                  >
                    <option value="All">All Formats</option>
                    <option value="standard">Standard Discussion</option>
                    <option value="question_post">Practice Question</option>
                    <option value="study_strategy">Study Strategy</option>
                    <option value="tutor_announcement">Tutor Post</option>
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">Difficulty</label>
                  <select 
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl outline-none focus:border-indigo-500 text-slate-600 dark:text-slate-350 font-medium"
                  >
                    <option value="All">All Levels</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Quick Community Stats */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden border border-white/5 shadow-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
              <h3 className="text-xs font-bold text-indigo-400 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Community Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-medium text-slate-400 tracking-wide">Total Discussions</p>
                  <p className="text-xl font-extrabold mt-0.5">{threads.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 tracking-wide">Active Members</p>
                  <p className="text-xl font-extrabold mt-0.5">340+</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: THREAD LIST */}
        <div className="flex-1">
          
          {/* Controls / Statistics panel */}
          <div className="flex justify-between items-center mb-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-6 py-4 rounded-[2rem] shadow-sm">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {filteredThreads.length} Discussion{filteredThreads.length !== 1 ? "s" : ""} Found
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-400">Showing Latest</span>
            </div>
          </div>

          {/* List or Cards */}
          {filteredThreads.length > 0 ? (
            <div className="space-y-4">
              {filteredThreads.map((thread) => {
                const badge = getThreadTypeBadge(thread.thread_type);
                const diffBadge = getDifficultyBadge(thread.difficulty);
                const commentsCount = thread.forum_comments?.length || 0;

                return (
                  <div
                    key={thread.id}
                    className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 hover:shadow-xl dark:hover:shadow-indigo-900/5 p-6 rounded-[2rem] transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    {thread.is_pinned && (
                      <div className="absolute top-4 right-6 flex items-center gap-1.5 text-[10px] font-bold text-indigo-500">
                        <Pin className="w-3.5 h-3.5 fill-current" /> Pinned
                      </div>
                    )}

                    <div className="flex-1 space-y-3">
                      {/* Badge / Category Header */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${badge.bg}`}>
                          {badge.label}
                        </span>
                        
                        {diffBadge && (
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${diffBadge}`}>
                            {thread.difficulty ? thread.difficulty.charAt(0).toUpperCase() + thread.difficulty.slice(1) : ''}
                          </span>
                        )}

                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                          {thread.segment?.title && `${thread.segment.title}`}
                          {thread.group?.title && ` › ${thread.group.title}`}
                          {thread.subject?.title && ` › ${thread.subject.title}`}
                        </span>
                      </div>

                      {/* Title */}
                      <Link href={`/forum/thread/${thread.id}`}>
                        <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight line-clamp-2">
                          {thread.title}
                        </h3>
                      </Link>

                      {/* Author & Meta */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px]">
                          {thread.author?.full_name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <span className="font-semibold">{thread.author?.full_name || "Community Member"}</span>
                        {thread.author?.gamification_rank && (
                          <span className="bg-indigo-500/10 text-indigo-500 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {thread.author.gamification_rank}
                          </span>
                        )}
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <div className="flex items-center gap-1 text-[11px] font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {isClient ? new Date(thread.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                        </div>
                      </div>
                    </div>

                    {/* Stats & Actions Area */}
                    <div className="flex items-center gap-6 border-t md:border-t-0 border-slate-100 dark:border-slate-800/50 pt-4 md:pt-0">
                      
                      {/* Metrics counts */}
                      <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ThumbsUp className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            <span className="text-xs font-bold">{thread.upvotes}</span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block mt-0.5">Likes</span>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            <span className="text-xs font-bold">{commentsCount}</span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block mt-0.5">Replies</span>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            <span className="text-xs font-bold">{thread.views}</span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block mt-0.5">Views</span>
                        </div>
                      </div>

                      {/* Go link arrow */}
                      <Link 
                        href={`/forum/thread/${thread.id}`}
                        className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-850 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white text-slate-400 flex items-center justify-center transition-all group-hover:translate-x-1"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
              <AlertCircle className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No Discussions Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">We couldn't find any threads matching your filters. Try checking other topics or resetting the filter.</p>
              <button 
                onClick={handleReset}
                className="px-6 py-3 bg-indigo-600 text-white rounded-full text-xs font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all tracking-wide"
              >
                Reset Filters
              </button>
            </div>
          )}

        </div>

      </div>
      <MathRenderer />
    </div>
  );
}
