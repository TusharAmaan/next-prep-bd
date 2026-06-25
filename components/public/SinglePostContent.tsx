"use client";

import { Calendar, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import LikeButton from "../LikeButton";
import BookmarkButton from "../shared/BookmarkButton";
import BlogContent from "@/components/BlogContent";

interface SinglePostContentProps {
  post: any;
  formattedDate: string;
  readTime?: number;
  bengaliFontClass?: string;
  isLoggedIn: boolean;
}

export default function SinglePostContent({
  post,
  formattedDate,
  readTime,
  bengaliFontClass,
  isLoggedIn,
}: SinglePostContentProps) {
  return (
    <div className={`w-full ${bengaliFontClass || ""}`}>
      {/* === PREMIUM CONTENT CARD === */}
      <article className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 overflow-hidden transition-colors duration-300">
        
        {/* POST HEADER */}
        <header className="p-5 sm:p-8 md:p-10 border-b border-slate-50 dark:border-slate-800/40">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight leading-snug transition-all">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 group">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span>{formattedDate}</span>
            </div>
            
            {readTime && readTime > 0 && (
              <div className="flex items-center gap-2 group">
                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <span>{readTime} min read</span>
              </div>
            )}
          </div>
        </header>

        {/* CONTENT BODY */}
        <div className="p-5 sm:p-8 md:p-10">
          <div className="single-post-body text-slate-800 dark:text-slate-200">
             <BlogContent 
               content={post.content_body || post.content || ""} 
               className="single-post-prose"
             />
          </div>
        </div>

        {/* FOOTER */}
        <footer className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/10 border-t border-slate-100 dark:border-slate-800/40 flex justify-between items-center flex-wrap gap-3">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                © NextPrepBD Education System
            </p>
            <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-indigo-500/20" />
                <div className="w-1 h-1 rounded-full bg-indigo-500/40" />
                <div className="w-1 h-1 rounded-full bg-indigo-500/60" />
            </div>
        </footer>
      </article>

      <style jsx global>{`
        .single-post-prose {
          font-size: clamp(1.0625rem, 0.5vw + 1rem, 1.25rem) !important;
          line-height: 1.8 !important;
        }
        
        .single-post-prose h2, 
        .single-post-prose h3, 
        .single-post-prose h4 {
            margin-top: 2rem !important;
            margin-bottom: 1rem !important;
            letter-spacing: -0.02em !important;
            line-height: 1.3 !important;
        }
        
        .single-post-prose p {
            margin-bottom: 1.5rem !important;
        }

        .single-post-prose h2 { font-size: clamp(1.5rem, 3vw, 2rem) !important; font-weight: 800 !important; }
        .single-post-prose h3 { font-size: clamp(1.25rem, 2vw, 1.75rem) !important; font-weight: 700 !important; }
        
        .single-post-prose img {
            border-radius: 1rem !important;
            margin: 2rem auto !important;
            box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.08) !important;
        }

        .single-post-prose blockquote {
            border-left: 3px solid #10b981 !important;
            padding-left: 1rem !important;
            margin: 1.5rem 0 !important;
            color: #475569 !important;
            font-style: italic !important;
        }

        .single-post-prose table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 1.5rem 0 !important;
            font-size: 0.875rem !important;
        }

        .single-post-prose table th,
        .single-post-prose table td {
            padding: 0.625rem 0.75rem !important;
            border: 1px solid #e2e8f0 !important;
            text-align: left !important;
        }

        .single-post-prose table th {
            background: #f8fafc !important;
            font-weight: 600 !important;
        }

        .dark .single-post-prose h2,
        .dark .single-post-prose h3,
        .dark .single-post-prose h4,
        .dark .single-post-prose strong {
            color: #ffffff !important;
        }

        .dark .single-post-prose p,
        .dark .single-post-prose li,
        .dark .single-post-prose span:not(.katex):not(.katex *) {
            color: #cbd5e1 !important;
        }

        .dark .single-post-prose blockquote {
            border-left-color: #059669 !important;
            color: #94a3b8 !important;
        }

        .dark .single-post-prose table th,
        .dark .single-post-prose table td {
            border-color: #1e293b !important;
        }

        .dark .single-post-prose table th {
            background: #0f172a !important;
        }
      `}</style>
    </div>
  );
}
