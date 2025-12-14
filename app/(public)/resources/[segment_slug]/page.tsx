import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// 1. Force dynamic rendering so it always fetches fresh data
export const dynamic = "force-dynamic";

// 2. Fetch the Segment ID and its Groups
async function getData(slug: string) {
  // First, find the Segment ID (e.g., HSC's ID)
  const { data: segment } = await supabase
    .from("segments")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!segment) return null;

  // Then, fetch the Groups for this Segment
  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .eq("segment_id", segment.id)
    .order("id");

  return { segment, groups: groups || [] };
}

export default async function SegmentPage({ params }: { params: { segment_slug: string } }) {
  const data = await getData(params.segment_slug);

  if (!data) return notFound(); // Show 404 if segment doesn't exist

  const { segment, groups } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-gray-800 uppercase">{segment.title}</span>
        </div>

        <h1 className="text-4xl font-bold mb-2 text-blue-900">{segment.title}</h1>
        <p className="text-gray-600 mb-12 text-lg">Select your group to find study materials.</p>

        {groups.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
            <p>No groups found for {segment.title}. (Admin: Add groups in the dashboard!)</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <Link 
                key={group.id} 
                href={`/resources/${segment.slug}/${group.slug}`}
                className="block bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg hover:border-blue-500 transition-all group"
              >
                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 mb-2">
                  {group.title}
                </h3>
                <p className="text-gray-500">
                  Browse subjects and resources for {group.title}.
                </p>
                <div className="mt-6 flex items-center text-blue-600 font-medium">
                  Enter Department 
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}