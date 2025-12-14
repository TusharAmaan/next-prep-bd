import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function Level3_Resources({ params }: { params: Promise<{ segment_slug: string, group_slug: string, subject_slug: string }> }) {
  const { segment_slug, group_slug, subject_slug } = await params;

  // --- DEBUGGING STRATEGY: RELAXED SEARCH ---
  
  // 1. Try to find the subject by SLUG only. 
  // We ignore the group_id for a moment to ensure we just find the content.
  const { data: subject, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subject_slug)
    .maybeSingle(); // "maybeSingle" prevents crashes if duplicates exist

  // If we can't find the subject, it's a true 404
  if (!subject) {
    console.error("Subject not found:", subject_slug, error);
    return notFound();
  }

  // 2. Fetch Resources for this subject
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", subject.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-8 uppercase tracking-wide">
          <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-blue-600">&larr; Back to List</Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{subject.title}</h1>
        <div className="w-20 h-1 bg-blue-600 mb-8"></div>

        {/* Resources List */}
        {(!resources || resources.length === 0) ? (
          <div className="p-8 bg-gray-50 rounded border border-gray-200 text-center">
            <p className="text-gray-500 italic mb-2">No materials found.</p>
            <p className="text-xs text-gray-400">
                (Debug Info: Showing Subject ID #{subject.id})
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resources.map((res) => (
              <a 
                key={res.id} 
                href={res.content_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-4 border rounded hover:bg-gray-50 transition hover:shadow-sm"
              >
                <div className={`mr-4 p-2 rounded ${res.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                   {res.type === 'video' ? 'VIDEO' : 'PDF'}
                </div>
                <div className="flex-1">
                    <span className="font-bold text-gray-800 block">{res.title}</span>
                </div>
                <span className="text-gray-400">&rarr;</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}