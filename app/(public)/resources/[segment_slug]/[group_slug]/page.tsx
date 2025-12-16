import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function GroupPage({ params }: { params: Promise<{ segment: string; group: string }> }) {
  const { segment, group } = await params;

  // 1. Fetch Segment & Group Data
  const { data: segmentData } = await supabase.from("segments").select("*").eq("slug", segment).single();
  const { data: groupData } = await supabase.from("groups").select("*").eq("slug", group).single();

  if (!segmentData || !groupData) return notFound();

  // 2. Fetch Subjects for this Group
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("group_id", groupData.id)
    .order("id");

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER / BREADCRUMB */}
        <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <Link href="/" className="hover:text-blue-600">Home</Link> / 
                <span className="text-gray-600">{segmentData.title}</span> / 
                <span className="text-blue-600">{groupData.title}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                <span className="text-blue-600">{groupData.title}</span> Subjects
            </h1>
            <p className="text-gray-500 mt-2">Select a subject to access notes, questions, and videos.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: SUBJECT GRID (8 Cols) */}
            <div className="lg:col-span-8">
                {subjects && subjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.map((sub) => (
                            <Link 
                                key={sub.id} 
                                href={`/resources/${segment}/${group}/${sub.slug}`}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all group flex flex-col justify-between h-40"
                            >
                                <div>
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {sub.title.charAt(0)}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">{sub.title}</h3>
                                </div>
                                <div className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 group-hover:text-blue-500">
                                    View Materials <span>→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-10 rounded-xl border border-dashed text-center text-gray-400">
                        No subjects found in this group.
                    </div>
                )}
            </div>

            {/* RIGHT: SIDEBAR (4 Cols) */}
            <div className="lg:col-span-4">
                <Sidebar />
            </div>
        </div>

      </div>
    </div>
  );
}