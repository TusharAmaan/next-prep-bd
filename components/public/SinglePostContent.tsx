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
      {/* === ACCESSIBLE BREADCRUMBS & ACTIONS === */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-2 md:px-0">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 flex-wrap">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link> 
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Resources</span> 
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
            {post.subjects?.groups?.segments?.title || post.segments?.title || "Perspective"}
          </span>
        </nav>
        
        <div className="flex items-center gap-3">
          <LikeButton resourceId={post.id} />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-sm hover:shadow-md transition-all">
            <BookmarkButton
              itemType="post"
              itemId={post.id}
              metadata={{ title: post.title, thumbnail_url: post.image_url || post.cover_url || post.attachment_url }}
            />
          </div>
        </div>
      </div>

      {/* === PREMIUM CONTENT CARD === */}
      <article className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 overflow-hidden transition-colors duration-300">
        
        {/* POST HEADER */}
        <header className="p-6 sm:p-10 md:p-12 border-b border-slate-50 dark:border-slate-800/40">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-snug transition-all">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-450">
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
        <div className="p-6 sm:p-10 md:p-12">
          <div className="single-post-body text-slate-800 dark:text-slate-200">
             <BlogContent 
               content={post.content_body || post.content || ""} 
               className="single-post-prose"
             />
          </div>
        </div>

        {/* PREMIUM FOOTER DECOR */}
        <footer className="px-10 py-6 bg-slate-50/50 dark:bg-slate-800/10 border-t border-slate-100 dark:border-slate-800/40 flex justify-between items-center flex-wrap gap-4">
            <p className="text-xs text-slate-400 dark:text-slate-500">
                © NextPrepBD Education System
            </p>
            <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-550/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-550/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-550/60" />
            </div>
        </footer>
      </article>

      <style jsx global>{`
        .single-post-prose {
          font-size: clamp(1.0625rem, 0.5vw + 1rem, 1.25rem) !important;
          line-height: 1.8 !important;
        }
        
        /* Remove unnecessary default line spaces */
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
            border-radius: 2rem !important;
            margin: 3rem auto !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1) !important;
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
      `}</style>
    </div>
  );
}
