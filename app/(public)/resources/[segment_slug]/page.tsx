import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

// Force dynamic to ensure data is always fresh
export const dynamic = "force-dynamic";

export default async function SegmentPage({ params }: { params: Promise<{ segment_slug: string }> }) {
  const { segment_slug } = await params;

  // 1. Fetch Segment Data (e.g., "HSC")
  const { data: segmentData } = await supabase.from("segments").select("*").eq("slug", segment_slug).single();
  if (!segmentData) return notFound();

  // 2. Fetch Groups (e.g., "Science", "Business")
  const { data: groups } = await supabase.from("groups").select("*").eq("segment_id", segmentData.id).order("id");

  // Helper for professional gradient colors
  const getGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-indigo-600",    // Blue-Indigo
      "from-emerald-500 to-teal-600",   // Green-Teal
      "from-purple-500 to-violet-600",  // Purple
      "from-orange-500 to-red-500"      // Orange-Red
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* =========================================
          1. HERO SECTION (Dark & Professional)
         ========================================= */}
      <section className="bg-slate-900 text-white pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link> 
                <span className="text-slate-600">/</span> 
                <span className="text-blue-400">{segmentData.title}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                {segmentData.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Preparation</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                Select your group below to access tailored study materials, question banks, and suggestions specifically for {segmentData.title} students.
            </p>
        </div>
      </section>

      {/* =========================================
          2. CONTENT AREA
         ========================================= */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT COLUMN: Groups Grid */}
            <div className="lg:col-span-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-900">Select Your Group</h2>
                </div>

                {groups && groups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {groups.map((group, index) => (
                            <Link 
                                key={group.id} 
                                href={`/resources/${segment_slug}/${group.slug}`} 
                                className="group relative bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-64 cursor-pointer"
                            >
                                {/* Top Color Strip */}
                                <div className={`h-1.5 w-full bg-gradient-to-r ${getGradient(index)}`}></div>
                                
                                <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
                                    {/* Icon Container */}
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
                    <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                        <div className="text-4xl mb-4">📂</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Groups Found</h3>
                        <p className="text-slate-500">We are adding materials for this section soon.</p>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: Sidebar */}
            <div className="lg:col-span-4 space-y-8">
                <Sidebar />
            </div>
        </div>
      </section>

    </div>
  );
}