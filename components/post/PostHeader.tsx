"use client";

import Link from "next/link";
import { 
  ChevronRight, Bookmark, Link2, Printer, Download, 
  Calendar, Clock, Eye, User 
} from "lucide-react";
import LikeButton from "@/components/LikeButton";
import BookmarkButton from "@/components/shared/BookmarkButton";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PostTag {
  label: string;
  variant: "green" | "purple" | "amber" | "blue" | "rose" | "slate";
  icon?: React.ReactNode;
}

export interface PostHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  tags?: PostTag[];
  title: string;
  titleAccent?: string;
  authorName?: string;
  authorInitials?: string;
  date: string;
  readTime?: number;
  viewCount?: number;
  postId: number | string;
  postType: "blog" | "question" | "news" | "lesson" | "update";
  coverUrl?: string;
  thumbnailUrl?: string;
  isLoggedIn?: boolean;
}

const tagVariants: Record<PostTag["variant"], string> = {
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30",
  purple: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 border-violet-100 dark:border-violet-800/30",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800/30",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800/30",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-800/30",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
};

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
}

export default function PostHeader({
  breadcrumbs,
  tags,
  title,
  titleAccent,
  authorName,
  authorInitials,
  date,
  readTime,
  viewCount,
  postId,
  postType,
  coverUrl,
  thumbnailUrl,
  isLoggedIn,
}: PostHeaderProps) {
  const relativeDate = getRelativeTime(date);
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const initials = authorInitials || (authorName
    ? authorName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "NP");

  return (
    <div className="mb-6 md:mb-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[11px] md:text-xs font-medium text-slate-400 dark:text-slate-500 mb-5 flex-wrap">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Cover image */}
      {coverUrl && (
        <div className="mb-6 rounded-2xl overflow-hidden shadow-md border border-slate-100 dark:border-slate-800">
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-48 md:h-64 lg:h-80 object-cover"
          />
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {tags.map((tag, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${tagVariants[tag.variant]}`}
            >
              {tag.icon}
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl md:text-[2.25rem] font-extrabold text-slate-900 dark:text-white leading-snug tracking-tight mb-5 transition-all">
        {titleAccent ? (
          <>
            {title.split(titleAccent)[0]}
            <em className="text-emerald-600 dark:text-emerald-400 not-italic font-extrabold">
              {titleAccent}
            </em>
            {title.split(titleAccent).slice(1).join(titleAccent)}
          </>
        ) : (
          title
        )}
      </h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[11px] md:text-xs text-slate-500 dark:text-slate-400 pb-5 border-b border-slate-100 dark:border-slate-800/60">
        {/* Author */}
        {authorName && (
          <div className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40 border border-violet-200/50 dark:border-violet-800/30 flex items-center justify-center text-[9px] font-bold text-violet-700 dark:text-violet-400 group-hover:scale-110 transition-transform">
              {initials}
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {authorName}
            </span>
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-1.5 group" title={formattedDate}>
          <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          <span>{relativeDate}</span>
        </div>

        {/* Read time */}
        {readTime && readTime > 0 && (
          <div className="flex items-center gap-1.5 group">
            <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors" />
            <span>{readTime} min read</span>
          </div>
        )}

        {/* Views */}
        {viewCount !== undefined && viewCount > 0 && (
          <div className="flex items-center gap-1.5 group">
            <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <span>{viewCount.toLocaleString()} views</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <LikeButton resourceId={String(postId)} />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-sm hover:shadow-md transition-all">
          <BookmarkButton
            itemType="post"
            itemId={typeof postId === "string" ? parseInt(postId) : postId}
            metadata={{
              title,
              thumbnail_url: thumbnailUrl || coverUrl,
            }}
          />
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
          }}
          className="flex items-center gap-1.5 text-[11px] md:text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm hover:shadow-md"
        >
          <Link2 className="w-3.5 h-3.5" />
          Share
        </button>
        <button
          onClick={() => window.print()}
          className="hidden sm:flex items-center gap-1.5 text-[11px] md:text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300 transition-all shadow-sm hover:shadow-md"
        >
          <Printer className="w-3.5 h-3.5" />
          Print
        </button>
      </div>
    </div>
  );
}
