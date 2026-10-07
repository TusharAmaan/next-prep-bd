import { createClient } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { 
  ChevronRight, 
  ArrowLeft, 
  BellRing, 
  Search, 
  Download, 
  Calendar, 
  FileText, 
  Trophy, 
  ArrowRight,
  Clock
} from "lucide-react";
import LeftSidebar from "@/components/LeftSidebar";
import Sidebar from "@/components/Sidebar";
import { getBreadcrumbSchema } from "@/lib/seo-utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ segment_slug: string }> 
}): Promise<Metadata> {
  const { segment_slug } = await params;
  const supabase = await createClient();
  const { data: segment } = await supabase
    .from("segments")
    .select("title")
    .eq("slug", segment_slug)
    .single();

  const title = segment ? `${segment.title} Quick Updates & Routines Archive` : "Updates Archive";
  return {
    title: `${title} | NextPrepBD`,
    description: `Official exam routines, revised syllabi, and board notices for ${segment?.title || 'academic'} examinations in Bangladesh.`,
    alternates: {
      canonical: `https://nextprepbd.com/resources/${segment_slug}/updates`,
    },
    openGraph: {
      title: `${title} | NextPrepBD`,
      description: `Official exam routines, revised syllabi, and board notices for ${segment?.title || 'academic'} examinations.`,
      url: `https://nextprepbd.com/resources/${segment_slug}/updates`,
      siteName: "NextPrepBD",
      locale: "en_US",
      type: "website"
    }
  };
}

export default async function SegmentUpdatesPage({ 
  params 
}: { 
  params: Promise<{ segment_slug: string }> 
}) {
  const { segment_slug } = await params;
  const supabase = await createClient();

  const { data: segment } = await supabase
    .from("segments")
    .select("*")
    .eq("slug", segment_slug)
    .single();

  if (!segment) return notFound();

  const { data: updates } = await supabase
    .from("segment_updates")
    .select("id, title, type, created_at, attachment_url")
    .eq("segment_id", segment.id)
    .order("created_at", { ascending: false });

  const allUpdates = updates || [];

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: segment.title, item: `/resources/${segment_slug}` },
    { name: "Updates & Routines", item: `/resources/${segment_slug}/updates` }
  ]);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${segment.title} Quick Updates & Notice Board`,
    "description": `Complete institutional archive of test routines, revised syllabi, and official announcements for ${segment.title}.`,
    "url": `https://nextprepbd.com/resources/${segment_slug}/updates`,
    "provider": {
      "@type": "EducationalOrganization",
      "name": "NextPrepBD",
      "url": "https://nextprepbd.com"
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "routine":
        return {
          label: "Exam Routine",
          icon: <Calendar className="w-3 h-3 text-emerald-500" />,
          classes: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60"
        };
      case "syllabus":
        return {
          label: "Full Syllabus",
          icon: <FileText className="w-3 h-3 text-indigo-500" />,
          classes: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60"
        };
      case "exam_result":
        return {
          label: "Board Result",
          icon: <Trophy className="w-3 h-3 text-amber-500" />,
          classes: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60"
        };
      default:
        return {
          label: "Official Notice",
          icon: <BellRing className="w-3 h-3 text-blue-500" />,
          classes: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60"
        };
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, collectionSchema]) }}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white pt-16 transition-colors duration-300 relative overflow-hidden">
      <div className="w-full grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_340px]">
        
        {/* Left Sidebar */}
        <LeftSidebar activeSegment={segment_slug} />

        {/* Main Content Area */}
        <main className="min-w-0 p-4 md:p-6 pb-20">
          
          {/* Header Banner */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-8 relative overflow-hidden shadow-xs mb-8">
            <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-4">
              <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/resources/${segment_slug}`} className="hover:text-indigo-600 transition-colors">{segment.title}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Updates & Routines</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                  <BellRing className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {segment.title} Quick Updates & Notice Board
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Complete institutional archive of test routines, revised syllabi, and official announcements
                  </p>
                </div>
              </div>

              <Link
                href={`/resources/${segment_slug}`}
                className="self-start sm:self-auto text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to {segment.title}</span>
              </Link>
            </div>
          </section>

          {/* Updates List in 2-Column Responsive Grid */}
          {allUpdates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allUpdates.map((upd) => {
                const badge = getTypeBadge(upd.type);

                return (
                  <Link
                    key={upd.id}
                    href={`/resources/${segment_slug}/updates/${upd.id}`}
                    className="group bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-orange-400/80 dark:hover:border-orange-500/60 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${badge.classes}`}>
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>

                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(upd.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug mb-4">
                        {upd.title}
                      </h3>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {upd.attachment_url ? "Downloadable Attachment" : "Official Notice"}
                      </span>

                      {upd.attachment_url ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold group-hover:bg-orange-500 group-hover:text-white transition-all text-xs">
                          <span>View PDF</span>
                          <Download className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold group-hover:translate-x-0.5 transition-transform text-xs">
                          <span>Read Notice</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400">
              <BellRing className="w-10 h-10 mx-auto mb-2 opacity-40 text-orange-500" />
              <p className="text-sm font-semibold">No updates currently available for {segment.title}</p>
            </div>
          )}
        </main>

        {/* Right Rail */}
        <aside className="hidden xl:block py-6 pr-6 pl-0 space-y-6">
          <div className="sticky top-24">
            <Sidebar />
          </div>
        </aside>

      </div>
    </div>
    </>
  );
}
