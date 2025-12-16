import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function SegmentPage({ params }: { params: Promise<{ segment_slug: string }> }) {
  const { segment_slug } = await params;

  // 1. Fetch Segment Data (e.g., "SSC")
  const { data: segmentData } = await supabase
    .from("segments")
    .select("*")
    .eq("slug", segment_slug)
    .single();

  if (!segmentData) return notFound();

  // 2. Fetch Groups for this Segment (e.g., "Science", "Business Studies")
  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .eq("segment_id", segmentData.id)
    .order("id");

  // Helper for colors
  const getGradient = (index: number) => {
    const gradients = [
        "from-blue-500 to-blue-600",
        "from-emerald-500 to-emerald-600",
        "from-purple-500 to-purple-600",
        "from-orange-500 to-orange-600"
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20">
      
      {/* PAGE HEADER */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                <Link href="/" className="hover:text-blue-600">Home</Link> / 
                <span className="text-blue-600">{segmentData.title}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                {segmentData.title} <span className="text-gray-400">Preparation</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl">
                Select your group to access tailored study materials, notes, and previous year questions.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT CONTENT: GROUPS GRID (8 Cols) */}
            <div className="lg:col-span-8">
                {groups && groups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {groups.map((group, index) => (
                            <Link 
                                key={group.id} 
                                href={`/resources/${segment_slug}/${group.slug}`}
                                className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-64"
                            >
                                {/* Color Bar Top */}
                                <div className={`h-2 w-full bg-gradient-to-r ${getGradient(index)}`}></div>
                                
                                <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradient(index)} text-white flex items-center justify-center text-3xl font-bold mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                                        {group.title.charAt(0)}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                        {group.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 font-medium">Click to view subjects</p>
                                </div>

                                {/* Bottom Action Strip */}
                                <div className="bg-gray-50 border-t border-gray-100 p-4 flex justify-between items-center px-8">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Enter Group</span>
                                    <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all">
                                        →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                        <div className="text-gray-300 text-6xl mb-4">📂</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Groups Found</h3>
                        <p className="text-gray-500">We are currently organizing content for {segmentData.title}.</p>
                    </div>
                )}
            </div>

            {/* RIGHT SIDEBAR (4 Cols) */}
            <div className="lg:col-span-4">
                <Sidebar />
            </div>

        </div>
      </div>
    </div>
  );
}