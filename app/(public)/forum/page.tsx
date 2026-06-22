import { createClient } from "@/utils/supabase/server";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner";
import ForumList from "@/components/forum/ForumList";
import { MessageSquare } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Discussion Forum | NextPrepBD",
  description: "Join the NextPrepBD student discussion forum. Ask GMAT-style questions, read expert replies, time your MCQ attempts, and learn together.",
  alternates: {
    canonical: "/forum",
  },
};

export const dynamic = "force-dynamic";

export default async function ForumIndexPage() {
  const supabase = await createClient();

  // Fetch threads with author, segment, group, subject, and comments relation for counting
  const { data: threads } = await supabase
    .from("forum_threads")
    .select(`
      *,
      author:profiles!forum_threads_author_id_fkey(id, full_name, gamification_rank),
      segment:segments(id, title),
      group:groups(id, title),
      subject:subjects(id, title),
      forum_comments(id)
    `)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  // Fetch taxonomy data for filters
  const { data: segments } = await supabase.from("segments").select("id, title").order("id");
  const { data: groups } = await supabase.from("groups").select("id, title, segment_id").order("id");
  const { data: subjects } = await supabase.from("subjects").select("id, title, group_id").order("id");

  const safeThreads = threads || [];
  const safeSegments = segments || [];
  const safeGroups = groups || [];
  const safeSubjects = subjects || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "name": "NextPrepBD Community Forum",
    "description": "EdTech platform discussion forum for GMAT-style questions and lesson plans.",
    "url": "https://nextprepbd.com/forum",
    "publisher": {
      "@type": "Organization",
      "name": "NextPrepBD",
      "logo": "https://nextprepbd.com/icon.png"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
        
        {/* Hero */}
        <div className="bg-white dark:bg-slate-950 pt-28 md:pt-32 pb-10 md:pb-14 px-3 sm:px-4 md:px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-full max-w-[1600px] mx-auto">
            <div className="max-w-5xl">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 mb-5">
                <MessageSquare className="w-3.5 h-3.5" />
                NextPrepBD forum
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-slate-950 dark:text-white mb-5">
                Ask, answer, and study together.
              </h1>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-350 leading-8 max-w-3xl">
                Browse student questions, practice threads, reading discussions, and study advice from people preparing for the same goals.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[1600px] mx-auto">
          <ForumList 
            initialThreads={safeThreads}
            segments={safeSegments}
            groups={safeGroups}
            subjects={safeSubjects}
          />

          <div className="px-3 sm:px-4 md:px-6 pb-10 md:pb-14">
            <ProfessionalAppBanner />
          </div>
        </div>
      </div>
    </>
  );
}
