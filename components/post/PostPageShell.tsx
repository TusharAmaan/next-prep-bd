"use client";

import { useEffect, useState, ReactNode } from "react";

interface PostPageShellProps {
  children: ReactNode;
  rightRail?: ReactNode;
  tocContent?: ReactNode;
  accentColor?: string;
}

export default function PostPageShell({
  children,
  rightRail,
  tocContent,
}: PostPageShellProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop / (doc.scrollHeight - doc.clientHeight);
      setScrollProgress(Math.min(scrolled * 100, 100));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <div className="fixed top-[64px] left-0 right-0 h-[2px] bg-slate-100 dark:bg-slate-800/50 z-50">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-[width] duration-75 ease-linear"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 font-sans pt-24 md:pt-28 pb-16 md:pb-24 transition-colors duration-300">
        <div className="max-w-[1560px] mx-auto px-4 md:px-6 grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 relative">
          
          {/* Left column — TOC */}
          {tocContent && (
            <aside className="hidden xl:block xl:col-span-2 relative">
              <div className="sticky top-28">
                {tocContent}
              </div>
            </aside>
          )}

          {/* Main content */}
          <main className={`${tocContent ? 'xl:col-span-7' : 'xl:col-span-8'} col-span-1 min-w-0`}>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              {children}
            </div>
          </main>

          {/* Right rail */}
          {rightRail && (
            <aside className={`${tocContent ? 'xl:col-span-3' : 'xl:col-span-4'} col-span-1 print:hidden`}>
              <div className="sticky top-28 space-y-4 animate-in fade-in slide-in-from-right-4 duration-600 ease-out">
                {rightRail}
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
