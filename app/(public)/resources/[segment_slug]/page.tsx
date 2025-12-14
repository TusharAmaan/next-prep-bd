import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

async function getData(slug: string) {
  const { data: segment } = await supabase.from("segments").select("*").eq("slug", slug).single();
  if (!segment) return null;
  const { data: groups } = await supabase.from("groups").select("*").eq("segment_id", segment.id).order("id");
  return { segment, groups: groups || [] };
}

export default async function SegmentPage({ params }: { params: Promise<{ segment_slug: string }> }) {
  const { segment_slug } = await params;
  const data = await getData(segment_slug);

  if (!data) return notFound();

  const { segment, groups } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-gray-500 hover:text-blue-600 mb-4 inline-block">&larr; Back to Home</Link>
        <h1 className="text-3xl font-bold text-blue-900 mb-2">{segment.title}</h1>
        <p className="text-gray-600 mb-8">Select your group to continue.</p>

        {groups.length === 0 ? (
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
            No groups found. (Go to Admin Panel -> Click {segment.title} -> Add Science/Commerce)
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Link 
                key={group.id} 
                href={`/resources/${segment.slug}/${group.slug}`}
                className="block bg-white p-6 rounded-lg shadow hover:shadow-md border border-gray-200 hover:border-blue-500 transition"
              >
                <h2 className="text-xl font-bold text-gray-800">{group.title}</h2>
                <p className="text-blue-600 mt-2 text-sm">View Subjects &rarr;</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}