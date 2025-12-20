import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function SegmentPage({ params }: { params: Promise<{ segment_slug: string }> }) {
  const { segment_slug } = await params;

  // 1. Fetch Segment Data
  const { data: segmentData } = await supabase.from("segments").select("*").eq("slug", segment_slug).single();
  if (!segmentData) return notFound();

  // 2. Fetch Groups
  const { data: groups } = await supabase.from("groups").select("*").eq("segment_id", segmentData.id).order("id");

  // 3. FETCH LATEST UPDATES (Routine, Syllabus, Results)
  // We fetch all updates for this segment, order by newest, so we can pick the latest one of each type.
  const { data: updates } = await supabase
    .from("segment_updates")
    .select("id, type, title, created_at")
    .eq("segment_id", segmentData.id)
    .order("created_at", { ascending: false });

  // Filter to find the single latest item for each category
  const routine = updates?.find(u => u.type === 'routine');
  const syllabus = updates?.find(u => u.type === 'syllabus');
  const result = updates?.find(u => u.type === 'exam_result');

  // Helper for colors
  const getGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-indigo-600",
      "from-emerald-500 to-teal-600",
      "from-purple-500 to-violet-600",
      "from-orange-500 to-red-500"
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* HERO SECTION */}
      <section className="bg-slate-900 text-white pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link> / 
                <span className="text-blue-400">{segmentData.title}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                {segmentData.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Preparation</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                Your complete guide to {segmentData.title}. Access free notes, question banks, and video classes below.
            </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8">
                
                {/* A. GROUPS GRID */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-900">Select Your Group</h2>
                </div>

                {groups && groups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                        {groups.map((group, index) => (
                            <Link 
                                key={group.id} 
                                href={`/resources/${segment_slug}/${group.slug}`} 
                                className="group relative bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-64 cursor-pointer"
                            >
                                <div className={`h-1.5 w-full bg-gradient-to-r ${getGradient(index)}`}></div>
                                <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradient(index)} text-white flex items-center justify-center text-3xl font-black mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                                        {group.title.charAt(0)}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                        {group.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                                        View Subjects →
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center mb-16">
                        <div className="text-4xl mb-4">📂</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Groups Found</h3>
                    </div>
                )}

                {/* B. ESSENTIAL TOOLS (NOW DYNAMIC & CONNECTED TO ARCHIVE) */}
                <div className="mb-16">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="text-2xl">⚡</span> Quick Tools
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* 1. ROUTINE TOOL */}
                        <Link href={`/resources/${segment_slug}/category/routine`} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer group">
                            <div className="text-blue-600 text-2xl mb-3 group-hover:scale-110 transition-transform">📅</div>
                            <h4 className="font-bold text-slate-800">Exam Routine</h4>
                            {routine ? (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">Latest: {routine.title}</p>
                            ) : (
                                <p className="text-xs text-slate-400 mt-1">View Archive</p>
                            )}
                            <p className="text-[10px] text-blue-600 font-bold mt-2 uppercase">View All →</p>
                        </Link>

                        {/* 2. SYLLABUS TOOL */}
                        <Link href={`/resources/${segment_slug}/category/syllabus`} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition cursor-pointer group">
                            <div className="text-emerald-600 text-2xl mb-3 group-hover:scale-110 transition-transform">📝</div>
                            <h4 className="font-bold text-slate-800">Syllabus</h4>
                            {syllabus ? (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">Latest: {syllabus.title}</p>
                            ) : (
                                <p className="text-xs text-slate-400 mt-1">View Archive</p>
                            )}
                            <p className="text-[10px] text-emerald-600 font-bold mt-2 uppercase">View All →</p>
                        </Link>

                        {/* 3. RESULTS TOOL */}
                        <Link href={`/resources/${segment_slug}/category/exam_result`} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition cursor-pointer group">
                            <div className="text-purple-600 text-2xl mb-3 group-hover:scale-110 transition-transform">🏆</div>
                            <h4 className="font-bold text-slate-800">Exam Results</h4>
                            {result ? (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">Latest: {result.title}</p>
                            ) : (
                                <p className="text-xs text-slate-400 mt-1">View Archive</p>
                            )}
                            <p className="text-[10px] text-purple-600 font-bold mt-2 uppercase">View All →</p>
                        </Link>

                    </div>
                </div>

                {/* C. WHY CHOOSE SECTION */}
                <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">Why study for {segmentData.title} with NextPrep?</h3>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        We provide the most up-to-date resources for <strong>{segmentData.title}</strong> students in Bangladesh. 
                        Unlike other platforms, our content is verified by expert teachers.
                    </p>
                </div>

            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-4 space-y-8">
                <Sidebar />
            </div>
        </div>
      </section>

    </div>
  );
}