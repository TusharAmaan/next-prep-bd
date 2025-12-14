import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function Level2_Subjects({ params }: { params: Promise<{ segment_slug: string, group_slug: string }> }) {
  const { segment_slug, group_slug } = await params;

  // 1. Fetch Segment
  const { data: segment } = await supabase
    .from("segments")
    .select("id, title, slug")
    .eq("slug", segment_slug)
    .single();

  if (!segment) return notFound();

  // 2. Fetch Group
  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("slug", group_slug)
    .eq("segment_id", segment.id)
    .single();

  if (!group) return notFound();

  // 3. Fetch Subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("group_id", group.id)
    .order("id");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-sm text-gray-500 mb-6 uppercase tracking-wide">
          <Link href="/" className="hover:text-blue-600">Home</Link> / 
          <Link href={`/resources/${segment.slug}`} className="hover:text-blue-600 mx-1">{segment.title}</Link> / 
          <span className="text-gray-900 font-bold ml-1">{group.title}</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.title}</h1>
        <p className="text-gray-500 mb-8">Select a subject to start learning.</p>

        {(!subjects || subjects.length === 0) ? (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500 mb-2">No subjects found for {group.title}.</p>
            {/* FIXED LINE BELOW: Used &rarr; instead of -> */}
            <p className="text-sm text-gray-400">
              (Go to Admin Panel &rarr; Click {group.title} &rarr; Add Subject)
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub) => (
              <Link 
                key={sub.id} 
                href={`/resources/${segment.slug}/${group.slug}/${sub.slug}`}
                className="block bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-700">{sub.title}</h3>
                  <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}