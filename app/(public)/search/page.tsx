"use client";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  FileText,
  Newspaper,
  BookOpen,
  GraduationCap,
  Megaphone,
  ArrowRight,
  Calendar,
  Tag,
  ChevronRight,
  Filter,
  X,
  Sliders,
} from "lucide-react";

interface SearchResult {
  id: number;
  title: string;
  type: "resource" | "news" | "ebook" | "course" | "update";
  subtype?: string;
  url: string;
  date: string;
  description: string;
  tags?: string[];
  sourceTable: string;
  popularity?: number;
  segment?: string;
  subject?: string;
  difficulty?: string;
  relevanceScore?: number;
}

interface SearchFacets {
  types: string[];
  segments: string[];
  difficulties: string[];
}

function AdvancedSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [facets, setFacets] = useState<SearchFacets>({ types: [], segments: [], difficulties: [] });
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    type: searchParams.get("type") || "",
    segment: searchParams.get("segment") || "",
    difficulty: searchParams.get("difficulty") || "",
    sortBy: (searchParams.get("sortBy") as "relevance" | "date" | "popularity") || "relevance",
  });

  const fetchResults = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);

    try {
      const params = new URLSearchParams({
        q: query,
        sortBy: appliedFilters.sortBy,
      });

      if (appliedFilters.type) params.append("type", appliedFilters.type);
      if (appliedFilters.segment) params.append("segment", appliedFilters.segment);
      if (appliedFilters.difficulty) params.append("difficulty", appliedFilters.difficulty);

      const response = await fetch(`/api/search/advanced?${params.toString()}`);
      const data = await response.json();

      setResults(data.results || []);
      setFacets(data.facets || { types: [], segments: [], difficulties: [] });
      setSuggestion(data.suggestion || null);

      // Track search analytics
      await fetch("/api/search/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          resultCount: data.results?.length || 0,
        }),
      }).catch(() => {}); // Don't break on analytics error
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    }

    setLoading(false);
  }, [query, appliedFilters]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchResults]);

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...appliedFilters, [key]: value };
    setAppliedFilters(newFilters);

    // Update URL
    const params = new URLSearchParams({ q: query });
    if (newFilters.type) params.append("type", newFilters.type);
    if (newFilters.segment) params.append("segment", newFilters.segment);
    if (newFilters.difficulty) params.append("difficulty", newFilters.difficulty);
    if (newFilters.sortBy !== "relevance") params.append("sortBy", newFilters.sortBy);

    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setAppliedFilters({ type: "", segment: "", difficulty: "", sortBy: "relevance" });
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };


  const getIcon = (type: string) => {
    switch (type) {
      case "resource":
        return <FileText className="w-5 h-5" />;
      case "news":
        return <Newspaper className="w-5 h-5" />;
      case "ebook":
        return <BookOpen className="w-5 h-5" />;
      case "course":
        return <GraduationCap className="w-5 h-5" />;
      case "update":
        return <Megaphone className="w-5 h-5" />;
      default:
        return <Search className="w-5 h-5" />;
    }
  };

  const getStyle = (type: string) => {
    switch (type) {
      case "resource":
        return "bg-blue-50 text-blue-600 ring-blue-500/20";
      case "news":
        return "bg-orange-50 text-orange-600 ring-orange-500/20";
      case "ebook":
        return "bg-emerald-50 text-emerald-600 ring-emerald-500/20";
      case "course":
        return "bg-purple-50 text-purple-600 ring-purple-500/20";
      default:
        return "bg-slate-50 text-slate-600 ring-slate-500/20";
    }
  };

  const hasActiveFilters = appliedFilters.type || appliedFilters.segment || appliedFilters.difficulty;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8 md:mb-12">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
          Advanced Search
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
          Results for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            "{query}"
          </span>
        </h1>
        <p className="text-slate-500 mt-3 font-medium">
          Found <span className="font-bold text-slate-900">{results.length}</span> matching items
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Sliders className="w-4 h-4" />
          Filters {hasActiveFilters && <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">Active</span>}
        </button>

        {/* Sort Dropdown */}
        <select
          value={appliedFilters.sortBy}
          onChange={(e) => updateFilter("sortBy", e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <option value="relevance">Most Relevant</option>
          <option value="date">Newest First</option>
          <option value="popularity">Most Popular</option>
        </select>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">Refine Your Search</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Type Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">
                Content Type
              </label>
              <div className="space-y-2">
                {["resource", "course", "ebook", "news"].map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={appliedFilters.type === type}
                      onChange={(e) => updateFilter("type", e.target.value)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-sm text-slate-700 capitalize font-medium">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Segment Filter */}
            {facets.segments.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">
                  Class
                </label>
                <div className="space-y-2">
                  {facets.segments.map((segment) => (
                    <label key={segment} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="segment"
                        value={segment}
                        checked={appliedFilters.segment === segment}
                        onChange={(e) => updateFilter("segment", e.target.value)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm text-slate-700 font-medium">{segment}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty Filter */}
            {facets.difficulties.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">
                  Difficulty
                </label>
                <div className="space-y-2">
                  {facets.difficulties.map((difficulty) => (
                    <label key={difficulty} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="difficulty"
                        value={difficulty}
                        checked={appliedFilters.difficulty === difficulty}
                        onChange={(e) => updateFilter("difficulty", e.target.value)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm text-slate-700 font-medium capitalize">
                        {difficulty}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      )}

      {/* Results Section */}
      {!loading && results.length > 0 ? (
        <div className="space-y-16">
          {/* Grouped Results */}
          {["course", "news", "ebook", "resource", "update"].map((type) => {
            const filtered = results.filter((r) => r.type === type);
            if (filtered.length === 0) return null;

            return (
              <div key={type} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`p-3 rounded-2xl ${getStyle(type)} shadow-sm`}>
                    {getIcon(type)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">
                      {type === 'resource' ? 'Questions & Materials' : `${type}s`}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {filtered.length} matching entries found
                    </p>
                  </div>
                  <div className="flex-1 h-px bg-slate-100 ml-4 hidden md:block" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((item) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={item.url}
                      target={
                        item.type === "ebook" ||
                        (item.type === "resource" && item.subtype === "pdf")
                          ? "_blank"
                          : "_self"
                      }
                      className="group bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                         {React.cloneElement(getIcon(item.type) as React.ReactElement<any>, { size: 64 })}
                      </div>

                      {/* Top Badge & Meta */}
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ${getStyle(
                            item.type
                          )}`}
                        >
                          {item.subtype || item.type}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 relative z-10">
                        <h3 className="text-xl font-black text-slate-800 leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 italic">
                          {item.title}
                        </h3>
                        {item.subject && (
                          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 bg-blue-50/50 w-fit px-2 py-1 rounded-lg">
                            <BookOpen className="w-3 h-3" /> {item.subject}
                          </div>
                        )}
                        <p className="text-sm font-medium text-slate-500 line-clamp-3 leading-relaxed mb-6">
                          {item.description}
                        </p>
                      </div>

                      {/* Footer Tags & Meta */}
                      <div className="pt-6 border-t border-slate-50 relative z-10">
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {item.tags.slice(0, 2).map((tag, i) => (
                              <span
                                key={i}
                                className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100"
                              >
                                <Tag className="w-2.5 h-2.5 opacity-40" /> {tag.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.popularity !== undefined && item.popularity > 0 && (
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {item.popularity} Views
                              </span>
                            )}
                          </div>
                          <span className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                            Explore <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !loading &&
        query && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
            <p className="text-slate-500">
              We couldn't find anything matching{" "}
              <span className="font-bold text-slate-700">"{query}"</span>.
            </p>
            {suggestion && (
              <p className="mt-4 text-slate-600 font-medium bg-blue-50/50 inline-block px-4 py-2 rounded-xl border border-blue-100">
                Did you mean: <Link href={`/search?q=${suggestion}`} className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2">{suggestion}</Link>?
              </p>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest py-1">
                Try:
              </span>
              {["Physics", "Routine", "SSC 2026", "English"].map((t) => (
                <Link
                  key={t}
                  href={`/search?q=${t}`}
                  className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-4 md:px-8 font-sans">
      <Suspense
        fallback={
          <div className="flex justify-center pt-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        <AdvancedSearchContent />
      </Suspense>
    </div>
  );
}