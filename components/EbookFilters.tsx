"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce"; // Install: npm i use-debounce
// OR simple debounce manually if you prefer not to install packages
import { ChevronDown, Search, Filter, SortAsc } from "lucide-react"; // npm i lucide-react

type Props = {
  categories: string[];
};

export default function EbookFilters({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper to update URL params
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page to 1 on filter change
    if (key !== "page") params.set("page", "1");
    
    router.push(`/ebooks?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    updateParam("q", term);
  }, 300);

  return (
    <div className="sticky top-4 z-30 mx-auto max-w-7xl px-4 mb-8">
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-slate-200/50 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* --- LEFT: SEARCH --- */}
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          </div>
          <input
            type="text"
            defaultValue={searchParams.get("q")?.toString()}
            onChange={(e) => handleSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 sm:text-sm shadow-inner"
            placeholder="Search title, author, or tag..."
          />
        </div>

        {/* --- RIGHT: FILTERS --- */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Category Dropdown */}
          <div className="relative">
            <select
              onChange={(e) => updateParam("category", e.target.value)}
              defaultValue={searchParams.get("category") || "All"}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer transition-all shadow-sm"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Items Per Page */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Show:</span>
            <select
              onChange={(e) => updateParam("limit", e.target.value)}
              defaultValue={searchParams.get("limit") || "20"}
              className="bg-transparent text-sm font-bold text-slate-900 outline-none cursor-pointer"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}