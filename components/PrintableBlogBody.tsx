"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  Calendar, Clock, ChevronRight,
  Lock, Download, Check
} from "lucide-react";
import LikeButton from "./LikeButton";
import BookmarkButton from "./shared/BookmarkButton";
import BlogContent from "@/components/BlogContent"; 
import "katex/dist/katex.min.css"; 

interface PrintableBlogBodyProps {
  post: any;
  formattedDate: string;
  readTime?: number;
  attachmentUrl?: string;
  bengaliFontClass?: string;
  isLoggedIn: boolean;
  onPrintTrigger?: () => void;
}

export default function PrintableBlogBody({
  post,
  formattedDate,
  readTime,
  attachmentUrl,
  bengaliFontClass,
  isLoggedIn,
  onPrintTrigger
}: PrintableBlogBodyProps) {

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full">

      {/* === WEB ACTION BAR (Hidden on Print) === */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden px-2 md:px-0">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex-wrap">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link> <ChevronRight className="w-3 h-3" />
          <span>Resources</span> <ChevronRight className="w-3 h-3" />
          <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
            {post.subjects?.groups?.segments?.title || "Post"}
          </span>
        </div>
        <div className="no-print flex items-center gap-3">
          <LikeButton resourceId={post.id} />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 shadow-sm">
            <BookmarkButton
              itemType="post"
              itemId={post.id}
              metadata={{ title: post.title, thumbnail_url: post.image_url || post.content_url }}
            />
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT CARD === */}
      <div
        ref={contentRef}
        className={`
            bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800
            relative 
            p-6 sm:p-10 md:p-14 lg:p-16
            print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none
            transition-colors duration-300
            ${bengaliFontClass}
        `}
      >

        {/* === FLUID RESPONSIVE TYPOGRAPHY === */}
        <style>{`
          :root {
            --fluid-base: clamp(14px, 1.1vw + 12px, 19px);
            --fluid-h1: clamp(1.5rem, 4vw + 1.2rem, 3.5rem);
            --fluid-h2: clamp(1.2rem, 3vw + 1rem, 2.5rem);
            --fluid-h3: clamp(1rem, 2vw + 0.8rem, 2rem);
          }

          .dark .responsive-typography {
            color: #f1f5f9; /* slate-100 */
          }

          .responsive-typography {
            font-size: var(--fluid-base);
            color: #1e293b; /* slate-800 */
            line-height: 1.7;
            transition: all 0.3s ease;
          }

          .responsive-h1 { 
            font-size: var(--fluid-h1); 
            font-weight: 900;
            letter-spacing: -0.04em;
            line-height: 1.1;
          }
          .responsive-h2 { 
            font-size: var(--fluid-h2);
            font-weight: 800;
            letter-spacing: -0.03em;
            line-height: 1.2;
          }
          .responsive-h3 {
            font-size: var(--fluid-h3);
            font-weight: 700;
            letter-spacing: -0.02em;
            line-height: 1.3;
          }
          
          .blog-content-area p { margin-bottom: 2rem; }
          .blog-content-area h2 { font-size: var(--fluid-h2); font-weight: 800; margin-top: 3.5rem; margin-bottom: 1.5rem; line-height: 1.25; }
          .blog-content-area h3 { font-size: var(--fluid-h3); font-weight: 700; margin-top: 3rem; margin-bottom: 1.25rem; line-height: 1.3; }
          
          @media print {
            .print-container {
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }
            .responsive-typography {
              font-size: 11pt !important;
              line-height: 1.5 !important;
              color: black !important;
            }
            .responsive-h1 { font-size: 22pt !important; border-bottom: none !important; margin-bottom: 12pt !important; color: black !important; }
            .responsive-h2 { font-size: 18pt !important; margin-top: 15pt !important; margin-bottom: 10pt !important; color: black !important; }
            .responsive-h3 { font-size: 14pt !important; margin-top: 12pt !important; margin-bottom: 8pt !important; color: black !important; }
            
            .blog-content-area p { margin-bottom: 10pt !important; }
            
            @page {
              margin: 1.5cm;
              size: A4;
            }
          }
        `}</style>

        {/* === PRINT ONLY HEADER === */}
        <div className="hidden print:flex justify-between items-end border-b-2 border-black pb-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-black">
              NextPrep<span className="text-blue-600">BD</span>
            </h1>
            <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest">Learner's Best Friend</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Printed on {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* === POST HEADER (Title & Meta) === */}
        <div className="mb-10 border-b border-slate-100 dark:border-slate-800 pb-10 print:border-slate-300">
          <h1 className="responsive-h1 responsive-typography font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tighter leading-tight print:font-bold">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 responsive-meta responsive-typography text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 print:text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            {readTime && readTime > 0 && (
              <>
                <span className="hidden sm:inline text-slate-200 dark:text-slate-800 print:hidden">|</span>
                <div className="flex items-center gap-2 print:hidden">
                  <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span>{readTime} min read</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* === DOWNLOAD SECTION === */}
        <div className="mb-12 print:hidden">
          {isLoggedIn ? (
            <div className="bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"><Check className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-widest">Printable PDF Available</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-black">Formatted for offline study</p>
                </div>
              </div>

              <button
                onClick={onPrintTrigger}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 active:scale-95 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
              >
                <Download className="w-4 h-4" /> Save as PDF
              </button>
            </div>
          ) : (
            <div className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4 opacity-60">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0"><Lock className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-widest">PDF Version Restricted</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-black">Authentication required to download</p>
                </div>
              </div>
              <Link href="/login" className="w-full sm:w-auto text-center px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/20">Login to Unlock</Link>
            </div>
          )}
        </div>

        {/* === CONTENT BODY === */}
        <div className="responsive-typography blog-content-area print:text-sm print:leading-normal">
          <div className="[&_p]:responsive-p [&_h2]:responsive-h2 [&_h3]:responsive-h3 [&_h4]:responsive-h3 [&_h5]:responsive-h3 [&_li]:responsive-li [&_code]:responsive-code [&_table]:responsive-table [&_pre]:overflow-x-auto [&_pre]:bg-slate-50 dark:[&_pre]:bg-slate-800/50 [&_pre]:p-6 [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-slate-100 dark:[&_pre]:border-slate-800 [&_blockquote]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:text-slate-600 dark:[&_blockquote]:text-slate-400 [&_blockquote]:italic [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-3xl [&_img]:shadow-2xl [&_img]:mb-8">
            <BlogContent content={post.content_body || ""} />
          </div>
        </div>

        {/* === PRINT FOOTER === */}
        <div className="hidden print:flex flex-row justify-center items-center text-gray-400 mt-16 pt-8 border-t border-gray-200 page-break-inside-avoid">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">© {new Date().getFullYear()} NextPrepBD — Higher Education Redefined</p>
        </div>

      </div>
    </div>
  );
}