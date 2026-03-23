export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors">
      {/* Hero Skeleton */}
      <div className="bg-[#0f172a] pt-36 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="mx-auto w-48 h-6 shimmer-bg rounded-full opacity-40"></div>
          <div className="space-y-3">
            <div className="mx-auto w-3/4 h-12 shimmer-bg rounded-2xl opacity-30"></div>
            <div className="mx-auto w-1/2 h-12 shimmer-bg rounded-2xl opacity-30"></div>
          </div>
          <div className="mx-auto max-w-2xl h-16 shimmer-bg rounded-2xl opacity-20"></div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="max-w-6xl mx-auto px-6 -mt-16">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 shimmer-bg rounded-2xl"></div>
                <div className="w-24 h-10 shimmer-bg rounded-xl"></div>
                <div className="w-32 h-4 shimmer-bg rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goal Cards Skeleton */}
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 md:px-6">
        <div className="space-y-3 mb-12">
          <div className="w-24 h-4 shimmer-bg rounded-lg"></div>
          <div className="w-72 h-10 shimmer-bg rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem]">
              <div className="w-14 h-14 shimmer-bg rounded-2xl mb-6"></div>
              <div className="w-20 h-5 shimmer-bg rounded-lg mb-3"></div>
              <div className="w-full h-3 shimmer-bg rounded mb-2"></div>
              <div className="w-2/3 h-3 shimmer-bg rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="py-16 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                <div className="flex gap-4">
                  <div className="w-20 h-20 shimmer-bg rounded-xl shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-4 shimmer-bg rounded"></div>
                    <div className="w-full h-3 shimmer-bg rounded"></div>
                    <div className="w-1/2 h-3 shimmer-bg rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-64 shimmer-bg rounded-[2rem]"></div>
            <div className="h-40 shimmer-bg rounded-[2rem]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}