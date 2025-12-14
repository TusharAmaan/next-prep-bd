import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function Level3_Resources({ params }: { params: Promise<{ segment_slug: string, group_slug: string, subject_slug: string }> }) {
  const { segment_slug, group_slug, subject_slug } = await params;

  // 1. Fetch Subject (Safe Mode)
  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subject_slug)
    .limit(1)
    .maybeSingle();

  if (!subject) return notFound();

  // 2. Fetch Resources
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", subject.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* --- HERO HEADER --- */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white py-16 px-6 shadow-xl relative overflow-hidden">
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb Pill */}
            <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-blue-100 mb-6 border border-white/10">
                <Link href="/" className="hover:text-white transition">Home</Link>
                <span className="mx-2 opacity-50">/</span>
                <Link href={`/resources/${segment_slug}`} className="hover:text-white transition uppercase">{segment_slug}</Link>
                <span className="mx-2 opacity-50">/</span>
                <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-white transition capitalize">{group_slug.replace('-', ' ')}</Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{subject.title}</h1>
                    <p className="text-blue-200 text-lg">Access all study materials, notes, and lectures below.</p>
                </div>
                {/* Back Button */}
                <Link 
                    href={`/resources/${segment_slug}/${group_slug}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition font-semibold text-sm w-fit"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Subjects
                </Link>
            </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {(!resources || resources.length === 0) ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200 text-center">
             <div className="bg-gray-50 p-6 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
             </div>
             <h3 className="text-xl font-bold text-gray-800">No content available yet</h3>
             <p className="text-gray-500 max-w-sm mt-2">Materials for this subject are being prepared. Check back later!</p>
          </div>
        ) : (
          // Grid Layout
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => {
               if (!res.content_url) return null;
               const isVideo = res.type === 'video';

               return (
                <a 
                  key={res.id} 
                  href={res.content_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`group relative flex flex-col bg-white rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden
                    ${isVideo ? 'border-blue-100 hover:border-blue-300' : 'border-red-100 hover:border-red-300'}`}
                >
                  {/* Top Color Stripe */}
                  <div className={`h-2 w-full ${isVideo ? 'bg-blue-500' : 'bg-red-500'}`}></div>

                  <div className="p-6 flex-1 flex flex-col">
                    {/* Header: Type Badge & Icon */}
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${isVideo ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                             {isVideo ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                             ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                             )}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded-md ${isVideo ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {isVideo ? 'Video Class' : 'PDF Notes'}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
                        {res.title}
                    </h3>
                    
                    {/* Helper text */}
                    <p className="text-xs text-gray-500 mt-auto">
                        {isVideo ? 'Click to watch on YouTube' : 'Click to view or download'}
                    </p>
                  </div>

                  {/* Bottom Action Area */}
                  <div className={`px-6 py-3 border-t flex items-center justify-between text-sm font-bold transition-colors
                    ${isVideo ? 'bg-blue-50/50 border-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white' : 'bg-red-50/50 border-red-100 text-red-700 group-hover:bg-red-600 group-hover:text-white'}`}>
                      <span>{isVideo ? 'Watch Now' : 'Read Now'}</span>
                      <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </a>
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
}