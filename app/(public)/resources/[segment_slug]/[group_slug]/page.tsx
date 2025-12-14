import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

async function getData(segmentSlug: string, groupSlug: string) {
  // 1. Get Group ID
  const { data: group } = await supabase
    .from("groups")
    .select("*, segments(*)") // Fetch parent segment info too
    .eq("slug", groupSlug)
    .single();

  if (!group) return null;

  // 2. Get Subjects for this Group
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("group_id", group.id)
    .order("id");

  return { group, subjects: subjects || [] };
}

export default async function SubjectListPage({ params }: { params: { segment_slug: string, group_slug: string } }) {
  const data = await getData(params.segment_slug, params.group_slug);

  if (!data) return notFound();

  const { group, subjects } = data;
  const segmentTitle = group.segments?.title || params.segment_slug;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/resources/${params.segment_slug}`} className="hover:text-blue-600 capitalize">{segmentTitle}</Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-gray-800">{group.title}</span>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">
          {group.title} <span className="text-gray-400 font-light text-2xl">Subjects</span>
        </h1>

        {subjects.length === 0 ? (
          <p className="text-gray-500 italic">No subjects added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((sub) => (
              <div key={sub.id} className="bg-white p-6 rounded-lg shadow-sm border hover:border-blue-400 transition cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {sub.title.charAt(0)}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-1">{sub.title}</h3>
                <p className="text-xs text-gray-400 mb-4">View chapters & resources</p>
                <button className="w-full py-2 bg-gray-50 text-blue-600 text-sm font-semibold rounded border border-gray-200 hover:bg-blue-50">
                  Open Subject
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}