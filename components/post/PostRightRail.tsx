"use client";

import { useEffect, useRef, ReactNode } from "react";
import Link from "next/link";
import {
  BarChart3, Zap, FileText, Users,
  Facebook, Youtube, ExternalLink,
} from "lucide-react";

/* ─── Stat grid ─── */
interface StatItem {
  value: string | number;
  label: string;
}

/* ─── Progress item ─── */
interface ProgressItem {
  label: string;
  value: number;
  max: number;
  variant?: "green" | "purple" | "amber";
}

/* ─── Quick link ─── */
interface QuickLinkItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

/* ─── Related note ─── */
interface RelatedNote {
  title: string;
  meta: string;
  href: string;
}

export interface PostRightRailProps {
  stats?: StatItem[];
  progressItems?: ProgressItem[];
  quickLinks?: QuickLinkItem[];
  relatedNotes?: RelatedNote[];
  showSocial?: boolean;
  children?: ReactNode;
}

function AnimatedProgressBar({
  value,
  max,
  variant = "green",
}: {
  value: number;
  max: number;
  variant?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.style.width = `${pct}%`;
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pct]);

  const colors: Record<string, string> = {
    green: "bg-emerald-500",
    purple: "bg-violet-500",
    amber: "bg-amber-500",
  };

  return (
    <div className="h-[5px] bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        ref={ref}
        className={`h-full rounded-full transition-[width] duration-1000 ease-out ${colors[variant] || colors.green}`}
        style={{ width: "0%" }}
      />
    </div>
  );
}

export default function PostRightRail({
  stats,
  progressItems,
  quickLinks,
  relatedNotes,
  showSocial = true,
  children,
}: PostRightRailProps) {
  return (
    <div className="space-y-4">
      {/* At a glance stats */}
      {stats && stats.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800/60 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              At a glance
            </span>
          </div>
          <div
            className="grid gap-px bg-slate-50 dark:bg-slate-800/30"
            style={{
              gridTemplateColumns: `repeat(${Math.min(stats.length, 2)}, 1fr)`,
            }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 px-4 py-3.5 text-center"
              >
                <div className="text-xl md:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none tabular-nums">
                  {stat.value}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bars */}
          {progressItems && progressItems.length > 0 && (
            <div className="px-4 py-3.5 space-y-3 border-t border-slate-50 dark:border-slate-800/60">
              {progressItems.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {item.value}
                    </span>
                  </div>
                  <AnimatedProgressBar
                    value={item.value}
                    max={item.max}
                    variant={item.variant}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick links */}
      {quickLinks && quickLinks.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800/60 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Quick links
            </span>
          </div>
          <div className="px-2 py-1.5">
            {quickLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[12px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all group"
              >
                {link.icon || (
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                )}
                <span className="truncate">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related notes */}
      {relatedNotes && relatedNotes.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800/60 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Related
            </span>
          </div>
          <div>
            {relatedNotes.map((note, i) => (
              <Link
                key={i}
                href={note.href}
                className="block px-4 py-3 border-b border-slate-50 dark:border-slate-800/40 last:border-0 hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition-colors group"
              >
                <div className="text-[12px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                  {note.title}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  {note.meta}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Social follow */}
      {showSocial && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800/60 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Stay connected
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3">
            <a
              href="https://www.facebook.com/profile.php?id=61584943876571"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-semibold border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
            >
              <Facebook className="w-3.5 h-3.5" />
              Facebook
            </a>
            <a
              href="https://www.youtube.com/@nextprepbd"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-semibold border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-all"
            >
              <Youtube className="w-3.5 h-3.5" />
              YouTube
            </a>
          </div>
        </div>
      )}

      {/* Custom children */}
      {children}
    </div>
  );
}
