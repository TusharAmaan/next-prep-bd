import React from "react";

export default function CurriculumLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* 1. Header Banner Skeleton */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 pt-28 pb-12 md:pt-36 md:pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb Pill & Tag */}
          <div className="flex items-center gap-3">
            <div className="w-24 h-5 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse"></div>
            <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
            <div className="w-32 h-5 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse"></div>
          </div>

          {/* Title and Subtitle */}
          <div className="space-y-3">
            <div className="w-3/4 max-w-xl h-10 md:h-12 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            <div className="w-full max-w-2xl h-5 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse"></div>
          </div>

          {/* Search bar & Fast Stats skeleton */}
          <div className="pt-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="w-full md:w-96 h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
              <div className="w-24 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stage Filter Tabs Skeleton */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-28 h-10 rounded-xl bg-slate-200/70 dark:bg-slate-800/70 shrink-0 animate-pulse"
            ></div>
          ))}
        </div>
      </div>

      {/* 3. Subject Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm"
            >
              {/* Header Icon + Badge */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                <div className="w-16 h-6 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
              </div>

              {/* Title and metadata */}
              <div className="space-y-2 pt-2">
                <div className="w-3/4 h-5 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                <div className="w-full h-4 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse"></div>
                <div className="w-2/3 h-4 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse"></div>
              </div>

              {/* Footer specs */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="w-20 h-4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                <div className="w-16 h-4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
