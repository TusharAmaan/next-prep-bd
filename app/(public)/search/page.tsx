"use client";
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

      {/* Results Grid */}
      {!loading && results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.url}
              target={
                item.type === "ebook" ||
                (item.type === "resource" && item.subtype === "pdf")
                  ? "_blank"
                  : "_self"
              }
              className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
            >
              {/* Top Badge & Meta */}
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ring-1 ${getStyle(
                    item.type
                  )}`}
                >
                  {getIcon(item.type)}
                  {item.sourceTable}
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.subject && (
                  <p className="text-xs text-blue-600 font-bold mb-2">{item.subject}</p>
                )}
                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              {/* Footer Tags & Meta */}
              <div className="pt-4 border-t border-slate-50">
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.tags.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md"
                      >
                        <Tag className="w-3 h-3 opacity-50" /> {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  {item.popularity && (
                    <span className="text-xs text-slate-400 font-medium">
                      ★ {(item.popularity / 1000).toFixed(1)}k
                    </span>
                  )}
                  <span className="ml-auto text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read <ArrowRight className="w-4 h-4 inline ml-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
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
            <div className="mt-6 flex flex-wrap justify-center gap-3">
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