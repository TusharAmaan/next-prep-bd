import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

async function getData(subjectSlug: string) {
  const { data: subject } = await supabase.from("subjects").select("*").eq("slug", subjectSlug).single();
  if (!subject) return null;

  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", subject.id)
    .order("created_at", { ascending: false });

  return { subject, resources: resources || [] };
}

export default async function ResourcePage({ params }: { params: Promise<{ segment_slug: string, group_slug: string, subject_slug: string }> }) {
  const { segment_slug, group_slug, subject_slug } = await params;
  const data = await getData(subject_slug);

  if (!data) return notFound();

  const { subject, resources } = data;

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-sm text-gray-500 mb-8 uppercase">
          <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:underline">&larr; Back to {group_slug}</Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">{subject.title}</h1>
        <div className="w-20 h-1 bg-blue-600 mb-8"></div>

        {resources.length === 0 ? (
          <p className="text-gray-500 italic">No study materials uploaded yet.</p>
        ) : (
          <div className="grid gap-4">
            {resources.map((res) => (
              <a 
                key={res.id} 
                href={res.content_url} 
                target="_blank"
                className="flex items-center p-4 border rounded hover:bg-gray-50 transition"
              >
                <div className={`p-3 rounded mr-4 ${res.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {res.type === 'video' ? '▶' : '📄'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{res.title}</h3>
                  <p className="text-xs text-gray-500 uppercase">{res.type}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}