"use client";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
}: PaginationProps) {
  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) range.unshift("...");
    if (currentPage + delta < totalPages - 1) range.push("...");

    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 px-2 py-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
      {/* Items Count & Page Size */}
      <div className="flex items-center gap-4 order-2 md:order-1">
        <div className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
           Showing <span className="text-slate-900">{Math.min(totalItems, (currentPage - 1) * pageSize + 1)}</span> to{" "}
           <span className="text-slate-900">{Math.min(totalItems, currentPage * pageSize)}</span> of{" "}
           <span className="text-slate-900">{totalItems}</span>
        </div>
        
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Show</span>
            <select 
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer shadow-sm transition-all"
            >
                {[10, 20, 50, 100].map(size => (
                    <option key={size} value={size}>{size}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1 order-1 md:order-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
          title="First Page"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
          title="Previous Page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1 mx-2">
          {getVisiblePages().map((page, i) => (
            page === "..." ? (
              <span key={`dots-${i}`} className="px-2 text-slate-400 font-bold">...</span>
            ) : (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(page as number)}
                className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                  currentPage === page
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110"
                    : "text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
          title="Next Page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
          title="Last Page"
        >
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
