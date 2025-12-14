import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function Level3_Resources({ params }: { params: Promise<{ segment_slug: string, group_slug: string, subject_slug: string }> }) {
  const { segment_slug, group_slug, subject_slug } = await params;

  // 1. Get the specific Group ID first (to avoid duplicate subject conflicts)
  const { data: group } = await supabase
    .from("groups")
    .select("id")
    .eq("slug", group_slug)
    .single();

  if (!group) return notFound();

  // 2. Fetch the Subject that matches the SLUG + GROUP ID
  // (This fixes the error where multiple subjects have the same name)
  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subject_slug)
    .eq("group_id", group.id) // <--- CRITICAL FIX
    .single();

  if (!subject) return notFound();

  // 3. Fetch Resources
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", subject.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-sm text-gray-500 mb-8 uppercase tracking-wide">
          <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-blue-600">&larr; Back to Subjects</Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{subject.title}</h1>
        <div className="w-20 h-1 bg-blue-600 mb-8"></div>

        {(!resources || resources.length === 0) ? (
          <div className="p-8 bg-gray-50 rounded border border-gray-200 text-center">
            <p className="text-gray-500 italic">No materials uploaded yet.</p>
            <p className="text-xs text-gray-400 mt-2">Admin: Upload content for {subject.title}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resources.map((res) => (
              <a key={res.id} href={res.content_url} target="_blank" className="flex items-center p-4 border rounded hover:bg-gray-50 transition hover:shadow-sm">
                <span className={`mr-4 px-2 py-1 text-xs font-bold uppercase rounded ${res.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                     {res.type}
                </span>
                <span className="font-bold text-gray-800">{res.title}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}