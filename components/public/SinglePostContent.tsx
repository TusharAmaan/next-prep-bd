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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 px-2 md:px-0">
        <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex-wrap">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link> 
          <ChevronRight className="w-3 h-3" />
          <span>Resources</span> 
          <ChevronRight className="w-3 h-3" />
          <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
            {post.subjects?.groups?.segments?.title || post.segments?.title || "Perspective"}
          </span>
        </nav>
        
        <div className="flex items-center gap-4">
          <LikeButton resourceId={post.id} />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-sm hover:shadow-md transition-all">
            <BookmarkButton
              itemType="post"
              itemId={post.id}
              metadata={{ title: post.title, thumbnail_url: post.image_url || post.cover_url || post.attachment_url }}
            />
          </div>
        </div>
      </div>

      {/* === PREMIUM CONTENT CARD === */}
      <article className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800/60 overflow-hidden transition-colors duration-300">
        
        {/* POST HEADER */}
        <header className="p-8 sm:p-12 md:p-16 border-b border-slate-50 dark:border-slate-800/40">
          <h1 className="text-[clamp(1.875rem,5vw,2.75rem)] font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tighter leading-[1.1] transition-all">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-8 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2.5 group">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span>{formattedDate}</span>
            </div>
            
            {readTime && readTime > 0 && (
              <div className="flex items-center gap-2.5 group">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span>{readTime} min read</span>
              </div>
            )}
          </div>
        </header>

        {/* CONTENT BODY */}
        <div className="p-8 sm:p-12 md:p-16">
          <div className="single-post-body text-slate-800 dark:text-slate-200">
             <BlogContent 
               content={post.content_body || post.content || ""} 
               className="single-post-prose"
             />
          </div>
        </div>

        {/* PREMIUM FOOTER DECOR */}
        <footer className="px-16 py-10 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800/40 flex justify-between items-center flex-wrap gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                © NextPrepBD Education System
            </p>
            <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500/20" />
                <div className="w-2 h-2 rounded-full bg-indigo-500/40" />
                <div className="w-2 h-2 rounded-full bg-indigo-500/60" />
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
      `}</style>
    </div>
  );
}
