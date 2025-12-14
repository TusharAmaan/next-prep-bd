import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

async function getData(groupSlug: string) {
  // 1. Fetch Group (Simple query, no joins)
  const { data: group, error } = await supabase
    .from("groups")
    .select("*")
    .eq("slug", groupSlug)
    .single();

  if (error || !group) {
    console.log("Group fetch error:", error);
    return null;
  }

  // 2. Fetch Subjects linked to this Group
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("group_id", group.id)
    .order("id");

  return { group, subjects: subjects || [] };
}

export default async function SubjectListPage({ params }: { params: Promise<{ segment_slug: string, group_slug: string }> }) {
  const { segment_slug, group_slug } = await params;
  const data = await getData(group_slug);

  if (!data) return notFound();

  const { group, subjects } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 uppercase tracking-wide">
          <Link href="/" className="hover:text-blue-600">Home</Link> / 
          <Link href={`/resources/${segment_slug}`} className="hover:text-blue-600 mx-1">{segment_slug}</Link> / 
          <span className="text-gray-900 font-bold ml-1">{group.title}</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.title}</h1>
        <p className="text-gray-500 mb-8">Select a subject to view chapters and materials.</p>

        {subjects.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500">No subjects added to {group.title} yet.</p>
            <p className="text-sm text-gray-400 mt-2">Go to Admin Panel to add subjects.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub) => (
              <Link 
                key={sub.id} 
                href={`/resources/${segment_slug}/${group_slug}/${sub.slug}`}
                className="block bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-700">{sub.title}</h3>
                  <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}