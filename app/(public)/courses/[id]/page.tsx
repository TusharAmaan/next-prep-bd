import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { parseHashtagsToHTML } from '@/utils/hashtagParser';
import BookmarkButton from "@/components/shared/BookmarkButton";
import Discussion from "@/components/shared/Discussion";
import { headers } from 'next/headers';
import { Metadata } from 'next';
import { checkEnrollmentStatus } from "@/app/actions/enrollment";
import EnrollmentButton from "@/components/courses/EnrollmentButton";
import CurriculumView from "@/components/courses/CurriculumView";

export const dynamic = "force-dynamic";

// --- HELPER: Detect ID vs Slug ---
function getQueryColumn(param: string) {
  const isNumeric = /^\d+$/.test(param);
  return isNumeric ? 'id' : 'slug';
}

// --- 1. DYNAMIC SEO METADATA ---
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const column = getQueryColumn(id);

  const { data: course } = await supabase
    .from('courses')
    .select('title, seo_title, seo_description, tags, thumbnail_url, instructor')
    .eq(column, id)
    .single();

  if (!course) return { title: 'Course Not Found' };

  return {
    title: course.seo_title || course.title,
    description: course.seo_description || `Enroll in ${course.title} by ${course.instructor}.`,
    keywords: course.tags,
    openGraph: {
      title: course.seo_title || course.title,
      description: course.seo_description,
      images: course.thumbnail_url ? [course.thumbnail_url] : [],
      type: 'website',
    },
  };
}

export default async function SingleCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const column = getQueryColumn(id);

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq(column, id)
    .single();

  if (!course) return notFound();

  // 2. Fetch Curriculum
  const { data: lessonsData } = await supabase
    .from('course_lessons')
    .select('*, course_contents(*)')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true });

  const lessons = lessonsData?.map(l => ({
    ...l,
    course_contents: l.course_contents?.sort((a: any, b: any) => a.order_index - b.order_index)
  })) || [];

  // 3. Check Enrollment Status
  const { enrolled } = await checkEnrollmentStatus(course.id);

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const absoluteUrl = `${protocol}://${host}/courses/${id}`;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20">
      {/* HERO SECTION */}
      <div className="bg-gray-900 text-white py-12 md:py-16 px-6">
        <div className="max-w-7xl mx-auto md:flex gap-10 items-center">
            <div className="md:w-2/3">
                <div className="inline-block bg-blue-600 text-[11px] font-bold tracking-widest px-4 py-1.5 rounded-full mb-6 text-white">
                    {course.duration || "Self-Paced"} Course
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
                    {course.title}
                </h1>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl font-medium leading-relaxed">
                    Master this subject with expert guidance. Comprehensive curriculum designed for exam success.
                </p>
                <div className="flex items-center gap-6 text-[11px] font-bold tracking-widest text-gray-400">
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                        Instructor: {course.instructor || "NextPrep Team"}
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                        Latest: {new Date(course.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 md:-mt-0 grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
        <div className="lg:col-span-2 py-12 space-y-16">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-50 pb-6 tracking-tight">Course Overview</h3>
                <div 
                    className="prose prose-lg prose-indigo max-w-none text-slate-600 font-medium leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: course.description ? parseHashtagsToHTML(course.description) : "<p>No description provided yet.</p>" }}
                />
            </div>

            {/* CURRICULUM SECTION */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Curriculum</h3>
                    <span className="text-[11px] font-bold text-slate-400 tracking-widest bg-slate-100 px-3 py-1 rounded-full">{lessons.length} Modules</span>
                </div>
                <CurriculumView lessons={lessons} />
            </div>

            <div className="pt-8">
                <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight border-l-4 border-indigo-600 pl-4">Community Discussion</h3>
                <Discussion itemType="course" itemId={course.id.toString()} />
            </div>
        </div>

        {/* STICKY SIDEBAR */}
        <div className="lg:col-span-1">
            <div className="sticky top-24">
                <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden transform -translate-y-20 md:translate-y-0 p-4">
                    <div className="aspect-video bg-slate-900 rounded-[2.5rem] relative overflow-hidden group shadow-inner">
                        {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-700 font-bold flex-col gap-4">
                                <svg className="w-16 h-16 opacity-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                                <span className="tracking-widest text-xs opacity-40">No Preview</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-500">
                                <svg className="w-6 h-6 text-indigo-600 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="flex items-end gap-3 mb-8">
                            <span className="text-4xl font-bold text-slate-900 tracking-tighter">
                                {course.price === "0" || !course.price ? "FREE" : `$${course.price}`}
                            </span>
                            {course.discount_price && (
                                <span className="text-slate-400 text-lg mb-1 line-through font-bold">${course.discount_price}</span>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <EnrollmentButton courseId={course.id} initialEnrolled={enrolled} />
                            <div className="bg-slate-50 rounded-2xl p-1 border border-slate-100 flex items-center shadow-sm">
                               <BookmarkButton 
                                  itemType="course" 
                                  itemId={course.id} 
                                  metadata={{ title: course.title, thumbnail_url: course.thumbnail_url }} 
                               />
                            </div>
                        </div>
                        
                        <p className="text-[11px] font-bold text-slate-400 text-center mt-6 tracking-widest">Premium Learning Access</p>

                        <div className="mt-10 space-y-6 pt-8 border-t border-slate-50">
                            <h4 className="text-[11px] font-bold text-slate-900 tracking-[0.2em]">Course Perks</h4>
                            <ul className="space-y-4">
                                {[
                                    { icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", text: "Expert High-Def Videos" },
                                    { icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", text: "Downloadable Resources" },
                                    { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", text: "Verified Certificate" }
                                ].map((perk, i) => (
                                    <li key={i} className="flex items-center gap-4 group">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all cursor-default">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={perk.icon} /></svg>
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 tracking-tight">{perk.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}