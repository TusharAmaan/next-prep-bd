import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function Level2_Subjects({ params }: { params: Promise<{ segment_slug: string, group_slug: string }> }) {
  const { segment_slug, group_slug } = await params;

  // 1. Get Segment
  const { data: segment } = await supabase.from("segments").select("id, slug, title").eq("slug", segment_slug).single();
  if (!segment) return notFound();

  // 2. Get Group
  const { data: group } = await supabase.from("groups").select("*").eq("slug", group_slug).eq("segment_id", segment.id).single();
  if (!group) return notFound();

  // 3. Get Subjects
  const { data: subjects } = await supabase.from("subjects").select("*").eq("group_id", group.id).order("id");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-sm text-gray-500 mb-6 uppercase tracking-wide">
             <Link href={`/resources/${segment.slug}`} className="hover:text-blue-600">&larr; Back to {segment.title}</Link>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-gray-900">{group.title}</h1>
        
        {(!subjects || subjects.length === 0) ? (
             <div className="p-8 bg-white rounded border text-center">
                <p className="text-gray-500">No subjects found.</p>
                <p className="text-sm text-gray-400 mt-2">(Admin: Please add subjects to {group.title})</p>
             </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2">
                {subjects.map(sub => (
                    <Link key={sub.id} href={`/resources/${segment.slug}/${group.slug}/${sub.slug}`} className="block p-6 bg-white rounded border hover:border-blue-500 transition shadow-sm">
                        <h3 className="font-bold text-lg">{sub.title}</h3>
                        <p className="text-blue-600 text-sm mt-1">View Materials &rarr;</p>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}