import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

async function getData(groupSlug: string) {
  const { data: group } = await supabase.from("groups").select("*, segments(*)").eq("slug", groupSlug).single();
  if (!group) return null;
  const { data: subjects } = await supabase.from("subjects").select("*").eq("group_id", group.id).order("id");
  return { group, subjects: subjects || [] };
}

export default async function SubjectListPage({ params }: { params: { segment_slug: string, group_slug: string } }) {
  const { segment_slug, group_slug } = await params;
  const data = await getData(group_slug);

  if (!data) return notFound();

  const { group, subjects } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:underline">Home</Link> / 
          <Link href={`/resources/${segment_slug}`} className="hover:underline mx-1 capitalize">{segment_slug}</Link> / 
          <span className="text-gray-800 font-medium ml-1">{group.title}</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">{group.title} Subjects</h1>

        {subjects.length === 0 ? (
          <p className="text-gray-500">No subjects added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subjects.map((sub) => (
              <div key={sub.id} className="bg-white p-5 rounded-lg border hover:border-blue-400 cursor-pointer shadow-sm">
                <h3 className="font-bold text-lg">{sub.title}</h3>
                <p className="text-xs text-gray-400 mt-2">Click to view content</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}