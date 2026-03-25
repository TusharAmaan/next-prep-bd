import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface URLPaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  queryParam?: string;
  additionalParams?: Record<string, string>;
}

export default function URLPagination({
  currentPage,
  totalPages,
  baseUrl,
  queryParam = "page",
  additionalParams = {}
}: URLPaginationProps) {
  if (totalPages <= 1) return null;

  const createUrl = (page: number) => {
    const params = new URLSearchParams(additionalParams);
    params.set(queryParam, page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

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
    <div className="flex items-center justify-center gap-1 mt-12 py-6 border-t border-slate-100">
      <Link
        href={createUrl(1)}
        className={`p-2 rounded-xl transition-colors ${currentPage === 1 ? 'pointer-events-none opacity-20' : 'hover:bg-slate-100 text-slate-600'}`}
      >
        <ChevronsLeft className="w-5 h-5" />
      </Link>
      <Link
        href={createUrl(currentPage - 1)}
        className={`p-2 rounded-xl transition-colors ${currentPage === 1 ? 'pointer-events-none opacity-20' : 'hover:bg-slate-100 text-slate-600'}`}
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>

      <div className="flex items-center gap-1 mx-2">
        {getVisiblePages().map((page, i) => (
          page === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-slate-400 font-bold">...</span>
          ) : (
            <Link
              key={`page-${page}`}
              href={createUrl(page as number)}
              className={`w-10 h-10 rounded-xl text-sm font-black flex items-center justify-center transition-all ${
                currentPage === page
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
              }`}
            >
              {page}
            </Link>
          )
        ))}
      </div>

      <Link
        href={createUrl(currentPage + 1)}
        className={`p-2 rounded-xl transition-colors ${currentPage === totalPages ? 'pointer-events-none opacity-20' : 'hover:bg-slate-100 text-slate-600'}`}
      >
        <ChevronRight className="w-5 h-5" />
      </Link>
      <Link
        href={createUrl(totalPages)}
        className={`p-2 rounded-xl transition-colors ${currentPage === totalPages ? 'pointer-events-none opacity-20' : 'hover:bg-slate-100 text-slate-600'}`}
      >
        <ChevronsRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
