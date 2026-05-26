import { createClient } from "@/utils/supabase/server";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner";
import ForumList from "@/components/forum/ForumList";
import { MessageSquare, Sparkles } from "lucide-react";
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
        
        {/* HERO SECTION */}
        <div className="bg-slate-900 text-white pt-32 md:pt-40 pb-20 md:pb-32 px-4 md:px-6 relative overflow-hidden border-b border-white/5">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none -mr-40 -mt-20"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-bold text-indigo-400 tracking-wider mb-6 md:mb-8 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full w-fit">
                <MessageSquare className="w-3.5 h-3.5" />
                Welcome To Our Community Hub
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter leading-[1] md:leading-[0.9] mb-6 md:mb-8">
                Discussion <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Board</span>
              </h1>
              <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed opacity-80">
                Ask questions, share your study strategies, time your practice attempts, and chat with tutors and peers.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* CLIENT-SIDE LIST ENGINE WITH FILTERS */}
          <ForumList 
            initialThreads={safeThreads}
            segments={safeSegments}
            groups={safeGroups}
            subjects={safeSubjects}
          />

          {/* APP BANNER */}
          <div className="px-4 md:px-6 pb-12 md:pb-20">
            <ProfessionalAppBanner />
          </div>
        </div>
      </div>
    </>
  );
}
