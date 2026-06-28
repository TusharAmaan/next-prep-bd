import { Suspense } from "react";
import { createClient } from "@/lib/supabaseServer";
import HomeAppSection from "@/components/HomeAppSection";
import AdBanner from "@/components/AdBanner";

// New Components
import HeroSection from "@/components/homepage/HeroSection";
import StatsSection from "@/components/homepage/StatsSection";
import LessonPlanFeatures from "@/components/homepage/LessonPlanFeatures";
import CurriculumShowcase from "@/components/homepage/CurriculumShowcase";
import LectureSheetShowcase from "@/components/homepage/LectureSheetShowcase";
import TutorPromoSection from "@/components/homepage/TutorPromoSection";
import DigitalLibrarySection from "@/components/homepage/DigitalLibrarySection";
import RecentBlogPosts from "@/components/homepage/RecentBlogPosts";
import CommunityForumSection from "@/components/homepage/CommunityForumSection";
import NewsSection from "@/components/homepage/NewsSection";

export const revalidate = 300;

export default async function HomePage() {
  const supabaseServer = await createClient();
  
  const [
    { data: { user } },
    latestForumThreads,
    latestNews,
    ebooksData,
    blogData,
  ] = await Promise.all([
    supabaseServer.auth.getUser(),
    supabaseServer.from("forum_threads")
      .select(`
        id,
        title,
        created_at,
        upvotes,
        views,
        difficulty,
        segment:segments(id, title),
        author:profiles!forum_threads_author_id_fkey(id, full_name, gamification_rank),
        forum_comments(id)
      `)
      .order("views", { ascending: false })
      .limit(6),
    supabaseServer.from("news").select("*").limit(3).order("created_at", { ascending: false }),
    supabaseServer.from("ebooks").select("id, title, author, cover_url, created_at, category").limit(4).order("created_at", { ascending: false }),
    supabaseServer.from("resources").select("*").eq("type", "blog").eq("status", "approved").limit(6).order("created_at", { ascending: false }),
  ]);

  const threads = latestForumThreads?.data || [];
  const news = latestNews?.data || [];
  const ebooks = ebooksData?.data || [];
  const blogs = blogData?.data || [];
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-x-hidden">
      
      <HeroSection />
      
      <StatsSection />
      
      <LessonPlanFeatures />
      
      <CurriculumShowcase isLoggedIn={isLoggedIn} />
      
      <LectureSheetShowcase isLoggedIn={isLoggedIn} />
      
      <TutorPromoSection />
      
      <DigitalLibrarySection ebooks={ebooks} />
      
      <RecentBlogPosts blogs={blogs} />
      
      <CommunityForumSection threads={threads} />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <AdBanner dataAdSlot="8219606997" dataAdFormat="fluid" dataAdLayoutKey="-f9+a+14-5p+64" />
      </div>

      <NewsSection news={news} />
      
      <HomeAppSection />
      
    </div>
  );
}